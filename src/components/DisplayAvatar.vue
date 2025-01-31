<template>
  <div v-if="userStore.user">
    <img class="avatar" v-if="avatar_url" v-lazy="avatar_url" alt="Аватар" :height="size * 4" :width="size * 4" />
    <img v-else
      src="https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg"
      alt="Аватар" class="avatar" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();
const avatar_url = computed(() => userStore.user.avatar_url);

const props = defineProps({
  size: {
    type: Number,
    default: 12
  },
})
</script>