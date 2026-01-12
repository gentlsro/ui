import type { ComponentInternalInstance } from 'vue'

// Types
import type { IMenuProps } from '../types/menu-props.type'

type IPayload = {
  menuId?: string
  menuProps?: IMenuProps
  instance?: ComponentInternalInstance | null
}

export const MENU_INJECTION_KEY: InjectionKey<string> = Symbol('menu')

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IPayload) => {
    const { menuProps, instance } = payload ?? {}

    // Virtual
    const virtualEl = ref<any>()

    const virtualDimensions = initRef({
      instance,
      propName: 'virtualDimensions',
      props: menuProps,
    })

    const virtualConfig = initRef({
      instance,
      propName: 'virtualConfig',
      props: menuProps,
      defaultValue: {
        enabled: false,
        limits: { minW: 0, minH: 0, maxW: 0, maxH: 0 },
        movable: false,
        resizable: false,
      },
    })

    // Template
    const floatingEl = ref<HTMLDivElement>()
    const arrowEl = ref<HTMLElement>()
    const referenceEl = ref<ReturnType<ReturnType<typeof useFloatingUIUtils>['getElement']>>()
    const triggerEl = ref<ReturnType<ReturnType<typeof useFloatingUIUtils>['getElement']>>()
    const contentEl = ref<HTMLElement>()
    const referenceElZIndex = ref<string>()

    const isVirtual = computed(() => {
      return !!virtualConfig.value?.enabled
    })

    const floatingReferenceEl = computed(() => {
      if (isVirtual.value) {
        return virtualEl.value
      }

      return referenceEl.value
    })

    // State
    const zIndex = ref(0)
    const isReferenceElTransparent = ref(false)

    const model = initRef({
      instance,
      propName: 'modelValue',
      props: menuProps,
      defaultValue: false,
    })

    const title = computed(() => {
      if (typeof menuProps?.title === 'function') {
        return menuProps.title()
      }

      return menuProps?.title ?? ''
    })

    const returnedData = {
      // Template
      floatingEl,
      arrowEl,
      referenceEl,
      triggerEl,
      contentEl,
      referenceElZIndex,
      floatingReferenceEl,

      // State
      model,
      zIndex,
      isReferenceElTransparent,
      title,

      // Virtual
      isVirtual,
      virtualConfig,
      virtualEl,
      virtualDimensions,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useMenuStore(payload?: IPayload) {
  const injectionKey = payload?.menuId ?? injectLocal(MENU_INJECTION_KEY)
  const [useProvideMenuStore, useConsumeMenuStore] = createStore(injectionKey)!

  return useConsumeMenuStore() ?? useProvideMenuStore(payload)
}
