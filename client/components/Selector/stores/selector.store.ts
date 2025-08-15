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

    // Utils
    const initialMap: Record<string, any> = ref(props?.initialMap ?? {})
    const optionKey = props?.optionKey ?? 'id'

    // State
    const model = ref(props?.modelValue)
    const search = ref(props?.search)
    const addedItems = ref(props?.addedItems)
    const options = ref(props?.options ?? [])
    const isLoading = ref(false)

    const optionByKey = computed(() => {
      return options.value.reduce((agg, option) => {
        const key = get(option, optionKey)
        agg[key] = option

        return agg
      }, initialMap.value)
    })

    // Picker
    const isPickerActive = ref(false)

    return {
      // Layout
      menuEl,
      initialMap,

      // State
      model,
      search,
      addedItems,
      options,
      optionByKey,
      isLoading,

      // Picker
      isPickerActive,
    }
  })()
}
