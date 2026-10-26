import type { MaybeRefOrGetter } from 'vue'
import type { NuxtApp } from '#app'
import type { RuntimeIcon } from '../../../types/runtime-icon.type'
import { resolveRuntimeIconName } from '../../../functions/resolve-runtime-icon-name'

type IconRequest = {
  name: string | undefined
  baseURL: string
  request: ReturnType<typeof useRequestFetch>
}

function createIconRequest(state: IconRequest) {
  // Nuxt caches the handler after its first owner unmounts. Capture request
  // values here, rather than a component's computed props or setup context.
  return async (_app: unknown, { signal }: { signal: AbortSignal }): Promise<RuntimeIcon> => {
    const current = state.name
    if (!current) {
      return { name: '', status: 'missing' }
    }
    try {
      return await state.request<RuntimeIcon>(`${state.baseURL}/api/runtime-icon`, { query: { name: current }, signal })
    } catch {
      return { name: current, status: 'unavailable' }
    }
  }
}

function getCachedIcon(cacheKey: string, app: NuxtApp) {
  const cached = app.payload.data[cacheKey] ?? app.static.data[cacheKey]

  return cached?.status === 'unavailable' ? undefined : cached
}

// @vapor-ready — public Nuxt data APIs own SSR payloads and request disposal.
export function useRuntimeIcon(name: MaybeRefOrGetter<string>) {
  const options = useAppConfig().icon
  const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  const request = useRequestFetch()
  const canonical = computed(() => resolveRuntimeIconName(toValue(name), options))
  const key = computed(() => `ui-icon:${canonical.value ?? 'class-only'}`)
  const requestState = { name: canonical.value, baseURL, request }
  watch(canonical, current => requestState.name = current, { flush: 'sync' })
  // Nuxt reads its computed key while disposing async data. Vue 3.6 can
  // subscribe that read to a surviving Vapor parent's scope. Collect teardown
  // reads in a temporary scope, then stop it after disposal has finished.
  const dataScope = effectScope(true)
  onScopeDispose(() => {
    const cleanupScope = effectScope(true)
    try {
      cleanupScope.run(() => dataScope.stop())
    } finally {
      cleanupScope.stop()
    }
  })
  const { data } = dataScope.run(() => useAsyncData(key, createIconRequest(requestState), {
    deep: false,
    dedupe: 'defer',
    // Reuse loaded icons after all their owners unmount, including offline.
    getCachedData: getCachedIcon,
  }))!
  const icon = computed(() => data.value?.name === canonical.value ? data.value : undefined)

  return { canonical, icon }
}
