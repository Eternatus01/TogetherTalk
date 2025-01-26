import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supabase from '../../service/SupaBase';
import { useUser } from '../userStore/user';

export const usePost = defineStore('posts', () => {
  // State
  const posts = ref([]);
  const userPosts = ref({});
  const lastFetch = ref(null);
  const cacheDuration = 5 * 60 * 1000;
  const userStore = useUser();
  const username = computed(() => userStore.user?.username);

  // Getters
  const sortedPosts = computed(() => {
    return [...posts.value].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  });

  const getUserPosts = computed(() => (userId) => {
    return userPosts.value[userId]?.posts || [];
  });

  // Actions
  const validatePosts = (posts) => {
    return posts.filter(
      (post) =>
        post?.id &&
        post?.user_id &&
        post?.title &&
        post?.text &&
        post?.created_at
    );
  };

  const addLike = async (post) => {
    try {
      if (post.like.includes(username.value)) {
        const currentLissLike = post.like.filter((f) => f !== username.value);

        const { error } = await supabase
          .from('posts')
          .update({ like: currentLissLike })
          .eq('id', post.id);
      } else {
        const newLikes = [...post.like, username.value];

        const { error } = await supabase
          .from('posts')
          .update({ like: newLikes })
          .eq('id', post.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async (options = {}) => {
    try {
      const { page = 1, limit = 10, forceRefresh = false } = options;

      if (
        !forceRefresh &&
        lastFetch.value &&
        Date.now() - lastFetch.value < cacheDuration
      ) {
        return sortedPosts.value;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      posts.value = data;
      lastFetch.value = Date.now();

      console.log('posts user upload');
      const validated = validatePosts(data);
      return validated;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  const fetchUserPosts = async (userId, options = {}) => {
    try {
      const { forceRefresh = false } = options;
      if (!userId) throw new Error('User ID is required');

      if (
        !forceRefresh &&
        userPosts.value[userId]?.lastFetch &&
        Date.now() - userPosts.value[userId].lastFetch < cacheDuration
      ) {
        return userPosts.value[userId].posts;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validated = validatePosts(data);
      userPosts.value[userId] = {
        posts: validated,
        lastFetch: Date.now(),
      };
      return validated;
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      throw error;
    }
  };

  const createPost = async (postData) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select('*')
        .single();

      if (error) throw error;

      // Обновляем общий список и посты пользователя
      posts.value = [data, ...posts.value];

      if (userPosts.value[data.user_id]) {
        userPosts.value[data.user_id].posts = [
          data,
          ...userPosts.value[data.user_id].posts,
        ];
      } else {
        userPosts.value[data.user_id] = {
          posts: [data],
          lastFetch: Date.now(),
        };
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const reset = () => {
    posts.value = [];
    userPosts.value = {};
    lastFetch.value = null;
  };

  return {
    // State
    posts,
    userPosts,
    lastFetch,

    // Getters
    sortedPosts,
    getUserPosts,

    // Actions
    fetchPosts,
    fetchUserPosts,
    createPost,
    reset,
    addLike,
  };
});
