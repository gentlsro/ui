import type { Ref } from 'vue'
import type { IDatePickerProps } from '../types/datepicker-props.type'
import type { Day } from '#layers/utilities/app/models/day.model'

/** Committed values, disabled-day rules, and single/multiple selection. */
export function useDatePickerSelection(props: IDatePickerProps, originalModel: Ref<any>) {
  const uiStore = useUIStore()
  function isSelected(day: Day) {
    if (!hasValue.value) {
      return false
    }

    return Array.isArray(model.value)
      ? model.value.some(m => $date(m, { utc: props.utc }).isSame(day.dateObj, 'd'))
      : $date(model.value, { utc: props.utc }).isSame(day.dateObj, 'd')
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
      const isTouch = uiStore.lastPointerDownEvent?.pointerType !== 'mouse'
      const isCtrl = event.ctrlKey || event.metaKey || isTouch
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
          const isSame = $date(selectedDate, { utc: props.utc }).isSame(day.dateObj, 'd')

          if (isSame) {
            model.value = []
          } else {
            const datesSorted = [$date(selectedDate, { utc: props.utc }), day.dateObj].sort((a, b) => a.diff(b, 'd'))
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

    return model.value || $date()
  }

  function selectToday() {
    if (props.multi) {
      model.value = [
        ...(Array.isArray(model.value) ? model.value : model.value ? [model.value] : []),
        $date().startOf('d'),
      ]

      return
    }

    model.value = $date().startOf('d')
  }

  return { getLastValue, isSelected, isDayDisabled, handleDaySelect, selectToday }
}
