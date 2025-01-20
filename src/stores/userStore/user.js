import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFriend } from './friend';
import { useNotice } from './notification';
import { useChat } from '../chatStore/chat';
import Cookies from 'js-cookie';

export const useUser = defineStore('user', () => {
  const router = useRouter();
  const friends = useFriend();
  const noticeStore = useNotice();
  const chatStore = useChat();
  const email = ref('');
  const user = ref(null);
  const user_id = ref(null);
  const username = ref(null);
  const birthdate = ref(null);
  const avatar_url = ref(null);
  const usernamesCache = ref({});

  const getUser = async () => {
    try {
      const userFromCookie = getUserFromCookie();
      if (userFromCookie) {
        user.value = userFromCookie;
        user_id.value = user.value.id;
        username.value = user.value.username;
        birthdate.value = user.value.birthdate;
        avatar_url.value = user.value.avatar_url;
        return userFromCookie;
      }

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
      if (error) {
        throw error;
      }
      user.value = data[0];
      user_id.value = user.value.id;
      username.value = user.value.username;
      birthdate.value = user.value.birthdate;
      avatar_url.value = user.value.avatar_url;
      setUserCookie(user.value);
      console.log('user upload');
      return user.value;
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
    }
  };

  const logout = async () => {
    try {
      email.value = '';
      await supabase.auth.signOut();
      user.value = null;
      Cookies.remove('user');
      router.push('/');
      await getUser();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const getUserByUsername = async (username) => {
    try {
      const { data } = await supabase
        .from('users')
        .select()
        .eq('username', username);
      return data[0];
    } catch (error) {
      console.error('Ошибка при получении пользователя по имени:', error);
    }
  };

  const getUsers = async (searchTerm = '') => {
    try {
      const query = supabase
        .from('users')
        .select()
        .neq('email', user.value.email);

      if (searchTerm) {
        query.ilike('username', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Ошибка при получении списка пользователей:', error);
      return [];
    }
  };

  const getAvatar = async (userId) => {
    try {
      if (userId === null || userId === '') {
        return 'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg?t=2025-01-08T16%3A42%3A14.026Z';
      }
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();
      if (error) {
        throw error;
      }
      return (
        data?.avatar_url ||
        'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg?t=2025-01-08T16%3A42%3A14.026Z'
      );
    } catch (error) {
      console.error('Ошибка при получении аватара:', error);
    }
  };

  const getUsername = async (userId) => {
    try {
      if (usernamesCache.value[userId]) {
        return usernamesCache.value[userId];
      }

      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();
      usernamesCache.value[userId] = data.username;
      return data.username;
    } catch (error) {
      console.error('Ошибка при получении имени пользователя:', error);
    }
  };

  const changeStatus = async (status) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ status: status })
        .eq('id', user_id.value);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  watch(
    () => user.value,
    (newUser) => {
      if (newUser) {
        noticeStore.getNotices(user_id.value);
        friends.getFriends(user_id.value);
        chatStore.fetchChats();
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
    getUserByUsername,
    username,
    birthdate,
    avatar_url,
    user,
    email,
    user_id,
  };
});

const getUserFromCookie = () => {
  const userCookie = Cookies.get('user');
  if (userCookie) {
    return JSON.parse(userCookie);
  }
  return null;
};

const setUserCookie = (user) => {
  Cookies.set('user', JSON.stringify(user), {
    expires: 30, // сохранить на 30 день
  });
};
