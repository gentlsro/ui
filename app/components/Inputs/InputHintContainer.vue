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
