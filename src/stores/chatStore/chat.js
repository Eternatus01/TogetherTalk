import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supabase from '../../service/SupaBase';
import { useUser } from '../userStore/user';

export const useChat = defineStore('Chat', () => {
  const user = computed(() => userStore.user);
  const chats = ref([]);
  const userStore = useUser();

  const fetchChats = async () => {
    if (!user.value) return;
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${user.value.id},user2_id.eq.${user.value.id}`);

    if (error) console.error(error);
    else {
      for (const chat of data) {
        chat.user1_name = await userStore.getUsername(chat.user1_id);
        chat.user2_name = await userStore.getUsername(chat.user2_id);
      }
      chats.value = data;
    }
  };

  return { fetchChats, chats };
});
