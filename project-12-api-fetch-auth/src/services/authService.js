import API from './api';
import { tokenStore } from './tokenStore';

export const authService = {
  register: async (data) => {
    return API.post('/users/register', data);
  },

  login: async (data) => {
    const res = await API.post('/users/login', data);

    tokenStore.setUser(res.data.data.user);

    return res;
  },

  logout: async () => {
    // clear frontend auth
    tokenStore.clear();

    // optional backend logout
    try {
      await API.post('/users/logout');
    } catch (error) {
      console.log('Backend logout failed');
    }
  },


  currentUser: () => {
    return tokenStore.getUser();
  },
};
