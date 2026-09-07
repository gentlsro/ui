import type { IDatePickerProps } from '../types/datepicker-props.type'

/** Browsing state is independent of the committed date selection. */
export function useDatePickerView(props: Pick<IDatePickerProps, 'utc'>, getLastValue: () => Datetime) {
  const internalValue = ref<Datetime>(getLastValue())
  const view = ref<'days' | 'months' | 'years'>('days')
  const navigationDate = computed(() => $date(internalValue.value, { utc: props.utc }).startOf('month'))
  const yearsPerPage = 24
  const yearPageStart = ref(Math.floor(navigationDate.value.year() / yearsPerPage) * yearsPerPage)
  const years = computed(() => Array.from({ length: yearsPerPage }, (_, index) => yearPageStart.value + index))
  watch(view, value => {
    if (value === 'years') {
      yearPageStart.value = Math.floor(navigationDate.value.year() / yearsPerPage) * yearsPerPage
    }
  })

  function navigate(direction: number, unit: 'month' | 'year') {
    if (view.value === 'years' && unit === 'year') {
      yearPageStart.value += direction * yearsPerPage
    } else {
      internalValue.value = navigationDate.value.add(direction, unit)
      if (unit === 'month') {
        view.value = 'days'
      }
    }
  }

  function inputYear(year: number) {
    internalValue.value = navigationDate.value.year(year)
    yearPageStart.value = Math.floor(year / yearsPerPage) * yearsPerPage
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
