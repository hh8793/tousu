<template>
  <div class="home-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🏙️</span>
          <span class="logo-text">城市投诉管理系统</span>
        </div>
        <nav class="nav">
          <router-link to="/submit" class="nav-link">提交投诉</router-link>
          <router-link to="/my-complaints" class="nav-link">我的投诉</router-link>
          <template v-if="authStore.isLoggedIn">
            <router-link v-if="authStore.isAdmin || authStore.isOperator" to="/admin/complaints" class="nav-link">管理后台</router-link>
            <button @click="handleLogout" class="logout-btn">退出登录</button>
          </template>
          <router-link v-else to="/login" class="nav-link">登录</router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">城市投诉自动回复系统</h1>
          <p class="hero-description">智能分析投诉内容，快速响应市民需求，提升城市管理效率</p>
          <div class="hero-actions">
            <router-link to="/submit" class="primary-btn">立即提交投诉</router-link>
            <router-link to="/login" class="secondary-btn">查看投诉状态</router-link>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value">10+</div>
            <div class="stat-label">投诉类型</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">85%</div>
            <div class="stat-label">分类准确率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">3秒</div>
            <div class="stat-label">响应时间</div>
          </div>
        </div>
      </section>

      <section class="features-section">
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>便捷投诉提交</h3>
            <p>支持文本、图片等多种投诉方式，随时随地提交问题</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>智能分类分析</h3>
            <p>基于OpenClaw的语义分析，精准识别投诉类型和用户意图</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>自动回复响应</h3>
            <p>根据投诉类型自动生成回复内容，快速响应市民需求</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>数据统计分析</h3>
            <p>可视化报表展示投诉分布、处理效率等关键指标</p>
          </div>
        </div>
      </section>

      <section class="categories-section">
        <h2 class="section-title">投诉类型</h2>
        <div class="categories-grid">
          <div v-for="cat in complaintCategories" :key="cat.value" class="category-card">
            <div class="category-icon">{{ cat.icon }}</div>
            <div class="category-name">{{ cat.label }}</div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>© 2026 城市投诉自动回复系统 - 为城市管理提供智能解决方案</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ComplaintCategory } from '@/types';

const authStore = useAuthStore();

const complaintCategories = [
  { value: ComplaintCategory.NOISE_POLLUTION, label: '噪音污染', icon: '🔊' },
  { value: ComplaintCategory.ENVIRONMENTAL_POLLUTION, label: '环境污染', icon: '🌿' },
  { value: ComplaintCategory.TRAFFIC_CONGESTION, label: '交通拥堵', icon: '🚦' },
  { value: ComplaintCategory.PUBLIC_FACILITY_DAMAGE, label: '设施损坏', icon: '🛠️' },
  { value: ComplaintCategory.GARBAGE_DISPOSAL, label: '垃圾处理', icon: '🗑️' },
  { value: ComplaintCategory.CONSTRUCTION_NOISE, label: '施工噪音', icon: '🏗️' },
  { value: ComplaintCategory.PARKING_PROBLEM, label: '停车问题', icon: '🚗' },
  { value: ComplaintCategory.NEIGHBOR_DISPUTE, label: '邻里纠纷', icon: '🏠' },
  { value: ComplaintCategory.MARKET_ORDER, label: '市场秩序', icon: '🛒' },
  { value: ComplaintCategory.STREET_VENDING, label: '占道经营', icon: '🚶' }
];

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
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
  color: white;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
}

.hero-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.primary-btn {
  background: white;
  color: #667eea;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  border: 1px solid white;
  transition: background 0.3s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  border-radius: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
}

.features-section,
.categories-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  font-size: 0.9rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.category-card {
  background: #f8f9fa;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  text-align: center;
}

.category-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.category-name {
  color: #333;
  font-size: 0.85rem;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>