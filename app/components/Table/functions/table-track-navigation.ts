import type { RouteLocationNormalized, Router } from '#vue-router'

type INavigationTracker = {
  isPending: () => boolean
  waitForIdle: () => Promise<void>
}

type INavigationHooks = {
  hook: (name: 'page:loading:start' | 'page:loading:end', fn: () => void) => unknown
}

const trackers = new WeakMap<Router, INavigationTracker>()

/**
 * Tracks whether the router has a navigation in flight, so the table can hold
 * back its URL writes (which would otherwise cancel that navigation)
 *
 * One tracker is shared per router, no matter how many tables are rendered
 *
 * @param hooks Nuxt app hooks - `page:loading:start` is called before route middleware
 * run, while our own `beforeEach` guard only runs once they are done
 */
export function tableTrackNavigation(
  router: Router,
  hooks?: INavigationHooks,
): INavigationTracker {
  const existing = trackers.get(router)

  if (existing) {
    return existing
  }

  let isPending = false
  let pendingTo: RouteLocationNormalized | null = null
  let idleListeners: Array<() => void> = []

  function start(to?: RouteLocationNormalized) {
    isPending = true
    pendingTo = to ?? null
  }

  function settle(to?: RouteLocationNormalized) {
    // A newer navigation replaced the one that just settled, keep waiting for it
    if (to && pendingTo && to !== pendingTo) {
      return
    }

    isPending = false
    pendingTo = null
    idleListeners.forEach(listener => listener())
    idleListeners = []
  }

  hooks?.hook('page:loading:start', () => start())
  hooks?.hook('page:loading:end', () => settle())

  router.beforeEach(to => start(to))

  // Called for successful and failed (aborted, cancelled, duplicated) navigations
  router.afterEach(to => settle(to))

  // Guards that throw skip `afterEach`
  router.onError((_error, to) => settle(to))

  const tracker: INavigationTracker = {
    isPending: () => isPending,
    waitForIdle: () => {
      if (!isPending) {
        return Promise.resolve()
      }

      return new Promise(resolve => idleListeners.push(resolve))
    },
  }

  trackers.set(router, tracker)

  return tracker
}
