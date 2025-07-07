<script setup lang="ts">
// Types
import type { ITabProps } from './types/tab-props.type'
import type { ITabsProps } from './types/tabs-props.type'

type IProps = {
  modelValue?: string | number
  tabs: Array<{ id: string | number, name: string, props: ITabProps }>
  ui?: ITabsProps['ui']
}

defineProps<IProps>()

// Layout
const model = defineModel<string | number>()

function getLabel(tab: ITabProps) {
  if (typeof tab.label === 'function') {
    return tab.label()
  }

  return tab.label
}
</script>

<template>
  <HorizontalScroller
    class="shrink-0"
    :class="ui?.navigationClass"
    :style="ui?.navigationStyle"
    :ui="{
      contentClass: ui?.navigationContentClass,
      contentStyle: ui?.navigationContentStyle,
    }"
  >
    <slot
      v-for="(tab, idx) in tabs"
      :key="tab.id"
      :idx
      :name="`${tab.name}-label`"
      :btn-style="ui?.tabNavBtnStyle?.(model === tab.name, idx)"
      :btn-class="ui?.tabNavBtnClass?.(model === tab.name, idx)"
      :btn-props="tab.props.btnProps?.(model === tab.name, idx)"
      :change-fn="() => model = tab.name"
    >
      <Btn
        :icon="tab.props.icon"
        :label="getLabel(tab.props) ?? tab.name"
        :style="ui?.tabNavBtnStyle?.(model === tab.name, idx)"
        :class="ui?.tabNavBtnClass?.(model === tab.name, idx)"
        v-bind="tab.props.btnProps?.(model === tab.name, idx)"
        @click="model = tab.name"
      />
    </slot>
  </HorizontalScroller>
</template>
