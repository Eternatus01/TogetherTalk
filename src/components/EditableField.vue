<template>
    <div>
      <p>{{ label }}: {{ !value ? "Неизвестно" : value }}</p>
      <button @click="showEdit = !showEdit">{{ !value ? "Добавить" : "Изменить" }}</button>
      <div v-if="showEdit">
        <input v-model="newValue" :type="inputType" :name="name" />
        <button @click="save">Сохранить</button>
      </div>
      <pre>{{ error }}</pre>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    label: String,
    value: String,
    inputType: String,
    name: String,
    error: String,
  });
  
  const emit = defineEmits(['save']);
  
  const showEdit = ref(false);
  const newValue = ref('');
  
  const save = () => {
    emit('save', newValue.value);
    showEdit.value = false;
    newValue.value = '';
  };
  </script>
  
  <style lang="scss" scoped>
  * {
    color: black;
  }
  </style>