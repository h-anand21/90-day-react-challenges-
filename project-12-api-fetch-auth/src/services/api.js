import axios from 'axios';

import { tokenStore } from './tokenStore';

const API = axios.create({
  baseURL: 'https://api.freeapi.app/api/v1',
});

// interceptor
API.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
