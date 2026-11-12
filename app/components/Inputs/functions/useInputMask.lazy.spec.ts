// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import {
  createApp,
  createSSRApp,
  defineAsyncComponent,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  Suspense,
  toRaw,
  watch,
} from 'vue'
import type { App, Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { FactoryOpts } from 'imask'
import { useInputMask } from './useInputMask'

/**
 * A masked field behind a lazily loaded component (a page's `LazyNumberInput`) whose parent updates while the chunk
 * loads. Vue defers that update until the chunk has arrived and then runs it after the input's ref is set and before
 * the field's mounted hook (Liborkuv Board #20: the first number field showed 0 and lost typed digits).
 *
 * Failure modes (written before the adapter owned its mask):
 * 1. The input gets two masks: one created during the deferred update, one on mount, the first never destroyed.
 * 2. An empty number field shows `0`.
 * 3. Typed digits do not arrive as typed.
 * 4. The same after server rendering and hydration.
 * 5. The mask does not exist yet in the field's or a parent's mounted hook, or right after the app has mounted.
 * 6. A field mounted the usual way (no update while the chunk loads) changes.
 * 7. Unmounting leaves the mask bound to the input.
 */
const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach(app => app.unmount())
  document.body.innerHTML = ''
})

async function settle() {
  for (let i = 0; i < 10; i++) {
    await nextTick()
    await Promise.resolve()
  }
}

type IFieldProbe = {
  api?: ReturnType<typeof useInputMask>

  /** Every mask the field's input ever had */
  masks: Set<object>

  /** Whether a mask existed in each mounted hook */
  liveIn: Record<string, boolean>
}

function createField(probe: IFieldProbe) {
  return defineComponent({
    props: { modelValue: { type: null, default: null }, label: String },
    setup(props) {
      const api = useInputMask(shallowRef({ mask: Number, thousandsSeparator: ' ' } as FactoryOpts), {
        initialValue: props.modelValue,
        isEmptyValue: value => value == null,
      })

      probe.api = api
      watch(api.mask, mask => mask && probe.masks.add(toRaw(mask)), { flush: 'sync' })
      onMounted(() => probe.liveIn.field = !!api.mask.value)

      return () => h('input', { 'ref': api.el, 'value': api.masked.value, 'data-label': props.label })
    },
  })
}

/**
 * The field behind a lazy component whose chunk `deliver` hands over, under a parent whose root is that lazy
 * component (as a block's root is its widget): Vue defers the parent's updates while the chunk is on its way
 */
function createLazyApp(probe: IFieldProbe, chunk: 'pending' | 'loaded') {
  const Field = createField(probe)
  let deliver = () => {}
  const Lazy = defineAsyncComponent(() => chunk === 'loaded'
    ? Promise.resolve(Field)
    : new Promise<Component>(resolve => deliver = () => resolve(Field)))
  const Block = defineComponent({
    props: { label: String },
    setup(props) {
      onMounted(() => probe.liveIn.parent = !!probe.api?.mask.value)

      return () => h(Lazy, { label: props.label, modelValue: null })
    },
  })
  const label = ref('before')
  const Root = defineComponent({
    setup: () => () => h(Suspense, null, { default: () => h('div', [h(Block, { label: label.value })]) }),
  })

  return { Root, label, deliver: () => deliver() }
}

function probeOf(): IFieldProbe {
  return { masks: new Set(), liveIn: {} }
}

/** Types into the input as a browser does: the character lands at the caret, then `input` fires */
async function type(input: HTMLInputElement, text: string) {
  input.focus()

  for (const character of text) {
    const caret = input.selectionStart ?? input.value.length

    input.value = `${input.value.slice(0, caret)}${character}${input.value.slice(caret)}`
    input.setSelectionRange(caret + 1, caret + 1)
    input.dispatchEvent(new InputEvent('input', { data: character, inputType: 'insertText', bubbles: true }))
    await settle()
  }
}

describe('a masked field behind a lazily loaded component', () => {
  it('fM 1-3: has one mask, stays empty and takes every digit when its parent updated while the chunk loaded', async () => {
    const probe = probeOf()
    const { Root, label, deliver } = createLazyApp(probe, 'pending')
    const container = document.body.appendChild(document.createElement('div'))
    const app = createApp(Root)

    apps.push(app)
    app.mount(container)
    await settle()
    label.value = 'after'
    await settle()
    deliver()
    await settle()

    const input = container.querySelector('input')!

    expect(input.dataset.label, 'the deferred update arrived').toBe('after')
    expect(probe.masks.size, 'fM 1: one mask').toBe(1)
    expect(input.value, 'fM 2: an empty field').toBe('')

    await type(input, '523800')

    expect(input.value, 'fM 3: every digit').toBe('523 800')
    expect(probe.api!.typed.value).toBe(523800)
  })

  it('fM 4: has one mask and stays empty after hydration with an update before the chunk', async () => {
    const html = await renderToString(createSSRApp(createLazyApp(probeOf(), 'loaded').Root))
    const container = document.body.appendChild(document.createElement('div'))

    container.innerHTML = html

    const probe = probeOf()
    const { Root, label, deliver } = createLazyApp(probe, 'pending')
    const app = createSSRApp(Root)

    apps.push(app)
    app.mount(container)
    await settle()
    label.value = 'after'
    await settle()
    deliver()
    await settle()

    const input = container.querySelector('input')!

    expect(input.dataset.label, 'the deferred update arrived').toBe('after')
    expect(probe.masks.size, 'one mask').toBe(1)
    expect(input.value, 'an empty field').toBe('')
  })

  it('fM 6: without an update while the chunk loads it has one mask and takes every digit', async () => {
    const probe = probeOf()
    const { Root, deliver } = createLazyApp(probe, 'pending')
    const container = document.body.appendChild(document.createElement('div'))
    const app = createApp(Root)

    apps.push(app)
    app.mount(container)
    await settle()
    deliver()
    await settle()

    const input = container.querySelector('input')!

    expect(probe.masks.size).toBe(1)
    expect(input.value).toBe('')

    await type(input, '12400')

    expect(input.value).toBe('12 400')
  })
})

describe('a masked field mounted the usual way', () => {
  it('fM 5, 7: has its mask in the mounted hooks and right after mounting, and none once unmounted', async () => {
    const probe = probeOf()
    const Field = createField(probe)
    const Parent = defineComponent({
      setup() {
        onMounted(() => probe.liveIn.parent = !!probe.api?.mask.value)

        return () => h(Field, { modelValue: 1200 })
      },
    })
    const container = document.body.appendChild(document.createElement('div'))
    const app = createApp(Parent)

    app.mount(container)
    probe.liveIn.afterMount = !!probe.api!.mask.value

    const input = container.querySelector('input')!
    const mask = toRaw(probe.api!.mask.value) as { el?: unknown } | undefined

    await settle()

    expect(probe.liveIn, 'fM 5').toEqual({ field: true, parent: true, afterMount: true })
    expect(probe.masks.size).toBe(1)
    expect(input.value).toBe('1 200')

    app.unmount()

    expect(probe.api!.mask.value, 'fM 7: no mask is left').toBeUndefined()
    expect(mask?.el, 'fM 7: the mask let go of the input').toBeUndefined()
  })
})
