// Types
import type { ISelectorProps } from '../types/selector-props.type'
import type { ISelectorEmits } from '../types/selector-emits.type'
import type { IFieldProps } from '../../Field/types/field-props.type'

// Functions
import { getListItemKey } from '../../List/functions/helpers'
import { useSelectorStore } from '../stores/selector.store'

export type OnBeforeFocus = NonNullable<NonNullable<IFieldProps['eventHandlers']>['onBeforeFocus']>

export function useSelector(payload: {
  el: any
  props: ISelectorProps
  emits: ISelectorEmits
}) {
  const { el, props, emits } = payload

  // Store
  const { model, search, isPickerActive } = storeToRefs(useSelectorStore())

  // Layout
  const optionKey = toRef(props, 'optionKey', 'id')

  const hasContent = computed(() => {
    console.log(props.label, props.hasContent, getListItemKey(model.value, optionKey.value))

    if (!isNil(props.hasContent)) {
      return props.hasContent
    }

    return Array.isArray(model.value)
      ? model.value.length > 0
      : !isNil(getListItemKey(model.value, optionKey.value)) && model.value !== ''
  })

  // Picker
  const isPreventNextFocus = ref(false)

  function handleBeforeHide() {
    isPreventNextFocus.value = true
    unrefElement(el)?.closest('.control')?.focus?.()

    emits('picker-before-hide')
  }

  function handleBeforeShow() {
    emits('picker-before-show')
  }

  function handleHide() {
    isPickerActive.value = false

    if (props.clearSearchOnHide) {
      search.value = ''
    }

    emits('picker-hide')
  }

  function handleShow() {
    emits('picker-show')
  }

  return {
    hasContent,
    isPreventNextFocus,
    handleBeforeHide,
    handleBeforeShow,
    handleHide,
    handleShow,
  }
}
