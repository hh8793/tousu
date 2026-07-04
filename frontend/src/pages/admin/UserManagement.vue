<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <div class="filters">
      <el-select v-model="filters.role" placeholder="角色筛选" class="filter-item">
        <el-option label="全部" value="" />
        <el-option label="管理员" value="admin" />
        <el-option label="操作员" value="operator" />
        <el-option label="市民" value="citizen" />
      </el-select>

      <el-input v-model="filters.search" placeholder="搜索用户名或邮箱" class="search-input" />

      <el-button type="primary" @click="loadUsers">搜索</el-button>
    </div>

    <el-table :data="users" border style="width: 100%" class="user-table">
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="手机" width="150" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <span :class="['role-tag', scope.row.role]">{{ getRoleLabel(scope.row.role) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteUser(scope.row._id)">删除</el-button>
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

    <el-dialog v-model="showEditDialog" title="编辑用户" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="市民" value="citizen" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { userApi } from '@/services/api';
import { User, UserRole } from '@/types';
import { ElMessage } from 'element-plus';

const users = ref<User[]>([]);
const total = ref(0);
const showEditDialog = ref(false);
const editingId = ref('');

const filters = reactive({
  role: '',
  search: ''
});

const pagination = reactive({
  page: 1,
  limit: 10
});

const form = reactive({
  username: '',
  email: '',
  phone: '',
  role: ''
});

const loadUsers = async () => {
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    };

    if (filters.role) params.role = filters.role;

    const result = await userApi.list(params);
    users.value = result;
    total.value = result.length;
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  }
};

const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  loadUsers();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  loadUsers();
};

const editUser = (user: User) => {
  editingId.value = user._id!;
  form.username = user.username;
  form.email = user.email;
  form.phone = user.phone;
  form.role = user.role;
  showEditDialog.value = true;
};

const saveUser = async () => {
  try {
    await userApi.update(editingId.value, form);
    ElMessage.success('用户信息更新成功');
    showEditDialog.value = false;
    loadUsers();
  } catch (error) {
    ElMessage.error('更新失败');
  }
};

const deleteUser = async (id: string) => {
  try {
    await userApi.delete(id);
    ElMessage.success('用户删除成功');
    loadUsers();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    [UserRole.ADMIN]: '管理员',
    [UserRole.OPERATOR]: '操作员',
    [UserRole.CITIZEN]: '市民'
  };
  return labels[role] || role;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management-container {
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

.user-table {
  background: white;
  border-radius: 8px;
}

.role-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.role-tag.admin {
  background: #e8f5e9;
  color: #2e7d32;
}

.role-tag.operator {
  background: #e3f2fd;
  color: #1565c0;
}

.role-tag.citizen {
  background: #fff3e0;
  color: #e65100;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .user-management-container {
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