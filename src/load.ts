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
export type LoadConfigOptions = {
  /**
   * The directory to resolve the config file from.
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * if the config file not found, throw error
   * if false, return empty config
   * @default true
   */
  throwOnNotFound?: boolean
} & (
  | {
    /**
     * The name of the config file to load.
     *
     * load {name}.config.ts
     */
    name: string
    /**
     * full/relative config file path
     * override cwd/name.config.ts
     */
    configFile?: string
  }
  | {
    /**
     * The name of the config file to load.
     *
     * load {name}.config.ts
     */
    name?: string
    /**
     * full/relative config file path
     * override cwd/name.config.ts
     */
    configFile: string
  }
)

/**
 * load `{name}.config.ts` file
 * @param options
 */
export async function loadConfig<T extends UserInputConfig = UserInputConfig>(options: LoadConfigOptions): Promise<ResolvedConfig<T>> {
  const { cwd = process.cwd(), configFile = '', throwOnNotFound = true } = options
  const filePath = resolve(cwd, configFile || `${options.name}.config.ts`)

  let data = {} as T

  /**
   * is filePath exists
   */
  const isExists = await fs.access(filePath, constants.F_OK).then(() => true).catch(() => false)
  if (!isExists) {
    if (throwOnNotFound) {
      throw new Error(`Config file not found: ${filePath}`)
    }
    else {
      return {
        config: {} as T,
        configFile: '',
      }
    }
  }

  try {
    data = (await jiti.import(filePath, { default: true })) as T
  }
  catch (e) {
    console.error(e)
    console.error(`Failed to load config file: ${filePath}`)
  }

  return {
    config: data,
    configFile: filePath,
  }
}
