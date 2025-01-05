<template>
    <div class="messages">
        <div v-for="message in messages" :key="message.id">
            <div v-if="editingMessageId === message.id">
                <input v-model="editedContent" placeholder="Редактировать сообщение"
                    @keydown.enter="saveEditedMessage(message)" />
                <button @click="saveEditedMessage(message)">Сохранить</button>
                <button @click="cancelEdit">Отмена</button>
            </div>
            <div v-else class="asda">
                <div class="message">
                    <strong>{{ usernames[message.sender_id] || 'Загрузка...' }}:</strong> {{ message.content }}
                    <pre>{{ convertTimestampToLocalTime(message.created_at) }}</pre>
                </div>
                <div v-if="message.sender_id === user?.id" class="dropdown">
                    <button @click="toggleDropdown(message.id)">⋮</button>
                    <div v-if="activeDropdown === message.id" class="dropdown-content">
                        <button @click="startEdit(message)">Редактировать</button>
                        <button @click="deleteMessage(message.id)">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input v-model="newMessage" placeholder="Введите сообщение" @keydown.enter="sendMessage" />
    <button @click="sendMessage">Отправить</button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';
import { useChat } from '../stores/chatStore/chat';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
const route = useRoute();
const chatStore = useChat();
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

const scrollDown = () => {
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Функция для отправки нового сообщения
const sendMessage = async () => {
    try {
        if (newMessage.value.trim() === '') return;
        const { error } = await supabase
            .from('messages')
            .insert([{ chat_id: chatId, sender_id: user.value.id, content: newMessage.value }]);
        if (error) throw error;
        newMessage.value = '';
        await fetchMessages()
        scrollDown()
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

function convertTimestampToLocalTime(timestamp, userTimezone = null) {
  // Если часовой пояс не передан, используем локальный пояс устройства
  const timezone = userTimezone || 
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    return dayjs.utc(timestamp).tz(timezone).format('HH:mm')
  } catch (error) {
    console.error('Ошибка при конвертации времени:', error)
    // Возвращаем время в локальном часовом поясе по умолчанию
    return dayjs.utc(timestamp).local().format('HH:mm')
  }
}

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

watch(() => route.params.id, (newId) => {
    if (newId) {
        fetchMessages();
    }
});

// Инициализация компонента
onMounted(async () => {
    subscribeToMessages(); // Подписываемся на новые сообщения
    await fetchUser(); // Загружаем текущего пользователя
    await fetchMessages(); // Загружаем сообщения
    scrollDown()
    await chatStore.fetchChats();
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
    margin-bottom: 0.5rem;
}

input {
    width: 80%;
    padding: 0.5rem;
}

button {
    padding: 0.5rem;
}

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

.messages {
    max-height: 600px;
    overflow-y: auto;
    background-color: #eeeeee;
    border-radius: 24px;
    padding: 24px;
}

.asda {
    display: flex;
    gap: 24px;
}

.message {
    display: flex;
    gap: 8px;
    align-items: center;
    background-color: #c7c7c7;
    padding: 4px 12px;
    border-radius: 12px;
}
</style>