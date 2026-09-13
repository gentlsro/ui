<script setup lang="ts" vapor>
import { mergeProps } from 'vue'
import type { Placement } from '@floating-ui/dom'

// Types
import type { IMenuProxyExpose, IMenuProxyProps } from './types/menu-proxy-props.type'

// Constants
import { $bp } from '../../constants/breakpoints'

// Components
import Menu from '../Menu/Menu.vue'
import Dialog from '../Dialog/Dialog.vue'

defineOptions({ inheritAttrs: false })

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
const menuProxyEl = ref<IMenuProxyExpose>()

const isMounted = ref(false)

const isMenu = computed(() => isMounted.value && $bp[props.breakpoint].value)

const noOverlay = computed(() => {
  if (!isNil(props.noOverlay)) {
    return props.noOverlay
  }

  return isMenu.value
})

// Lifecycle
onMounted(() => isMounted.value = true)

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
} satisfies IMenuProxyExpose)
</script>

<template>
  <Menu
    v-if="isMenu"
    ref="menuProxyEl"
    v-bind="mergeProps($props, $attrs)"
    v-model="model"
    v-model:virtual-dimensions="virtualDimensions"
    :ui="mergedProps.ui"
    :no-overlay
    @hide="emits('hide')"
    @show="emits('show')"
    @before-hide="emits('beforeHide')"
    @before-show="emits('beforeShow')"
    @update:model-value="emits('update:modelValue', $event)"
    @update:placement="emits('update:placement', $event)"
  >
    <template
      v-if="$slots.title"
      #title="slotProps"
    >
      <slot
        name="title"
        v-bind="slotProps"
      />
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

    <template
      v-if="$slots['header-right']"
      #header-right
    >
      <slot name="header-right" />
    </template>
  </Menu>

  <Dialog
    v-else
    ref="menuProxyEl"
    v-bind="mergeProps($props, $attrs)"
    v-model="model"
    v-model:virtual-dimensions="virtualDimensions"
    :ui="mergedProps.ui"
    :no-overlay
    @hide="emits('hide')"
    @show="emits('show')"
    @before-hide="emits('beforeHide')"
    @before-show="emits('beforeShow')"
    @update:model-value="emits('update:modelValue', $event)"
    @update:placement="emits('update:placement', $event)"
  >
    <template
      v-if="$slots.title"
      #title="slotProps"
    >
      <slot
        name="title"
        v-bind="slotProps"
      />
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

    <template
      v-if="$slots['header-right']"
      #header-right
    >
      <slot name="header-right" />
    </template>
  </Dialog>
</template>
