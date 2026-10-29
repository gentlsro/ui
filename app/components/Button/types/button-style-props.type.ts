export type ButtonSize = 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'

/** Independent of component overrides so class defaults can be inferred without a cycle. */
export type ButtonStyleProps = {
  size?: ButtonSize
  align?: 'left' | 'center' | 'right'
  noUppercase?: boolean
  noBold?: boolean
  noDim?: boolean
  round?: boolean
  rounded?: boolean
  outlined?: boolean
  stacked?: boolean
  disabled?: boolean
  disableStyle?: 'filled' | 'flat'
  hasLabel: boolean
}
