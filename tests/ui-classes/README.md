# Layered class defaults across UI

The fixture uses the actual UI Nuxt layer, two named configuration layers, and application overrides. It needs no backend, database, credentials, or seed data.

From `packages/UI`:

```sh
vp exec nuxt prepare tests/ui-classes/fixture
vp exec vue-tsc --noEmit -p tests/ui-classes/tsconfig.json
node tests/ui-classes/run-e2e.mjs
```

The browser runner starts the fixture on port 3116 and uses installed Google Chrome. `UI_CLASSES_PORT` changes the port; `UI_CLASSES_URL` uses an existing fixture server.

Evidence is saved under `test-results/ui-classes/representative`: SSR HTML, JSON assertions, screenshot, trace, and server log. The fixture covers static Badge/Section classes, size-dependent Checkbox/Toggle classes, DatePicker day state, InputWrapper defaults inherited by TextInput, a nested List inside Selector, and Button compatibility. It checks derived classes, `p()` keys and results, nested partial overrides, and an unchanged style callback. Selector is opened through its public `focus()` method.

Failure modes are written into the fixture before the rollout: wrong layer precedence, obsolete literal types, missing inherited picker keys, stale derived values, a lost nested-map entry, missing state payloads, and loss of configuration when a component delegates to another UI component.

Class slots, composition, and the public `DEFAULT_PROPS.ui.*` factories live together in each existing defaults file. A shared lazy resolver handles layering and picking; components do not need separate class modules. Horizontal and vertical Scroller share a defaults file, with separate exports for their independent layer keys and the original shared Scroller export retained.

The exhaustive type fixture checks every catalog component and class surface. It also requires each public defaults factory to return exactly the resolved class-picker type. Generate it from the committed surface inventory, then prepare its independent Nuxt layer graph:

```sh
node tests/ui-classes/generate-type-fixture.mjs
vp exec nuxt prepare tests/ui-classes/generated-fixture
vp exec vue-tsc --noEmit -p tests/ui-classes/generated-fixture/tsconfig.json
node tests/ui-classes/run-e2e.mjs --catalog
```

Each surface receives three overriding literals across theme, brand, and app. The checks require the application literal, retain both inherited added keys, reject the old literal, and reject `p`, missing keys, and nested map names in `p()`. Coverage assertions fail if the catalog gains or loses a component or surface without updating the inventory.

The generated page imports every component's existing defaults module and calls its `DEFAULT_PROPS.ui.*` API. Its runtime check evaluates all 251 surfaces across 58 component keys, including originally empty maps, on the server and in Chrome. Valid component payloads include a real `Day` for DatePicker. The browser verifies every winning value and picker result, inherited theme/brand fields, and string `all` output. It runs on port 3117 and saves the complete `catalog.json`, SSR HTML, screenshot, trace, and result under `test-results/ui-classes/catalog`.

The fixture type graph currently reaches three existing diagnostics: `ListSearch.vue` TS2345, `list.store.ts` TS2322, and `pivot-transform-data.bench.ts` TS2724. The full `vue-tsc` commands therefore exit nonzero while those remain; fixture assertions and new diagnostics must be assessed separately. Saved `typecheck.log` and `typecheck-result.json` record that distinction.

`get-component-props-type-assertions.ts` uses the same representative graph to check the prop helpers. Object and array defaults must remain Vue factories, callable defaults must remain callbacks, merged UI callbacks must expose the resolved layered classes, and nested overrides must retain the selected property's value and callback types. Rejected metadata keys, unknown props, invalid nested values, and invalid custom merge results are guarded with `@ts-expect-error`. A layer-registered component verifies the fallback contract; empty and optional merge lists retain their distinct return types. The saved pre-fix diagnostics are under `test-results/ui-classes/helpers`.
