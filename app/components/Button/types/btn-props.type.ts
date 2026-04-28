import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { ITooltipProps } from '../../Tooltip/types/tooltip-props.type'
import type { NavigateToOptions } from '#layers/utilities/app/types/navigate-to.type'

// Constants
import type { ButtonPresetDefaults } from '../constants/button-preset.constant'
import type { BTN_DEFAULT_PROPS } from '../constants/btn-default-props.constant'
import type { BREAKPOINTS } from '../../../../shared/constants/breakpoints'

export type CustomPresets = Record<string, { icon: string, color: string }>

/** Built-in preset names plus keys of optional `presets` (merged with `BUTTON_PRESET` at runtime). */
type BtnPresetKey<T extends CustomPresets>
  = | keyof ButtonPresetDefaults
    | (string extends keyof T ? never : keyof T)

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

export type IBtnProps<T extends CustomPresets = Record<string, never>> = IBtnNavigationProps & {
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
  label?: string | null | number | false | (() => string | number | undefined | false)

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
  name?: string | null

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
   * When true, the button will be outlined (= will have a border)
   */
  outlined?: boolean

  /**
   * The preset of the button
   */
  preset?: BtnPresetKey<T>

  /**
   * Preset map: full `BUTTON_PRESET` (e.g. layer defaults) or extra entries merged on top of `BUTTON_PRESET`
   */
  presets?: T | ButtonPresetDefaults

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
     * Class applied to the container (button element)
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style applied to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Classes applied to the icon
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Style applied to the icon
     */
    iconStyle?: () => CSSProperties

    /**
     * Classes applied to the label
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style applied to the label
     */
    labelStyle?: () => CSSProperties

    /**
     * Style applied to the label
     *
     * Note: You should probably not use this, this is for special cases when
     * we are not able to pass actual function (= maybe we are passing some JSON-ified style object)
     */
    labelStyleObj?: CSSProperties

    /**
     * Classes applied to the focus helper
     */
    focusHelperClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['focusHelperClass']>
    }) => ClassType

    /**
     * Style applied to the focus helper
     */
    focusHelperStyle?: () => CSSProperties

    /**
     * Classes applied to the loading overlay
     */
    loadingClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['loadingClass']>
    }) => ClassType

    /**
     * Style applied to the loading overlay
     */
    loadingStyle?: () => CSSProperties

    /**
     * Classes applied to the loader
     */
    loaderClass?: (payload: {
      defaults: ReturnType<typeof BTN_DEFAULT_PROPS['ui']['loaderClass']>
    }) => ClassType

    /**
     * Style applied to the loader
     */
    loaderStyle?: () => CSSProperties
  }
}
