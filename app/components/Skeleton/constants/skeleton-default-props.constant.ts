// @unocss-include

export const SKELETON_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'cursor-wait bg-ca'

      // Variant states via CSS selectors
      const pulse = '[&.variant--pulse]:(animate-pulse)'
      const wave = '[&.variant--wave]:(relative overflow-hidden z-1)'
      const blink = '[&.variant--blink]:(relative overflow-hidden z-1)'

      return {
        base,
        pulse,
        wave,
        blink,
        all: `${base} ${pulse} ${wave} ${blink}`,
      } as const
    },
  },
}

