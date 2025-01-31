<template>
    <div class="content">
        <MessagesList ref="messagesContainer" :messages="formattedMessages" :usernames="usernames" :avatars="avatars"
            :user="user" :editing-message-id="state.editingMessageId" :edited-content="state.editedContent"
            @scroll="handleScroll" @start-edit="startEdit" @save-edit="saveEditedMessage" @cancel-edit="cancelEdit"
            @delete-message="deleteMessage" @update:edited-content="updateEditedContent" />
        <MessageInput v-model="newMessage" @send="sendMessage" />
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import supabase from '../service/SupaBase';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useUser } from '../stores/userStore/user';
import { debounce } from 'lodash-es';

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
const user = computed(() => userStore.user);
const avatars = ref({});
const messagesContainer = ref(null);
const lastMessageDate = ref(null);
const limit = 15;

const state = reactive({
    activeDropdown: null,
    editingMessageId: null,
    editedContent: ''
});


// Реактивное обновление отредактированного контента
const updateEditedContent = (content) => {
    state.editedContent = content;
};

const loadUserData = async () => {
    try {
        // Получаем все уникальные ID отправителей из сообщений
        const senderIds = [...new Set(messages.value.map(m => m.sender_id))];
        // Загружаем данные только для отсутствующих пользователей
        const { data } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .in('id', senderIds);

        // Обновляем данные пользователей
        data.forEach(user => {
            usernames.value[user.id] = user.username;
            avatars.value[user.id] = user.avatar_url;
        });
    } catch (error) {
        console.error('Ошибка загрузки данных пользователей:', error);
    }
};

// Локальное обновление сообщения
const saveEditedMessage = async () => {
    try {
        if (!state.editingMessageId) return;

        const originalMessage = messages.value.find(m => m.id === state.editingMessageId);
        if (!originalMessage || originalMessage.sender_id !== user.value.id) {
            throw new Error('Unauthorized edit');
        }

        const { error } = await supabase
            .from('messages')
            .update({ content: state.editedContent })
            .eq('id', state.editingMessageId);

        if (error) throw error;

        // Локальное обновление
        messages.value = messages.value.map(msg =>
            msg.id === state.editingMessageId
                ? { ...msg, content: state.editedContent }
                : msg
        );

        resetEditState();
    } catch (error) {
        handleError(error);
    }
};

const startEdit = (message) => {
    if (message.sender_id !== user.value.id) return;
    state.editingMessageId = message.id;
    state.editedContent = message.content;
    state.activeDropdown = null;
};

const cancelEdit = resetEditState;

function resetEditState() {
    state.editingMessageId = null;
    state.editedContent = '';
    state.activeDropdown = null;
}

// Курсорная пагинация
const fetchMessages = async () => {
    try {
        let query = supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (lastMessageDate.value) {
            query = query.lt('created_at', lastMessageDate.value);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data.length > 0) {
            // Сохраняем предыдущую высоту контейнера
            const container = messagesContainer.value.$el;
            const prevScrollHeight = container.scrollHeight;

            // Добавляем новые сообщения в начало
            messages.value = [
                ...data.reverse(),
                ...messages.value
            ];

            // Ждем обновления DOM
            await nextTick();

            // Восстанавливаем позицию прокрутки
            container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
    } catch (error) {
        handleError(error);
    }
};

// Оптимизированная подписка
let messagesChannel = null;
const subscribeToMessages = () => {
    if (!messagesChannel) {
        messagesChannel = supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                handlePayload
            )
            .subscribe(status => {
                console.log('Subscription status:', status);
            });
    }
};

const handlePayload = (payload) => {
    switch (payload.eventType) {
        case 'INSERT':
            if (new Date(payload.new.created_at) > new Date(messages.value[messages.value.length - 1]?.created_at)) {
                messages.value = [...messages.value, payload.new];
            }
            break;

        case 'UPDATE':
            messages.value = messages.value.map(msg =>
                msg.id === payload.new.id ? payload.new : msg
            )
            break;

        case 'DELETE':
            messages.value = messages.value.filter(msg =>
                msg.id !== payload.old.id
            )
            break;
    }
}

// Оптимизированная прокрутка
const scrollDown = () => {
    const messagesContainer = document.querySelector('.messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const handleScroll = debounce((event) => {
    if (event.target.scrollTop === 0) {
        fetchMessages();
    }
}, 200);

// Отправка сообщений с троттлингом
const sendMessage = async (payload) => {
    try {
        const content = payload.text.trim();
        const imageUrl = payload.imageUrl;

        if (!content && !imageUrl) return;

        const tempMessage = {
            id: Date.now().toString(),
            chat_id: chatId,
            sender_id: user.value.id,
            content: content,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            is_temp: true
        };

        messages.value = [...messages.value, tempMessage];

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                sender_id: user.value.id,
                content: content,
                image_url: imageUrl
            }])
            .select('*');

        if (error) throw error;
        scrollDown()
        setTimeout(() => scrollDown(), 800)
        messages.value = messages.value.map(msg =>
            msg.is_temp ? data[0] : msg
        );

        newMessage.value = '';
    } catch (error) {
        messages.value = messages.value.filter(msg => !msg.is_temp);
        handleError(error);
    }
};

// Удаление с проверкой прав
const deleteMessage = async (messageId) => {
    try {
        const message = messages.value.find(m => m.id === messageId);
        if (!message || message.sender_id !== user.value.id) {
            throw new Error('Unauthorized deletion');
        }

        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);

        if (error) throw error;

        messages.value = messages.value.filter(m => m.id !== messageId);
    } catch (error) {
        handleError(error);
    }
};

// Форматирование времени (оригинальная реализация)
const convertTimestampToLocalTime = (timestamp) => {
    try {
        return dayjs.utc(timestamp).local().format('HH:mm');
    } catch (error) {
        console.error('Time conversion error:', error);
        return dayjs(timestamp).format('HH:mm');
    }
};

const formattedMessages = computed(() =>
    messages.value.map(msg => ({
        ...msg,
        formattedTime: convertTimestampToLocalTime(msg.created_at)
    }))
);

const handleError = (error) => {
    console.error('Error:', error.message);
    // Можно добавить обработку ошибок в UI
};

const lastVisibilityChange = ref(Date.now());

const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
        // Только если прошло больше 30 секунд
        if (Date.now() - lastVisibilityChange.value > 30000) {
            await fetchMessages();
            await loadUserData();
        }
    }
    lastVisibilityChange.value = Date.now();
};

watch(
    () => messages.value,
    async (newMessages) => {
        scrollDown();
        if (newMessages.length > 0) {
            await loadUserData();
        }
    },
    { deep: true }
);

onMounted(async () => {
    try {
        scrollDown();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        await fetchMessages();
        subscribeToMessages();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});

onBeforeUnmount(() => {
    if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 700px;
    padding: 1rem;
    box-sizing: border-box;
}

.dropdown-content {
    position: absolute;
    background-color: var(--bg-color);
    min-width: 120px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    z-index: 100;
}

.dropdown-content button {
    padding: 0.5rem 1rem;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color);
}

.dropdown-content button:hover {
    background-color: var(--hover-bg);
}
</style>