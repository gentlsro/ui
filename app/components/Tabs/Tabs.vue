<script setup lang="ts" vapor>
// Types
import type { ITabsProps } from './types/tabs-props.type'

// Functions
import { tabsContextKey, useTabsUtils } from './composables/useTabsUtils'

// Constants
import { TABS_DEFAULT_PROPS } from './constants/tabs-default-props.constant'

const props = withDefaults(defineProps<ITabsProps>(), {
  ...getComponentProps('tabs'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('tabs', props)
})

// Layout
const sourceModel = defineModel<string | number>()
const tabs = useTabsUtils(props, sourceModel)
const { model, navigation, syncOrder } = tabs
const panelsEl = ref<HTMLElement>()

provide(tabsContextKey, {
  registerTab: tabs.registerTab,
  ui: computed(() => mergedProps.value.ui),
})

// Keyed Vapor slot moves can happen without updating this owner. Follow the
// declarations' DOM order so the navigation also handles moves through wrappers.
useMutationObserver(panelsEl, syncOrder, { childList: true, subtree: true })
onMounted(syncOrder)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <div
    class="tabs"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Register declarations before rendering navigation, also during SSR. -->
    <div
      ref="panelsEl"
      class="tabs__panels"
    >
      <slot />
    </div>
    <div class="tabs__navigation">
      <slot
        name="navigation"
        :ui="mergedProps.ui"
        :tabs="navigation"
      >
        <TabsNavigation
          v-if="!noNav"
          v-model="model"
          :tabs="navigation"
          :ui="mergedProps.ui"
        />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabs__navigation {
  @apply order-first;
}
</style>
