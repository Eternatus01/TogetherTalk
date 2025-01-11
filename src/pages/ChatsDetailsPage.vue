<template>
    <div class="content">
        <div class="messages">
            <div v-for="message in formattedMessages" :key="message.id" class="message-container">
                <div v-if="state.editingMessageId === message.id">
                    <input v-model="state.editedContent" placeholder="Редактировать сообщение"
                        @keydown.enter="saveEditedMessage(message)" />
                    <button @click="saveEditedMessage(message)">Сохранить</button>
                    <button @click="cancelEdit">Отмена</button>
                </div>
                <div v-else class="asda">
                    <div class="message">
                        <strong>{{ usernames[message.sender_id] || 'Загрузка...' }}:</strong> {{ message.content }}
                        <pre>{{ message.formattedTime }}</pre>
                    </div>
                    <div v-if="message.sender_id === user?.id" class="dropdown">
                        <button @click="toggleDropdown(message.id)">⋮</button>
                        <div v-if="state.activeDropdown === message.id" class="dropdown-content">
                            <button @click="startEdit(message)">Редактировать</button>
                            <button @click="deleteMessage(message.id)">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <input v-model="newMessage" placeholder="Введите сообщение" @keydown.enter="sendMessage" />
            <button @click="sendMessage">Отправить</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, reactive, computed } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';
import { useChat } from '../stores/chatStore/chat';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const route = useRoute();
const chatStore = useChat();
const chatId = route.params.id;
const messages = ref([]);
const newMessage = ref('');
const usernames = ref({});
const user = ref(null);
let messagesChannel = null;

const state = reactive({
    activeDropdown: null,
    editingMessageId: null,
    editedContent: ''
});

const toggleDropdown = (messageId) => {
    state.activeDropdown = state.activeDropdown === messageId ? null : messageId;
};

const startEdit = (message) => {
    state.editingMessageId = message.id;
    state.editedContent = message.content;
    state.activeDropdown = null;
};

const saveEditedMessage = async (message) => {
    if (state.editedContent.trim() === '') return;

    const { error } = await supabase
        .from('messages')
        .update({ content: state.editedContent })
        .eq('id', message.id);

    if (error) console.error(error);
    else {
        message.content = state.editedContent;
        state.editingMessageId = null;
    }
};

const cancelEdit = () => {
    state.editingMessageId = null;
};

const fetchUsernames = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username');
        if (error) throw error;
        data.forEach(user => {
            usernames.value[user.id] = user.username;
        });
    } catch (error) {
        console.error('Ошибка при загрузке имен пользователей:', error.message);
    }
};

const fetchUser = async () => {
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user.value = authUser;
    } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error.message);
    }
};

const fetchMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        messages.value = data;
        await fetchUsernames();
    } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error.message);
    }
};

const scrollDown = () => {
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const sendMessage = async () => {
    try {
        if (newMessage.value.trim() === '') return;
        const { error } = await supabase
            .from('messages')
            .insert([{ chat_id: chatId, sender_id: user.value.id, content: newMessage.value }]);
        if (error) throw error;
        await fetchMessages();
        scrollDown();
        newMessage.value = '';
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error.message);
    }
};

const subscribeToMessages = () => {
    messagesChannel = supabase
        .channel('messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id = eq.${chatId}`
            },
            (payload) => {
                messages.value.push(payload.new);
            }
        )
        .subscribe();
};

const convertTimestampToLocalTime = (timestamp, userTimezone = null) => {
    const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
        return dayjs.utc(timestamp).tz(timezone).format('HH:mm');
    } catch (error) {
        console.error('Ошибка при конвертации времени:', error);
        return dayjs.utc(timestamp).local().format('HH:mm');
    }
};

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
        console.error('Ошибка при удалении сообщения:', error.message);
    }
};

const formattedMessages = computed(() => {
    return messages.value.map(message => ({
        ...message,
        formattedTime: convertTimestampToLocalTime(message.created_at)
    }));
});

watch(() => route.params.id, (newId) => {
    if (newId) {
        fetchMessages();
    }
});

onMounted(async () => {
    await fetchUser();
    await fetchUsernames();
    await fetchMessages();
    subscribeToMessages();
    scrollDown();
    await chatStore.fetchChats();
});

onUnmounted(() => {
    if (messagesChannel) {
        messagesChannel.unsubscribe();
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
    height: 600px;
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

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 700px;
}
</style>