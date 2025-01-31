<template>
  <div>
    <h3>Запросы в друзья</h3>
    <ul>
      <li v-for="notice of notices" :key="notice.id">
        <h4>{{ notice.message }}</h4>
        <div class="btns">
          <button v-if="notice.notice_type === 'cancelFriend'" @click="acceptNotice(notice.id)">Ок</button>
          <div v-if="notice.notice_type === 'addFriend'">
            <button @click="acceptFriend(notice.sender_id, notice.id)">Принять</button>
            <button @click="cancelFriend(notice.sender_id, notice.id)">Отклонить</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotice } from '../stores/userStore/notification';
import { useUser } from '../stores/userStore/user';
import { useFriend } from '../stores/userStore/friend';

const noticeStore = useNotice();
const userStore = useUser();
const friendStore = useFriend()

const notices = computed(() => noticeStore.notices);
const user_id = computed(() => userStore.user.id);

const acceptFriend = async (senderId, noticeId) => {
  await noticeStore.removeNotice(user_id.value, noticeId);
  await friendStore.addFriend(user_id.value, senderId);
  await friendStore.addFriend(senderId, user_id.value);
  await friendStore.getFriends(user_id.value)
  await noticeStore.getNotices(user_id.value)
};

const cancelFriend = async (senderId, noticeId) => {
  await noticeStore.removeNotice(user_id.value, noticeId);
  await friendStore.addNotice(user_id.value, senderId, `Пользователь отменил ваш запрос в друзья`, 'cancelFriend');
  await noticeStore.getNotices(user_id.value)
};

const acceptNotice = async (noticeId) => {
  await noticeStore.removeNotice(user_id.value, noticeId);
  await noticeStore.getNotices(user_id.value)
};
</script>

<style lang="scss" scoped>
.btns {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
</style>