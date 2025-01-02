import { defineStore } from 'pinia';
import supabase from '../../service/SupaBase';
import { ref } from 'vue';
import { useErrorsUser } from './errors';
import { useRouter } from 'vue-router';
import { useUser } from './user'; // Импортируем userStore

export const useUserLogin = defineStore('userLogin', () => {
  const email = ref('');
  const password = ref('');
  const errors = useErrorsUser();
  const router = useRouter();
  const userStore = useUser();

  async function loginUser() {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (signInError) {
      console.error('Ошибка при входе после авторизации:', signInError);
      errors.setErrors('Неверный логин или пароль');
    } else {
      console.log('Пользователь успешно вошел в систему:', email.value);
      await userStore.getUser();
      router.push('/');
    }
  }

  return { loginUser, email, password };
});
