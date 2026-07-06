import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'
import { execPath, env as processEnv } from 'node:process'
import type { Nuxt } from 'nuxt/schema'

const PREPARING_LAYERS_ENV = 'GENTL_PREPARING_NUXT_LAYERS'
const require = createRequire(import.meta.url)
const nuxiBin = join(dirname(require.resolve('nuxt/package.json')), 'bin/nuxt.mjs')

function isLocalLibLayer(rootDir: string, layerDir: string) {
  const relativePath = relative(rootDir, layerDir)

  return relativePath !== 'libs' && relativePath.split(/[\\/]/)[0] === 'libs'
}

function runLayerPrepare(layerDir: string, rootDir: string) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(execPath, [nuxiBin, 'prepare'], {
      cwd: layerDir,
      stdio: 'inherit',
      env: {
        ...processEnv,
        [PREPARING_LAYERS_ENV]: 'true',
        NUXT_DOTENV_DIR: rootDir,
      },
    })

    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) {
        resolvePromise()
      } else {
        reject(new Error(`Layer prepare failed in ${layerDir} with exit code ${code}`))
      }
    })
  })
}

export async function prepareLocalNuxtLayers(nuxt: Nuxt) {
  if (processEnv[PREPARING_LAYERS_ENV] === 'true') {
    return
  }

  const rootDir = nuxt.options.rootDir
  const layerDirs = Array.from(new Set(
    nuxt.options._layers
      .map(layer => layer.cwd)
      .filter(layerDir => isLocalLibLayer(rootDir, layerDir))
      .filter(layerDir => existsSync(join(layerDir, 'package.json')))
      .filter(layerDir => !existsSync(join(layerDir, '.nuxt'))),
  ))

  if (!layerDirs.length) {
    return
  }

  processEnv[PREPARING_LAYERS_ENV] = 'true'

  for (const layerDir of layerDirs) {
    console.log(`Preparing Nuxt layer ${layerDir}`)
    await runLayerPrepare(layerDir, rootDir)
  }
}
