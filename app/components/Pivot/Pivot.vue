<script setup lang="ts" generic="T extends IItem = IItem" vapor>
// Types
import type { IPivotProps } from './types/pivot-props.type'
import type { IPivotEmits } from './types/pivot-emits.type'

// Functions
import { pivotGetExposed } from './functions/pivot-get-exposed'
import { shouldFetchPivotData } from './functions/pivot-should-fetch-data'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

// Store
import { PIVOT_ID_KEY, usePivotStore } from './stores/pivot.store'

const props = withDefaults(defineProps<IPivotProps<T>>(), {
  ...getComponentProps('pivot'),
})

const emit = defineEmits<IPivotEmits<T>>()

const mergedProps = computed(() => {
  return getComponentMergedProps('pivot', props)
})

// Init (we need to create a new scope)
const uuid = generateUUID()
provideLocal(PIVOT_ID_KEY, uuid)

// Store
const {
  pivotEl,
  ui,
  loadData,
  collapseConfig,
  performance,
  fetchAndSetData,
  initialize,
  initialization,
  isFirstFetch,
  visibleData,
  emits,
} = usePivotStore({ props })

emits.value = {
  rowClick: payload => emit('click:row', payload),
  cellClick: payload => emit('click:cell', payload),
}

// Syncing merged props with store
syncRef(toRef(mergedProps.value, 'ui'), ui, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), loadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapseConfig'), collapseConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'performance'), performance, { direction: 'ltr' })

defineExpose(pivotGetExposed())

// Keep the first-load overlay until both fetching and transformation finish.
const isInitialLoad = ref(true)
const fetchOnMount = shouldFetchPivotData({
  data: props.data,
  loadData: mergedProps.value.loadData,
}, 'mounted')

async function initializePivot() {
  try {
    await initialization
    if (shouldFetchPivotData({
      data: props.data,
      loadData: mergedProps.value.loadData,
    }, 'setup')) {
      await fetchAndSetData()
      await initialize()
    }
  } finally {
    if (!fetchOnMount) {
      isFirstFetch.value = false
    }
  }
}

const initialLoad = initializePivot()

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

onMounted(async () => {
  try {
    await initialLoad
    if (fetchOnMount) {
      await fetchAndSetData()
      await initialize()
    }
    // Keep the SSR overlay until the mounted scrollers have updated their DOM.
    await nextTick()
  } finally {
    isFirstFetch.value = false
    isInitialLoad.value = false
  }
})

// SSR and hydration must choose the same content branch. Client navigation can
// render the shell immediately while initial data is being prepared.
if (import.meta.server || useNuxtApp().isHydrating) {
  await initialLoad
}
</script>

<template>
  <div
    ref="pivotEl"
    class="pivot"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot name="top">
      <PivotTop />
    </slot>

    <slot name="header">
      <PivotHeader />
    </slot>

    <slot name="content">
      <PivotContent v-if="visibleData.length" />
      <PivotEmpty v-else-if="!isInitialLoad" />
    </slot>

    <slot
      name="loading"
      :is-initial-load="isInitialLoad"
    >
      <PivotLoading
        :initial="isInitialLoad"
        :ui="mergedProps.ui"
      />
    </slot>

    <PivotPerformanceWarning />
  </div>
</template>
