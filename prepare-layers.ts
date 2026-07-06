import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join, relative } from 'node:path'
import { execPath, env as processEnv } from 'node:process'
import type { Nuxt } from 'nuxt/schema'

const PREPARING_LAYERS_ENV = 'GENTL_PREPARING_NUXT_LAYERS'
const require = createRequire(import.meta.url)
const nuxiBin = join(dirname(require.resolve('nuxt/package.json')), 'bin/nuxt.mjs')

const WORKSPACE_LAYER_DIRS = ['libs', 'packages'] as const

function isLocalLibLayer(rootDir: string, layerDir: string) {
  if (layerDir === rootDir) {
    return false
  }

  const relativePath = relative(rootDir, layerDir)
  if (!relativePath || relativePath === '.') {
    return false
  }

  const segments = relativePath.split(/[\\/]/)

  for (const workspaceDir of WORKSPACE_LAYER_DIRS) {
    const index = segments.indexOf(workspaceDir)
    if (index === -1 || index >= segments.length - 1) {
      continue
    }

    if (segments.slice(0, index).every(segment => segment === '..')) {
      return true
    }
  }

  if (segments[0] === '..' && segments.length === 2 && segments[1] !== '..') {
    const workspaceParent = basename(dirname(rootDir))
    return WORKSPACE_LAYER_DIRS.includes(workspaceParent as typeof WORKSPACE_LAYER_DIRS[number])
  }

  return false
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
