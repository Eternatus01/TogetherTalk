<template>
    <div class="avatar" :style="avatarStyles">
        <img v-if="avatarUrl && !error" :src="avatarUrl" alt="User avatar" @error="handleImageError">
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useUser } from '../stores/userStore/user';

const props = defineProps({
    size: {
        type: Number,
        default: 12
    },
    rounded: {
        type: Boolean,
        default: true
    },
    username: {
        type: String
    }
});

const userStore = useUser();
const error = ref(false);
const avatarUrl = ref(null);

const loadAvatar = async () => {
    try {
        error.value = false;
        const data = await userStore.getAvatarByUsername(props.username)
        avatarUrl.value = data;
    } catch (err) {
        error.value = true;
    }
};

const handleImageError = () => {
    error.value = true;
    avatarUrl.value = null;
};

const avatarStyles = computed(() => ({
    width: `${props.size * 4}px`,
    height: `${props.size * 4}px`,
    borderRadius: props.rounded ? '50%' : '4px',
    fontSize: `${props.size * 0.4}px`
}));

watch(() => props.username, loadAvatar, { immediate: true });
</script>

<style scoped>
.avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-fallback {
    font-weight: bold;
    color: #757575;
    text-transform: uppercase;
    user-select: none;
}
</style>