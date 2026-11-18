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

## Copying the layer into a project

The layer's `tsconfig.json` only references files in `.nuxt/`, which exist after
`nuxt prepare` has run inside the layer's own directory. A copy of the source that
was never prepared makes editors report missing projects.

- **Under `packages/` or `libs/` of the host:** nothing to do. The layer prepares
  itself the first time the host starts, as long as it has a `package.json` and no
  `.nuxt` directory yet.
- **Anywhere else (for example `vendor/ui`):** run `nuxt prepare` inside the copied
  directory, with the layer's dependencies installed. Or delete the copied
  `tsconfig.json` and add the layer's `app/**/*` to the host's own TypeScript
  `include`, so its files still belong to a project.

Using the layer through `extends` from a package or a Git source is not affected.
