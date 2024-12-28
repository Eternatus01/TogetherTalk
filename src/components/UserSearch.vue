<template>
  <div>
    <input
      type="search"
      v-model="search"
      @input="onSearch"
      placeholder="Поиск пользователей..."
    />
    <p v-if="users.length === 0">Пользователи не найдены.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  search: String,
  users: Array,
  loadUsers: Function,
});

const onSearch = () => {
  props.loadUsers();
};
const search = ref(props.search);
</script>

<style scoped>
input {
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  margin-top: 20px;
}
</style>
