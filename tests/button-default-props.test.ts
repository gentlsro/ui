import { expect, it, vi } from 'vitest'

vi.mock('$uiConfig', () => ({
  uiClassLayers: [
    { uiClasses: { classDefaults: { button: { containerClass: {
      base: 'theme-base',
      theme: 'theme-only',
      sizes: { sm: 'theme-small' },
    } } } } },
    { uiClasses: { classDefaults: { button: { containerClass: {
      base: 'application-base',
      application: 'app-only',
    } } } } },
  ],
}))

// Failure modes: keeping the old API bypasses layers, all/p retain old slots,
// and evaluating another size mutates a previously resolved button.
it('resolves layers through the existing BTN_DEFAULT_PROPS.ui API', async () => {
  const { BTN_DEFAULT_PROPS } = await import('../app/components/Button/constants/btn-default-props.constant')
  const small = BTN_DEFAULT_PROPS.ui.containerClass({ size: 'sm', hasLabel: true })
  const large = BTN_DEFAULT_PROPS.ui.containerClass({ size: 'lg', hasLabel: true })

  expect(small).toMatchObject({ base: 'application-base', theme: 'theme-only', application: 'app-only' })
  expect(small.p('base')).toBe('application-base')
  expect(small.all).toContain('theme-small')
  expect(large.all).toContain('min-h-12')
  expect(small.all).toContain('theme-small')
})
