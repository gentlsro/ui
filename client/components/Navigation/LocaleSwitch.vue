<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

// Utils
const { localesByCode, handleSetLocale } = useLocale()
const { locale, locales } = useI18n()

const _locales = computed(() => locales.value as LocaleObject[])
</script>

<template>
  <Btn
    id="lang-dropdown"
    :icon="`${localesByCode[locale]?.icon} w-6 h-6`"
    round
    no-hover-effect
    size="auto"
    w="7"
    h="7"
    name="locale-switch"
  >
    <Menu
      :no-arrow="false"
      no-uplift
    >
      <template #default="{ hide }">
        <Btn
          v-for="(_locale, idx) in _locales"
          :key="idx"
          :icon="`${_locale.icon} w-8 h-8`"
          size="auto"
          round
          @click="[handleSetLocale(_locale), hide()]"
        />
      </template>
    </Menu>
  </Btn>
</template>
