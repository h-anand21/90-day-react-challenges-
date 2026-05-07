const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

export const tokenStore = {
  // save tokens
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);

    localStorage.setItem(REFRESH_KEY, refresh);
  },

  // get access token
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_KEY);
  },

  // save user
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // get user
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  },

  // clear everything
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);

    localStorage.removeItem(REFRESH_KEY);

    localStorage.removeItem(USER_KEY);
  },
};
