<template>
  <div class="form">
    <input type="text" id="username" v-model="username" placeholder="Имя пользователя" maxlength="15" />
    <input type="email" id="email" v-model="email" placeholder="Почта" maxlength="25" />
    <input type="password" id="password" v-model="password" placeholder="Пароль" maxlength="20" />
    <button @click="registerUser" class="form__btn">Зарегистрироваться</button>
    <pre>{{ errorMessages }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserRegister } from '../stores/userStore/register';

const register = useUserRegister();
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
