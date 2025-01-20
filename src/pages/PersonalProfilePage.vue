<template>
  <section>
    <AvatarUploader />
    <EditableField label="Никнейм" :value="username" inputType="text" name="username" :error="error"
      @save="changeUsername" />
    <EditableField label="Дата рождения" :value="birthdate" inputType="date" name="birthdate" :error="error"
      @save="changeBirthdate" />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import { useChangeUser } from '../stores/userStore/changeUser';
import AvatarUploader from '../components/AvatarUploader.vue';
import EditableField from '../components/EditableField.vue';

const userStore = useUser();
const changeUser = useChangeUser();

const user_id = computed(() => userStore.user_id);
const username = computed(() => userStore.username);
const birthdate = computed(() => userStore.birthdate);
const error = ref('');

const changeUsername = async (newUsername) => {
  try {
    await changeUser.changeUsername(username.value, newUsername);
  } catch (err) {
    error.value = err.message;
  }
};

const changeBirthdate = async (newBirthdate) => {
  try {
    await changeUser.changeBirthdate(user_id.value, newBirthdate);
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<style lang="scss" scoped></style>