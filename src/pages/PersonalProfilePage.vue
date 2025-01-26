<template>
  <section class="profile">
    <AvatarUploader />
    <EditableField label="Никнейм" :value="userData.username" inputType="text" name="username" :error="error"
      @save="updateProfileField('username', $event)" />
    <EditableField label="Дата рождения" :value="formattedBirthdate" inputType="date" name="birthdate" :error="error"
      @save="updateProfileField('birthdate', $event)" />
  </section>
  <section>
    <CreatePost />
    <PostList v-if="userStore.user?.id" :posts="userPosts" />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUser } from '../stores/userStore/user';
import { usePost } from '../stores/postStore/post';
import AvatarUploader from '../components/AvatarUploader.vue';
import EditableField from '../components/EditableField.vue';
import CreatePost from '../components/CreatePost.vue';
import PostList from '../components/PostList.vue';

const userStore = useUser();
const postStore = usePost();
const error = ref('');
const loading = ref(false);
const userPosts = computed(() => postStore.getUserPosts(userStore.user?.id));

// Получаем данные пользователя
const userData = computed(() => userStore.user || {});

const formattedBirthdate = computed(() => {
  if (!userData.value.birthdate) return '';
  return new Date(userData.value.birthdate).toISOString().split('T')[0];
});

// Посты

// Загрузка постов
const fetchPosts = async () => {
  try {
    loading.value = true;
    await postStore.fetchUserPosts(userStore.user.id, { forceRefresh: true });
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки постов';
  } finally {
    loading.value = false;
  }
};

watch(() => userStore.user?.id, async () => {
  await fetchPosts();
})

if (userStore.user?.id) {
  onMounted(async () => {
    await fetchPosts();
  });
}
</script>

<style lang="scss" scoped>
.profile {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.error {
  color: #ff4444;
  padding: 1rem;
  text-align: center;
}
</style>