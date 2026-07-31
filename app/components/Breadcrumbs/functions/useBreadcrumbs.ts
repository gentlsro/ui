import { uiConfig } from '$uiConfig'

// Types
import type { IBreadcrumb } from '../types/breadcrumb.type'

// Injections
import { breadcrumbsKey } from '../provide/breadcrumbs.provide'

const pageTitleKey = Symbol('pageTitle')

export function useBreadcrumbs(
  breadcrumbsRef?: MaybeRefOrGetter<IBreadcrumb[]>,
  options?: {
    useLastBreadcrumbAsTitle?: boolean
    title?: MaybeRefOrGetter<string>
    trigger?: MaybeRefOrGetter<any>
  },
) {
  const { $i18n } = useNuxtApp()

  const {
    useLastBreadcrumbAsTitle = uiConfig.breadcrumbs.misc.useLastBreadcrumbAsTitle,
    title,
    trigger,
  } = options ?? {}

  const pageTitle = injectLocal(pageTitleKey, ref<string>())
  const injectedBreadcrumbs = injectLocal(breadcrumbsKey, ref([])) as Ref<IBreadcrumb[]>

  function setTitle() {
    if (breadcrumbsRef) {
      injectedBreadcrumbs.value = toValue(breadcrumbsRef)
    }

    if (injectedBreadcrumbs.value && title) {
      pageTitle.value = toValue(title)

      useHead({ title })
    } else if (injectedBreadcrumbs.value && useLastBreadcrumbAsTitle) {
      const lastBreadcrumb = toValue(injectedBreadcrumbs.value).at(-1)

      const title = typeof lastBreadcrumb?.label === 'function'
        ? lastBreadcrumb.label()
        : lastBreadcrumb?.label

      if (title) {
        pageTitle.value = String(title)
        useHead({ title: String(title) })
      }
    }
  }

  provideLocal(pageTitleKey, pageTitle)
  provideLocal(breadcrumbsKey, injectedBreadcrumbs)

  setTitle()

  if (trigger) {
    watch(trigger, setTitle)
  }

  // Make sure to update the breadcrumbs when the locale changes
  watch($i18n.locale, setTitle)

  return { breadcrumbs: injectedBreadcrumbs, pageTitle, refresh: setTitle }
}
