<script setup lang="ts">
import type { TransitionProps } from 'vue'

// Store
import { useFormStore } from '../Form/stores/form.store'

type IProps = {
  disabled?: boolean
  editing?: boolean
}

const props = defineProps<IProps>()

// Constants
const transitionProps = {
  enterActiveClass: 'animate-zoom-in animate-duration-250',
  leaveActiveClass: 'animate-fade-out-up animate-duration-350',
} as TransitionProps

// Store
const { isEditing: isEditingStore } = storeToRefs(useFormStore())

// Layout
const isEditing = defineModel<boolean>('isEditing', { default: true })

if (props.editing === undefined) {
  isEditing.value = isEditingStore.value
}

syncRef(isEditing, isEditingStore)
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="!isEditing"
      class="crud-edit-btn__wrapper"
    >
      <Btn
        no-dim
        :disabled
        class="crud-edit-btn"
        :label="$t('general.edit')"
        icon="i-material-symbols:edit-rounded !w-4 !h-4 m-r-2"
        data-cy="crud-edit-button"
        @click="isEditing = true"
      >
        <slot />
      </Btn>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.crud-edit-btn {
  @apply md:min-w-60 w-full;

  &:not(.is-archived):not(.is-disabled) {
    @apply bg-primary color-white;
  }

  &__wrapper {
    @apply absolute inset-block-0 right-0 flex flex-center rounded-inherit
      bg-white dark:bg-darker min-w-full;
  }
}
</style>
