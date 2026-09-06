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
  const tabs = shallowRef<ITabRegistration[]>([])
  const cachedTabIds = shallowRef<number[]>([])
  let nextTabId = 0

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
    }))
  })

  function registerTab(tabProps: ITabProps, anchorEl: ITabRegistration['anchorEl']) {
    const tab = { id: nextTabId++, props: tabProps, anchorEl }
    tabs.value = [...tabs.value, tab]

    return {
      isActive: computed(() => activeTabId.value === tab.id),
      isKeptAlive: computed(() => cachedTabIds.value.includes(tab.id)),
      unregister: () => {
        tabs.value = tabs.value.filter(registeredTab => registeredTab !== tab)
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

    if (!config) {
      return []
    }

    return tabs.value
      .filter(tab => {
        const name = `Tab_${tab.props.name}`

        return (!config.include || matchesCacheFilter(config.include, name))
          && (!config.exclude || !matchesCacheFilter(config.exclude, name))
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
  ui: ComputedRef<ITabsProps['ui']>
}> = Symbol('tabs')
