/**
 * dev 沙箱配置：根路径 + React 插件 + 家族本地联动
 *
 * 沙箱只作本地冒烟预览（单页 index.html），不消费文档站。docs 站的 demo
 * 在 docs/demos/ 下，由 ReactDemo.vue 挂载，不走本配置。
 */
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { createLocalShareAliases } from '../scripts/local-share-alias.mjs'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: [
      // 沙箱直接吃库源码（与 vitest / docs 站一致），改 src 即时热更新
      { find: '@lh-ui/react', replacement: resolve(__dirname, '..', 'src', 'index.ts') },
      // 本地联动：家族布局下解析到同级 share 仓源码，无则回退 npm 包
      ...createLocalShareAliases(resolve(__dirname, '..')),
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 组件 scss 源在 @lh-ui/share 内，bare specifier 的 @use 走 node_modules 解析
        loadPaths: [resolve(__dirname, '..', 'node_modules')],
      },
    },
  },
  base: '/',
  server: { port: 5180 },
})
