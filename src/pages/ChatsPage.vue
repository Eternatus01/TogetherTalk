<template>
    <div class="chat-page">
        <div class="sidebar">
            <router-view name="sidebar"></router-view>
        </div>
        <div class="content">
            <router-view :key="$route.fullPath"></router-view>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.chat-page {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 250px;
    border-right: 1px solid #ccc;
    overflow-y: auto;
}

.content {
    flex: 1;
    padding: 20px;
}
</style>