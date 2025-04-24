import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src'

describe('load config', () => {
  it('load lib config', async () => {
    const libConfig = await loadConfig({
      cwd: path.resolve(import.meta.dirname, './fixtures'),
      name: 'lib',
    })

    expect(libConfig).toMatchObject({
      config: {
        features: {},
      },
      configFile: path.resolve(import.meta.dirname, './fixtures/lib.config.ts'),
    })
  })
})
