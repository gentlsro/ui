import type { Component } from 'vue'
import { defineAsyncComponent, markRaw } from 'vue'

type ComponentModule = { default: Component } | Component
type ComponentLoader = () => Promise<ComponentModule>

const componentLoaders = import.meta.glob('../components/**/*.vue') as Record<string, ComponentLoader>
const componentCache = new Map<string, Component>()
const loaderPathByKey = new Map<string, string[]>()

function toLookupKey(value: string) {
  const fileName = value
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    ?.replace(/\.vue$/i, '')
    ?? value

  return fileName.replace(/[-_]/g, '').toLowerCase()
}

for (const path of Object.keys(componentLoaders)) {
  const key = toLookupKey(path)
  const list = loaderPathByKey.get(key) ?? []
  list.push(path)
  loaderPathByKey.set(key, list)
}

/**
 * Resolves a component by name from the UI component folder.
 * Uses async components to keep Vite chunk-splitting intact.
 */
export function resolveRegisteredComponent(name: string): Component | string {
  const cacheKey = toLookupKey(name)
  const cached = componentCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const possiblePaths = loaderPathByKey.get(cacheKey)

  if (!possiblePaths?.length) {
    // Keep native tags (div/span/...) and unknown names untouched.
    return name
  }

  if (possiblePaths.length > 1) {
    console.warn(`[UI] Multiple components match "${name}". Using "${possiblePaths[0]}".`)
  }

  const selectedPath = possiblePaths[0]
  const loader = componentLoaders[selectedPath as keyof typeof componentLoaders]

  const component = markRaw(defineAsyncComponent(async () => {
    const mod = await loader?.()

    if (mod && typeof mod === 'object' && 'default' in mod) {
      return mod.default
    }

    return mod as Component
  }))

  componentCache.set(cacheKey, component)

  return component
}
