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
      v-for="tab in tabs"
      :key="tab.id"
      :name="`${tab.name}-label`"
      :change-fn="() => model = tab.name"
    >
      <Btn
        :icon="tab.props.icon"
        :label="getLabel(tab.props) ?? tab.name"
        :class="ui?.tabNavBtnClass?.(model === tab.name)"
        v-bind="tab.props.btnProps?.(model === tab.name)"
        @click="model = tab.name"
      />
    </slot>
  </HorizontalScroller>
</template>
