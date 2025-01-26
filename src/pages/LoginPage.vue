<template>
  <div class="form">
    <input type="email" id="email" v-model="email" placeholder="Почта" maxlength="25" />
    <input type="password" id="password" v-model="password" placeholder="Пароль" maxlength="20" />
    <button @click="login" class="form__btn">Войти</button>
    <pre>{{ errorMessages }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserLogin } from '../stores/userStore/login';

const loginStore = useUserLogin();
const email = ref('');
const password = ref('');
const errorMessages = ref(loginStore.errorMessages);

const login = async () => {
  try {
    await loginStore.loginUser(email.value, password.value);
  } catch (error) {
    console.error(error);
  }
};
</script>
