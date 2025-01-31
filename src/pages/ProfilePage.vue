<template>
    <section>
        <section class="profile setting_avatar">
            <div v-if="user" class="settings_icon">
                <router-link to="/settings" v-if="user_id === user.id"><span
                        class="material-icons">⚙️</span></router-link>
            </div>

            <div class="profile-info">
                <Avatar :size="50" :username="usr">
                </Avatar>
                <div class="profile-text">
                    <h2 class="profile-name">{{ usr }}</h2>
                </div>
            </div>
        </section>
        <div v-if="user">
            <section v-if="user_id === user.id" class="create-and-posts">
                <CreatePost />
                <PostList :posts="userPosts" />
            </section>
            <PostList v-else-if="user_id" :posts="userPosts" />
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { usePost } from '../stores/postStore/post';
import { useUser } from '../stores/userStore/user';
import Avatar from '../components/Avatar.vue'
import PostList from '../components/PostList.vue';
import CreatePost from '../components/CreatePost.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUser();
const user = computed(() => userStore.user)
const username = ref(route.params.username);
const usr = ref(username.value)
const email = ref('');
const imageUrl = ref('');
const user_id = ref('');
const error = ref('');
const postStore = usePost();
const loading = ref(false);
const userPosts = computed(() => postStore.getUserPosts(user_id.value));

const saveUserToUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('username', username.value);
    window.history.pushState({}, '', url.href);
    getUserFromUrl()
};

const getUserFromUrl = async () => {
    const url = window.location;
    const username1 = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
    const data = await userStore.getUserByUsername(username.value)

    username.value = username1;
    email.value = data.email;
    imageUrl.value = data.avatar_url;
    user_id.value = data.id

    await fetchPosts();
};

const fetchPosts = async () => {
    try {
        loading.value = true;
        await postStore.fetchUserPosts(user_id.value, { forceRefresh: true });
    } catch (err) {
        error.value = err.message || 'Ошибка загрузки постов';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    saveUserToUrl();
});
</script>

<style lang="scss" scoped>
.avatar {
    border-radius: 50%;
}

.setting_avatar {
    position: relative;
}

.settings_icon {
    position: absolute;
    top: 5%;
    right: 5%;
    font-size: 32px;
}
</style>