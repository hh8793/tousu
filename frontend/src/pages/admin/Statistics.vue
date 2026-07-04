<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>统计分析</h2>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalComplaints }}</div>
          <div class="stat-label">总投诉数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.resolvedComplaints }}</div>
          <div class="stat-label">已解决</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.pendingComplaints }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🤖</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.autoReplyRate }}%</div>
          <div class="stat-label">自动回复率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.averageResponseTime.toFixed(1) }}分钟</div>
          <div class="stat-label">平均响应时间</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.satisfactionRate }}%</div>
          <div class="stat-label">满意度</div>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="chart-card">
        <h3>投诉类型分布</h3>
        <v-chart class="chart" :option="categoryChartOption" autoresize />
      </div>
      <div class="chart-card">
        <h3>每日投诉趋势</h3>
        <v-chart class="chart" :option="dailyTrendChartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { statisticsApi } from '@/services/api';
import { Statistics, ComplaintCategory } from '@/types';
import { ElMessage } from 'element-plus';

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

const statistics = ref<Statistics>({
  totalComplaints: 0,
  resolvedComplaints: 0,
  pendingComplaints: 0,
  autoReplyRate: 0,
  averageResponseTime: 0,
  categoryDistribution: [],
  dailyTrend: [],
  satisfactionRate: 0
});

let refreshInterval: number | null = null;

const categoryLabels: Record<ComplaintCategory, string> = {
  [ComplaintCategory.NOISE_POLLUTION]: '噪音污染',
  [ComplaintCategory.ENVIRONMENTAL_POLLUTION]: '环境污染',
  [ComplaintCategory.TRAFFIC_CONGESTION]: '交通拥堵',
  [ComplaintCategory.PUBLIC_FACILITY_DAMAGE]: '设施损坏',
  [ComplaintCategory.GARBAGE_DISPOSAL]: '垃圾处理',
  [ComplaintCategory.CONSTRUCTION_NOISE]: '施工噪音',
  [ComplaintCategory.PARKING_PROBLEM]: '停车问题',
  [ComplaintCategory.NEIGHBOR_DISPUTE]: '邻里纠纷',
  [ComplaintCategory.MARKET_ORDER]: '市场秩序',
  [ComplaintCategory.STREET_VENDING]: '占道经营',
  [ComplaintCategory.OTHER]: '其他'
};

const categoryChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: statistics.value.categoryDistribution.map(item => ({
        value: item.count,
        name: categoryLabels[item.category] || item.category
      }))
    }
  ]
}));

const dailyTrendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: statistics.value.dailyTrend.map(item => item.date),
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: statistics.value.dailyTrend.map(item => item.count),
      areaStyle: {
        opacity: 0.3
      },
      itemStyle: {
        color: '#667eea'
      }
    }
  ]
}));

const loadStatistics = async () => {
  try {
    const result = await statisticsApi.get();
    statistics.value = result;
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  }
};

onMounted(() => {
  loadStatistics();
  refreshInterval = window.setInterval(loadStatistics, 60000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.statistics-container {
  padding: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  color: #333;
  margin-bottom: 1rem;
}

.chart {
  height: 300px;
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>