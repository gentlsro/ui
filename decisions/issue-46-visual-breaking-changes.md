# Issue #46: Undocumented visual breaking changes in 2.3

Status: needs a maintainer decision (documentation only in this PR)
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; the relevant lines are unchanged)
Re-checked against `origin/2.3` @ `9cd99e37` on 2026-11-14: the three defaults are unchanged. The opt-outs and the
script example below were corrected after running them against `@unocss/core@66.10.0`.

## Problem

Upgrading a host from `master` (1.x layout, `client/`) to `2.3` changes three defaults that restyle the app. None
of them is noted anywhere. Since `fec64864` the layer has a `CHANGELOG.md` with a Breaking / Migration table, but it
does not list these three changes, and neither do `README.md` or `docs/en-US/index.md`.

## Claims verified

### 1. `PageDrawer` lost its primary background: confirmed

- `master` `config.ts:770-782`: `pageDrawer.props.ui.contentClass: () => 'bg-primary color-white'`,
  `bottomClass: () => 'bg-primary color-white p-1'`.
- `2.3` `app/components/Page/constants/page-drawer-default-props.constant.ts:19-39`: `contentClass` / `bottomClass`
  default to `… bg-white dark:bg-dark-950` with no text colour. `app/config.ts:992-1012` passes `defaults.all`
  through.
- So a host that relied on the default gets a white or dark-950 drawer, and its text changes from white to the
  inherited colour.
- The `ui.*Class` signature also changed. On `master` it was `(isMini: boolean) => ClassType`
  (`client/components/Page/types/page-drawer-props.type.ts:61-81`). It is now `({ defaults, isMini }) => …`
  (`app/components/Page/PageDrawer.vue`).
  - An override that ignores its argument, like `() => 'bg-primary color-white'`, keeps running, but it replaces
    `defaults.all` entirely. That includes the layout classes
    (`flex flex-col flex-grow overflow-auto pointer-events-auto`), so it now also drops the drawer's layout.
  - An override that reads its argument, like `isMini => isMini ? a : b`, now receives an object, which is always
    truthy, so it always takes the mini branch. TypeScript hosts get a type error; JavaScript hosts get the wrong
    classes silently.

### 2. `presetIcons` gained `unit: 'rem'`: confirmed

- `2.3` `uno.config.ts:127-130`: `presetIcons({ scale: 1.2, unit: 'rem', … })`.
- `master` `uno.config.ts:159-166`: no `unit`. The preset default is `em`
  (`@unocss/preset-icons` `unit` option, `@default 'em'`).
- With `unit`, the preset writes `width/height: 1.2rem`. Without it, it writes `1.2em`. Icons inside a container with
  a non-root font size (`text-xs`, `text-2xl`, a `font-rem-*` button and so on) no longer scale with that container.

### 3. `transformerVariantGroup` restricted to `:`: confirmed, reproduced

- `2.3` `uno.config.ts:149`: `transformerVariantGroup({ separators: [':'] })`.
- `master` `uno.config.ts:172`: `transformerVariantGroup()`. The default separators are `[':', '-']`
  (`@unocss/transformer-variant-group`).
- Reproduced with `unocss@66.7.x` and `presetWind3`:
  - `separators: [':']`: `hover-(bg-red color-white)` is left untouched and **no CSS is generated**.
    `md:(p-2 m-1)` still expands.
  - default separators: it expands to `hover-bg-red hover-color-white`, and rules are generated.
- The layer uses `unocss.nuxtLayers: true` (`nuxt.config.ts:183-185`), so the layer config is merged into the host's
  config. `mergeConfigs` concatenates `transformers`, but `resolveConfig` then removes duplicates by name and keeps
  the **first** one (`uniqueBy` in `@unocss/core`). The usual host config is `mergeConfigs([config, { … }])`, with
  the layer config first, so a `transformerVariantGroup()` added by the host is dropped silently and `-` groups stay
  off. Presets are de-duplicated the same way. See "Host opt-outs" below for the form that works.

### Why the separator was probably narrowed

The `-` separator is not free. UnoCSS transformers run on whole `.vue` files, including `<script>`, so a `-(` in
JS can be rewritten. Checked with `expandVariantGroup` and the default separators:

| Source | Result | Effect |
| --- | --- | --- |
| `x-(y)` | `x-y` | Rewritten, same value |
| `a-(b+c)` | unchanged | `+` is not in the group pattern |
| `a-(b-c)` | `a-b-c` | **Different value** |
| `a-(b c)` | `a-b a-c` | **Syntax broken** |

