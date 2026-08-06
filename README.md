# UI

Nuxt layer with shared visual components, styles, and UI composition utilities.

Add it to `extends` in `nuxt.config.ts`. Depends on **Gentl Utilities**.

## Extending config

Create `app/ui-config.ts` and export a default via `extendUIConfig`.
Layer configs are *merged* at build time.

```ts
export default extendUIConfig({
  button: {
    props: { size: 'sm', noUppercase: true },
  },
  breadcrumbs: {
    home: {
      path: () => '/',
    },
  },
})
```

Use `props` for default component props, and `merge` when nested objects should deep-merge instead of replace.

Note: you probably should not use `merge` yourself, it is already defined in the default config.
