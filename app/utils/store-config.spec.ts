import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, isReadonly, nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useFormStore } from '../components/Form/stores/form.store'
import { useListStore } from '../components/List/stores/list.store'
import { useTreeStore } from '../components/Tree/stores/tree.store'
import { useTreeDmsStore } from '../components/TreeDms/stores/tree-dms.store'
import { usePivotStore } from '../components/Pivot/stores/pivot.store'
import { useQueryBuilderStore } from '../components/QueryBuilder/query-builder.store'
import { useMenuStore } from '../components/Menu/store/menu.store'
import { useSelectorStore } from '../components/Selector/stores/selector.store'

const cases = [
  { name: 'Form', create: (props: never) => useFormStore({ formProps: props }), keys: { loading: 'isLoading', submitDisabled: 'isSubmitDisabled', submitConfirmation: 'isSubmitConfirmation' }, changed: { loading: true, submitDisabled: true, submitConfirmation: true } },
  { name: 'List', create: (props: never) => useListStore({ listProps: props }), keys: { loading: 'isLoadingSource', itemKey: 'itemKey', itemLabel: 'itemLabel', clearable: 'isClearable', noFilter: 'noFilter', hiddenItems: 'hiddenItems' }, changed: { loading: true, itemKey: 'code', itemLabel: 'title', clearable: true, noFilter: true, hiddenItems: [2] } },
  { name: 'Tree', create: (props: never) => useTreeStore({ treeProps: props }), keys: { idKey: 'idKey', labelKey: 'labelKey', parentKey: 'parentKey', childrenKey: 'childrenKey', maxLevel: 'maxLevel' }, changed: { idKey: 'code', labelKey: 'title', parentKey: 'parent', childrenKey: 'nodes', maxLevel: 5 } },
  { name: 'TreeDms', create: (props: never) => useTreeDmsStore({ props }), keys: { fileKey: 'fileKey', folderKey: 'folderKey' }, changed: { fileKey: 'document', folderKey: 'directory', noNodeIcon: { file: true } } },
  { name: 'QueryBuilder', create: (props: never) => useQueryBuilderStore({ queryBuilderProps: props }), keys: { allowNegation: 'allowNegation', maxLevel: 'maxNestingLevel', breakpoint: 'breakpoint' }, changed: { allowNegation: true, maxLevel: 5, breakpoint: 800 } },
  { name: 'Pivot', create: (props: never) => usePivotStore({ props }), keys: { loading: 'isLoading' }, changed: { loading: true } },
  { name: 'Menu', create: (props: never) => useMenuStore({ menuProps: props, menuId: 'config-test' }), keys: { virtualConfig: 'virtualConfig' }, changed: { virtualConfig: { enabled: true, movable: true } } },
  { name: 'Selector', create: (props: never) => useSelectorStore({ props }), keys: { loading: 'isLoading' }, changed: { loading: true } },
]

describe('parent-owned store configuration', () => {
  it.each(cases)('$name follows parent changes and restores defaults without update events', async entry => {
    let store: Record<string, { value: unknown }>
    const propNames = [...Object.keys(entry.changed), 'modelValue', 'search', 'selection', 'meta', 'isEditing', 'errors', 'addedItems', 'options', 'config', 'data', 'items', 'virtualDimensions']
    const owner = defineComponent({
      props: propNames,
      setup(props) {
        store = entry.create(props as never) as unknown as typeof store

        return () => h('span')
      },
    })
    const wrapper = await mountSuspended(owner)
    try {
      const keys = Object.entries(entry.keys) as Array<[string, string]>
      const defaults = keys.map(([, field]) => store![field].value)
      for (const [, field] of keys) {
        expect(isReadonly(store![field]), field).toBe(true)
      }
      await wrapper.setProps(entry.changed)
      for (const [prop, field] of keys) {
        expect(store![field].value).toEqual(Reflect.get(entry.changed, prop))
      }
      if (entry.name === 'TreeDms') {
        expect(store!.hasNodeIcon.value).toEqual({ file: false, folder: true })
      }
      if (entry.name === 'Menu') {
        expect(store!.isVirtual.value).toBe(true)
      }
      await wrapper.setProps(Object.fromEntries(Object.keys(entry.changed).map(key => [key, undefined])))
      expect(keys.map(([, field]) => store![field].value)).toEqual(defaults)
      expect(Object.keys(wrapper.emitted()).filter(event => event.startsWith('update:'))).toEqual([])
    } finally {
      wrapper.unmount()
    }
  })

  it('list updates derived keys/search/sorting without modifying parent configuration', async () => {
    let store: ReturnType<typeof useListStore>
    const sortingConfig = Object.freeze({ enabled: true })
    const row = { id: 1, code: 2, label: 'Old', title: 'Zulu' }
    const owner = defineComponent({
      props: ['itemKey', 'itemLabel', 'sortingConfig', 'items', 'search', 'selection', 'addedItems'],
      setup(props) {
        store = useListStore({ listProps: props })

        return () => h('span')
      },
    })
    const wrapper = await mountSuspended(owner, { props: { sortingConfig, items: [row, { id: 3, code: 4, label: 'Zzz', title: 'Alpha' }] } })
    try {
      expect(store!.itemByKey.value[1]).toEqual(row)
      await wrapper.setProps({ itemKey: 'code', itemLabel: 'title' })
      await nextTick()
      expect(store!.itemByKey.value[1]).toBeUndefined()
      expect(store!.itemByKey.value[2]).toEqual(row)
      expect(store!.fuseOptions.value.keys).toEqual(['title'])
      await vi.waitFor(() => expect(store!.listItems.value.map(item => item.label)).toEqual(['Alpha', 'Zulu']))
      expect(sortingConfig).toEqual({ enabled: true })
    } finally {
      wrapper.unmount()
    }
  })
})
