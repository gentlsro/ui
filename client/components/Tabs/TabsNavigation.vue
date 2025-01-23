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
</script>

<template>
  <HorizontalScroller
    :class="ui?.navigationClass"
    :style="ui?.navigationStyle"
    :ui="{
      contentClass: ui?.navigationContentClass,
      contentStyle: ui?.navigationContentStyle,
    }"
  >
    <Btn
      v-for="tab in tabs"
      :key="tab.id"
      :icon="tab.props.icon"
      :label="tab.props.label ?? tab.name"
      :class="ui?.tabNavBtnClass(model === tab.name)"
      v-bind="tab.props.btnProps?.(model === tab.name)"
      @click="model = tab.name"
    />
  </HorizontalScroller>
</template>
