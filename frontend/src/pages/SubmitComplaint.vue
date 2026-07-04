<template>
  <div class="submit-container">
    <header class="page-header">
      <h1>提交投诉</h1>
      <router-link to="/" class="back-link">返回首页</router-link>
    </header>

    <div class="submit-content">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { complaintApi } from '@/services/api';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

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
const uploadUrl = '#'

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
    await complaintApi.create(form);
    ElMessage.success('投诉提交成功');
    router.push('/my-complaints');
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
</script>

<style scoped>
.submit-container {
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

.back-link {
  color: #667eea;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.submit-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.complaint-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  width: 200px;
}

.tips-card {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-radius: 8px;
}

.tips-card h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.tips-card ul {
  list-style: none;
  padding: 0;
}

.tips-card li {
  color: #388e3c;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.tips-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4caf50;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>