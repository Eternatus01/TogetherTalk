import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { ref, watch, computed, reactive } from 'vue';
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

  // Состояние
  const state = reactive({
    currentUser: null,
    email: '',
    username: null,
    birthdate: null,
    avatar_url: null,
    usernamesCache: {},
    session: null,
    avatarsCache: {
      byUserId: {},
      byUsername: {},
    },
  });

  // Геттеры
  const isAuthenticated = computed(() => state.currentUser);
  const userId = computed(() => state.currentUser?.id || null);

  // Общие методы
  const handleError = (error, context = '') => {
    console.error(`[User Store Error] ${context}:`, error);
    throw error;
  };

  const setSessionCookie = (sessionData) => {
    Cookies.set('userSession', JSON.stringify(sessionData), {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  };

  // Действия
  const actions = {
    async fetchUser() {
      try {
        // Проверка куки
        const sessionCookie = Cookies.get('userSession');
        if (sessionCookie) {
          const session = JSON.parse(sessionCookie);
          const { data: userData } = await supabase
            .from('users')
            .select()
            .eq('id', session.userId)
            .single();

          if (userData) {
            this.updateUserState(userData);
            return userData;
          }
        }

        // Получение пользователя из Supabase Auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authUser) return null;

        // Получение данных из таблицы users
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select()
          .eq('email', authUser.email)
          .single();

        if (dbError) throw dbError;

        this.updateUserState(userData);
        setSessionCookie({ userId: userData.id });
        return userData;
      } catch (error) {
        handleError(error, 'fetchUser');
        return null;
      }
    },

    updateUserState(userData) {
      state.currentUser = userData;
      state.email = userData.email;
      state.username = userData.username;
      state.birthdate = userData.birthdate;
      state.avatar_url = userData.avatar_url;
      if (userData?.id) {
        state.avatarsCache.byUserId[userData.id] = userData.avatar_url;
      }
      if (userData?.username) {
        state.avatarsCache.byUsername[userData.username] = userData.avatar_url;
      }
    },

    async logout() {
      try {
        await supabase.auth.signOut();
        state.currentUser = null;
        state.avatarsCache.byUserId = {};
        state.avatarsCache.byUsername = {};
        Cookies.remove('userSession');
        router.push('/');
      } catch (error) {
        handleError(error, 'logout');
      }
    },

    async getUsers(searchTerm = '') {
      try {
        if (!state.currentUser) throw new Error('User not authenticated');

        let query = supabase
          .from('users')
          .select('id, username, avatar_url')
          .neq('id', state.currentUser.id);

        if (searchTerm) {
          query = query.ilike('username', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        data.forEach((user) => {
          state.avatarsCache.byUserId[user.id] = user.avatar_url;
          state.avatarsCache.byUsername[user.username] = user.avatar_url;
        });

        return data;
      } catch (error) {
        handleError(error, 'getUsers');
        return [];
      }
    },

    async getUserByUsername(username) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error, 'getUserByUsername');
        return null;
      }
    },

    async getAvatar(userId) {
      const defaultAvatar =
        'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg';

      try {
        if (!userId) return defaultAvatar;
        // Проверка кэша
        if (state.avatarsCache.byUserId[userId]) {
          return state.avatarsCache.byUserId[userId];
        }

        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        const avatar = error ? defaultAvatar : data.avatar_url || defaultAvatar;

        // Сохраняем в кэш
        state.avatarsCache.byUserId[userId] = avatar;
        if (data?.username) {
          state.avatarsCache.byUsername[data.username] = avatar;
        }

        return avatar;
      } catch (error) {
        return defaultAvatar;
      }
    },

    async getAvatarByUsername(username) {
      const defaultAvatar =
        'https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/avatars/default-avatar-icon-of-social-media-user-vector.jpg';
      try {
        if (!username) return defaultAvatar;
        // Проверка кэша
        if (state.avatarsCache.byUsername[username]) {
          return state.avatarsCache.byUsername[username];
        }

        const { data, error } = await supabase
          .from('users')
          .select('avatar_url, id')
          .eq('username', username)
          .single();


        const avatar = error ? defaultAvatar : data.avatar_url || defaultAvatar;

        // Сохраняем в кэш
        state.avatarsCache.byUsername[username] = avatar;

        if (data?.id) {
          state.avatarsCache.byUserId[data.id] = avatar;
        }

        return avatar;
      } catch (error) {
        return defaultAvatar;
      }
    },

    async getUsername(userId) {
      try {
        if (!userId) return 'Unknown User';
        if (state.usernamesCache[userId]) return state.usernamesCache[userId];

        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .single();

        if (!error && data.username) {
          state.usernamesCache[userId] = data.username;
          return data.username;
        }
        return 'Unknown User';
      } catch (error) {
        return 'Unknown User';
      }
    },

    async updateProfile(updates) {
      try {
        if (!state.currentUser) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', state.currentUser.id)
          .select()
          .single();

        if (error) throw error;

        if (updates.avatar_url) {
          state.avatarsCache.byUserId[state.currentUser.id] =
            updates.avatar_url;
          state.avatarsCache.byUsername[state.currentUser.username] =
            updates.avatar_url;
        }
        this.updateUserState({ ...state.currentUser, ...data });
        return data;
      } catch (error) {
        handleError(error, 'updateProfile');
      }
    },

    async changeStatus(status) {
      try {
        if (!state.currentUser) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('users')
          .update({ status })
          .eq('id', state.currentUser.id);

        if (error) throw error;
      } catch (error) {
        handleError(error, 'changeStatus');
      }
    },
  };

  // Наблюдатели
  watch(
    () => state.currentUser,
    (user) => {
      if (user) {
        noticeStore.getNotices(user.id);
        friends.getFriends(user.id);
        chatStore.fetchChats();
      }
    },
    { immediate: true }
  );

  // Инициализация
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      state.currentUser = null;
      Cookies.remove('userSession');
    }
  });

  return {
    email: computed(() => state.email),
    username: computed(() => state.username),
    birthdate: computed(() => state.birthdate),
    avatar_url: computed(() => state.avatar_url),
    user: computed(() => state.currentUser),
    userId,

    // Геттеры
    isAuthenticated,

    // Действия
    ...actions,
  };
});
