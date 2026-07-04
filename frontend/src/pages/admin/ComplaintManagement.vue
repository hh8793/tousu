<template>
  <div class="complaint-management-container">
    <div class="page-header">
      <h2>投诉管理</h2>
    </div>

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

      <el-select v-model="filters.category" placeholder="投诉类型" class="filter-item">
        <el-option label="全部" value="" />
        <el-option v-for="cat in complaintCategories" :key="cat.value" :label="cat.label" :value="cat.value" />
      </el-select>

      <el-input v-model="filters.search" placeholder="搜索关键词" class="search-input" />

      <el-button type="primary" @click="loadComplaints">搜索</el-button>
    </div>

    <el-table :data="complaints" border style="width: 100%" class="complaint-table">
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="category" label="类型" width="120">
        <template #default="scope">
          {{ getCategoryLabel(scope.row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <span :class="['status-tag', scope.row.status]">{{ getStatusLabel(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <span :class="['priority-tag', scope.row.priority]">{{ getPriorityLabel(scope.row.priority) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewComplaint(scope.row)">查看</el-button>
          <el-button type="warning" size="small" @click="updateStatus(scope.row)">变更状态</el-button>
          <el-button type="danger" size="small" @click="deleteComplaint(scope.row._id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
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

    <el-dialog v-model="viewDialogVisible" title="投诉详情" width="800px">
      <div v-if="selectedComplaint" class="complaint-detail">
        <div class="detail-row">
          <span class="detail-label">标题：</span>
          <span>{{ selectedComplaint.title }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">类型：</span>
          <span>{{ getCategoryLabel(selectedComplaint.category) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">状态：</span>
          <span :class="['status-tag', selectedComplaint.status]">{{ getStatusLabel(selectedComplaint.status) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">详情：</span>
          <p>{{ selectedComplaint.content }}</p>
        </div>
        <div v-if="selectedComplaint.analysisResult" class="analysis-section">
          <h4>分析结果</h4>
          <div class="analysis-row">
            <span>分类：{{ getCategoryLabel(selectedComplaint.analysisResult.category) }}</span>
            <span>置信度：{{ (selectedComplaint.analysisResult.confidence * 100).toFixed(1) }}%</span>
          </div>
          <div class="analysis-row">
            <span>意图：{{ selectedComplaint.analysisResult.intent }}</span>
            <span>情感：{{ getSentimentLabel(selectedComplaint.analysisResult.sentiment) }}</span>
          </div>
          <div class="analysis-row">
            <span>关键词：{{ selectedComplaint.analysisResult.keywords.join(', ') }}</span>
          </div>
        </div>
        <div v-if="selectedComplaint.replies && selectedComplaint.replies.length > 0" class="replies-section">
          <h4>回复记录</h4>
          <div v-for="reply in selectedComplaint.replies" :key="reply._id" class="reply-item">
            <span :class="['reply-type', reply.type]">{{ reply.type === 'auto' ? '自动回复' : '人工回复' }}</span>
            <p>{{ reply.content }}</p>
            <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
          </div>
        </div>
        <div v-if="authStore.isAdmin || authStore.isOperator" class="manual-reply-section">
          <h4>人工回复</h4>
          <el-input v-model="replyContent" type="textarea" :rows="3" placeholder="输入回复内容" />
          <el-button type="primary" @click="submitReply">提交回复</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" title="变更状态">
      <el-select v-model="newStatus" placeholder="选择新状态">
        <el-option label="待处理" value="pending" />
        <el-option label="分析中" value="analyzing" />
        <el-option label="已自动回复" value="auto_replied" />
        <el-option label="处理中" value="manual_processing" />
        <el-option label="已解决" value="resolved" />
        <el-option label="已关闭" value="closed" />
      </el-select>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStatusChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { complaintApi } from '@/services/api';
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();

const complaints = ref<Complaint[]>([]);
const total = ref(0);
const viewDialogVisible = ref(false);
const statusDialogVisible = ref(false);
const selectedComplaint = ref<Complaint | null>(null);
const newStatus = ref('');
const replyContent = ref('');

const filters = reactive({
  status: '',
  category: '',
  search: ''
});

const pagination = reactive({
  page: 1,
  limit: 10
});

const complaintCategories = [
  { value: ComplaintCategory.NOISE_POLLUTION, label: '噪音污染' },
  { value: ComplaintCategory.ENVIRONMENTAL_POLLUTION, label: '环境污染' },
  { value: ComplaintCategory.TRAFFIC_CONGESTION, label: '交通拥堵' },
  { value: ComplaintCategory.PUBLIC_FACILITY_DAMAGE, label: '公共设施损坏' },
  { value: ComplaintCategory.GARBAGE_DISPOSAL, label: '垃圾处理' },
  { value: ComplaintCategory.CONSTRUCTION_NOISE, label: '施工噪音' },
  { value: ComplaintCategory.PARKING_PROBLEM, label: '停车问题' },
  { value: ComplaintCategory.NEIGHBOR_DISPUTE, label: '邻里纠纷' },
  { value: ComplaintCategory.MARKET_ORDER, label: '市场秩序' },
  { value: ComplaintCategory.STREET_VENDING, label: '占道经营' },
  { value: ComplaintCategory.OTHER, label: '其他' }
];

const loadComplaints = async () => {
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    };

    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;

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

const viewComplaint = (complaint: Complaint) => {
  selectedComplaint.value = complaint;
  viewDialogVisible.value = true;
};

const updateStatus = (complaint: Complaint) => {
  selectedComplaint.value = complaint;
  newStatus.value = complaint.status;
  statusDialogVisible.value = true;
};

const confirmStatusChange = async () => {
  if (!selectedComplaint.value) return;

  try {
    await complaintApi.updateStatus(selectedComplaint.value._id, { status: newStatus.value });
    ElMessage.success('状态更新成功');
    statusDialogVisible.value = false;
    loadComplaints();
  } catch (error) {
    ElMessage.error('状态更新失败');
  }
};

const submitReply = async () => {
  if (!selectedComplaint.value || !replyContent.value) {
    ElMessage.warning('请输入回复内容');
    return;
  }

  try {
    await complaintApi.addReply(selectedComplaint.value._id, { content: replyContent.value });
    ElMessage.success('回复提交成功');
    replyContent.value = '';
    loadComplaints();
    viewComplaint(selectedComplaint.value);
  } catch (error) {
    ElMessage.error('提交回复失败');
  }
};

const deleteComplaint = async (id: string) => {
  try {
    await complaintApi.delete(id);
    ElMessage.success('投诉删除成功');
    loadComplaints();
  } catch (error) {
    ElMessage.error('删除失败');
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
    'low': '低',
    'medium': '中',
    'high': '高'
  };
  return labels[priority] || priority;
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
.complaint-management-container {
  padding: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  color: #333;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  width: 150px;
}

.search-input {
  width: 200px;
}

.complaint-table {
  background: white;
  border-radius: 8px;
}

.status-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
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

.priority-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.complaint-detail {
  padding: 1rem 0;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: bold;
  color: #666;
}

.analysis-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.analysis-section h4 {
  margin-bottom: 1rem;
  color: #333;
}

.analysis-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.5rem;
}

.replies-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.replies-section h4 {
  margin-bottom: 1rem;
  color: #333;
}

.reply-item {
  margin-bottom: 1rem;
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
  margin: 0.5rem 0;
}

.reply-time {
  color: #999;
  font-size: 0.8rem;
}

.manual-reply-section {
  background: #fff8e1;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.manual-reply-section h4 {
  margin-bottom: 1rem;
  color: #333;
}

@media (max-width: 768px) {
  .complaint-management-container {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-item,
  .search-input {
    width: 100%;
  }
}
</style>