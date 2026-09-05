import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useFormStore } from '../components/Form/stores/form.store'
import { useListStore } from '../components/List/stores/list.store'
import { useTreeStore } from '../components/Tree/stores/tree.store'
import { useTreeDmsStore } from '../components/TreeDms/stores/tree-dms.store'
import { usePivotStore } from '../components/Pivot/stores/pivot.store'
import { useQueryBuilderStore } from '../components/QueryBuilder/query-builder.store'
import { useMenuStore } from '../components/Menu/store/menu.store'

const cases = [
  { name: 'Form', props: ['isEditing', 'loading', 'submitDisabled', 'submitConfirmation', 'errors'], key: 'isEditing', initial: false, changed: true, create: (props: never) => useFormStore({ formProps: props }).isEditing },
  { name: 'List', props: ['loading', 'itemKey', 'itemLabel', 'clearable', 'noFilter', 'search', 'addedItems', 'hiddenItems', 'selection'], key: 'search', initial: 'first', changed: 'second', create: (props: never) => useListStore({ listProps: props }).search },
  { name: 'Tree', props: ['idKey', 'labelKey', 'childrenKey', 'parentKey', 'maxLevel', 'search', 'selection', 'meta', 'modelValue'], key: 'search', initial: 'first', changed: 'second', create: (props: never) => useTreeStore({ treeProps: props }).search },
  { name: 'TreeDms', props: ['fileKey', 'folderKey', 'noNodeIcon'], key: 'folderKey', initial: 'folder', changed: 'directory', create: (props: never) => useTreeDmsStore({ props }).folderKey },
  { name: 'Pivot', props: ['config', 'loading', 'data', 'items'], key: 'data', initial: [], changed: [{ id: 1 }], create: (props: never) => usePivotStore({ props }).sourceData },
  { name: 'QueryBuilder', props: ['allowNegation', 'maxLevel', 'breakpoint'], key: 'maxLevel', initial: 3, changed: 5, create: (props: never) => useQueryBuilderStore({ queryBuilderProps: props }).maxNestingLevel },
  { name: 'Menu', props: ['modelValue', 'virtualDimensions', 'virtualConfig'], key: 'modelValue', initial: false, changed: true, create: (props: never) => useMenuStore({ menuProps: props, menuId: 'model-test' }).model },
]

describe('store-owned models', () => {
  it.each(cases)('$name supports controlled and one-way bindings', async entry => {
    let model: ReturnType<typeof entry.create>
    const owner = defineComponent({
      props: entry.props,
      emits: entry.props.map(key => `update:${key}`),
      setup(props) {
        model = entry.create(props as never)

        return () => h('span')
      },
    })
    const update = vi.fn()
    const controlled = await mountSuspended(owner, {
      props: { [entry.key]: entry.initial, [`onUpdate:${entry.key}`]: update },
    })
    try {
      model!.value = entry.changed
      expect(update).toHaveBeenCalledExactlyOnceWith(entry.changed)
      expect(model!.value).toEqual(entry.initial)
      await controlled.setProps({ [entry.key]: entry.changed })
      expect(model!.value).toEqual(entry.changed)
    } finally {
      controlled.unmount()
    }
    const oneWay = await mountSuspended(owner, { props: { [entry.key]: entry.initial } })
    try {
      model!.value = entry.changed
      expect(model!.value).toEqual(entry.changed)
      expect(oneWay.props(entry.key)).toEqual(entry.initial)
      await oneWay.setProps({ [entry.key]: entry.changed })
      await oneWay.setProps({ [entry.key]: entry.initial })
      expect(model!.value).toEqual(entry.initial)
    } finally {
      oneWay.unmount()
    }
  })
})
