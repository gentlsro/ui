<script setup lang="ts">
// Types
import type { CrudAction } from './types/crud-action.type'
import type { ICrudBtnProps } from './types/crud-btn-props.type'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'
import { getComponentMergedProps } from '../../functions/get-component-props'

type IProps = {
  actions?: Partial<Record<CrudAction, boolean>> | true
  labels?: boolean
  loading?: boolean
  btnConfirmationPosition?: 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<IProps>(), {
  btnConfirmationPosition: 'bottom',
})

defineEmits<{
  (e: 'save'): void
  (e: 'delete'): void
  (e: 'restore'): void
}>()

defineSlots<{
  'prepend'?: (payload: {
    loaderType: 'inline' | 'block'
    labels: boolean | undefined
  }) => void
  'append'?: (payload: {
    loaderType: 'inline' | 'block'
    labels: boolean | undefined
  }) => void
  'delete-confirmation'?: () => void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('crudBtns', props)
})

// State
const isSaved = autoResetRef(false, 2000)
const isDeleted = autoResetRef(false, 2000)
// const isRestored = autoResetRef(false, 2000)
// const isArchived = autoResetRef(false, 2000)

// Utils
const route = useRoute()

// Layout
const loaderType = computedEager(() => {
  return $bp.lg.value && props.labels ? 'inline' : 'block'
})

const crudBtnProps = computed<ICrudBtnProps>(() => ({
  btnConfirmationnPosition: props.btnConfirmationPosition,
  labels: props.labels,
  loaderType: loaderType.value,
  loading: props.loading,
}))

// Actions
const actionsDefault = ref<Record<CrudAction, boolean>>({
  add: false,
  archive: false,
  save: false,
  delete: false,
  restore: false,
  edit: false,
})

const availableActions = computed(() => ({
  ...actionsDefault.value,
  ...(props.actions === true ? {} : props.actions),
}))

const hasAnyAction = computedEager(() => {
  return Object.values(availableActions.value).some(Boolean)
})

defineExpose({
  save: () => (isSaved.value = true),
  delete: () => (isDeleted.value = true),
})
</script>

<template>
  <div
    v-if="hasAnyAction || !!actions"
    class="crud-btns"
    :class="{ 'has-labels': !!labels }"
  >
    <slot
      name="prepend"
      :loader-type="loaderType"
      :labels="labels"
    />

    <CrudBtnAdd
      v-if="availableActions.add && !availableActions.restore"
      v-bind="crudBtnProps"
      :to="$p(`${route.path}/create`)"
    />

    <CrudBtnSave
      v-if="availableActions.save && !availableActions.restore"
      v-bind="crudBtnProps"
      @save="$emit('save')"
    />

    <CrudBtnDelete
      v-if="availableActions.delete && !availableActions.restore"
      v-bind="crudBtnProps"
      @delete="$emit('delete')"
    >
      <template #confirmation>
        <slot name="delete-confirmation" />
      </template>
    </CrudBtnDelete>

    <CrudBtnArchive
      v-if="availableActions.archive && !availableActions.restore"
      v-bind="crudBtnProps"
      @delete="$emit('delete')"
    />

    <slot
      name="append"
      :loader-type="loaderType"
      :labels="labels"
    />
  </div>
</template>

<style lang="scss" scoped>
.crud-btns {
  @apply relative flex items-center gap-x-1 bg-white dark:bg-darker p-1
    rounded-custom border-1 border-dashed border-ca hover:border-true-gray-400;

  &.has-labels {
    @apply gap-x-2;
  }

  :deep(.btn) {
    @apply lt-lg:p-x-1;
  }

  :deep(.btn-label) {
    @apply lt-lg:hidden;
  }
}
</style>
