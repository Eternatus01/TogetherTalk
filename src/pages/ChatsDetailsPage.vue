<template>
    <div class="content">
        <div class="messages" ref="messagesContainer" @scroll="handleScroll">
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
                        <button @click="toggleDropdown(message.id)" class="message__btn">⋮</button>
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
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const route = useRoute();
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

// Utility function for error handling
const handleError = (error) => {
    console.error(error.message);
};

// Fetch usernames
const fetchUsernames = async () => {
    try {
        const { data, error } = await supabase.from('users').select('id, username');
        if (error) throw error;
        data.forEach(user => {
            usernames.value[user.id] = user.username;
        });
    } catch (error) {
        handleError(error);
    }
};

// Fetch user
const fetchUser  = async () => {
    try {
        const { data: { user: authUser  } } = await supabase.auth.getUser ();
        user.value = authUser ;
    } catch (error) {
        handleError(error);
    }
};

// Fetch messages
const fetchMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .range(0, 14);

        if (error) throw error;

        messages.value = data.reverse();
        await fetchUsernames();
    } catch (error) {
        handleError(error);
    }
};

// Scroll down to the latest message
const scrollDown = () => {
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

let offset = 15; // Initial offset for loading more messages
const limit = 15; // Number of messages to load

// Fetch more messages
const fetchMoreMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        if (data.length > 0) {
            const messagesContainer = document.querySelector('.messages');
            const previousScrollHeight = messagesContainer.scrollHeight;

            // Add new messages to the beginning of the array
            messages.value = [...data.reverse(), ...messages.value];
            offset += limit;

            // Use setTimeout to update scrollTop after DOM changes
            setTimeout(() => {
                const newScrollHeight = messagesContainer.scrollHeight;
                const scrollDiff = newScrollHeight - previousScrollHeight;
                messagesContainer.scrollTop += scrollDiff;
            }, 0);
        } else {
            console.log('Нет больше сообщений для загрузки');
        }
    } catch (error) {
        handleError(error);
    }
};

// Handle scroll event
const handleScroll = async (event) => {
    const { scrollTop } = event.target;
    if (scrollTop === 0) {
        await fetchMoreMessages();
    }
};

// Send message
const sendMessage = async () => {
    try {
        if (newMessage.value.trim() === '') return;
        const { error } = await supabase
            .from('messages')
            .insert([{ chat_id: chatId, sender_id: user.value.id, content: newMessage.value }]);
        if (error) throw error;
        newMessage.value = '';
        await fetchLatestMessages();
        scrollDown();
    } catch (error) {
        handleError(error);
    }
};

// Fetch latest messages
const fetchLatestMessages = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .gt('created_at', fiveMinutesAgo)
            .order('created_at', { ascending: true });
        if (error) throw error;
        messages.value = [...messages.value, ...data];
    } catch (error) {
        handleError(error);
    }
};

// Subscribe to messages
const subscribeToMessages = () => {
    if (!messagesChannel) {
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
    }
};

// Convert timestamp to local time
const convertTimestampToLocalTime = (timestamp, userTimezone = null) => {
    const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
        return dayjs.utc(timestamp).tz(timezone).format('HH:mm');
    } catch (error) {
        handleError(error);
        return dayjs.utc(timestamp).local().format('HH:mm');
    }
};

// Delete message
const deleteMessage = async (messageId) => {
    try {
        const message = messages.value.find((msg) => msg.id === messageId);
        if (message && message.sender_id === user.value.id) {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
            if (error) throw error;
            messages.value = messages.value.filter(msg => msg.id !== messageId);
        } else {
            throw new Error('Вы не можете удалить это сообщение');
        }
    } catch (error) {
        handleError(error);
    }
};

// Computed property for formatted messages
const formattedMessages = computed(() => {
    return messages.value.map(message => ({
        ...message,
        formattedTime: convertTimestampToLocalTime(message.created_at)
    }));
});

// Lifecycle hooks
onMounted(async () => {
    await fetchUser ();
    await fetchUsernames();
    await fetchMessages();
    subscribeToMessages();
    scrollDown();
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

.asda {
    display: flex;
    align-items: center;
    gap: 24px;
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 700px;
}
</style>