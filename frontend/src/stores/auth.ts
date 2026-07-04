import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, LoginRequest, UserRole } from '@/types';
import { authApi } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<Omit<User, 'password'> | null>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const isOperator = computed(() => user.value?.role === UserRole.OPERATOR);
  const isCitizen = computed(() => user.value?.role === UserRole.CITIZEN);

  async function login(loginData: LoginRequest) {
    const response = await authApi.login(loginData);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  async function register(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    await authApi.register(userData);
  }

  async function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function initFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isOperator,
    isCitizen,
    login,
    register,
    logout,
    initFromStorage
  };
});