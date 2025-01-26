<script setup>
import BaseHeader from './components/BaseHeader.vue';
import { useUser } from './stores/userStore/user';
import { onMounted } from 'vue';
import Cookies from 'js-cookie';

const userStore = useUser();
const sessionCookie = Cookies.get('userSession');

onMounted(async () => {
  if (sessionCookie) await userStore.fetchUser()
});
</script>

<template>
  <div class="container">
    <base-header />
    <router-view></router-view>
  </div>
</template>

<style lang="scss"></style>