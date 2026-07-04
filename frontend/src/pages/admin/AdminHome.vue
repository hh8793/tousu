<template>
  <div class="admin-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🏙️</span>
          <span class="logo-text">管理后台</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/complaints" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-text">投诉管理</span>
        </router-link>
        <router-link to="/admin/templates" class="nav-item">
          <span class="nav-icon">📝</span>
          <span class="nav-text">回复模板</span>
        </router-link>
        <router-link to="/admin/statistics" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">统计分析</span>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/users" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-text">用户管理</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <span :class="['role-tag', authStore.user?.role]">{{ getRoleLabel(authStore.user?.role) }}</span>
        </div>
      </header>

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { UserRole } from '@/types';

const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
};

const getRoleLabel = (role?: UserRole): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: '管理员',
    [UserRole.OPERATOR]: '操作员',
    [UserRole.CITIZEN]: '市民'
  };
  return labels[role || UserRole.CITIZEN];
};
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.nav-item:hover {
  background: #34495e;
}

.nav-item.router-link-active {
  background: #3498db;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-size: 0.95rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #34495e;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: transparent;
  color: white;
  border: none;
  padding: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.role-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.role-tag.admin {
  background: #e8f5e9;
  color: #2e7d32;
}

.role-tag.operator {
  background: #e3f2fd;
  color: #1565c0;
}

.role-tag.citizen {
  background: #fff3e0;
  color: #e65100;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .nav-text {
    display: none;
  }

  .nav-item {
    justify-content: center;
  }
}
</style>