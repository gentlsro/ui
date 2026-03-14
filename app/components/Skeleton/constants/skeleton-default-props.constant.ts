// @unocss-include

export const SKELETON_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      variant: 'wave' | 'pulse' | 'blink'
    }) {
      const { variant } = payload

      const base = 'cursor-wait bg-ca'

      // Variant states via CSS selectors
      const pulse = '[&.variant--pulse]:(animate-pulse)'
      const wave = '[&.variant--wave]:(overflow-hidden z-1)'
      const blink = '[&.variant--blink]:(overflow-hidden z-1)'

      const variants = { pulse, wave, blink }

      const activeVariant = variants[variant]

      return {
        base,
        pulse,
        wave,
        blink,
        all: `${base} ${activeVariant}`,
      } as const
    },
  },
}
