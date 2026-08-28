import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function readSource(path: string) {
  return readFileSync(resolve(import.meta.dirname, path), 'utf8')
}

describe('xlsx runtime boundary', () => {
  it('keeps spreadsheet code behind the export action', () => {
    const loader = readSource('./load-xlsx.ts')
    const initialExportModules = [
      readSource('./table-export-csv.ts'),
      readSource('./table-export-xlsx.ts'),
      readSource('../../Pivot/functions/pivot-export-data.ts'),
    ]

    expect(loader).toContain("import('xlsx')")

    for (const source of initialExportModules) {
      expect(source).not.toMatch(/^import \* as .+ from ['"]xlsx['"]/m)
      expect(source).not.toMatch(/^import \{.+\} from ['"]xlsx['"]/m)
    }
  })
})
