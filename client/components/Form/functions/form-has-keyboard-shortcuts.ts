export function formHasKeyboardShortcuts(
  propsNoShortcuts?: boolean,
  storeNoShortcuts?: boolean,
) {
  console.log('Log ~ storeNoShortcuts:', storeNoShortcuts)
  console.log('Log ~ propsNoShortcuts:', propsNoShortcuts)
  if (!isNil(propsNoShortcuts)) {
    return !propsNoShortcuts
  }

  return !!storeNoShortcuts
}
