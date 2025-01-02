<template>
  <div>
    <friends-list :friends="friends" />
    <user-search v-model:search="search" :search="search" :users="users" :loadUsers="loadUsers" />
    <user-list :users="users" :addFriend="addFriend" :removeFriend="removeFriend" :isFriend="isFriend"
      :notices="notices"/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUser } from '../stores/userStore/user';
import { useFriend } from '../stores/userStore/friend';
import FriendsList from '../components/FriendsList.vue';
import UserSearch from '../components/UserSearch.vue';
import UserList from '../components/UserList.vue';
import { useNotice } from '../stores/userStore/notification';

const userStore = useUser();
const friendStore = useFriend();
const noticeStore = useNotice();
const friends = ref([]);
const users = ref([]);
const user = ref();
const search = ref('');
const notices = ref([]);

// Загружаем пользователей и друзей
const loadUsers = async () => {
  console.log(search.value);
  user.value = await userStore.getUser();
  users.value = await userStore.getUsers(search.value);
};

// Загружаем друзей
const loadFriends = async () => {
  friends.value = await friendStore.getFriends(user.value.id);
};

const loadNotices = async () => {
  await loadUsers();
  notices.value = await noticeStore.getNotices(user.value.id);
};

// Проверяем, является ли пользователь другом
const isFriend = (id_friend) => {
  return friends.value.some((friend) => friend.id === id_friend);
};

// Добавляем друг
const addFriend = async (friend) => {
  await noticeStore.addNotice(user.value.id, friend.id, `Пользователь ${user.value.username} хочет добавить вас в друзья.`, 'addFriend');
  await noticeStore.addNotice(friend.id, user.value.id, `Отправлена заявка ${friend.username} `, 'sentFriend');
  await loadNotices();
};

// Удаляем друга
const removeFriend = async (friend) => {
  await friendStore.removeFriend(user.value.id, friend.id);
  await loadFriends();
};

onMounted(loadNotices);
</script>