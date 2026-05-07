import API from './api';

import { tokenStore } from './tokenStore';

export const authService = {
  // REGISTER
  register: async (data) => {
    return API.post('/users/register', data);
  },

  // LOGIN
  login: async (data) => {
    const res = await API.post('/users/login', data);

    const user = res.data.data.user;

    const accessToken = res.data.data.accessToken;

    const refreshToken = res.data.data.refreshToken;

    // save tokens
    tokenStore.setTokens(accessToken, refreshToken);

    // save user
    tokenStore.setUser(user);

    return user;
  },

  // CURRENT USER
  currentUser: async () => {
    const res = await API.get('/users/current-user');

    return res.data.data;
  },

  // LOGOUT
  logout: async () => {
    await API.post('/users/logout');

    tokenStore.clear();
  },
};
