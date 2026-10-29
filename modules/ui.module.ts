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

function generateUIConfigCode(configPaths: { path: string }[], parents: Record<string, Record<string, string[]>>) {
  return `import type { UIProps, UIResolvedClasses } from '${resolve(currentDir, 'app/types/ui-config.type')}'
import { customDefu } from '#layers/utilities/app/utils/custom-defu'
${configPaths.map(({ path }, idx) => `import config${idx}, * as configModule${idx} from '${path}'`).join('\n')}

const uiConfigMerged = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})
export const uiConfigLayers = [${configPaths.map((_, idx) => `configModule${idx}`).reverse().join(', ')}] as const
export const uiClassParents: Record<string, Record<string, string[]>> = ${JSON.stringify(parents)}

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

type ResolvedProps<Props, Name> = Name extends keyof UIResolvedClasses
  ? UIProps<Props, UIResolvedClasses[Name]> : Props

type WrapProps<T> = {
  [K in keyof T]: T[K] extends { props: infer P }
    ? { props: WrapObjects<ResolvedProps<P, K>> } & Omit<T[K], "props">
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

export const uiConfig = wrapProps(uiConfigMerged)

export type UIConfigValues = typeof uiConfigMerged
export type IUIConfig = typeof uiConfig
export default uiConfig
`
}

