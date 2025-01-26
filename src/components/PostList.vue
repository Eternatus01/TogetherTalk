<template>
  <section class="post-list">
    <div v-for="(post, index) in posts" :key="index" class="post">
      <section class="post-header">
        <div class="post-info">
          <div class="post-info-user">
            <DisplayAvatar v-if="personal || post.username === username" />
            <Avatar v-else :userId="post.user_id" />
            <span class="username">{{ post.username }}</span>
          </div>
          <span class="date">{{ formatDate(post.created_at) }}</span>
        </div>
      </section>
      <strong>
        <div class="post-content">{{ post.title }}</div>
      </strong>
      <div class="post-content" :class="expands[index] ? 'expand' : ''">{{ post.text }}</div>
      <div class="post-content" v-show="post.text.length > 300" @click="() => expands[index] = !expands[index]">{{
        expands[index] ? "Свернуть" : "Развернуть" }}</div>
      <section class="likes">
        <p style="color: black;">{{ post.like.length }}</p>
        <button v-if="isAuthenticated" class="btn_like" @click="postStore.addLike(post)">{{ post.like.includes(username) ? '❤️' : '🤍'
          }}</button>
          <div v-else  class="btn_like" style="user-select: none;">❤️</div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import Avatar from './Avatar.vue';
import DisplayAvatar from './DisplayAvatar.vue';
import { usePost } from '../stores/postStore/post';
import supabase from '../service/SupaBase';

const postStore = usePost()
const userStore = useUser()
const isAuthenticated = computed(() => userStore.isAuthenticated)
const username = computed(() => userStore.user?.username || null)

const props = defineProps({
  posts: Array,
  personal: Boolean,
});

const expands = ref(props.posts.map(() => false));

const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

const handlePostUpdate = (update) => {
  const index = props.posts.findIndex(p => p.id === update.new.id)
  if (index !== -1) {
    props.posts[index] = update.new
  } else {
    props.posts.unshift(update.new)
  }
}

let subscription;
onMounted(async () => {
  subscription = supabase
    .channel('public-posts')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'posts'
    }, (payload) => {
      handlePostUpdate(payload)
    })
    .subscribe();
});

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription);
});
</script>

<style scoped>
.likes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn_like {
  border: 0;
  background: none;
  font-size: 32px;
}

.post-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.post {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-info-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  color: black;
}

.date {
  color: #000000;
  font-size: 0.9em;
}

.post-content {
  line-height: 1.5;
  color: black;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 6em;
}

.expand {
  line-height: 1.5;
  color: black;
  white-space: normal;
  /* Изменить на normal */
  overflow: visible;
  /* Изменить на visible */
  text-overflow: clip;
  /* Изменить на clip */
  max-height: none;
  /* Изменить на none */
  display: block;
  /* Изменить на block */
}
</style>