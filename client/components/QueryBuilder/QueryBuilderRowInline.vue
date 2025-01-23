<script setup lang="ts">
// Types
import type { IQueryBuilderGroup } from './types/query-builder-group-props.type'
import type { IQueryBuilderRowProps } from './types/query-builder-row-props.type'

// Store
import { useQueryBuilderStore } from './query-builder.store'

withDefaults(defineProps<IQueryBuilderRowProps>(), {
  noAdd: undefined,
})

// Store
const { items } = storeToRefs(useQueryBuilderStore())

function updatePaths(parent?: IQueryBuilderGroup) {
  const _parent = parent ?? (toValue(items)[0] as IQueryBuilderGroup)

  _parent.children.forEach((child, idx) => {
    child.path = `${_parent.path}.children.${idx}`

    if ('isGroup' in child) {
      updatePaths(child)
    }
  })
}
</script>

<template>
  <QueryBuilderGroupInline
    v-if="'isGroup' in item"
    :item
    :level
    :parent
    :is-last-child
    :is-first-child
    :no-add
    :editable
    :modify-fnc
    :remove-fnc
    :no-condition-change
    @delete:row="updatePaths()"
  />

  <QueryBuilderItemInline
    v-else
    :item
    :level
    :parent
    :is-last-child
    :is-first-child
    :no-add
    :editable
    :modify-fnc
    :remove-fnc
    @delete:row="updatePaths()"
  />
</template>
