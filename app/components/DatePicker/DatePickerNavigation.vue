<script setup lang="ts">
// Types
import type { IDatePickerNavigationProps } from './types/datepicker-navigation-props.type'

defineProps<IDatePickerNavigationProps>()

// Layout
const navigationEl = ref<HTMLDivElement>()
const model = defineModel<Datetime>()
</script>

<template>
  <div
    ref="navigationEl"
    flex="~ xm:gap-x-1 shrink-0 items-center"
    w="full"
    overflow="auto"
  >
    <MonthSelector
      v-model="model"
      :reference-target="navigationEl"
      grow
      :utc
    />

    <YearSelector
      v-model="model"
      :reference-target="navigationEl"
      :utc
      m="l-auto"
    />
  </div>
</template>
