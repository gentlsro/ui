## UI v2.1

Missing components:

```
DragAndDrop
Field
InputBlock
Inputs
QueryBuilder
ScrollPicker
Table
VirtualScroller
```

Currently cannot update further to `v4.4.2` due to:

Relevant issues:

nuxt/nuxt#34578 – type declarations not generated correctly for shared imports
nuxt/nuxt#29962 – shared folder type conflicts
Related fix:

nuxt/nuxt#34632 – PR to fix shared type-only imports (not merged yet)

https://github.com/nuxt/nuxt/pull/34632
