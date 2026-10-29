export default defineNuxtConfig({
  extends: ['./support/brand'],
  devtools: { enabled: false },
  compatibilityDate: '2026-10-28',
  i18n: {
    detectBrowserLanguage: false,
  },
  fonts: { providers: {} },
})
