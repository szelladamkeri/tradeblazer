<template>
    <PageHeader @mousemove="handleHeaderMouseMove" />
    <PageMain>
    
        
    </PageMain>
</template>

<script setup lang="ts">
import PageMain from '@/components/PageMain.vue';

const handleHeaderMouseMove = (event: MouseEvent) => {
  const header = event.currentTarget as HTMLElement;
  const rect = header.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  header.style.setProperty('--mouse-x', `${x}%`);
  header.style.setProperty('--mouse-y', `${y}%`);
};

</script>
<style lang="css">

</style>