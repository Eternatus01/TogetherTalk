<template>
    <div class="home-view">
        <h1>Последние публикации</h1>
        <PostList :posts="sortedPosts" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { usePost } from '../stores/postStore/post';
import PostList from '../components/PostList.vue';
import { useUser } from '../stores/userStore/user';

const postStore = usePost();
const userStore = useUser();
const error = ref('');
const loading = ref(false);
const sortedPosts = computed(() => postStore.posts);

// Загрузка всех постов
const fetchAllPosts = async () => {
    try {
        loading.value = true;
        await postStore.fetchPosts({ forceRefresh: true });
    } catch (err) {
        error.value = err.message || 'Ошибка загрузки постов';
    } finally {
        loading.value = false;
    }
};


if (!userStore.isAuthenticated || userStore.user?.id) {
    onMounted(async () => {
        console.log("123")
        await fetchAllPosts();
    });
}

watch(() => userStore.user?.id, async () => {
    await fetchAllPosts();
})

</script>

<style lang="scss" scoped></style>