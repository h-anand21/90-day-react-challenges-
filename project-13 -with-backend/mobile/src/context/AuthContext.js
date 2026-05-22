import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { auth } from '../api/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredToken();
  }, []);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
    }
  }, [user]);

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      try {
        const projectId = 'your-project-id'; // Can be retrieved from Constants.expoConfig.extra.eas.projectId if set
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Push Token:", token);
        await client.post('/auth/push-token', { pushToken: token });
      } catch (e) {
        console.log("Error getting push token", e);
      }
    }
  };

  const loadStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load token', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // 1. Authenticate using Firebase standard email-password sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Fetch the secure Firebase ID token from the authenticated session
      const firebaseToken = await userCredential.user.getIdToken();

      // 3. Synchronize credentials with our Node.js Express backend
      const res = await client.post('/auth/firebase', { token: firebaseToken });
      const { user: backendUser, token: backendToken } = res.data;
      
      // 4. Cache JWT session token and MongoDB user profile locally
      await AsyncStorage.setItem('token', backendToken);
      await AsyncStorage.setItem('user', JSON.stringify(backendUser));
      
      setUser(backendUser);
      return { success: true };
    } catch (error) {
      console.error('[Firebase Login Error]', error);
      
      // Extract clean error message
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // 1. Create native login credentials on Firebase Auth Server
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Update the user display profile name in Firebase
      await updateProfile(userCredential.user, { displayName: name });

      // 3. Fetch the secure Firebase ID token from the registered user
      const firebaseToken = await userCredential.user.getIdToken();

      // 4. Register/Save user profile into our backend MongoDB database
      const res = await client.post('/auth/firebase', { token: firebaseToken });
      const { user: backendUser, token: backendToken } = res.data;

      // 5. Cache JWT session token and MongoDB user profile locally
      await AsyncStorage.setItem('token', backendToken);
      await AsyncStorage.setItem('user', JSON.stringify(backendUser));
      
      setUser(backendUser);
      return { success: true };
    } catch (error) {
      console.error('[Firebase Register Error]', error);
      
      let message = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email is already registered';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (firebaseIdToken) => {
    try {
      // Synchronize verified Google token with our Node.js Express backend
      const res = await client.post('/auth/firebase', { token: firebaseIdToken });
      const { user: backendUser, token: backendToken } = res.data;

      await AsyncStorage.setItem('token', backendToken);
      await AsyncStorage.setItem('user', JSON.stringify(backendUser));
      
      setUser(backendUser);
      return { success: true };
    } catch (error) {
      console.error('[Firebase Google Sign-In Error]', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google Authentication failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('[Firebase SignOut warning]', error);
    }
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
