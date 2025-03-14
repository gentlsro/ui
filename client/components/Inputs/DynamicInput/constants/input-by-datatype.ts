// @unocss-include

import utilsConfig from '$utilsConfig'
import type { ExtendedDataType } from '$dataType'

// Functions
import { createComponent } from '../../../../functions/create-component'

// Components
import Toggle from '../../../Toggle/Toggle.vue'
import TextInput from '../../TextInput/TextInput.vue'
import DateInput from '../../DateInput/DateInput.vue'
import TimeInput from '../../TimeInput/TimeInput.vue'
import NumberInput from '../../NumberInput/NumberInput.vue'
import CurrencyInput from '../../CurrencyInput/CurrencyInput.vue'
import DurationInput from '../../DurationInput/DurationInput.vue'

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
        icon: 'i-mi-text',
      })

    case 'number':
    case 'numberSimple':
    case 'percent':
    case 'percentSimple':
      return createComponent({
        component: NumberInput,
        props,
        icon: 'i-ant-design:number-outlined',
      })

    case 'currency':
    case 'currencySimple':
      return createComponent({
        component: CurrencyInput,
        props,
        icon: 'i-grommet-icons:currency',
      })

    case 'duration':
    case 'durationSimple':
      return createComponent({
        component: DurationInput,
        props,
        icon: 'i-lets-icons:time-atack-light',
      })

      break

    case 'boolean':
    case 'booleanSimple':
    case 'bool':
    case 'boolSimple':
      return createComponent({
        component: Toggle,
        props,
        icon: 'i-carbon:boolean',
      })

    case 'date':
    case 'dateSimple':
    case 'datetime':
    case 'datetimeSimple':
    case 'timestamp':
    case 'timestampSimple':
    case 'fullDateTime':
    case 'fullDateTimeSimple':
      return createComponent({
        component: DateInput,
        props,
        icon: 'i-system-uicons:calendar-date',
      })

    case 'yearMonth':
    case 'yearMonthSimple':
      return createComponent({
        component: TimeInput,
        props,
        icon: 'i-carbon:calendar',
      })

    case 'time':
    case 'timeSimple':
      return createComponent({
        component: TextInput,
        props,
        icon: 'i-ion:time-outline',
      })

    default:
      return createComponent({
        component: TextInput,
        props,
        icon: 'i-carbon:unknown',
      })
  }
}
