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
  if (props.multi) {
    model.value = [
      ...(Array.isArray(model.value) ? model.value : model.value ? [model.value] : []),
      $date().startOf('d'),
    ]

    return
  }

  model.value = $date().startOf('d')
}

function isSelected(day: Day) {
  if (!hasValue.value) {
    return false
  }

  return Array.isArray(model.value)
    ? model.value.some(m => $date(m).isSame(day.dateObj, 'd'))
    : $date(model.value).isSame(day.dateObj, 'd')
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
const model = computed<Datetime | Datetime[]>({
  get() {
    if (props.multi) {
      if (Array.isArray(originalModel.value)) {
        return originalModel.value.map(m => $date(m, { utc: props.utc }))
      }

      return originalModel.value ? [$date(originalModel.value, { utc: props.utc })] : []
    }

    if (isNil(originalModel.value) || originalModel.value === '') {
      return null
    }

    return $date(originalModel.value, { utc: props.utc })
  },
  set(val) {
    originalModel.value = val
  },
})

/**
 * Internal value is used to navigate through months/years in the picker without
 * changing the actual `model`
 */
const internalValue = ref<Datetime>(getLastValue())
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
  if (Array.isArray(model.value)) {
    return model.value.length > 0
  }

  return !isNil(model.value)
})

function handleDaySelect(day: Day, event: MouseEvent) {
  if (isDayDisabled(day)) {
    return
  }

  if (props.multi) {
    const isCtrl = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey
    const _isSelected = isSelected(day)

    // Ctrl click
    if (isCtrl) {
      if (_isSelected && Array.isArray(model.value)) {
        model.value = model.value.filter(val => !$date(val).isSame(day.dateObj, 'd'))

        return
      }

      model.value = [
        ...(Array.isArray(model.value) ? model.value : model.value ? [model.value] : []),
        $date(day.dateString, { utc: props.utc }),
      ]
    }

    // Shift click
    else if (isShift) {
      event.preventDefault()
      event.stopPropagation()
      // Remove DOM selection
      document.getSelection()?.removeAllRanges()

      const isOneSelected = Array.isArray(model.value) && model.value.length === 1

      if (isOneSelected) {
        const selectedDate = (model.value as any[])[0] as Datetime
        const isSame = $date(selectedDate).isSame(day.dateObj, 'd')

        if (isSame) {
          model.value = []
        } else {
          const datesSorted = [$date(selectedDate), day.dateObj].sort((a, b) => a.diff(b, 'd'))
          let firstDate = datesSorted[0]!
          const lastDate = datesSorted[1]!
          const dates = [firstDate] as Datetime[]

          while (firstDate.isBefore(lastDate, 'd')) {
            dates.push(firstDate.add(1, 'd'))

            firstDate = firstDate.add(1, 'd')
          }

          model.value = dates
        }
      } else {
        model.value = [$date(day.dateString, { utc: props.utc })]
      }
    }

    // Regular click
    else {
      model.value = [$date(day.dateString, { utc: props.utc })]
    }

    return
  }

  model.value = $date(day.dateString, { utc: props.utc })
}

// In case we are using `multi` mode, we sometimes need to get the last value to
// set internal state or similar
function getLastValue() {
  if (Array.isArray(model.value)) {
    return model.value[model.value.length - 1]
  }

  return model.value
}

defineExpose({
  sync: () => internalValue.value = getLastValue(),
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

      <ScrollArea
        data-onboarding="date-picker-days"
        class="date-picker-days"
      >
        <DatePickerDay
          v-for="(day, idx) in daysInPeriod"
          :key="idx"
          :day="day"
          :is-selected="isSelected(day)"
          :disabled="isDayDisabled(day)"
          :utc
          :events="eventsByDay?.[day.dateString]"
          @click="handleDaySelect(day, $event)"
        />

        <!-- <DatePickerDaySeparators /> -->
      </ScrollArea>
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

  &-days {
    @apply grid grid-cols-7;
  }

  &-controls {
    @apply flex items-center justify-end p-x-2 p-y-1 border-t-1 border-ca;
  }
}
</style>
