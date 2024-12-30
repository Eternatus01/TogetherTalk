<template>
    <section>
        <h1>Профиль пользователя: </h1>
        <div>
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


const route = useRoute();
const user = useUser();
const username = ref('');
const email = ref('');

const getUser = async () => {
    const res = await user.getUsers(route.params.username);
    if (!res) return;
    username.value = res[0].username;
    email.value = res[0].email;
};

onMounted(getUser);
</script>

<style lang="scss" scoped></style>