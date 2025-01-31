<template>
    <div class="postView_bg" @click="togglePostView(props.post.id)">
        <div class="postView container" @click.stop>
            <div class="postView_close" @click="togglePostView(props.post.id)">×</div>
            <div class="postView_inner">
                <Post :post="post" :index="index" :posts="posts" :full="true" />
                <CommentsList :post="post" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';
import CommentsList from './CommentsList.vue';
import Post from './Post.vue';

const props = defineProps({
    post: Object,
    index: Number,
    expands: Array,
    posts: Array,
    togglePostView: Function,
});

// Блокировка скролла при монтировании
onMounted(() => {
    document.body.classList.add('no-scroll');
});

// Разблокировка скролла при удалении
onUnmounted(() => {
    document.body.classList.remove('no-scroll');
});
</script>

<style scoped>
.postView_bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.postView {
    position: relative;
    background: white;
    padding: 2rem;
    max-width: 90%;
    max-height: 90vh;
    max-width: 80vw;
    border-radius: 8px;
    overflow-y: auto;
}

.postView_close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 2rem;
    cursor: pointer;
    transition: 0.3s;
    color: black;
}

.postView_close:hover {
    color: #666;
}

.postView_inner {
    display: flex;
}
</style>