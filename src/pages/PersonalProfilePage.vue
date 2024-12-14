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
          <pre>error: {{ errors.getErrors }}</pre>
        </div>
      </div>
      <div>
        Почта: {{ email }}
        <button @click="showChangeEmail = !showChangeEmail">Изменить</button>
        <div v-if="showChangeEmail">
          <input v-model="newEmail" type="email" name="email" id="" />
          <button @click="changeElmail">Сохранить</button>
          <pre>error: {{ errors.getErrors }}</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useUser } from '../stores/userStore/user';
import { useChangeUser } from '../stores/userStore/changeUser';
import { useErrorsUser } from '../stores/userStore/errors';
import { onMounted, ref } from 'vue';
const user = useUser();
const changeUser = useChangeUser();
const errors = useErrorsUser();
const username = ref('');
const email = ref('');
const newEmail = ref('');
const newUsername = ref('');
const showChangeUsername = ref(false);
const showChangeEmail = ref(false);

const getUser = async () => {
  const res = await user.getUser();
  if (!res) return;
  username.value = res.username;
  email.value = res.email;
};

const changeUsername = async () => {
  try {
    await changeUser.changeUsername(email.value, newUsername.value);
    getUser();
    showChangeUsername.value = false;
    newUsername.value = '';
  } catch (error) {
    console.error(error);
  }
};

const changeElmail = async () => {
  try {
    await changeUser.changeEmail(email.value, newEmail.value);
    getUser();
    showChangeEmail.value = false;
    newEmail.value = '';
  } catch (error) {
    console.error(error);
  }
};

onMounted(getUser);
</script>

<style lang="scss" scoped></style>
