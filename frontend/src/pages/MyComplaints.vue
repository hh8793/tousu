<template>
  <div class="my-complaints-container">
    <header class="page-header">
      <h1>我的投诉</h1>
      <router-link to="/submit" class="submit-link">提交新投诉</router-link>
    </header>

    <div class="complaints-content">
      <div class="filters">
        <el-select v-model="filters.status" placeholder="状态筛选" class="filter-item">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="分析中" value="analyzing" />
          <el-option label="已自动回复" value="auto_replied" />
          <el-option label="处理中" value="manual_processing" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已关闭" value="closed" />
        </el-select>

        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <div class="complaints-list">
        <div v-for="complaint in complaints" :key="complaint._id" class="complaint-card">
          <div class="complaint-header">
            <h3 class="complaint-title">{{ complaint.title }}</h3>
            <span :class="['status-tag', complaint.status]">{{ getStatusLabel(complaint.status) }}</span>
          </div>

          <p class="complaint-content">{{ complaint.content }}</p>

          <div class="complaint-meta">
            <span class="meta-item">📅 {{ formatDate(complaint.createdAt) }}</span>
            <span class="meta-item">🏷️ {{ getCategoryLabel(complaint.category) }}</span>
            <span v-if="complaint.priority" class="meta-item">
              ⚡ {{ getPriorityLabel(complaint.priority) }}
            </span>
          </div>

          <div v-if="complaint.replies && complaint.replies.length > 0" class="replies-section">
            <h4>回复记录</h4>
            <div v-for="reply in complaint.replies" :key="reply._id" class="reply-item">
              <span :class="['reply-type', reply.type]">{{ reply.type === 'auto' ? '自动回复' : '人工回复' }}</span>
              <p>{{ reply.content }}</p>
              <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
            </div>
          </div>

          <div v-if="complaint.status === 'auto_replied' && !complaint.satisfaction" class="satisfaction-section">
            <p>请对回复进行评价</p>
            <div class="rating-stars">
              <span
                v-for="star in 5"
                :key="star"
                :class="['star', { active: star <= rating }]"
                @click="rating = star"
              >⭐</span>
            </div>
            <el-button type="primary" @click="submitSatisfaction(complaint._id)">提交评价</el-button>
          </div>

          <div v-if="complaint.satisfaction" class="satisfaction-display">
            <span>您的评价</span>
            <span v-for="star in 5" :key="star" :class="['star', { active: star <= complaint.satisfaction }]">⭐</span>
          </div>
        </div>

        <div v-if="complaints.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无投诉记录</p>
          <router-link to="/submit" class="empty-link">提交投诉</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { complaintApi } from '@/services/api';
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { ElMessage } from 'element-plus';

const complaints = ref<Complaint[]>([]);
const total = ref(0);
const rating = ref(0);

const filters = reactive({
  status: ''
});

const pagination = reactive({
  page: 1,
  limit: 10
});

const loadComplaints = async () => {
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    };

    if (filters.status) {
      params.status = filters.status;
    }

    const result = await complaintApi.list(params);
    complaints.value = result.complaints;
    total.value = result.total;
  } catch (error) {
    ElMessage.error('加载投诉列表失败');
  }
};

const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  loadComplaints();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  loadComplaints();
};

const submitSatisfaction = async (id: string) => {
  if (!rating.value) {
    ElMessage.warning('请先选择评价星级');
    return;
  }

  try {
    await complaintApi.submitSatisfaction(id, { rating: rating.value });
    ElMessage.success('评价提交成功');
    rating.value = 0;
    loadComplaints();
  } catch (error) {
    ElMessage.error('提交评价失败');
  }
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    [ComplaintStatus.PENDING]: '待处理',
    [ComplaintStatus.ANALYZING]: '分析中',
    [ComplaintStatus.AUTO_REPLIED]: '已自动回复',
    [ComplaintStatus.MANUAL_PROCESSING]: '处理中',
    [ComplaintStatus.RESOLVED]: '已解决',
    [ComplaintStatus.CLOSED]: '已关闭'
  };
  return labels[status] || status;
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    [ComplaintCategory.NOISE_POLLUTION]: '噪音污染',
    [ComplaintCategory.ENVIRONMENTAL_POLLUTION]: '环境污染',
    [ComplaintCategory.TRAFFIC_CONGESTION]: '交通拥堵',
    [ComplaintCategory.PUBLIC_FACILITY_DAMAGE]: '公共设施损坏',
    [ComplaintCategory.GARBAGE_DISPOSAL]: '垃圾处理',
    [ComplaintCategory.CONSTRUCTION_NOISE]: '施工噪音',
    [ComplaintCategory.PARKING_PROBLEM]: '停车问题',
    [ComplaintCategory.NEIGHBOR_DISPUTE]: '邻里纠纷',
    [ComplaintCategory.MARKET_ORDER]: '市场秩序',
    [ComplaintCategory.STREET_VENDING]: '占道经营',
    [ComplaintCategory.OTHER]: '其他'
  };
  return labels[category] || category;
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级'
  };
  return labels[priority] || priority;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadComplaints();
});
</script>

<style scoped>
.my-complaints-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  color: #333;
}

.submit-link {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
}

.submit-link:hover {
  background: #5a6fd6;
}

.complaints-content {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-item {
  width: 200px;
}

.complaints-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.complaint-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.complaint-title {
  color: #333;
  margin: 0;
}

.status-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-tag.pending {
  background: #fff3e0;
  color: #ff9800;
}

.status-tag.analyzing {
  background: #e3f2fd;
  color: #2196f3;
}

.status-tag.auto_replied {
  background: #e8f5e9;
  color: #4caf50;
}

.status-tag.manual_processing {
  background: #fce4ec;
  color: #e91e63;
}

.status-tag.resolved {
  background: #e8eaf6;
  color: #3f51b5;
}

.status-tag.closed {
  background: #f5f5f5;
  color: #9e9e9e;
}

.complaint-content {
  color: #666;
  margin-bottom: 1rem;
}

.complaint-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  color: #999;
  font-size: 0.9rem;
}

.replies-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.replies-section h4 {
  color: #333;
  margin-bottom: 1rem;
}

.reply-item {
  margin-bottom: 1rem;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-type {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-right: 0.5rem;
}

.reply-type.auto {
  background: #e3f2fd;
  color: #1976d2;
}

.reply-type.manual {
  background: #e8f5e9;
  color: #388e3c;
}

.reply-item p {
  color: #333;
  margin: 0.5rem 0;
}

.reply-time {
  color: #999;
  font-size: 0.8rem;
}

.satisfaction-section {
  background: #fff8e1;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.satisfaction-section p {
  margin: 0 0 1rem 0;
}

.rating-stars {
  margin-bottom: 1rem;
}

.star {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
}

.star.active {
  opacity: 1;
}

.satisfaction-display {
  background: #e8f5e9;
  padding: 0.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #999;
  margin-bottom: 1rem;
}

.empty-link {
  color: #667eea;
  text-decoration: none;
}

.empty-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 1rem;
  }

  .complaint-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .complaint-meta {
    flex-wrap: wrap;
  }
}
</style>