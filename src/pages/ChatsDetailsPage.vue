<template>
    <div class="content">
        <MessagesList :messages="formattedMessages" :usernames="usernames" :avatars="avatars" :user="user"
            :editing-message-id="state.editingMessageId" :edited-content="state.editedContent" @scroll="handleScroll"
            @start-edit="startEdit" @save-edit="saveEditedMessage" @cancel-edit="cancelEdit"
            @delete-message="deleteMessage" @update:edited-content="updateEditedContent" />
        <MessageInput v-model="newMessage" @send="sendMessage" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useUser } from '../stores/userStore/user';
import { debounce } from 'lodash';

import MessagesList from '../components/MessagesList.vue';
import MessageInput from '../components/MessageInput.vue';

dayjs.extend(utc);
dayjs.extend(timezone);

const route = useRoute();
const userStore = useUser();
const chatId = route.params.id;
const messages = ref([]);
const newMessage = ref('');
const usernames = ref({});
const user = computed(() => userStore.user)
let messagesChannel = null;
const avatars = ref({});

const state = reactive({
    activeDropdown: null,
    editingMessageId: null,
    editedContent: ''
});

const updateEditedContent = (content) => {
    state.editedContent = content;
};

const saveEditedMessage = async () => {
    try {
        if (!state.editingMessageId) return;

        const { error } = await supabase
            .from('messages')
            .update({ content: state.editedContent })
            .eq('id', state.editingMessageId);

        if (error) throw error;

        await fetchMessages();

        // Сбрасываем состояние редактирования
        state.activeDropdown = null;
        state.editingMessageId = null;
        state.editedContent = '';
    } catch (error) {
        handleError(error);
    }
};

const startEdit = (message) => {
    state.editingMessageId = message.id;
    state.editedContent = message.content;
    state.activeDropdown = null;
};

const cancelEdit = () => {
    state.editingMessageId = null;
    state.editedContent = '';
};


const handleError = (error) => {
    console.error(error.message);
};

// Fetch usernames
const fetchUsernamesAndAvatars = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, avatar_url');
        if (error) throw error;

        for (const user of data) {
            usernames.value[user.id] = user.username;
            avatars.value[user.id] = user.avatar_url;
        }
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

        messages.value = data.reverse() || [];
    } catch (error) {
        handleError(error);
    }
};

// Scroll down to the latest message
const scrollDown = () => {
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

let offset = 15;
const limit = 15;

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
const handleScroll = debounce(async (event) => {
    const { scrollTop } = event.target;
    if (scrollTop === 0) {
        await fetchMoreMessages();
    }
}, 200);

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
        const newMessages = data.filter(msg => !messages.value.find(m => m.id === msg.id));
        messages.value = [...messages.value, ...newMessages];
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
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    const index = messages.value.findIndex(msg => msg.id === payload.new.id);
                    if (index !== -1) {
                        messages.value[index] = payload.new;
                    }
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
            messages.value = messages.value.filter(msg => msg.id !== messageId);
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
            if (error) {
                throw error;
            }
        } else {
            throw new Error('Вы не можете удалить это сообщение');
        }
    } catch (error) {
        handleError(error);
    }
};

// Computed property for formatted messages
const formattedMessages = computed(() => {
    if (!messages.value) return [];
    return messages.value.map(message => ({
        ...message,
        formattedTime: convertTimestampToLocalTime(message.created_at)
    }));
});

// Lifecycle hooks
onMounted(async () => {
    await fetchMessages();
    scrollDown();
    subscribeToMessages();
    await fetchUsernamesAndAvatars();
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