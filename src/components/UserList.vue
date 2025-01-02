<template>
  <ul>
    <li v-for="user_ in users" :key="user_.id">
      {{ user_.username }}
      <button 
        @click="addFriend(user_)" 
        v-if="!isFriend(user_.id)"
        :disabled="hasSentFriendNotice[user_.id]"
      >
        Добавить в друзья
      </button>
      <button @click="removeFriend(user_)" v-else>Удалить из друзей</button>
    </li>
  </ul>
</template>

<script setup>
import { defineProps, computed } from 'vue';
const props = defineProps({
  users: Array,
  addFriend: Function,
  removeFriend: Function,
  isFriend: Function,
  notices: {
    type: Array,
    default: () => [], // Значение по умолчанию — пустой массив
  },
});

const hasSentFriendNotice = computed(() => {
  const notices = {};
  props.notices.forEach(notice => {
    notices[notice.sender_id] = notice.notice_type === 'sentFriend';
  });
  return notices;
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