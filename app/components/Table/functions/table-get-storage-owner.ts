import * as Vue from 'vue'

type NamedOwner = { type: { name?: string, __name?: string } }

/**
 * 2.3 persisted an unkeyed Table under its immediate parent's component name.
 * Vue 3.6's public getCurrentInstance skips Vapor instances. Both renderers
 * share the active instance used by provide/inject, exposed in the ESM runtime
 * but omitted from the public types. Read only the name during setup.
 */
export function tableGetStorageOwner() {
  const runtime = Vue as typeof Vue & { readonly currentInstance?: { parent: NamedOwner | null } | null }
  const parent = (runtime.currentInstance ?? Vue.getCurrentInstance())?.parent
  const type = parent?.type

  // Template-only Vapor components are functions with an SFC name.
  return typeof type === 'function' && '__name' in type
    ? (type as NamedOwner['type']).__name || type.name
    : getComponentName(parent)
}
