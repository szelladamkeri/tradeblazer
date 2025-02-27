<script setup lang="ts">
import { ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FadeIn from '@/components/FadeIn.vue'

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(searchQuery.value)}`)
    if (!response.ok) throw new Error('Search failed')
    searchResults.value = await response.json()
  } catch (err) {
    error.value = 'Failed to perform search'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  if (searchQuery.value.length >= 2) {
    performSearch()
  } else {
    searchResults.value = []
  }
})
</script>

<template>
  <div>
    <PageHeader>
      <h1 class="text-2xl font-bold">Search</h1>
    </PageHeader>

    <PageMain>
      <FadeIn>
        <div class="max-w-3xl mx-auto space-y-6">
          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for users or symbols..."
              class="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center">
            <LoadingSpinner />
          </div>

          <!-- Error State -->
          <div v-if="error" class="text-red-500 text-center">
            {{ error }}
          </div>

          <!-- Results -->
          <div v-if="!loading && searchResults.length > 0" class="space-y-4">
            <div v-for="result in searchResults" :key="result.id" 
                 class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <h3 class="font-semibold">{{ result.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ result.type }}</p>
                </div>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="!loading && searchQuery && searchResults.length === 0" 
               class="text-center text-gray-500 dark:text-gray-400">
            No results found
          </div>
        </div>
      </FadeIn>
    </PageMain>
  </div>
</template>
