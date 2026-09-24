<script setup lang="ts">
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { IQueryBuilderGroup, IQueryBuilderGroupProps } from './types/query-builder-group-props.type'

// Store
import { useQueryBuilderStore } from './query-builder.store'

const props = defineProps<IQueryBuilderGroupProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderGroup): void
}>()

// Store
const {
  allowNegation,
  draggedItem,
  items,
  hoveredItem,
  maxNestingLevel,
  collapsedById,
  columns,
  itemIdToFocus,
} = useQueryBuilderStore()

// Layout
const group = toRef(props, 'item')

const isNegated = computed(() => {
  return group.value.condition === 'NOT_AND' || group.value.condition === 'NOT_OR'
})

function handleSetCondition(val: 'AND' | 'OR') {
  const isNegated = group.value.condition === 'NOT_AND' || group.value.condition === 'NOT_OR'

  group.value.condition = (isNegated ? `NOT_${val}` : val) as 'AND' | 'OR' | 'NOT_AND' | 'NOT_OR'
}

function handleSetNegation() {
  switch (group.value.condition) {
    case 'AND':
      group.value.condition = 'NOT_AND'
      break

    case 'OR':
      group.value.condition = 'NOT_OR'
      break

    case 'NOT_AND':
      group.value.condition = 'AND'
      break

    case 'NOT_OR':
      group.value.condition = 'OR'
      break

    default:
      break
  }
}

function handleAddCondition() {
  // Prefilled with the first column, like the inline query builder
  const firstColumn = toValue(columns)[0]
  const id = generateUUID()

  group.value.children = [
    ...group.value.children,
    {
      id,
      field: firstColumn?.field as string,
      filterField: firstColumn?.filterField as string,
      comparator: firstColumn?.comparator as ComparatorEnum,
      dataType: firstColumn?.dataType,
      value: undefined as unknown as string,
      path: `${group.value.path}.children.${group.value.children.length}`,
    },
  ]

  itemIdToFocus.value = id
}

function handleAddGroup() {
  group.value.children = [
    ...group.value.children,
    {
      id: generateUUID(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: `${group.value.path}.children.${group.value.children.length}`,
    },
  ]
}

function handleRemoveGroup() {
  const idx = group.value.path.split('.').pop()
  const parentPath = props.item.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children.splice(idx, 1)

  parent.children = [...parent.children]

  emits('delete:row', group.value)
}

// Collapsing
const collapseProps = computed(() => {
  return collapsedById.value[props.item.id]
    ? {
        label: $t('queryBuilder.expand'),
        icon: 'i-flowbite:chevron-right-outline !w-6 !h-6',
      }
    : {
        label: $t('queryBuilder.collapse'),
        icon: 'i-flowbite:chevron-right-outline rotate-90 !w-6 !h-6',
      }
})
</script>

<template>
  <ul
    class="qb-row qb-group"
    :class="{
      'is-hovered': hoveredItem === item,
      'is-dragged': draggedItem?.row === item,
      'is-base': !level,
      'is-last-child': isLastChild,
      'no-drag': item.isNotDraggable,
      'no-dragover': item.isNotDragOverable,
    }"
    :data-path="item.path"
    @mouseover.stop="hoveredItem = item"
    @mouseleave="hoveredItem = undefined"
  >
    <!-- Group row -->
    <div class="qb-group-row">
      <QueryBuilderMoveHandler v-if="level && !item.isNotDraggable && editable" />

      <!-- Condition -->
      <div class="qb-group-condition">
        <!-- Negation -->
        <Btn
          v-if="!noConditionChange && allowNegation"
          size="xs"
          icon="i-lucide:circle-slash"
          class="qb-group-negation"
          :class="{ 'is-negated': isNegated }"
          no-dim
          :tooltip="{ label: $t('queryBuilder.negation2') }"
          @click="handleSetNegation"
        />

        <!-- And -->
        <Btn
          class="qb-group-condition__option"
          :class="{ 'is-active': item.condition === 'AND' || item.condition === 'NOT_AND' }"
          :label="$t('queryBuilder.and')"
          size="xs"
          no-uppercase
          :disabled="!editable"
          @click="handleSetCondition('AND')"
        />

        <!-- Or -->
        <Btn
          v-if="!noConditionChange"
          class="qb-group-condition__option"
          :class="{ 'is-active': item.condition === 'OR' || item.condition === 'NOT_OR' }"
          :label="$t('queryBuilder.or')"
          size="xs"
          no-uppercase
          :disabled="!editable"
          @click="handleSetCondition('OR')"
        />
      </div>

      <!-- Controls -->
      <div
        v-if="!noAdd && editable"
        class="qb-group-controls"
      >
        <!-- Add condition -->
        <Btn
          icon="i-lucide:plus"
          :label="$t('queryBuilder.addCondition')"
          class="qb-group-controls__btn"
          no-uppercase
          no-dim
          size="xs"
          @click="handleAddCondition"
        />

        <!-- Add group -->
        <Btn
          v-if="maxNestingLevel > level"
          icon="i-lucide:list-plus"
          :label="$t('queryBuilder.addGroup')"
          class="qb-group-controls__btn"
          no-uppercase
          no-dim
          size="xs"
          @click="handleAddGroup"
        />
      </div>

      <!-- Actions -->
      <div class="qb-group-actions">
        <!-- Collapse -->
        <Btn
          size="xs"
          no-uppercase
          :icon="collapseProps.icon"
          class="qb-group-actions__btn"
          @click="collapsedById[item.id] = !collapsedById[item.id]"
        >
          <Tooltip>
            {{ collapseProps.label }}
          </Tooltip>
        </Btn>

        <!-- Remove group -->
        <Btn
          v-if="editable"
          class="on-hover qb-group-actions__btn qb-group-actions__remove"
          icon="i-lucide:trash-2"
          size="xs"
          :disabled="!level"
          @click="handleRemoveGroup"
        />
      </div>
    </div>

    <!-- Children rows -->
    <template v-if="!collapsedById[item.id]">
      <QueryBuilderRow
        v-for="(child, idx) in item.children"
        :key="child.path"
        :item="child"
        :parent="item"
        :remove-fnc
        :modify-fnc
        :level="level + 1"
        :editable
        :is-last-child="idx === item.children.length - 1"
      />

      <!-- Empty group -->
      <li
        v-if="!item.children.length"
        class="qb-group-empty"
      >
        {{ $t('queryBuilder.emptyGroup') }}
      </li>
    </template>
  </ul>
