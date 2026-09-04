<script setup lang="ts">
type IProps = {
  view: 'months' | 'years'
  date: Datetime
  years: number[]
  utc?: boolean
}

const props = defineProps<IProps>()
defineEmits<{ select: [value: number] }>()

// Utils
const { formatDate } = useDateUtils()

// Layout
const dateObj = computed(() => $date(props.date, { utc: props.utc }))
const selected = computed(() => props.view === 'months' ? dateObj.value.month() : dateObj.value.year())

const options = computed(() => {
  return props.view === 'months'
    ? Array.from({ length: 12 }, (_, value) => ({
        value,
        label: formatDate(dateObj.value.month(value), props.utc ? 'utcMonth' : 'month'),
      }))
    : props.years.map(value => ({ value, label: String(value) }))
})
</script>

<template>
  <div
    class="date-picker-choices"
    :data-picker-month-grid="view === 'months' ? '' : undefined"
    :data-picker-year-grid="view === 'years' ? '' : undefined"
  >
    <Btn
      v-for="option in options"
      :key="option.value"
      no-uppercase
      class="capitalize"
      :label="option.label"
      :aria-pressed="selected === option.value"
      :class="{ 'is-selected': selected === option.value }"
      :data-picker-month="view === 'months' ? option.value : undefined"
      :data-picker-year="view === 'years' ? option.value : undefined"
      @click="$emit('select', option.value)"
    />
  </div>
</template>

<style scoped lang="scss">
.date-picker-choices {
  @apply grid grid-cols-3 grid-rows-4 gap-1 p-2;

  .is-selected {
    @apply bg-primary color-white;
  }
}
</style>
