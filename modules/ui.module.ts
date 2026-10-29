import { addTemplate, addTypeTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync, readFileSync } from 'node:fs'
import ts from 'typescript'

const { resolve } = createResolver(import.meta.url)
const currentDir = resolve('..')

const UI_CONFIG = '#build/uiConfig.ts'

function setAliasPaths(nuxt: Nuxt, alias: string, tsPath: string) {
  nuxt.options.typescript.tsConfig ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions.paths ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions.paths[alias] = [tsPath]
}

function generateUIConfigCode(configPaths: { path: string }[]) {
  return `import type { IFormProps } from '${resolve(currentDir, 'app/components/Form/types/form-props.type')}'
import { customDefu } from '#layers/utilities/app/utils/custom-defu'
${configPaths.map(({ path }, idx) => `import config${idx}, * as configModule${idx} from '${path}'`).join('\n')}

const uiConfigMerged = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})
export const uiConfigLayers = [${configPaths.map((_, idx) => `configModule${idx}`).reverse().join(', ')}] as const

type WrappedValue<Value> = Value extends (...args: never[]) => unknown
  ? Value
  : Value extends object ? () => Value : Value

type WrapObjects<T> = {
  [K in keyof T]: WrappedValue<T[K]>;
}

function wrapObjects<T extends Record<string, any>>(obj: T): WrapObjects<T> {
  const result = {} as WrapObjects<T>

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        (result as any)[key] = () => value
      } else {
        (result as any)[key] = value
      }
    }
  }

  return result
}

type WrapProps<T> = {
  [K in keyof T]: T[K] extends { props: infer P }
    ? { props: WrapObjects<P> } & Omit<T[K], "props">
    : T[K];
};

function wrapProps<T extends Record<string, any>>(obj: T): WrapProps<T> {
  const result = {} as WrapProps<T>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        "props" in value &&
        typeof value.props === "object" &&
        value.props !== null
      ) {
        (result as any)[key] = {
          ...value,
          props: wrapObjects(value.props),
        };
      } else {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}

// Class callbacks have been consumed by Form's defaults resolver. Component
// overrides now receive those resolved defaults, rather than replaying config.
const formUI: Record<string, unknown> = { ...uiConfigMerged.form.props.ui }
for (const key of Object.keys(formUI)) {
  if (key.endsWith('Class') && typeof formUI[key] === 'function') {
    formUI[key] = ({ defaults }: { defaults: { all: string } }) => defaults.all
  }
}
export const uiConfig = wrapProps({
  ...uiConfigMerged,
  form: { ...uiConfigMerged.form, props: {
    ...uiConfigMerged.form.props,
    ui: formUI as NonNullable<IFormProps['ui']>,
  } },
})

export type UIConfigValues = typeof uiConfigMerged
export type IUIConfig = typeof uiConfig
export default uiConfig
`
}

