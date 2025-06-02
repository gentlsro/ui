<script setup lang="ts">
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { IQueryBuilderGroup, IQueryBuilderGroupProps } from './types/query-builder-group-props.type'

// Functions
import { useColors } from '../../../shared/composables/useColors'

// Store
import { useQueryBuilderStore } from './query-builder.store'

// Constants
import { QUERY_BUILDER_LEVEL_COLORS } from './constants/query-builder-level-colors.constant'

const props = withDefaults(defineProps<IQueryBuilderGroupProps>(), {
  noAdd: undefined,
})
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderGroup): void
}>()

// Store
const { columns, items, queryBuilderEl, allowNegation } = storeToRefs(useQueryBuilderStore())

// Utils
const { getColor } = useColors()

// Layout
const item = toRef(props, 'item')
const isHovered = ref(false)
const conditionMenuEl = useTemplateRef('conditionMenuEl')

const levelColor = computed(() => {
  const color = QUERY_BUILDER_LEVEL_COLORS[props.level % QUERY_BUILDER_LEVEL_COLORS.length] as string

  return getColor(color)
})

function handleSetCondition(val: 'AND' | 'OR') {
  const isNegated = item.value.condition === 'NOT_AND' || item.value.condition === 'NOT_OR'

  item.value.condition = (isNegated ? 'NOT_' + val : val) as 'AND' | 'OR' | 'NOT_AND' | 'NOT_OR'
  conditionMenuEl.value?.hide()
}

function handleAddCondition(useParent?: boolean) {
  const parent = useParent ? props.parent : item.value

  if (!parent) {
    return
  }

  const newPath = `${parent.path}.children.${parent.children.length}`
  const firstColumn = toValue(columns)[0]

  parent.children = [
    ...parent.children,
    {
      id: generateUUID(),
      field: firstColumn?.field as string,
      filterField: firstColumn?.filterField as string,
      comparator: firstColumn?.comparator as ComparatorEnum,
      value: undefined as unknown as string,
      path: newPath,
      dataType: firstColumn?.dataType,
    },
  ]

  nextTick(() => {
    const addedEl = queryBuilderEl.value?.querySelector(
      `[data-path="${newPath}"]`,
    ) as HTMLElement

    setTimeout(() => {
      addedEl?.click()
    }, 150)
  })
}

function handleSetNegation() {
  switch (item.value.condition) {
    case 'AND':
      item.value.condition = 'NOT_AND'
      break

    case 'OR':
      item.value.condition = 'NOT_OR'
      break

    case 'NOT_AND':
      item.value.condition = 'AND'
      break

    case 'NOT_OR':
      item.value.condition = 'OR'
      break

    default:
      break
  }

  conditionMenuEl.value?.hide()
}

function handleRemoveGroup() {
  const idx = item.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', item.value)
}
</script>

<template>
  <!-- Condition -->
  <Btn
    :label="$t('queryBuilder.' + item.condition.toLowerCase())"
    size="xs"
    class="condition-btn color-blue-500 self-center"
    :class="{
      'is-first-child': isFirstChild,
      'is-negated': item.condition === 'NOT_AND' || item.condition === 'NOT_OR',
      '!color-blue-500': noConditionChange || !editable,
    }"
    :style="{ '--bracketColor': levelColor }"
    no-dim
    :data-path="item.path"
    :disabled="noConditionChange || !editable"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <Tooltip
      v-if="noConditionChange"
      w="70"
      :offset="12"
      text="center"
    >
      <span text="caption center">
        {{ $t('table.columnFiltersHint') }}
      </span>
    </Tooltip>

    <!-- Conditions -->
    <Menu
      ref="conditionMenuEl"
      :no-arrow="false"
    >
      <!-- Condition - And -->
      <Btn
        size="xs"
        :label="$t('queryBuilder.and')"
        :class="{
          'color-blue-500': item.condition === 'AND',
          'color-negative': item.condition === 'NOT_AND',
        }"
        @click="handleSetCondition('AND')"
      />

      <!-- Condition - Or -->
      <Btn
        size="xs"
        :label="$t('queryBuilder.or')"
        :class="{
          'color-blue-500': item.condition === 'OR',
          'color-negative': item.condition === 'NOT_OR',
        }"
        @click="handleSetCondition('OR')"
      />

      <Separator spaced />

      <!-- Negation -->
      <Toggle
        v-if="allowNegation"
        size="xs"
        :label="$t('queryBuilder.negation')"
        :model-value="item.condition === 'NOT_AND' || item.condition === 'NOT_OR'"
        @update:model-value="handleSetNegation"
      />

      <!-- Delete btn -->
      <Btn
        v-if="level"
        size="xs"
        :label="$t('general.remove')"
        preset="TRASH"
        @click="handleRemoveGroup"
      />
    </Menu>
  </Btn>

  <!-- Children -->
  <QueryBuilderRowInline
    v-for="(child, idx) in item.children"
    :key="child.id"
    :item="child"
    :level="level + 1"
    :parent="item"
    :is-last-child="idx === item.children.length - 1"
    :is-first-child="idx === 0"
    :no-add
    :remove-fnc
    :modify-fnc
    :editable
    :style="{
      ...(isHovered && {
        borderColor: 'var(--bracketColor)',
        borderStyle: 'solid',
      }),
    }"
    @add:row="handleAddCondition()"
  />

  <Btn
    v-if="isLastChild && !noAdd && editable"
    size="xs"
    preset="ADD"
    self-center
    :style="{
      '--bracketColor': levelColor,
      'color': levelColor,
    }"
    class="last-child-bracket"
    @click="handleAddCondition(true)"
  />

  <!-- Close bracket (When no add button is present) -->
  <div
    v-else-if="isLastChild"
    class="last-child-bracket"
    :class="{ 'is-last-child': isLastChild }"
    :style="{ '--bracketColor': levelColor, 'color': levelColor }"
  >
    &ZeroWidthSpace;
  </div>
</template>

<style scoped lang="scss">
.condition-btn {
  &.is-negated {
    @apply color-negative;
  }

  &.is-first-child {
    @apply m-l-2;

    &::before {
      @apply absolute -left-2.5 text-6 leading-none font-normal;

      content: '\2772';
      color: var(--bracketColor);
    }
  }
}

.last-child-bracket {
  @apply relative self-center m-r-2;

  &::after {
    @apply absolute -right-2 text-6 leading-none font-normal;

    content: '\2773';
    color: var(--bracketColor);
  }
}
</style>
