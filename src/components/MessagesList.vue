<template>
    <div class="messages" ref="messagesContainer" @scroll="$emit('scroll', $event)">
        <div v-for="(message, index) in messages" :key="index" class="message-container">
            <MessageEditForm 
                v-if="editingMessageId === message.id"
                :message="message"
                :edited-content="editedContent"
                @save="$emit('save-edit', message)"
                @cancel="$emit('cancel-edit')"
                @update-content="updateEditedContent"
            />
            <MessageItem 
                v-else
                :message="message"
                :username="usernames[message.sender_id]"
                :avatar="avatars[message.sender_id]"
                :is-own-message="message.sender_id === user?.id"
                @edit="$emit('start-edit', message)"
                @delete="$emit('delete-message', message.id)"
            />
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, defineExpose, ref } from 'vue';
import MessageItem from './MessageItem.vue';
import MessageEditForm from './MessageEditForm.vue';
const container = ref(null);

const scrollToBottom = () => {
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight;
  }
};

// Добавляем метод для обновления позиции прокрутки при загрузке истории
const adjustScrollPosition = (prevHeight) => {
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight - prevHeight;
  }
};

defineExpose({
  scrollToBottom,
  adjustScrollPosition
});
const props = defineProps({
    messages: Array,
    usernames: Object,
    avatars: Object,
    user: Object,
    editingMessageId: [Number, String],
    editedContent: String
});

const emit = defineEmits([
    'scroll', 
    'start-edit', 
    'save-edit', 
    'cancel-edit', 
    'delete-message',
    'update:edited-content'  // Добавьте это
]);

const updateEditedContent = (content) => {
    emit('update:edited-content', content);
};
</script>

