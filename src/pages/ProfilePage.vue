<template>
    <section>
        <h1>Профиль пользователя: </h1>
        <div>
            <div>
              <display-avatar :user_id="id_user" v-if="id_user" />
            </div>
            <div>
                Никнейм: {{ username }}
            </div>
            <div>
                Почта: {{ email }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUser } from '../stores/userStore/user';
import DisplayAvatar from '../components/DisplayAvatar.vue';

const route = useRoute();
const user = useUser();
const username = ref('');
const email = ref('');
const imageUrl = ref('');
const id_user = ref('');

const getUser = async () => {
    const res = await user.getUsers(route.params.username);
    if (!res) return;
    username.value = res[0].username;
    email.value = res[0].email;
    imageUrl.value = res[0].avatar_url;
    id_user.value = res[0].id;
};

onMounted(getUser);
</script>

<style lang="scss" scoped>
.avatar {
  border-radius: 50%;
}</style>