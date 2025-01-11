<template>
  <section>
    <h1>Персональный профиль</h1>
    <div>
      <display-avatar :user_id="id_user" :imageUrl="imageUrl" v-if="id_user" />
      <p>Статус: {{ status }}</p>
      <div>
        <input type="file" @change="handleFileUpload" accept="image/*" />
        <button @click="uploadAvatar">Загрузить аватар</button>
      </div>
      <div>
        Никнейм: {{ username }}
        <button @click="showChangeUsername = !showChangeUsername">Изменить</button>
        <div v-if="showChangeUsername">
          <input v-model="newUsername" type="text" name="username" />
          <button @click="changeUsername">Сохранить</button>
        </div>
        <pre style="color: red">{{ error }}</pre>
      </div>
      <div>
        Почта: {{ email }}
        <button @click="showChangeEmail = !showChangeEmail">Изменить</button>
        <div v-if="showChangeEmail">
          <input v-model="newEmail" type="email" name="email" />
          <button @click="changeEmail">Сохранить</button>
        </div>
      </div>
      <div>
        Дата рождения: {{ birthdate }}
        <button @click="showChangeBirthdate = !showChangeBirthdate">Изменить</button>
        <div v-if="showChangeBirthdate">
          <input v-model="newBirthdate" type="date" name="birthdate" :max="getCurrentDate()" />
          <button @click="changeBirthdate">Сохранить</button>
        </div>
      </div>
      <h3>Запросы в друзья</h3>
      <ul>
        <li v-for="notice of notices" :key="notice.id">
          <h4>{{ notice.message }}</h4>
          <div class="btns">
            <button v-if="notice.notice_type === 'cancelFriend'" @click="acceptNotice(notice.id)">Ок</button>
            <div v-if="notice.notice_type === 'addFriend '">
              <button
                @click="acceptFriend(notice.sender_id, notice.id, notice.sender_id, notice.recipient_id)">Принять</button>
              <button @click="cancelFriend(notice.sender_id, notice.id)">Отклонить</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useUser  } from '../stores/userStore/user';
import { useChangeUser  } from '../stores/userStore/changeUser';
import { useFriend } from '../stores/userStore/friend';
import { useErrorsUser  } from '../stores/userStore/errors';
import { useNotice } from '../stores/userStore/notification';
import supabase from '../service/SupaBase';
import DisplayAvatar from '../components/DisplayAvatar.vue';

const noticeStore = useNotice();
const notices = ref([]);
const user = useUser ();
const changeUser  = useChangeUser ();
const friendStore = useFriend();
const errors = useErrorsUser ();
const username = ref('');
const email = ref('');
const newEmail = ref('');
const newUsername = ref('');
const imageUrl = ref('');
const showChangeUsername = ref(false);
const showChangeEmail = ref(false);
const showChangeBirthdate = ref(false);
const newBirthdate = ref('');
const error = ref('');
const id_user = ref('');
const selectedFile = ref(null);
const birthdate = ref('');
const status = computed(() => user.status);

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadAvatar = async () => {
  if (!selectedFile.value) {
    error.value = 'Пожалуйста, выберите файл для загрузки.';
    return;
  }

  if (imageUrl.value) {
    const oldAvatarPath = `avatars/${id_user.value}/${imageUrl.value.split('/').pop()}`;
    const { error: deleteError } = await supabase.storage.from('avatars').remove([oldAvatarPath]);
    if (deleteError) {
      console.error('Ошибка удаления старой аватарки:', deleteError);
    }
  }

  const filePath = `avatars/${id_user.value}/${selectedFile.value.name}`;
  const { data, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, selectedFile.value, { upsert: true });

  if (uploadError) {
    error.value = uploadError.message;
    console.error('Ошибка загрузки аватара:', uploadError);
    return;
  }

  const avatarUrl = `https://kawdmbqsvrrmvhymflnx.supabase.co/storage/v1/object/public/avatars/${data.path}`;
  await changeUser .updateAvatarUrl(id_user.value, avatarUrl);
  imageUrl.value = avatarUrl;
  selectedFile.value = null;
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getUser  = async () => {
  error.value = errors.getErrors();
  const res = await user.getUser ();
  if (!res) return;
  username.value = res.username;
  email.value = res.email;
  id_user.value = res.id;
  imageUrl.value = res.avatar_url;
  birthdate.value = new Date(res.birthdate).toLocaleDateString();
};

const changeUsername = async () => {
  try {
    errors.clearErrors();
    await changeUser .changeUsername(username.value, newUsername.value);
    await getUser ();
    showChangeUsername.value = false;
    newUsername.value = '';
  } catch (error) {
    error.value = errors.getErrors();
    console.error(error);
  }
};

const changeEmail = async () => {
  try {
    errors.clearErrors();
    await changeUser .changeEmail(email.value, newEmail.value);
    await getUser ();
    showChangeEmail.value = false;
    newEmail.value = '';
  } catch (error) {
    error.value = errors.getErrors();
    console.error(error);
  }
};

const changeBirthdate = async () => {
  try {
    errors.clearErrors();
    const selectedDate = new Date(newBirthdate.value);
    const currentDate = new Date();

    if (selectedDate > currentDate) {
      error.value = 'Дата рождения не может быть больше текущей даты.';
      return;
    }

    await changeUser .changeBirthdate(id_user.value, newBirthdate.value);
    await getUser ();
    showChangeBirthdate.value = false;
    newBirthdate.value = '';
  } catch (error) {
    error.value = errors.getErrors();
    console.error(error);
  }
};

const getNotices = async () => {
  await user.getUser  ();
  const res = await noticeStore.getNotices(id_user.value);
  if (!res) return;
  notices.value = res;
};

const acceptFriend = async (id_senderUsername, id_notice, id_recipient, id_sender) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await noticeStore.removeSentNotice(id_recipient, id_sender);
  await friendStore.addFriend(id_user.value, id_senderUsername);
  await friendStore.addFriend(id_senderUsername, id_user.value);
  await getNotices();
};

const cancelFriend = async (id_senderUsername, id_notice) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await noticeStore.addNotice(id_user.value, id_senderUsername, `${username.value} отменил ваш запрос в друзья`, 'cancelFriend');
  await getNotices();
};

const acceptNotice = async (id_notice) => {
  await noticeStore.removeNotice(id_user.value, id_notice);
  await getNotices();
};

onMounted(async () => {
  await getUser  ();
  await getNotices();
});

watch(id_user, async (newId) => {
  if (newId) {
    await getNotices();
  }
});
</script>

<style lang="scss" scoped>
.btns {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.avatar {
  border-radius: 50%;
}
</style>