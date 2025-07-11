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
} = storeToRefs(useQueryBuilderStore())

// Utils
const { t } = useI18n()

// Layout
const group = toRef(props, 'item')

const isNegated = computed(() => {
  return group.value.condition === 'NOT_AND' || group.value.condition === 'NOT_OR'
})

function handleSetCondition(val: 'AND' | 'OR') {
  const isNegated = group.value.condition === 'NOT_AND' || group.value.condition === 'NOT_OR'

  group.value.condition = (isNegated ? 'NOT_' + val : val) as 'AND' | 'OR' | 'NOT_AND' | 'NOT_OR'
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
  group.value.children = [
    ...group.value.children,
    {
      id: generateUUID(),
      field: undefined as unknown as string,
      filterField: undefined as unknown as string,
      comparator: undefined as unknown as ComparatorEnum,
      value: undefined as unknown as string,
      path: `${group.value.path}.children.${group.value.children.length}`,
    },
  ]
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
        label: t('queryBuilder.expand'),
        icon: 'i-flowbite:chevron-right-outline !w-6 !h-6',
      }
    : {
        label: t('queryBuilder.collapse'),
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
          icon="i-material-symbols:exclamation-rounded !w-5 !h-5"
          color="ca"
          bg="white dark:black"
          :class="{ 'is-negated': isNegated }"
          no-dim
          :tooltip="{ label: $t('queryBuilder.negation2') }"
          @click="handleSetNegation"
         />

        <!-- And -->
        <Btn
          :class="{ 'is-active': item.condition === 'AND' || item.condition === 'NOT_AND' }"
          :label="$t('queryBuilder.and')"
          size="xs"
          @click="handleSetCondition('AND')"
        />

        <!-- Or -->
        <Btn
          v-if="!noConditionChange"
          :class="{ 'is-active': item.condition === 'OR' || item.condition === 'NOT_OR' }"
          :label="$t('queryBuilder.or')"
          size="xs"
          @click="handleSetCondition('OR')"
        />
      </div>

      <Separator
        v-if="editable && !noAdd"
        vertical
      />

      <!-- Controls -->
      <div
        v-if="!noAdd && editable"
        class="qb-group-controls"
      >
        <!-- Add condition -->
        <Btn
          icon="i-eva:plus-fill"
          color="ca"
          bg="white dark:darker"
          no-uppercase
          size="sm"
          @click="handleAddCondition"
        >
          <Tooltip>
            {{ $t('queryBuilder.addCondition') }}
          </Tooltip>
        </Btn>

        <!-- Add group -->
        <Btn
          v-if="maxNestingLevel > level"
          icon="i-formkit:add"
          bg="white dark:darker"
          color="ca"
          no-uppercase
          size="sm"
          @click="handleAddGroup"
        >
          <Tooltip>
            {{ $t('queryBuilder.addGroup') }}
          </Tooltip>
        </Btn>
      </div>

      <!-- Actions -->
      <div class="qb-group-actions">
        <!-- Collapse -->
        <Btn
          size="auto"
          no-uppercase
          :icon="collapseProps.icon"
          border="1 ca"
          @click="collapsedById[item.id] = !collapsedById[item.id]"
        >
          <Tooltip>
            {{ collapseProps.label }}
          </Tooltip>
        </Btn>

        <!-- Remove group -->
        <Btn
          v-if="editable"
          class="on-hover"
          icon="i-material-symbols:delete-sweep-rounded !w-5 !h-5"
          color="negative"
          size="xs"
          m="l-2"
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
    </template>
  </ul>
</template>

<style scoped lang="scss">
.qb-group {
  @apply relative flex flex-col gap-1px rounded-custom p-r-0 p-l-2 m-l-5 border-1
    border-transparent;

  transition:
    background-color 0.3s ease-in-out,
    shadow 0.3s ease-in-out;

  &.is-hovered {
    @apply bg-white dark:bg-darker shadow-consistent shadow-ca;

    & > li {
      @apply border-1 border-ca border-dashed;
    }
  }

  &.is-dragged {
    @apply bg-primary/15 dark:bg-primary/15;
  }

  &-row {
    @apply flex gap-2 flex-wrap min-h-10 items-center;
  }

  &-condition {
    @apply flex gap-1 items-center;

    .is-active {
      @apply bg-primary color-white;
    }

    .is-negated {
      @apply bg-negative color-white;
    }
  }

  &-actions {
    @apply flex gap-1 items-center p-r-4 m-l-auto;
  }

  &-controls {
    @apply flex gap-px;
  }
}

.qb-group:not(.is-base) {
  &::before {
    @apply absolute content-empty -left-3 top-0 h-full;
    @apply border-l-1 border-dark dark:border-ca border-dashed;
  }

  &::after {
    @apply absolute content-empty -left-3 w-3;
    @apply border-b-1 border-dark dark:border-ca border-dashed;

    // This is kinda specific but it shouldn't really cause issues if we
    // don't mess with input sizes
    @apply top-19.5px;
  }
}

.qb-group:not(.is-base).is-last-child::before {
  @apply h-19.5px;
}
</style>
