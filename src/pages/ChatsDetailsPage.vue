<template>
    <div>
        <h1>Чат</h1>
        <div v-for="message in messages" :key="message.id">
            <div v-if="editingMessageId === message.id">
                <input v-model="editedContent" placeholder="Редактировать сообщение" />
                <button @click="saveEditedMessage(message)">Сохранить</button>
                <button @click="cancelEdit">Отмена</button>
            </div>

            <div v-else>
                <strong>{{ usernames[message.sender_id] || 'Загрузка...' }}:</strong> {{ message.content }}
                <div v-if="message.sender_id === user?.id" class="dropdown">
                    <button @click="toggleDropdown(message.id)">⋮</button>
                    <div v-if="activeDropdown === message.id" class="dropdown-content">
                        <button @click="startEdit(message)">Редактировать</button>
                        <button @click="deleteMessage(message.id)">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
        <input v-model="newMessage" placeholder="Введите сообщение" @keydown.enter="sendMessage" />
        <button @click="sendMessage">Отправить</button>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';

const route = useRoute();
const chatId = route.params.id;
const messages = ref([]);
const newMessage = ref('');
const usernames = ref({});
const user = ref(null);
let messagesChannel = null;
const activeDropdown = ref(null); // Для управления открытым dropdown
const editingMessageId = ref(null); // ID сообщения, которое редактируется
const editedContent = ref(''); // Текст редактируемого сообщения

// Функция для открытия/закрытия dropdown
const toggleDropdown = (messageId) => {
    activeDropdown.value = activeDropdown.value === messageId ? null : messageId;
};

// Функция для начала редактирования сообщения
const startEdit = (message) => {
    editingMessageId.value = message.id;
    editedContent.value = message.content;
    activeDropdown.value = null; // Закрываем dropdown
};

// Функция для сохранения изменений
const saveEditedMessage = async (message) => {
    if (editedContent.value.trim() === '') return; // Проверяем, что текст не пустой

    const { error } = await supabase
        .from('messages')
        .update({ content: editedContent.value })
        .eq('id', message.id);

    if (error) console.error(error);
    else {
        message.content = editedContent.value; // Обновляем сообщение в списке
        editingMessageId.value = null; // Закрываем режим редактирования
    }
};

// Функция для отмены редактирования
const cancelEdit = () => {
    editingMessageId.value = null;
};

// Функция для загрузки пользователя
const fetchUser = async () => {
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user.value = authUser;
    } catch (error) {
        handleError(error);
    }
};

// Функция для загрузки имени пользователя
const getUsername = async (userId) => {
    try {
        const { data, error } = await supabase.from('users').select('username').eq('id', userId);
        if (error) throw error;
        usernames.value[userId] = data[0].username;
    } catch (error) {
        handleError(error);
    }
};

// Функция для загрузки сообщений
const fetchMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        messages.value = data;
        data.forEach((message) => {
            getUsername(message.sender_id);
        });
    } catch (error) {
        handleError(error);
    }
};

// Функция для отправки нового сообщения
const sendMessage = async () => {
    try {
        if (newMessage.value.trim() === '') return;
        const { error } = await supabase
            .from('messages')
            .insert([{ chat_id: chatId, sender_id: user.value.id, content: newMessage.value }]);
        if (error) throw error;
        newMessage.value = '';
    } catch (error) {
        handleError(error);
    }
};

// Функция для подписки на новые сообщения
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
                messages.value.push(payload.new);
                getUsername(payload.new.sender_id);
            }
        )
        .subscribe();
};

// Функция для удаления сообщения
const deleteMessage = async (messageId) => {
    try {
        const message = messages.value.find((msg) => msg.id === messageId);
        if (message && message.sender_id === user.value.id) {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
            if (error) throw error;
            const index = messages.value.findIndex((msg) => msg.id === messageId);
            if (index !== -1) messages.value.splice(index, 1);
        } else {
            throw new Error('Вы не можете удалить это сообщение');
        }
    } catch (error) {
        handleError(error);
    }
};

// Функция для обработки ошибок
const handleError = (error) => {
    console.error('Произошла ошибка:', error.message);
    // Здесь можно добавить логику для отображения ошибок пользователю
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

/* Стили для dropdown */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    position: absolute;
    background-color: #f9f9f9;
    min-width: 120px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.dropdown-content button {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
}

.dropdown-content button:hover {
    background-color: #ddd;
}
</style>