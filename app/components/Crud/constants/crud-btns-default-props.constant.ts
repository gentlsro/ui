// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const CRUD_BTNS_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex items-center gap-x-1 bg-white dark:bg-darker p-1 rounded-custom border-1 border-dashed border-ca hover:border-true-gray-400'

    // Label state via CSS selectors
    const hasLabels = '[&.has-labels]:(gap-x-2)'

    // Nested button styles
    const btnStyles = '[&_.btn]:(lt-lg:p-x-1) [&_.btn-label]:(lt-lg:hidden)'

    return {
      base,
      hasLabels,
      btnStyles,
    } as const
  },
}

type CrudBtnsSlots<K extends keyof typeof CRUD_BTNS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CRUD_BTNS_CLASS_SLOTS[K]>>

export const CRUD_BTNS_CLASS_COMPOSERS = {
  containerClass(slots: CrudBtnsSlots<'containerClass'>) {
    return `${slots.base} ${slots.hasLabels} ${slots.btnStyles}`
  },
}

export const CRUD_EDIT_BTN_CLASS_SLOTS = {
  wrapperClass() {
    const base = 'absolute inset-block-0 right-0 flex flex-center rounded-inherit bg-white dark:bg-darker min-w-full'

    return {
      base,
    } as const
  },

  btnClass() {
    const base = 'md:min-w-40 w-full'

    // State styling via CSS selectors
    const activeState = '[&:not(.is-archived):not(.is-disabled)]:(bg-primary color-white)'

    return {
      base,
      activeState,
    } as const
  },
}

type CrudEditBtnSlots<K extends keyof typeof CRUD_EDIT_BTN_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CRUD_EDIT_BTN_CLASS_SLOTS[K]>>

export const CRUD_EDIT_BTN_CLASS_COMPOSERS = {
  wrapperClass(slots: CrudEditBtnSlots<'wrapperClass'>) {
    return slots.base
  },

  btnClass(slots: CrudEditBtnSlots<'btnClass'>) {
    return `${slots.base} ${slots.activeState}`
  },
}

export const CRUD_BTNS_DEFAULT_PROPS = {
  ui: createUIClassResolver('crudBtns', {
    slots: CRUD_BTNS_CLASS_SLOTS,
    compose: CRUD_BTNS_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

export const CRUD_EDIT_BTN_DEFAULT_PROPS = {
  ui: createUIClassResolver('crudEditBtn', {
    slots: CRUD_EDIT_BTN_CLASS_SLOTS,
    compose: CRUD_EDIT_BTN_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}
