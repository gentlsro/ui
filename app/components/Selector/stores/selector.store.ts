import type { NonUndefined } from 'utility-types'
import type MenuProxy from '../../MenuProxy/MenuProxy.vue'
import type { ISelectorProps } from '../types/selector-props.type'

export const SELECTOR_ID_KEY = Symbol('__selectorId')

type IConfig = {
  selectorProps?: ISelectorProps
  injectionKey?: string
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    const { selectorProps } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    const initialMap = initRef({
      propName: 'initialMap',
      instance,
      props: selectorProps,
      defaultValue: {},
    }) as Ref<NonUndefined<ISelectorProps['initialMap']>>

    const optionKey = initRef({
      propName: 'optionKey',
      instance,
      props: selectorProps,
      defaultValue: 'id',
    }) as Ref<string>

    // Layout
    const menuEl = ref<InstanceType<typeof MenuProxy>>()

    // State
    const model = initRef({
      propName: 'modelValue',
      instance,
      props: selectorProps,
      defaultValue: undefined,
    }) as Ref<ISelectorProps['modelValue']>

    const search = initRef({
      propName: 'search',
      instance,
      props: selectorProps,
      defaultValue: undefined,
    }) as Ref<ISelectorProps['search']>

    const addedItems = initRef({
      propName: 'addedItems',
      instance,
      props: selectorProps,
      defaultValue: [],
    }) as Ref<NonUndefined<ISelectorProps['addedItems']>>

    const options = initRef({
      propName: 'options',
      instance,
      props: selectorProps,
      defaultValue: [],
    }) as Ref<NonUndefined<ISelectorProps['options']>>

    const isLoading = initRef({
      propName: 'loading',
      instance,
      props: selectorProps,
      defaultValue: false,
    }) as Ref<boolean>

    const optionByKey = computed(() => {
      return [...addedItems.value, ...options.value].reduce((agg, option) => {
        if ('_isCreate' in option) {
          const key = get(option.ref, optionKey.value)
          agg[key] = option.ref
        } else {
          const key = get(option, optionKey.value)
          agg[key] = option
        }

        return agg
      }, initialMap.value)
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
