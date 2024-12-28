import { defineStore } from 'pinia';
import supabase from '../../service/SupeBase';
import { ref } from 'vue';

export const useFriend = defineStore('friend', () => {
  const friends = ref([]);

  const getFriends = async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('friends')
      .eq('email', email)
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

  const addFriend = async (email, friend) => {
    const currentData = friends.value;

    // Добавляем нового друга в массив
    const updatedFriends =
      currentData.length > 0 ? [...currentData, friend] : [friend];

    console.log(updatedFriends);
    const { error } = await supabase
      .from('users')
      .update({ friends: updatedFriends })
      .eq('email', email);

    if (error) {
      console.error('Error adding friend:', error);
    } else {
      await getFriends(email);
    }
  };

  const removeFriend = async (email, friend) => {
    const currentData = friends.value;

    // Удаляем друга из массива
    const updatedFriends = currentData.filter((f) => f !== friend);

    console.log(updatedFriends);
    const { error } = await supabase
      .from('users')
      .update({ friends: updatedFriends })
      .eq('email', email);

    if (error) {
      console.error('Error removing friend:', error);
    } else {
      await getFriends(email);
    }
  };

  return { getFriends, addFriend, removeFriend, friends };
});
