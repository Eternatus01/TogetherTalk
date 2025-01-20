<template>
    <div>
        <input 
            :value="modelValue" 
            @input="$emit('update:modelValue', $event.target.value)"
            placeholder="Введите сообщение" 
            @keydown.enter="$emit('send')" 
        />
        <button @click="$emit('send')">Отправить</button>
    </div>
</template>

<script setup>
defineProps({
    modelValue: String
});

defineEmits(['update:modelValue', 'send']);
</script>