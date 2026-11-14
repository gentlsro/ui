import { isNavigationFailure, NavigationFailureType } from '#vue-router'
import type { RouteLocationNormalized, Router } from '#vue-router'

type INavigationTracker = {
  isPending: () => boolean
  waitForIdle: () => Promise<void>
}

type INavigationHooks = {
  hook: (name: 'page:loading:start', fn: () => void) => unknown
}

const trackers = new WeakMap<Router, INavigationTracker>()

/**
 * Tracks whether the router has a navigation in flight, so the table can hold
 * back its URL writes (which would otherwise cancel that navigation)
 *
 * One tracker is shared per router, no matter how many tables are rendered
 *
 * NOTE: A navigation held by an async `beforeRouteLeave` guard is not seen yet,
 * as component leave guards run before any global guard
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

  // NOTE: `page:loading:end` is not used ~ Nuxt also calls it for a navigation
  // that was cancelled by a newer one, which is still in flight at that point
  hooks?.hook('page:loading:start', () => start())

  router.beforeEach(to => start(to))

  // Called for successful and failed (aborted, cancelled, duplicated) navigations
  router.afterEach((to, _from, failure) => {
    const isCancelled = isNavigationFailure(failure, NavigationFailureType.cancelled)

    // Cancelled means a newer navigation took over, and that one settles on its own.
    // When nothing newer is tracked (~ it was a duplicate that never ran its guards),
    // the cancelled one is the last we hear of
    if (isCancelled && to !== pendingTo) {
      return
    }

    settle(to)
  })

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