// Class callbacks are read without executing application code. Static return
// expressions become type expressions over the preceding layer's defaults.
function componentClassTypes(configPath: string, context: {
  previous: string
  dependencies: Set<string>
  classes: Record<string, string[]>
}) {
  const { previous, dependencies, classes } = context
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
  function property(node: ts.Expression | ts.MethodDeclaration | undefined | typeof unknown, key: string): ts.Expression | ts.MethodDeclaration | undefined | typeof unknown {
    if (!node || node === unknown) {
      return node
    }
    if (ts.isMethodDeclaration(node)) {
      return unknown
    }
    const value = unwrap(node)
    if (!ts.isObjectLiteralExpression(value)) {
      return unknown
    }
    for (const field of [...value.properties].reverse()) {
      if (ts.isPropertyAssignment(field) || ts.isShorthandPropertyAssignment(field) || ts.isMethodDeclaration(field)) {
        const name = ts.isComputedPropertyName(field.name)
          ? ts.isStringLiteralLike(field.name.expression) ? field.name.expression.text : undefined
          : field.name.getText().replaceAll(/['"]/g, '')
        if (!name) {
          return unknown
        }
        if (name === key) {
          return ts.isMethodDeclaration(field) ? field : ts.isShorthandPropertyAssignment(field) ? field.name : field.initializer
        }
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
  const result: Record<string, Record<string, string>> = {}
  for (const [component, surfaces] of Object.entries(classes)) {
    const ui = exported && property(property(property(exported.expression, component), 'props'), 'ui')
    const fields: Record<string, string> = {}
    result[component] = fields
    if (ui === unknown) {
      Object.assign(fields, Object.fromEntries(surfaces.map(surface => [surface, 'string'])))
      continue
    }
    for (const surface of surfaces) {
      const value = property(ui, surface)
      if (!value) {
        continue
      }
      if (value === unknown) {
        fields[surface] = 'string'
        continue
      }
      const callback = ts.isMethodDeclaration(value) ? value : unwrap(value)
      if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback) && !ts.isMethodDeclaration(callback)) {
        fields[surface] = 'string'
        continue
      }
      const parameter = callback.parameters[0]?.name
      const defaults = parameter && ts.isObjectBindingPattern(parameter)
        ? parameter.elements.find(element => (element.propertyName ?? element.name).getText() === 'defaults')?.name.getText()
        : parameter && ts.isIdentifier(parameter) ? `${parameter.text}.defaults` : undefined
      const picker = parameter && ts.isObjectBindingPattern(parameter)
        ? parameter.elements.find(element => (element.propertyName ?? element.name).getText() === 'p')?.name.getText()
        : parameter && ts.isIdentifier(parameter) ? `${parameter.text}.p` : undefined
      const slots = `${previous}[${JSON.stringify(component)}][${JSON.stringify(surface)}]`
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
        if (ts.isArrayLiteralExpression(value) && !value.elements.some(ts.isSpreadElement)) {
          return `ClassList<[${value.elements.map(element => expressionType(element as ts.Expression)).join(', ')}]>`
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
      fields[surface] = returned ? expressionType(returned) : 'string'
    }
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

    // Build class types from the existing configuration callbacks, independently of their inferred types.
    const orderedConfigs = [...configPaths].reverse()
    const classTypesPath = resolve(currentDir, 'app/types/ui-config.type')
    const pickerTypesPath = resolve(currentDir, 'app/functions/with-class-picker')
    const configDependencies = new Set<string>()
    const registry = ts.createSourceFile(classTypesPath, readFileSync(`${classTypesPath}.ts`, 'utf8'), ts.ScriptTarget.Latest, true)
    const factories = registry.statements.find(statement => ts.isTypeAliasDeclaration(statement) && statement.name.text === 'UIClassFactories') as ts.TypeAliasDeclaration
    const parents: Record<string, Record<string, string[]>> = {}
    const classes = Object.fromEntries((factories.type as ts.TypeLiteralNode).members.map(member => {
      const component = (member as ts.PropertySignature).name.getText()
      const surfaces = new Set<string>()
      parents[component] = {}
      function collect(node: ts.Node) {
        if (ts.isTypeReferenceNode(node) && node.typeName.getText() === 'Pick') {
          const [source, keys] = node.typeArguments!
          const names: string[] = []
          function collectKeys(node: ts.Node) {
            if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
              names.push(node.literal.text)
              surfaces.add(node.literal.text)
            }
            ts.forEachChild(node, collectKeys)
          }
          collectKeys(keys!)
          if (source && ts.isIndexedAccessTypeNode(source) && ts.isLiteralTypeNode(source.indexType) && ts.isStringLiteral(source.indexType.literal)) {
            for (const surface of names) {
              parents[component]![surface] = [source.indexType.literal.text]
            }
          }

          return
        }
        if (ts.isPropertySignature(node) && node.name.getText().endsWith('Class')) {
          const surface = node.name.getText()
          surfaces.add(surface)
          const sources: string[] = []
          function collectParents(node: ts.Node) {
            if (ts.isIndexedAccessTypeNode(node) && node.objectType.getText() === 'UIClassFactories' && ts.isLiteralTypeNode(node.indexType) && ts.isStringLiteral(node.indexType.literal)) {
              sources.push(node.indexType.literal.text)
            }
            ts.forEachChild(node, collectParents)
          }
          ts.forEachChild(node, collectParents)
          if (sources.length) {
            parents[component]![surface] = sources
          }

          return
        }
        ts.forEachChild(node, collect)
      }
      ts.forEachChild(member, collect)

      return [component, [...surfaces]]
    }))
    const classTypes = orderedConfigs.map(({ path }, index) => componentClassTypes(path, {
      previous: `Stage${index}`,
      dependencies: configDependencies,
      classes,
    }))
    const configCode = generateUIConfigCode(configPaths, parents)

    addTemplate({
      filename: 'uiConfig.ts',
      write: true,
      getContents: () => configCode,
    })

    // Imported config edits must refresh generated types and cached callbacks too.
    nuxt.options.watch.push(...configDependencies)

    addTypeTemplate({
      filename: 'types/ui-class-config.d.ts',
      getContents: () => `import type { BaseUIClasses } from '${classTypesPath}'
import type { PickedClasses } from '${pickerTypesPath}'

type TrimClass<Value extends string> = Value extends \` \${infer Rest}\` | \`\\n\${infer Rest}\` | \`\\t\${infer Rest}\` | \`\\r\${infer Rest}\`
  ? TrimClass<Rest> : Value extends \`\${infer Rest} \` | \`\${infer Rest}\\n\` | \`\${infer Rest}\\t\` | \`\${infer Rest}\\r\`
    ? TrimClass<Rest> : Value
type ClassList<Values extends readonly string[]> = Values extends readonly [infer Head extends string, ...infer Tail extends string[]]
  ? TrimClass<Head> extends infer Part extends string
    ? Part extends '' ? ClassList<Tail> : ClassList<Tail> extends '' ? Part : \`\${Part} \${ClassList<Tail>}\`
    : never
  : ''

type Stage0 = Omit<BaseUIClasses, ${Object.entries(parents).filter(([, surfaces]) => Object.keys(surfaces).length).map(([component]) => JSON.stringify(component)).join(' | ') || 'never'}> & {
${Object.entries(parents).filter(([, surfaces]) => Object.keys(surfaces).length).map(([component, surfaces]) => `  ${JSON.stringify(component)}: Omit<BaseUIClasses[${JSON.stringify(component)}], ${Object.keys(surfaces).map(surface => JSON.stringify(surface)).join(' | ')}> & { ${Object.entries(surfaces).map(([surface, sources]) => `${JSON.stringify(surface)}: ${sources.map(parent => `Stage${orderedConfigs.length}[${JSON.stringify(parent)}][${JSON.stringify(surface)}]`).join(' | ')}`).join('; ')} }`).join('\n')}
}
${orderedConfigs.map((_, idx) => `type ClassAll${idx} = { ${Object.entries(classTypes[idx]!).map(([component, fields]) => `${JSON.stringify(component)}: { ${Object.entries(fields).map(([surface, type]) => `${JSON.stringify(surface)}: ${type}`).join('; ')} }`).join('; ')} }
type Stage${idx + 1} = {
  [Component in keyof Stage${idx}]: {
    [Surface in keyof Stage${idx}[Component]]: Component extends keyof ClassAll${idx}
      ? Surface extends keyof ClassAll${idx}[Component]
        ? Omit<Stage${idx}[Component][Surface], 'all'> & { all: ClassAll${idx}[Component][Surface] }
        : Stage${idx}[Component][Surface]
      : Stage${idx}[Component][Surface]
  }
}`).join('\n')}

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
