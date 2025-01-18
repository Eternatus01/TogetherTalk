<script setup>
import BaseHeader from './components/BaseHeader.vue';
import { useUser } from './stores/userStore/user';
import { useChat } from './stores/chatStore/chat';
import { onMounted } from 'vue';
const userStore = useUser();
const chatStore = useChat();

onMounted(async () => {
  await userStore.getUser();
  await chatStore.fetchChats();
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
  <div class="container">
    <base-header />
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
</style>