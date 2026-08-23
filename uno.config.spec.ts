import { describe, expect, it } from 'vitest'
import { createGenerator } from 'unocss'

import unoConfig from './uno.config'

describe('icon generation', () => {
  it('supports class and attributify icon sources', async () => {
    const uno = await createGenerator(unoConfig)
    const { css } = await uno.generate(`
      <div class="i-lucide:shield-off" />
      <div i-mdi:account-outline />
    `)

    expect(css).toContain('.i-lucide\\:shield-off')
    expect(css).toContain('[i-mdi\\:account-outline=""]')
  })

  it('leaves canonical Nuxt Icon names out of UnoCSS', async () => {
    const uno = await createGenerator(unoConfig)
    const { css } = await uno.generate('<Icon name="tabler:home" />')

    expect(css).not.toContain('tabler')
  })
})
