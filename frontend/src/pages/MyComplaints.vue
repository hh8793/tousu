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

          <div v-if="complaint.analysisResult" class="analysis-preview">
            <div class="ai-badge">
              <span class="ai-icon">🤖</span>
              <span>OpenClaw AI 已分析</span>
            </div>
            <div class="analysis-tags">
              <span v-for="keyword in complaint.analysisResult.keywords.slice(0, 3)" :key="keyword" class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
            <el-button type="text" class="view-detail-btn" @click="viewDetail(complaint)">
              查看分析详情 →
            </el-button>
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
                :class="['star', { active: star <= getRating(complaint._id!) }]"
                @click="setRating(complaint._id!, star)"
              >⭐</span>
            </div>
            <el-button type="primary" @click="submitSatisfaction(complaint._id!)">提交评价</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="投诉详情" width="700px" class="detail-dialog">
      <div v-if="selectedComplaint" class="complaint-detail">
        <div class="detail-header">
          <h3>{{ selectedComplaint.title }}</h3>
          <span :class="['status-tag', selectedComplaint.status]">{{ getStatusLabel(selectedComplaint.status) }}</span>
        </div>

        <div class="detail-info-row">
          <div class="info-item">
            <span class="info-label">投诉类型</span>
            <span class="info-value">{{ getCategoryLabel(selectedComplaint.category) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">提交时间</span>
            <span class="info-value">{{ formatDate(selectedComplaint.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优先级</span>
            <span :class="['priority-tag', selectedComplaint.priority]">{{ getPriorityLabel(selectedComplaint.priority) }}</span>
          </div>
        </div>

        <div class="detail-content">
          <h4>投诉内容</h4>
          <p>{{ selectedComplaint.content }}</p>
        </div>

        <div v-if="selectedComplaint.analysisResult" class="ai-analysis-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-icon">🤖</span>
              <span>OpenClaw 智能分析结果</span>
            </div>
            <span class="analysis-badge">分析完成</span>
          </div>

          <div class="analysis-grid">
            <div class="analysis-card category-card">
              <div class="card-icon">🏷️</div>
              <div class="card-content">
                <span class="card-label">智能分类</span>
                <span class="card-value">{{ getCategoryLabel(selectedComplaint.analysisResult.category) }}</span>
                <div class="confidence-bar">
                  <div class="confidence-fill" :style="{ width: (selectedComplaint.analysisResult.confidence * 100) + '%' }"></div>
                </div>
                <span class="confidence-text">置信度 {{ (selectedComplaint.analysisResult.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <div class="analysis-card intent-card">
              <div class="card-icon">🎯</div>
              <div class="card-content">
                <span class="card-label">用户意图</span>
                <span class="card-value">{{ getIntentLabel(selectedComplaint.analysisResult.intent) }}</span>
              </div>
            </div>

            <div class="analysis-card urgency-card">
              <div class="card-icon">⚡</div>
              <div class="card-content">
                <span class="card-label">紧急程度</span>
                <span :class="['urgency-tag', selectedComplaint.analysisResult.urgency]">
                  {{ getUrgencyLabel(selectedComplaint.analysisResult.urgency) }}
                </span>
              </div>
            </div>

            <div class="analysis-card sentiment-card">
              <div class="card-icon">💭</div>
              <div class="card-content">
                <span class="card-label">情感分析</span>
                <span :class="['sentiment-tag', selectedComplaint.analysisResult.sentiment]">
                  {{ getSentimentLabel(selectedComplaint.analysisResult.sentiment) }}
                </span>
              </div>
            </div>
          </div>

          <div class="keywords-section">
            <span class="keywords-label">🔑 关键词提取</span>
            <div class="keywords-list">
              <span v-for="keyword in selectedComplaint.analysisResult.keywords" :key="keyword" class="keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedComplaint.replies && selectedComplaint.replies.length > 0" class="replies-section">
          <h4>回复记录</h4>
          <div v-for="reply in selectedComplaint.replies" :key="reply._id" class="reply-item">
            <div class="reply-header">
              <span :class="['reply-type', reply.type]">{{ reply.type === 'auto' ? '🤖 自动回复' : '👤 人工回复' }}</span>
              <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
            </div>
            <p class="reply-content">{{ reply.content }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { complaintApi } from '@/services/api';
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { ElMessage } from 'element-plus';

const complaints = ref<Complaint[]>([]);
const total = ref(0);
const ratings = ref<Record<string, number>>({});
const detailDialogVisible = ref(false);
const selectedComplaint = ref<Complaint | null>(null);

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

const getRating = (id: string): number => {
  return ratings.value[id] || 0;
};

const setRating = (id: string, star: number) => {
  ratings.value[id] = star;
};

const submitSatisfaction = async (id: string) => {
  const rating = getRating(id);
  if (!rating) {
    ElMessage.warning('请先选择评价星级');
    return;
  }

  try {
    await complaintApi.submitSatisfaction(id, { rating });
    ElMessage.success('评价提交成功');
    ratings.value[id] = 0;
    loadComplaints();
  } catch (error) {
    ElMessage.error('提交评价失败');
  }
};

const viewDetail = async (complaint: Complaint) => {
  try {
    const detail = await complaintApi.get(complaint._id!);
    selectedComplaint.value = detail;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('加载详情失败');
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

const getIntentLabel = (intent: string): string => {
  const labels: Record<string, string> = {
    'complaint': '投诉举报',
    'report': '问题反映',
    'suggestion': '建议咨询',
    'request': '请求帮助'
  };
  return labels[intent] || intent;
};

const getUrgencyLabel = (urgency: string): string => {
  const labels: Record<string, string> = {
    'low': '低',
    'medium': '中',
    'high': '高'
  };
  return labels[urgency] || urgency;
};

const getSentimentLabel = (sentiment: string): string => {
  const labels: Record<string, string> = {
    'positive': '正面',
    'neutral': '中性',
    'negative': '负面'
  };
  return labels[sentiment] || sentiment;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.submit-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filter-item {
  width: 200px;
}

.complaints-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.complaint-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.complaint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
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
  font-size: 1.1rem;
}

.status-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
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
  line-height: 1.6;
}

.complaint-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #999;
  font-size: 0.85rem;
}

.analysis-preview {
  background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.ai-icon {
  font-size: 1rem;
}

.analysis-tags {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.keyword-tag {
  background: rgba(255, 255, 255, 0.6);
  color: #5c6bc0;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.view-detail-btn {
  color: #667eea;
  font-weight: 500;
}

.replies-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.replies-section h4 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 0.95rem;
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
  line-height: 1.6;
}

.reply-time {
  color: #999;
  font-size: 0.75rem;
}

.satisfaction-section {
  background: #fff8e1;
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.satisfaction-section p {
  margin: 0 0 1rem 0;
  color: #f57c00;
  font-weight: 500;
}

.rating-stars {
  margin-bottom: 1rem;
}

.star {
  font-size: 1.3rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.star:hover {
  transform: scale(1.2);
}

.star.active {
  opacity: 1;
}

.satisfaction-display {
  background: #e8f5e9;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2e7d32;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #999;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.empty-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
}

.empty-link:hover {
  text-decoration: underline;
}

.detail-dialog :deep(.el-dialog) {
  border-radius: 20px;
}

.detail-dialog :deep(.el-dialog__header) {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 1.5rem 2rem;
}

.complaint-detail {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.detail-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.detail-info-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.8rem;
  color: #999;
}

.info-value {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.priority-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  width: fit-content;
}

.priority-tag.low {
  background: #e8f5e9;
  color: #2e7d32;
}

.priority-tag.medium {
  background: #fff3e0;
  color: #e65100;
}

.priority-tag.high {
  background: #ffebee;
  color: #c62828;
}

.detail-content {
  margin-bottom: 1.5rem;
}

.detail-content h4 {
  color: #333;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.detail-content p {
  color: #666;
  line-height: 1.8;
  margin: 0;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.ai-analysis-section {
  background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
}

.section-icon {
  font-size: 1.3rem;
}

.analysis-badge {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  transition: all 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-label {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.card-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.confidence-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.3rem;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 1s ease;
}

.confidence-text {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

.urgency-tag {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}

.urgency-tag.low {
  background: #4caf50;
  color: white;
}

.urgency-tag.medium {
  background: #ff9800;
  color: white;
}

.urgency-tag.high {
  background: #f44336;
  color: white;
}

.sentiment-tag {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}

.sentiment-tag.positive {
  background: #4caf50;
  color: white;
}

.sentiment-tag.neutral {
  background: #9e9e9e;
  color: white;
}

.sentiment-tag.negative {
  background: #f44336;
  color: white;
}

.keywords-section {
  background: rgba(255, 255, 255, 0.6);
  padding: 1rem;
  border-radius: 12px;
}

.keywords-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: block;
  margin-bottom: 0.8rem;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.replies-section .reply-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.replies-section .reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.replies-section .reply-content {
  color: #333;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-item {
    width: 100%;
  }

  .complaint-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .complaint-meta {
    flex-wrap: wrap;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .detail-info-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
