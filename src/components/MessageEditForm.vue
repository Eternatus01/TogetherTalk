<template>
    <div class="edit-form">
        <input 
            :value="editedContent" 
            @input="$emit('update-content', $event.target.value)"
            placeholder="Редактировать сообщение"
            @keydown.enter="$emit('save')"
        />
        <button @click="$emit('save')">Сохранить</button>
        <button @click="$emit('cancel')">Отмена</button>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    message: Object,
    editedContent: String
});

const emit = defineEmits(['save', 'cancel', 'update-content']);
</script>