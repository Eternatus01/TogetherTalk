import { defineStore } from 'pinia';
import { useErrorsUser } from './errors';
import supabase from '../../service/SupaBase';
import { useUser } from './user';

export const useChangeUser = defineStore('changeUser ', () => {
  const errors = useErrorsUser();
  const userStore = useUser();

  const updateAvatarUrl = async (avatarUrl) => {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userStore.user.id);
    userStore.user.avatar_url = avatarUrl;
    if (error) {
      throw new Error('Ошибка при обновлении URL аватара: ' + error.message);
    }
  };

  // В вашем changeUser  store (например, в userStore/changeUser .js)
  const changeBirthdate = async (newBirthdate) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ birthdate: newBirthdate })
        .eq('id', userStore.user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка при изменении даты рождения:', error);
      throw error;
    }
  };

  const validateUsername = async (username) => {
    if (username.length < 3) {
      errors.setErrors(
        'Имя пользователя должно содержать не менее 3 символов.'
      );
      return false;
    }

    // Проверка на занятость имени пользователя
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);

    if (error) {
      errors.setErrors('Ошибка при проверке имени пользователя.');
      console.error('Ошибка при проверке имени пользователя:', error);
      return false;
    }

    if (data.length > 0) {
      errors.setErrors('Имя пользователя уже занято.');
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Простой паттерн для проверки email
    if (!emailPattern.test(email)) {
      errors.setErrors('Введите корректный адрес электронной почты.');
      return false;
    }
    return true;
  };

  const updateFriendsUsernames = async (oldUsername, newUsername) => {
    // Получаем всех пользователей, у которых есть этот пользователь в друзьях
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('username, friends');

    if (userError) {
      console.error('Ошибка при получении пользователей:', userError);
      return;
    }

    // Обновляем имя у всех пользователей, у которых в списке друзей есть oldUsername
    for (const user of users) {
      const friends = user.friends || [];
      if (friends.includes(oldUsername)) {
        const updatedFriends = friends.map((friend) =>
          friend === oldUsername ? newUsername : friend
        );

        const { error: updateError } = await supabase
          .from('users')
          .update({ friends: updatedFriends })
          .eq('username', user.username); // Обновляем список друзей у пользователя

        if (updateError) {
          console.error(
            'Ошибка при обновлении списка друзей у пользователя:',
            updateError
          );
        }
      }
    }
  };

  const changeUsername = async (newUsername) => {
    try {
      const oldUsername = userStore.user.username; // Сохраняем старое имя

      // 1. Обновляем имя пользователя в таблице users
      const { data, error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', userStore.user.id); // Используем ID для надёжности

      if (error) throw error;

      // 2. Обновляем все связанные посты
      const { error: postError } = await supabase
        .from('posts')
        .update({ username: newUsername })
        .eq('user_id', userStore.user.id); // Или .eq('username', oldUsername)

      if (postError) throw postError;

      // 3. Обновляем данные в хранилище
      userStore.user.username = newUsername;
      errors.clearErrors();
    } catch (error) {
      errors.setErrors(error.message || 'Ошибка при изменении имени');
      console.error('Ошибка:', error);
    }
  };

  const changeEmail = async (email, newEmail) => {
    if (!validateEmail(newEmail)) {
      return; // Если валидация не прошла, выходим из функции
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) {
      errors.setErrors('Ошибка при изменении почты пользователя');
      console.error('Ошибка при изменении почты пользователя:', error);
      return;
    }

    const { error: baseDateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('email', email)
      .select();

    if (baseDateError) {
      errors.setErrors('Ошибка при изменении почты пользователя');
      console.error('Ошибка при изменении почты пользователя:', baseDateError);
      return;
    }

    errors.clearErrors(); // Очистка ошибок после успешного изменения
  };

  return { changeUsername, changeEmail, updateAvatarUrl, changeBirthdate };
});
