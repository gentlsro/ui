// Types
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ITabProps } from '../types/tab-props.type'
import type { ITabsProps } from '../types/tabs-props.type'

type ITabRegistration = {
  id: number
  props: ITabProps
  anchorEl: Ref<HTMLElement | undefined>
}

export type ITab = IItem & {
  id: string | number
  label?: string
}

// @vapor-ready
export function useTabsUtils(props: ITabsProps, sourceModel: Ref<string | number | undefined>) {
  const groupId = useId()
  const tabs = shallowRef<ITabRegistration[]>([])
  const cachedTabIds = shallowRef<number[]>([])
  let nextTabId = 0
  let disposed = false
  onScopeDispose(() => disposed = true)

  const model = computed({
    get: () => sourceModel.value ?? tabs.value[0]?.props.name,
    set: value => sourceModel.value = value,
  })

  const activeTabId = computed(() => {
    return tabs.value.find(tab => tab.props.name === model.value)?.id
  })

  const navigation = computed(() => {
    return tabs.value.map(tab => ({
      id: tab.id,
      name: tab.props.name,
      props: tab.props,
      tabId: `${groupId}-tab-${tab.id}`,
      panelId: `${groupId}-panel-${tab.id}`,
    }))
  })

  function registerTab(tabProps: ITabProps, anchorEl: ITabRegistration['anchorEl']) {
    const tab = { id: nextTabId++, props: tabProps, anchorEl }
    let ownerDocument: Document | undefined
    // Template refs can be cleared before scope disposal. Keep the declaration's
    // document so active removal can restore focus after navigation updates.
    watch(anchorEl, element => {
      if (element) {
        ownerDocument = element.ownerDocument
      }
    }, { flush: 'sync' })
    tabs.value = [...tabs.value, tab]

    return {
      tabId: `${groupId}-tab-${tab.id}`,
      panelId: `${groupId}-panel-${tab.id}`,
      isActive: computed(() => activeTabId.value === tab.id),
      isKeptAlive: computed(() => cachedTabIds.value.includes(tab.id)),
      unregister: () => {
        const wasFocused = ownerDocument?.activeElement?.id === `${groupId}-tab-${tab.id}`
        const index = tabs.value.indexOf(tab)
        const wasActive = activeTabId.value === tab.id
        tabs.value = tabs.value.filter(registeredTab => registeredTab !== tab)
        // A keyed replacement or the whole owner can disappear in this tick.
        // Recover selection only after a genuine active declaration removal.
        nextTick(() => {
          if (disposed || !wasActive || model.value !== tab.props.name) {
            return
          }
          if (tabs.value.some(registeredTab => registeredTab.props.name === tab.props.name)) {
            return
          }
          const candidates = [...tabs.value.slice(index), ...tabs.value.slice(0, index).reverse()]
          const next = candidates.find(candidate => !candidate.props.btnProps?.(false, tabs.value.indexOf(candidate))?.disabled)
          if (next) {
            model.value = next.props.name
            if (wasFocused) {
              nextTick(() => {
                if (!disposed) {
                  ownerDocument?.getElementById(`${groupId}-tab-${next.id}`)?.focus()
                }
              })
            }
          }
        })
      },
    }
  }

  function syncOrder() {
    const orderedTabs = [...tabs.value].sort((left, right) => {
      const leftEl = left.anchorEl.value
      const rightEl = right.anchorEl.value

      if (!leftEl || !rightEl || leftEl === rightEl) {
        return 0
      }

      const position = leftEl.compareDocumentPosition(rightEl)

      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })

    if (orderedTabs.some((tab, index) => tab !== tabs.value[index])) {
      tabs.value = orderedTabs
    }
  }

  // Match the public KeepAlive filters against Tab_<name>, independently of the
  // shared TabPanel component that each declaration renders.
  function matchesCacheFilter(pattern: NonNullable<ITabsProps['keepAliveProps']>['include'], name: string): boolean {
    if (Array.isArray(pattern)) {
      return pattern.some(value => matchesCacheFilter(value, name))
    }

    if (typeof pattern === 'string') {
      return pattern.split(',').includes(name)
    }

    if (pattern instanceof RegExp) {
      pattern.lastIndex = 0

      return pattern.test(name)
    }

    return false
  }

  const cacheableTabIds = computed(() => {
    const config = props.keepAliveProps

    return tabs.value
      .filter(tab => {
        if (tab.props.keepAlive === false || (!config && tab.props.keepAlive !== true)) {
          return false
        }

        const name = `Tab_${tab.props.name}`

        return (!config?.include || matchesCacheFilter(config.include, name))
          && (!config?.exclude || !matchesCacheFilter(config.exclude, name))
      })
      .map(tab => tab.id)
  })

  // KeepAlive belongs to each declaration; enforce max across all panels here.
  // The last entry is the most recently active panel.
  watch([activeTabId, cacheableTabIds, () => props.keepAliveProps?.max], () => {
    const activeId = activeTabId.value
    let nextTabIds = cachedTabIds.value.filter(id => cacheableTabIds.value.includes(id))

    if (activeId !== undefined && cacheableTabIds.value.includes(activeId)) {
      nextTabIds = [...nextTabIds.filter(id => id !== activeId), activeId]
    }

    const max = props.keepAliveProps?.max

    if (max) {
      const limit = Number.parseInt(String(max), 10)

      if (Number.isFinite(limit) && nextTabIds.length > limit) {
        nextTabIds = limit > 0 ? nextTabIds.slice(-limit) : []
      }
    }

    cachedTabIds.value = nextTabIds
  }, { immediate: true, flush: 'sync' })

  return {
    model,
    navigation,
    registerTab,
    syncOrder,
  }
}

export const tabsContextKey: InjectionKey<{
  registerTab: ReturnType<typeof useTabsUtils>['registerTab']
  hasNavigation: ComputedRef<boolean>
  ui: ComputedRef<ITabsProps['ui']>
}> = Symbol('tabs')
