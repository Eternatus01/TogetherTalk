<template>
  <div class="container">
    <input
      type="text"
      id="username"
      v-model="username"
      placeholder="Username"
    />
    <input type="email" id="email" v-model="email" placeholder="Email" />
    <input
      type="password"
      id="password"
      v-model="password"
      placeholder="Password"
    />
    <button @click="registerUser">Sign Up</button>
    <button @click="userStore.getUser">user</button>
    <pre>{{ errorMessages }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserRegister } from '../stores/userStore/register';
import { useUser } from '../stores/userStore/user';

const register = useUserRegister();
const userStore = useUser();
const email = ref('');
const password = ref('');
const username = ref('');

const registerUser = () => {
  register.email = email.value;
  register.password = password.value;
  register.username = username.value;
  register.registerUser();
};

const errorMessages = ref(register.errorMessages);
</script>

<style lang="scss" scoped></style>
