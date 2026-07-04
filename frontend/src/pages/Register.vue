<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <span class="logo-icon">🏙️</span>
          <span class="logo-text">城市投诉管理系统</span>
        </div>
        <h2>用户注册</h2>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-btn" :loading="loading" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
      </form>

      <p class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserRole } from '@/types';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: ''
});

const loading = ref(false);

const handleRegister = async () => {
  if (!form.username || !form.password || !form.email) {
    ElMessage.warning('请填写必填项');
    return;
  }

  loading.value = true;

  try {
    await authStore.register({
      ...form,
      role: UserRole.CITIZEN
    });
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (error) {
    ElMessage.error((error as Error).message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.register-header h2 {
  color: #333;
}

.register-form {
  margin-bottom: 1rem;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    width: 90%;
    margin: 0 1rem;
  }
}
</style>