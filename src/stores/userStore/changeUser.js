import { defineStore } from 'pinia';
import { useErrorsUser } from './errors';
import supabase from '../../service/SupaBase';

export const useChangeUser = defineStore('changeUser ', () => {
  const errors = useErrorsUser();

  const updateAvatarUrl = async (userId, avatarUrl) => {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) {
      throw new Error('Ошибка при обновлении URL аватара: ' + error.message);
    }
  };

  // В вашем changeUser  store (например, в userStore/changeUser .js)
  const changeBirthdate = async (userId, newBirthdate) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ birthdate: newBirthdate })
        .eq('id', userId);

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
  const changeUsername = async (oldUsername, newUsername) => {
    if (!(await validateUsername(newUsername))) {
      return; // Если валидация не прошла, выходим из функции
    }

    const { data, error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('username', oldUsername)
      .select();

    console.log('то что пришло ', data[0]);
    if (error) {
      errors.setErrors('Ошибка при изменении имени пользователя');
      console.error('Ошибка при изменении имени пользователя:', error);
      return;
    }

    // Обновляем имена у друзей
    await updateFriendsUsernames(oldUsername, newUsername);

    errors.clearErrors();
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
