import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src'

const fixturesDir = path.resolve(import.meta.dirname, './fixtures')

async function writeTempConfig(filePath: string, value: number) {
  await fs.writeFile(filePath, `export default { value: ${value} }\n`)
  const updatedAt = new Date(Date.now() + 1000)
  await fs.utimes(filePath, updatedAt, updatedAt)
}

async function createTempConfig(name: string, initialValue: number) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'define-config-ts-'))
  const configFile = path.resolve(cwd, `${name}.config.ts`)
  await writeTempConfig(configFile, initialValue)
  return {
    cwd,
    configFile,
  }
}

describe('load config', () => {
  it('load lib config', async () => {
    const libConfig = await loadConfig({
      cwd: fixturesDir,
      name: 'lib',
    })

    expect(libConfig).toMatchObject({
      config: {
        features: {},
      },
      configFile: path.resolve(fixturesDir, 'lib.config.ts'),
    })
  })

  it('throw when config file not found', async () => {
    await expect(loadConfig({
      cwd: fixturesDir,
      name: 'nonexistent',
    })).rejects.toThrow('Config file not found')
  })

  it('return empty config when throwOnNotFound is false', async () => {
    const result = await loadConfig({
      cwd: fixturesDir,
      name: 'nonexistent',
      throwOnNotFound: false,
    })

    expect(result).toEqual({
      config: {},
      configFile: '',
    })
  })

  it('load by configFile path', async () => {
    const result = await loadConfig({
      configFile: path.resolve(fixturesDir, 'lib.config.ts'),
    })

    expect(result.config).toMatchObject({ features: {} })
    expect(result.configFile).toBe(path.resolve(fixturesDir, 'lib.config.ts'))
  })

  it('throw on broken config file', async () => {
    await expect(loadConfig({
      cwd: fixturesDir,
      name: 'broken',
    })).rejects.toThrow('Failed to load config file')
  })

  it('reload updated config by default', async () => {
    const { cwd, configFile } = await createTempConfig('reload', 1)

    try {
      const firstLoad = await loadConfig<{ value: number }>({
        cwd,
        name: 'reload',
      })

      expect(firstLoad.config.value).toBe(1)

      await writeTempConfig(configFile, 2)

      const secondLoad = await loadConfig<{ value: number }>({
        cwd,
        name: 'reload',
      })

      expect(secondLoad.config.value).toBe(2)
    }
    finally {
      await fs.rm(cwd, { recursive: true, force: true })
    }
  })

  it('reuse cached module when moduleCache is true', async () => {
    const { cwd, configFile } = await createTempConfig('cached', 1)

    try {
      const firstLoad = await loadConfig<{ value: number }>({
        cwd,
        name: 'cached',
        moduleCache: true,
      })

      expect(firstLoad.config.value).toBe(1)

      await writeTempConfig(configFile, 2)

      const secondLoad = await loadConfig<{ value: number }>({
        cwd,
        name: 'cached',
        moduleCache: true,
      })

      expect(secondLoad.config.value).toBe(1)
    }
    finally {
      await fs.rm(cwd, { recursive: true, force: true })
    }
  })
})
