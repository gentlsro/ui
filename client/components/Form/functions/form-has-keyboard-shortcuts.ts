export function formHasKeyboardShortcuts(
  propsNoShortcuts?: boolean,
  storeNoShortcuts?: boolean,
) {
  if (!isNil(propsNoShortcuts)) {
    return !propsNoShortcuts
  }

  return !!storeNoShortcuts
}
