<script setup lang="ts" vapor>
type IProps = {
  hint: string | (() => string)
}

const props = defineProps<IProps>()

const hint = computed(() => {
  return typeof props.hint === 'function' ? props.hint() : props.hint
})
</script>

<template>
  <span class="input-hint-container">
    <slot>
      {{ hint }}
    </slot>
  </span>
</template>
