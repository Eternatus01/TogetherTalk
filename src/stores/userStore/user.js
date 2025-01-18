import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFriend } from './friend';
import { useNotice } from './notification';

export const useUser = defineStore('user', () => {
  const router = useRouter();
  const friends = useFriend();
  const noticeStore = useNotice();
  const email = ref('');
  const user = ref(null);
  const user_id = ref(null);
  const status = ref('');
  const username = ref(null);
  const birthdate = ref(null);
  const avatar_url = ref(null);

  const getUser = async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      email.value = '';
      user.value = null;
      return;
    }

    email.value = supabaseUser.email;
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email.value);
    user.value = data[0];
    console.log(user.value);
    user_id.value = user.value.id;
    status.value = user.value.status;
    username.value = user.value.username;
    birthdate.value = user.value.birthdate;
    avatar_url.value = user.value.avatar_url;
    friends.getFriends(user_id.value);
    noticeStore.getNotices(user_id.value);
    console.log('user upload');
    return user.value;
  };

  const logout = async () => {
    email.value = '';
    await supabase.auth.signOut();
    user.value = null;
    router.push('/');
    await getUser();
  };

  const getUsers = async (searchTerm = '') => {
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

  const getAvatar = async (userId) => {
    if (userId === null || userId === '') {
      return 'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg?t=2025-01-08T16%3A42%3A14.026Z';
    }
    const { data, error } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    return (
      data?.avatar_url ||
      'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg?t=2025-01-08T16%3A42%3A14.026Z'
    );
  };

  const getUsername = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();
    if (error) console.error(error);
    return data?.username || 'Неизвестный пользователь';
  };

  const changeStatus = async (status) => {
    const { data, error } = await supabase
      .from('users')
      .update({ status: status })
      .eq('id', user_id.value);
  };

  watch(
    () => user.value,
    (newUser) => {
      if (newUser) {
        noticeStore.getNotices(user_id.value);
        friends.getFriends(user_id.value);
      }
    },
    { immediate: true }
  );

  return {
    getUser,
    logout,
    getUsers,
    getUsername,
    getAvatar,
    changeStatus,
    status,
    username,
    birthdate,
    avatar_url,
    user,
    email,
    user_id
  };
});
