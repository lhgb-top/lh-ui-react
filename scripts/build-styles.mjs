/**
 * 从 @lh-ui/share 的样式唯一源编译组件 css 与主题 css（本库不持有任何样式副本）
 *
 * 产物：
 *   es/components/<name>/style/index.css + lib/components/<name>/style/index.css
 *                              （share 存有样式源的组件）
 *   dist/theme/index.css       明色 :root 变量
 *   dist/theme/index-dark.css  暗色 [data-theme='dark'] / .dark 变量
 *   es/package.json / lib/package.json  模块类型标记（供 Node 正确解析 CJS/ESM）
 *
 * share 样式源内部全部为相对 @use（如 '../theme/common/index.scss'），
 * dart-sass 按文件绝对路径编译即可自足解析，无需 loadPaths / NodePackageImporter
 * （styles/ 目录内不存在裸包名导入，M0b 已在 vue2 仓验证）。
 *
 * 组件清单按 src/components 扫描：share 无样式源的组件（如 config-provider）
 * 自动跳过；share 有样式源但本库尚未实现的组件不会出现在产物里（清单由本库决定）。
 */
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const shareRoot = resolve(root, 'node_modules/@lh-ui/share')
const componentsDir = join(root, 'src/components')

async function writeWithDir(file, content) {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content)
}

async function main() {
  if (!existsSync(shareRoot)) {
    console.error(`[build-styles] 未找到 ${shareRoot}，请先 pnpm install`)
    process.exit(1)
  }

  // 1. 组件样式：仅编译 share 存有样式源的组件
  const names = readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  let compiled = 0
  const skipped = []
  for (const name of names) {
    const source = join(shareRoot, 'styles', name, 'index.scss')
    if (!existsSync(source)) {
      skipped.push(name)
      continue
    }
    const { css } = sass.compile(source)
    // 落位与 JS 产物同构（preserveModules 镜像 src）：es/components/<name>/style/index.css
    await writeWithDir(join(root, 'es', 'components', name, 'style', 'index.css'), css)
    await writeWithDir(join(root, 'lib', 'components', name, 'style', 'index.css'), css)
    compiled += 1
  }

  // 2. 主题 css（明 + 暗）
  const themeDir = join(root, 'dist/theme')
  await mkdir(themeDir, { recursive: true })
  const theme = sass.compile(join(shareRoot, 'styles/theme/index.scss'))
  await writeFile(join(themeDir, 'index.css'), theme.css)
  const dark = sass.compile(join(shareRoot, 'styles/theme/common/var-dark.scss'))
  await writeFile(join(themeDir, 'index-dark.css'), dark.css)

  // 3. es/lib 模块类型标记（lib 为 CJS 产物，需 type: commonjs 覆盖根 package.json 的 module）
  await writeWithDir(join(root, 'es/package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n')
  await writeWithDir(join(root, 'lib/package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n')

  const skipNote = skipped.length ? `，跳过（无样式源）：${skipped.join('、')}` : ''
  console.log(`styles built: ${compiled} 组件 + theme(light+dark) -> es/, lib/, dist/theme${skipNote}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
