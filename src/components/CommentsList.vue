<template>
    <div class="comments">
        <CreateComment :post="props.post" />
        <h2>Комментарии</h2>
        <div v-for="comment in comments" :key="comment.id" class="comment">
            <div>
                <PostUserInfo :post="props.post" :username="comment.username" :date="comment.created_at" />
            </div>
            <div class="comment-content">
                {{ comment.content }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted } from 'vue';
import { usePost } from '../stores/postStore/post';
import PostUserInfo from './PostUserInfo.vue';
import CreateComment from './CreateComment.vue';
import supabase from '../service/SupaBase';

const postStore = usePost()
const comments = ref([])
const loading = ref(false)
const error = ref(null)
const props = defineProps({
    post: Object
});

let subscription;
onMounted(async () => {
    try {
        loading.value = true
        comments.value = await postStore.fetchComments(props.post.id)

        subscription = supabase
            .channel('public-comments')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'comments'
            }, async () => {
                comments.value = await postStore.fetchComments(props.post.id)
            })
            .subscribe();
    } catch (e) {
        error.value = 'Не удалось загрузить комментарии'
        console.error(e)
    } finally {
        loading.value = false
    }
})

onUnmounted(() => {
    if (subscription) supabase.removeChannel(subscription);
});
</script>

<style>
.comments {
    display: flex;
    flex-direction: column;
    color: black;
    border-left: 2px solid gray;
    margin-left: 0.8rem;
    padding-left: 0.8rem;
    width: 500px;
    max-height: 750px;
    overflow: auto;
}

.comment-content {
    padding-left: 8px;
}

.comment {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>