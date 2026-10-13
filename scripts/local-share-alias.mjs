/**
 * 本地联动 alias（家族布局专用）
 *
 * 家族布局下（lh-ui-react 与 lh-ui-share 同父目录），把 @lh-ui/share 的所有子路径
 * 直接解析到同级 share 仓的**源码**（src/ 与 styles/）：dev / test 不依赖 npm 产物，
 * 改 share 即时热更新，无需构建或发版。share 的 npm 产物只服务终端用户独立引入。
 *
 * 守卫：兄弟仓不存在（CI 单仓 clone、独立下载）时返回空数组，alias 不生效，
 * 自动回退到已安装的 npm 包，保证两种布局都能跑。
 *
 * 顺序：bare `@lh-ui/share` 必须排在子路径正则**之后**——vite 的字符串 alias 是前缀匹配，
 * 裸条目会吞掉所有 @lh-ui/share/* 子路径。
 *
 * 与 lh-ui-plus / lh-ui-vue2 的 scripts/local-share-alias.mjs 同源，改动需三端同步。
 *
 * @param {string} repoRoot 本仓库根目录（dev/vite.config.ts 在 dev/ 下，需先回退一级）
 * @returns {Array<{ find: RegExp, replacement: string }>}
 */
import { resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'

export function createLocalShareAliases(repoRoot) {
  const shareRoot = resolve(repoRoot, '..', 'lh-ui-share')
  if (!existsSync(resolve(shareRoot, 'src'))) return []

  return [
    // 样式源码。share 的源码布局是 styles/<name>/index.scss（目录），package.json exports
    // 用 "./styles/*": "./styles/*/index.scss" 补了这层；alias 必须逐条对齐 exports 语义，
    // 否则无后缀的 @lh-ui/share/styles/<name> 解析到目录上、vite 报 Failed to resolve。
    //   ① 带扩展名：index.scss / theme/index.scss / theme/common/*.scss …（exports 里的具名条目）
    {
      find: /^@lh-ui\/share\/styles\/(.+\.(?:scss|css))$/,
      replacement: resolve(shareRoot, 'styles/$1'),
    },
    //   ② theme/common 下无后缀 → 补 .scss（exports "./styles/theme/common/*"）
    {
      find: /^@lh-ui\/share\/styles\/theme\/common\/([^/]+)$/,
      replacement: resolve(shareRoot, 'styles/theme/common/$1.scss'),
    },
    //   ③ 组件名无后缀 → <name>/index.scss（exports "./styles/*" → "./styles/*/index.scss"）
    {
      find: /^@lh-ui\/share\/styles\/([^/]+)$/,
      replacement: resolve(shareRoot, 'styles/$1/index.scss'),
    },
    // 无头逻辑：@lh-ui/share/core/** → share/src/core/**
    { find: /^@lh-ui\/share\/core\/(.*)$/, replacement: resolve(shareRoot, 'src/core/$1') },
    // 其余顶层模块：@lh-ui/share/{utils,constants,theme,locales,types}/** → share/src/**
    {
      find: /^@lh-ui\/share\/(utils|constants|theme|locales|types)(\/.*)?$/,
      replacement: resolve(shareRoot, 'src/$1$2'),
    },
    // 裸导入：@lh-ui/share → share/src/index.ts（必须排在最后）
    { find: /^@lh-ui\/share$/, replacement: resolve(shareRoot, 'src/index.ts') },
  ]
}

/**
 * 本地联动的 **webpack** 别名（docs 站 Docusaurus 专用）
 *
 * 与 {@link createLocalShareAliases} 同一份守卫与语义，但输出 webpack 5 的
 * `resolve.alias` 对象（key 为精确模块说明符，value 为绝对路径）。
 *
 * 差异说明：vite 用正则数组按序匹配，webpack 用对象键做**最长前缀匹配**
 * （精确键例外）。因此不能用一条 `@lh-ui/share/styles` 前缀键同时覆盖
 * 「目录 → index.scss」与「theme/common 无后缀 → .scss」两种解析——
 * webpack 对无扩展名请求按 `resolve.extensions` 补后缀，但 share 的
 * `./styles/<name>` 语义是目录的 `index.scss`，靠 extensions 命中 `.scss`
 * 时取不到 index 文件，故逐条显式映射到文件级别。
 *
 * @param {string} repoRoot 本仓库根目录
 * @returns {Record<string, string>} webpack resolve.alias 对象；兄弟仓不存在时返回空对象
 */
export function createLocalShareWebpackAliases(repoRoot) {
  const shareRoot = resolve(repoRoot, '..', 'lh-ui-share')
  if (!existsSync(resolve(shareRoot, 'src'))) return {}

  // ① 样式：扫描 share/styles 下全部组件目录，逐条映射到 <name>/index.scss
  // （对齐 exports "./styles/*" → "./styles/*/index.scss" 的语义；
  //   webpack 对无后缀请求按 extensions 补后缀时取不到目录内的 index 文件，
  //   故显式映射到文件级别。新增组件自动覆盖，无需手改本表）
  const styleNames = readdirSync(resolve(shareRoot, 'styles')).filter(
    (name) =>
      !name.endsWith('.scss') &&
      !name.startsWith('.') &&
      existsSync(resolve(shareRoot, 'styles', name, 'index.scss')),
  )
  const styleAliases = Object.fromEntries(
    styleNames.map((name) => [`@lh-ui/share/styles/${name}`, resolve(shareRoot, 'styles', name, 'index.scss')]),
  )

  return {
    ...styleAliases,
    // ② theme/common：无后缀与带 .scss 后缀两种写法都映射
    '@lh-ui/share/styles/theme/common/var': resolve(shareRoot, 'styles/theme/common/var.scss'),
    '@lh-ui/share/styles/theme/common/var-dark': resolve(
      shareRoot,
      'styles/theme/common/var-dark.scss',
    ),
    '@lh-ui/share/styles/theme/common/var.scss': resolve(shareRoot, 'styles/theme/common/var.scss'),
    '@lh-ui/share/styles/theme/common/var-dark.scss': resolve(
      shareRoot,
      'styles/theme/common/var-dark.scss',
    ),
    // ③ 无头逻辑：@lh-ui/share/core/** → share/src/core/**（前缀键，子路径自动继承）
    '@lh-ui/share/core': resolve(shareRoot, 'src/core'),
    // ④ 其余顶层模块：@lh-ui/share/{utils,constants,theme,locales,types}/**
    '@lh-ui/share/utils': resolve(shareRoot, 'src/utils'),
    '@lh-ui/share/constants': resolve(shareRoot, 'src/constants'),
    '@lh-ui/share/theme': resolve(shareRoot, 'src/theme'),
    '@lh-ui/share/locales': resolve(shareRoot, 'src/locales'),
    '@lh-ui/share/types': resolve(shareRoot, 'src/types'),
    // ⑤ 裸导入（兜底，前缀匹配不影响上面更长的键）
    '@lh-ui/share': resolve(shareRoot, 'src/index.ts'),
  }
}
