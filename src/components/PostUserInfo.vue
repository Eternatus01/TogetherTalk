<template>
    <div class="info">
        <div class="info-user">
            <DisplayAvatar v-if="userStore.user?.username === props.username" />
            <Avatar v-else :username="props.username" />
            <span class="username">{{ props.username || 'Unknown User' }}</span>
        </div>
        <span class="date">{{ formatDate(props.date) }}</span>
    </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import Avatar from './Avatar.vue';
import DisplayAvatar from './DisplayAvatar.vue';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();

const props = defineProps({
    post: Object,
    username: String,
    date: String,
});

const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
};
</script>

<style lang="scss" scoped>
</style>