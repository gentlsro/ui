<script setup lang="ts">
// Types
import type { IDatePickerProps } from './types/datepicker-props.type'
import type { DayEvent } from './types/DayEvent.type'

// Behavior
import { useDatePickerSelection } from './functions/useDatePickerSelection'
import { useDatePickerView } from './functions/useDatePickerView'

// Views
import DatePickerCalendar from './DatePickerCalendar.vue'
import DatePickerPeriodGrid from './DatePickerPeriodGrid.vue'

// Constants
import { DATE_PICKER_DEFAULT_PROPS } from './constants/datepicker-default-props.constant'

const props = withDefaults(defineProps<IDatePickerProps>(), {
  ...getComponentProps('datePicker'),
})
const emits = defineEmits<{
  (e: 'update:period', payload: { period: Period, extendedPeriod: Period }): void
}>()

// Utils
const mergedProps = computed(() => getComponentMergedProps('datePicker', props))

// Constants
const MIN_COUNT_OF_WEEKS = 6

// Utils
const {
  getPeriod,
  getExtendedPeriod,
  getDaysInPeriod,
} = useDateUtils()

// Layout
const originalModel = defineModel<any>()
const {
  getLastValue,
  isSelected,
  isDayDisabled,
  handleDaySelect,
  selectToday,
} = useDatePickerSelection(props, originalModel)

const {
  internalValue,
  view,
  navigationDate,
  years,
  navigate,
  inputYear,
  selectMonth,
  selectYear,
  sync,
} = useDatePickerView(props, getLastValue)

// Layout
const excludedDays = toRef(props, 'excludedDays')
const daysCount = computed(() => 7 - props.excludedDays.length)

const daysInPeriod = computed(() => {
  return getDaysInPeriod(extendedPeriod, {
    excludedDays: excludedDays.value,
    currentPeriod: period.value,
    utc: props.utc,
  })
})

const eventsByDay = computed(() => {
  return props.events?.reduce((agg, event) => {
    const day = $date(event.date).startOf('d').format('YYYY-MM-DD')

    if (agg[day] === undefined) {
      agg[day] = []
    }

    agg[day].push(event)

    return agg
  }, {} as Record<string, DayEvent[]>)
})

function handleSelectToday() {
  view.value = 'days'
  internalValue.value = $date().startOf('month')
  selectToday()
}

const period = computed(() => {
  return getPeriod({ dateRef: internalValue, unit: 'month' })
})

const extendedPeriod = computed(() => {
  return getExtendedPeriod({
    dateRef: internalValue,
    unit: 'month',
    minCountOfWeeks: MIN_COUNT_OF_WEEKS,
  })
})

watch(
  extendedPeriod,
  extendedPeriod => emits('update:period', { period: period.value, extendedPeriod }),
  { immediate: true },
)

// Styles
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: DATE_PICKER_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

const daysGridClass = computed(() => {
  return mergedProps.value?.ui?.daysGridClass?.({
    defaults: DATE_PICKER_DEFAULT_PROPS.ui.daysGridClass(),
  })
})

const daysGridStyle = computed(() => {
  return mergedProps.value?.ui?.daysGridStyle?.()
})

const controlsClass = computed(() => {
  return mergedProps.value?.ui?.controlsClass?.({
    defaults: DATE_PICKER_DEFAULT_PROPS.ui.controlsClass(),
  })
})

const controlsStyle = computed(() => {
  return mergedProps.value?.ui?.controlsStyle?.()
})

defineExpose({ sync })
</script>

<template>
  <div
    class="date-picker"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Shortcuts -->
    <slot
      v-if="shortcuts || $slots.shortcuts"
      name="shortcuts"
    />

    <div
      flex="~ 1 col grow"
      overflow="hidden"
    >
      <DatePickerNavigation
        v-model:view="view"
        :model-value="internalValue"
        :utc
        p="x-2 t-1"
        @navigate="navigate"
        @year="inputYear"
      />

      <div class="date-picker-body">
        <DatePickerCalendar
          :ui="mergedProps.ui"
          :month="navigationDate.format('YYYY-MM')"
          :days="daysInPeriod"
          :days-count="daysCount"
          :utc
          :events-by-day="eventsByDay"
          :is-selected="isSelected"
          :is-day-disabled="isDayDisabled"
          :grid-class="daysGridClass"
          :grid-style="daysGridStyle"
          :style="{ visibility: view === 'days' ? 'visible' : 'hidden' }"
          :inert="view !== 'days'"
          :aria-hidden="view !== 'days'"
          @select="handleDaySelect"
          @navigate="view === 'days' && navigate($event, 'month')"
        >
          <template
            v-if="$slots.day"
            #day="{ day }"
          >
            <slot
              name="day"
              :day
            />
          </template>
        </DatePickerCalendar>

        <DatePickerPeriodGrid
          v-if="view !== 'days'"
          :view
          :date="navigationDate"
          :years
          :utc
          @select="view === 'months' ? selectMonth($event) : selectYear($event)"
          @navigate="navigate($event, 'year')"
        />
      </div>
    </div>

    <!-- Footer / Controls -->
    <div
      v-if="!noControls"
      class="date-picker-controls"
      :class="controlsClass"
      :style="controlsStyle"
    >
      <slot name="controls" />

      <Btn
        data-onboarding="date-picker-today"
        size="sm"
        m="l-auto"
        no-uppercase
        :label="$t('general.today')"
        @click="handleSelectToday"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.date-picker,
.date-picker :deep(input),
.date-picker :deep(button) {
  font-variant-numeric: tabular-nums;
}

.date-picker {
  width: min(90vw, 400px);
  max-width: 100%;
}

.date-picker-body {
  display: grid;

  > * {
    grid-area: 1 / 1;
  }
}
</style>
