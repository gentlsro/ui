// Types
import type { IBreadcrumb } from '../types/breadcrumb.type'

export const breadcrumbsKey: InjectionKey<Ref<IBreadcrumb[] | undefined>> = Symbol('breadcrumbs')
