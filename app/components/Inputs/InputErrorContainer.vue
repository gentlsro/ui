<script setup lang="ts">
type IProps = {
  errorTakesSpace?: boolean
  errors?: string[]
}

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IProps>(), {
  errorTakesSpace: true,
})

// Validation
const errorMessages = computed(() => {
  return props.errors?.join('&nbsp; | &nbsp;')
})
</script>

<template>
  <Collapse
    :model-value="!!errors?.length"
    :floating="!errorTakesSpace"
    z="$zMenu"
    :ui="{
      contentClass: ({ defaults }) => `${defaults.base} ${defaults.floating}`,
      contentInnerClass: () => 'p-x-1',
    }"
  >
    <div v-bind="$attrs">
      <div
        class="inline-block m-r-2 align-middle i-ci:error font-rem-16"
      />
      <span
        class="align-middle"
        v-html="errorMessages"
      />
    </div>
  </Collapse>
</template>
