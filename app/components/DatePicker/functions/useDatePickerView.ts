import type { IDatePickerProps } from '../types/datepicker-props.type'

/** Browsing state is independent of the committed date selection. */
export function useDatePickerView(props: Pick<IDatePickerProps, 'utc'>, getLastValue: () => Datetime) {
  const internalValue = ref<Datetime>(getLastValue())
  const view = ref<'days' | 'months' | 'years'>('days')
  const navigationDate = computed(() => $date(internalValue.value, { utc: props.utc }).startOf('month'))
  const yearPageStart = ref(Math.floor(navigationDate.value.year() / 12) * 12)
  const years = computed(() => Array.from({ length: 12 }, (_, index) => yearPageStart.value + index))
  watch(view, value => {
    if (value === 'years') {
      yearPageStart.value = Math.floor(navigationDate.value.year() / 12) * 12
    }
  })

  function navigate(direction: number, unit: 'month' | 'year') {
    if (view.value === 'years' && unit === 'year') {
      yearPageStart.value += direction * 12
    } else {
      internalValue.value = navigationDate.value.add(direction, unit)
      if (unit === 'month') {
        view.value = 'days'
      }
    }
  }

  function inputYear(year: number) {
    internalValue.value = navigationDate.value.year(year)
    yearPageStart.value = Math.floor(year / 12) * 12
  }

  function selectMonth(month: number) {
    internalValue.value = navigationDate.value.month(month)
    view.value = 'days'
  }

  function selectYear(year: number) {
    internalValue.value = navigationDate.value.year(year)
    view.value = 'months'
  }

  function sync() {
    internalValue.value = getLastValue()
    view.value = 'days'
  }

  return { internalValue, view, navigationDate, years, navigate, inputYear, selectMonth, selectYear, sync }
}
