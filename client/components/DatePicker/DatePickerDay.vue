<script setup lang="ts">
// Types
import type { DayEvent } from './types/DayEvent.type'
import type { IDatePickerDayProps } from './types/datepicker-day-props.type'

const props = withDefaults(defineProps<IDatePickerDayProps>(), {
  edge: true,
})

// Utils
const { formatDate } = useDateUtils()

// Layout
const day = toRef(props, 'day')

const classes = computed(() => {
  return {
    'is-today': day.value.isToday,
    'is-current': !day.value.isNotCurrent,
    'is-holiday': day.value.isHoliday,
    'is-weekend': day.value.isWeekend,
    'is-not-current': day.value.isNotCurrent,
    'is-selected': props.isSelected,
    'is-disabled': props.disabled,
  }
})

const eventsAdjusted = computed<Pick<DayEvent, 'color' | 'icon'>[]>(() => {
  if (!props.events) {
    return []
  }

  return props.events.map(e => {
    return typeof e === 'string' ? { color: e } : e
  })
})
</script>

<template>
  <div
    class="dp-day"
    :class="classes"
  >
    <slot name="day" />

    <!-- Edge -->
    <div
      v-if="edge && (day.isEdge.start.month || day.isEdge.end.month)"
      class="edge"
    >
      {{ formatDate(day.dateValue, utc ? 'utcMonthShort' : 'monthShort') }}
    </div>

    <!-- Top -->
    <div flex="~">
      <div class="dayNo">
        {{ day.dayOfMonth }}
      </div>
    </div>

    <!-- Events -->
    <div
      v-if="eventsAdjusted.length"
      flex="~ 1 center"
      p="x-1 y-2px"
      overflow="hidden"
    >
      <div
        flex="~ 1 wrap gap-px center"
        bg="white/20 dark:dark-950/20"
        rounded="custom"
      >
        <div
          v-for="(event, idx) in eventsAdjusted"
          :key="idx"
          w="3"
          h="3"
          :class="[event.color, event.icon || 'i-ic:round-lens']"
          hover="scale-120"
          transition="transform-300"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dp-day {
  @apply relative flex flex-col cursor-pointer font-thin relative select-none;
  @apply outline-1 outline-dashed outline-ca;

  &::after {
    @apply content-empty absolute top-0 left-0 min-h-10;
  }

  &:not(.is-disabled):hover {
    @apply shadow-consistent shadow-primary dark:shadow-true-gray-700/50 shadow-true-gray-300/50 z-1;
    @apply scale-110 transform-origin-center font-semibold;

    &:not(.is-selected) {
      @apply bg-white dark:bg-dark-950;
    }
  }

  .dayNo {
    @apply flex flex-center p-1 m-t-1 m-l-1 relative rounded-full font-rem-12 leading-none w-5 h-5;
  }

  .edge {
    @apply absolute top-.5 right-.5 whitespace-nowrap italic text-xs color-gray leading-none;
  }

  &.is-weekend {
    @apply bg-slate-100 dark:bg-true-gray-200/3;
  }

  &.is-not-current {
    @apply bg-slate-200 dark:bg-true-gray-200/7;
  }

  &.is-today .dayNo {
    @apply rounded-full outline-1 outline-solid outline-ca;
  }

  // &.is-selected .dayNo {
  //   @apply dark:bg-primary color-white bg-primary;
  // }

  &.is-selected {
    @apply dark:bg-primary color-white bg-primary outline-white;
  }

  &.is-disabled {
    @apply color-true-gray-400 dark:color-true-gray-600 cursor-not-allowed;
  }
}
</style>
