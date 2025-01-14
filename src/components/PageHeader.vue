<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue"
import "../assets/base.css"
defineProps<{
    linkCount: Number
}>()
</script>

<template>
    <header>
        <HeaderLink>
            <template #icon>
                zsirke0
            </template>
            <template #heading>
                tartalom
            </template>

        </HeaderLink>
        <HeaderLink>
            <template #icon>
                zsirke1
            </template>
            <template #heading>
                tartalom
            </template>

        </HeaderLink>
        <HeaderLink>
            <template #icon>
                zsirke2
            </template>
            <template #heading>
                tartalom
            </template>

        </HeaderLink>

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
