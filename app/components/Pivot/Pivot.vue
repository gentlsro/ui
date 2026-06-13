<script setup lang="ts" generic="T extends IItem = IItem" vapor>
// Types
import type { IPivotProps } from './types/pivot-props.type'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

// Store
import { PIVOT_ID_KEY, usePivotStore } from './stores/pivot.store'

const props = withDefaults(defineProps<IPivotProps<T>>(), {
  ...getComponentProps('pivot'),
})

const mergedProps = computed(() => {
  return getComponentMergedProps('pivot', props)
})

// Init (we need to create a new scope)
const uuid = generateUUID()
provideLocal(PIVOT_ID_KEY, uuid)

// Store
const { pivotEl, ui, loadData, collapseConfig, config, fetchAndSetData } = usePivotStore({ props })

// Syncing merged props with store
syncRef(toRef(mergedProps.value, 'ui'), ui, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), loadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapseConfig'), collapseConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'config'), config, { direction: 'ltr' })

// Immediate fetch
const isImmediate = mergedProps.value.loadData?.immediate
  && (!props.data || !props.data.length)

if (mergedProps.value.loadData?.fnc && isImmediate) {
  await fetchAndSetData()
}

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  const style = mergedProps.value?.ui?.containerStyle?.()
  const scrollbarWidth = getScrollbarWidth()

  return {
    ...style,
    '--scrollbarWidth': `${scrollbarWidth}px`,
  }
})

onMounted(() => {
  if (!isImmediate) {
    fetchAndSetData()
  }
})
</script>

<template>
  <div
    ref="pivotEl"
    class="pivot"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot name="header">
      <PivotHeader />
    </slot>

    <slot name="content">
      <PivotContent />
    </slot>
  </div>
</template>
