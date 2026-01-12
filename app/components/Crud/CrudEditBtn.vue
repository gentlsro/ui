<script setup lang="ts">
import type { TransitionProps } from 'vue'

// Types
import type { ICrudEditBtnProps } from './types/crud-btn-props.type'

// Constants
import { CRUD_EDIT_BTN_DEFAULT_PROPS } from './constants/crud-btns-default-props.constant'

// Store
import { useFormStore } from '../Form/stores/form.store'

const props = withDefaults(defineProps<ICrudEditBtnProps>(), {
  ...getComponentProps('crudEditBtn'),
})

// Constants
const transitionProps = {
  enterActiveClass: 'animate-zoom-in animate-duration-250',
  leaveActiveClass: 'animate-fade-out-up animate-duration-350',
} as TransitionProps

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('crudEditBtn', props)
})

// Store
const { isEditing: isEditingStore } = useFormStore()

// Layout
const isEditing = defineModel<boolean>('isEditing', { default: true })

if (props.editing === undefined) {
  isEditing.value = isEditingStore.value
}

syncRef(isEditing, isEditingStore)

// Styles - wrapper
const wrapperClass = computed(() => {
  return mergedProps.value?.ui?.wrapperClass?.({
    defaults: CRUD_EDIT_BTN_DEFAULT_PROPS.ui.wrapperClass(),
  })
})

const wrapperStyle = computed(() => {
  return mergedProps.value?.ui?.wrapperStyle?.()
})

// Styles - button
const btnClass = computed(() => {
  return mergedProps.value?.ui?.btnClass?.({
    defaults: CRUD_EDIT_BTN_DEFAULT_PROPS.ui.btnClass(),
  })
})

const btnStyle = computed(() => {
  return mergedProps.value?.ui?.btnStyle?.()
})
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="!isEditing"
      class="crud-edit-btn__wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <Btn
        no-dim
        :disabled
        class="crud-edit-btn"
        :class="btnClass"
        :style="btnStyle"
        :label="$t('general.edit')"
        icon="i-material-symbols:edit-rounded !w-4 !h-4 m-r-2"
        data-cy="crud-edit-button"
        v-bind="btnProps"
        @click="isEditing = true"
      >
        <slot />
      </Btn>
    </div>
  </Transition>
</template>
