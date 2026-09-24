# Changelog

All notable changes to `@gentl/ui` are documented here.

## Unreleased

A visual refresh of the Table and QueryBuilder, plus rendering performance work on large
tables. Projects that use `<Table>` through its props, `columns` and cell slots (`#status`,
`#row-actions`, ...) need no code changes: slot names and slot props are unchanged.

### Breaking

These only affect deeper integrations. None of them are used by the apps in this monorepo.

| Change | Who is affected | Migration |
| --- | --- | --- |
| `TableColumn.semiFrozen` removed, also from the saved layout state (`ITableStateColumn`) | Code reading or setting it | Use `column.frozen`. The columns before the frozen one are handled by the table. Old saved layouts containing `semiFrozen` are ignored. |
| `column.freeze(columns, scope)` is now `freeze(columns)` | Direct callers of `freeze` | Drop the second argument. Freezing no longer rewrites column widths to px, nor writes `left` / `position` into `headerStyle` / `cellStyle`. |
| `TableCell.vue` deleted | Anyone rendering `<TableCell>` | It was not used by the table. Copy it into the project if needed. |
| `TABLE_DEFAULT_PROPS.ui.cellClass()` no longer returns `rowBorderedFirst` / `rowBorderedLast`; `bottomClass()`'s `loading` / `limitReached` are empty | Custom `ui.cellClass` / `ui.bottomClass` using those parts of `defaults` | Remove the references. Those classes never applied (their selectors did not match). |
| Rows render the cell, `row-actions` and `row-inside` slots from the Table's own slots | Projects rendering `TableContent` / `TableRow` themselves (e.g. a `#row` override passing slots to `<TableRow>`) | Pass these slots to `<Table>`. `TableRow` ignores slots passed to it, its `inner` slot and `isVisibleByColumnField` prop are gone, and `TableContent` no longer accepts cell / `row-actions` / `row-inside` slots. |
| `useQueryBuilderStore().queryBuilderElRect` removed | Custom code using the query builder store | Measure `queryBuilderEl` when needed. |
| Test ids: `data-cy="clear-sorting"` removed (each sort chip is `remove-sorting`); `data-cy="sort-outline"` only exists while the column is sorted; the filter chips' "No filters" text is gone | E2E tests | Update the selectors. |

### Changed

- **Table defaults:** no zebra rows, a white header in light mode, lighter borders, and the
  column menu button only shows on hover (or while the column is sorted / filtered).
- **Numeric columns are right-aligned**: `decimal`, `currency`, `percent` and every type in
  `dataTypeExtend.numberDataTypes`, in the header, cells and totals. Cell slots in those
  columns are right-aligned too; add `justify-start` to the slot content if that is unwanted.
- **`bordered`** now draws a rounded frame around the header, rows and totals. It previously
  had almost no effect, so tables already setting it will look different.
- **Totals:** the row is hidden when no visible column has a total, a total of `0` is shown
  (it was blank), and the first data column shows a "Total" label when it has no total itself.
- **Row count:** numbers are formatted and the page range starts at 1 (`26 - 50`).
- **Top bar and toolbar:** search, filter conditions, "Remove filters" and export share one
  row. Sorting shows as removable chips (click to remove) instead of a "Clear sorting" button.
- **Column menu, search help, column picker, layout picker, save dialog and export menu**
  were restyled; the column picker's heading now says "Available columns".
- **QueryBuilder:** "Add condition" pre-fills the first column and focuses its field, empty
  groups show a hint, the inline "AND" is hidden until there are two conditions, and the
  condition popover got a header and even spacing.
- **Editing:** Esc cancels cell / row editing even after focus has left the table, unless a
  menu or dialog is open (those close first).
- **i18n:** new keys `table.totalsLabel`, `table.noSavedLayouts`, `queryBuilder.emptyGroup`,
  `queryBuilder.condition`; `table.noFilters` is no longer used. Projects overriding the UI
  translations should add the new keys.

### Fixed

- Header and rows drifting apart with a frozen column after resizing, autofit or
  selection: the sticky offsets are now derived from the current column widths.
- The column resize guide spans the whole table again.
- Selected rows no longer show the content scrolling underneath frozen cells / row actions.
- The QueryBuilder dialog's drag ghost follows the pointer (fixed positioning) and the drop
  indicator no longer jumps out of bounds between rows or over the root group.
- The pagination limit notice, the pagination loader and the bottom bar layout.

### Performance

- Mounted rows only re-render when their own data changes. Previously every virtual scroll
  update, and every re-render of the Table, re-rendered all mounted rows (forwarded dynamic
  slots). Scrolling ~10 rows went from 1,334 row renders to 10.
- Plain cells no longer mount a component each: a row mounts 8 components instead of 19.
- Resizing a table with fixed-width columns no longer re-renders its rows.
- Combined with the cached `Intl` formatters in `@gentl/utilities`, jumping to a new part of
  a large table went from 122-189ms to ~80ms and a one-row scroll step from 24-27ms to
  7-13ms (development build, 1,000 rows).
