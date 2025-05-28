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
    p="x-2 y-1"
    w="full"
    overflow="auto"
  >
    <MonthSelector
      v-model="model"
      flex="grow-max"
      :reference-target="navigationEl"
      :utc
    />

    <YearSelector
      v-model="model"
      justify-end
      :reference-target="navigationEl"
      :utc
    />
  </div>
</template>
