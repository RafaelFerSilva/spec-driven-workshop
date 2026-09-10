import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config.js'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.spec.ts'],
      exclude: ['src/**/*.e2e-spec.ts', 'src/**/*.integration.spec.ts'],
    },
  })
)
