<template>
  <div class="submit-container">
    <header class="page-header">
      <h1>提交投诉</h1>
      <router-link to="/" class="back-link">返回首页</router-link>
    </header>

    <div class="submit-content">
      <div v-if="!showAnalysisResult" class="form-section">
        <el-form :model="form" label-width="100px" class="complaint-form">
          <el-form-item label="投诉标题" required>
            <el-input v-model="form.title" placeholder="请简要描述您的投诉内容" />
          </el-form-item>

          <el-form-item label="投诉详情" required>
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="6"
              placeholder="请详细描述您遇到的问题，包括时间、地点、具体情况等"
            />
          </el-form-item>

          <el-form-item label="上传图片">
            <el-upload
              :action="uploadUrl"
              :on-success="handleImageUpload"
              :on-error="handleImageError"
              list-type="picture-card"
              :file-list="imageList"
              :limit="5"
            >
              <div class="upload-icon">
                <el-icon><Plus /></el-icon>
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item label="投诉地点">
            <el-input v-model="form.location.address" placeholder="请输入详细地址" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
              提交投诉
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <div class="tips-card">
          <h3>📝 投诉须知</h3>
          <ul>
            <li>请如实填写投诉内容，虚假投诉将承担相应责任</li>
            <li>上传相关图片可以帮助我们更快地处理您的投诉</li>
            <li>系统会自动分析投诉内容并进行分类</li>
            <li>您可以在"我的投诉"中查看处理进度</li>
          </ul>
        </div>
      </div>

      <div v-else class="analysis-result-section">
        <div class="analysis-success-header">
          <div class="success-icon">✅</div>
          <h2>投诉提交成功</h2>
          <p>OpenClaw AI 已完成智能分析，以下是分析结果</p>
        </div>

        <div class="ai-analysis-card">
          <div class="ai-header">
            <div class="ai-avatar">
              <i class="ri-robot-line"></i>
            </div>
            <div>
              <h3>OpenClaw 智能分析引擎</h3>
              <p class="ai-subtitle">基于深度学习的智能语义分析</p>
            </div>
            <span class="analysis-badge">分析完成</span>
          </div>

          <div class="analysis-steps">
            <div class="step-item completed">
              <div class="step-icon">📄</div>
              <div class="step-info">
                <span class="step-title">文本解析</span>
                <span class="step-desc">已完成</span>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">🏷️</div>
              <div class="step-info">
                <span class="step-title">智能分类</span>
                <span class="step-desc">已完成</span>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">🎯</div>
              <div class="step-info">
                <span class="step-title">意图识别</span>
                <span class="step-desc">已完成</span>
              </div>
            </div>
            <div class="step-item completed">
              <div class="step-icon">💬</div>
              <div class="step-info">
                <span class="step-title">回复生成</span>
                <span class="step-desc">已完成</span>
              </div>
            </div>
          </div>

          <div class="analysis-details">
            <div class="detail-card category-card">
              <div class="detail-icon">🏷️</div>
              <div class="detail-content">
                <span class="detail-label">智能分类</span>
                <span class="detail-value">{{ getCategoryLabel(currentComplaint?.category || '') }}</span>
                <div class="confidence-bar">
                  <div class="confidence-fill" :style="{ width: (currentComplaint?.analysisResult?.confidence || 0) * 100 + '%' }"></div>
                </div>
                <span class="confidence-text">置信度 {{ ((currentComplaint?.analysisResult?.confidence || 0) * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-card intent-card">
                <div class="detail-icon">🎯</div>
                <div class="detail-content">
                  <span class="detail-label">用户意图</span>
                  <span class="detail-value">{{ getIntentLabel(currentComplaint?.analysisResult?.intent || '') }}</span>
                </div>
              </div>

              <div class="detail-card urgency-card">
                <div class="detail-icon">⚡</div>
                <div class="detail-content">
                  <span class="detail-label">紧急程度</span>
                  <span :class="['urgency-tag', currentComplaint?.analysisResult?.urgency]">
                    {{ getUrgencyLabel(currentComplaint?.analysisResult?.urgency || '') }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-card keywords-card">
              <div class="detail-icon">🔑</div>
              <div class="detail-content">
                <span class="detail-label">关键词提取</span>
                <div class="keywords-list">
                  <span v-for="keyword in currentComplaint?.analysisResult?.keywords || []" :key="keyword" class="keyword-tag">
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-card sentiment-card">
              <div class="detail-icon">💭</div>
              <div class="detail-content">
                <span class="detail-label">情感分析</span>
                <span :class="['sentiment-tag', currentComplaint?.analysisResult?.sentiment]">
                  {{ getSentimentLabel(currentComplaint?.analysisResult?.sentiment || '') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentComplaint?.replies && currentComplaint.replies.length > 0" class="auto-reply-card">
          <div class="reply-header">
            <div class="reply-icon">🤖</div>
            <h3>自动回复</h3>
            <span class="reply-badge">AI 生成</span>
          </div>
          <div class="reply-content">
            <p v-for="(reply, index) in currentComplaint.replies" :key="index">{{ reply.content }}</p>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" @click="goToMyComplaints">查看我的投诉</el-button>
          <el-button @click="submitAnother">继续提交</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { complaintApi } from '@/services/api';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Complaint, ComplaintCategory } from '@/types';

const router = useRouter();

const form = reactive({
  title: '',
  content: '',
  images: [] as string[],
  location: {
    address: '',
    latitude: 0,
    longitude: 0
  }
});

const imageList = ref<any[]>([]);
const loading = ref(false);
const uploadUrl = '#';
const showAnalysisResult = ref(false);
const currentComplaint = ref<Complaint | null>(null);

const handleImageUpload = (response: any, file: any) => {
  const imageUrl = URL.createObjectURL(file.raw);
  form.images.push(imageUrl);
};

const handleImageError = () => {
  ElMessage.error('图片上传失败');
};

const handleSubmit = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写标题和详情');
    return;
  }

  loading.value = true;

  try {
    const result = await complaintApi.create(form);
    currentComplaint.value = result;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const detail = await complaintApi.get(result._id);
      currentComplaint.value = detail;
    } catch (e) {
      console.log('Fetching detail failed, using initial result');
    }
    
    showAnalysisResult.value = true;
    ElMessage.success('投诉提交成功');
  } catch (error) {
    ElMessage.error('提交失败，请重试');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  form.title = '';
  form.content = '';
  form.images = [];
  form.location.address = '';
  imageList.value = [];
};

const goToMyComplaints = () => {
  router.push('/my-complaints');
};

const submitAnother = () => {
  showAnalysisResult.value = false;
  currentComplaint.value = null;
  handleReset();
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
</script>

<style scoped>
.submit-container {
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
  font-size: 1.5rem;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.submit-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.form-section {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.complaint-form {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.submit-btn {
  width: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.tips-card {
  background: rgba(255, 255, 255, 0.95);
  border-left: 4px solid #4caf50;
  padding: 1.5rem 2rem;
  margin-top: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tips-card h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.tips-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-card li {
  color: #388e3c;
  margin-bottom: 0.6rem;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.6;
}

.tips-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4caf50;
  font-weight: bold;
}

.analysis-result-section {
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analysis-success-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.analysis-success-header h2 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.analysis-success-header p {
  opacity: 0.9;
  margin: 0;
}

.ai-analysis-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.ai-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.ai-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.ai-subtitle {
  margin: 0.3rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.analysis-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.analysis-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 2px;
  background: #ddd;
}

.step-item.completed:not(:last-child)::after {
  background: #4caf50;
}

.step-icon {
  font-size: 1.5rem;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.step-desc {
  font-size: 0.75rem;
  color: #4caf50;
}

.analysis-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-card {
  display: flex;
  gap: 1rem;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.intent-card {
  flex: 1;
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.urgency-card {
  flex: 1;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.keywords-card {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.sentiment-card {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.detail-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.confidence-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3 0%, #667eea 100%);
  border-radius: 4px;
  transition: width 1s ease;
}

.confidence-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.urgency-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
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

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  background: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.sentiment-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
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

.auto-reply-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.8s ease 0.3s both;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.reply-icon {
  font-size: 2rem;
}

.reply-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.reply-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.reply-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  line-height: 1.8;
  color: #333;
}

.reply-content p {
  margin: 0 0 0.5rem 0;
}

.reply-content p:last-child {
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-buttons .el-button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 10px;
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .submit-btn {
    width: 100%;
  }

  .analysis-steps {
    flex-direction: column;
    gap: 1rem;
  }

  .step-item:not(:last-child)::after {
    display: none;
  }

  .detail-row {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
