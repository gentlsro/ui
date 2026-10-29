import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { KEYBOARD_SHORTCUT_DEFAULT_PROPS } from './keyboard-shortcut-default-props.constant'
import { KEYBOARD_SHORTCUT_CLASS_COMPOSERS, KEYBOARD_SHORTCUT_CLASS_SLOTS } from './keyboard-shortcut-class-slots.constant'

export const KEYBOARD_SHORTCUT_LAYERED_CLASSES = createUIClassResolver('keyboardShortcut', {
  slots: KEYBOARD_SHORTCUT_CLASS_SLOTS,
  compose: KEYBOARD_SHORTCUT_CLASS_COMPOSERS,
  defaults: KEYBOARD_SHORTCUT_DEFAULT_PROPS.ui,
}, () => uiClassLayers)
