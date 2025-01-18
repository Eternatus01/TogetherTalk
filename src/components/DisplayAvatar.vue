<template>
  <img v-if="avatar_url" v-lazy="avatar_url" alt="Аватар" height="100px" width="100px" class="avatar" />
  <img v-else src="https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg" alt="Аватар" height="100px" width="100px" class="avatar" />
</template>

<script setup>
import { computed } from 'vue';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();
const avatar_url = computed(() => userStore.avatar_url);
</script>

<style lang="scss" scoped>
.avatar {
  border-radius: 50%;
}
</style>