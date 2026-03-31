# define-config-ts

[English](./README.md) | [简体中文](./README.zh-CN.md)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

极简 `*.config.ts` 加载器 — 在现代 Node.js 上零额外依赖。

## 快速开始

```bash
pnpm add define-config-ts
```

```ts
import { loadConfig } from 'define-config-ts'

const { config, configFile } = await loadConfig({
  cwd: process.cwd(),
  name: 'your-lib', // 加载 your-lib.config.ts
})
```

## 为什么不用 `c12` / `unconfig`？

[c12](https://github.com/unjs/c12) 和 [unconfig](https://github.com/antfu-collective/unconfig) 功能很强，支持多种格式（`ts`、`mts`、`cts`、`js`、`mjs`、`cjs`、`json` 等）以及复杂的配置合并。

但有时候你只需要加载 `*.config.ts`。在 [valaxy](https://github.com/YunYouJun/valaxy) 中做过的简单 benchmark：

| 工具 | 加载时间 |
| --- | --- |
| `unconfig` | ~2-3 s |
| `c12` | ~0.2 s |
| `define-config-ts` | **~0.6 ms** |

如果你需要更广泛的格式支持或配置合并，请使用 `c12` 或 `unconfig`。
如果你只想要一个极简、快速的 `*.config.ts` 加载器 — 就是它了。

## 特性

- Fresh reload 友好：当 `moduleCache` 为 `false`（默认值）且存在 [jiti](https://github.com/unjs/jiti) 时，重复加载可以在 dev/HMR 流程中拿到变更后的配置。
- 原生兼容：在现代 Node.js 的原生 TypeScript 加载可用时，无需额外依赖即可工作；若未安装 `jiti`，会回退到原生 `import()`。注意：没有 `jiti` 时 Node 内置模块缓存生效，`moduleCache: false` 无法强制重新加载。
- 类型安全：通过 `defineDefineConfig<T>()` 创建带类型提示的 `defineConfig` 辅助函数。

## 兼容性

| Node.js | 加载策略 | 额外依赖 |
| --- | --- | --- |
| `>= 22.6`（原生 TS 支持） | 优先使用 `jiti` 以支持 fresh reload；未安装时回退到原生 `import()` | 无（推荐：`pnpm add jiti`） |
| `18.x` / `20.x` | `jiti` | `pnpm add jiti` |

> **提示**：在现代 Node.js 上安装 `jiti` 可启用 `moduleCache: false`（默认值），使重复加载始终拿到最新配置——这在 HMR / dev-server 场景中至关重要。

旧版 Node.js 请同时安装 `jiti`：

```bash
pnpm add define-config-ts jiti
```

## 使用

### 加载配置

```ts
import { loadConfig } from 'define-config-ts'

const { config, configFile } = await loadConfig({
  cwd: process.cwd(),
  name: 'your-lib', // 加载 your-lib.config.ts
})
```

### 用户侧配置文件

```ts [your-lib.config.ts]
import { defineConfig } from 'your-lib'

export default defineConfig({
  // your config
})
```

### 创建带类型的 `defineConfig`

```ts [your-lib/config.ts]
import { defineDefineConfig } from 'define-config-ts'

export interface LibConfig {
  features: { [key: string]: any }
}

export const defineConfig = defineDefineConfig<LibConfig>()
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg' alt='Sponsors'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © [YunYouJun](https://github.com/YunYouJun)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/define-config-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/define-config-ts
[npm-downloads-src]: https://img.shields.io/npm/dm/define-config-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/define-config-ts
[bundle-src]: https://img.shields.io/bundlephobia/minzip/define-config-ts?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=define-config-ts
[license-src]: https://img.shields.io/github/license/YunYouJun/define-config-ts.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/YunYouJun/define-config-ts/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/define-config-ts
