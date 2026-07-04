<template>
  <div class="template-management-container">
    <div class="page-header">
      <h2>回复模板管理</h2>
      <el-button type="primary" @click="showAddDialog = true">添加模板</el-button>
    </div>

    <div class="filters">
      <el-select v-model="filters.category" placeholder="投诉类型" class="filter-item">
        <el-option label="全部" value="" />
        <el-option v-for="cat in complaintCategories" :key="cat.value" :label="cat.label" :value="cat.value" />
      </el-select>
    </div>

    <el-table :data="templates" border style="width: 100%" class="template-table">
      <el-table-column prop="category" label="投诉类型" width="140">
        <template #default="scope">
          {{ getCategoryLabel(scope.row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="keywords" label="关键词" width="200">
        <template #default="scope">
          <span v-for="(kw, idx) in scope.row.keywords" :key="idx" class="keyword-tag">{{ kw }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="template" label="回复模板" min-width="300">
        <template #default="scope">
          {{ scope.row.template.slice(0, 50) }}{{ scope.row.template.length > 50 ? '...' : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="80" />
      <el-table-column prop="isActive" label="状态" width="100">
        <template #default="scope">
          <el-switch :value="scope.row.isActive" @change="toggleTemplateStatus(scope.row._id)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editTemplate(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteTemplate(scope.row._id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAddDialog" :title="isEditing ? '编辑模板' : '添加模板'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="投诉类型" required>
          <el-select v-model="form.category" placeholder="选择投诉类型">
            <el-option v-for="cat in complaintCategories" :key="cat.value" :label="cat.label" :value="cat.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="keywordsInput" placeholder="多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="回复模板" required>
          <el-input v-model="form.template" type="textarea" :rows="4" placeholder="输入回复模板，支持占位符：{{title}}, {{content}}, {{category}}, {{location}}, {{urgency}}, {{date}}" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">{{ isEditing ? '保存修改' : '添加模板' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { templateApi } from '@/services/api';
import { ReplyTemplate, ComplaintCategory } from '@/types';
import { ElMessage } from 'element-plus';

const templates = ref<ReplyTemplate[]>([]);
const showAddDialog = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const keywordsInput = ref('');

const filters = reactive({
  category: ''
});

const form = reactive({
  category: '',
  keywords: [] as string[],
  template: '',
  priority: 0,
  isActive: true
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

const loadTemplates = async () => {
  try {
    const params = filters.category ? { category: filters.category } : undefined;
    const result = await templateApi.list(params);
    templates.value = result;
  } catch (error) {
    ElMessage.error('加载模板列表失败');
  }
};

const resetForm = () => {
  form.category = '';
  form.keywords = [];
  form.template = '';
  form.priority = 0;
  form.isActive = true;
  keywordsInput.value = '';
};

const saveTemplate = async () => {
  if (!form.category || !form.template) {
    ElMessage.warning('请填写必填项');
    return;
  }

  form.keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);

  try {
    if (isEditing.value) {
      await templateApi.update(editingId.value, form);
      ElMessage.success('模板更新成功');
    } else {
      await templateApi.create(form);
      ElMessage.success('模板添加成功');
    }
    showAddDialog.value = false;
    resetForm();
    loadTemplates();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const editTemplate = (template: ReplyTemplate) => {
  isEditing.value = true;
  editingId.value = template._id!;
  form.category = template.category;
  form.keywords = template.keywords;
  keywordsInput.value = template.keywords.join(', ');
  form.template = template.template;
  form.priority = template.priority;
  form.isActive = template.isActive;
  showAddDialog.value = true;
};

const deleteTemplate = async (id: string) => {
  try {
    await templateApi.delete(id);
    ElMessage.success('模板删除成功');
    loadTemplates();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const toggleTemplateStatus = async (id: string) => {
  try {
    await templateApi.toggleStatus(id);
    ElMessage.success('状态更新成功');
    loadTemplates();
  } catch (error) {
    ElMessage.error('操作失败');
    loadTemplates();
  }
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

watch(() => filters.category, () => {
  loadTemplates();
});

onMounted(() => {
  loadTemplates();
});
</script>

<style scoped>
.template-management-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  color: #333;
}

.filters {
  margin-bottom: 1.5rem;
}

.filter-item {
  width: 200px;
}

.template-table {
  background: white;
  border-radius: 8px;
}

.keyword-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 0.3rem;
}

@media (max-width: 768px) {
  .template-management-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filter-item {
    width: 100%;
  }
}
</style>