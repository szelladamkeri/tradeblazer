<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
</script>

<template>
  <PageHeader class="page-header mb-4" />
  <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
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

<style scoped>
/* Fixed width header to match wider PageMain with proper spacing */
.page-header {
  height: 4rem;
  width: 1366px !important;
  max-width: 1366px !important;
  margin: 0 auto;
  margin-bottom: 1rem !important; /* Ensure consistent spacing between header and main */
}

/* Media query adjustments for smaller screens */
@media (max-width: 1400px) {
  .page-header {
    width: 95vw !important;
    max-width: 1366px !important;
  }
}

@media (max-width: 1100px) {
  .page-header {
    width: 90vw !important;
    max-width: 1024px !important;
  }
}

@media (max-width: 640px) {
  .page-header {
    height: 3.5rem;
    width: calc(100vw - 2rem) !important;
  }
}
</style>
