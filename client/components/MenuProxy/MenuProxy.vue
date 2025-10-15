<script setup lang="ts">
import type { Placement } from '@floating-ui/dom'

// Types
import type { IMenuProxyProps } from './types/menu-proxy-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'

// Components
import Menu from '../Menu/Menu.vue'
import Dialog from '../Dialog/Dialog.vue'

const props = withDefaults(defineProps<IMenuProxyProps>(), {
  ...getComponentProps('menuProxy'),
})

const emits = defineEmits<{
  (e: 'update:placement', placement: Placement): void
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('menuProxy', props)
})

// Layout
const model = defineModel<boolean>({ default: false })
const virtualDimensions = defineModel<IMenuProxyProps['virtualDimensions']>('virtualDimensions')
const menuProxyEl = ref<InstanceType<typeof Menu | typeof Dialog>>()

const isMenu = computed(() => $bp[props.breakpoint].value)

const noOverlay = computed(() => {
  if (!isNil(props.noOverlay)) {
    return props.noOverlay
  }

  return $bp[props.breakpoint].value
})

defineExpose({
  show: () => menuProxyEl.value?.show(),
  hide: (force?: boolean) => menuProxyEl.value?.hide(force),
  toggle: () => menuProxyEl.value?.toggle(),
  recomputePosition: () => {
    if (menuProxyEl.value && 'recomputePosition' in menuProxyEl.value) {
      menuProxyEl.value?.recomputePosition?.()
    }
  },
  getFloatingEl: () => menuProxyEl.value?.getFloatingEl(),
})

// NOTE: The `v-model:no-overlay` should not really use the `v-model` part
// but the order of props is important and eslint would try to auto-fix this for us
// so this is a workaround to avoid that
</script>

<template>
  <Component
    :is="isMenu ? Menu : Dialog"
    ref="menuProxyEl"
    v-bind="$props"
    v-model="model"
    v-model:virtual-dimensions="virtualDimensions"
    :ui="mergedProps.ui"
    :no-overlay
    h="auto"
    @hide="emits('hide')"
    @show="emits('show')"
    @before-hide="emits('beforeHide')"
    @before-show="emits('beforeShow')"
    @update:model-value="emits('update:modelValue', $event)"
    @update:placement="emits('update:placement', $event)"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.header"
      #header="{ hide }"
    >
      <slot
        name="header"
        :hide="hide"
      />
    </template>

    <template #default="{ hide }">
      <slot :hide="hide" />
    </template>

    <template #header-right>
      <slot name="header-right" />
    </template>
  </Component>
</template>
