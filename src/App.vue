<script setup>
import BaseHeader from './components/BaseHeader.vue';
import { useUser } from './stores/userStore/user';
import { onMounted } from 'vue';
const userStore = useUser();

onMounted(async () => {
  await userStore.getUser();
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