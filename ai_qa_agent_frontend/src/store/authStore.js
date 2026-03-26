import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (username, password) => {
    // using OAuth2PasswordRequestForm standard (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const token = response.data.access_token;
    localStorage.setItem('token', token);
    
    // Fetch profile
    set({ token, isAuthenticated: true });
    await useAuthStore.getState().fetchProfile();
    return true;
  },
  register: async (username, email, password) => {
    await api.post('/auth/register', { username, email, password });
    return true;
  },
  fetchProfile: async () => {
    try {
      const resp = await api.get('/auth/me');
      set({ user: resp.data });
    } catch (e) {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
