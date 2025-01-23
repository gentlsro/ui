import type MenuProxy from '../../MenuProxy/MenuProxy.vue'
import type { ISelectorProps } from '../types/selector-props.type'

export const selectorIdKey = Symbol('__selectorId')

export function useSelectorStore(payload?: {
  id?: string
  props?: ISelectorProps
}) {
  const { id, props } = payload ?? {}
  const _selectorId = injectLocal(selectorIdKey, id ?? useId())

  return defineStore(`selector.${_selectorId}`, () => {
    // Layout
    const menuEl = ref<InstanceType<typeof MenuProxy>>()

    // State
    const model = ref(props?.modelValue)
    const search = ref(props?.search)
    const addedItems = ref(props?.addedItems)
    const options = ref(props?.options ?? [])
    const isLoading = ref(false)

    // Picker
    const isPickerActive = ref(false)

    return {
      // Layout
      menuEl,

      // State
      model,
      search,
      addedItems,
      options,
      isLoading,

      // Picker
      isPickerActive,
    }
  })()
}
