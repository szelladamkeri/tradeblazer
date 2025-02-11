<script setup lang="ts">
    import PageHeader from '@/components/PageHeader.vue'
    import PageMain from '@/components/PageMain.vue'
    import HeaderLink from '@/components/HeaderLink.vue'

</script>

<template>
    <PageHeader>
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="/">Home</router-link>
            </template>
        </HeaderLink>

        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="about">About</router-link>
            </template>
        </HeaderLink>
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="profile">Profile</router-link>
            </template>

        </HeaderLink>
        
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="login">Login</router-link>
            </template>
        </HeaderLink>
        
    </PageHeader> 
    
    <PageMain class="w-full flex h-full bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center max-w-7xl p-4 mx-8">
        <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16 justify-center">
            Page not found, Error 404
        </div>
    </PageMain>

</template>

<style scoped>
    body{
        background-image: url();
        background-color: var(--vt-c-black-mute);
    }
</style>
