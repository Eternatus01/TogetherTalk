<template>
  <ul>
    <li v-for="user_ in users" :key="user_.id">
      {{ user_.username }}
      <button 
        @click="addFriend(user_)" 
        v-if="!isFriend(user_.id)"
        :disabled="hasSentFriendNotice(user_.id)"
      >
        Добавить в друзья
      </button>
      <button @click="removeFriend(user_)" v-else>Удалить из друзей</button>
    </li>
  </ul>
</template>

<script setup>
import { defineProps, ref } from 'vue';
const props = defineProps({
  users: Array,
  addFriend: Function,
  removeFriend: Function,
  isFriend: Function,
  notices: Array
});

const hasSentFriendNotice = (id) => {
  return props.notices.some(notice => notice.notice_type === 'sentFriend' && notice.sender_id === id);
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