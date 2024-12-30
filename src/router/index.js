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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
