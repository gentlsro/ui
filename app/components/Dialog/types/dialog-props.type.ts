import type { CSSProperties } from 'vue'

// Constants
import type { DIALOG_DEFAULT_PROPS } from '../constants/dialog-default-props.constant'

export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

export type IDialogProps = {
  /**
   * Function we can inject before the hide event
   * Should return whether the hide event should go through or not (boolean)
   */
  beforeHideFnc?: () => boolean | Promise<boolean>

  /**
   * When true, the `Dialog` content will not have any padding (unless forced via `ui.contentClass` and using `important`)
   */
  dense?: boolean

  /**
   * Selectors of the elements that should not trigger the hide event
   */
  ignoreClickOutside?: string[]

  /**
   * When true, the `Menu` needs to be controller via v-model or exposed methods
   */
  manual?: boolean

  /**
   * The maximum height for the floating element content (including title!)
   */
  maxHeight?: number | string

  /**
   * Model value
   */
  modelValue?: boolean

  /**
   * When true, the bounce animation will not be shown
   */
  noBounce?: boolean
  /**
   * When true, the `Dialog` will not have a close button
   */
  noClose?: boolean

  /**
   * When true, the `Menu` will not have an overlay/backdrop
   */
  noOverlay?: boolean

  /**
   * When true, the `Menu` will not have a transition
   */
  noTransition?: boolean

  /**
   * When true, the `Menu` will not be closable by clicking outside of it
   * -> either ESC or the `CLOSE` button will be the only way to close it
   */
  persistent?: boolean

  /**
   * The FloatingUI placement
   */
  position?: DialogPosition

  /**
   * Element that triggers the Floating UI
   */
  target?: any

  /**
   * Title of the floating element
   */
  title?: string | number | false | (() => string | number | false | undefined)

  /**
   * The duration of show/hide transition the floating element
   */
  transitionDuration?: number

  /**
   * The transition class
   */
  transitionClass?: string

  /**
   * The trigger event
   */
  trigger?: 'click' | 'contextmenu'

  ui?: {
    /**
     * Class to apply to the `backdrop`
     */
    backdropClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['backdropClass']>
    }) => ClassType

    /**
     * Style to apply to the `backdrop`
     */
    backdropStyle?: () => CSSProperties

    /**
     * Class to apply to the `wrapper`
     */
    wrapperClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['wrapperClass']>
    }) => ClassType

    /**
     * Style to apply to the `wrapper`
     */
    wrapperStyle?: () => CSSProperties

    /**
     * Class to apply to the `dialog` itself
     */
    dialogClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['dialogClass']>
    }) => ClassType

    /**
     * Style to apply to the `dialog` itself
     */
    dialogStyle?: () => CSSProperties

    /**
     * Class to apply to the `header`
     */
    headerClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['headerClass']>
    }) => ClassType

    /**
     * Style to apply to the `header`
     */
    headerStyle?: () => CSSProperties

    /**
     * Class to apply to the `title`
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the `title`
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the `content`
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof DIALOG_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the `content`
     */
    contentStyle?: () => CSSProperties
  }
}
