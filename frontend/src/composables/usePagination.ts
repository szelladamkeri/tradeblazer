import { ref, computed, onMounted, onUnmounted } from 'vue'

export function usePagination(items: any, options = {
  rowHeight: 72,
  headerHeight: 180,
  tableHeaderHeight: 56,
  maxItems: 5 // Set default to 5 items
}) {
  const tableContainer = ref<HTMLElement | null>(null)
  const currentPage = ref(1)

  const visibleItems = computed(() => {
    return options.maxItems || 5 // Always return 5 or maxItems if specified
  })

  const totalPages = computed(() => {
    const total = items.value.length;
    // Ensure totalPages is at least 1, even if there are no items
    if (total === 0) {
      return 1;
    }
    return Math.ceil(total / visibleItems.value);
  })

  const paginatedItems = computed(() => {
    const startIndex = (currentPage.value - 1) * visibleItems.value
    const endIndex = startIndex + visibleItems.value
    return items.value.slice(startIndex, endIndex) // Will now include all items up to the end
  })

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  onMounted(() => {
    const observer = new ResizeObserver(() => {
      if (tableContainer.value) {
        visibleItems.value = Math.floor(
          (tableContainer.value.clientHeight - options.headerHeight - options.tableHeaderHeight) / options.rowHeight
        )
      }
    })

    if (tableContainer.value) {
      observer.observe(tableContainer.value)
    }

    onUnmounted(() => {
      observer.disconnect()
    })
  })

  return {
    tableContainer,
    currentPage,
    visibleItems,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage
  }
}
