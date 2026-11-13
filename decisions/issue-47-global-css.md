# Issue #47: The layer ships app-specific global CSS into every host

Status: needs a maintainer decision (documentation only in this PR)
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; `app/css/main.scss` is unchanged)
Re-checked against `origin/2.3` @ `9cd99e37` on 2026-11-14: `main.scss` is still unchanged, but the link code moved
(`BtnOrNuxtLinkResolver.vue` and `TableCell.vue` were deleted). The references below point at the current files.
Monorepo usage was re-checked against `mono_new` @ `42fda4f6a`.

## Problem

`nuxt.config.ts:68-78` adds `app/css/main.scss` to every host's `css`. On 2.3 that file contains top-level class
rules with common names. Some of them look product-specific. Any host element that uses the same class name gets
restyled, and in two cases hidden.

## Claims verified

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `main.scss` is loaded globally | Confirmed | `nuxt.config.ts:72`, `resolve('./app/css/main.scss')` in `css`. |
| `master` had no top-level class rules | Confirmed | `master:client/css/main.scss` only styles `html`, `#__nuxt` and `html.dark`. |
| `.link` (underline, pointer, `color-secondary` on hover) | Confirmed | `app/css/main.scss:49-55`. There is also an empty duplicate `.link {}` at `:116-118`. |
| `.router-link-active { color-primary }` | Confirmed | `app/css/main.scss:57-59`. |
| `.management-page` grid layout | Confirmed | `app/css/main.scss:61-105`. |
| `.pano-logo-comp { !hidden }` | Confirmed | `app/css/main.scss:107-109`. |
| `.copyright { !hidden }` | Confirmed, line differs | `app/css/main.scss:111-113`. The issue says `:116`, which is the empty `.link {}`. |
| `Btn` adds `router-link-active` itself for prefix matches | Confirmed, and it is worse than described | Now `app/components/Button/Btn.vue:35-40,55` (`60d0632f` folded `BtnOrNuxtLinkResolver.vue` into `Btn`). See below. |

### The `Btn` prefix check runs in the opposite direction to Vue Router

```ts
// (a link to a page under the current one is active too, unless `exact`)
const isUnderCurrent = computed(() => {
  // …
  return !props.exact && path.startsWith(localePath(route.path, locale))
})
```

The check is *link target starts with the current path*. Vue Router's rule is the opposite: *current path starts
with the link target*. The comment in `Btn.vue` describes the behaviour, so it reads as deliberate, not as a slip.
The consequences:

- On `/` (and on the default-locale root under `prefix_and_default`), the current path is `/`, so **every** `Btn`
  with an absolute `to` is marked active and turns `color-primary`.
- On `/a`, links to `/a`, `/a/b` and `/ab` are all marked active. There is no segment boundary check, so `/ab`
  counts as "under" `/a`.
- `exact` defaults to `undefined` (`app/config.ts:84`), so every `Btn` link uses this check.
- `useUILink.ts:121` also adds `router-link-active` in the router's own direction (the current page is under the
  link target). A `Btn` link is therefore marked active in **both** directions.

The same check was on `master` (`client/components/Button/BtnOrNuxtLinkResolver.vue:44`). On `master` it did not
change colours, because no global rule targeted the class. The 2.3 global rule makes it visible. This is a separate
question from the global CSS, and it is worth its own issue or PR.

## Who uses these classes

### Inside the layer

- `.link` is used in `Card/MiniCard.vue:188,226`, `Chip/Chip.vue:105`, `Table/TableRow.vue:418,640,782` and
  `Inputs/FileInput/FilePreview2.vue:125`. It is layer styling and has to live somewhere.
- `router-link-active` is emitted by `Button/Btn.vue:55` and `Link/composables/useUILink.ts:121`. No layer component
  styles it locally.
- `.management-page`, `.pano-logo-comp` and `.copyright` are not referenced by any layer component.

### In the monorepo

- `.link`: used directly across LC (for example `features/Auth/components/SignInForm.vue:77,102`,
  `features/Attendance/components/AttendanceTable.vue:100`, `widgets/Redmine/…DetailDialog.vue:119`).
