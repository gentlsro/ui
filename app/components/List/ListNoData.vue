<script setup lang="ts">
import { getElementSize } from '#layers/utilities/app/functions/get-element-size'

// Types
import type { IListProps } from './types/list-props.type'

// Store
import { useListStore } from './stores/list.store'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type IProps = Pick<IListProps, 'ui'>

const props = defineProps<IProps>()

const emits = defineEmits<{
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()

// Store
const { search, isLoading, listItems, searchConfig } = useListStore()

// Layout
const bannerEl = useTemplateRef('bannerEl') as any
const { height } = useElementSize(bannerEl)

const shouldShowSearchMinChars = computed(() => {
  return searchConfig?.value?.enabled
    && (search.value?.length ?? 0) < (searchConfig.value?.minChars ?? 0)
    && !isLoading.value
    && !listItems.value.length
})

const noDataClass = computed(() => {
  return props.ui?.noDataClass?.({
    defaults: LIST_DEFAULT_PROPS.ui.noDataClass(),
  })
})

const noDataStyle = computed(() => {
  return props.ui?.noDataStyle?.()
})

watch(height, () => {
  const el = unrefElement(bannerEl) as HTMLElement

  if (!el) {
    return
  }

  const { total } = getElementSize(el)

  emits('change:contentSize', {
    height: total.height,
    width: total.width,
  })
})
</script>

<template>
  <div
    v-if="shouldShowSearchMinChars"
    class="list-no-data"
    :class="noDataClass"
    :style="noDataStyle"
  >
    {{ $t('general.atLeastCharactersToSearch', { count: searchConfig?.minChars ?? 0 }) }}
  </div>

  <div
    v-else-if="!isLoading && !listItems?.length"
    class="list-no-data"
    :class="noDataClass"
    :style="noDataStyle"
  >
    {{ $t('general.noData') }}
  </div>
</template>
