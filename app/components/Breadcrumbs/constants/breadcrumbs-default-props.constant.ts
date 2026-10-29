// @unocss-include

// Types
import type { IBreadcrumbsProps } from '../types/breadcrumbs-props.type'
import { BREADCRUMBS_CLASS_COMPOSERS, BREADCRUMBS_CLASS_SLOTS } from './breadcrumbs-class-slots.constant'

export const BREADCRUMBS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = BREADCRUMBS_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: BREADCRUMBS_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    breadcrumbsClass() {
      const slots = BREADCRUMBS_CLASS_SLOTS.breadcrumbsClass()

      return withClassPicker({ ...slots, all: BREADCRUMBS_CLASS_COMPOSERS.breadcrumbsClass(slots) } as const)
    },
  },
} satisfies IBreadcrumbsProps
