<template>
  <div>
    <friends-list :friends="friends" :user="user" />
    <div class="users_search">
      <user-search v-model:search="search" :search="search" :users="users" :loadUsers="loadUsers" />
      <user-list :users="users" :addFriend="addFriend" :removeFriend="removeFriend" :isFriend="isFriend"
        :notices="notices" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import { useFriend } from '../stores/userStore/friend';
import FriendsList from '../components/FriendsList.vue';
import UserSearch from '../components/UserSearch.vue';
import UserList from '../components/UserList.vue';
import { useNotice } from '../stores/userStore/notification';

const userStore = useUser();
const friendStore = useFriend();
const noticeStore = useNotice();
const friends = computed(() => friendStore.friends);
const users = ref([]);
const user = computed(() => userStore.user);
const search = ref('');
const notices = computed(() => noticeStore.notices);

// Загружаем пользователей и друзей
const loadUsers = async () => {
  users.value = await userStore.getUsers(search.value);
};

// Проверяем, является ли пользователь другом1
const isFriend = (id_friend) => {
  return friends.value.some((friend) => friend.id === id_friend);
};

// Добавляем друг
const addFriend = async (friend) => {
  await noticeStore.addNotice(user.value.id, friend.id, `Пользователь ${user.value.username} хочет добавить вас в друзья.`, 'addFriend');
  await noticeStore.addNotice(friend.id, user.value.id, `Отправлена заявка ${friend.username} `, 'sentFriend');
  await loadUsers();
  await friendStore.getFriends(user.value.id)
  await noticeStore.getNotices(user.value.id)
};

// Удаляем друга
const removeFriend = async (friend) => {
  await friendStore.removeFriend(user.value.id, friend.id);
  await loadUsers();
};
</script>