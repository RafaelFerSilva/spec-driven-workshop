import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@domain': import.meta.dirname + '/src/domain',
      '@adapters': import.meta.dirname + '/src/adapters',
      '@shared': import.meta.dirname + '/src/shared',
      '@src': import.meta.dirname + '/src',
      '@tests': import.meta.dirname + '/tests',
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
