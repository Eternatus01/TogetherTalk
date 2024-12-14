import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useErrorsUser = defineStore('errorsUser', () => {
  const errorMessages = ref('');

  const getErrors = () => {
    return errorMessages.value;
  };

  const setErrors = (error) => {
    errorMessages.value = error;
  };

  const clearErrors = () => {
    errorMessages.value = '';
  };

  return { getErrors, setErrors, clearErrors };
});
