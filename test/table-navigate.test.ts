import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { tableBuildUrlQuery } from '../app/components/Table/functions/table-navigate'
import { tableTrackNavigation } from '../app/components/Table/functions/table-track-navigation'

function createTestRouter() {
  const component = { render: () => null }

  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/list', component },
      { path: '/create', component },
    ],
  })
}

function flush() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function createDeferred() {
  let resolve!: () => void
  const promise = new Promise<void>(res => resolve = res)

  return { promise, resolve }
}

describe('tableBuildUrlQuery', () => {
  it('merges the table params into the live query without dropping foreign params', () => {
    const query = tableBuildUrlQuery({
      columns: [{ field: 'name' }],
      currentQuery: { statementId: '42', tags: ['a', 'b'], take: '10', select: 'old', name: 'x' },
      queryParams: new URLSearchParams('select=name,amount&take=25&skip=0'),
    })

    expect(query).toEqual({
      statementId: '42',
      tags: ['a', 'b'],
      select: 'name,amount',
      take: '25',
      skip: '0',
    })
  })

  it('drops stale table params and skips pagination in infinite scroll mode', () => {
    const query = tableBuildUrlQuery({
      columns: [],
      currentQuery: { filters: 'old', search: 'old', skip: '50' },
      queryParams: new URLSearchParams('take=25&skip=25&order=(name.asc)'),
      isInfiniteScroll: true,
    })

    expect(query).toEqual({ order: '(name.asc)' })
  })

  it('does not decode already decoded values a second time', () => {
    const query = tableBuildUrlQuery({
      columns: [],
      currentQuery: { note: '100%25' },
      queryParams: new URLSearchParams([['search', '50%']]),
    })

    expect(query).toEqual({ note: '100%25', search: '50%' })
  })
})

describe('tableTrackNavigation', () => {
  it('waits for a pending navigation, so a table write cannot cancel it', async () => {
    const router = createTestRouter()
    await router.push('/list')

    const tracker = tableTrackNavigation(router)
    const guard = createDeferred()
    const removeGuard = router.beforeEach(() => guard.promise)

    const pushed = router.push('/create')
    await flush()

    expect(tracker.isPending()).toBe(true)

    let isIdle = false
    const idle = tracker.waitForIdle().then(() => isIdle = true)
    await flush()

    expect(isIdle).toBe(false)

    guard.resolve()
    await pushed
    await idle

    expect(tracker.isPending()).toBe(false)
    expect(router.currentRoute.value.path).toBe('/create')
    removeGuard()
  })

  it('treats `page:loading:start` as pending before the router guards run', async () => {
    const router = createTestRouter()
    await router.push('/list')

    // Like Nuxt route middleware, registered before the tracker, so the
    // tracker's own `beforeEach` never runs for the aborted navigation
    const removeGuard = router.beforeEach(() => false)
    const listeners: Record<string, () => void> = {}
    const tracker = tableTrackNavigation(router, {
      hook: (name, fn) => listeners[name] = fn,
    })

    listeners['page:loading:start']!()
    expect(tracker.isPending()).toBe(true)

    await router.push('/create')
    removeGuard()

    expect(tracker.isPending()).toBe(false)
    expect(router.currentRoute.value.path).toBe('/list')
  })

  it('keeps waiting when a newer navigation replaces the pending one', async () => {
    const router = createTestRouter()
    await router.push('/list')

    const tracker = tableTrackNavigation(router)
    const guard = createDeferred()
    const removeGuard = router.beforeEach(to => to.query.slow ? guard.promise : undefined)

    const first = router.push('/list?first=1')
    const second = router.push('/create?slow=1')
    await first

    expect(tracker.isPending()).toBe(true)

    guard.resolve()
    await second
    removeGuard()

    expect(tracker.isPending()).toBe(false)
  })

  it('shares one tracker per router', () => {
    const router = createTestRouter()

    expect(tableTrackNavigation(router)).toBe(tableTrackNavigation(router))
  })
})
