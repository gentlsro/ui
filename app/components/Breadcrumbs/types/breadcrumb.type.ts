import type { Component, VNode } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

/** A breadcrumb button, or a component rendered in its place (Breadcrumbs.vue renders `component` when given) */
export type IBreadcrumb = IBtnProps & {
  component?: Component | VNode
}
