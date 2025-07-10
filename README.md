# define-config-ts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Only load `*.config.ts`.

There is no dependency other than [jiti](https://github.com/unjs/jiti).

## Usage

```bash
pnpm add define-config-ts
```

```ts [your-lib.config.ts]
// Your custom lib config.ts
import { defineConfig } from 'your-lib'

export default defineConfig({
  // your config
})
```

Load config in your lib:

```ts
import { loadConfig } from 'define-config-ts'

const { config, configFile } = await loadConfig({
  cwd: process.cwd(),
  // load `wow.config.ts`
  name: 'your-lib',
})
```

### Define `defineLibConfig`

```ts [your-lib]
import { defineDefineConfig } from 'define-config-ts'

export interface LibConfig {
  /**
   * enable feature
   */
  features: {
    [key: string]: any
  }
}

export const defineLibConfig = defineDefineConfig<LibConfig>()
```

## Difference with `c12` / `unconfig`

- [c12](https://github.com/unjs/c12)
- [unconfig](https://github.com/antfu-collective/unconfig)

They are all powerful configuration loading tools and support multiple formats, like `['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', '']`. Or merge config.

Under certain circumstances(in [valaxy](https://github.com/YunYouJun/valaxy)), I created a benchmark.

`unconfig` load config need 2-3s, `c12` only need 0.2s, and custom `loadConfig` by `jiti` directly is 0.0006s 0.6ms.

I only want to load `*.config.ts` and do not wish to support other formats and complex merging features.

So I created this package `define-config-ts`.

When you want more compatibility and functionality, then you can use `c12` or `unconfig`.

If you want a minimalist library for loading `*.config.ts`, consider `define-config-ts`.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg'/>
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
