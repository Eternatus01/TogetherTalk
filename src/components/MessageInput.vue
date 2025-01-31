<template>
  <div class="message-input">

    <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" placeholder="Введите сообщение"
      @keydown.enter="handleSend" />
    <input type="file" ref="fileInput" accept="image/*" @change="handleFileSelect" hidden />
    <button @click="triggerFileInput" class="file-button">📷</button>
    <button class="button" @click="handleSend">Отправить</button>

    <div v-if="selectedFile" class="preview-container">
      <img :src="previewUrl" class="image-preview" />
      <button @click="removeImage" class="remove-image-button">×</button>
    </div>

  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import supabase from '../service/SupaBase';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue', 'send']);

const selectedFile = ref(null);
const previewUrl = ref(null);
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Максимальный размер файла - 5MB');
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const removeImage = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  fileInput.value.value = '';
};

const handleSend = async () => {
  try {
    let imageUrl = null;

    // Если есть выбранный файл
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Загрузка файла в Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat_images')
        .upload(`images/${fileName}`, selectedFile.value);

      if (error) throw error;

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('chat_images')
        .getPublicUrl(data.path);

      imageUrl = urlData.publicUrl;
    }

    // Эмитим событие отправки
    emit('send', {
      text: props.modelValue,
      imageUrl: imageUrl
    });

    // Сбрасываем состояние
    selectedFile.value = null;
    previewUrl.value = null;
    fileInput.value.value = '';
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    alert('Ошибка при отправке изображения');
  }
};
</script>

<style scoped>
.message-input {
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.file-button {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.preview-container {
  position: relative;
  margin-top: 0.5rem;
}

.image-preview {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  border: 2px solid #ddd;
}

.remove-image-button {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
}
</style>