import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref(localStorage.getItem('language') || 'en')

  function setLanguage(lang: string) {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }

  // This store is created before the i18n instance, so we can't use useI18n() here directly
  // The actual locale sync happens in the PageHeader component
  
  return {
    currentLanguage,
    setLanguage
  }
})
