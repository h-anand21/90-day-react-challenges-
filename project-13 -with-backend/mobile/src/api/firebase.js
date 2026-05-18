import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Curated Firebase credentials extracted securely from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCJEeWVzIqUUtxaGMCmYLndCKxnjIYAtno",
  authDomain: "tripsync-e8f1e.firebaseapp.com",
  projectId: "tripsync-e8f1e",
  storageBucket: "tripsync-e8f1e.firebasestorage.app",
  messagingSenderId: "830478854843",
  appId: "1:830478854843:android:1ee85d30882ff29bf0579e"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native/Expo Go compatibility
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
