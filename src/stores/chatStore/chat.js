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

    // Получаем все чаты пользователя
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${user.value.id},user2_id.eq.${user.value.id}`);

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    // Собираем уникальные ID пользователей
    const userIds = data.flatMap((chat) => [chat.user1_id, chat.user2_id]);
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

    // Получаем имена пользователей одним запросом
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', uniqueUserIds);

    if (usersError) {
      console.error('Error fetching usernames:', usersError);
      return;
    }

    // Создаем карту для быстрого доступа и обновляем кеш
    const usersMap = new Map();
    usersData.forEach((user) => {
      usersMap.set(user.id, user.username);
    });

    // Добавляем имена в чаты
    const processedChats = data.map((chat) => ({
      ...chat,
      user1_name: usersMap.get(chat.user1_id) || 'Unknown User',
      user2_name: usersMap.get(chat.user2_id) || 'Unknown User',
    }));

    chats.value = processedChats;
  };

  return { fetchChats, chats };
});