</template>

<style scoped lang="scss">
.qb-group {
  @apply relative flex flex-col gap-1 rounded-lg p-r-0 p-l-2 m-l-5 border-1
    border-transparent;

  transition: background-color 0.15s ease-in-out;

  &.is-dragged {
    @apply bg-primary/8 dark:bg-primary/20;
  }

  &-row {
    @apply flex gap-2 flex-wrap min-h-10 items-center;
  }

  &-condition {
    @apply flex gap-1 items-center;

    &__option {
      @apply rounded-md border-1 border-true-gray-200 dark:border-true-gray-700
        color-true-gray-600 dark:color-true-gray-300 font-medium min-w-9;

      &:hover {
        @apply bg-true-gray-50 dark:bg-true-gray-800;
      }

      &.is-active {
        @apply border-primary/50 bg-primary/8 color-primary
          dark:border-primary dark:bg-primary/35 dark:color-white;
      }
    }
  }

  &-negation {
    @apply rounded-md border-1 border-true-gray-200 dark:border-true-gray-700
      color-true-gray-500 dark:color-true-gray-400;

    &.is-negated {
      @apply border-negative/50 bg-negative/8 color-negative;
    }
  }

  &-controls {
    @apply flex gap-1;

    &__btn {
      @apply rounded-md color-true-gray-600 dark:color-true-gray-300 font-medium;

      &:hover {
        @apply bg-true-gray-100 dark:bg-true-gray-800 color-true-gray-900 dark:color-white;
      }
    }
  }

  &-actions {
    @apply flex gap-1 items-center p-r-2 m-l-auto;

    &__btn {
      @apply rounded-md color-true-gray-500 dark:color-true-gray-400;

      &:hover {
        @apply bg-true-gray-100 dark:bg-true-gray-800;
      }
    }

    &__remove:hover {
      @apply color-negative bg-negative/10;
    }
  }

  &-empty {
    @apply flex items-center min-h-10 m-l-5 m-r-2 p-x-3 rounded-lg text-sm
      border-1 border-dashed border-true-gray-200 dark:border-true-gray-700
      color-true-gray-500 dark:color-true-gray-400;
  }
}

.qb-group:not(.is-base) {
  &::before {
    @apply absolute content-empty -left-3 top-0 h-full
      border-l-1 border-true-gray-300 dark:border-true-gray-700;
  }

  &::after {
    @apply absolute content-empty -left-3 w-3
      border-b-1 border-true-gray-300 dark:border-true-gray-700;

    // This is kinda specific but it shouldn't really cause issues if we
    // don't mess with input sizes
    @apply top-19.5px;
  }
}

.qb-group:not(.is-base).is-last-child::before {
  @apply h-19.5px;
}
</style>
