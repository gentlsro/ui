// @unocss-include

export const MARQUEE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'group flex gap-$gap overflow-hidden p-2'
      const vertical = '[&.is-vertical]:(flex-col)'

      return {
        base,
        vertical,
        all: `${base} ${vertical}`,
      } as const
    },

    contentClass(payload: {
      pauseOnHover: boolean
      vertical: boolean
    }) {
      const { pauseOnHover, vertical } = payload

      const base = 'flex shrink-0 justify-around gap-$gap'
      const verticalLayout = vertical ? 'flex-col' : ''
      const paused = pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''

      return {
        base,
        verticalLayout,
        paused,
        all: `${base} ${verticalLayout} ${paused}`.trim(),
      } as const
    },
  },
}
