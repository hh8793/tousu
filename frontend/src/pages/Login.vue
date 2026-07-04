<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">🏙️</span>
          <span class="logo-text">城市投诉管理系统</span>
        </div>
        <h2>用户登录</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </form>

      <p class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写用户名和密码');
    return;
  }

  loading.value = true;

  try {
    await authStore.login(form);
    ElMessage.success('登录成功');
    
    if (authStore.isAdmin || authStore.isOperator) {
      router.push('/admin/complaints');
    } else {
      router.push('/');
    }
  } catch (error) {
    ElMessage.error('用户名或密码错误');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
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

.login-header h2 {
  color: #333;
}

.login-form {
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 1rem;
  }
}
</style>