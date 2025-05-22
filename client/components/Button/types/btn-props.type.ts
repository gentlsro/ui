import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { ITooltipProps } from '../../Tooltip/types/tooltip-props.type'
import type { NavigateToOptions } from '$utilsLayer/client/types/navigate-to.type'

// Constants
import type { BUTTON_PRESET } from '../constants/button-preset.constant'
import type { BREAKPOINTS } from '../../../../shared/constants/breakpoints'

export type INavigation = {
  disabled?: boolean
  download?: boolean | string
  exact?: boolean
  external?: boolean
  replace?: boolean
  to?: any // should be RouteLocationRaw but that breaks some projects for whatever reason
  navigateToOptions?: NavigateToOptions
}

export type IBtnNavigationProps = INavigation & {
  /**
   * When true, the button will not inherit the default NuxtLink active class
   */
  noActiveLink?: boolean

  /**
   * When true, the button will not have an underline
   */
  noUnderline?: boolean

  /**
   * The native `type` of the button
   */
  type?: 'button' | 'submit' | 'reset'
}

export type IBtnProps = IBtnNavigationProps & {
  /**
   * Alignment of the button content
   */
  align?: 'left' | 'center' | 'right'

  /**
   * Whether the button is disabled
   */
  disabled?: boolean

  /**
   * Defines the style of the button when it's disabled
   */
  disableStyle?: 'filled' | 'flat'

  /**
   * The icon of the button
   */
  icon?: ClassType

  /**
   * The label of the button
   */
  label?: string | number | false | (() => string | number | undefined | false)

  /**
   * The breakpoint at which the labels are shown
   *
   * Example: 'md' -> labels will be visible on devices with 'md' screens or bigger
   */
  labelBreakpoint?: keyof typeof BREAKPOINTS

  /**
   * The type of loader to use
   */
  loaderVariant?: 'inline' | 'block'

  /**
   * Whether the button is loading
   */
  loading?: boolean

  /**
   * The color of the loading indicator
   */
  loadingColor?: string

  /**
   * The native `name` of the button
   */
  name?: string

  /**
   * When true, the button will not be bold
   */
  noBold?: boolean

  /**
   * When true, the button will not be dimmed
   */
  noDim?: boolean

  /**
   * When true, the button will not have a hover effect
   */
  noHoverEffect?: boolean

  /**
   * When true, the button will not have an uppercase text
   */
  noUppercase?: boolean

  /**
   * When true, the button will not truncate the label
   */
  noTruncate?: boolean

  /**
   * When true, the button will be outlined
   */
  outlined?: boolean

  /**
   * The preset of the button
   */
  preset?: keyof typeof BUTTON_PRESET

  /**
   * Whether the button should have a ripple effect
   */
  ripple?: boolean

  /**
   * Whether the button should be round
   */
  round?: boolean

  /**
   * Whether the button should be rounded
   *
   * @default true
   */
  rounded?: boolean

  /**
   * The size of the button
   *
   * @default 'md'
   */
  size?: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'

  /**
   * Whether the button should be stacked ~ the icon is on top of the label (vertically)
   */
  stacked?: boolean

  /**
   * Tooltip configuration
   */
  tooltip?: {
    label?: string
    props?: Partial<ITooltipProps> & AllowedComponentProps
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class applied to the button
     */
    btnClass?: ClassType

    /**
     * Style applied to the button
     */
    btnStyle?: CSSProperties

    /**
     * Style applied to the `label`
     */
    labelStyle?: CSSProperties

    /**
     * Classes applied to the `label`
     */
    labelClass?: ClassType

    /**
     * Style applied to the `tooltip`
     */
    tooltipStyle?: CSSProperties

    /**
     * Classes applied to the `tooltip`
     */
    tooltipClass?: ClassType
  }
}
