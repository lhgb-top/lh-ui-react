import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createLocalShareAliases } from './scripts/local-share-alias.mjs'

/**
 * 按 mode 分三步构建（等价 vue2 仓的方案，Windows 友好）：
 *   esm → es/   preserveModules，产物镜像 src（与 tsc 镜像 d.ts 同构，tree-shaking 友好）
 *   cjs → lib/  preserveModules，build:styles 阶段补 lib/package.json 的 commonjs 标记
 *   umd → dist/lh-ui-react.umd.js 单文件；@lh-ui/share 内联进 bundle（share 无 UMD 产物，
 *         内联保证 script 标签用法自足），react / react-dom 外置
 *
 * UMD 文件名说明：根 package.json 声明了 "type": "module"，vite 会为 umd 自动加 .cjs 后缀，
 * 与 package.json 的 unpkg / jsdelivr / exports["./dist"] 声明（.umd.js）不一致，
 * 故此处用函数显式给出完整文件名覆盖后缀推断。
 *
 * JSX 运行时：esm / cjs 用 automatic runtime（`react/jsx-runtime` external，产物更小）；
 * UMD 切 classic runtime（`React.createElement`），避免 `react/jsx-runtime` 的全局名映射问题。
 *
 * theme / constants / hooks 是纯转发模块（re-export @lh-ui/share 的 theme / constants
 * 与本库 hooks），src/index.ts 不引用它们，单入口构建不会产出；作为 lib 多入口，
 * 使 es/theme.js、es/constants.js、es/hooks/index.js 与 tsc 产出的 d.ts 对齐，
 * package.json exports 的 ./theme、./constants、./hooks 子路径才可用。
 */
export default defineConfig(({ mode }) => {
  if (mode === 'umd') {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      resolve: {
        // UMD 内联 @lh-ui/share，必须与 esm/cjs 一样走本地源码：react 用的是 share
        // 待发布版本的 LH 前缀新导出名，已发布的 npm 0.3.0 仍是旧名，裸走 npm 包会报缺导出
        alias: createLocalShareAliases(__dirname),
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
          entry: 'src/index.ts',
          name: 'LhUIReact',
          fileName: () => 'lh-ui-react.umd.js',
          formats: ['umd'],
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
      },
    }
  }

  const isCjs = mode === 'cjs'
  return {
    plugins: [react()],
    build: {
      outDir: isCjs ? 'lib' : 'es',
      emptyOutDir: true,
      minify: false,
      sourcemap: true,
      lib: {
        entry: {
          index: 'src/index.ts',
          theme: 'src/theme.ts',
          constants: 'src/constants.ts',
          'hooks/index': 'src/hooks/index.ts',
          'locale/index': 'src/locale/index.tsx',
        },
        formats: [isCjs ? 'cjs' : 'es'],
      },
      rollupOptions: {
        // 正则匹配：@lh-ui/share 的子路径导入（如 '@lh-ui/share/core/button'）同样外置
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          /^@lh-ui\/share/,
        ],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          exports: 'named',
        },
      },
    },
  }
})
