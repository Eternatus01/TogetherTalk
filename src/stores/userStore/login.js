import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { useErrorsUser } from './errors';
import { useRouter } from 'vue-router';
import { useUser } from './user'; // Импортируем userStore

export const useUserLogin = defineStore('userLogin', () => {
  const errors = useErrorsUser();
  const router = useRouter();
  const userStore = useUser();

  async function loginUser(email, password) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Ошибка при входе после авторизации:', signInError);
      errors.setErrors('Неверный логин или пароль');
    } else {
      console.log('Пользователь успешно вошел в систему:', email);
      await userStore.fetchUser();
      router.push('/');
    }
  }

  return { loginUser };
});
