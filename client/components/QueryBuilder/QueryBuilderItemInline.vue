<script setup lang="ts">
import { klona } from 'klona/full'

// Types
import type { IQueryBuilderItem, IQueryBuilderItemProps } from './types/query-builder-item-props.type'

// Functions
import { useColors } from '../../../shared/composables/useColors'
import { useQueryBuilderStore } from './query-builder.store'

// Constants
import { QUERY_BUILDER_LEVEL_COLORS } from './constants/query-builder-level-colors.constant'
import { NON_VALUE_COMPARATORS } from '$utils/shared/constants/comparators-by-category.const'

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

// Store
const { columns, items } = storeToRefs(useQueryBuilderStore())

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
  const isValid = await $z.value.$validate()

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

const $z = useZod({ scope: 'qb' })
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{ 'is-first-child': isFirstChild }"
    :style="{ '--bracketColor': levelColor }"
    v-bind="$attrs"
    :data-path="itemLocal.path"
  >
    <!-- Field -->
    <span
      font="semibold"
      text="caption xs"
      color="black dark:white"
      truncate
      max-w="40"
    >
      {{ colSelected?.label }}
    </span>

    <!-- Comparator -->
    <span
      p="x-2px"
      text="caption xs"
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
      class="qb-item__value"
    />

    <Btn
      v-if="editable"
      size="xs"
      preset="TRASH"
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
      @show="itemEditEl?.focusInput()"
      @before-show="syncFromParent"
      @before-hide="handleMenuBeforeHide"
    >
      <Form
        no-controls
        dense
        :focus-first-input="false"
        :submit-confirmation="false"
        @submit="handleSubmit"
      >
        <QueryBuilderItem
          ref="itemEditEl"
          :item="itemLocal"
          :level
          :parent
          :editable
          no-draggable
          no-remove
          m="!0"
          p="!x-1"
          min-w="70"
          @update:comparator="menuEl?.recomputePosition()"
        />
      </Form>
    </Menu>
  </li>

  <!-- Add -->
  <Btn
    v-if="isLastChild && !noAdd && editable"
    size="xs"
    preset="ADD"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
    @click="$emit('add:row')"
  />

  <!-- Close bracket (When no add buttom is present) -->
  <div
    v-else-if="isLastChild"
    class="close-bracket"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
  >
    &ZeroWidthSpace;
  </div>
</template>

<style scoped lang="scss">
.qb-item {
  @apply relative flex gap-1 border-1 border-dashed border-ca
    rounded-custom p-l-1.5 items-center cursor-pointer;

  @apply min-h-26px; // Arbitrary number that looks good...

  &:hover {
    @apply shadow-consistent-xs shadow-ca;
  }

  &.is-first-child {
    @apply m-l-3;
  }

  &.is-last-child {
    @apply m-r-3;
  }
}

:deep(.qb-item__value) {
  @apply rounded-custom p-x-1 p-y-2px leading-tight min-w-5 text-xs text-center
    font-semibold max-w-70 truncate self-center;

  @apply bg-primary color-white;
}

.qb-item.is-first-child {
  &::before {
    @apply absolute -left-2.5 text-6 leading-none;

    content: '\2772';
    color: var(--bracketColor);
  }
}

.is-last-child {
  @apply relative;

  &::after {
    @apply absolute -right-2 text-6 leading-none font-normal;

    content: '\2773';
    color: var(--bracketColor);
  }
}

.close-bracket {
  @apply m-r-2 self-center;
}
</style>
