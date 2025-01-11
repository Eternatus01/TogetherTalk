<template>
    <img v-lazy="avatarUrl" alt="Аватар" height="100px" width="100px" class="avatar" />
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useUser  } from '../stores/userStore/user';
  
  const { getAvatar } = useUser ();
  const props = defineProps({
    user_id: { type: String, required: true },
    imageUrl: { type: String, required: true }
  });
  
  const avatarUrl = ref('');
  
  const loadAvatar = async () => {
    avatarUrl.value = await getAvatar(props.user_id);
  };
  
  onMounted(() => {
    loadAvatar();
  });

  watch(() => props.imageUrl, loadAvatar);
  </script>
  
  <style lang="scss" scoped>
  .avatar {
    border-radius: 50%;
  }
  </style>