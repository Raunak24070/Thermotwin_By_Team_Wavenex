// ThermoTwin Authentication & User Profile Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole } from '../types/db';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  institution: string;
  studentIdNumber?: string;
  teacherIdNumber?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

interface AuthState {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: (UserProfile & { password?: string })[];
  
  // Actions
  loginUser: (email: string, password?: string) => { success: boolean; message?: string };
  registerUser: (payload: RegisterPayload) => { success: boolean; message?: string };
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const INITIAL_ACCOUNTS: (UserProfile & { password?: string })[] = [
  {
    id: 'user-std-101',
    name: 'Alex Rivera',
    email: 'alex@student.edu',
    password: 'password123',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    department: 'Mechanical Engineering (3rd Year)',
    studentIdNumber: '2026-ME-042',
    classId: 'class-thermo-101',
    joinedDate: 'September 2026',
    bio: 'Passionate engineering student specializing in heat transfer, thermodynamics, and physical material simulations.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-tch-505',
    name: 'Prof. David Vance',
    email: 'vance@teacher.edu',
    password: 'password123',
    role: 'TEACHER',
    institution: 'Institute of Thermal Technology',
    department: 'Department of Thermal Sciences',
    teacherIdNumber: 'FAC-THERMO-99',
    joinedDate: 'August 2026',
    bio: 'Professor of Heat & Mass Transfer. Leading digital laboratory innovation and 3D simulation platforms.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      registeredUsers: INITIAL_ACCOUNTS,

      loginUser: (email: string, password?: string) => {
        const { registeredUsers } = get();
        const found = registeredUsers.find(
          (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
        );

        if (!found) {
          return { success: false, message: 'Account not found. Please check your email or register a new profile.' };
        }

        if (password && found.password && found.password !== password) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }

        const userProfile: UserProfile = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          institution: found.institution,
          department: found.department || (found.role === 'TEACHER' ? 'Department of Thermal Sciences' : 'Mechanical Engineering'),
          studentIdNumber: found.studentIdNumber,
          teacherIdNumber: found.teacherIdNumber,
          classId: found.classId,
          bio: found.bio || (found.role === 'TEACHER' ? 'Instructor & Virtual Laboratory Administrator' : 'Engineering Student'),
          joinedDate: found.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatarUrl: found.avatarUrl || (found.role === 'TEACHER' 
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' 
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')
        };

        set({ currentUser: userProfile, isAuthenticated: true });
        return { success: true };
      },

      registerUser: (payload: RegisterPayload) => {
        const { registeredUsers } = get();
        const exists = registeredUsers.some(
          (u) => u.email.trim().toLowerCase() === payload.email.trim().toLowerCase()
        );

        if (exists) {
          return { success: false, message: 'An account with this email address already exists.' };
        }

        const newUser = {
          id: `user-${payload.role.toLowerCase()}-${Date.now()}`,
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password || 'password123',
          role: payload.role,
          institution: payload.institution.trim() || 'Institute of Thermal Technology',
          department: payload.department?.trim() || (payload.role === 'TEACHER' ? 'Department of Thermal Sciences' : 'Mechanical Engineering Department'),
          studentIdNumber: payload.studentIdNumber?.trim(),
          teacherIdNumber: payload.teacherIdNumber?.trim(),
          classId: payload.role === 'STUDENT' ? 'class-thermo-101' : undefined,
          bio: payload.bio?.trim() || (payload.role === 'TEACHER' ? 'Instructor & Virtual Laboratory Administrator' : 'Engineering Student'),
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatarUrl: payload.avatarUrl || (payload.role === 'TEACHER' 
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' 
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')
        };

        const updatedUsers = [...registeredUsers, newUser];
        
        const userProfile: UserProfile = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          institution: newUser.institution,
          department: newUser.department,
          studentIdNumber: newUser.studentIdNumber,
          teacherIdNumber: newUser.teacherIdNumber,
          classId: newUser.classId,
          bio: newUser.bio,
          joinedDate: newUser.joinedDate,
          avatarUrl: newUser.avatarUrl
        };

        set({
          registeredUsers: updatedUsers,
          currentUser: userProfile,
          isAuthenticated: true
        });

        return { success: true };
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const { currentUser, registeredUsers } = get();
        if (!currentUser) return;

        const updatedProfile = { ...currentUser, ...updates };

        // Update in registered users array as well
        const updatedRegistered = registeredUsers.map((u) =>
          u.id === currentUser.id ? { ...u, ...updates } : u
        );

        set({
          currentUser: updatedProfile,
          registeredUsers: updatedRegistered
        });
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      }
    }),
    {
      name: 'thermotwin-auth-v3'
    }
  )
);
