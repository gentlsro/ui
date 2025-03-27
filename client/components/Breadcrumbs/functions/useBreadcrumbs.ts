import { uiConfig } from '$uiConfig'

// Types
import type { IBreadcrumb } from '../types/breadcrumb.type'

// Injections
import { breadcrumbsKey } from '../provide/breadcrumbs.provide'

export function useBreadcrumbs(
  breadcrumbsRef?: MaybeRefOrGetter<IBreadcrumb[]>,
  options?: {
    useLastBreadcrumbAsTitle?: boolean
    title?: MaybeRefOrGetter<string>
    trigger?: MaybeRefOrGetter<any>
  },
) {
  const {
    useLastBreadcrumbAsTitle = uiConfig.breadcrumbs.misc.useLastBreadcrumbAsTitle,
    title,
    trigger,
  } = options ?? {}

  const injectedBreadcrumbs = injectLocal(breadcrumbsKey, ref([])) as Ref<IBreadcrumb[]>

  if (breadcrumbsRef) {
    injectedBreadcrumbs.value = toValue(breadcrumbsRef)
  }

  function setTitle() {
    if (injectedBreadcrumbs.value && title) {
      useHead({ title })
    } else if (injectedBreadcrumbs.value && useLastBreadcrumbAsTitle) {
      const lastBreadcrumb = toValue(injectedBreadcrumbs.value).at(-1)

      const title = typeof lastBreadcrumb?.label === 'function'
        ? lastBreadcrumb.label()
        : lastBreadcrumb?.label

      if (title) {
        useHead({ title: String(title) })
      }
    }
  }

  provideLocal(breadcrumbsKey, injectedBreadcrumbs)

  setTitle()

  watch(trigger, setTitle)

  return { breadcrumbs: injectedBreadcrumbs, refresh: setTitle }
}
