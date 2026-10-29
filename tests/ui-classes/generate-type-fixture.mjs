import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(here, 'surface-cases.json'), 'utf8'))
const fixture = join(here, 'generated-fixture')
const uiRoot = join(here, '../..')

function fixtureImport(target) {
  return JSON.stringify(relative(fixture, join(uiRoot, target)).replaceAll('\\', '/'))
}

function write(path, content) {
  const target = join(fixture, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${content}\n`)
}

for (const [key, directory, parent] of [
  ['type-theme', 'support/theme', '../../../../../'],
  ['type-brand', 'support/brand', '../theme'],
  ['app', '.', './support/brand'],
]) {
  write(`${directory}/nuxt.config.ts`, `export default defineNuxtConfig({extends:[${JSON.stringify(parent)}],$meta:{name:${JSON.stringify(key)}},devtools:{enabled:false},fonts:{providers:{}}})`)
  const components = {}
  for (const { component, surface } of cases) {
    components[component] ??= {}
    components[component][surface] = key === 'type-theme'
      ? { verificationValue: `theme-${component}-${surface}`, verificationTheme: 'theme-only' }
      : key === 'type-brand'
        ? { verificationValue: `brand-${component}-${surface}`, verificationBrand: 'brand-only' }
        : { verificationValue: `app-${component}-${surface}` }
  }
  write(`${directory}/app/ui-config.ts`, `export const uiClasses = defineUIClasses(${JSON.stringify(key)})(${JSON.stringify(components, null, 2)})\nexport default extendUIConfig({})`)
}
write('uno.config.ts', `export { default } from ${fixtureImport('uno.config')}`)
const runtimeImports = [...new Set(cases.map(({ layeredFile, layeredSymbol }) =>
  `import { ${layeredSymbol} } from ${JSON.stringify(`#layers/ui/app/components/${layeredFile.replace(/\.ts$/, '')}`)}`))]
const runtimeChecks = cases.map(({ component, surface, layeredSymbol, acceptsProps }) => {
  const props = component === 'buttonGroup'
    ? "{ ...payload, variant: 'pill' as const }"
    : component === 'skeleton'
      ? "{ ...payload, variant: 'wave' as const }"
      : 'payload'

  return `  inspect(${JSON.stringify(component)}, ${JSON.stringify(surface)}, ${layeredSymbol}.${surface}(${acceptsProps ? props : ''}))`
})
write('app/app.vue', `<script setup lang="ts">
import { Day } from '#layers/utilities/app/models/day.model'
${runtimeImports.join('\n')}

const hydrated = ref(false)
onMounted(() => { hydrated.value = true })
const payload = {
  size: 'md', color: 'primary', layout: 'horizontal', position: 'center',
  align: 'center', variant: 'info', hasSearch: false, pauseOnHover: false,
  vertical: false, outlined: false, contained: false, isSelected: false,
  disabled: false, hasLabel: true,
  day: new Day('2026-10-24', {
    periodStart: $date('2026-10-01'), periodEnd: $date('2026-10-31'),
  }),
} as const
function inspect(component: string, surface: string, defaults: {
  verificationValue: string, verificationTheme: string, verificationBrand: string,
  all: string, p: (key: 'verificationValue') => string,
}) {
  return { component, surface, winner: defaults.verificationValue,
    theme: defaults.verificationTheme, brand: defaults.verificationBrand,
    picked: defaults.p('verificationValue'), all: defaults.all }
}
const catalog = [
${runtimeChecks.join(',\n')}
]
</script>
<template>
  <main>
    <h1>Layered class runtime catalog</h1>
    <output data-testid="hydrated">{{ hydrated }}</output>
    <p>{{ catalog.length }} actual component class resolvers</p>
    <pre data-testid="catalog-results">{{ JSON.stringify(catalog, null, 2) }}</pre>
  </main>
</template>`)
const checks = cases.map(({ component, surface, maps }, index) => `
export function verify${index}(defaults: UIClassPicker<UIResolvedClasses[${JSON.stringify(component)}][${JSON.stringify(surface)}]>) {
  const winner: ${JSON.stringify(`app-${component}-${surface}`)} = defaults.verificationValue
  const inheritedTheme: 'theme-only' = defaults.verificationTheme
  const inheritedBrand: 'brand-only' = defaults.verificationBrand
  defaults.p('verificationValue', 'verificationTheme', 'verificationBrand', 'all')
  // @ts-expect-error The old value must have been replaced.
  const old: ${JSON.stringify(`theme-${component}-${surface}`)} = defaults.verificationValue
  // @ts-expect-error The picker is not a string class.
  defaults.p('p')
  // @ts-expect-error Unknown class names must be rejected.
  defaults.p('verificationUnknown')
${maps.map(key => `  // @ts-expect-error Nested maps are not string classes.\n  defaults.p(${JSON.stringify(key)})`).join('\n')}
  return { winner, inheritedTheme, inheritedBrand, old }
}`).join('\n')
const grouped = Object.groupBy(cases, entry => entry.component)
const coverage = [
  `export type ComponentCoverage = Assert<Equal<keyof UIResolvedClasses, ${Object.keys(grouped).map(key => JSON.stringify(key)).join(' | ')}>>`,
  ...Object.entries(grouped).map(([component, entries], index) =>
    `export type SurfaceCoverage${index} = Assert<Equal<keyof UIResolvedClasses[${JSON.stringify(component)}], ${entries.map(entry => JSON.stringify(entry.surface)).join(' | ')}>>`),
].join('\n')
write('type-assertions.ts', `import type { UIClassPicker, UIResolvedClasses } from ${fixtureImport('app/types/ui-class-config.type')}
type Assert<T extends true> = T
type Equal<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false
${coverage}
${checks}`)
write('tsconfig.json', JSON.stringify({ extends: './.nuxt/tsconfig.app.json', include: ['./.nuxt/nuxt.d.ts', './.nuxt/imports.d.ts', './.nuxt/types/**/*.d.ts', './app/**/*.ts', './app/**/*.vue', './support/**/app/**/*.ts', './type-assertions.ts'] }, null, 2))
console.log(`Generated exact-literal and picker checks for ${cases.length} surfaces across ${new Set(cases.map(entry => entry.component)).size} components`)
