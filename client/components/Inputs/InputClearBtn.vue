<script setup lang="ts">
type IProps = {
  clearConfirmation?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'
}

withDefaults(defineProps<IProps>(), { size: 'md' })
defineEmits<{ (e: 'clear'): void }>()
</script>

<template>
  <Btn
    icon="i-eva:close-fill h-6 w-6"
    color="ca"
    size="auto"
    h="7"
    w="7"
    tabindex="-1"
    :class="`size--${size}`"
    @click.stop.prevent="!clearConfirmation && $emit('clear')"
  >
    <MenuConfirmation
      @ok="$emit('clear')"
    >
      {{ clearConfirmation }}
    </MenuConfirmation>
  </Btn>
</template>
