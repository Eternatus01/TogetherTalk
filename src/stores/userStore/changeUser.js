import { defineStore } from 'pinia';
import { useErrorsUser  } from './errors';
import supabase from '../../service/SupeBase';

export const useChangeUser  = defineStore('changeUser ', () => {
  const errors = useErrorsUser ();

  const validateUsername = async (username) => {
    if (username.length < 3) {
      errors.setErrors('Имя пользователя должно содержать не менее 3 символов.');
      return false;
    }

    // Проверка на занятость имени пользователя
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);

    if (error) {
      errors.setErrors('Ошибка при проверке имени пользователя.');
      console.error('Ошибка при проверке имени пользователя:', error);
      return false;
    }

    if (data.length > 0) {
      errors.setErrors('Имя пользователя уже занято.');
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Простой паттерн для проверки email
    if (!emailPattern.test(email)) {
      errors.setErrors('Введите корректный адрес электронной почты.');
      return false;
    }
    return true;
  };

  const changeUsername = async (email, newUsername) => {
    if (!(await validateUsername(newUsername))) {
      return; // Если валидация не прошла, выходим из функции
    }

    const { error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('email', email)
      .select();

    if (error) {
      errors.setErrors('Ошибка при изменении имени пользователя');
      console.error('Ошибка при изменении имени пользователя:', error);
      return;
    }

    errors.clearErrors(); // Очистка ошибок после успешного изменения
  };

  const changeEmail = async (email, newEmail) => {
    if (!validateEmail(newEmail)) {
      return; // Если валидация не прошла, выходим из функции
    }

    const { error } = await supabase.auth.updateUser ({
      email: newEmail,
    });
    if (error) {
      errors.setErrors('Ошибка при изменении почты пользователя');
      console.error('Ошибка при изменении почты пользователя:', error);
      return;
    }

    const { error: baseDateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('email', email)
      .select();

    if (baseDateError) {
      errors.setErrors('Ошибка при изменении почты пользователя');
      console.error('Ошибка при изменении почты пользователя:', baseDateError);
      return;
    }

    errors.clearErrors(); // Очистка ошибок после успешного изменения
  };

  return { changeUsername, changeEmail };
});