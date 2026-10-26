// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Worker } from 'node:worker_threads'
import { expect, it } from 'vitest'
import { createIconAssetProcessor } from './processor.ts'

it('publishes deterministic hashed assets and merges client/SSR mask/background metadata', () => {
  const directory = mkdtempSync(join(tmpdir(), 'native-icon-assets-'))
  try {
    const client = createIconAssetProcessor({ directory })
    const server = createIconAssetProcessor({ directory })
    const meta = { collection: 'demo', name: 'mark', svg: '<svg viewBox="0 0 24 24"><path fill="black" d="M0 0h24v24z"/></svg>' }
    const mask = { '--un-icon': 'url("data:image/svg+xml,test")', 'color': 'currentColor' }
    client(mask, meta)
    server({ ...mask }, meta)
    const background = { background: 'url("data:image/svg+xml,test") no-repeat center / 100% 100%' }
    server(background, { ...meta, name: 'color', svg: meta.svg.replace('black', 'red') })
    const files = readdirSync(directory)
    expect(files.filter(file => file.endsWith('.svg'))).toHaveLength(2)
    const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'))
    expect(manifest['demo:mark'].mode).toBe('mask')
    expect(manifest['demo:color'].mode).toBe('background')
    expect(mask['--un-icon']).toBe(`url(${manifest['demo:mark'].url})`)
    expect(background.background).toContain(manifest['demo:color'].url)
    expect(background.background).toContain('no-repeat center')
    expect(mask.color).toBe('currentColor')
    const source = readFileSync(join(directory, manifest['demo:mark'].url.split('/').at(-1)), 'utf8')
    expect(source).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(manifest['demo:mark'].url).not.toBe(manifest['demo:color'].url)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

it('publishes complete JSON and retains every icon from concurrent build workers', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'native-icon-assets-parallel-'))
  const moduleURL = pathToFileURL(resolve('packages/UI/modules/icon-assets/processor.ts')).href
  try {
    await Promise.all(Array.from({ length: 4 }, (_, worker) => new Promise<void>((resolve, reject) => {
      const child = new Worker(`
        const { workerData, parentPort } = require('node:worker_threads')
        import(workerData.moduleURL).then(({ createIconAssetProcessor }) => {
          const processIcon = createIconAssetProcessor({ directory: workerData.directory })
          for (let index = 0; index < 40; index++) {
            processIcon({ '--un-icon': 'url("data:image/svg+xml,test")' }, {
              collection: 'concurrent', name: 'worker-' + workerData.worker + '-' + index,
              svg: '<svg viewBox="0 0 24 24"><path fill="black" d="M0 0h24v24z"/></svg>',
            })
          }
          parentPort.postMessage('complete')
        }).catch(error => { throw error })
      `, { eval: true, workerData: { directory, moduleURL, worker } })
      child.on('error', reject)
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Icon worker exited ${code}`)))
    })))
    const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'))
    expect(Object.keys(manifest)).toHaveLength(160)
    for (const asset of Object.values(manifest) as { url: string }[]) {
      expect(readFileSync(join(directory, asset.url.split('/').at(-1)!), 'utf8')).toContain('</svg>')
    }
    expect(readdirSync(directory).filter(file => file.endsWith('.tmp') || file.endsWith('.lock'))).toEqual([])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
