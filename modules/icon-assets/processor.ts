import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import type { CSSObject } from 'unocss'

export const ICON_ASSETS_DIRECTORY_ENV = 'GENTL_ICON_ASSETS_DIR'
export const ICON_ASSETS_BASE_URL = '/_icons'

type IIconMeta = {
  collection: string
  name: string
  svg: string
}

type IIconAssetProcessor = (cssObject: CSSObject, meta: IIconMeta) => void

const DATA_URL = /url\("data:image\/svg\+xml[^"]*"\)/

function toStandaloneSvg(svg: string) {
  let standalone = svg.startsWith('<svg>') ? svg.replace('<svg>', '<svg >') : svg

  if (!standalone.includes(' xmlns:xlink=') && standalone.includes(' xlink:')) {
    standalone = standalone.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
  }

  if (!standalone.includes(' xmlns=')) {
    standalone = standalone.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  }

  return standalone
}

/**
 * Icon rules point at small SVG files instead of carrying the SVG inline, so
 * a browser fetches only the icons it renders instead of parsing every icon
 * used anywhere in the sources on every visit. File names carry a content
 * hash; the serving module sets long cache headers.
 */
export function createIconAssetProcessor(options: {
  directory: string
  baseURL?: string
}): IIconAssetProcessor {
  const written = new Set<string>()

  return (cssObject, meta) => {
    const svg = toStandaloneSvg(meta.svg)
    const hash = createHash('sha256').update(svg).digest('base64url').slice(0, 8)
    const name = `${meta.collection}-${meta.name}`.replace(/[^\w-]/g, '_')
    const file = `${name}.${hash}.svg`

    if (!written.has(file)) {
      mkdirSync(options.directory, { recursive: true })
      const path = join(options.directory, file)

      if (!existsSync(path)) {
        writeFileSync(path, svg)
      }

      written.add(file)
    }

    const url = `url(${options.baseURL ?? ICON_ASSETS_BASE_URL}/${file})`

    if (typeof cssObject['--un-icon'] === 'string') {
      cssObject['--un-icon'] = url
    } else if (typeof cssObject.background === 'string') {
      cssObject.background = cssObject.background.replace(DATA_URL, url)
    }
  }
}

let processor: IIconAssetProcessor | undefined
let processorDirectory: string | undefined

/**
 * Used by the shared UnoCSS config. Without the directory (ESLint plugin,
 * tooling outside a Nuxt app) the rules keep their inline SVG.
 */
export const iconAssetProcessor: IIconAssetProcessor = (cssObject, meta) => {
  const directory = process.env[ICON_ASSETS_DIRECTORY_ENV]

  if (!directory) {
    return
  }

  if (!processor || processorDirectory !== directory) {
    processor = createIconAssetProcessor({ directory })
    processorDirectory = directory
  }

  processor(cssObject, meta)
}
