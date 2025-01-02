<template>
  <div>
    <input type="search" v-model="search" @input="onSearch" placeholder="Поиск пользователей..." />
    <p v-show="users.length === 0">Пользователи не найдены.</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  search: String,
  users: Array,
  loadUsers: Function,
});

// Определяем событие для передачи search обратно в родительский компонент
const emit = defineEmits(['update:search']);

const search = ref(props.search);

// Отслеживаем изменения search и передаём их в родительский компонент
watch(search, (newValue) => {
  emit('update:search', newValue);
});

const onSearch = () => {
  props.loadUsers();
};
</script>

<style scoped>
input {
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  margin-top: 20px;
}
</style>