<template>
    <div class="create-post">
        <textarea v-model="text" placeholder="Что вы думаете о данном посте?" rows="3" class="post-textarea"
            maxlength="500"></textarea>
        <button @click="createComment" :disabled="!isFormValid || isLoading" class="post-button">
            <span v-if="!isLoading">Опубликовать</span>
            <span v-else>Публикация...</span>
        </button>
        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useUser } from '../stores/userStore/user';
import supabase from '../service/SupaBase';

const userStore = useUser();
const text = ref('');
const error = ref('');
const isLoading = ref(false);

const isFormValid = computed(() => {
    return text.value.trim().length > 0;
});

const props = defineProps({
    post: Object
});

const createComment = async () => {
    try {
        error.value = '';
        isLoading.value = true;

        if (!userStore.user?.id) {
            throw new Error('Пользователь не авторизован');
        }

        const { data, error: supabaseError } = await supabase
            .from('comments')
            .insert({
                id_post: props.post.id,
                username: userStore.user.username,
                content: text.value.trim()
            })
            .select('*')
            .single();

        if (supabaseError) throw supabaseError;

        text.value = '';
    } catch (err) {
        error.value = err.message || 'Ошибка при создании поста';
        console.error('Post creation error:', err);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.create-post {
    margin-bottom: 2rem;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-input {
    width: 96%;
    padding: 0.8rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.post-textarea {
    width: 96%;
    padding: 0.8rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
}

.post-button {
    background: #42b983;
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease;
}

.post-button:hover {
    background: #3aa876;
}

.post-button:disabled {
    background: #a0d9bb;
    cursor: not-allowed;
}

.error {
    color: #ff4444;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}
</style>