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
import supabase from '../service/SupaBase';

const chats = ref([]); // Список чатов
const user = ref(null); // Текущий пользователь

// Получаем имя пользователя по его ID
const getUsername = async (userId) => {
    const { data, error } = await supabase.from('users').select('username').eq('id', userId).single();
    if (error) console.error(error);
    return data?.username || 'Неизвестный пользователь';
};

// Загружаем чаты и имена пользователей
const fetchChats = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user.value = authUser;

    if (!user.value) return;

    // Получаем чаты, где текущий пользователь является user1 или user2
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${user.value.id},user2_id.eq.${user.value.id}`);

    if (error) console.error(error);
    else {
        // Добавляем имена пользователей в каждый чат
        for (const chat of data) {
            chat.user1_name = await getUsername(chat.user1_id);
            chat.user2_name = await getUsername(chat.user2_id);
        }
        chats.value = data;
    }
};

// Инициализация
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