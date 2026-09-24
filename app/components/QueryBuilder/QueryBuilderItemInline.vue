<script setup lang="ts">
// Types
import type { IQueryBuilderItem, IQueryBuilderItemProps } from './types/query-builder-item-props.type'

// Functions
import { useColors } from '../../composables/useColors'
import { useQueryBuilderStore } from './query-builder.store'

// Constants
import { QUERY_BUILDER_LEVEL_COLORS } from './constants/query-builder-level-colors.constant'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IQueryBuilderItemProps>(), {
  noAdd: undefined,
})

const emits = defineEmits<{
  (e: 'add:row'): void
  (e: 'delete:row', item: IQueryBuilderItem): void
}>()

// Constants
const NON_VALUE_COMPARATORS = getNonValueComparators()

// Store
const { columns, items } = useQueryBuilderStore()

// Utils
const { getColor } = useColors()

// Injections
const noItemOverlay = inject('noItemOverlay', ref(false))

// Layout
const menuEl = useTemplateRef('menuEl')
const itemEditEl = useTemplateRef('itemEditEl')

const {
  model: itemLocal,
  syncFromParent,
  syncToParent,
} = useRefReset(() => props.item)

const colSelected = computed(() => {
  return columns.value.find(col => col.field === props.item.field)
})

const isNonValueComparator = computed(() => {
  return NON_VALUE_COMPARATORS.includes(itemLocal.value.comparator)
})

// Root conditions are not wrapped in brackets, the table top already groups them
const isRootLevel = computed(() => props.level <= 1)

const levelColor = computed(() => {
  const color = QUERY_BUILDER_LEVEL_COLORS[props.level % QUERY_BUILDER_LEVEL_COLORS.length] as string

  return getColor(color)
})

function handleRemoveCondition() {
  if (props.removeFnc) {
    props.removeFnc({ ...props.item, misc: { column: colSelected.value } })

    return
  }

  const idx = props.item.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  if (!parent.children.length) {
    const parentOfParent = get(toValue(items), parentPath.split('.').slice(0, -2).join('.'))

    if (parentOfParent) {
      const selfIdx = parentOfParent.children
        .findIndex((child: IQueryBuilderItem) => props.item.path === child.path)

      parentOfParent.children = parentOfParent.children.toSpliced(selfIdx, 1)
    }

    return
  }

  parent.children = [...parent.children]

  emits('delete:row', props.item)
}

async function handleSubmit() {
  const { isValid } = validation.validate()

  if (isValid) {
    menuEl.value?.hide(true)
  }
}

async function handleMenuBeforeHide() {
  const isEmptyArray = Array.isArray(itemLocal.value.value)
    && !itemLocal.value.value.length

  const isUndefinedValue = itemLocal.value.value === undefined
    && !isNonValueComparator.value

  if (
    !itemLocal.value.comparator
    || isEmptyArray
    || isUndefinedValue
  ) {
    handleRemoveCondition()
  } else {
    // Fun fact: if you don't initialize the `modifyFnc` here and use it directly,
    // it will be undefined. Why? Because fuck you, that's why.
    const modifyFnc = props.modifyFnc

    if (modifyFnc) {
      modifyFnc({ ...itemLocal.value, misc: { column: colSelected.value } })

      return
    }

    syncToParent()
  }
}

