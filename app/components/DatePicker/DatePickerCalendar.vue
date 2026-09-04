<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { DayEvent } from './types/DayEvent.type'

// Models
import type { Day } from '#layers/utilities/app/models/day.model'

type IProps = {
  days: Day[]
  daysCount: number
  utc?: boolean
  eventsByDay?: Record<string, DayEvent[]>
  isSelected: (day: Day) => boolean
  isDayDisabled: (day: Day) => boolean | undefined
  gridClass?: ClassType
  gridStyle?: CSSProperties
}

defineProps<IProps>()
defineEmits<{ select: [day: Day, event: MouseEvent] }>()
const { formatDate } = useDateUtils()
</script>

<template>
  <div>
    <!-- Weekday labels -->
    <div
      flex="~"
      bg="white dark:darker"
    >
      <div
        v-for="(day, dayIdx) in days.slice(0, daysCount)"
        :key="dayIdx"
        flex="~ center 1"
        capitalize
        font="semibold rem-12"
        h="8"
      >
        {{ formatDate(day.dateValue, utc ? 'utcDayShort' : 'dayShort') }}
      </div>
    </div>

    <!-- Day cells -->
    <div
      data-onboarding="date-picker-days"
      class="date-picker-days"
      :class="gridClass"
      :style="gridStyle"
    >
      <DatePickerDay
        v-for="(day, idx) in days"
        :key="idx"
        :day="day"
        :is-selected="isSelected(day)"
        :disabled="isDayDisabled(day)"
        :utc
        :events="eventsByDay?.[day.dateString]"
        @click="$emit('select', day, $event)"
      >
        <template
          v-if="$slots.day"
          #day
        >
          <slot
            name="day"
            :day
          />
        </template>
      </DatePickerDay>
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-picker-days {
  @apply overflow-hidden;

  grid-auto-rows: minmax(40px, auto);
}
</style>
