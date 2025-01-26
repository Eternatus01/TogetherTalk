<template>
    <section>
        <h1>Профиль пользователя: </h1>
        <div>
            <Avatar :userId="user_id" />
            <div>
                Никнейм: {{ username }}
            </div>
            <div>
                Почта: {{ email }}
            </div>
        </div>
        <userPosts v-if="user_id" :userId="user_id" />
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUser } from '../stores/userStore/user';
import Avatar from '../components/Avatar.vue'
import UserPosts from '../components/UserPosts.vue';

const user = useUser();
const username = ref('');
const email = ref('');
const imageUrl = ref('');
const user_id = ref('');

const saveUserToUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('username', username.value);
    window.history.pushState({}, '', url.href);
    getUserFromUrl()
};

const getUserFromUrl = async () => {
    const url = window.location;
    const username1 = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
    const data = await user.getUserByUsername(username1)
    if (username1) {
        username.value = username1;
        email.value = data.email;
        imageUrl.value = data.avatar_url;
        user_id.value = data.id
        console.log(user_id.value)
    }
};


// вызов функций при загрузке страницы
onMounted(() => {
    saveUserToUrl();
});
</script>

<style lang="scss" scoped>
.avatar {
    border-radius: 50%;
}
</style>