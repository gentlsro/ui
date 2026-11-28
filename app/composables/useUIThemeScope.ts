import type { CSSProperties, InjectionKey, MaybeRefOrGetter } from 'vue'

/**
 * A subtree's UI theme: the CSS variables (`--color-primary-rgb`, `--radius-custom`, …) a scope sets on its element,
 * and the classes it needs. What a component teleports to `<body>` (menus, dialogs, drawers, tooltips) leaves the
 * scope's element, so it puts the scope's style and class on its own root
 */
export type IUIThemeScope = {
  style: CSSProperties
  class?: string
}

const UI_THEME_SCOPE_KEY: InjectionKey<Readonly<Ref<IUIThemeScope | undefined>>> = Symbol('ui-theme-scope')

/**
 * Sets the UI theme for the subtree: a nested scope keeps its parent's variables and overrides those it sets itself,
 * as the variables cascade in the subtree's own elements
 */
export function provideUIThemeScope(scope: MaybeRefOrGetter<IUIThemeScope | undefined>) {
  const parent = inject(UI_THEME_SCOPE_KEY, undefined)

  const merged = computed<IUIThemeScope | undefined>(() => {
    const own = toValue(scope)
    const inherited = parent?.value

    if (!inherited) {
      return own
    }

    if (!own) {
      return inherited
    }

    return {
      style: { ...inherited.style, ...own.style },
      class: [inherited.class, own.class].filter(Boolean).join(' ') || undefined,
    }
  })

  provide(UI_THEME_SCOPE_KEY, merged)

  return merged
}

/** The UI theme of the subtree this component renders in (undefined outside any scope) */
export function useUIThemeScope() {
  return inject(UI_THEME_SCOPE_KEY, computed(() => undefined))
}
