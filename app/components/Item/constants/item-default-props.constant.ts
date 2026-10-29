// @unocss-include

export const ITEM_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex relative rounded-custom items-center cursor-pointer gap-x-1'

      // States (via CSS selectors)
      const readonly = '[&.is-readonly]:(cursor-default)'
      const disabled = '[&.is-disabled]:(cursor-not-allowed opacity-50)'

      return {
        base,
        readonly,
        disabled,
        all: `${base} ${readonly} ${disabled}`,
      } as const
    },

    focusHelperClass() {
      const base = 'absolute fit z-3 rounded-inherit inset-0 pointer-events-none'

      // Hover effect (via CSS group selector - container must have item class)
      const hover = '[.item:hover_&]:(bg-current opacity-10)'

      return {
        base,
        hover,
        all: `${base} ${hover}`,
      } as const
    },
  },
}
