<script setup lang="ts">
type IProps = {
  clearConfirmation?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'
}

const props = withDefaults(defineProps<IProps>(), { size: 'md' })
defineEmits<{ (e: 'clear'): void }>()

const iconClass = computed(() => {
  const classes = ['i-eva:close-fill']

  switch (props.size) {
    case 'xs':
      classes.push('w-4 h-4')
      break
    case 'sm':
      classes.push('w-5 h-5')
      break
    case 'md':
      classes.push('w-6 h-6')
      break
    case 'lg':
      classes.push('w-7 h-7')
      break
  }

  return classes
})
</script>

<template>
  <Btn
    :icon="iconClass"
    color="ca"
    size="auto"
    tabindex="-1"
    :class="`sie--${size}`"
    @click.stop.prevent="!clearConfirmation && $emit('clear')"
  >
    <MenuConfirmation
      v-if="clearConfirmation"
      @ok="$emit('clear')"
    >
      {{ clearConfirmation }}
    </MenuConfirmation>
  </Btn>
</template>
