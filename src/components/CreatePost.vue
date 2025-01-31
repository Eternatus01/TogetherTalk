<template>
  <div class="create-post">
    <input type="text" v-model="title" placeholder="Заголовок" class="post-input" maxlength="60">
    <textarea v-model="text" placeholder="Что у вас нового?" rows="3" class="post-textarea" maxlength="1000"></textarea>
    <button @click="createPost" :disabled="!isFormValid || isLoading" class="post-button">
      <span v-if="!isLoading">Опубликовать</span>
      <span v-else>Публикация...</span>
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import { usePost } from '../stores/postStore/post';
import supabase from '../service/SupaBase';

const userStore = useUser();
const postStore = usePost();
const text = ref('');
const title = ref('');
const error = ref('');
const isLoading = ref(false);

const isFormValid = computed(() => {
  return text.value.trim().length > 0;
});

const createPost = async () => {
  try {
    error.value = '';
    isLoading.value = true;

    if (!userStore.user?.id) {
      throw new Error('Пользователь не авторизован');
    }

    const { data, error: supabaseError } = await supabase
      .from('posts')
      .insert({
        user_id: userStore.user.id,
        title: title.value.trim() || 'Без названия',
        username: userStore.user.username,
        text: text.value.trim()
      })
      .select('*')
      .single();

    if (supabaseError) throw supabaseError;

    // Обновляем хранилище
    postStore.posts = [data, ...postStore.posts];

    // Сбрасываем форму
    text.value = '';
    title.value = '';

  } catch (err) {
    error.value = err.message || 'Ошибка при создании поста';
    console.error('Post creation error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>