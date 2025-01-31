<template>
  <section>
    <div v-for="(post, index) in posts" :key="post.id" class="post">
      <Post :post="post" :index="index" :posts="posts" />
      <button @click="togglePostView(post.id)">Комментарии</button>
      <PostView v-if="expandedPosts[post.id]" :post="post" :index="index" :posts="posts"
        :togglePostView="() => togglePostView(post.id)" />
    </div>
  </section>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted } from 'vue';
import supabase from '../service/SupaBase';
import PostView from './PostView.vue';
import Post from './Post.vue';

const props = defineProps({
  posts: Array,
});

const expandedPosts = ref({});
const full = ref(false)

const togglePostView = (postId) => {
  expandedPosts.value[postId] = !expandedPosts.value[postId];
  full.value = !full.value
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