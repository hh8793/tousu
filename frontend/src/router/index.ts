import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { UserRole } from '@/types';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue')
    },
    {
      path: '/submit',
      name: 'SubmitComplaint',
      component: () => import('@/pages/SubmitComplaint.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-complaints',
      name: 'MyComplaints',
      component: () => import('@/pages/MyComplaints.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/admin/AdminHome.vue'),
      meta: { requiresAuth: true, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
      children: [
        {
          path: 'complaints',
          name: 'AdminComplaints',
          component: () => import('@/pages/admin/ComplaintManagement.vue')
        },
        {
          path: 'templates',
          name: 'ReplyTemplates',
          component: () => import('@/pages/admin/ReplyTemplateManagement.vue')
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/pages/admin/Statistics.vue')
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/pages/admin/UserManagement.vue'),
          meta: { roles: [UserRole.ADMIN] }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login');
    return;
  }

  if (to.meta.roles && authStore.user) {
    const requiredRoles = to.meta.roles as UserRole[];
    if (!requiredRoles.includes(authStore.user.role)) {
      next('/');
      return;
    }
  }

  next();
});

export default router;