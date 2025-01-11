import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import VueLazyload from 'vue-lazyload';


const pinia = createPinia();
createApp(App).use(pinia).use(router).use(VueLazyload).mount('#app');

import { useUser } from './stores/userStore/user'; // Импортируем userStore
const userStore = useUser(); // Импортируем userStore

window.addEventListener('beforeunload', async () => {
  await userStore.changeStatus('offline');
});