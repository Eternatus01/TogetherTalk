<template>
    <div class="asda">
        <div class="message">
            <img :src="avatar" alt="" class="avatar" />
            <strong>{{ username || 'Загрузка...' }}:</strong> 
            {{ message.content }}
            <pre>{{ message.formattedTime }}</pre>
        </div>
        <div v-if="isOwnMessage" class="dropdown">
            <button @click="toggleDropdown" class="message__btn">⋮</button>
            <div v-if="isDropdownActive" class="dropdown-content">
                <button @click="$emit('edit')">Редактировать</button>
                <button @click="$emit('delete')">Удалить</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

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
</style>