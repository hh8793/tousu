<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h1>404</h1>
      <p>页面未找到</p>
      <router-link to="/" class="back-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.not-found-content {
  text-align: center;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.not-found-content h1 {
  font-size: 3rem;
  color: #999;
  margin-bottom: 1rem;
}

.not-found-content p {
  color: #666;
  margin-bottom: 1.5rem;
}

.back-link {
  background: #667eea;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
}

.back-link:hover {
  background: #5a6fd6;
}
</style>