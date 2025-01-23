// Types
import type { DurationUnit } from '$utils/shared/composables/useDuration'
import type { INumberInputProps } from '../../NumberInput/types/number-input-props.type'

export type IDurationInputProps = INumberInputProps & {
  /**
   * The initial duration unit
   */
  initialDurationUnit?: DurationUnit

  /**
   * The units that are allowed to be selected
   *
   * @default ['minute', 'hour', 'day']
   */
  allowedUnits?: DurationUnit[]
}
