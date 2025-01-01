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
    path: '/profile/personal',
    name: 'PersonalProfile',
    component: () => import('../pages/PersonalProfilePage.vue'),
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
    path: '/chats',
    name: 'Chats',
    component: () => import('../pages/ChatsPage.vue'),
  },
  {
    path: '/chats/:id',
    name: 'ChatsDetails',
    component: () => import('../pages/ChatsDetailsPage.vue'),
    props: true,
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
