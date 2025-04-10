import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import hu from '../locales/hu.json'

/**
 * Retrieve user language preference from localStorage or default to English
 */
const savedLanguage = localStorage.getItem('language') || 'en'

export default createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    hu
  }
})
