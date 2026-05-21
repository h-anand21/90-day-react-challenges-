import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Symmetrical Dynamic API Selector
const getBaseURL = () => {
  // 1. Check if running in local development mode
  if (__DEV__) {
    // Expo Go provides the host IP address in hostUri (e.g., "192.168.1.15:8081")
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
    if (hostUri) {
      const localIP = hostUri.split(':')[0];
      const localUrl = `http://${localIP}:5000/api`;
      console.log(`[TripSync API] 🖥️ Local Dev Mode Active: Connecting to local IP: ${localUrl}`);
      return localUrl;
    }
  }

  // 2. Fallback to production hosted URL
  const productionUrl = Constants.expoConfig?.extra?.apiUrl || 'https://tripsync-backend-9mle.onrender.com/api';
  console.log(`[TripSync API] 🌍 Production Mode Active: Connecting to hosted server: ${productionUrl}`);
  return productionUrl;
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if it exists in storage
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getImageUri = (imageUrl) => {
  if (!imageUrl) return '';
  if (
    imageUrl.startsWith('https://pixabay.com') ||
    imageUrl.startsWith('https://cdn.pixabay.com') ||
    imageUrl.startsWith('https://upload.wikimedia.org') ||
    imageUrl.startsWith('https://images.unsplash.com')
  ) {
    const baseUrl = getBaseURL();
    return `${baseUrl}/trips/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }
  return imageUrl;
};

export default client;
