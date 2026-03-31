import type { UserInputConfig } from './types'
import fs, { constants } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const hasNativeTS = !!(process as any).features?.typescript

let jitiCache: ReturnType<Awaited<typeof import('jiti')>['createJiti']> | undefined

async function tryResolveJiti(): Promise<typeof import('jiti') | undefined> {
  try {
    return await import('jiti')
  }
  catch {
    return undefined
  }
}

async function importWithJiti(filePath: string, moduleCache: boolean): Promise<any> {
  const mod = await tryResolveJiti()
  if (!mod)
    return undefined

  const jiti = moduleCache
    ? (jitiCache ??= mod.createJiti(import.meta.url, { moduleCache: true }))
    : mod.createJiti(import.meta.url, { moduleCache: false })

  return { default: await jiti.import(filePath, { default: true }) }
}

async function importWithNativeTS(filePath: string): Promise<any> {
  return import(pathToFileURL(filePath).href)
}

async function importTS(filePath: string, moduleCache: boolean): Promise<any> {
  if (!hasNativeTS) {
    const result = await importWithJiti(filePath, moduleCache)
    if (result)
      return result

    throw new Error(
      `Failed to import TypeScript file. Native TS is not supported in this Node.js version (${process.version}). `
      + `Install "jiti" as a fallback: npm install jiti`,
    )
  }

  if (!moduleCache) {
    const result = await importWithJiti(filePath, false)
    if (result)
      return result
  }

  return importWithNativeTS(filePath)
}

export interface ResolvedConfig<
  T extends UserInputConfig = UserInputConfig,
> {
  config: T
  configFile: string
}

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

  /**
   * whether to reuse the loaded module cache
   *
   * disable by default so repeated loads can pick up config changes in HMR/dev flows
   * when `jiti` is unavailable on native-TS runtimes, Node's module cache will apply
   * @default false
   */
  moduleCache?: boolean
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
  const { cwd = process.cwd(), configFile = '', throwOnNotFound = true, moduleCache = false } = options
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
    const mod = await importTS(filePath, moduleCache)
    data = (mod.default ?? mod) as T
  }
  catch (e) {
    throw new Error(`Failed to load config file: ${filePath}`, { cause: e })
  }

  return {
    config: data,
    configFile: filePath,
  }
}
