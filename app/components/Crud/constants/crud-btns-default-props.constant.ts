// @unocss-include

export const CRUD_BTNS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex items-center gap-x-1 bg-white dark:bg-darker p-1 rounded-custom border-1 border-dashed border-ca hover:border-true-gray-400'

      // Label state via CSS selectors
      const hasLabels = '[&.has-labels]:(gap-x-2)'

      // Nested button styles
      const btnStyles = '[&_.btn]:(lt-lg:p-x-1) [&_.btn-label]:(lt-lg:hidden)'

      return {
        base,
        hasLabels,
        btnStyles,
        all: `${base} ${hasLabels} ${btnStyles}`,
      } as const
    },
  },
}

export const CRUD_EDIT_BTN_DEFAULT_PROPS = {
  ui: {
    wrapperClass() {
      const base = 'absolute inset-block-0 right-0 flex flex-center rounded-inherit bg-white dark:bg-darker min-w-full'

      return {
        base,
        all: base,
      } as const
    },

    btnClass() {
      const base = 'md:min-w-60 w-full'

      // State styling via CSS selectors
      const activeState = '[&:not(.is-archived):not(.is-disabled)]:(bg-primary color-white)'

      return {
        base,
        activeState,
        all: `${base} ${activeState}`,
      } as const
    },
  },
}

