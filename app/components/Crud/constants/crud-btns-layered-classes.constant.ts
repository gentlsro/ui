import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { CRUD_BTNS_DEFAULT_PROPS, CRUD_EDIT_BTN_DEFAULT_PROPS } from './crud-btns-default-props.constant'
import { CRUD_BTNS_CLASS_COMPOSERS, CRUD_BTNS_CLASS_SLOTS, CRUD_EDIT_BTN_CLASS_COMPOSERS, CRUD_EDIT_BTN_CLASS_SLOTS } from './crud-btns-class-slots.constant'

export const CRUD_BTNS_LAYERED_CLASSES = createUIClassResolver('crudBtns', {
  slots: CRUD_BTNS_CLASS_SLOTS,
  compose: CRUD_BTNS_CLASS_COMPOSERS,
  defaults: CRUD_BTNS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

export const CRUD_EDIT_BTN_LAYERED_CLASSES = createUIClassResolver('crudEditBtn', {
  slots: CRUD_EDIT_BTN_CLASS_SLOTS,
  compose: CRUD_EDIT_BTN_CLASS_COMPOSERS,
  defaults: CRUD_EDIT_BTN_DEFAULT_PROPS.ui,
}, () => uiClassLayers)
