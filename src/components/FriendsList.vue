<template>
  <div>
    <h2>Друзья</h2>
    <ul>
      <li v-if="friends.length === 0">Список друзей пуст</li>
      <li v-for="friend in friends" :key="friend.id">
        {{ friend.username }}
        <button @click="routeChat(friend)">Написать сообщение</button>
        <button @click="routeProfile(friend)">Профиль</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import supabase from '../service/SupaBase'; // Импортируем Supabase

const router = useRouter();
const props = defineProps({
  friends: Array,
  user: Object,
});

// Переход на страницу профиля
const routeProfile = (friend) => {
  router.push({ name: 'Profile', params: { username: friend.username } });
};

// Создание чата и переход на страницу чата
const routeChat = async (friend) => {
  try {
    if (!props.user) {
      console.error('Пользователь не авторизован');
      return;
    }

    // Проверяем, существует ли уже чат с этим пользователем
    const { data: existingChat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${props.user.id},user2_id.eq.${props.user.id}`)
      .or(`user1_id.eq.${friend.id},user2_id.eq.${friend.id}`);

    if (chatError) throw chatError;

    let chatId;

    if (existingChat.length > 0) {
      // Если чат уже существует, используем его ID
      chatId = existingChat[0].id;
    } else {
      // Если чата нет, создаем новый
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([{ user1_id: props.user.id, user2_id: friend.id }])
        .select();

      if (createError) throw createError;
      chatId = newChat[0].id;
    }

    // Переходим на страницу чата
    router.push({ name: 'ChatsDetails', params: { id: chatId } });
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #ccc;
}
</style>