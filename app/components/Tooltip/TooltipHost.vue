<script setup lang="ts">
import { autoUpdate } from '@floating-ui/dom'
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'

import { useTooltipHost } from './composables/useTooltipHost'

const shared = useTooltipHost()
const { active, contentTarget } = shared
const { getLastFloatingUIZindex } = useFloatingUIUtils()

const tooltipEl = useTemplateRef<HTMLElement>('tooltipEl')
const arrowEl = useTemplateRef<HTMLElement>('arrowEl')

const props = computed(() => active.value?.props.value)
const appearance = computed(() => active.value?.appearance.value)
const referenceEl = computed(() => active.value?.target.value)

const zIndex = computed(() => {
  return active.value ? getLastFloatingUIZindex() : 2999
})

const middleware = computed(() => [
  offset(props.value?.offset),
  flip(),
  shift(),
  ...(props.value?.noArrow ? [] : [arrow({ element: arrowEl, padding: 8 })]),
])

const {
  floatingStyles,
  placement,
  middlewareData,
} = useFloating(referenceEl, tooltipEl, {
  placement: () => props.value?.placement,
  middleware,
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
})

const arrowPosition = computed(() => {
  const { x, y } = middlewareData.value.arrow ?? {}

  return {
    left: isNil(x) ? '' : `${x}px`,
    top: isNil(y) ? '' : `${y}px`,
  }
})

onBeforeUnmount(shared.dispose)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="active"
      ref="tooltipEl"
      class="tooltip group/tooltip"
      :class="[
        appearance?.containerClass,
        { 'no-inherit-font-style': props?.noInheritFontStyle },
      ]"
      :style="{
        ...floatingStyles,
        ...appearance?.containerStyle,
        '--zIndex': zIndex,
      }"
      :placement
      v-bind="active.attrs.value"
    >
      <div
        v-if="!props?.noArrow"
        ref="arrowEl"
        class="arrow"
        :class="appearance?.arrowClass"
        :style="{ ...appearance?.arrowStyle, ...arrowPosition }"
      />

      <div
        ref="contentTarget"
        display="contents"
      />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tooltip {
  z-index: var(--zIndex);
}

.arrow.has-header {
  @apply bg-inherit;
}

.tooltip[placement^='top'] > .arrow {
  @apply bottom--4px border-b-custom border-r-custom border-ca;
}

.tooltip[placement^='bottom'] > .arrow {
  @apply top--4px border-t-custom border-l-custom border-ca;
}

.tooltip[placement^='left'] > .arrow {
  @apply right--4px border-r-custom border-t-custom border-ca;
}

.tooltip[placement^='right'] > .arrow {
  @apply left--4px border-l-custom border-b-custom border-ca;
}
</style>
