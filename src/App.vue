<script setup>
import BaseHeader from './components/BaseHeader.vue';
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
