<template>
  <section class="setting">
    <router-link :to="`/profile/${userData.username}`"><span class="material-icons">назад в профиль</span></router-link>
    <AvatarUploader :size="50" />
    <EditableField label="Никнейм" :value="userData.username" inputType="text" name="username" :error="error"
      @save="changeUserStore.changeUsername($event)" />
    <EditableField label="Дата рождения" :value="formattedBirthdate" inputType="date" name="birthdate" :error="error"
      @save="updateProfileField('birthdate', $event)" />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUser } from '../stores/userStore/user';
import AvatarUploader from '../components/AvatarUploader.vue';
import EditableField from '../components/EditableField.vue';
import { useChangeUser } from '../stores/userStore/changeUser';

const userStore = useUser();
const changeUserStore = useChangeUser()
const userData = computed(() => userStore.user || {});
const error = ref('');

const formattedBirthdate = computed(() => {
  if (!userData.value.birthdate) return '';
  return new Date(userData.value.birthdate).toISOString().split('T')[0];
});
</script>

<style lang="scss" scoped>
.loading {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.error {
  color: #ff4444;
  padding: 1rem;
  text-align: center;
}
</style>