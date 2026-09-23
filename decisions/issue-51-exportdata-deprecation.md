# Issue #51: `modifiers.exportData` removed with no deprecation path

Status: partly implemented (dev warning), rest needs a maintainer decision
Base: `origin/2.3` @ `6855bfda` (the issue cites `50ad5f6`, an ancestor; the relevant code is unchanged)

## Problem

On `master`, a host could replace the whole table export with `modifiers.exportData`. In 2.3 that modifier is
gone. Export now goes through the `exportData` prop (`ITableExport[]`), and each entry brings its own `fnc`.
When a host still passes `modifiers.exportData`, the table ignores it without any warning, so a custom (for
example server-side) export stops running and nothing tells you.

## Claims verified

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `modifiers.exportData` no longer exists | Confirmed | `master`: `client/components/Table/types/table-props.type.ts:358` (`exportData?: typeof tableExportData` inside `modifiers`), used in `client/components/Table/TableExportBtn.vue:20`. On 2.3, `app/components/Table/types/table-props.type.ts:307-400` (`modifiers`) has no `exportData`, and nothing reads `modifiers.exportData` (`grep -rn exportData app`). |
| `ITableExport.fnc` replaced it | Confirmed | `app/components/Table/types/table-props.type.ts:97` (`exportData?: ITableExport[]`), `app/components/Table/types/table-export.type.ts` (`fnc({ fileName, data })`), `app/components/Table/TableExportBtn.vue:23` → `functions/table-export-data.ts` calls `exportDefinition.fnc`. |
| No runtime warning | Confirmed (before this PR) | Nothing in `Table.vue` or the store checks for unknown modifiers. |
| No excess-property check | Partly | It holds for the pattern the issue describes: modifiers spread into an untyped object literal. A host that annotates its object as `ITableProps['modifiers']`, or writes it inline in a typed `:modifiers` binding, **does** get an excess-property error today. |
| `exportData` default was broken, now fixed at `Table.vue:143` | Confirmed | `syncRef(toRef(props, 'exportData', TABLE_EXPORTS_DEFAULT), …)` at `app/components/Table/Table.vue:143`. |

### What the issue does not mention

This is not a straight rename. The two signatures do different things:

- `master`: `exportData({ rows, columns, format })`. It got the raw loaded rows and the `TableColumn` objects, and
  the table's own `format` (`xlsx` / `csv` / `json`) picked the output.
- 2.3: `fnc({ fileName, data })`. `data` has already been flattened to `{ [columnLabel]: formattedValue }` for the
  **currently loaded** `rows` only (`functions/table-export-data.ts`). `fnc` gets no columns, no query or filters,
  and no store access.

So a server-side export that needs the current filters, sorting or column selection to fetch *all* pages cannot be
written against `fnc` alone. The host has to capture that state some other way, for example through a table `ref`
and `tableGetExposed`, or its own copy of the query state.

## Monorepo impact

- No app or package passes `modifiers.exportData`.
- `apps/lc` already uses the new API: the `exportData` prop is built from
  `apps/lc/app/widgets/GentlTable/configuration/gentl-table-export-definitions.ts` and passed in
  `apps/lc/app/widgets/GentlTable/components/BuildingBlockGentlTableResult.vue:42,283`.
- The dev warning added here does nothing for the monorepo today.

## What this PR implements (clear-cut, dev-only)

- `app/components/Table/functions/table-get-removed-modifier-warnings.ts`: a pure helper with a
  `TABLE_REMOVED_MODIFIERS` map (currently only `exportData` → migration hint). It returns the warnings for a
  given `modifiers` object.
- `app/components/Table/Table.vue`: inside `if (import.meta.dev)`, it watches the merged `modifiers` and
  `console.warn`s each message once per table instance. This also catches `modifiers.exportData` set through
  `extendUIConfig({ table: { props: { modifiers } } })`, because the merged props are used. The code is stripped from
  production builds.
- A unit test: `table-get-removed-modifier-warnings.spec.ts`.

Runtime behaviour and types are unchanged.

## Options for the remaining parts

1. **Leave the type as is (recommended for now).** Hosts that type their modifiers keep getting a compile error,
   which is the strongest signal available.
2. **Add `/** @deprecated */ exportData?: unknown` to `modifiers`.** Editors would show a strikethrough, but it
   *removes* the excess-property error for typed hosts, so this signal is weaker than option 1.
3. **Bring back a compatibility shim.** If `modifiers.exportData` is set, create synthetic `ITableExport` entries
   (xlsx/csv/json) whose `fnc` calls the legacy function with `{ rows, columns, format }`. This fully restores old
   behaviour, but it keeps a second export path alive and needs access to raw rows and columns inside the entry
   (the store would have to pass them through).
4. **Widen `ITableExport.fnc`'s payload.** Add `rows`, `columns` and maybe the store or query state to the
   payload, next to `fileName` and `data`. This is additive and closes the server-side-export gap that the rename
   opened. It is independent of the deprecation question.

## Recommendation

- Merge the dev warning.
- Document the migration (`modifiers.exportData` → `exportData: ITableExport[]`) in the 2.3 migration notes. The
  same notes are proposed in #46.
- Consider option 4 (widen the `fnc` payload with `rows` / `columns` and query state) so server-side exports have a
  real migration target.
- Do not do option 2. Only do option 3 if external consumers need a grace period.

## Decisions needed

- Is the dev-only `console.warn` acceptable, or do you prefer a different channel (for example a one-time
  `notify`)?
- Should `ITableExport.fnc` receive more context (`rows`, `columns`, filters, sorting, the table store) so that
  server-side exports can migrate?
- Do you want a temporary compatibility shim for `modifiers.exportData` (option 3), or is the warning plus
  migration notes enough?
- Where do 2.3 migration notes live (README section, `docs/`, CHANGELOG)? This is shared with #46.
