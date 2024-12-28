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
  const userStore = useUser ();

  async function registerUser () {
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

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (signUpError) {
      console.error('Ошибка при регистрации:', signUpError);
      return;
    }

    // Добавление имени пользователя в таблицу
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ username: username.value, email: email.value }])
      .select();

    if (insertError) {
      console.error('Ошибка при добавлении имени пользователя:', insertError);
    } else {
      console.log('Пользователь успешно зарегистрирован с именем пользователя:', username.value);
      router.push('/');
      await userStore.getUser();
    }
  }

  return { registerUser , email, password, username };
});