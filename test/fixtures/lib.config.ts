import { defineDefineConfig } from '../../src'

export interface LibConfig {
  /**
   * enable feature
   */
  features: {
    [key: string]: any
  }
}

const defineLibConfig = defineDefineConfig<LibConfig>()

export default defineLibConfig({
  features: {},
})
