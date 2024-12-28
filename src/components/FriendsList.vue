<template>
  <div>
    <h2>Друзья</h2>
    <ul>
      <li v-if="friends.length === 0">Список друзей пуст</li>
      <li v-for="friend in friends" :key="friend">
        {{ friend }}
        <button>Написать сообщение</button>
        <button>Профиль</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  friends: Array,
});
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #ccc;
}
</style>
