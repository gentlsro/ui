<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { DayEvent } from './types/DayEvent.type'

// Models
import type { Day } from '#layers/utilities/app/models/day.model'

type IProps = {
  month: string
  days: Day[]
  daysCount: number
  utc?: boolean
  eventsByDay?: Record<string, DayEvent[]>
  isSelected: (day: Day) => boolean
  isDayDisabled: (day: Day) => boolean | undefined
  gridClass?: ClassType
  gridStyle?: CSSProperties
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  select: [day: Day, event: MouseEvent]
  navigate: [direction: number]
}>()
const { formatDate } = useDateUtils()

const transitionName = ref('month-next')
watch(() => props.month, (month, previous) => {
  transitionName.value = month > previous ? 'month-next' : 'month-previous'
})

const calendar = useTemplateRef('calendar')
let suppressClick = false

usePointerSwipe(calendar, {
  threshold: 50,
  onSwipeStart: () => suppressClick = false,
  onSwipe: () => suppressClick = true,
  onSwipeEnd(event, direction) {
    if (event.type === 'pointercancel') {
      return
    }

    if (direction === 'left' || direction === 'right') {
      emits('navigate', direction === 'left' ? 1 : -1)
    }
  },
})

function handleClick(event: MouseEvent) {
  // Pointer capture can produce a click on the starting day after a drag.
  if (suppressClick) {
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }
}
</script>

<template>
  <div
    ref="calendar"
    class="date-picker-calendar"
    @click.capture="handleClick"
  >
    <!-- Weekday labels -->
    <div
      class="date-picker-weekdays"
    >
      <div
        v-for="(day, dayIdx) in days.slice(0, daysCount)"
        :key="dayIdx"
        flex="~ center 1"
        class="capitalize font-semibold font-rem-12 p-t-1"
      >
        {{ formatDate(day.dateValue, utc ? 'utcDayShort' : 'dayShort') }}
      </div>
    </div>

    <div class="date-picker-months">
      <Transition
        :name="transitionName"
        @before-enter="el => el.removeAttribute('inert')"
        @before-leave="el => el.setAttribute('inert', '')"
      >
        <div
          :key="month"
          data-onboarding="date-picker-days"
          class="date-picker-days"
          :class="gridClass"
          :style="gridStyle"
        >
          <DatePickerDay
            v-for="day in days"
            :key="day.dateString"
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
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-picker-calendar {
  touch-action: pan-y;
}

.date-picker-weekdays {
  @apply flex px-2 color-slate-500 dark:color-true-gray-400;
}

.date-picker-months {
  @apply grid overflow-hidden;

  > * {
    grid-area: 1 / 1;
    min-width: 0;
  }
}

.month-next-enter-active,
.month-next-leave-active,
.month-previous-enter-active,
.month-previous-leave-active {
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease;
}

.month-next-leave-active,
.month-previous-leave-active {
  pointer-events: none;
}

.month-next-enter-from,
.month-previous-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.month-next-leave-to,
.month-previous-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .month-next-enter-active,
  .month-next-leave-active,
  .month-previous-enter-active,
  .month-previous-leave-active {
    transition: none;
  }
}

.date-picker-days {
  @apply overflow-hidden;

  grid-auto-rows: minmax(40px, auto);
}
</style>
