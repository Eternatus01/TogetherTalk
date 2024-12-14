import { defineStore } from 'pinia';
import supabase from '../../service/SupeBase';
import { useErrorsUser  } from './errors';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUser  } from './user'; // Импортируем userStore

export const useUserRegister = defineStore('userRegister', () => {
  const email = ref('');
  const password = ref('');
  const username = ref('');
  const errors = useErrorsUser ();
  const router = useRouter();
  const userStore = useUser (); // Получаем доступ к userStore

  async function registerUser () {
    // Проверка на уникальность имени пользователя
    const { data: existingUser , error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.value)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Ошибка при проверке имени пользователя:', fetchError);
      return;
    }

    if (existingUser ) {
      console.error('Имя пользователя уже занято. Пожалуйста, выберите другое.');
      errors.setErrors('Имя пользователя уже занято. Пожалуйста, выберите другое.');
      return;
    }

    // Регистрация нового пользователя
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (signUpError) {
      console.error('Ошибка при регистрации:', signUpError);
      return;
    }

    // Добавление имени пользователя в таблицу
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ username: username.value, email: email.value }]) // Убираем пароль из вставки
      .select();

    if (insertError) {
      console.error('Ошибка при добавлении имени пользователя:', insertError);
    } else {
      console.log('Пользователь успешно зарегистрирован с именем пользователя:', username.value);
      await userStore.getUser (); // Обновляем состояние пользователя
      router.push('/');
    }
  }

  return { registerUser , email, password, username };
});