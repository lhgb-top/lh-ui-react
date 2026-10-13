import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { createLocalShareAliases } from './scripts/local-share-alias.mjs'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 与 tsconfig.json compilerOptions.paths 保持一致
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@lh-ui/react', replacement: resolve(__dirname, 'src/index.ts') },
      // 本地联动：家族布局下解析到同级 share 仓源码，无则回退 npm 包
      ...createLocalShareAliases(__dirname),
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'clover'],
      // core 单测唯一一份在 @lh-ui/share，本仓库只覆盖 React 专属层
      include: [
        'src/components/**',
        'src/hooks/**',
        'src/imperative/**',
        'src/context/**',
        'src/locale/**',
      ],
    },
  },
})
