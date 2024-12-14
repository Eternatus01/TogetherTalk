import { defineStore } from 'pinia';
import supabase from '../../service/SupeBase';
import { ref } from 'vue';
import { useErrorsUser  } from './errors';
import { useRouter } from 'vue-router';

export const useUser = defineStore('user', () => {
  const errors = useErrorsUser ();
  const router = useRouter();
  const email = ref('');
  const user = ref(null); // Храним состояние пользователя

  const getUser  = async () => {
    const { data: { user: supabaseUser  } } = await supabase.auth.getUser ();

    if (!supabaseUser ) {
      email.value = '';
      user.value = null; // Обновляем состояние пользователя
      return;
    }
    email.value = supabaseUser.email;
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email.value);

    if (error) {
      errors.setErrors("Пользователь не найден");
      user.value = null; // Обновляем состояние пользователя
      return;
    }
    user.value = data[0]; // Обновляем состояние пользователя
    return user.value;
  };

  const logout = async () => {
    email.value = '';
    await supabase.auth.signOut();
    user.value = null; // Обновляем состояние пользователя
    router.push('/');
  };

  return { getUser , logout, user }; // Возвращаем состояние пользователя
});