// @unocss-include

export const YEAR_MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: {
    pickerIconClass() {
      const base = 'h-5.5 w-5.5 color-ca cursor-default'

      // State-based styling via CSS selectors
      // When parent is editable (not readonly and not disabled), make cursor pointer
      const editable = '[.year-month-selector:not(.is-readonly):not(.is-disabled)_&]:(cursor-pointer)'

      return {
        base,
        editable,
        all: `${base} ${editable}`,
      } as const
    },
  },
}

