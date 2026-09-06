<script setup lang="ts" vapor>
// Types
import type { ITabProps } from './types/tab-props.type'

// Functions
import { tabsContextKey } from './composables/useTabsUtils'

// Constants
import { TABS_DEFAULT_PROPS } from './constants/tabs-default-props.constant'

defineOptions({ name: 'Tab', inheritAttrs: false })

const props = withDefaults(defineProps<ITabProps>(), {
  ...getComponentProps('tab'),
})

// Layout
const tabs = inject(tabsContextKey, undefined)
const anchorEl = ref<HTMLElement>()
const registration = tabs?.registerTab(props, anchorEl)

const isActive = computed(() => registration?.isActive.value ?? true)
const isKeptAlive = computed(() => registration?.isKeptAlive.value ?? false)

onScopeDispose(() => {
  registration?.unregister()
})

// Styles - tab
const tabClass = computed(() => {
  return tabs?.ui.value?.tabClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.tabClass(),
  })
})

const tabStyle = computed(() => {
  return tabs?.ui.value?.tabStyle?.()
})
</script>

<template>
  <span
    ref="anchorEl"
    hidden
    aria-hidden="true"
  />
  <KeepAlive :include="isKeptAlive ? ['TabPanel'] : []">
    <TabPanel
      v-if="isActive"
      v-bind="$attrs"
      :class="tabClass"
      :style="tabStyle"
    >
      <slot :tab="props" />
    </TabPanel>
  </KeepAlive>
</template>
