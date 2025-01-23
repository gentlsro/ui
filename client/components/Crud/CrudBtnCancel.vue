<script setup lang="ts">
// Store
import { useFormStore } from '../Form/stores/form.store'

type IProps = {
  disabled?: boolean
  editing?: boolean
}

const props = defineProps<IProps>()

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
  <Btn
    preset="CLOSE"
    :label="$t('general.cancel')"
    @click="isEditing = false"
  >
    <slot />
  </Btn>
</template>
