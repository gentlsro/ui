<script setup lang="ts">
import { isVNode } from 'vue'

// Types
import type { ITabProps } from './types/tab-props.type'
import type { ITabsProps } from './types/tabs-props.type'

// Functions
import { useTabsUtils } from './composables/useTabsUtils'
import { getComponentMergedProps } from '../../functions/get-component-props'

type ITabPropsPassthrough = {
  id: string | number
  name: string
  props: ITabProps
}

const props = defineProps<ITabsProps>()

defineSlots<{
  navigation: (props: { ui: ITabsProps['ui'], tabs: ITabPropsPassthrough[] }) => any
}>()

// Utils
const { vueApp } = useNuxtApp()
const self = getCurrentInstance()
const { createTab } = useTabsUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('tabs', props)
})

// Layout
const model = defineModel<string | number>()

const tabs = computed(() => {
  const defaultSlot = self?.slots.default?.() || []
  const vueInstances = defaultSlot.flatMap(t => {
    const children = t.children || []

    return [
      ...(isVNode(t) ? [t] : []),
      ...(Array.isArray(children) ? children.filter(isVNode) : []),
    ]
  })

  return vueInstances
    .filter(instance => {
      const name = getComponentName(instance as any)

      return name === 'Tab'
    })
    .map((component: VNode) => createTab({
      component,
      name: `Tab_${(component.props as ITabProps).name}`,
      props: component.props as ITabProps,
      vueApp,
    }))
})

const tabsNavigationProps = computed<ITabPropsPassthrough[]>(() => {
  return tabs.value.map(tab => {
    const props = tab.props as ITabProps

    // When recreating the tab, the props get param-cased, we need to fix that manually
    if ('btn-props' in props) {
      props.btnProps = props['btn-props']

      delete props['btn-props']
    }

    return { ...pick(tab, ['id', 'name']), props }
  })
})

const activeTab = computed(() => {
  return tabs.value.find(tab => tab.name === model.value)
})
</script>

<template>
  <div class="tabs">
    <slot
      name="navigation"
      :ui="mergedProps.ui"
      :tabs="tabsNavigationProps"
    >
      <TabsNavigation
        v-if="!noNav"
        v-model="model"
        :tabs="tabsNavigationProps"
        :ui="mergedProps.ui"
      />
    </slot>

    <KeepAlive
      v-if="keepAliveProps"
      v-bind="keepAliveProps"
    >
      <Component
        :is="activeTab.component"
        v-if="activeTab"
        v-bind="activeTab.props"
        :key="activeTab.id"
        :class="mergedProps.ui?.tabClass"
        :style="mergedProps.ui?.tabStyle"
      />
    </KeepAlive>

    <Component
      :is="activeTab.component"
      v-else-if="activeTab"
      v-bind="activeTab.props"
      :key="activeTab.name"
      :class="mergedProps.ui?.tabClass"
      :style="mergedProps.ui?.tabStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  @apply flex flex-col;
}
</style>
