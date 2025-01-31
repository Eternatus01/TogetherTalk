<template>
    <div class="notices">
        <friend-requests :user_id="user_id"></friend-requests>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import FriendRequests from '../components/FriendRequests.vue';
import { useUser } from '../stores/userStore/user';

const userStore = useUser();

const user_id = computed(() => userStore.user_id);
</script>

<style lang="scss" scoped>

</style>