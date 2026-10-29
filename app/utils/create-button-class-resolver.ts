import { BTN_DEFAULT_PROPS } from '../components/Button/constants/btn-default-props.constant'
import { BTN_CLASS_COMPOSERS, BTN_CLASS_SLOTS } from '../components/Button/constants/button-class-slots.constant'
import { createUIClassResolver } from './create-ui-class-resolver'

/** Button compatibility entry point; all components share the same resolver. */
export function createButtonClassResolver(configs: readonly unknown[]) {
  return createUIClassResolver('button', {
    slots: BTN_CLASS_SLOTS,
    compose: BTN_CLASS_COMPOSERS,
    defaults: BTN_DEFAULT_PROPS.ui,
  }, () => configs)
}
