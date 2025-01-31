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
  const id = computed(() => userStore.user?.id);

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
      if (post.likes.includes(id.value)) {
        const currentLissLike = post.likes.filter((f) => f !== id.value);

        const { error } = await supabase
          .from('posts')
          .update({ likes: currentLissLike })
          .eq('id', post.id);
      } else {
        const newLikes = [...post.likes, id.value];

        const { error } = await supabase
          .from('posts')
          .update({ likes: newLikes })
          .eq('id', post.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addDislike = async (post) => {
    try {
      if (post.dislike.includes(id.value)) {
        const currentDislikes = post.likes.filter((f) => f !== id.value);

        await supabase
          .from('posts')
          .update({ dislike: currentDislikes })
          .eq('id', post.id);
      } else {
        const newDislikes = [...post.dislike, id.value];

        await supabase
          .from('posts')
          .update({ dislike: newDislikes })
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

  const fetchComments = async (id_posts) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id_post', id_posts)
        .order('created_at', { ascending: false });
      return data;
    } catch (e) {
      console.error(e);
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
    fetchComments,
    addDislike,
  };
});
