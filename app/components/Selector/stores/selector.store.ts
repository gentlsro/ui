// @vapor-ready
import type { NonUndefined } from 'utility-types'
import type { IMenuProxyExpose } from '../../MenuProxy/types/menu-proxy-props.type'
import type { ISelectorProps } from '../types/selector-props.type'

export const SELECTOR_ID_KEY = Symbol('__selectorId')

type IConfig = {
  props?: ISelectorProps
  injectionKey?: string
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    // Create models synchronously in the owner's setup; descendants inject them.
    const { props } = payload ?? {}
    const initialMap = toRef(() => props?.initialMap ?? {})
    const optionKey = toRef(() => props?.optionKey ?? 'id')
    const model = initRef({ props, propName: 'modelValue' })
    const search = initRef({ props, propName: 'search' })
    const addedItems = initRef({ props, propName: 'addedItems', defaultValue: [] })
    const isLoading = computed(() => props?.loading === undefined ? false : props.loading)
    const optionsOriginal = initRef({ props, propName: 'options' })
    const menuEl = ref<IMenuProxyExpose>()
    const options = ref<NonUndefined<ISelectorProps['options']>>([])

    const optionByKey = computed(() => {
      return [...addedItems.value ?? [], ...options.value].reduce((agg, option) => {
        if ('_isCreate' in option) {
          const key = get(option.ref, optionKey.value)
          agg[key] = option.ref
        } else {
          const key = get(option, optionKey.value)
          agg[key] = option
        }

        return agg
      }, { ...initialMap.value })
    })

    // Picker
    const isPickerActive = ref(false)

    const returnedData = {
      // Utils
      initialMap,
      optionKey,

      // Layout
      menuEl,

      // State
      model,
      search,
      addedItems,
      options,
      optionsOriginal,
      isLoading,
      optionByKey,

      // Picker
      isPickerActive,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useSelectorStore(payload?: IConfig) {
  let injectionKey = payload?.injectionKey ?? injectLocal(SELECTOR_ID_KEY, undefined)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(SELECTOR_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideSelectorStore, useConsumeSelectorStore] = createStore(injectionKey)!

  return useConsumeSelectorStore() ?? useProvideSelectorStore(payload)
}
