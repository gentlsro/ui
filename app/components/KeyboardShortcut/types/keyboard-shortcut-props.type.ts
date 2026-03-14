import type { CSSProperties } from 'vue'

// Constants
import type { KEYBOARD_SHORTCUT_DEFAULT_PROPS } from '../constants/keyboard-shortcut-default-props.constant'

export type IKeyboardShortcutProps = {
  /**
   * The icon of the keyboard shortcut
   */
  icon?: ClassType

  /**
   * The character of the keyboard shortcut
   */
  char?: string

  /**
   * We can force the visibility of the keyboard shortcut even if the user has
   * the state in cookie (`genera.keyboardShortcuts`) set to `false`
   */
  forceVisibility?: boolean

  /**
   * Whether the keyboard shortcut should have the CTRL modifier
   */
  withCtrl?: boolean

  /**
   * Whether the keyboard shortcut should have the ALT modifier
   */
  withAlt?: boolean

  /**
   * Whether the keyboard shortcut should have the SHIFT modifier
   */
  withShift?: boolean

  /**
   * When true, the `+` between modifier and key will not be shown
   */
  noPlus?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof KEYBOARD_SHORTCUT_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each key wrapper
     */
    wrapperClass?: (payload: {
      defaults: ReturnType<typeof KEYBOARD_SHORTCUT_DEFAULT_PROPS['ui']['wrapperClass']>
    }) => ClassType

    /**
     * Style to apply to each key wrapper
     */
    wrapperStyle?: () => CSSProperties

    /**
     * Class to apply to the icons
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof KEYBOARD_SHORTCUT_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icons
     */
    iconStyle?: () => CSSProperties
  }
}
