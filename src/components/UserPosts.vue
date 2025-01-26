<template>
    <section class="user-posts">
        <div v-if="loading" class="loading">Загрузка постов...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="post-list">
           <PostList :posts="posts" />
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import { usePost } from '../stores/postStore/post';
import PostList from './PostList.vue';

const props = defineProps({
    userId: {
        type: String,
        required: true
    },
    personal: {
        type: Boolean,
        default: false
    },
    posts: {
        type: Array,
        required: true
    }
});

const postStore = usePost();
const loading = ref(false);
const error = ref('');

</script>

<style scoped>
.user-posts {
    margin-top: 2rem;
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

.post-list {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.post {
    width: 1000px;
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
    overflow: visible;
    text-overflow: clip;
    max-height: none;
    display: block;
}
</style>