<script setup lang="ts">
// Types
import type { IMonthSelectorGridProps } from './types/month-selector-grid-props.type'

// Constants
import { MONTH_SELECTOR_GRID_DEFAULT_PROPS } from './constants/month-selector-grid-default-props.constant'

const props = withDefaults(defineProps<IMonthSelectorGridProps>(), {
  ...getComponentProps('monthSelectorGrid'),
})

defineEmits<{
  (e: 'month', month: number): void
}>()

// Utils
const { formatDate } = useDateUtils()
const mergedProps = computed(() => {
  return getComponentMergedProps('monthSelectorGrid', props)
})

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

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: MONTH_SELECTOR_GRID_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - month button
const monthBtnClass = computed(() => {
  return mergedProps.value?.ui?.monthBtnClass?.({
    defaults: MONTH_SELECTOR_GRID_DEFAULT_PROPS.ui.monthBtnClass(),
  })
})

const monthBtnStyle = computed(() => {
  return mergedProps.value?.ui?.monthBtnStyle?.()
})
</script>

<template>
  <div
    class="month-selector-grid"
    :class="containerClass"
    :style="containerStyle"
  >
    <Btn
      v-for="m in months"
      :key="m.idx"
      :label="formatDate(m.date, utc ? 'utcMonth' : 'month')"
      tabindex="-1"
      size="sm"
      no-uppercase
      :class="[
        { 'is-selected': model && dateObj.month() === m.idx, 'is-current': nowMonth === m.month && dateObj.month() !== m.idx },
        monthBtnClass,
      ]"
      :style="monthBtnStyle"
      @click="handleMonthSelect(m.idx)"
      @mousedown.stop.prevent
    />
  </div>
</template>
