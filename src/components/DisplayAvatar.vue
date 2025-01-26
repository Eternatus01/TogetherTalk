<template>
  <div class="avatar">
    <img v-if="avatar_url" v-lazy="avatar_url" alt="Аватар" height="100px" width="100px" />
    <img v-else
      src="https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg"
      alt="Аватар" height="100px" width="100px" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();
const avatar_url = computed(() => userStore.avatar_url);
</script>

<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>