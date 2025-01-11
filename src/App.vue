<script setup>
import BaseHeader from './components/BaseHeader.vue';
import { useUser } from './stores/userStore/user';
import { onMounted } from 'vue';
import supabase  from './service/SupaBase';
const userStore = useUser();

onMounted(async () => {
  await userStore.getUser();
  await userStore.changeStatus('online');
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    userStore.changeStatus('offline');
  } else {
    userStore.changeStatus('online');
  }
});
</script>

<template>
  <div>
    <base-header />
    <router-view></router-view>
  </div>
</template>

<style>
nav {
  display: flex;
  gap: 10px;
}

nav * {
  font-family: 'Courier New', Courier, monospace;
  text-decoration: none;
  color: black;
  font-size: 22px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.container_h {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>