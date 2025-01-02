import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { ref } from 'vue';

export const useFriend = defineStore('friend', () => {
  const friends = ref([]);

  const getFriends = async (id_user) => {
    const { data, error } = await supabase
      .from('users')
      .select('friends')
      .eq('id', id_user)
      .single();

    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }

    if (data && Array.isArray(data.friends)) {
      friends.value = data.friends;
    } else {
      friends.value = [];
    }
    return friends.value;
  };

  const addFriend = async (id_user, id_friend) => {
    try {
      const { data: friend_username } = await supabase
        .from('users')
        .select('username')
        .eq('id', id_friend)
        .single();

      const currentFriends = Array.isArray(friends.value) ? friends.value : [];

      const updatedFriends = [
        ...currentFriends,
        { id: id_friend, username: friend_username.username },
      ];

      await supabase
        .from('users')
        .update({ friends: updatedFriends })
        .eq('id', id_user);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const removeFriend = async (id_user, id_friend) => {
    try {
      const updatedFriendsCurrentUser = friends.value.filter(
        (f) => f.id !== id_friend
      );

      const { error: errorCurrentUser } = await supabase
        .from('users')
        .update({ friends: updatedFriendsCurrentUser })
        .eq('id', id_user);

      if (errorCurrentUser) {
        throw new Error(
          `Ошибка при удалении друга у текущего пользователя: ${errorCurrentUser.message}`
        );
      }

      const { data: friendData, error: fetchFriendError } = await supabase
        .from('users')
        .select('friends')
        .eq('id', id_friend)
        .single();

      if (fetchFriendError) {
        throw new Error(
          `Ошибка при получении данных друга: ${fetchFriendError.message}`
        );
      }

      const updatedFriendsFriend = friendData.friends.filter(
        (f) => f.id !== id_user
      );

      const { error: errorFriend } = await supabase
        .from('users')
        .update({ friends: updatedFriendsFriend })
        .eq('id', id_friend);

      if (errorFriend) {
        throw new Error(
          `Ошибка при удалении текущего пользователя у друга: ${errorFriend.message}`
        );
      }

      console.log('Друг успешно удален у обоих пользователей.');
    } catch (error) {
      console.error('Ошибка в функции removeFriend:', error.message);
    }
  };

  return { getFriends, addFriend, removeFriend, friends };
});
