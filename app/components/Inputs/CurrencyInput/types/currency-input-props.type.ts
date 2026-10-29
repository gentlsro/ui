import type { UIClasses, UIResolvedClasses } from '../../../../types/ui-config.type'
// Types
import type { INumberInputProps } from '../../NumberInput/types/number-input-props.type'

export type ICurrencyInputProps = Omit<INumberInputProps, 'ui'> & {
  /**
   * The currency symbol
   */
  currency?: string

  /**
   * Whether the currency symbol should be prepended or appended
   */
  currencyPosition?: 'prepend' | 'append'

  /**
   * Use locale-aware currency
   */
  localeCurrency?: boolean

  /**
   * Whether to show the currency symbol
   */
  noCurrency?: boolean
} & { ui?: UIClasses<NonNullable<(INumberInputProps)['ui']>, UIResolvedClasses['currencyInput']> }
