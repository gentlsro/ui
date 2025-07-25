<script setup lang="ts">
// Types
import type { IListProps } from '../List/types/list-props.type'
import type { ISelectorProps } from './types/selector-props.type'
import type { ISelectorEmits } from './types/selector-emits.type'

// Functions
import { useSelector } from './composables/useSelector'
import { useFieldUtils } from '../Field/functions/useFieldUtils'
import { listFetchData } from '../List/functions/list-fetch-data'
import { useInputValidationUtils } from '../Inputs/functions/useInputValidationUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { selectorIdKey, useSelectorStore } from './stores/selector.store'
import { selectorTransformOptions } from './functions/selector-transform-options'
import { getListItemEmitValue, getListItemKey } from '../List/functions/helpers'
import { getActivePinia } from 'pinia'

const props = withDefaults(defineProps<ISelectorProps>(), {
  ...getComponentProps('selector'),

  maxChipsRows: props => {
    switch (props.layout) {
      case 'inline':
        return 10

      case 'label-inside':
      case 'regular':
      default:
        return 2
    }
  },
})

const emits = defineEmits<ISelectorEmits>()

defineExpose({
  focus: () => handleFocusOrClick(),
  select: () => handleFocusOrClick(),
  blur: () => isPickerActive.value = false,
  clear: () => {
    model.value = props.emptyValue
    search.value = ''
  },
})

// Validations
const { path } = useInputValidationUtils(props)

// Utils
const { handleRequest } = useRequest()
const self = getCurrentInstance()
const uuid = injectLocal(selectorIdKey, useId()) as string

const onFocus = props.eventHandlers?.onFocus
const onBeforeFocus = props.eventHandlers?.onBeforeFocus

const mergedProps = computed(() => {
  return getComponentMergedProps('selector', props)
})

provideLocal(selectorIdKey, uuid)

// Store
const selectorStore = useSelectorStore({ props })
const {
  model: modelStore,
  search: searchStore,
  isPickerActive,
  addedItems: addedItemsStore,
  options: optionsStore,
  initialMap,
} = storeToRefs(selectorStore)

// Field
const {
  el,
  inputId,
  isEditable,
  getFieldProps,
  handleFocusOrClick,
} = useFieldUtils({
  props,
  onBeforeFocus: ev => {
    if (isPreventNextFocus.value) {
      isPreventNextFocus.value = false

      return { shouldFocus: false, shouldHideFloating: false }
    }

    return onBeforeFocus?.(ev, isPickerActive) ?? {}
  },
  onFocus: ev => onFocus ? onFocus(ev, isPickerActive) : isPickerActive.value = true,
})

const fieldProps = getFieldProps(props)

// Layout
const {
  isPreventNextFocus,
  hasContent,
  handleBeforeHide,
  handleBeforeShow,
  handleHide,
  handleShow,
} = useSelector({ props, emits, el })

const fieldEl = useTemplateRef('fieldEl')
const referenceEl = ref<HTMLDivElement>()
const search = defineModel<string>('search')
const model = defineModel<any>()
const addedItems = defineModel<IListProps['addedItems']>(
  'addedItems',
  { default: () => [] },
)

const wrapperClass = computed(() => {
  return [
    `menu--${placement.value}`,
    {
      'is-active': isPickerActive.value,
      'has-content': hasContent.value,
      'is-menu-width-matched': !props.noMenuMatchWidth,
    },
  ]
})

function handleClear() {
  model.value = props.emptyValue
  emits('clear')
}

// Options
const options = defineModel<NonNullable<ISelectorProps['options']>>('options', { default: () => [] })
options.value = selectorTransformOptions(options.value, props)

const hasClearButton = computed(() => {
  return isEditable.value && props.clearable && hasContent.value
})

// Picker
const placement = ref(mergedProps.value?.menuProps?.placement ?? 'bottom')

const menuProps = computed(() => {
  const _menuProps = mergedProps.value.menuProps ?? {}
  const matchWidth = !props.noMenuMatchWidth

  if (!isNil(props.noMenuMatchWidth)) {
    return {
      ..._menuProps,
      ...(
        matchWidth
          ? { offset: 0, noArrow: true, matchWidth }
          : { offset: 8, noArrow: false, matchWidth: false }
      ),
    }
  }

  return _menuProps
})

// Sync with store
syncRef(model, modelStore, { direction: 'both', immediate: false })
syncRef(search, searchStore, { direction: 'both' })
syncRef(addedItems, addedItemsStore, { direction: 'both' })
syncRef(options, optionsStore, { direction: 'both' })
syncRef(toRef(props, 'initialMap', {}), initialMap, { direction: 'ltr' })

