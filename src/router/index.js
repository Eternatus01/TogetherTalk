import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('../pages/FriendsPage.vue'),
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: () => import('../pages/ProfilePage.vue'),
  },
  {
    path: '/notices',
    name: 'Notices',
    component: () => import('../pages/NoticesPage.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
  },
  {
    path: '/chats',
    component: () => import('../pages/ChatsPage.vue'),
    children: [
      {
        path: '',
        components: {
          sidebar: () => import('../components/ChatSlideBar.vue'),
          default: () => import('../pages/ChatDefault.vue'),
        },
      },
      {
        path: ':id',
        components: {
          sidebar: () => import('../components/ChatSlideBar.vue'),
          default: () => import('../pages/ChatsDetailsPage.vue'),
        },
        name: 'ChatsDetails',
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const title = to.meta.title || 'Мой мессенджер';
  document.title = title;
  next();
});

export default router;
