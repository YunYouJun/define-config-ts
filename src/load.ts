import type { UserInputConfig } from './types'
import fs, { constants } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  // for hmr
  moduleCache: false,
})

export interface ResolvedConfig<
  T extends UserInputConfig = UserInputConfig,
> {
  config: T
  configFile: string
}

export type ConfigFunction<T, Options> = (options: Options) => (T | Promise<T>)

/**
 * load *.config.ts
 */
export interface LoadConfigOptions {
  /**
   * The directory to resolve the config file from.
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * The name of the config file to load.
   *
   * load {name}.config.ts
   */
  name: string
  /**
   * full config file path
   * override cwd/name.config.ts
   */
  configFile?: string

  /**
   * if the config file not found, throw error
   * if false, return empty config
   * @default true
   */
  throwOnNotFound?: boolean
}

/**
 * load `{name}.config.ts` file
 * @param options
 */
export async function loadConfig<T extends UserInputConfig = UserInputConfig>(options: LoadConfigOptions): Promise<ResolvedConfig<T>> {
  const { name, cwd = process.cwd(), configFile = '' } = options
  const filePath = configFile || resolve(cwd, `${name}.config.ts`)

  let data = {} as T

  try {
    await fs.access(filePath, constants.F_OK)

    try {
      data = (await jiti.import(filePath, { default: true })) as T
    }
    catch (e) {
      console.error(e)
      console.error(`Failed to load config file: ${filePath}`)
    }
  }
  catch {
    if (options.throwOnNotFound) {
      throw new Error(`Config file not found: ${filePath}`)
    }
    else {
      return {
        config: {} as T,
        configFile: filePath,
      }
    }
  }

  return {
    config: data,
    configFile: filePath,
  }
}
