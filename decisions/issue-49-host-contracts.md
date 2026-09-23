# Issue #49: Undocumented host-provided contracts

Status: part 1 implemented (safe guard); parts 2 and 3 need a maintainer decision
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; the relevant lines are unchanged)

## Problem

The layer silently expects three things from the host: a `DocumentationBtn` component, a compatible i18n locale
setup, and a custom icon directory at a specific path. None of this is documented, and there is no fallback.

## 1. `DocumentationBtn` referenced but never shipped: confirmed, fixed here

- `app/components/Table/TableColumnSelectionBtn.vue:154` renders `<DocumentationBtn path="columnSelection" />`.
- Before this PR, no component with that name existed in the layer, and the same was true on `master`
  (`client/components/Table/TableColumnSelectionBtn.vue:152`). It also does not exist anywhere in the monorepo:
  LC, GentlCore, ExtendedUI and DynamicGrid have no `DocumentationBtn`. So the monorepo apps hit the same
  unresolved-component warning whenever the column dialog opens.

**Implemented:** `app/components/Documentation/DocumentationBtn.vue` is a no-op component with a `path?: string` prop
that renders only its default slot, so nothing by default. Nuxt gives the host (and layers closer to it) higher
component priority, and when names collide the higher-priority component silently replaces the lower one. Nuxt 4.5
`components` scan: `newPriority > existingPriority` → replace, and it warns only on equal priority. So:

- Hosts without a `DocumentationBtn` lose the dev warning and the empty unknown `<documentationbtn>` element. Nothing
  visible changes.
- Hosts with their own `DocumentationBtn` keep rendering theirs, unchanged.

This makes `DocumentationBtn` a documented override point instead of an accidental dependency. The only prop the
layer passes today is `path` (a documentation key, currently `'columnSelection'`).

## 2. The layer registers its own i18n locales into the host: confirmed, with nuances

- `nuxt.config.ts:146-172`: `strategy: 'prefix_and_default'`, `detectBrowserLanguage` (cookie `lang`),
  `langDir: '../i18n'`, `defaultLocale: 'en-US'`, and locales `en-US` / `cs-CZ` with `file`, `dateFormat`, `currency`
  and `icon`.
- **Locales are unioned across layers.** `@nuxtjs/i18n@10.6` `applyLayerOptions` pushes every layer's `locales` and
  runs `mergeConfigLocales`, so a host with, say, `en` / `de` ends up with `en`, `de`, `en-US` and `cs-CZ`. Confirmed.
- **Scalar options only fall through when the host does not set them.** `strategy`, `defaultLocale` and
  `detectBrowserLanguage` go through the normal Nuxt layer `defu` merge, where the host wins. So "inherits a routing
  strategy it did not choose" is only true for hosts that do not set `strategy`. The claim is accurate for those
  hosts, but a host can override it.
- **Not mentioned in the issue:**
  - The locales are not only cosmetic. The layer's own UI strings (`i18n/en-US_ui.json`, `cs-CZ_ui.json`, for
    example `table.customizeColumns`) are keyed by these locale codes. A host using `en` instead of `en-US` gets
    untranslated keys in layer components unless it also loads the layer's messages under its own code.
  - The base layer **Utilities** declares the same two locales, plus `language`, and reads the custom
    `dateFormat` locale property (`packages/Utilities/app/composables/useLocale.ts`, `getLocaleDateFormat`). Dropping
    the locales from UI alone would not remove them from the host.
  - `uno.config.ts:151-155` safelists the two flag icons for these locales.

Monorepo: `apps/lc/nuxt.config.ts` declares the same `en-US` / `cs-CZ` locales and `defaultLocale: 'en-US'`
(around `:225-250`), and so do ExtendedUI, DynamicGrid and DynamicGridManagement. The union is a no-op for the
monorepo. However, LC does **not** set `strategy`, so it relies on this layer's `prefix_and_default` routing. Any change here must keep the layer's messages available under `en-US` / `cs-CZ`.

## 3. Custom icon collection path: confirmed

- `uno.config.ts:132`: `custom: FileSystemIconLoader('./client/assets/icons', …)`. `master` has the same line
  (`uno.config.ts:162`).
- There is no `assets/icons` directory in the layer on either branch. `master` had a `client/` directory but no
  `client/assets/icons`.
- `FileSystemIconLoader` resolves the relative path against `process.cwd()`, so it points at the host's
  `client/assets/icons`. Nuxt 4 hosts keep assets in `app/assets`, and in the monorepo the cwd is `apps/lc`, where no
  `client/` exists. A missing directory quietly yields no icons, so `i-custom:*` resolves to nothing and there is no
  error.
- Monorepo: no `i-custom:` usage anywhere, apart from a unit test (`app/functions/resolve-icon-value.spec.ts:66-67`)
  that only checks class-string passthrough.

## Options

### i18n

1. **Keep the layer locales, but document them (recommended short-term).** State that the layer ships `en-US` and
   `cs-CZ` messages, and that the Utilities layer requires `dateFormat` / `currency` on locale objects. Hosts must
   use these codes or map the messages themselves. Also document the fallthrough of `strategy`, `defaultLocale` and
   `detectBrowserLanguage`.
2. **Stop setting routing options in the layer.** Remove `strategy` and `detectBrowserLanguage` from the layer so they
   fall back to `@nuxtjs/i18n` defaults (or to the host's settings), and keep only `locales` / `langDir`. This changes
   routing for hosts that did not set `strategy`. **That includes LC.** `apps/lc/nuxt.config.ts` sets no `strategy`,
   so LC currently inherits `prefix_and_default` from this layer, and it must set it explicitly before this change
   lands. No other monorepo layer sets `strategy`.
3. **Contribute messages without locales.** Use the `i18n:registerModule` hook, or a documented helper, so that the
   layer only adds messages to whatever locales the host declares. This is the cleanest for foreign hosts, but it is a
   bigger change and it has to be done in Utilities too.

### Icon collection

1. **Make the host path explicit (recommended).** Resolve relative to the host `srcDir` (`app/assets/icons`), for
   example by reading `NUXT_…` / layer config. Alternatively, document that hosts wanting `i-custom:*` should add
   their own `presetIcons({ collections: { custom: … } })` in their `uno.config.ts`, and remove the collection from
   the layer.
2. **Ship an icon directory inside the layer** (`resolve('./app/assets/icons')` relative to the layer) if the layer
   ever needs its own custom icons. It needs none today.
3. **Leave the line and document it.** This is the weakest option, because the default path no longer matches Nuxt 4.

## Recommendation

- Merge the `DocumentationBtn` stub.
- i18n: take option 1 now. Consider option 2 in coordination with Utilities and LC.
- Icons: remove the `custom` collection from the layer's `uno.config.ts` (it resolves nothing for any known host) and
  document the host-side `uno.config.ts` snippet. If the maintainer wants to keep it, point it at the host `srcDir`
  (`app/assets/icons`) instead of the cwd-relative `./client/assets/icons`.

## Decisions needed

- Is a no-op `DocumentationBtn` as a documented override point acceptable, or should the `<DocumentationBtn>`
  usage in `TableColumnSelectionBtn` be removed or put behind config instead?
- Should the UI layer (and Utilities) keep setting `strategy: 'prefix_and_default'` and `detectBrowserLanguage`, or
  leave routing options to the host?
- Should the layer keep registering `en-US` / `cs-CZ` locales, or contribute messages only to host-declared locales?
- Should the `custom` icon collection be removed from the layer, pointed at `<host srcDir>/assets/icons`, or kept and
  documented?
