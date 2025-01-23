<script setup lang="ts">
type IProps = {
  hint: string
}

defineProps<IProps>()
</script>

<template>
  <span class="input-hint-container">
    <slot>
      {{ hint }}
    </slot>
  </span>
</template>

<style lang="scss" scoped>
.input-hint-container {
  @apply text-caption color-ca font-rem-12;
}
</style>
