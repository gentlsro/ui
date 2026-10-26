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

// Immediate server fetches seed the first client pass before rendering. Only
// source records enter the payload; functions and display models stay local.
const nuxtApp = useNuxtApp()
const initialSourceKey = `__pivot-source:${useId()}`
// Nuxt retains state initializers. Even an empty setup closure can retain the
// owning store and its detached DOM, so an undefined seed needs no initializer.
const initialSource = useState<{ data: T[], count?: number } | undefined>(
  initialSourceKey,
)
onUnmounted(() => {
  nuxtApp.runWithContext(() => clearNuxtState(initialSourceKey, { reset: false }))
})

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
  sourceData,
  totalRows,
} = usePivotStore({
  props,
  initialData: initialSource.value?.data,
  initialCount: initialSource.value?.count,
})

emits.value = {
  rowClick: payload => emit('click:row', payload),
  cellClick: payload => emit('click:cell', payload),
}

// Syncing merged props with store
syncRefs(toRef(() => mergedProps.value.ui), ui)
syncRefs(toRef(() => mergedProps.value.loadData), loadData)
syncRefs(toRef(() => mergedProps.value.collapseConfig), collapseConfig)
syncRefs(toRef(() => mergedProps.value.performance), performance)

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

// Keep setup synchronous for native consumers without Suspense. Static data
// commits synchronously; async immediate fetches preserve SSR through prefetch.
onServerPrefetch(async () => {
  await initialLoad
  if (shouldFetchPivotData({ data: props.data, loadData: mergedProps.value.loadData }, 'setup')) {
    initialSource.value = { data: sourceData.value, count: totalRows.value }
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
    <slot name="top">
      <PivotTop />
    </slot>

    <slot name="header">
      <PivotHeader />
    </slot>

    <slot
      v-if="$slots.content || visibleData.length || !isInitialLoad"
      name="content"
    >
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
