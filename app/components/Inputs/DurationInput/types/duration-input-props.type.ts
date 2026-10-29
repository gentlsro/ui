import type { UIClasses, UIResolvedClasses } from '../../../../types/ui-config.type'
// Types
import type { DurationUnit } from '#layers/utilities/app/composables/useDuration'
import type { INumberInputProps } from '../../NumberInput/types/number-input-props.type'

export type IDurationInputProps = Omit<INumberInputProps, 'ui'> & {
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
} & { ui?: UIClasses<NonNullable<(INumberInputProps)['ui']>, UIResolvedClasses['durationInput']> }
