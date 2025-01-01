<template>
    <div>
        <h1>Чат</h1>
        <!-- Отображаем список сообщений -->
        <div v-for="message in messages" :key="message.id">
            <strong>{{ usernames[message.sender_id] || 'Загрузка...' }}:</strong> {{ message.content }}
        </div>
        <!-- Поле ввода нового сообщения -->
        <input v-model="newMessage" placeholder="Введите сообщение" @keydown.enter="sendMessage" />
        <!-- Кнопка отправки сообщения -->
        <button @click="sendMessage">Отправить</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';

const route = useRoute();
const chatId = route.params.id; // Получаем ID чата из URL
const messages = ref([]); // Список сообщений
const newMessage = ref(''); // Текст нового сообщения
const usernames = ref({}); // Хранилище имен пользователей
const user = ref(null); // Текущий пользователь
let messagesChannel = null; // Канал для подписки на новые сообщения

// Получаем текущего пользователя
const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user.value = authUser;
};

// Получаем имя пользователя по его ID
const getUsername = async (userId) => {
    const { data, error } = await supabase.from('users').select('username').eq('id', userId);
    if (error) console.error(error);
    else {
        usernames.value[userId] = data[0].username; // Сохраняем имя в объект
    }
};

// Загружаем сообщения для текущего чата
const fetchMessages = async () => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) console.error(error);
    else {
        messages.value = data;
        // Загружаем имена для всех отправителей сообщений
        data.forEach((message) => {
            getUsername(message.sender_id);
        });
    }
};

// Отправляем новое сообщение
const sendMessage = async () => {
    if (newMessage.value.trim() === '') return; // Проверяем, что сообщение не пустое

    const { error } = await supabase
        .from('messages')
        .insert([{ chat_id: chatId, sender_id: user.value.id, content: newMessage.value }]);

    if (error) console.error(error);
    else {
        newMessage.value = ''; // Очищаем поле ввода
    }
};

// Подписка на новые сообщения в реальном времени
const subscribeToMessages = () => {
    messagesChannel = supabase
        .channel('messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
                messages.value.push(payload.new); // Добавляем новое сообщение в список
                getUsername(payload.new.sender_id); // Загружаем имя отправителя
            }
        )
        .subscribe();
};

// Инициализация компонента
onMounted(async () => {
    await fetchUser(); // Загружаем текущего пользователя
    await fetchMessages(); // Загружаем сообщения
    subscribeToMessages(); // Подписываемся на новые сообщения
});

// Отписка при размонтировании компонента
onUnmounted(() => {
    if (messagesChannel) {
        messagesChannel.unsubscribe(); // Отписываемся от канала
    }
});
</script>

<style scoped>
div {
    margin-bottom: 1rem;
}

input {
    width: 80%;
    padding: 0.5rem;
}

button {
    padding: 0.5rem;
}
</style>