export const uiClasses = defineUIClasses('button-brand')({
  button: {
    containerClass: ({ defaults }) => {
      const precedingBase: 'theme-base' = defaults.base
      const precedingSize: 'theme-sm' = defaults.sizes.sm

      return {
        base: 'brand-base',
        brand: 'brand-only',
        precedingBase,
        precedingSize,
        sizes: { lg: 'brand-lg' },
      } as const
    },
    loadingClass: { base: 'brand-loading' },
  },
})

// Nested Button props use final component defaults. They must not make the
// preceding-layer class registry depend on the complete config's inferred type.
export default extendUIConfig({
  buttonGroup: {
    props: {
      buttons: [{
        label: 'Nested configured Button',
        value: 'nested',
        ui: {
          containerClass: ({ defaults }) => {
            const base: 'app-base' = defaults.base

            return `${base} ${defaults.p('theme', 'brand', 'app')}`
          },
        },
      }],
    },
  },
})
