<template>
    <div>
        <h1>Чаты</h1>
        <ul>
            <li v-if="chats.length === 0">У вас пока нет чатов</li>
            <li v-for="chat in chats" :key="chat.id">
                <router-link :to="`/chats/${chat.id}`">
                    Чат с {{ chat.user1_id === user.id ? chat.user2_name : chat.user1_name }}
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useChat } from '../stores/chatStore/chat';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();
const chats = ref([]);
const chatStore = useChat();
const user = ref(null)

async function fetchChats() {
    await chatStore.fetchChats();
    chats.value = chatStore.chats;
    user.value = userStore.user;
}

onMounted(fetchChats);
</script>

<style scoped>
ul {
    list-style-type: none;
    padding: 0;
}

li {
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
}

a {
    text-decoration: none;
    color: #333;
}

a:hover {
    text-decoration: underline;
}
</style>