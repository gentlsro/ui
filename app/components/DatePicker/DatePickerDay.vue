<script setup lang="ts">
// Types
import type { DayEvent } from './types/DayEvent.type'
import type { IDatePickerDayProps } from './types/datepicker-day-props.type'

// Constants
import { DATE_PICKER_DEFAULT_PROPS } from './constants/datepicker-default-props.constant'

const props = withDefaults(defineProps<IDatePickerDayProps>(), {
  edge: true,
})

// Utils
const { formatDate } = useDateUtils()
const mergedProps = computed(() => getComponentMergedProps('datePicker', { ui: props.ui }))

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

const styleState = computed(() => ({
  day: props.day,
  isSelected: props.isSelected,
  disabled: props.disabled,
}))

const dayClass = computed(() => mergedProps.value.ui?.dayClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayClass(styleState.value),
  ...styleState.value,
}))
const dayStyle = computed(() => mergedProps.value.ui?.dayStyle?.())

const dayNumberClass = computed(() => mergedProps.value.ui?.dayNumberClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayNumberClass(styleState.value),
  ...styleState.value,
}))
const dayNumberStyle = computed(() => mergedProps.value.ui?.dayNumberStyle?.())

const dayEdgeClass = computed(() => mergedProps.value.ui?.dayEdgeClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayEdgeClass(styleState.value),
  ...styleState.value,
}))
const dayEdgeStyle = computed(() => mergedProps.value.ui?.dayEdgeStyle?.())

const dayNumberWrapperClass = computed(() => mergedProps.value.ui?.dayNumberWrapperClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayNumberWrapperClass(),
}))
const dayNumberWrapperStyle = computed(() => mergedProps.value.ui?.dayNumberWrapperStyle?.())

const dayEventsClass = computed(() => mergedProps.value.ui?.dayEventsClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayEventsClass(),
}))
const dayEventsStyle = computed(() => mergedProps.value.ui?.dayEventsStyle?.())

const dayEventsContainerClass = computed(() => mergedProps.value.ui?.dayEventsContainerClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayEventsContainerClass(),
}))
const dayEventsContainerStyle = computed(() => mergedProps.value.ui?.dayEventsContainerStyle?.())

const dayEventClass = computed(() => mergedProps.value.ui?.dayEventClass?.({
  defaults: DATE_PICKER_DEFAULT_PROPS.ui.dayEventClass(),
}))
const dayEventStyle = computed(() => mergedProps.value.ui?.dayEventStyle?.())
</script>

<template>
  <div
    class="dp-day"
    :class="[classes, dayClass]"
    :style="dayStyle"
  >
    <slot name="day" />

    <!-- Edge -->
    <div
      v-if="edge && (day.isEdge.start.month || day.isEdge.end.month)"
      class="edge"
      :class="dayEdgeClass"
      :style="dayEdgeStyle"
    >
      {{ formatDate(day.dateValue, utc ? 'utcMonthShort' : 'monthShort') }}
    </div>

    <!-- Top -->
    <div
      :class="dayNumberWrapperClass"
      :style="dayNumberWrapperStyle"
    >
      <div
        class="dayNo"
        :class="dayNumberClass"
        :style="dayNumberStyle"
      >
        {{ day.dayOfMonth }}
      </div>
    </div>

    <!-- Events -->
    <div
      v-if="eventsAdjusted.length"
      :class="dayEventsClass"
      :style="dayEventsStyle"
    >
      <div
        :class="dayEventsContainerClass"
        :style="dayEventsContainerStyle"
      >
        <div
          v-for="(event, idx) in eventsAdjusted"
          :key="idx"
          :class="[dayEventClass, event.color, event.icon || 'i-ic:round-lens']"
          :style="dayEventStyle"
        />
      </div>
    </div>
  </div>
</template>
