# Issue #50: `tsconfig.json` references `.nuxt` paths that do not exist for a consumer

Status: needs a maintainer decision (documentation only in this PR)
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; `tsconfig.json` is unchanged)

## Problem

The layer's root `tsconfig.json` is the standard Nuxt 4 "solution" config. It contains only `references` to
`./.nuxt/tsconfig.{app,server,shared,node}.json` and `"files": []`. Those four files exist only after `nuxt prepare`
has run *inside the layer directory*. A host that vendors the layer source into its own tree (for example with
`degit` into `vendor/`) gets a `tsconfig.json` whose references point nowhere.

## Claims verified

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `tsconfig.json` references four `.nuxt/*.json` files | Confirmed | `tsconfig.json:1-17` on 2.3. `master` has no `tsconfig.json` at all, so this is new in 2.3. |
| They exist only after the layer itself is prepared | Confirmed | `.nuxt` is git-ignored (`.gitignore:4`) and produced by `nuxt prepare`. `package.json` has `"postinstall": "nuxt prepare"`, which runs only when the layer's own dependencies are installed in its own directory. It does not run for a `degit` copy or for `extends: 'github:gentlsro/ui#2.3'` (giget download). |
| Editors report missing projects | Plausible, not reproduced here | For a file under `vendor/ui/`, the TS server first finds `vendor/ui/tsconfig.json`. Because it has `files: []`, the server looks for the file in the referenced projects, which are missing. The result is a "file not found" diagnostic on the tsconfig, and the file ends up in an inferred project, or in the host project depending on the TS version's ancestor search. |
| `tsc -b` walking the tree reports them | Partly | `tsc -b` does not walk directories. It only follows `references` starting from the tsconfig it is given. The host's own build is affected only if the host references `vendor/ui` or runs `tsc -b vendor/ui`. Tools that glob for every `tsconfig.json` (some monorepo or lint setups) would hit it. |

## Monorepo impact

- Every Nuxt package in the monorepo uses the same scaffold: `packages/{Utilities,ExtendedUI,DynamicGrid,GentlCore}`
  and `apps/lc` all have the identical `tsconfig.json`.
- `packages/UI/.nuxt/tsconfig.*.json` exists in the monorepo (prepared on install), so the references resolve. That
  is what gives editors Nuxt auto-import types while you work on layer files, and what `vp run typecheck`
  (`nuxt typecheck`) uses.
- Removing or changing the file would break in-repo editor support and typechecking for the layer. Nothing else in
  the monorepo refers to `packages/UI/tsconfig.json`.

## Options

1. **Keep the file and document vendoring (recommended).** Add a "Vendoring the layer" note to the README:
   - Either run `nuxi prepare` inside the vendored directory, which needs the layer's dependencies to be resolvable
     from it,
   - or delete `vendor/<layer>/tsconfig.json` as part of the vendoring step. The host's own `.nuxt/tsconfig.app.json`
     already includes layer source directories (for example `packages/UI/app/**/*` in LC's generated config), so type information comes from the host project.

   Zero risk for the monorepo and for `extends`-by-package consumers.
2. **Make the references non-fatal.** For example, replace the solution config with `{ "extends": "./.nuxt/tsconfig.json" }`.
   A missing file is still an error, so this only moves the problem. Not recommended.
3. **Remove `tsconfig.json` from the repo and generate it** in `postinstall` / `nuxt:prepare`. This avoids dangling
   references for vendoring consumers, but it breaks the "fresh clone opens cleanly" workflow and differs from the
   other monorepo packages. It is unusual, and git would see a generated root file unless it is ignored.
4. **Exclude it from distribution.** Add `"files"` to `package.json` so that `tsconfig.json` is not packed. This only
   helps an npm-published package. The package is `private`, and vendoring and `github:` extends take the whole
   tree, so this has no effect on the reported case.

## Recommendation

Option 1. The file is the standard Nuxt 4 layout, and the layer's own development and the monorepo need it. The
reported problem only affects consumers who copy the source tree, and one documented step (prepare it, or drop the
file) fixes it.

## Decisions needed

- Is vendoring (copying the layer source into a host) a supported consumption mode? If it is, should the README have
  a "Vendoring" section with the prepare or delete step?
- Or do you prefer to make the layer tree vendor-clean (option 3), accepting that contributors must run
  `nuxt prepare` (or install) before the editor works?
