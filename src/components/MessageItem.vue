<template>
    <div class="asda">
        <div class="message">
            <Avatar :username="username" />
            <strong>{{ username || 'Загрузка...' }}:</strong>
            <div class="message-content">
                <div v-if="message.content">{{ message.content }}</div>
                <div v-if="message.image_url" class="message-image">
                    <img :src="message.image_url" alt="Прикрепленное изображение" class="uploaded-image"
                        loading="lazy" />
                </div>
            </div>
            <pre>{{ message.formattedTime }}</pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Avatar from './Avatar.vue';

const props = defineProps({
    message: Object,
    username: String,
    avatar: String,
    isOwnMessage: Boolean
});

const emit = defineEmits(['edit', 'delete']);

const isDropdownActive = ref(false);

const toggleDropdown = () => {
    isDropdownActive.value = !isDropdownActive.value;
};
</script>

<style scoped>
* {
    color: white;
}
.asda {
    display: flex;
    gap: 20px;
    align-items: center;
}

.dropdown {
    display: flex;
    gap: 20px;
}

.dropdown-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.uploaded-image {
    max-width: 300px;
    max-height: 300px;
    border-radius: 8px;
    margin-top: 0.5rem;
}

.message-content {
    display: flex;
    flex-direction: column;
}
</style>