import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileScript, parse } from 'vue/compiler-sfc'

import { defaultComponentsConfig } from '../app/config'

const COMPONENTS_DIR = resolve(__dirname, '../app/components')

// Matches `...getComponentProps('section')` and `...getComponentProps('section', ['a', 'b'])`
const SPREAD_REGEX = /\.\.\.getComponentProps\('(\w+)'(?:,\s*\[([^\]]*)\])?\)/g

function getVueFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      return getVueFiles(path)
    }

    return entry.name.endsWith('.vue') ? [path] : []
  })
}

/**
 * Compiles the SFC and reads the runtime prop declarations that Vue merges
 * the `withDefaults` defaults into
 */
function getDeclaredProps(file: string, source: string) {
  const { descriptor } = parse(source, { filename: file })
  const { content } = compileScript(descriptor, {
    id: 'test',
    fs: { fileExists: existsSync, readFile: path => readFileSync(path, 'utf8') },
  })

  const start = content.indexOf('_mergeDefaults(')
  expect(start, 'compiled props should merge the config defaults').toBeGreaterThan(-1)

  const declarations = content.slice(start, content.indexOf('\n  }, {', start))

  return new Set([...declarations.matchAll(/^\s+"?([\w-]+)"?: \{ type:/gm)].map(match => match[1]))
}

describe('component config props', () => {
  const files = getVueFiles(COMPONENTS_DIR)
    .map(file => ({ file, source: readFileSync(file, 'utf8') }))
    .filter(({ source }) => source.includes('...getComponentProps('))

  it.each(files.map(({ file, source }) => [relative(COMPONENTS_DIR, file), file, source]))(
    '%s declares every config default it spreads',
    (_, file, source) => {
      const declaredProps = getDeclaredProps(file, source)

      for (const [, section, pickedKeys] of source.matchAll(SPREAD_REGEX)) {
        const sectionProps = Object.keys((defaultComponentsConfig as Record<string, any>)[section!].props)
        const spreadKeys = pickedKeys === undefined
          ? sectionProps
          : pickedKeys.split(',').map(key => key.trim().replace(/'/g, '')).filter(Boolean)

        expect(
          spreadKeys.filter(key => !declaredProps.has(key)),
          `getComponentProps('${section}') keys without a prop declaration`,
        ).toEqual([])
      }
    },
  )
})
