// @unocss-include

import utilsConfig from '$utilsConfig'
import type { ExtendedDataType } from '$dataType'

// Components
import Checkbox from '../../../Checkbox/Checkbox.vue'
import TextInput from '../../TextInput/TextInput.vue'
import DateInput from '../../DateInput/DateInput.vue'
import TimeInput from '../../TimeInput/TimeInput.vue'
import NumberInput from '../../NumberInput/NumberInput.vue'
import CurrencyInput from '../../CurrencyInput/CurrencyInput.vue'
import DurationInput from '../../DurationInput/DurationInput.vue'
import YearMonthSelector from '../../../YearMonthSelector/YearMonthSelector.vue'

export function getInputByDataType(
  dataType: ExtendedDataType,
  options?: { props?: IItem, icon?: string },
) {
  const { props } = options ?? {}

  const _dataType = dataType as keyof typeof utilsConfig.dataTypeExtend.inputByDataType
  const customComponent = utilsConfig.dataTypeExtend.inputByDataType?.[_dataType]

  if (customComponent) {
    return createComponent(customComponent)
  }

  switch (dataType) {
    case 'string':
    case 'stringSimple':
      return createComponent({
        component: TextInput,
        props,
        icon: 'i-lucide:text',
      })

    case 'number':
    case 'numberSimple':
    case 'percent':
    case 'percentSimple':
      return createComponent({
        component: NumberInput,
        props,
        icon: 'i-tabler:number',
      })

    case 'currency':
    case 'currencySimple':
      return createComponent({
        component: CurrencyInput,
        props,
        icon: 'i-lucide:currency',
      })

    case 'duration':
    case 'durationSimple':
      return createComponent({
        component: DurationInput,
        props,
        icon: 'i-lucide:timer',
      })

      break

    case 'boolean':
    case 'booleanSimple':
    case 'bool':
    case 'boolSimple':
      return createComponent({
        component: Checkbox,
        props,
        icon: 'i-carbon:boolean',
      })

    case 'date':
    case 'dateSimple':
    case 'datetime':
    case 'datetimeSimple':
    case 'fullDateTime':
    case 'fullDateTimeSimple':
      return createComponent({
        component: DateInput,
        props,
        icon: 'i-solar:calendar-date-outline',
      })

    case 'timestamp':
    case 'timestampSimple':
      return createComponent({
        component: DateInput,
        props: { ...props, utc: true },
        icon: 'i-solar:calendar-date-outline',
      })

    case 'yearMonth':
    case 'yearMonthSimple':
      return createComponent({
        component: YearMonthSelector,
        props,
        icon: 'i-carbon:calendar',
      })

    case 'time':
    case 'timeSimple':
      return createComponent({
        component: TimeInput,
        props,
        icon: 'i-carbon:time',
      })

    default:
      return createComponent({
        component: TextInput,
        props,
        icon: 'i-carbon:unknown',
      })
  }
}
