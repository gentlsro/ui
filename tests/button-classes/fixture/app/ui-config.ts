export const uiClasses = defineUIClasses('app')({
  button: {
    containerClass: ({ defaults }) => {
      const precedingBase: 'brand-base' = defaults.base
      const inheritedTheme: 'theme-only' = defaults.theme
      const inheritedSize: 'theme-sm' = defaults.sizes.sm

      return {
        base: 'app-base',
        app: 'app-only',
        precedingBase,
        inheritedTheme,
        inheritedSize,
        sizes: { sm: 'app-sm' },
      } as const
    },
  },
})

export default extendUIConfig({})
