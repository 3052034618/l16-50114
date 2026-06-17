import { create } from 'zustand';
import type { AnyUser, Student, Parent } from '../types';
import { allUsers } from '../data/mockUsers';
import { storage } from '../utils/storage';

interface AuthState {
  currentUser: AnyUser | null;
  login: (username: string, password: string, role: string) => boolean;
  logout: () => void;
  updateStudentBalance: (studentId: string, newBalance: number) => void;
  getStudentById: (studentId: string) => Student | undefined;
  getBoundStudents: (parentId: string) => Student[];
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,

  init: () => {
    const savedUser = storage.get<AnyUser | null>('currentUser', null);
    if (savedUser) {
      const freshUser = allUsers.find((u) => u.id === savedUser.id);
      if (freshUser) {
        set({ currentUser: freshUser });
      }
    }
  },

  login: (username: string, password: string, role: string) => {
    const user = allUsers.find(
      (u) => u.username === username && u.password === password && u.role === role
    );
    if (user) {
      set({ currentUser: user });
      storage.set('currentUser', user);
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null });
    storage.remove('currentUser');
  },

  updateStudentBalance: (studentId: string, newBalance: number) => {
    const { currentUser } = get();
    if (currentUser?.role === 'student' && currentUser.id === studentId) {
      const updated = { ...currentUser, balance: newBalance };
      set({ currentUser: updated });
      storage.set('currentUser', updated);
    }
  },

  getStudentById: (studentId: string) => {
    return allUsers.find((u) => u.id === studentId && u.role === 'student') as Student | undefined;
  },

  getBoundStudents: (parentId: string) => {
    const parent = allUsers.find((u) => u.id === parentId && u.role === 'parent') as Parent | undefined;
    if (!parent) return [];
    return allUsers.filter((u) => parent.boundStudents.includes(u.id) && u.role === 'student') as Student[];
  },
}));
