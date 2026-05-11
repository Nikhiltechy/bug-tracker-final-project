import { create } from 'zustand';
import * as api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  // 🔍 Run once on app start to restore session
  initialize: () => {
    const stored = api.getStoredUser();
    set({ user: stored, loading: false });
  },

  // 🔑 Login
  login: async (email, password) => {
    const res = await api.login(email, password);
    set({ user: res.user });
    return res;
  },

  // 📝 Signup
  signup: async (name, email, password) => {
    const res = await api.signup(name, email, password);
    set({ user: res.user });
    return res;
  },

  // 🚪 Logout
  logout: () => {
    api.logout();
    set({ user: null });
  }
}));