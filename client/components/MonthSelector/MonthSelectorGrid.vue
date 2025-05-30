<script setup lang="ts">
// Types
import type { IMonthSelectorGridProps } from './types/month-selector-grid-props'

defineProps<IMonthSelectorGridProps>()
defineEmits<{
  (e: 'month', month: number): void
}>()

// Utils
const { formatDate } = useDateUtils()

// Layout
const model = defineModel<Datetime>()

const dateObj = computed(() => $date(model.value))

const now = useNow({ interval: $duration(15, 'minute').as('ms') })
const nowMonth = computed(() => {
  const dateObj = $date(now.value)

  return `${dateObj.year()}-${padStart(String(dateObj.month()), 2, '0')}`
})

const months = computed(() => {
  return Array.from({ length: 12 }, (_, idx) => {
    const idxString = padStart(String(idx), 2, '0')
    const date = $date(
      `${dateObj.value.year()}-${padStart(String(idx + 1), 2, '0')}-01`,
    )

    return {
      idx,
      idxString,
      date: date.valueOf(),
      month: `${date.year()}-${padStart(String(date.month()), 2, '0')}`,
    }
  })
})

function handleMonthSelect(month: number) {
  model.value = $date(model.value).month(month).startOf('month').valueOf()
}
</script>

<template>
  <div class="month-selector-grid">
    <Btn
      v-for="m in months"
      :key="m.idx"
      :label="formatDate(m.date, utc ? 'utcMonth' : 'month')"
      tabindex="-1"
      size="sm"
      no-uppercase
      capitalize
      :class="{
        'bg-primary color-white': dateObj.month() === m.idx,
        'current': nowMonth === m.month && dateObj.month() !== m.idx,
      }"
      @click="handleMonthSelect(m.idx)"
      @mousedown.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.month-selector-grid {
  @apply grid grid-cols-2 xm:grid-cols-3 grid-gap-1;

  .current {
    @apply shadow-coolGray;

    box-shadow: 0px 0px 0px 2px var(--un-shadow-color);
  }
}
</style>
