<script setup lang="ts">
// Types
import type { IMainBarProps } from './types/main-bar-props.type'

// Constants
import { MAIN_BAR_DEFAULT_PROPS } from './constants/main-bar-default-props.constant'

const props = withDefaults(defineProps<IMainBarProps>(), {
  ...getComponentProps('mainBar'),
})

defineEmits<{
  (e: 'save'): void
  (e: 'delete'): void
}>()

defineSlots<{
  'subtitle'?: (payload: unknown) => void
  'title-append'?: (payload: unknown) => void
  'right'?: (payload: unknown) => void
  'left'?: (payload: unknown) => void
  'inner'?: (payload: unknown) => void
  'right-bottom'?: (payload: unknown) => void
  'actions-prepend'?: (payload: { loaderType: 'inline' | 'block', labels: boolean }) => void
  'actions-append'?: (payload: { loaderType: 'inline' | 'block', labels: boolean }) => void
  'breadcrumbs-right'?: (payload: unknown) => void
}>()

const crudBtnsEl = useTemplateRef('crudBtnsEl')
const headerEl = useTemplateRef('headerEl')

defineExpose({
  save: () => crudBtnsEl.value?.save(),
  delete: () => crudBtnsEl.value?.delete(),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('mainBar', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Styles - titleWrapper
const titleWrapperClass = computed(() => {
  return mergedProps.value?.ui?.titleWrapperClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.titleWrapperClass(),
  })
})

const titleWrapperStyle = computed(() => {
  return mergedProps.value?.ui?.titleWrapperStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})

// Styles - subtitle
const subtitleClass = computed(() => {
  return mergedProps.value?.ui?.subtitleClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.subtitleClass(),
  })
})

const subtitleStyle = computed(() => {
  return mergedProps.value?.ui?.subtitleStyle?.()
})

// Styles - actions
const actionsClass = computed(() => {
  return mergedProps.value?.ui?.actionsClass?.({
    defaults: MAIN_BAR_DEFAULT_PROPS.ui.actionsClass(),
  })
})

const actionsStyle = computed(() => {
  return mergedProps.value?.ui?.actionsStyle?.()
})
</script>

<template>
  <header
    ref="headerEl"
    class="main-bar"
    :class="containerClass"
    :style="containerStyle"
  >
    <Breadcrumbs v-if="!noBreadcrumbs">
      <template #right>
        <slot name="breadcrumbs-right" />
      </template>
    </Breadcrumbs>

    <div
      class="main-bar-content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot name="left" />

      <!-- Title & Subtitle -->
      <div
        class="main-bar-title"
        :class="titleWrapperClass"
        :style="titleWrapperStyle"
      >
        <!-- Title -->
        <Heading
          filled
          v-bind="headingProps"
          :class="[titleClass, { '!min-h-9': !!subtitle || $slots.subtitle }]"
          :style="titleStyle"
        >
          {{ title }}

          <slot name="title-append" />
        </Heading>

        <!-- Subtitle -->
        <slot name="subtitle">
          <span
            v-if="subtitle"
            class="main-bar-subtitle"
            :class="subtitleClass"
            :style="subtitleStyle"
          >
            {{ subtitle }}
          </span>
        </slot>
      </div>

      <slot name="right">
        <div
          v-if="!!actions"
          class="main-bar-actions"
          :class="actionsClass"
          :style="actionsStyle"
        >
          <CrudBtns
            ref="crudBtnsEl"
            labels
            :loading="loading"
            :actions="actions"
            @save="$emit('save')"
            @delete="$emit('delete')"
          >
            <template #prepend="{ loaderType, labels }">
              <slot
                name="actions-prepend"
                :loader-type="loaderType"
                :labels="!!labels"
              />
            </template>

            <template #append="{ loaderType, labels }">
              <slot
                name="actions-append"
                :loader-type="loaderType"
                :labels="!!labels"
              />
            </template>
          </CrudBtns>

          <slot name="right-bottom" />
        </div>
      </slot>
    </div>

    <slot name="inner" />
  </header>
</template>

<style lang="scss">
.main-bar {
  transition: padding 250ms cubic-bezier(0, 0, 0.2, 1);
}

aside.drawer--left.is-open + header .main-bar {
  @apply lg:p-l-$drawerLeftWidth;
}

aside.drawer--right.is-open + header .main-bar {
  @apply lg:p-r-$drawerLeftWidth;
}
</style>
