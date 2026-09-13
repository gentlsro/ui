const popupSelector = '[data-editor-popup-open], [aria-expanded="true"]'

export function tableIsEditorPopupOpen(target: Element) {
  return !!(target.closest(popupSelector)
    || target.closest('.active-edit-cell')?.querySelector(popupSelector))
}
