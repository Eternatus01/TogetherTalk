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
    const { data: currentData } = await supabase
      .from('users')
      .select('friends')
      .eq('id', id_user)
      .single();

    const { data: friend_username } = await supabase
      .from('users')
      .select('username')
      .eq('id', id_friend)
      .single();

    const currentFriends = Array.isArray(currentData.friends) ? currentData.friends : [];

    const updatedFriends = [
      ...currentFriends,
      { id: id_friend, username: friend_username.username }
    ];

    const { error } = await supabase
      .from('users')
      .update({ friends: updatedFriends })
      .eq('id', id_user);

    if (error) {
      console.error('Error adding friend:', error);
    } else {
      await getFriends(id_user);
    }
  };

  const removeFriend = async (id_user, id_friend) => {
    // Удаляем друга у текущего пользователя
    const { data: currentUserData } = await supabase
      .from('users')
      .select('friends')
      .eq('id', id_user)
      .single();
  
    const updatedFriendsCurrentUser = currentUserData.friends.filter((f) => f.id !== id_friend);
  
    const { error: errorCurrentUser  } = await supabase
      .from('users')
      .update({ friends: updatedFriendsCurrentUser  })
      .eq('id', id_user);
  
    if (errorCurrentUser ) {
      console.error('Error removing friend from current user:', errorCurrentUser );
      return;
    }
  
    // Удаляем текущего пользователя у друга
    const { data: friendData } = await supabase
      .from('users')
      .select('friends')
      .eq('id', id_friend)
      .single();
  
    const updatedFriendsFriend = friendData.friends.filter((f) => f.id !== id_user);
  
    const { error: errorFriend } = await supabase
      .from('users')
      .update({ friends: updatedFriendsFriend })
      .eq('id', id_friend);
  
    if (errorFriend) {
      console.error('Error removing current user from friend:', errorFriend);
      return;
    }
  
    // Обновляем список друзей текущего пользователя
    await getFriends(id_user);
  };

  return { getFriends, addFriend, removeFriend, friends };
});
