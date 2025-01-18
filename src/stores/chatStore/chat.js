import { defineStore } from 'pinia';
import { ref } from 'vue';
import supabase from '../../service/SupaBase';
import { useUser } from '../userStore/user';


export const useChat = defineStore('Chat', () => {
    const user = ref(null);
    const chats = ref([]);
    const userStore = useUser();

    const fetchChats = async () => {
        console.log('Fetching chats...');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user.value = authUser;
    
        if (!user.value) return;
    
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`user1_id.eq.${user.value.id},user2_id.eq.${user.value.id}`);
    
        if (error) console.error(error);
        else {
            for (const chat of data) {
                chat.user1_name = await userStore.getUsername(chat.user1_id);
                chat.user2_name = await userStore.getUsername(chat.user2_id);
            }
            chats.value = data;
        }
    };

    return {fetchChats, chats}
});
