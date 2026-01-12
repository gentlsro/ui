<script setup lang="ts">
// Types
import type { CrudAction } from './types/crud-action.type'
import type { ICrudBtnProps, ICrudBtnsProps } from './types/crud-btn-props.type'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'
import { CRUD_BTNS_DEFAULT_PROPS } from './constants/crud-btns-default-props.constant'

const props = withDefaults(defineProps<ICrudBtnsProps>(), {
  ...getComponentProps('crudBtns'),
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
const loaderType = computed(() => {
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

const hasAnyAction = computed(() => {
  return Object.values(availableActions.value).some(Boolean)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: CRUD_BTNS_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
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
    :class="[{ 'has-labels': !!labels }, containerClass]"
    :style="containerStyle"
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
