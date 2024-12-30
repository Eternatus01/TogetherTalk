<template>
  <div>
    <h2>Друзья</h2>
    <ul>
      <li v-if="friends.length === 0">Список друзей пуст</li>
      <li v-for="friend in friends" :key="friend">
        {{ friend }}
        <button @click="message">Написать сообщение</button>
        <button @click="routeProfile(friend)">Профиль</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
defineProps({
  friends: Array,
});

const routeProfile = (friend) => {
  router.push({ name: 'Profile', params: { username: friend } });
};

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
