<template>
    <div>
        <input 
            :value="modelValue" 
            @input="$emit('update:modelValue', $event.target.value)"
            placeholder="Введите сообщение" 
            @keydown.enter="$emit('send')" 
        />
        <button class="button" @click="$emit('send')">Отправить</button>
    </div>
</template>

<script setup>
defineProps({
    modelValue: String
});

defineEmits(['update:modelValue', 'send']);
</script>

<style>
input {
  width: 96%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 1rem;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: #fff;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #3e8e41;
}
</style>