<script setup lang="ts">
import type { Placement } from '@floating-ui/dom'

// Types
import type { ISelectorProps } from './types/selector-props.type'

// Store
import { useSelectorStore } from './stores/selector.store'
import type { IListProps } from '../List/types/list-props.type'
import { getElementSize } from '$utils/client/functions/get-element-size'

type IProps = Pick<
  ISelectorProps,
  | 'listProps' | 'menuProps' | 'label' | 'noMenuMatchWidth' | 'optionKey'
  | 'optionLabel' | 'emitKey' | 'noFilter' | 'noSort' | 'clearable' | 'multi'
  | 'loadData' | 'clearOptionsOnMenuHide' | 'noSearch'
>
& { referenceEl?: any, placement: Placement }

const props = defineProps<IProps>()

// Store
const {
  model,
  menuEl,
  addedItems,
  isPickerActive,
  search,
  options,
  isLoading,
} = storeToRefs(useSelectorStore())

// Layout
const contentHeight = ref()
const listEl = useTemplateRef('listEl')
const placement = defineModel<Placement>('placement')

const listProps = computed(() => {
  return {
    ...props.listProps ?? {},
    ...(props.emitKey ? { selectionConfig: { emitKey: true } } : {}),
    ...(props.noFilter ? { searchConfig: { enabled: false } } : {}),
    ...(props.noSort ? { sortingConfig: { enabled: false } } : {}),
  } as IListProps
})

const menuClass = computed(() => {
  return {
    'has-label': !!props.label,
    'is-menu-width-matched': !props.noMenuMatchWidth,
  }
})

const menuStyle = computed(() => {
  return { '--floatingHeight': `${contentHeight.value}px` }
})

function handleModelUpdate() {
  if (!props.multi) {
    $hide()
  }
}

function handleHeightChange(height: number) {
  const listDom = unrefElement(listEl as any) as HTMLElement
  const nonContentEls = Array.from(listDom.children)
    .filter(el => !el.classList.contains('list-content')) as HTMLElement[]

  const nonContentHeight = nonContentEls.reduce((agg, el) => {
    const { total } = getElementSize(el)

    return agg + total.height
  }, 0)

  contentHeight.value = height
  + nonContentHeight
  + 2 // Top and bottom border
}

function handleHide() {
  if (props.clearOptionsOnMenuHide && props.loadData?.fnc) {
    options.value = []
    contentHeight.value = 0
  }
}

watch(contentHeight, () => {
  menuEl.value?.recomputePosition()
})
</script>

<template>
  <MenuProxy
    ref="menuEl"
    v-bind="menuProps"
    v-model="isPickerActive"
    v-model:placement="placement"
    tabindex="-1"
    max-height="50%"
    :reference-target="referenceEl"
    class="selector-menu"
    :class="menuClass"
    :style="menuStyle"
    data-onboarding="selector-menu"
    data-cy="drop-down-list"
    @hide="handleHide"
  >
    <List
      ref="listEl"
      v-bind="listProps"
      v-model:selection="model"
      v-model:search="search"
      v-model:added-items="addedItems"
      v-model:items="options"
      v-model:is-loading="isLoading"
      :load-data
      :item-key="optionKey"
      :item-label="optionLabel"
      :search-config="{ enabled: !noSearch }"
      :selection-config="{ enabled: true, emitKey, multi }"
      :no-filter
      :no-sort
      :clearable
      @change:content-size="handleHeightChange($event.height)"
      @update:selection="handleModelUpdate"
    >
      <!-- Above -->
      <template #above>
        <slot name="above" />
      </template>

      <!-- Search -->
      <template #search>
        <ListSearch
          v-if="!noSearch"
          v-model:search="search"
          :ui="listProps.ui"
          :input-props="listProps.searchInputProps"
        />
      </template>

      <!-- Content -->
      <template #content="{ ui }">
        <ListContent
          :ui
          @change:content-size="handleHeightChange($event.height)"
        >
          <template #item="{ row, index }">
            <slot
              name="option"
              :item="row"
              :index
            />
          </template>
        </ListContent>
      </template>

      <!-- Below -->
      <template #below>
        <slot name="below" />
      </template>
    </List>
  </MenuProxy>
</template>
