// @unocss-include

export const SEPARATOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex flex-center border-true-gray/40 rounded-full'

      // Horizontal styles via CSS selectors
      const horizontal = '[&.is-horizontal]:(w-full border-b-1 leading-0)'
      const horizontalSpaced = '[&.is-horizontal.is-spaced]:(m-b-.5 p-b-.5)'
      const horizontalInset = '[&.is-horizontal.is-inset]:(m-x-2 w-[calc(100%-1rem)])'

      // Vertical styles via CSS selectors
      const vertical = '[&.is-vertical]:(border-r-1)'
      const verticalSpaced = '[&.is-vertical.is-spaced]:(p-r-.5 m-r-.5)'
      const verticalInset = '[&.is-vertical.is-inset]:(m-y-1)'

      return {
        base,
        horizontal,
        horizontalSpaced,
        horizontalInset,
        vertical,
        verticalSpaced,
        verticalInset,
        all: `${base} ${horizontal} ${horizontalSpaced} ${horizontalInset} ${vertical} ${verticalSpaced} ${verticalInset}`,
      } as const
    },
  },
}

