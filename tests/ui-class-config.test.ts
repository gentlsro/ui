import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { defineUIClasses } from '../app/utils/define-ui-classes'

// Failure modes: layer inference cycles, lost literals/keys, stale composer
// assumptions, reserved derived slots, and merged types silently becoming any.
describe('layered UI class config', () => {
  it('retains config patches and stores composers without evaluating them', () => {
    const patch = { base: 'fixture-base' }
    const composer = () => 'fixture-all'
    const config = defineUIClasses('app')({
      button: { containerClass: patch },
    }).compose({ button: { containerClass: composer } })

    expect(config.classDefaults.button.containerClass).toBe(patch)
    expect(config.classComposition.button.containerClass).toBe(composer)
  })

  it('types each predecessor, composer and final component consistently', () => {
    const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
    const fixtureDir = mkdtempSync(resolve(tmpdir(), 'gentl-ui-class-types-'))
    const fixtures = readdirSync(resolve(packageDir, 'tests/types'))
      .filter(file => file.startsWith('ui-class-') && file.endsWith('.fixture'))
    const sourcePaths = fixtures.map(file => {
      const source = readFileSync(resolve(packageDir, 'tests/types', file), 'utf8')
        .replaceAll('__DEFINE_UI_CLASSES__', resolve(packageDir, 'app/utils/define-ui-classes'))
        .replaceAll('__EXTEND_UI_CONFIG__', resolve(packageDir, 'app/utils/extend-ui-config'))
        .replaceAll('__UI_CLASS_TYPES__', resolve(packageDir, 'app/types/ui-class-config.type'))
        .replaceAll('__BUTTON_PROPS__', resolve(packageDir, 'app/components/Button/types/btn-props.type'))
        .replaceAll('__UI_CONFIG__', resolve(packageDir, 'app/types/ui-config.type'))
        .replaceAll('__LIST_PROPS__', resolve(packageDir, 'app/components/List/types/list-props.type'))
        .replaceAll('__MINI_CARD_PROPS__', resolve(packageDir, 'app/components/Card/types/mini-card-props.type'))
      const sourcePath = resolve(fixtureDir, file.replace('.fixture', '.ts'))
      writeFileSync(sourcePath, source)

      return sourcePath
    })

    const baseConfig = ts.readConfigFile(resolve(packageDir, '.nuxt/tsconfig.app.json'), ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent({
      ...baseConfig.config,
      include: [],
      files: [...sourcePaths, resolve(packageDir, '.nuxt/types/imports.d.ts')],
      compilerOptions: { ...baseConfig.config.compilerOptions, noEmit: true },
    }, ts.sys, resolve(packageDir, '.nuxt'))
    const program = ts.createProgram(parsed.fileNames, parsed.options)
    const targets = [...sourcePaths, resolve(packageDir, 'app/types/ui-class-config.type.ts'), resolve(packageDir, 'app/utils/define-ui-classes.ts'), resolve(packageDir, 'app/components/Button/types/btn-props.type.ts'), resolve(packageDir, 'app/types/ui-config.type.ts')]
    const diagnostics = ts.getPreEmitDiagnostics(program)
      .filter(diagnostic => {
        const file = diagnostic.file?.fileName

        return !file || targets.includes(file) || (file.startsWith(resolve(packageDir, 'app/components')) && file.includes('/types/') && file.endsWith('props.type.ts'))
      })
    const errors = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: file => file,
      getCurrentDirectory: () => packageDir,
      getNewLine: () => '\n',
    })
    rmSync(fixtureDir, { recursive: true, force: true })
    expect(errors).toBe('')
  }, 60_000)
})