Restricting to `:` removes that hazard.

## Monorepo impact

- **PageDrawer:** `apps/lc` does not rely on the old default. `apps/lc/app/layouts/default.vue:332-345` sets its own
  `contentClass` (`bg-white dark:bg-dark-950 …`). `apps/lc/app/features/Core/components/AppAiChatDialog.vue:464-476`
  uses `${defaults.all} bg-transparent!`. If the default went back to `bg-primary color-white`, the AI chat drawer
  would inherit `color-white` text on a transparent background, which breaks it.
- **Icon unit:** every monorepo app has been built against `rem` icons since the 2.3 line. Going back to `em` would
  resize icons across LC, GentlCore, ExtendedUI and DynamicGrid wherever the surrounding font size differs from the
  root (buttons, chips, table cells).
- **Variant groups:** I found no `-(` variant groups in `apps/*`, `packages/GentlCore`, `ExtendedUI`, `DynamicGrid`,
  `DynamicGridManagement` or the layer itself. The monorepo uses `:(` groups throughout (100+ in LC/GentlCore/ExtendedUI
  `.vue` files). `apps/lc/uno.config.ts` does not add its own transformer.

In short, the monorepo is built on the new defaults. Reverting any of them would be a visual breaking change for
the monorepo itself.

## Options

1. **Keep the 2.3 defaults and document them (recommended).** Add a "Migrating from 1.x to 2.3" section (README or
   `docs/`) that lists each change and the one-line opt-out:
   - PageDrawer: `extendUIConfig({ pageDrawer: { props: { ui: { contentClass: ({ defaults }) => \`${defaults.base} bg-primary color-white\`, bottomClass: ({ defaults }) => \`${defaults.base} bg-primary color-white\` } } } })`.
     Note that `defaults.base` includes `bg-white`, so the host class must win. Use `bg-primary!`, or build from
     the layout classes.
   - Icons and variant groups: see "Host opt-outs" below. Appending the host's preset or transformer after the layer
     config does **not** work.
2. **Restore the `master` defaults.** This is compatible for 1.x hosts but a visual break for the monorepo (see
   above). The `-` separator would also bring back the script-rewrite hazard.
3. **Make them configurable at the layer level.** For example, export the UnoCSS options from a small
   `gentlUIUnoOptions({ iconUnit, variantGroupSeparators })` helper, or read them from layer config. This means more
   API to maintain, for three knobs a host can already override (with some care).
4. **Tidy the PageDrawer override contract.** Split colour out of `defaults.base` (for example
   `defaults.color = 'bg-white dark:bg-dark-950'`) so hosts can swap only the colour. This is additive, but it changes
   the shape of `defaults`.

## Host opt-outs

UnoCSS keeps the first preset and the first transformer of each name. Verified with `resolveConfig` on
`@unocss/core@66.10.0`:

| Host config | Variant-group transformer used | Icon unit |
| --- | --- | --- |
| `mergeConfigs([layerConfig, hostConfig])` (the usual order) | Layer's (`:` only) | `rem` |
| `mergeConfigs([hostConfig, layerConfig])` | Host's | Host's (`em` by default) |

So a host that wants `em` icons or `-` groups has to put its own entries **before** the layer config:

```ts
export default mergeConfigs([
  {
    presets: [presetIcons({ scale: 1.2 })],
    transformers: [transformerVariantGroup()],
  },
  config,
])
```

Two things to say next to the snippet:

- The host's `presetIcons` replaces the layer's whole instance, including its `collections` and `extraProperties`,
  not only the unit.
- Enabling `-` groups brings back the script-rewrite hazard from the table above.

## Recommendation

Option 1. Keep the 2.3 defaults, which the monorepo depends on. Publish migration notes that also cover the other
silent 2.3 changes reported separately (#47 global CSS, #51 `modifiers.exportData`). Option 4 is a cheap follow-up
if hosts often only want to recolour the drawer. The notes should also cover the `PageDrawer` signature change,
because an override that reads `isMini` breaks without any error in a JavaScript host.

## Decisions needed

- Are the 2.3 defaults (white drawer, `rem` icons, `:`-only variant groups) intentional and final?
- Should the migration notes go into the existing `CHANGELOG.md` Breaking table, or into a separate 1.x → 2.3 guide
  that covers all the breaks in one place?
- Should `PageDrawer`'s `defaults` expose colour separately (`defaults.color`) so hosts can override just the colour?
- Should the layer offer supported knobs for icon unit and variant-group separators, or only document the
  host-side `uno.config.ts` overrides?
