const USER_KEY = 'user';

export const tokenStore = {
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  },

  clear: () => {
    localStorage.removeItem(USER_KEY);
  },
};
