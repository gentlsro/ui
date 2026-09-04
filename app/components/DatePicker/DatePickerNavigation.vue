<script setup lang="ts">
// Types
import type { IDatePickerNavigationProps } from './types/datepicker-navigation-props.type'

const props = defineProps<IDatePickerNavigationProps>()
const emits = defineEmits<{
  navigate: [direction: number, unit: 'month' | 'year']
  year: [year: number]
}>()

// Utils
const { formatDate } = useDateUtils()

// Layout
const view = defineModel<'days' | 'months' | 'years'>('view', { default: 'days' })

// Year
const year = computed(() => $date(props.modelValue, { utc: props.utc }).year())
const yearDraft = ref(String(year.value))

watch(year, value => yearDraft.value = String(value))

function inputYear(event: Event) {
  yearDraft.value = (event.target as HTMLInputElement).value

  if (/^[1-9]\d{3}$/.test(yearDraft.value)) {
    emits('year', Number(yearDraft.value))
  }
}

function finishYear() {
  yearDraft.value = String(year.value)
  view.value = 'days'
}
</script>

<template>
  <div
    class="date-picker-navigation"
    flex="~ items-center gap-1"
    w="full"
  >
    <!-- Month controls -->
    <div
      flex="~ items-center grow"
      min-w="0"
    >
      <!-- Previous -->
      <Btn
        size="auto"
        class="w-8 h-8 shrink-0 p-0"
        icon="i-majesticons:chevron-left w-5 h-5"
        :aria-label="`${$t('general.previous')} ${$t('general.month', 1)}`"
        data-picker-previous-month
        @click="$emit('navigate', -1, 'month')"
      />

      <!-- Label -->
      <Btn
        size="sm"
        no-uppercase
        class="capitalize"
        grow
        :label="formatDate(modelValue, utc ? 'utcMonth' : 'month')"
        :aria-pressed="view === 'months'"
        data-picker-months
        @click="view = view === 'months' ? 'days' : 'months'"
      />

      <!-- Next -->
      <Btn
        size="auto"
        class="w-8 h-8 shrink-0 p-0"
        icon="i-majesticons:chevron-right w-5 h-5"
        :aria-label="`${$t('general.next')} ${$t('general.month', 1)}`"
        data-picker-next-month
        @click="$emit('navigate', 1, 'month')"
      />
    </div>

    <!-- Year controls -->
    <div flex="~ items-center shrink-0">
      <!-- Previous -->
      <Btn
        size="auto"
        class="w-8 h-8 shrink-0 p-0"
        icon="i-majesticons:chevron-left w-5 h-5"
        :aria-label="`${$t('general.previous')} ${$t('general.year', 1)}`"
        data-picker-previous
        @click="$emit('navigate', -1, 'year')"
      />

      <!-- Input -->
      <input
        :value="yearDraft"
        type="text"
        inputmode="numeric"
        maxlength="4"
        :aria-label="$t('general.year', 1)"
        :aria-expanded="view === 'years'"
        class="date-picker-year input-wrapper__focusable"
        data-picker-years
        @mousedown.stop
        @focus="view = 'years'"
        @click="view = 'years'"
        @input="inputYear"
        @blur="yearDraft = String(year)"
        @keydown.enter.stop.prevent="finishYear"
        @keydown.esc.stop.prevent="finishYear"
      >

      <!-- Next -->
      <Btn
        size="auto"
        class="w-8 h-8 shrink-0 p-0"
        icon="i-majesticons:chevron-right w-5 h-5"
        :aria-label="`${$t('general.next')} ${$t('general.year', 1)}`"
        data-picker-next
        @click="$emit('navigate', 1, 'year')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-picker-year {
  @apply w-16 h-8 border-0 rounded-4px bg-transparent color-inherit text-center
    font-inherit font-size-13px;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
}
</style>
