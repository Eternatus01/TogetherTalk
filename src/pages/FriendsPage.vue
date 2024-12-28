<template>
  <div>
    <friends-list :friends="friends" />
    <user-search :search="search" :users="users" :loadUsers="loadUsers" />
    <user-list
      :users="users"
      :addFriend="addFriend"
      :removeFriend="removeFriend"
      :isFriend="isFriend"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUser } from '../stores/userStore/user';
import { useFriend } from '../stores/userStore/friend';
import FriendsList from '../components/FriendsList.vue';
import UserSearch from '../components/UserSearch.vue';
import UserList from '../components/UserList.vue';

const userStore = useUser();
const friendStore = useFriend();
const friends = ref([]);
const users = ref([]);
const user = ref();
const search = ref('');

// Загружаем пользователей и друзей
const loadUsers = async () => {
  user.value = await userStore.getUser();
  await loadFriends();
  users.value = await userStore.getUsers(search.value);
};

// Загружаем друзей
const loadFriends = async () => {
  friends.value = await friendStore.getFriends(user.value.email);
};

// Проверяем, является ли пользователь другом
const isFriend = (username) => {
  return friends.value.includes(username);
};

// Добавляем друга
const addFriend = async (friend) => {
  await friendStore.addFriend(user.value.email, friend.username);
  await loadFriends();
};

// Удаляем друга
const removeFriend = async (friend) => {
  await friendStore.removeFriend(user.value.email, friend.username);
  await loadFriends();
};

onMounted(loadUsers);
</script>
