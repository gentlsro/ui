<script setup lang="ts">
// Types
import type { IFormProps } from './types/form-props.type'

// Functions
import { useFormStore } from './stores/form.store'
import { useFormErrors } from './composables/useFormErrors'

type IProps = Pick<IFormProps, 'errorsSectionProps' | 'errors'>

defineProps<IProps>()

const { errors } = storeToRefs(useFormStore())
const { errorsExtended, handleDismissError } = useFormErrors(errors)
</script>

<template>
  <Section
    v-if="errorsExtended.length"
    v-bind="errorsSectionProps"
  >
    <Banner
      v-for="error in errorsExtended"
      :key="error.idx"
      variant="error"
      dismissable
      icon-class="!self-center"
      :counter="error.count"
      :label="$t(error.errorText)"
      @dismiss="handleDismissError(error)"
    />
  </Section>
</template>
