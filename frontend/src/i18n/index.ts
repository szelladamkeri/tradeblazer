import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import hu from '../locales/hu.json'

// Get the saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('language') || 'en'

export default createI18n({
  legacy: false, // Use Composition API
  locale: savedLanguage, // Use the saved language
  fallbackLocale: 'en',
  messages: {
    en,
    hu
  }
})
