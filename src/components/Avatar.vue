<template>
    <div class="avatar" :style="avatarStyles">
        <img v-if="avatarUrl && !error" :src="avatarUrl" alt="User avatar" @error="handleImageError">
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useUser } from '../stores/userStore/user';

const props = defineProps({
    userId: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 40
    },
    rounded: {
        type: Boolean,
        default: true
    }
});

const userStore = useUser();
const error = ref(false);
const avatarUrl = ref(null);

const loadAvatar = async () => {
    try {
        error.value = false;
        const data = await userStore.getAvatar(props.userId)
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
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderRadius: props.rounded ? '50%' : '4px',
    fontSize: `${props.size * 0.4}px`
}));

watch(() => props.userId, loadAvatar, { immediate: true });
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