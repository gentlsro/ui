<script setup lang="ts">
// Types
import type { IDatePickerProps } from './types/datepicker-props.type'
import type { DayEvent } from './types/DayEvent.type'

// Models
import type { Day } from '$utilsLayer/shared/models/day.model'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IDatePickerProps>(), {
  ...getComponentProps('datePicker'),
})

// Constants
const MIN_COUNT_OF_WEEKS = 6

// Utils
const { isDayjs } = useDayjs()
const {
  formatDate,
  getPeriod,
  getExtendedPeriod,
  getDaysInPeriod,
} = useDateUtils()

// Layout
const originalModel = defineModel<any>()
const daysCount = computed(() => 7 - props.excludedDays.length)
const daysInPeriod = computed(() =>
  getDaysInPeriod(extendedPeriod, {
    excludedDays: excludedDays.value,
    currentPeriod: period.value,
    utc: props.utc,
  }),
)

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
  model.value = $date().startOf('d')
}

function isSelected(day: Day) {
  if (!hasValue.value) {
    return false
  }

  const mmdd = `${day.dateObj.month() + 1}-${day.dateObj.date()}`

  return mmdd === modelMMDD.value
}

function isDayDisabled(day: Day) {
  if (!props.disabledDays && !props.allowedDays) {
    return false
  }

  if (typeof props.disabledDays === 'function') {
    return props.disabledDays(day.dateObj)
  } else if (props.disabledDays) {
    return props.disabledDays.some(d => $date(d).isSame(day.dateObj, 'd'))
  }

  if (typeof props.allowedDays === 'function') {
    return !props.allowedDays(day.dateObj)
  } else if (props.allowedDays) {
    return !props.allowedDays.some(d => $date(d).isSame(day.dateObj, 'd'))
  }
}

// Data
const model = computed<Datetime>({
  get() {
    if (isNil(originalModel.value) || originalModel.value === '') {
      return null
    }

    return $date(originalModel.value, { utc: props.utc })
  },
  set(val) {
    originalModel.value = val
  },
})

const modelMMDD = computed(() => {
  if (!model.value) {
    return null
  }

  if (isDayjs(model.value)) {
    return `${model.value?.month() + 1}-${model.value?.date()}`
  }

  const m = $date(model.value)

  return `${m.month() + 1}-${m.date()}`
})

/**
 * Internal value is used to navigate through months/years in the picker without
 * changing the actual `model`
 */
const internalValue = ref<Datetime>(model.value) as Ref<Datetime>
const excludedDays = toRef(props, 'excludedDays')

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

const hasValue = computed(() => {
  return !isNil(model.value)
})

function handleDaySelect(day: Day) {
  if (isDayDisabled(day)) {
    return
  }

  model.value = $date(day.dateString, { utc: props.utc })
}

defineExpose({
  sync: () => (internalValue.value = model.value),
})
</script>

<template>
  <div class="date-picker">
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
        v-model="internalValue"
        :utc
      />

      <!-- Days -->
      <div
        flex="~"
        p="t-2"
        bg="white dark:darker"
      >
        <div
          v-for="(day, dayIdx) in daysInPeriod.slice(0, daysCount)"
          :key="dayIdx"
          flex="~ center 1"
          capitalize
          font="bold rem-13"
          h="8"
        >
          {{ formatDate(day.dateValue, utc ? 'utcDayShort' : 'dayShort') }}
        </div>
      </div>

      <div
        data-onboarding="date-picker-days"
        grid="~ cols-7"
        relative
      >
        <DatePickerDay
          v-for="(day, idx) in daysInPeriod"
          :key="idx"
          :day="day"
          :is-selected="isSelected(day)"
          :disabled="isDayDisabled(day)"
          :utc
          :events="eventsByDay?.[day.dateString]"
          @click="handleDaySelect(day)"
        />

        <DatePickerDaySeparators />
      </div>
    </div>

    <div
      v-if="!noControls"
      class="date-picker-controls"
    >
      <Btn
        data-onboarding="date-picker-today"
        size="sm"
        :label="$t('general.today')"
        @click="handleSelectToday"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.date-picker {
  @apply flex flex-col bg-ca min-w-80 xm:w-90 overflow-auto;

  &-controls {
    @apply flex items-center justify-end p-x-2 p-y-1 border-t-1 border-ca;
  }
}
</style>
