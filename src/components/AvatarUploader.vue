<template>
  <div>
    <display-avatar />
    <p>Статус: {{ status }}</p>
    <div>
      <input type="file" @change="handleFileUpload" accept="image/*" />
      <button @click="uploadAvatar">Загрузить аватар</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import supabase from '../service/SupaBase';
import DisplayAvatar from '../components/DisplayAvatar.vue';
import { useChangeUser } from '../stores/userStore/changeUser';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();
const changeUser = useChangeUser();

const user_id = computed(() => userStore.user_id);
const status = computed(() => userStore.status);

const avatar_url = computed(() => userStore.avatar_url );
const selectedFile = ref(null);

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadAvatar = async () => {
  try {
    if (avatar_url) {
      const oldAvatarPath = `avatars/${user_id.value}/${avatar_url?.value.split('/').pop()}`;
      const { error: deleteError } = await supabase.storage.from('avatars').remove([oldAvatarPath]);
      if (deleteError) {
        throw deleteError;
      }
    }

    const filePath = `avatars/${user_id.value}/${selectedFile.value.name}`;
    const { data, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, selectedFile.value, { upsert: true });
    if (uploadError) {
      throw uploadError;
    }

    const avatarUrl = `https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/${data.path}`;
    await changeUser.updateAvatarUrl(user_id.value, avatarUrl);
    selectedFile.value = null;
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
  }
};
</script>

<style lang="scss" scoped></style>