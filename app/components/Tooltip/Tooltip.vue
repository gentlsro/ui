<script setup lang="ts">
// Types
import type { ITooltipProps } from './types/tooltip-props.type'

// Constants
import { TOOLTIP_DEFAULT_PROPS } from './constants/tooltip-default-props.constant'

// Composables
import { useTooltipHost } from './composables/useTooltipHost'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ITooltipProps>(), {
  ...getComponentProps('tooltip'),
})

const model = defineModel<boolean>({ default: false })

// Utils
const shared = useTooltipHost()
const { getElement } = useFloatingUIUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('tooltip', props)
})

// Layout
const hostAnchor = useTemplateRef<HTMLSpanElement>('hostAnchor')
const referenceEl = shallowRef<Element>()
const contentTarget = shared.contentTarget
const isMounted = ref(false)

// Forwarded attributes
const attrs = useAttrs()
const forwardedAttrs = shallowRef({ ...attrs })

// Shared ownership
const owner = {
  target: referenceEl,
  props: computed(() => props),
  attrs: forwardedAttrs,
  appearance: computed(() => ({
    containerClass: containerClass.value,
    containerStyle: containerStyle.value,
    arrowClass: arrowClass.value,
    arrowStyle: arrowStyle.value,
  })),
  setModel: (value: boolean) => {
    model.value = value
  },
}

const isActive = computed(() => shared.active.value === owner)

// Target listeners
watchEffect(onCleanup => {
  if (!isMounted.value) {
    return
  }

  const parentEl = hostAnchor.value?.parentElement
  const target = getElement({ elRef: props.referenceTarget ?? parentEl, parentEl })

  referenceEl.value = target instanceof Element ? target : undefined

  if (!(target instanceof Element)) {
    return
  }

  target.classList.add('has-tooltip')
  const manual = props.manual

  const enter = () => {
    target.classList.add('tooltip-hovered')
    shared.enter(owner)
  }

  const leave = () => {
    target.classList.remove('tooltip-hovered')
    shared.leave(owner)
  }

  if (!manual) {
    target.addEventListener('mouseenter', enter)
    target.addEventListener('mouseleave', leave)
  }

  onCleanup(() => {
    target.removeEventListener('mouseenter', enter)
    target.removeEventListener('mouseleave', leave)
    target.classList.remove('has-tooltip', 'tooltip-hovered')

    // Retarget an open bubble in place; only cancel work tied to the old target.
    shared.cancelPending(owner)
  })
}, { flush: 'post' })

// Model synchronization
watch([model, referenceEl], ([open, target]) => {
  if (open && target) {
    if (!isActive.value) {
      shared.show(owner)
    }
  } else {
    shared.release(owner)
  }
}, { flush: 'post' })

// Lifecycle
onMounted(() => {
  isMounted.value = true
})

onUpdated(() => {
  if (!isEqual(forwardedAttrs.value, attrs)) {
    forwardedAttrs.value = { ...attrs }
  }
})

onBeforeUnmount(() => shared.release(owner))

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: TOOLTIP_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: TOOLTIP_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: TOOLTIP_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})

// Styles - description
const descriptionClass = computed(() => {
  return mergedProps.value?.ui?.descriptionClass?.({
    defaults: TOOLTIP_DEFAULT_PROPS.ui.descriptionClass(),
  })
})

const descriptionStyle = computed(() => {
  return mergedProps.value?.ui?.descriptionStyle?.()
})

// Styles - arrow
const arrowClass = computed(() => {
  return mergedProps.value?.ui?.arrowClass?.({
    defaults: TOOLTIP_DEFAULT_PROPS.ui.arrowClass(),
  })
})

const arrowStyle = computed(() => {
  return mergedProps.value?.ui?.arrowStyle?.()
})
</script>

<template>
  <!-- The declaration keeps its own target and slot context; only the bubble is shared. -->
  <span
    ref="hostAnchor"
    hidden
  />

  <Teleport
    v-if="isActive && contentTarget"
    :to="contentTarget"
  >
    <slot
      :content-class
      :content-style
      :description-class
      :description-style
      :title-class
      :title-style
    >
      <div
        v-if="content"
        class="tooltip__content"
        :class="contentClass"
        :style="contentStyle"
      >
        <span
          v-if="content.title"
          class="tooltip__content-title"
          :class="titleClass"
          :style="titleStyle"
        >
          {{ content.title }}
        </span>

        <span
          v-if="content.description"
          class="tooltip__content-description"
          :class="descriptionClass"
          :style="descriptionStyle"
        >
          {{ content.description }}
        </span>
      </div>
    </slot>
  </Teleport>
</template>
