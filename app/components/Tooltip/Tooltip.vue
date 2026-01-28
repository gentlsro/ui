<script setup lang="ts">
import { arrow, flip, offset, shift, useFloating } from '@floating-ui/vue'

// Types
import type { ITooltipProps } from './types/tooltip-props.type'

// Constants
import { TOOLTIP_DEFAULT_PROPS } from './constants/tooltip-default-props.constant'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ITooltipProps>(), {
  ...getComponentProps('tooltip'),
})

// Utils
const instance = getCurrentInstance()
const { getLastFloatingUIZindex, getElement } = useFloatingUIUtils()

const zIndex = computed(() => {
  return getLastFloatingUIZindex()
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('tooltip', props)
})

// Layout
const referenceTarget = toRef(props, 'referenceTarget')
const model = defineModel({ default: false })
const tooltipEl = ref<HTMLElement>()
const referenceEl = ref<Element>() // Element that menu is attached to
const arrowEl = ref<HTMLDivElement>()
const middleware = ref([
  offset(props.offset),
  flip(),
  shift(),
  ...(props.noArrow ? [] : [arrow({ element: arrowEl, padding: 4 })]),
])

const { floatingStyles, placement, middlewareData } = useFloating(
  referenceEl,
  tooltipEl,
  {
    placement: () => props.placement,
    middleware,
    strategy: 'fixed',
  },
)

const classes = computed(() => {
  return {
    'no-inherit-font-style': props.noInheritFontStyle,
  }
})

function assignReferenceEl() {
  const parentEl = instance?.vnode?.el?.parentNode
  const target = getElement({ elRef: props.referenceTarget ?? parentEl, parentEl })

  if (!target) {
    return
  }

  referenceEl.value = target
  referenceEl.value?.classList.add('has-tooltip')
}

function assignEvents() {
  referenceEl.value?.addEventListener('mouseenter', () => {
    referenceEl.value?.classList.add('tooltip-hovered')

    setTimeout(() => {
      const isStillInside = referenceEl.value?.classList.contains('tooltip-hovered')

      if (isStillInside) {
        model.value = true
      }
    }, props.delay?.[0] || 0)
  })

  referenceEl.value?.addEventListener('mouseleave', () => {
    referenceEl.value?.classList.remove('tooltip-hovered')

    setTimeout(() => {
      const isStillInside = referenceEl.value?.classList.contains('tooltip-hovered')

      if (!isStillInside) {
        model.value = false
      }
    }, props.delay?.[1] || 0)
  })
}

watch(middlewareData, middlewareData => {
  if (middlewareData.arrow && arrowEl.value) {
    const { x, y } = middlewareData.arrow

    Object.assign(arrowEl.value.style, {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
    })
  }
})

watch(referenceTarget, () => {
  assignReferenceEl()
})

onMounted(() => {
  nextTick(() => {
    assignReferenceEl()

    if (props.manual) {
      return
    }

    assignEvents()
  })
})

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
  <Teleport to="body">
    <div
      v-if="model"
      ref="tooltipEl"
      class="tooltip group/tooltip"
      :class="[classes, containerClass]"
      :style="{ ...floatingStyles, ...containerStyle, '--zIndex': zIndex }"
      :placement
      v-bind="$attrs"
    >
      <!-- Arrow -->
      <div
        v-if="!noArrow"
        ref="arrowEl"
        class="arrow"
        :class="arrowClass"
        :style="arrowStyle"
      />

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
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tooltip {
  z-index: var(--zIndex);
}

.arrow {
  &.has-header {
    @apply bg-inherit;
  }
}

.tooltip[placement^='top'] > .arrow {
  @apply bottom--5px border-b-custom border-r-custom border-ca;
}

.tooltip[placement^='bottom'] > .arrow {
  @apply top--5px border-t-custom border-l-custom border-ca;
}

.tooltip[placement^='left'] > .arrow {
  @apply right--5px border-r-custom border-t-custom border-ca;
}

.tooltip[placement^='right'] > .arrow {
  @apply left--5px border-l-custom border-b-custom border-ca;
}
</style>