// Preselect first
if (props.preselectFirst) {
  const firstOption = options.value[0]

  if (firstOption) {
    model.value = getListItemEmitValue(firstOption, {
      emitKey: props.emitKey,
      itemKey: props.optionKey,
      itemByKey: { [getListItemKey(firstOption, props.optionKey)]: firstOption },
    })
  }
}

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(fieldEl as any)?.querySelector('.input-wrapper-border') as HTMLDivElement
})

// When layout changes, we need to set new reference target for menu
watch(
  () => props.layout,
  () => {
    nextTick(() => {
      referenceEl.value = self?.proxy?.$el.querySelector('.input-wrapper-border')
    })
  },
)

// Initialize the options if `immediate` is set
if (props.immediateFetch && mergedProps.value.loadData?.fnc) {
  listFetchData({
    search: search.value,
    handleRequest,
    loadData: mergedProps.value.loadData,
    items: [],
    modifiers: mergedProps.value.listProps?.modifiers,
  }).then(({ items }) => options.value = items)
}

// Dispose of store on unmount
onUnmounted(() => {
  selectorStore.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[selectorStore.$id]
})
</script>

<template>
  <Field
    v-bind="fieldProps"
    :id="inputId"
    ref="fieldEl"
    :ui="mergedProps.ui"
    :has-content
    :class="wrapperClass"
    data-onboarding="selector"
    .focus="handleFocusOrClick"
    @focus="handleFocusOrClick"
    @click="handleFocusOrClick"
  >
    <!-- Label -->
    <template #label="labelProps">
      <slot
        name="label"
        v-bind="labelProps"
      />
    </template>

    <!-- Prepend -->
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <!-- Content -->
    <slot>
      <SelectorInner
        ref="el"
        :ui="mergedProps.ui"
        :use-scroller
        :max-chips-rows
        :readonly
        :disabled
        :option-label
        :empty-value
        :multi
        :to
        :emits
        :option-to
        :name="name || path || label || placeholder"
      >
        <template #default="{ item, index, optionByKey }">
          <slot
            name="selection-item"
            :item
            :index
            :option-by-key
          />
        </template>
      </SelectorInner>
    </slot>

    <!-- Append -->
    <template #append>
      <div
        class="selector-append"
        :class="mergedProps.ui?.appendClass"
      >
        <InputClearBtn
          v-if="hasClearButton"
          :clear-confirmation
          :size
          @clear="handleClear"
        />

        <slot name="append" />

        <slot
          v-if="isEditable && !noDropdownIcon"
          name="dropdown-icon"
          :is-open="isPickerActive"
        >
          <div
            i-fluent:chevron-up-down-24-regular
            class="dropdown-icon"
          />
        </slot>
      </div>
    </template>

    <!-- Menu -->
    <slot name="menu">
      <SelectorMenu
        v-model:placement="placement"
        :menu-props
        :list-props="mergedProps.listProps"
        :label
        :no-menu-match-width
        :reference-el
        :option-key
        :option-label
        :emit-key
        :no-filter
        :no-sort
        :clearable
        :multi
        :no-search
        :load-data="mergedProps.loadData"
        :clear-options-on-menu-hide
        :emits
        @before-hide="handleBeforeHide"
        @hide="handleHide"
        @before-show="handleBeforeShow"
        @show="handleShow"
      >
        <!-- Above -->
        <template #above>
          <slot name="menu-above" />
        </template>

        <!-- Option -->
        <template #option="data">
          <slot
            name="option"
            v-bind="data"
          />
        </template>

        <!-- Below -->
        <template #below>
          <slot name="menu-below" />
        </template>
      </SelectorMenu>
    </slot>
  </Field>
</template>

<style lang="scss" scoped>
.selector {
  &-append {
    @apply flex gap-1 flex-center m-x-2 shrink-0;
  }
}

.dropdown-icon {
  @apply shrink-0 color-ca inline cursor-pointer;
}

.wrapper--sm {
  .dropdown-icon {
    @apply h-3.5 w-3.5;
  }
}

.wrapper--md {
  .dropdown-icon {
    @apply h-4 w-4;
  }
}

.is-active {
  :deep(.wrapper__body:after) {
    @apply border-primary/50 dark:border-primary/50;
  }
}

@screen sm {
  .is-active.is-menu-width-matched.menu--bottom {
    :deep(.wrapper__body:after) {
      @apply rounded-b-0;
    }

    :deep(.input-wrapper-border) {
      @apply rounded-b-0 border-primary/40;
    }
  }

  .is-active.is-menu-width-matched.menu--top {
    :deep(.wrapper__body:after) {
      @apply rounded-t-0;
    }

    :deep(.input-wrapper-border) {
      @apply rounded-t-0 border-primary/40;
    }
  }
}
</style>
