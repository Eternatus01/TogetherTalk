<template>
    <div class="">
        <section class="post-info">
            <PostUserInfo :post="props.post" :username="props.post.username || 'Unknown'"
                :date="props.post.created_at" />
        </section>
        <div class="post-content-title"><strong>{{ props.post.title }}</strong></div>
        <div class="post-content" :class="{
            'expand': expands[index] || props.full,
            'full': props.full
        }">{{ props.post.text }}</div>
        <div v-if="!props.full" class="post-content-btn" v-show="props.post.text.length > 300"
            @click="() => expands[index] = !expands[index]">
            {{
                expands[index] ? "Свернуть" : "Развернуть" }}</div>
        <section class="grades">
            <section class="likes">
                <p>{{ props.post.likes.length }}</p>
                <button v-if="isAuthenticated" class="btn_like" @click="postStore.addLike(props.post)">{{
                    props.post.likes.includes(id)
                        ? '❤️' : '🤍'
                    }}</button>
                <div v-else class="btn_like" style="user-select: none;">❤️</div>
            </section>
            <section class="likes">
                <p>{{ props.post.dislike.length }}</p>
                <button v-if="isAuthenticated" class="btn_like" @click="postStore.addDislike(props.post)">{{
                    props.post.dislike.includes(id)
                        ? '👎' : '👎🏻'
                    }}</button>
                <div v-else class="btn_like" style="user-select: none;">👎</div>
            </section>
        </section>
    </div>
</template>

<script setup>
import { defineProps, computed, ref } from 'vue';
import PostUserInfo from './PostUserInfo.vue';
import { useUser } from '../stores/userStore/user';
import { usePost } from '../stores/postStore/post';

const props = defineProps({
    post: Object,
    index: Number,
    expands: Array,
    posts: Array,
    full: {
        type: Boolean,
        default: false
    }
});

const postStore = usePost()
const userStore = useUser()

const isAuthenticated = computed(() => userStore.isAuthenticated)
const id = computed(() => userStore.user?.id || null)
const expands = ref(props.posts.map(() => false));
</script>

<style lang="scss" scoped></style>