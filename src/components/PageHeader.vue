<script setup lang="ts">
  import HeaderLink from "./HeaderLink.vue"
  import "../assets/base.css"
//defineProps<{
//  msg: string
//}>()
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
    <div class="p-10 bg-blue-500 text-white">
      Tailwind CSS is working!
    </div>
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
