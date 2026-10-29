export const uiClasses = defineUIClasses('button-theme')({
  button: {
    containerClass: ({ defaults }) => {
      const original: 'flex items-center tracking-wide relative select-none' = defaults.base

      return {
        base: 'theme-base',
        theme: 'theme-only',
        original,
        sizes: { sm: 'theme-sm' },
      } as const
    },
    focusHelperClass: { hover: 'theme-hover' },
  },
}).compose({
  button: {
    containerClass: (slots, props) => {
      // A later layer can change the values while this composer remains selected.
      const base: string = slots.base

      return `${base} ${slots.theme} ${slots.sizes[props.size ?? 'md']}`
    },
  },
})

export default extendUIConfig({})
