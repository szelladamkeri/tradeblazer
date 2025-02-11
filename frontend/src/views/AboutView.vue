<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
</script>

<template>
  <PageHeader
    class="w-full flex flex-wrap h-16 bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2"
  >
    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="/">Home</router-link>
      </template>
    </HeaderLink>

    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="about">About</router-link>
      </template>
    </HeaderLink>

    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="profile">Profile</router-link>
      </template>
    </HeaderLink>

    <HeaderLink>
      <template #icon> </template>
      <template #heading>
        <router-link to="login">Login</router-link>
      </template>
    </HeaderLink>
    <!-- valami ami kiszedi a routeekbol a navbart erdemlo vieweket es ide berakna automatikusan -->
  </PageHeader>
  <PageMain
    class="w-full flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-start max-w-7xl mx-2 sm:mx-8 overflow-hidden"
  >
    <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16">
      <p>
        We are a small indie company of two who worked hard on this project, not only we worked hard
        but we are hard. We faced many challanges, such as our supervisors and we couldn't edge in
        class, we were forced to work like slaves. We need your money to feed our families and to
        buy monster energy drink :3
      </p>
    </div>
  </PageMain>
</template>

<style scoped></style>
