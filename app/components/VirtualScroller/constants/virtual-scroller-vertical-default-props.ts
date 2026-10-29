// Types

export const VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS = {
  ui: {
    rowClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}