const { validation } = useArk({ scope: '_qb' })
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{ 'is-first-child': isFirstChild, 'is-root': isRootLevel }"
    :style="{ '--bracketColor': levelColor }"
    v-bind="$attrs"
    :data-path="itemLocal.path"
  >
    <!-- Field -->
    <span
      font="medium"
      text="xs"
      color="true-gray-800 dark:true-gray-100"
      truncate
      max-w="40"
    >
      {{ colSelected?._label }}
    </span>

    <!-- Comparator -->
    <span
      text="xs"
      color="true-gray-500 dark:true-gray-400"
      shrink-0
    >
      {{ $t(`comparator.${item.comparator?.replaceAll('.', '|')}`).toLocaleLowerCase() }}
    </span>

    <!-- Value -->
    <ValueFormatter
      v-if="!isNonValueComparator"
      :value="item.value"
      :data-type="colSelected?.dataType"
      :format="colSelected?.format"
      :comparator="item.comparator"
      :source="{ type: 'component', name: 'QueryBuilderItemInline' }"
      class="qb-item__value"
    />

    <Btn
      v-if="editable"
      size="xs"
      icon="i-lucide:x"
      class="qb-item__remove"
      @click.stop.prevent="handleRemoveCondition"
      @mousedown.stop.prevent
    />

    <!-- Item edit menu -->
    <Menu
      v-if="editable"
      ref="menuEl"
      :no-arrow="false"
      :no-item-overlay
      :fit="false"
      placement="bottom-start"
      min-w="min"
      :ui="{ contentClass: ({ defaults }) => `${defaults.all} !p-0` }"
      @show="itemEditEl?.focusInput()"
      @before-show="syncFromParent"
      @before-hide="handleMenuBeforeHide"
    >
      <Form
        no-controls
        dense
        :focus-first-input="false"
        :prevent-submit-on-enter="false"
        :submit-confirmation="false"
        :ui="{ contentClass: ({ defaults }) => `${defaults.all} !p-0` }"
        @submit="handleSubmit"
      >
        <!-- The popover is the container: one even inset, a slim header and no card -->
        <div class="qb-item-editor">
          <div class="qb-item-editor__header">
            <span>{{ $t('queryBuilder.condition') }}</span>

            <span class="qb-item-editor__hint">
              <kbd>↵</kbd> {{ $t('general.apply') }}
            </span>
          </div>

          <QueryBuilderItem
            ref="itemEditEl"
            :item="itemLocal"
            :level
            :parent
            :editable
            no-draggable
            no-remove
            class="qb-item-editor__item"
            min-w="70"
            @update:comparator="menuEl?.recomputePosition()"
          />
        </div>
      </Form>
    </Menu>
  </li>

  <!-- Add -->
  <Btn
    v-if="isLastChild && !noAdd && editable"
    size="xs"
    preset="ADD"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild, 'is-root': isRootLevel }"
    :style="{ '--bracketColor': levelColor, 'color': isRootLevel ? undefined : levelColor }"
    @click="$emit('add:row')"
  />

  <!-- Close bracket (When no add buttom is present) -->
  <div
    v-else-if="isLastChild"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild, 'is-root': isRootLevel }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
  >
    &ZeroWidthSpace;
  </div>
</template>

<style scoped lang="scss">
@use '#layers/ui/app/css/subtle-remove-btn-mixin.scss' as *;

.qb-item-editor {
  @apply flex flex-col gap-2 p-3;

  &__header {
    @apply flex items-center justify-between gap-4 text-xs font-medium
      color-true-gray-500 dark:color-true-gray-400;
  }

  &__hint {
    @apply flex items-center gap-1 font-normal;

    kbd {
      @apply inline-flex items-center h-4.5 p-x-1 rounded border-1 font-sans text-10px leading-none
        border-true-gray-200 dark:border-true-gray-700 bg-true-gray-50 dark:bg-true-gray-800;
    }
  }
}

// The row is laid out by the popover here, not drawn as its own card
.qb-item.qb-item-editor__item {
  @apply m-0 p-0 min-h-0 bg-transparent border-0;
}

.qb-item {
  @apply relative flex gap-1 border-1 border-true-gray-200 dark:border-true-gray-700
    rounded-lg p-l-2 p-r-0.5 items-center cursor-pointer bg-white dark:bg-true-gray-900
    min-h-7 transition-colors;

  &:hover {
    @apply border-true-gray-300 dark:border-true-gray-600 bg-true-gray-50 dark:bg-true-gray-800;
  }

  &.is-first-child {
    @apply m-l-3;
  }

  &.is-last-child {
    @apply m-r-3;
  }

  &.is-root {
    @apply m-x-0;
  }

  &__remove {
    @include subtle-remove-btn;
  }
}

:deep(.qb-item__value) {
  // 16px line + 2px padding = an even 20px, so it lands on whole pixels and shares
  // the label's baseline (an odd height sat half a pixel off)
  @apply rounded-md p-x-1.5 p-y-2px leading-4 min-w-5 text-xs text-center
    font-medium max-w-70 truncate self-center
    bg-primary/10 color-primary;
}

// `dark:` variants inside `:deep` do not apply, so dark mode gets its own rule
// (same coloring as the filter chips)
.dark .qb-item :deep(.qb-item__value) {
  @apply bg-primary/40 color-white;
}

.qb-item.is-first-child:not(.is-root) {
  &::before {
    @apply absolute -left-2.5 text-6 leading-none;

    content: '\2772';
    color: var(--bracketColor);
  }
}

.is-last-child:not(.is-root) {
  @apply relative;

  &::after {
    @apply absolute -right-2 text-6 leading-none font-normal;

    content: '\2773';
    color: var(--bracketColor);
  }
}

.close-bracket {
  @apply m-r-2 self-center;

  &.is-root {
    @apply m-x-0 color-true-gray-500 dark:color-true-gray-400 rounded-lg;
  }
}
</style>
