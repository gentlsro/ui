import type { Ref } from 'vue'
import { useLink } from 'vue-router'
import type { IUILinkProps } from '../types/link-props.type'

// @vapor-ready
export function useUILink(props: IUILinkProps, element: Ref<HTMLElement | null | undefined>) {
  const router = useRouter()
  const target = computed(() => props.to ?? props.href ?? '')
  const external = computed(() => props.external || props.navigateToOptions?.external
    || (typeof target.value === 'string' && /^(?:[a-z][\w+.-]*:|\/\/)/i.test(target.value.trim())))
  const hashLink = computed(() => typeof target.value === 'string' && target.value.startsWith('#'))
  const isDownload = computed(() => !isNil(props.download) && props.download !== false)
  const nativeURL = computed(() => external.value || hashLink.value || (isDownload.value && typeof target.value === 'string'))
  const internal = computed(() => !!target.value && !nativeURL.value)
  // Vue Router's public composable owns alias/parent/parameter matching and
  // view transitions. It needs no RouterLink rendering component or interop.
  const routerLink = useLink({
    to: computed(() => (internal.value || typeof target.value === 'object' ? target.value : router.currentRoute.value.fullPath) as Parameters<typeof router.resolve>[0]),
    replace: computed(() => props.replace || props.navigateToOptions?.replace),
    get viewTransition() {
      return props.viewTransition
    },
  })
  const resolved = computed(() => internal.value ? routerLink.route.value : undefined)
  const href = computed(() => {
    if (props.disabled) {
      return undefined
    }
    const value = !target.value ? undefined : nativeURL.value && typeof target.value === 'string' ? target.value : routerLink.href.value

    // NuxtLink also rejects executable URL schemes. Keep malformed or unsafe
    // inputs as non-navigating content instead of handing them to the browser.
    const scheme = value?.split(':')[0]?.split('').filter(char => char.charCodeAt(0) > 32).join('').toLowerCase()

    return value && !['javascript', 'vbscript', 'data'].includes(scheme ?? '') ? value : undefined
  })
  const linkTarget = computed(() => props.target ?? props.navigateToOptions?.target ?? props.navigateToOptions?.open?.target)
  const isExactActive = computed(() => internal.value && routerLink.isExactActive.value)
  const isActive = computed(() => internal.value && routerLink.isActive.value)
  const prefetched = ref(false)
  let disposed = false
  let prefetching = false
  onScopeDispose(() => disposed = true)
  watch(target, () => prefetched.value = false)
  const allowsPrefetch = computed(() => !!resolved.value && !props.disabled && !external.value && !hashLink.value
    && !isDownload.value && (!linkTarget.value || linkTarget.value === '_self')
    && props.prefetch !== false && !props.noPrefetch)

  async function prefetch() {
    if (!import.meta.client || disposed || prefetching || prefetched.value || !allowsPrefetch.value || !resolved.value) {
      return
    }
    const destination = target.value
    prefetching = true
    try {
      await preloadRouteComponents(destination as Parameters<typeof preloadRouteComponents>[0], router)
      if (!disposed && destination === target.value) {
        prefetched.value = true
      }
    } finally {
      prefetching = false
    }
  }

  function prefetchOn(mode: 'visibility' | 'interaction') {
    const setting = props.prefetchOn

    return typeof setting === 'string' ? setting === mode : setting?.[mode] ?? mode === 'visibility'
  }
  const observedElement = computed(() => allowsPrefetch.value ? element.value : null)
  useIntersectionObserver(observedElement, ([entry]) => {
    if (entry?.isIntersecting && prefetchOn('visibility')) {
      void prefetch()
    }
  })
  useEventListener(observedElement, ['pointerenter', 'focus'], () => {
    if (prefetchOn('interaction')) {
      void prefetch()
    }
  })

  function navigate(event: MouseEvent) {
    if (props.disabled || !href.value) {
      event.preventDefault()

      return
    }
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || isDownload.value || external.value || hashLink.value
      || (linkTarget.value && linkTarget.value !== '_self' && !props.navigateToOptions?.open?.windowFeatures)) {
      return
    }
    event.preventDefault()
    const options = props.navigateToOptions
    if (options?.open?.windowFeatures) {
      // Explicit popup features are part of navigateTo's public contract.
      return navigateTo(target.value as Parameters<typeof navigateTo>[0], options)
    }

    return routerLink.navigate()
  }

  const attrs = computed(() => ({
    'href': href.value,
    'target': linkTarget.value,
    'rel': props.noRel ? undefined : props.rel ?? props.navigateToOptions?.rel ?? ((linkTarget.value && linkTarget.value !== '_self') || external.value ? 'noopener noreferrer' : undefined),
    'download': isDownload.value ? props.download === true ? '' : props.download : undefined,
    'tabindex': props.disabled || !href.value ? -1 : undefined,
    'aria-disabled': props.disabled ? true : undefined,
    'aria-current': isExactActive.value && !props.noActiveLink ? props.ariaCurrentValue ?? 'page' : undefined,
    'class': {
      [props.activeClass ?? 'router-link-active']: !props.noActiveLink && (props.exact ? isExactActive.value : isActive.value),
      [props.exactActiveClass ?? 'router-link-exact-active']: !props.noActiveLink && isExactActive.value,
      [props.prefetchedClass ?? 'router-link-prefetched']: prefetched.value,
    },
  }))

  return { attrs, href, isActive, isExactActive, navigate, prefetch }
}
