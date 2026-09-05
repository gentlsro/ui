import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFileInput } from './useFileInput'
import type { IFileInputProps } from '../types/file-input-props.type'
import { FileModel } from '#layers/utilities/app/models/file.model'

function mountInput(multi: boolean) {
  const model = ref<IFileInputProps['modelValue']>([])
  const emit = vi.fn()
  let input: ReturnType<typeof useFileInput>
  const surface = defineComponent({
    setup(_, { expose }) {
      const element = ref<HTMLDivElement>()
      expose({ element })

      return () => h('div', [h('div', { 'ref': element, 'data-drop-zone': '' })])
    },
  })
  const wrapper = mount(defineComponent({
    setup() {
      input = useFileInput({ model, props: { multi }, emit })

      return () => h(surface, { ref: input.fileFieldEl })
    },
  }))

  return { wrapper, model, emit, input: input! }
}

describe('file input callbacks', () => {
  it.each([false, true])('updates files and emits their models explicitly (multi=%s)', multi => {
    const { wrapper, input, model, emit } = mountInput(multi)
    try {
      const first = new File(['first'], 'first.txt', { type: 'text/plain' })
      const second = new File(['second'], 'second.txt', { type: 'text/plain' })
      input.handleAddFile([first])
      input.handleAddFile([second])
      expect(model.value!.map(item => item.name)).toEqual(multi ? ['first.txt', 'second.txt'] : ['second.txt'])
      const added = emit.mock.calls[1][1][0]
      expect(added).toBeInstanceOf(FileModel)
      expect(added.file).toBe(second)
      expect(emit.mock.calls.map(([event]) => event)).toEqual(['filesAdded', 'filesAdded'])
      const removed = model.value![0]
      input.handleRemoveFile('0')
      expect(emit).toHaveBeenLastCalledWith('filesRemoved', [removed])
      expect(model.value!.map(item => item.name)).toEqual(multi ? ['second.txt'] : [])
      input.handleAddFile(null)
      expect(emit).toHaveBeenCalledTimes(3)
    } finally {
      wrapper.unmount()
    }
  })

  it('handles file dialog changes and resets the selection for the next opening', () => {
    const { wrapper, input, model, emit } = mountInput(false)
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    try {
      input.openFileDialog()
      const dialog = click.mock.contexts[0] as HTMLInputElement
      expect(dialog.type).toBe('file')
      const transfer = new DataTransfer()
      transfer.items.add(new File(['chosen'], 'chosen.txt'))
      dialog.files = transfer.files
      expect(dialog.value).not.toBe('')
      dialog.dispatchEvent(new Event('change'))
      expect(model.value!.map(item => item.name)).toEqual(['chosen.txt'])
      expect(emit).toHaveBeenCalledExactlyOnceWith('filesAdded', model.value)
      expect(dialog.value).toBe('')
      input.openFileDialog()
      dialog.files = transfer.files
      dialog.dispatchEvent(new Event('change'))
      expect(emit).toHaveBeenCalledTimes(2)
      expect(model.value).toHaveLength(1)
    } finally {
      click.mockRestore()
      wrapper.unmount()
    }
  })

  it('routes DOM drops through the same model update and filesAdded callback', async () => {
    const { wrapper, model, emit } = mountInput(true)
    try {
      await nextTick()
      const file = new File(['dropped'], 'dropped.txt', { type: 'text/plain' })
      const transfer = new DataTransfer()
      transfer.items.add(file)
      await wrapper.trigger('drop', { dataTransfer: transfer })
      expect(model.value).toEqual([])
      expect(emit).not.toHaveBeenCalled()
      await wrapper.get('[data-drop-zone]').trigger('drop', { dataTransfer: transfer })
      expect(model.value!.map(item => item.name)).toEqual(['dropped.txt'])
      expect(emit).toHaveBeenCalledExactlyOnceWith('filesAdded', model.value)
    } finally {
      wrapper.unmount()
    }
  })
})
