<template>
  <header>
    <nav>
      <router-link to="/" class="nav__logo">TogetherTalk</router-link>
      <div class="nav__links">
        <router-link v-for="route in routes" :key="route.name" :to="route.path" class="nav__link">
          <component :is="route.icon" class="nav__icon" />
          {{ route.name }}
        </router-link>
        <a @click="logout" v-if="user" class="nav__link">
          <component :is="LogOutIcon" />
          Выйти
        </a>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { onMounted, ref, watch, computed, markRaw } from 'vue';
import { useUser } from '../stores/userStore/user';
import ProfileIcon from '../components/icons/ProfileIcon.vue';
import FriendsIcon from '../components/icons/FriendsIcon.vue';
import ChatIcon from '../components/icons/ChatIcon.vue';
import LogOutIcon from '../components/icons/LogOutIcon.vue';

const userStore = useUser();
const user = ref(computed(() => userStore.user));
const routes = ref([]);

const logout = async () => {
  await userStore.logout();
};

const updateRoutes = () => {
  routes.value = user.value !== null
    ? [
      { path: '/profile/personal', name: 'Профиль', icon: markRaw(ProfileIcon) },
      { path: '/friends', name: 'Друзья', icon: markRaw(FriendsIcon) },
      { path: '/chats', name: 'Чаты', icon: markRaw(ChatIcon) },
      { path: '/notices', name: 'Уведомления' },
    ]
    : [
      { path: '/login', name: 'Вход' },
      { path: '/register', name: 'Регистрация' },
    ];
};

onMounted(updateRoutes);
watch(user, () => {
  updateRoutes();
});
</script>
