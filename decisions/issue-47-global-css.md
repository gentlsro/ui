# Issue #47: The layer ships app-specific global CSS into every host

Status: needs a maintainer decision (documentation only in this PR)
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; `app/css/main.scss` is unchanged)

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
| `BtnOrNuxtLinkResolver` adds `router-link-active` itself for prefix matches | Confirmed, and it is worse than described | `app/components/Button/BtnOrNuxtLinkResolver.vue:44`. See below. |

### `BtnOrNuxtLinkResolver` prefix check runs backwards

```ts
'router-link-active': !exact && toPathString.startsWith(currentPath),
```

The check is *link target starts with the current path*. The usual rule is the opposite: *current path starts with
the link target*. The consequences:

- On `/` (and on the default-locale root under `prefix_and_default`), `currentPath` is `/`, so **every** `Btn` with
  an absolute `to` is marked active and turns `color-primary`.
- On `/a`, links to `/a/b` and to `/ab` are marked active, while the link to `/a` is active only because Vue Router
  also marks it.
- `exact` defaults to `undefined` (`app/config.ts:82`), so every `Btn` link uses this check.

The same code is on `master` (`client/components/Button/BtnOrNuxtLinkResolver.vue:44`). On `master` it did not
change colours, because no global rule targeted the class. The 2.3 global rule makes the bug visible. This is a
separate bug from the global-CSS question, and it is worth its own issue or PR.

## Who uses these classes

### Inside the layer

- `.link` is used in `Card/MiniCard.vue:188,226`, `Chip/Chip.vue:105`, `Table/TableCell.vue:112`,
  `Table/TableRow.vue:357` and `Inputs/FileInput/FilePreview2.vue:125`. It is layer styling and has to live
  somewhere.
- `router-link-active` is only emitted by `BtnOrNuxtLinkResolver.vue:44`. No layer component styles it locally.
- `.management-page`, `.pano-logo-comp` and `.copyright` are not referenced by any layer component.

### In the monorepo

- `.link`: used directly across LC (for example `features/Auth/components/SignInForm.vue:77,102`,
  `features/Attendance/components/AttendanceTable.vue:100`, `widgets/Redmine/…DetailDialog.vue:119`).
- `.router-link-active`: `packages/DynamicGrid` adds it to mark the active area or link
  (`BuildingBlockArea/BuildingBlockAreaResult.vue:110`, `BuildingBlockGridbox.vue:126`,
  `BuildingBlockFlexbox.vue:85`, `BuildingBlockLink/BuildingBlockLinkResult.vue:111`) and relies on the global
  `color-primary`. Only `BuildingBlockLinkResult.vue:148` adds its own `--active-color` override. LC navigation also
  gets the colour through NuxtLink.
- `.management-page`: 8 LC management pages
  (`apps/lc/app/pages/[domainName]/{organizations,structures,secrets,projects,roles,tags,users,activity-types}/management/[...slug].vue`)
  add it through `PageWrapper` `contentClass`. This is LC product layout.
- `.pano-logo-comp`, `.copyright`: no usage in `apps/*` or `packages/*`. They are leftovers, probably from hiding a
  third-party widget in some app.

Removing any rule other than the last two would visibly change LC or DynamicGrid unless the rule moves somewhere
else first.

## Options

1. **Remove the dead rules only (`.pano-logo-comp`, `.copyright`, empty `.link {}`).** Nothing in the monorepo uses
   them, and they are the most harmful for foreign hosts because they hide content. Low risk. Hosts outside the
   monorepo that relied on the layer hiding these would regress, but that is unlikely and undocumented.
2. **Move `.management-page` to LC** (for example `apps/lc/app/css/management-page.scss` or a scoped style on a
   shared LC wrapper). This is product layout, not a UI primitive. The change needs coordination: LC must add the
   stylesheet in the same monorepo bump as the layer removal.
3. **Namespace the layer's own classes.** Rename `.link` to a layer-prefixed class (for example `.ui-link`) inside
   layer components, and keep `.link` as a documented, opt-in utility (or UnoCSS shortcut). Hosts that use `.link`
   (LC) either keep it through the shortcut or migrate.
4. **Scope `.router-link-active`.** Replace the global rule with a scoped style in `Btn` (for example
   `a.btn.router-link-active:not(.no-active)`). DynamicGrid would then need its own active-colour rule, and
   `BuildingBlockLinkResult.vue` already has the hook for it. Host navigation built with plain `NuxtLink` would stop
   turning primary, so LC should check its nav. Separately, fix the reversed prefix check in `BtnOrNuxtLinkResolver`
   (see above).
5. **Split global CSS into opt-in files.** Keep `reset`, `typography` and so on in `css`, and move the "Gentl app
   conventions" (`.link`, active-link colour, management page) to a separate `app/css/app-conventions.scss` that hosts
   add explicitly. The monorepo apps would add it. This is the most portable result, but it touches every consuming
   app.

## Recommendation

Do this in stages:

- **Now (low risk):** option 1. Remove `.pano-logo-comp`, `.copyright` and the empty `.link {}`. Fix the reversed
  `startsWith` in `BtnOrNuxtLinkResolver`, which is a bug on its own.
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
- Is the `BtnOrNuxtLinkResolver` prefix check (`toPathString.startsWith(currentPath)`) intentional? If not, may it be
  flipped to `currentPath.startsWith(toPathString)`, with a segment boundary check?
- Should `.link` stay a global, public utility class, or be namespaced (`.ui-link`) or made opt-in?
