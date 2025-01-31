<template>
  <div>
    <div @click="triggerFileInput" class="avatar-wrapper">
      <display-avatar :size="props.size" />
      <div class="hover-overlay">
        <svg class="camera-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
        </svg>
      </div>
      <input 
        type="file" 
        ref="fileInput"
        @change="handleFileUpload" 
        accept="image/*"
        class="hidden-input"
      />
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
const fileInput = ref(null);

const user_id = computed(() => userStore.user.id);
const avatar_url = computed(() => userStore.avatar_url);
const selectedFile = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    await uploadAvatar();
  }
};

const props = defineProps({
  size: {
    type: Number,
    default: 12
  },
});

const uploadAvatar = async () => {
  try {
    if (!selectedFile.value) return;

    // Удаление старого аватара
    if (avatar_url.value) {
      const oldAvatarPath = `avatars/${user_id.value}/${avatar_url.value.split('/').pop()}`;
      const { error: deleteError } = await supabase.storage.from('avatars').remove([oldAvatarPath]);
      if (deleteError) throw deleteError;
    }

    // Загрузка нового
    const filePath = `avatars/${user_id.value}/${selectedFile.value.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, selectedFile.value, { upsert: true });
    
    if (uploadError) throw uploadError;

    // Обновление URL
    const avatarUrl = `https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/${data.path}`;
    await changeUser.updateAvatarUrl(avatarUrl);
    
    // Сброс выбранного файла
    fileInput.value.value = '';
    selectedFile.value = null;

  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
  }
};
</script>

<style lang="scss" scoped>
.avatar-wrapper {
  cursor: pointer;
  position: relative;
  display: inline-block;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(0.8);
    .hover-overlay {
      opacity: 1;
    }
  }
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.camera-icon {
  width: 40%;
  height: 40%;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2));
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>