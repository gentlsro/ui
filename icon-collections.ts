/**
 * The icon sets this layer installs, renders, searches and allows in source, in search order.
 *
 * Each one is an `@iconify-json/<prefix>` dependency of this package (catalog `icons`). The server
 * resolves icons from these sets only (`fallbackToApi: false`), and the IconPicker searches them
 * through `/_ui/icons/search`. Adding a set means adding both the package and the prefix here.
 */
export const ICON_COLLECTIONS = [
  'lucide',
  'tabler',
  'mdi',
  'material-symbols',
  'material-symbols-light',
  'carbon',
  'ph',
  'solar',
  'hugeicons',
  'mingcute',
  'fluent',
  'ic',
  'ri',
  'bi',
  'iconamoon',
  'heroicons',
  'octicon',
  'flowbite',
  'ep',
  'line-md',
  'svg-spinners',
  'simple-icons',
  'vscode-icons',
  'circle-flags',
  'emojione',
] as const
