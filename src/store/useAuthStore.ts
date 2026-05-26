import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  [key: string]: any;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  role: 'driver' | 'merchant' | null;
  user: User | null;
  isLoading: boolean;

  setRole: (role: 'driver' | 'merchant' | null) => Promise<void>;
  loginSuccess: (token: string, user: User, role: 'driver' | 'merchant') => Promise<void>;
  registerSuccess: (token: string, user: User, role: 'driver' | 'merchant') => Promise<void>;
  updateUserStatus: (status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  token: null,
  role: null,
  user: null,
  isLoading: true,

  setRole: async (role) => {
    if (role === null) {
      await AsyncStorage.removeItem('partner_role');
    } else {
      await AsyncStorage.setItem('partner_role', role);
    }
    set({ role });
  },

  loginSuccess: async (token, user, role) => {
    const formattedUser: User = {
      ...user,
      status: user.status || 'approved',
    };
    await AsyncStorage.setItem('partner_token', token);
    await AsyncStorage.setItem('partner_role', role);
    await AsyncStorage.setItem('partner_user', JSON.stringify(formattedUser));
    
    set({
      isLoggedIn: true,
      token,
      role,
      user: formattedUser,
    });
  },

  registerSuccess: async (token, user, role) => {
    const formattedUser: User = {
      ...user,
      status: 'pending',
    };
    await AsyncStorage.setItem('partner_token', token);
    await AsyncStorage.setItem('partner_role', role);
    await AsyncStorage.setItem('partner_user', JSON.stringify(formattedUser));

    set({
      isLoggedIn: true,
      token,
      role,
      user: formattedUser,
    });
  },

  updateUserStatus: async (status) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser: User = { ...state.user, status };
      AsyncStorage.setItem('partner_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem('partner_token');
    await AsyncStorage.removeItem('partner_role');
    await AsyncStorage.removeItem('partner_user');
    set({
      isLoggedIn: false,
      token: null,
      role: null,
      user: null,
    });
  },

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('partner_token');
      const role = await AsyncStorage.getItem('partner_role') as 'driver' | 'merchant' | null;
      const userStr = await AsyncStorage.getItem('partner_user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && role) {
        set({
          isLoggedIn: true,
          token,
          role,
          user,
          isLoading: false,
        });
      } else {
        set({
          role, // Preserve selected role even if not logged in
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
