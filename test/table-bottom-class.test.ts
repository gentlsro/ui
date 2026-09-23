import { createGenerator, expandVariantGroup } from 'unocss'
import { describe, expect, it } from 'vitest'

import unoConfig from '../uno.config'
import { TABLE_DEFAULT_PROPS } from '../app/components/Table/constants/table-default-props.constant'

describe('table bottom default class', () => {
  it('styles the loading and limit-reached elements rendered inside the bottom bar', async () => {
    const uno = await createGenerator(unoConfig)
    const { loading, limitReached } = TABLE_DEFAULT_PROPS.ui.bottomClass()

    const { css: loadingCss } = await uno.generate(expandVariantGroup(loading), { preflights: false })
    const { css: limitReachedCss } = await uno.generate(expandVariantGroup(limitReached), { preflights: false })

    // `TableBottom` renders `.is-loading` / `.limit-reached` as direct children of the element
    // that receives `bottomClass`, so the selectors must target children, not ancestors
    expect(loadingCss).toMatch(/>\.is-loading\{position:absolute;\}/)
    expect(loadingCss).not.toMatch(/\.is-loading \./)
    expect(limitReachedCss).toMatch(/>\.limit-reached\{position:absolute;\}/)
    expect(limitReachedCss).not.toMatch(/\.limit-reached \./)
  })
})
