// Types
import type { IBreadcrumb } from '../types/breadcrumb.type'

// Injections
import { breadcrumbsKey } from '../provide/breadcrumbs.provide'

export function useBreadcrumbs(
  breadcrumbsRef?: MaybeRefOrGetter<IBreadcrumb[]>,
  options?: { useLastBreadcrumbAsTitle?: boolean, title?: MaybeRefOrGetter<string> },
) {
  const { useLastBreadcrumbAsTitle = true, title } = options ?? {}
  const injectedBreadcrumbs = inject(breadcrumbsKey, ref([])) as Ref<IBreadcrumb[]>

  const breadcrumbs = computed(() => {
    const localBreadcrumbs = toValue(breadcrumbsRef) ?? []

    return [...injectedBreadcrumbs.value, ...localBreadcrumbs]
  })

  if (breadcrumbs.value && title) {
    useHead({ title })
  } else if (breadcrumbs.value && useLastBreadcrumbAsTitle) {
    const lastBreadcrumb = toValue(breadcrumbs.value).at(-1)
    const title = typeof lastBreadcrumb?.label === 'function'
      ? lastBreadcrumb.label()
      : lastBreadcrumb?.label

    if (title) {
      useHead({ title: String(title) })
    }
  }

  provide(breadcrumbsKey, breadcrumbs)

  return { breadcrumbs }
}
