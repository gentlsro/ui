import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'

import {
  createIconAssetProcessor,
  ICON_ASSETS_DIRECTORY_ENV,
  iconAssetProcessor,
} from '../modules/icon-assets/processor'

const svg = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M1 1h2"/></svg>'
const meta = { collection: 'lucide', name: 'check', svg }

function maskRule() {
  return {
    '--un-icon': `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
    '-webkit-mask': 'var(--un-icon) no-repeat',
    'mask': 'var(--un-icon) no-repeat',
  }
}

describe('icon assets', () => {
  const directories: string[] = []
  const createDirectory = () => {
    const directory = mkdtempSync(join(tmpdir(), 'icon-assets-'))
    directories.push(directory)

    return directory
  }

  afterEach(() => {
    delete process.env[ICON_ASSETS_DIRECTORY_ENV]
    directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true }))
  })

  it('writes a standalone SVG once and points mask rules at it', () => {
    const directory = createDirectory()
    const process = createIconAssetProcessor({ directory })
    const first = maskRule()
    const second = maskRule()

    process(first, meta)
    process(second, meta)

    const [file] = readdirSync(directory)

    expect(readdirSync(directory)).toHaveLength(1)
    expect(file).toMatch(/^lucide-check\.[\w-]{8}\.svg$/)
    expect(readFileSync(join(directory, file!), 'utf8')).toBe(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))
    expect(first['--un-icon']).toBe(`url(/_icons/${file})`)
    expect(second).toEqual(first)
    expect(first.mask).toBe('var(--un-icon) no-repeat')
  })

  it('rewrites background rules of coloured icons and keeps the rest', () => {
    const process = createIconAssetProcessor({ directory: createDirectory(), baseURL: '/base/_icons' })
    const rule = {
      'background': `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") no-repeat`,
      'background-size': '100% 100%',
    }

    process(rule, { ...meta, collection: 'emojione', name: 'flag-for-czechia' })

    expect(rule.background).toMatch(/^url\(\/base\/_icons\/emojione-flag-for-czechia\.[\w-]{8}\.svg\) no-repeat$/)
    expect(rule['background-size']).toBe('100% 100%')
  })

  it('leaves inline SVG in place when no app configured a directory', () => {
    const rule = maskRule()
    const before = rule['--un-icon']

    iconAssetProcessor(rule, meta)

    expect(rule['--un-icon']).toBe(before)

    process.env[ICON_ASSETS_DIRECTORY_ENV] = createDirectory()
    iconAssetProcessor(rule, meta)

    expect(rule['--un-icon']).toMatch(/^url\(\/_icons\/lucide-check\.[\w-]{8}\.svg\)$/)
  })
})
