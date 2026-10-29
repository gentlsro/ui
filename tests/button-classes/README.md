# Button class defaults across Nuxt layers

This fixture extends the real UI layer through `button-theme` and `button-brand`, then adds an application override. It needs no API, database, credentials, or seed data.

From `packages/UI`:

```sh
vp exec nuxt prepare tests/button-classes/fixture
vp exec vue-tsc --noEmit -p tests/button-classes/tsconfig.json
node tests/button-classes/run-e2e.mjs

vp exec nuxt prepare tests/button-classes/fixture-plain
vp exec vue-tsc --noEmit -p tests/button-classes/tsconfig.plain.json
node tests/button-classes/run-e2e.mjs --plain
```

The browser check starts its own fixture server on port 3114 (3115 for the standalone fixture) and uses installed Google Chrome. `UI_BUTTON_PORT` changes the port. `UI_BUTTON_URL` uses an already running fixture server instead.

Evidence is written to `test-results/button-classes/layered/` and `test-results/button-classes/plain/`: `result.json`, `server-rendered.html`, `buttons.png`, `trace.zip`, and `server.log`. Inspect the trace with Playwright's trace viewer.

Failure modes covered:

- A lower layer wins over a later application value, or replaced literals remain in the TypeScript result.
- Added class names disappear between layers, or `p()` accepts maps, functions, and unknown keys.
- A nested size override erases untouched size variants.
- `all` or `p()` closes over old slot values.
- Changing one button's size leaves stale classes or changes another button instance.
- Server rendering and hydrated browser rendering disagree.

The layer files and Vue callback include exact literal assignments. `type-assertions.ts` also checks rejected keys with `@ts-expect-error`; those checks must fail if defaults widen to `any`.

## Configuration API

Use the Nuxt layer's `$meta.name` as the configuration key; the consuming application uses `app`. Export class changes as the named `uiClasses` value from the same `app/ui-config.ts` file. The ordinary default export still configures component props. This keeps nested component prop types independent from class inference. A patch can be a literal object or a callback that receives the preceding layers' defaults and current component props:

```ts
export const uiClasses = defineUIClasses('app')({
  button: {
    containerClass: {
      base: 'inline-flex items-center',
      brand: 'border-primary',
      sizes: { sm: 'min-h-7' },
    },
  },
})

export default extendUIConfig({
  button: { props: { size: 'sm' } },
})
```

Callback returns use `as const` when exact literal types matter. For custom assembly, append `.compose({ button: { containerClass: (slots, props) => ... } })`. The inherited composer remains selected if a later layer only changes slot values. Composers receive string values because later layers can replace them.

A component can then select the resolved values:

```vue
<Btn :ui="{ containerClass: ({ defaults }) => defaults.p('base', 'brand') }" />
```

Existing layer `props.ui.*Class` callbacks keep their callback-replacement behavior. Move named-default changes into `uiClasses` and assembly changes into `.compose()` to make them inherited defaults. The component's `ui` callback remains the final rendered-class override.

## Current typecheck baseline

The fixture assertions pass, including the Vue callback, exact merged literals, and rejected picker keys. The generated Nuxt type graph currently also reaches three existing diagnostics outside this change: `ListSearch.vue` TS2345, `list.store.ts` TS2322, and `pivot-transform-data.bench.ts` TS2724. Therefore the full fixture typecheck command exits nonzero until those existing errors are resolved. Saved typecheck output identifies them separately from fixture assertion failures.
