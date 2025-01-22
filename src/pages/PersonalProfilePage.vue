<template>
  <section>
    <AvatarUploader />
    <EditableField 
      label="Никнейм" 
      :value="userData.username" 
      inputType="text" 
      name="username" 
      :error="error"
      @save="updateProfileField('username', $event)"
    />
    <EditableField 
      label="Дата рождения" 
      :value="formattedBirthdate" 
      inputType="date" 
      name="birthdate" 
      :error="error"
      @save="updateProfileField('birthdate', $event)"
    />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import AvatarUploader from '../components/AvatarUploader.vue';
import EditableField from '../components/EditableField.vue';

const userStore = useUser();
const error = ref('');

// Получаем данные пользователя
const userData = computed(() => userStore.user || {});
const formattedBirthdate = computed(() => {
  if (!userData.value.birthdate) return '';
  return new Date(userData.value.birthdate).toISOString().split('T')[0];
});

// Универсальный метод обновления полей
const updateProfileField = async (field, newValue) => {
  try {
    error.value = '';
    await userStore.updateProfile({ [field]: newValue });
  } catch (err) {
    error.value = err.message || 'Ошибка при обновлении данных';
    console.error('Update error:', err);
  }
};
</script>

<style lang="scss" scoped>
/* Ваши стили */
</style>