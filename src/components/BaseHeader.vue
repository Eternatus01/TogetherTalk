<template>
  <header>
    <nav>
      <router-link v-for="route in routes" :key="route.name" :to="route.path">
        {{ route.name }}
      </router-link>
      <button @click="logout" v-if="user">Выйти</button>
    </nav>
  </header>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useUser  } from '../stores/userStore/user';

const userStore = useUser();
const user = ref(computed(() => userStore.user));
const routes = ref([]);

const updateUser  = async () => {
  user.value = await userStore.getUser();
};

const logout = async () => {
  await userStore.logout();
  await updateUser ();
};

const updateRoutes = () => {
  routes.value = user.value ? [
    { path: '/', name: 'Home' },
    { path: '/profile/personal', name: 'Profile' },
  ] : [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
  ];
};

onMounted(updateUser);
watch(user,() => {
  updateRoutes();
});

 // Обновляем маршруты при изменении пользователя
</script>

<style lang="scss" scoped></style>