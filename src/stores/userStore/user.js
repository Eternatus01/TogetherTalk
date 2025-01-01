import { defineStore } from 'pinia';
import supabase from '../../service/SupeBase';
import { ref } from 'vue';
import { useErrorsUser } from './errors';
import { useRouter } from 'vue-router';
import { useFriend } from './friend';

export const useUser = defineStore('user', () => {
  const errors = useErrorsUser();
  const router = useRouter();
  const friends = useFriend();
  const email = ref('');
  const user = ref(null);
  const user_id = ref(null);

  const getUser = async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
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
      errors.setErrors('Пользователь не найден');
      user.value = null; // Обновляем состояние пользователя
      return;
    }
    // Загрузка друзей пользователя
    user.value = data[0];
    user_id.value = user.value.id;
    friends.getFriends(user_id.value);
    return user.value;
  };

  const logout = async () => {
    email.value = '';
    await supabase.auth.signOut();
    user.value = null; // Обновляем состояние пользователя
    router.push('/');
  };

  const getUsers = async (searchTerm = '') => {
    await getUser();
    const query = supabase
      .from('users')
      .select()
      .neq('email', user.value.email);

    if (searchTerm) {
      query.ilike('username', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ошибка при получении списка пользователей:', error);
      return [];
    }
    return data;
  };

  return { getUser, logout, user, getUsers };
});
