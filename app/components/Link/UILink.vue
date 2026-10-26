<script setup lang="ts" vapor>
import { mergeProps } from 'vue'
import type { IUILinkProps } from './types/link-props.type'
import { useUILink } from './composables/useUILink'

defineOptions({ inheritAttrs: false })
// Optional Boolean props otherwise cast absence to false before setup.
const props = withDefaults(defineProps<IUILinkProps>(), { prefetch: undefined })
const emits = defineEmits<{ click: [event: MouseEvent] }>()
const element = useTemplateRef<HTMLAnchorElement>('element')
const link = useUILink(props, element)
const { attrs, href, isActive, isExactActive, navigate, prefetch } = link
function handleClick(event: MouseEvent) {
  // Parent preventDefault handlers (for example Table row actions) run before
  // navigation. Descendant links/buttons retain their own browser behavior.
  emits('click', event)
  if ((event.target as HTMLElement).closest('a,button,input,select,textarea') !== element.value) {
    return
  }
  void navigate(event)
}

defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options), prefetch })
</script>

<template>
  <a
    ref="element"
    v-bind="mergeProps(attrs, $attrs)"
    @click="handleClick"
  >
    <slot
      :href
      :is-active
      :is-exact-active
      :navigate
    />
  </a>
</template>
