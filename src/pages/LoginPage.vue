<template>
  <div class="container">
    <input type="email" id="email" v-model="email" placeholder="Email" />
    <input
      type="password"
      id="password"
      v-model="password"
      placeholder="Password"
    />
    <button @click="login">Войти</button>
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
    await loginStore.loginUser();
    loginStore.email = email.value;
    loginStore.password = password.value;
  } catch (error) {
    console.error(error);
  }
};
</script>
