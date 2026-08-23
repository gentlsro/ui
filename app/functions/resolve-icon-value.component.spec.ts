import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const appRoot = resolve(import.meta.dirname, '..')

describe('icon value component integration', () => {
  it.each(['components/Button/Btn.vue', 'components/Chip/Chip.vue'])(
    'wires %s through the shared icon resolver',
    file => {
      const source = readFileSync(resolve(appRoot, file), 'utf8')

      expect(source).toContain('resolveIconValue(')
      expect(source).toContain('resolvedIcon.name')
      expect(source).toContain('resolvedIcon.classes')
    },
  )

  it('keeps an explicit class-only fallback in Btn and Chip', () => {
    for (const file of ['components/Button/Btn.vue', 'components/Chip/Chip.vue']) {
      const source = readFileSync(resolve(appRoot, file), 'utf8')

      expect(source).toMatch(/v-else-if="(?:iconValue|icon)"/)
    }
  })
})
