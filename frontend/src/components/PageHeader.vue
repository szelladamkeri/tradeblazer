<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue"
import "../assets/base.css"
defineProps<{
//    linkCount: Number

}>()
</script>

<template>
    <!-- <header class="flex w-full"> -->
    <header class="w-full flex flex-wrap h-auto bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2">
        <slot  />
    </header>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
}

h3 {
    font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
    text-align: center;
}

@media (min-width: 1024px) {

    .greetings h1,
    .greetings h3 {
        text-align: left;
    }
}
</style>
