<script setup lang="ts">
    import PageHeader from '@/components/PageHeader.vue'
    import PageMain from '@/components/PageMain.vue'
    import HeaderLink from '@/components/HeaderLink.vue'

</script>

<template>
    <PageHeader class="w-full flex h-auto bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-around max-w-7xl p-4 mx-8 mb-2">
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="/">Home</router-link>
            </template>
        </HeaderLink>

        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="about">About</router-link>
            </template>

        </HeaderLink>
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="profile">Profile</router-link>
            </template>

        </HeaderLink>
        
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="login">Login</router-link>
            </template>

        </HeaderLink>
        <!-- valami ami kiszedi a routeekbol a navbart erdemlo vieweket es ide berakna automatikusan -->
    </PageHeader>
    <PageMain class="w-full flex h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center max-w-7xl p-4 mx-8">
        <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16">
            yo dont have any mony
        </div>
    </PageMain>
</template>

<style scoped>
/* @media (min-width: 1024px) {
    .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
} */
</style>
