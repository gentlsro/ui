<script setup lang="ts">
type IProps = {
  /**
   * Whether the radio button is checked
   */
  checked?: boolean

  /**
   * The color of the outer fill
   */
  outerFillColor?: string

  /**
   * The color of the inner fill
   */
  innerFillColor?: boolean

  /**
   * Whether the radio button is editable
   */
  editable?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  editable: true,
})

const fillColor = computed(() => {
  if (!props.editable) {
    return 'fill-true-gray'
  }

  return 'fill-current'
})
</script>

<template>
  <svg
    class="radio-btn"
    select="none"
    viewBox="0 0 24 24"
  >
    <path
      class="outer"
      :class="[outerFillColor ? outerFillColor : fillColor]"
      d="M12,22a10,10 0 0 1 -10,-10a10,10 0 0 1 10,-10a10,10 0 0 1 10,10a10,10 0 0 1 -10,10m0,-22a12,12 0 0 0 -12,12a12,12 0 0 0 12,12a12,12 0 0 0 12,-12a12,12 0 0 0 -12,-12"
    />
    <path
      class="inner"
      :class="[
        checked ? 'is-checked' : 'unchecked',
        innerFillColor ? innerFillColor : fillColor,
      ]"
      d="M12,6a6,6 0 0 0 -6,6a6,6 0 0 0 6,6a6,6 0 0 0 6,-6a6,6 0 0 0 -6,-6"
    />
  </svg>
</template>

<style lang="scss" scoped>
.radio-btn:hover,
.radio-btn.hovered {
  .inner.unchecked {
    @apply scale-100 opacity-60;
  }
}

.inner {
  @apply origin-center transition-all duration-350;

  &.is-checked {
    @apply scale-100 opacity-100;
  }

  &.unchecked {
    @apply scale-0 opacity-0;
  }
}
</style>
