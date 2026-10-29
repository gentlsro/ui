<script setup lang="ts">
// Types
import type { ITabProps } from './types/tab-props.type'
import type { ITabsProps } from './types/tabs-props.type'

// Constants
import { TABS_DEFAULT_PROPS } from './constants/tabs-default-props.constant'

type IProps = {
  modelValue?: string | number
  tabs: Array<{ id: string | number, name: string, props: ITabProps }>
  ui?: ITabsProps['ui']
}

const props = defineProps<IProps>()

// Layout
const model = defineModel<string | number>()

// Styles - navigation
const navigationClass = computed(() => {
  return props.ui?.navigationClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.navigationClass(),
  })
})

const navigationStyle = computed(() => {
  return props.ui?.navigationStyle?.()
})

// Styles - navigation content
const navigationContentClass = computed(() => {
  return props.ui?.navigationContentClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.navigationContentClass(),
  })
})

const navigationContentStyle = computed(() => {
  return props.ui?.navigationContentStyle?.()
})

// Styles - tab nav btn
const tabNavBtnClass = computed(() => {
  return props.ui?.tabNavBtnClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.tabNavBtnClass(),
  })
})

const tabNavBtnStyle = computed(() => {
  return props.ui?.tabNavBtnStyle?.()
})

function getLabel(tab: ITabProps) {
  if (typeof tab.label === 'function') {
    return tab.label()
  }

  return tab.label
}
</script>

<template>
  <HorizontalScroller
    class="tabs-navigation"
    :class="navigationClass"
    :style="navigationStyle"
    :ui="{
      contentClass: () => navigationContentClass,
      contentStyle: () => navigationContentStyle ?? {},
    }"
  >
    <slot
      v-for="(tab, idx) in tabs"
      :key="tab.id"
      :idx
      :name="`${tab.name}-label`"
      :btn-class="[{ 'is-active': model === tab.name }, tabNavBtnClass]"
      :btn-style="tabNavBtnStyle"
      :btn-props="tab.props.btnProps?.(model === tab.name, idx)"
      :change-fn="() => model = tab.name"
    >
      <Btn
        :icon="tab.props.icon"
        :label="getLabel(tab.props) ?? tab.name"
        :class="[{ 'is-active': model === tab.name }, tabNavBtnClass]"
        :style="tabNavBtnStyle"
        v-bind="tab.props.btnProps?.(model === tab.name, idx)"
        @click="model = tab.name"
      />
    </slot>
  </HorizontalScroller>
</template>
