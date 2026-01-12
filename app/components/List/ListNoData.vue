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
const { isLoading, listItems } = useListStore()

// Layout
const bannerEl = useTemplateRef('bannerEl') as any
const { height } = useElementSize(bannerEl)

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
  <Banner
    v-if="!isLoading && !listItems?.length"
    ref="bannerEl"
    no-transition
    :class="noDataClass"
    :style="noDataStyle"
  >
    <span text-caption>
      {{ $t('general.noData') }}
    </span>
  </Banner>
</template>
