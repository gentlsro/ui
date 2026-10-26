import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { listHandleAdd } from './list-handle-add'
import type { IListItemToAdd } from '../types/list-item-to-add.type'
import type { IListProps } from '../types/list-props.type'

function createPayload() {
  const item: IListItemToAdd = {
    id: 'new:Alpha',
    label: 'Alpha',
    path: '',
    index: 0,
    ref: { label: 'Alpha' },
    _isNew: true,
  }

  return {
    item,
    isNewItem: true,
    isSelected: false,
    addedItems: ref<IListItemToAdd[]>([]),
    addConfig: undefined,
    emits: {
      select: vi.fn(),
      unselect: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      itemClick: vi.fn(),
      groupClick: vi.fn(),
      itemMoved: vi.fn(),
      fetchData: vi.fn(),
    },
  }
}

describe('list new item label contracts', () => {
  it.each<IListProps['itemLabel']>(['label', item => item.label])(
    'adds a selectable new record with a string or getter label (%s)',
    itemLabel => {
      const payload = createPayload()
      listHandleAdd({ ...payload, itemLabel })
      expect(payload.addedItems.value).toMatchObject([
        { id: 'Alpha', ref: { id: 'Alpha', label: 'Alpha' }, _isCreate: true, _isNew: false },
      ])
      expect(payload.emits.add).toHaveBeenCalledWith(payload.addedItems.value[0])
    },
  )

  it('uses a custom record transform with a getter label', () => {
    const payload = createPayload()
    listHandleAdd({
      ...payload,
      itemKey: 'code',
      itemLabel: item => item.title,
      addConfig: { transformAddedItem: item => ({ code: 'alpha', title: item.label }) },
    })
    expect(payload.addedItems.value).toMatchObject([
      { id: 'alpha', ref: { code: 'alpha', title: 'Alpha' } },
    ])
    expect(payload.emits.add).toHaveBeenCalledOnce()
  })
})
