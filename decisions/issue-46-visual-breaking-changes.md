# Issue #46: Undocumented visual breaking changes in 2.3

Status: needs a maintainer decision (documentation only in this PR)
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; the relevant lines are unchanged)

## Problem

Upgrading a host from `master` (1.x layout, `client/`) to `2.3` changes three defaults that restyle the app. None
of them is noted anywhere: the layer has no CHANGELOG or migration notes (`README.md`, `docs/en-US/index.md`).

## Claims verified

### 1. `PageDrawer` lost its primary background: confirmed

- `master` `config.ts:770-782`: `pageDrawer.props.ui.contentClass: () => 'bg-primary color-white'`,
  `bottomClass: () => 'bg-primary color-white p-1'`.
- `2.3` `app/components/Page/constants/page-drawer-default-props.constant.ts:19-39`: `contentClass` / `bottomClass`
  default to `… bg-white dark:bg-dark-950` with no text colour. `app/config.ts:992-1012` passes `defaults.all`
  through.
- So a host that relied on the default gets a white or dark-950 drawer, and its text changes from white to the
  inherited colour.
- The `ui.*Class` signature also changed. It is now `({ defaults, isMini }) => …` (`app/components/Page/PageDrawer.vue:71-113`)
  instead of `() => string`. Old overrides keep working because they ignore the argument, but they replace
  `defaults.all` entirely. That includes the layout classes (`flex flex-col flex-grow overflow-auto pointer-events-auto`),
  so a 1.x-style override like `() => 'bg-primary color-white'` now also drops the drawer's layout.

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
  config. `mergeConfigs` concatenates `transformers`, so a host can add its own `transformerVariantGroup()` to get
  `-` groups back.

### Why the separator was probably narrowed

The `-` separator is not free. The same reproduction shows the transformer rewriting script code in processed
files: `const w = x-(y)` becomes `const w = x-y`. UnoCSS transformers run on whole `.vue` files, including
`<script>`, so a `-(` in JS (for example `a-(b+c)`) gets silently corrupted. Restricting to `:` removes that hazard.

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
   - Icons: in the host `uno.config.ts`, `mergeConfigs([config, { presets: [presetIcons({ scale: 1.2 })] }])`. This
     needs verifying: preset de-duplication by name may keep the layer's instance.
   - Variant groups: in the host `uno.config.ts`, add `transformers: [transformerVariantGroup()]`. It works because
     transformers are concatenated. Warn about the `x-(y)` script hazard.
2. **Restore the `master` defaults.** This is compatible for 1.x hosts but a visual break for the monorepo (see
   above). The `-` separator would also bring back the script-rewrite hazard.
3. **Make them configurable at the layer level.** For example, export the UnoCSS options from a small
   `gentlUIUnoOptions({ iconUnit, variantGroupSeparators })` helper, or read them from layer config. This means more
   API to maintain, for three knobs a host can already override (with some care).
4. **Tidy the PageDrawer override contract.** Split colour out of `defaults.base` (for example
   `defaults.color = 'bg-white dark:bg-dark-950'`) so hosts can swap only the colour. This is additive, but it changes
   the shape of `defaults`.

## Recommendation

Option 1. Keep the 2.3 defaults, which the monorepo depends on. Publish migration notes that also cover the other
silent 2.3 changes reported separately (#47 global CSS, #51 `modifiers.exportData`). Option 4 is a cheap follow-up
if hosts often only want to recolour the drawer. The icon opt-out in option 1 should be verified before it is
documented.

## Decisions needed

- Are the 2.3 defaults (white drawer, `rem` icons, `:`-only variant groups) intentional and final?
- Where should the migration notes live (README section, `docs/en-US`, a CHANGELOG)? Should they cover all 1.x → 2.3
  breaks in one place?
- Should `PageDrawer`'s `defaults` expose colour separately (`defaults.color`) so hosts can override just the colour?
- Should the layer offer supported knobs for icon unit and variant-group separators, or only document the
  host-side `uno.config.ts` overrides?
