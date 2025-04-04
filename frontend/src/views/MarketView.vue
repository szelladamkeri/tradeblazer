// ...existing code...

<template>
  <!-- ...existing code... -->
  <div class="market-view view-container">
    <PageHeader class="custom-header" />
    <PageMain>
      <!-- ...existing content... -->
    </PageMain>
  </div>
  <!-- ...existing code... -->
</template>

<style scoped>
/* ...existing code... */

/* Ensure the PageMain component is styled correctly */
:deep(.page-main) {
  width: 100% !important;
  max-width: 1280px !important;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Ensure PageHeader matches PageMain */
:deep(.page-header) {
  width: 100% !important;
  max-width: 1280px !important;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(8, 11, 22, 0.98) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(74, 222, 128, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(74, 222, 128, 0.05) inset;
  border-radius: 0.75rem;
  overflow: hidden;
}

/* Media queries to match other views */
@media (max-width: 1400px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 1100px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  :deep(.page-header), :deep(.page-main) {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
}

/* ...existing code... */
</style>