// Form callbacks are read without executing application code. Static return
// expressions become type expressions over the preceding layer's defaults.
function formClassTypes(configPath: string, previous: string, dependencies: Set<string>) {
  const sources = new Map<string, ts.SourceFile>()
  function readSource(path: string) {
    let source = sources.get(path)
    if (!source) {
      source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
      sources.set(path, source)
      dependencies.add(path)
    }

    return source
  }

  const source = readSource(`${configPath}.ts`)
  function binding(node: ts.Identifier): ts.Expression | undefined {
    const source = node.getSourceFile()
    for (const statement of source.statements) {
      if (ts.isVariableStatement(statement) && (statement.declarationList.flags & ts.NodeFlags.Const)) {
        const declaration = statement.declarationList.declarations.find(declaration =>
          ts.isIdentifier(declaration.name) && declaration.name.text === node.text)
        if (declaration?.initializer) {
          return declaration.initializer
        }
      }
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
        continue
      }
      const clause = statement.importClause
      const imports = clause?.namedBindings
      const named = imports && ts.isNamedImports(imports)
        ? imports.elements.find(element => element.name.text === node.text)
        : undefined
      const exportedName = named ? (named.propertyName ?? named.name).text : clause?.name?.text === node.text ? 'default' : undefined
      if (!exportedName) {
        continue
      }
      const resolved = ts.resolveModuleName(statement.moduleSpecifier.text, source.fileName, {}, ts.sys).resolvedModule
      if (!resolved || resolved.isExternalLibraryImport) {
        return undefined
      }
      const imported = readSource(resolved.resolvedFileName)
      if (exportedName === 'default') {
        return imported.statements.find(ts.isExportAssignment)?.expression
      }
      for (const declaration of imported.statements) {
        if (ts.isVariableStatement(declaration) && declaration.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
          const value = declaration.declarationList.declarations.find(value =>
            ts.isIdentifier(value.name) && value.name.text === exportedName)
          if (value?.initializer) {
            return value.initializer
          }
        }
      }
    }

    return undefined
  }

  function unwrap(node: ts.Expression, resolveBindings = true): ts.Expression {
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) {
      return unwrap(node.expression, resolveBindings)
    }
    if (resolveBindings && ts.isIdentifier(node)) {
      const value = binding(node)
      if (value) {
        return unwrap(value)
      }
    }
    if (ts.isCallExpression(node) && node.expression.getText() === 'extendUIConfig' && node.arguments[0]) {
      return unwrap(node.arguments[0])
    }

    return node
  }

  const unknown = Symbol('dynamic config')
  function property(node: ts.Expression | undefined | typeof unknown, key: string): ts.Expression | undefined | typeof unknown {
    if (!node || node === unknown) {
      return node
    }
    const value = unwrap(node)
    if (!ts.isObjectLiteralExpression(value)) {
      return unknown
    }
    for (const field of [...value.properties].reverse()) {
      if (ts.isPropertyAssignment(field) && field.name.getText().replaceAll(/['"]/g, '') === key) {
        return field.initializer
      }
      if (ts.isSpreadAssignment(field)) {
        const inherited = property(field.expression, key)
        if (inherited !== undefined) {
          return inherited
        }
      }
    }

    return undefined
  }

  const exported = source.statements.find(ts.isExportAssignment)
  const ui = exported && property(property(property(exported.expression, 'form'), 'props'), 'ui')
  const result: Record<string, string> = {}
  const surfaces = ['containerClass', 'contentClass', 'controlsClass', 'submitWrapperClass', 'submitClass', 'cancelClass']
  if (ui === unknown) {
    return Object.fromEntries(surfaces.map(surface => [surface, 'string']))
  }
  const values = ui && unwrap(ui)
  if (!values) {
    return result
  }
  if (!ts.isObjectLiteralExpression(values)) {
    return Object.fromEntries(surfaces.map(surface => [surface, 'string']))
  }

  for (const field of values.properties) {
    if (ts.isSpreadAssignment(field)) {
      Object.assign(result, Object.fromEntries(surfaces.map(surface => [surface, 'string'])))
    }
    if (!ts.isPropertyAssignment(field) && !ts.isMethodDeclaration(field) && !ts.isShorthandPropertyAssignment(field)) {
      continue
    }
    if (ts.isComputedPropertyName(field.name)) {
      Object.assign(result, Object.fromEntries(surfaces.map(surface => [surface, 'string'])))
      continue
    }
    const surface = field.name.getText().replaceAll(/['"]/g, '')
    if (!surface.endsWith('Class')) {
      continue
    }
    const callback = ts.isMethodDeclaration(field) ? field : unwrap(ts.isShorthandPropertyAssignment(field) ? field.name : field.initializer)
    if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback) && !ts.isMethodDeclaration(callback)) {
      result[surface] = 'string'
      continue
    }
    const parameter = callback.parameters[0]?.name
    const defaults = parameter && ts.isObjectBindingPattern(parameter)
      ? parameter.elements.find(element => (element.propertyName ?? element.name).getText() === 'defaults')?.name.getText()
      : parameter && ts.isIdentifier(parameter) ? `${parameter.text}.defaults` : undefined
    const picker = parameter && ts.isObjectBindingPattern(parameter)
      ? parameter.elements.find(element => (element.propertyName ?? element.name).getText() === 'p')?.name.getText()
      : parameter && ts.isIdentifier(parameter) ? `${parameter.text}.p` : undefined
    const slots = `${previous}['form'][${JSON.stringify(surface)}]`
    const escape = (value: string) => value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${')

    const localNames = new Set<string>()
    function collectNames(node: ts.Node) {
      if (ts.isIdentifier(node)) {
        localNames.add(node.text)
      }
      ts.forEachChild(node, collectNames)
    }
    for (const parameter of callback.parameters) {
      collectNames(parameter.name)
    }

    function expressionType(node: ts.Expression): string {
      const value = unwrap(node, false)
      if (ts.isIdentifier(value) && !localNames.has(value.text)) {
        const resolved = binding(value)
        if (resolved) {
          return expressionType(resolved)
        }
      }
      if (ts.isStringLiteralLike(value)) {
        return JSON.stringify(value.text)
      }
      if (defaults && ts.isPropertyAccessExpression(value) && value.expression.getText() === defaults) {
        return `${slots}[${JSON.stringify(value.name.text)}]`
      }
      if (picker && ts.isCallExpression(value) && value.expression.getText() === picker
        && value.arguments.every(ts.isStringLiteralLike)) {
        return `PickedClasses<${slots}, [${value.arguments.map(argument => JSON.stringify((argument as ts.StringLiteral).text)).join(', ')}]>`
      }
      if (ts.isTemplateExpression(value)) {
        return `\`${escape(value.head.text)}${value.templateSpans.map(span => `\${${expressionType(span.expression)}}${escape(span.literal.text)}`).join('')}\``
      }
      if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return `\`\${${expressionType(value.left)}}\${${expressionType(value.right)}}\``
      }
      if (ts.isConditionalExpression(value)) {
        return `(${expressionType(value.whenTrue)} | ${expressionType(value.whenFalse)})`
      }

      return 'string'
    }

    const body = callback.body
    const returned = body && ts.isBlock(body)
      ? body.statements.length === 1 && body.statements[0] && ts.isReturnStatement(body.statements[0]) ? body.statements[0].expression : undefined
      : body
    result[surface] = returned ? expressionType(returned) : 'string'
  }

  return result
}

export default defineNuxtModule({
  setup: async (_, nuxt) => {
    console.log('✔ Process UI...')

    const configPaths = nuxt.options._layers
      .map(layer => {
        const isBase = layer.cwd === currentDir
        const configPath = isBase ? 'config' : 'ui-config'

        return { path: resolve(layer.cwd, 'app', configPath) }
      })
      .filter(({ path }) => existsSync(`${path}.ts`))

    const configCode = generateUIConfigCode(configPaths)

    addTemplate({
      filename: 'uiConfig.ts',
      write: true,
      getContents: () => configCode,
    })

    // Build Form types from the existing configuration callbacks, independently of their inferred types.
    const orderedConfigs = [...configPaths].reverse()
    const classTypesPath = resolve(currentDir, 'app/types/ui-config.type')
    const pickerTypesPath = resolve(currentDir, 'app/functions/with-class-picker')
    const configDependencies = new Set<string>()
    const formTypes = orderedConfigs.map(({ path }, index) => formClassTypes(path, `Stage${index}`, configDependencies))
    // Imported config edits must refresh generated types and cached callbacks too.
    nuxt.options.watch.push(...configDependencies)

    addTypeTemplate({
      filename: 'types/ui-class-config.d.ts',
      getContents: () => `import type { BaseUIClasses } from '${classTypesPath}'
import type { PickedClasses } from '${pickerTypesPath}'

type Stage0 = BaseUIClasses
${orderedConfigs.map((_, idx) => {
  const fields = Object.entries(formTypes[idx]!)

  return `${fields.length
    ? `type FormAll${idx} = { ${fields.map(([key, value]) => `${JSON.stringify(key)}: ${value}`).join('; ')} }
type Stage${idx + 1} = Omit<Stage${idx}, 'form'> & {
  form: { [Surface in keyof Stage${idx}['form']]: Surface extends keyof FormAll${idx}
    ? Omit<Stage${idx}['form'][Surface], 'all'> & { all: FormAll${idx}[Surface] }
    : Stage${idx}['form'][Surface] }
}`
    : `type Stage${idx + 1} = Stage${idx}`}`
}).join('\n')}

declare module '${classTypesPath}' {
  interface UIClassRegistry {
    defaults: Stage${orderedConfigs.length}
    configDefaults: ${orderedConfigs.map((_, idx) => `Stage${idx}`).join(' | ')}
  }
}
export {}
`,
    })

    setAliasPaths(nuxt, '$uiConfig', './uiConfig.ts')

    nuxt.hook('vite:extendConfig', config => {
      if (config.resolve) {
        config.resolve.alias = {
          ...config.resolve.alias,
          $uiConfig: UI_CONFIG,
        }
      }
    })
  },
})
