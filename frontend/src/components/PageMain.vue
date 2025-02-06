<script setup lang="ts">
import "../assets/base.css"
//defineProps<{
//  msg: string
//}>()
</script>

<template>
    <main>
        <slot />
    </main>
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

</style>
