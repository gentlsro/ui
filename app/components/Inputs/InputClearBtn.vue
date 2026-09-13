<script setup lang="ts" vapor>
type IProps = {
  clearConfirmation?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IProps>(), { size: 'md' })
const emits = defineEmits<{ (e: 'clear'): void }>()
const button = useTemplateRef<{ getElement: () => HTMLElement | undefined }>('button')
const confirmation = useTemplateRef('confirmation')

const buttonElement = computed(() => button.value?.getElement())

function handleClick() {
  if (props.clearConfirmation) {
    confirmation.value?.show()
  } else {
    emits('clear')
  }
}

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
    ref="button"
    v-bind="$attrs"
    :icon="iconClass"
    color="ca"
    size="auto"
    tabindex="-1"
    :class="`size--${size}`"
    @click.stop.prevent="handleClick"
  />
  <!-- Keep the Vapor overlay outside the VDOM button's default slot. -->
  <MenuConfirmation
    v-if="clearConfirmation"
    ref="confirmation"
    manual
    :target="buttonElement"
    :reference-target="buttonElement"
    :confirmation-text="clearConfirmation"
    @ok="emits('clear')"
  />
</template>
