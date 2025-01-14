<script setup lang="ts">
//import TheWelcome from '../components/TheWelcome.vue'
import PageHeader from '../components/PageHeader.vue';
</script>

<template>
    <main class="relative">
        <PageHeader />

        <div class="w-[93.6rem] ml-[7.2rem] h-[46rem] bg-black bg-opacity-70 backdrop-blur-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

        <PageMain />

    </main>
</template>

<style>
main {
    position: relative;
}
#trending {}
</style>
