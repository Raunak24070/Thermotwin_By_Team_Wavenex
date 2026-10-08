// ThermoTwin Authentication & User Session Store
// Integrates with MongoDB & JWT Backend API with token persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole } from '../types/db';
import { authApi } from '../api/apiClient';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  institution?: string;
  studentIdNumber?: string;
  teacherIdNumber?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-std-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    department: 'Mechanical Engineering Department',
    studentIdNumber: 'ME-2026-4401',
    classId: 'class-thermo-101',
    bio: 'Engineering undergraduate conducting 1D heat conduction laboratory experiment.',
    joinedDate: 'September 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-tch-201',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@university.edu',
    role: 'TEACHER',
    institution: 'Institute of Thermal Technology',
    department: 'Department of Thermal Sciences',
    teacherIdNumber: 'FAC-7701',
    bio: 'Lead Professor, Advanced Heat Conduction & Transport Phenomena',
    joinedDate: 'August 2022',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-tch-202',
    name: 'Dr. Elena Rostova',
    email: 'e.rostova@university.edu',
    role: 'TEACHER',
    institution: 'Institute of Thermal Technology',
    department: 'Applied Thermodynamics & Energy',
    teacherIdNumber: 'FAC-8820',
    bio: 'Associate Professor, Thermal Systems & Digital Twin Computing',
    joinedDate: 'January 2024',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  }
];

interface AuthState {
  currentUser: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registeredUsers: UserProfile[];

  // Actions
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  checkAuthSession: () => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: typeof window !== 'undefined' ? localStorage.getItem('thermotwin_token') : null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registeredUsers: DEFAULT_USERS,

      loginUser: async (email: string, password = 'password123') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          if (response && response.token && response.user) {
            localStorage.setItem('thermotwin_token', response.token);
            
            const profile: UserProfile = {
              id: response.user.id || response.user._id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role as UserRole,
              institution: response.user.institution || 'Institute of Thermal Technology',
              department: response.user.department || 'Mechanical Engineering Department',
              studentIdNumber: response.user.studentIdNumber || 'ME-2026-4401',
              teacherIdNumber: response.user.teacherIdNumber,
              avatarUrl: response.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              joinedDate: new Date(response.user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };

            set({
              currentUser: profile,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, message: response.message || 'Login failed.' };
        } catch (err: any) {
          const msg = err.response?.data?.message || err.message || 'Invalid credentials or server unavailable.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      registerUser: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({
            name: payload.name,
            email: payload.email,
            password: payload.password || 'password123',
            role: payload.role || 'STUDENT',
            institution: payload.institution,
            department: payload.department,
            studentIdNumber: payload.studentIdNumber,
            teacherIdNumber: payload.teacherIdNumber
          });

          if (response && response.token && response.user) {
            localStorage.setItem('thermotwin_token', response.token);

            const profile: UserProfile = {
              id: response.user.id || response.user._id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role as UserRole,
              institution: response.user.institution || 'Institute of Thermal Technology',
              department: response.user.department || 'Mechanical Engineering Department',
              studentIdNumber: response.user.studentIdNumber,
              teacherIdNumber: response.user.teacherIdNumber,
              avatarUrl: response.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              joinedDate: new Date(response.user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };

            set({
              currentUser: profile,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, message: response.message || 'Registration failed.' };
        } catch (err: any) {
          const msg = err.response?.data?.message || err.message || 'Registration failed.';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      checkAuthSession: async () => {
        const token = localStorage.getItem('thermotwin_token');
        if (!token) {
          set({ currentUser: null, token: null, isAuthenticated: false });
          return false;
        }

        try {
          const res = await authApi.getMe();
          if (res && res.user) {
            const profile: UserProfile = {
              id: res.user.id || res.user._id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role as UserRole,
              institution: res.user.institution || 'Institute of Thermal Technology',
              department: res.user.department || 'Mechanical Engineering Department',
              studentIdNumber: res.user.studentIdNumber || 'ME-2026-4401',
              teacherIdNumber: res.user.teacherIdNumber,
              avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              joinedDate: new Date(res.user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };

            set({
              currentUser: profile,
              token,
              isAuthenticated: true
            });
            return true;
          }
        } catch (err) {
          // Token invalid or expired
          localStorage.removeItem('thermotwin_token');
          set({ currentUser: null, token: null, isAuthenticated: false });
          return false;
        }
        return false;
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const { currentUser } = get();
        if (!currentUser) return;
        set({ currentUser: { ...currentUser, ...updates } });
      },

      logout: () => {
        authApi.logout().catch(() => {});
        localStorage.removeItem('thermotwin_token');
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'thermotwin-auth-v5',
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