- `.router-link-active`: `packages/DynamicGrid` adds it to mark the active area or link
  (`BuildingBlockArea/BuildingBlockAreaResult.vue:110`, `BuildingBlockGridbox.vue:126`,
  `BuildingBlockFlexbox.vue:85`, `BuildingBlockLink/BuildingBlockLinkResult.vue:111`) and relies on the global
  `color-primary`. Only `BuildingBlockLinkResult.vue:148` adds its own `--active-color` override. LC navigation also
  gets the colour through NuxtLink.
- `.management-page`: when this was written, 8 LC management pages added it through `PageWrapper` `contentClass`.
  They have since become one component, `apps/lc/app/features/Core/components/Management/ManagementPage.vue`, which
  is now the only place in the monorepo that uses the class. Its children (`ManagementList.vue`,
  `ManagementDetail.vue`) style themselves with their own `.management-list` / `.management-detail` classes. This is
  LC product layout, and with a single user it is now easy to move.
- `.pano-logo-comp`, `.copyright`: not used in first-party source in `apps/*` or `packages/*`. They hide something,
  so they may target markup that a third-party widget injects at runtime, which a source search cannot see. They
  came in with `2e3f6eff`, whose message ("up") gives no context.

Removing `.link`, `.router-link-active` or `.management-page` would visibly change LC or DynamicGrid unless the rule
moves somewhere else first.

## Options

1. **Remove the unused rules only (`.pano-logo-comp`, `.copyright`, empty `.link {}`).** No first-party source in the
   monorepo uses them, and they are the most harmful for foreign hosts because they hide content. The risk is that
   one of them hides third-party markup in a deployed app; confirm which app they were for before deleting. Hosts
   outside the monorepo that relied on the layer hiding these would regress, but that is unlikely and undocumented.
2. **Move `.management-page` to LC** (for example `apps/lc/app/css/management-page.scss` or a scoped style on a
   shared LC wrapper). This is product layout, not a UI primitive. The change needs coordination: LC must add the
   stylesheet in the same monorepo bump as the layer removal.
3. **Namespace the layer's own classes.** Rename `.link` to a layer-prefixed class (for example `.ui-link`) inside
   layer components, and keep `.link` as a documented, opt-in utility (or UnoCSS shortcut). Hosts that use `.link`
   (LC) either keep it through the shortcut or migrate.
4. **Scope `.router-link-active`.** Replace the global rule with a scoped style in `Btn` (for example
   `a.btn.router-link-active:not(.no-active)`). DynamicGrid would then need its own active-colour rule, and
   `BuildingBlockLinkResult.vue` already has the hook for it. Host navigation built with plain `NuxtLink` would stop
   turning primary, so LC should check its nav. Separately, decide whether the prefix check in `Btn.vue` should
   keep its direction (see above).
5. **Split global CSS into opt-in files.** Keep `reset`, `typography` and so on in `css`, and move the "Gentl app
   conventions" (`.link`, active-link colour, management page) to a separate `app/css/app-conventions.scss` that hosts
   add explicitly. The monorepo apps would add it. This is the most portable result, but it touches every consuming
   app.

## Recommendation

Do this in stages:

- **Now (low risk):** option 1. Remove the empty `.link {}`, and remove `.pano-logo-comp` and `.copyright` once
  someone confirms no deployed app needs them. Add a segment boundary check to the prefix match in `Btn.vue`, so
  `/ab` no longer counts as under `/a`; that part is a bug whichever direction is intended.
- **Next:** option 2 (move `.management-page` into LC) and option 4 (scope the active-link colour to `Btn`, and give
  DynamicGrid its own rule).
- **Keep `.link` global for now,** but document it as part of the layer's public CSS surface. Consider option 3 or 5
  if external hosts keep hitting name collisions.

None of this is implemented in this PR, because each step changes visuals for the monorepo or for external hosts.

## Decisions needed

- Can `.pano-logo-comp` and `.copyright` be deleted? Which app were they for?
- Should `.management-page` move into `apps/lc`, or is it meant as a shared layout primitive? If it is shared, it
  should be documented and possibly renamed.
- Should the layer keep colouring `.router-link-active` globally, or scope the colour to `Btn` (with DynamicGrid
  styling its own active state)?
- Is the direction of the `Btn.vue` prefix check (`path.startsWith(currentPath)`) intentional, as its comment
  suggests? If it is, should it stay next to `useUILink`'s router-direction match, which makes a link active in both
  directions? Either way, may it get a segment boundary check?
- Should `.link` stay a global, public utility class, or be namespaced (`.ui-link`) or made opt-in?
