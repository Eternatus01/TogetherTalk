import { defineStore } from 'pinia';
import { useErrorsUser } from './errors';
import supabase from '../../service/SupeBase';

export const useChangeUser = defineStore('changeUser', () => {
  const errors = useErrorsUser();
  const changeUsername = async (email, newUsername) => {
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
  };

  const changeEmail = async (email, newEmail) => {
    const { error } = await supabase.auth.updateUser({
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
  };
  return { changeUsername, changeEmail };
});
