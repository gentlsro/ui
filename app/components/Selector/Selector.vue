<script setup lang="ts" vapor>
// Types
import type { ISelectorProps } from './types/selector-props.type'
import type { ISelectorEmits } from './types/selector-emits.type'

// Functions
import { useSelector } from './composables/useSelector'
import { useFieldUtils } from '../Field/functions/useFieldUtils'
import { listFetchData } from '../List/functions/list-fetch-data'
import { useInputValidationUtils } from '../Inputs/functions/useInputValidationUtils'

// Store
import { SELECTOR_ID_KEY, useSelectorStore } from './stores/selector.store'
import { selectorTransformOptions } from './functions/selector-transform-options'
import { getListItemEmitValue, getListItemKey } from '../List/functions/helpers'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../InputWrapper/constants/input-wrapper-default-props'

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

const fieldEl = useTemplateRef('fieldEl')

defineExpose({
  focus: () => handleFocusOrClick(),
  select: () => handleFocusOrClick(),
  blur: () => isPickerActive.value = false,
  clear: () => {
    model.value = props.emptyValue
    search.value = ''
  },
})

// Init
const uuid = generateUUID()
provideLocal(SELECTOR_ID_KEY, uuid)

// Validations
const { path } = useInputValidationUtils(props)

// Utils
const { fn } = useFn({
  source: { type: 'component', name: 'Selector' },
})

const onFocus = props.eventHandlers?.onFocus
const onBeforeFocus = props.eventHandlers?.onBeforeFocus

// Store
const {
  model,
  search,
  isPickerActive,
  options,
  optionsOriginal,
} = useSelectorStore({ props })

const mergedProps = computed(() => getComponentMergedProps('selector', props))

// Field
const {
  inputId,
  isEditable,
  isBlurred,
  getFieldProps,
  handleBlur,
  handleFocusOrClick,
  handleClickWrapper,
} = useFieldUtils({
  props,
  emit: event => emits(event),
  getElement: () => fieldEl.value?.controlElement,
  onBeforeFocus: ev => {
    if (isPreventNextFocus.value && ev instanceof FocusEvent) {
      isPreventNextFocus.value = false

      return { shouldFocus: false, shouldHideFloating: false }
    }
    isPreventNextFocus.value = false

    // A click can finish after focus has already opened the menu and its search.
    if (isPickerActive.value) {
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
} = useSelector({ props, emits, getElement: () => fieldEl.value?.controlElement })

const referenceEl = ref<HTMLDivElement>()
const size = toRef(props, 'size')
const readonly = toRef(props, 'readonly')

const wrapperClass = computed(() => {
  return [
    `menu--${placement.value}`,
    {
      'is-active': isPickerActive.value,
      'has-content': hasContent.value,
      'is-menu-width-matched': !props.noMenuMatchWidth,
      'is-focused': !isBlurred.value && !isPickerActive.value,
    },
  ]
})

function handleSelectorClick(ev: MouseEvent) {
  if (ev.target instanceof Element && ev.target.closest('.control')) {
    handleFocusOrClick(ev)

    return
  }

  handleClickWrapper(ev)
}

function handleClear() {
  model.value = props.emptyValue
  emits('clear')
}

// Options
syncRef(
  optionsOriginal,
  options,
  {
    immediate: true,
    direction: 'both',
    transform: {
      ltr: left => selectorTransformOptions(left, props),
    },
  },
)

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

// Preselect first
function preselectFirst() {
  const isEmpty = isNil(model.value)
    || model.value === props.emptyValue
    || model.value === ''

  if (props.preselectFirst && isEmpty) {
    const firstOption = options.value[0]

    if (firstOption) {
      model.value = getListItemEmitValue(firstOption, {
        emitKey: props.emitKey,
        itemKey: props.optionKey,
        itemByKey: { [getListItemKey(firstOption, props.optionKey)]: firstOption },
      })
    }
  }
}

preselectFirst()

// Styles - append
const appendClass = computed(() => {
  return mergedProps.value.ui?.appendClass?.({
    defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui.appendClass(),
  })
})

// Styles - append
const appendStyle = computed(() => {
  return mergedProps.value.ui?.appendStyle?.()
})

// Read the public Field contract after it mounts or changes layout.
watch(
  [fieldEl, () => props.layout],
  () => {
    referenceEl.value = fieldEl.value?.element
      ?.querySelector<HTMLDivElement>('.input-wrapper-border') ?? undefined
  },
  { flush: 'post' },
)

// Initialize the options if `immediate` is set
if (props.immediateFetch && mergedProps.value.loadData?.fnc) {
  const mergedListPropsLoadData = getComponentMergedProps('list', mergedProps.value.listProps)

  listFetchData({
    search: search.value ?? '',
    fn,
    loadData: merge(mergedListPropsLoadData.loadData, mergedProps.value.loadData),
    items: [],
    modifiers: mergedProps.value.listProps?.modifiers,
  }).then(({ items }) => {
    options.value = items
    preselectFirst()
  })
}
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
    @focus="handleFocusOrClick"
    @blur="handleBlur"
    @click="handleSelectorClick"
  >
    <!-- Label -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
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
        :name="name || path || placeholder"
        :chip-props="mergedProps.chipProps"
      >
        <template
          v-if="$slots['selection-item']"
          #default="{ item, index, optionByKey, isLast, handleRemove }"
        >
          <slot
            name="selection-item"
            :item
            :index
            :option-by-key
            :is-last
            :handle-remove
            :chip-props="mergedProps.chipProps"
          />
        </template>
      </SelectorInner>
    </slot>

    <!-- Append -->
    <template #append>
      <div
        class="selector-append"
        :class="appendClass"
        :style="appendStyle"
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
          <div class="dropdown-icon i-fluent:chevron-up-down-24-regular" />
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
        <template
          v-if="$slots['menu-above']"
          #above
        >
          <slot name="menu-above" />
        </template>

        <!-- Option -->
        <template
          v-if="$slots.option"
          #option="data"
        >
          <slot
            name="option"
            v-bind="data"
          />
        </template>

        <!-- Option group -->
        <template
          v-if="$slots['option-group']"
          #option-group="data"
        >
          <slot
            name="option-group"
            v-bind="data"
          />
        </template>

        <!-- Below -->
        <template
          v-if="$slots['menu-below']"
          #below
        >
          <slot name="menu-below" />
        </template>
      </SelectorMenu>
    </slot>
  </Field>
</template>

<style lang="scss" scoped>
.selector {
  &-append {
    @apply flex gap-1 flex-center shrink-0;
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
