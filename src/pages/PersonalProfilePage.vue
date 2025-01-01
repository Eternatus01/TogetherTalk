<template>
  <section>
    <h1>Персональный профиль</h1>
    <div>
      <div>
        Никнейм: {{ username }}
        <button @click="showChangeUsername = !showChangeUsername">
          Изменить
        </button>
        <div v-if="showChangeUsername">
          <input v-model="newUsername" type="text" name="username" id="" />
          <button @click="changeUsername">Сохранить</button>
        </div>
        <pre style="color: red">{{ error }}</pre>
      </div>
      <div>
        Почта: {{ email }}
        <button @click="showChangeEmail = !showChangeEmail">Изменить</button>
        <div v-if="showChangeEmail">
          <input v-model="newEmail" type="email" name="email" id="" />
          <button @click="changeElmail">Сохранить</button>
        </div>
      </div>
    </div>
    <h3>Запросы в друзья</h3>
    <ul>
      <li v-for="notice of notices" :key="notice.id">
        <h4>{{ notice.message }}</h4>
        <div class="btns">
          <button v-if="notice.notice_type === 'cancelFriend'" @click="acceptNotice(notice.id)">Ок</button>
          <div v-if="notice.notice_type === 'addFriend'">
            <button @click="acceptFriend(notice.sender_id, notice.id, notice.sender_id, notice.recipient_id)">Принять</button>
            <button @click="cancelFriend(notice.sender_id, notice.id)">Отклонить</button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { useUser } from '../stores/userStore/user';
import { useChangeUser } from '../stores/userStore/changeUser';
import { useFriend } from '../stores/userStore/friend';
import { useErrorsUser } from '../stores/userStore/errors';
import { onMounted, ref } from 'vue';
import { useNotice } from '../stores/userStore/notification';

const noticeStore = useNotice();
const notices = ref([]);
const user = useUser();
const changeUser = useChangeUser();
const friendStore = useFriend();
const errors = useErrorsUser();
const username = ref('');
const email = ref('');
const newEmail = ref('');
const newUsername = ref('');
const showChangeUsername = ref(false);
const showChangeEmail = ref(false);
const error = ref('');
const id_user = ref('');

const getUser = async () => {
  error.value = errors.getErrors();
  const res = await user.getUser();
  if (!res) return;
  username.value = res.username;
  email.value = res.email;
  id_user.value = res.id;
};

const changeUsername = async () => {
  try {
    errors.clearErrors();
    await changeUser.changeUsername(username.value, newUsername.value);
    getUser();
    showChangeUsername.value = false;
    newUsername.value = '';
  } catch (error) {
    error.value = errors.getErrors();
    console.error(error);
  }
};

const changeElmail = async () => {
  try {
    errors.clearErrors();
    await changeUser.changeEmail(email.value, newEmail.value);
    getUser();
    showChangeEmail.value = false;
    newEmail.value = '';
  } catch (error) {
    error.value = errors.getErrors();
    console.error(error);
  }
};

const getNotices = async () => {
  await user.getUser();
  const res = await noticeStore.getNotices(id_user.value);
  if (!res) return;
  notices.value = res;
}

const acceptFriend = async (id_senderUsername, id_notice, id_recipient, id_sender) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await noticeStore.removeSentNotice(id_recipient, id_sender);
  await friendStore.addFriend(id_user.value, id_senderUsername);
  await friendStore.addFriend(id_senderUsername, id_user.value);
  await getNotices();
}

const cancelFriend = async (id_senderUsername, id_notice) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await noticeStore.addNotice(id_user.value, id_senderUsername, `${username.value} отменил ваш запрос в друзья`, 'cancelFriend');
  await getNotices();
}

const acceptNotice = async (id_notice) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await getNotices();
}

onMounted(getUser);
onMounted(getNotices);
</script>

<style lang="scss" scoped>
.btns {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
</style>
