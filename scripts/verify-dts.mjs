/**
 * dts 产物校验：
 *   1. src 下每个 .ts / .tsx 都有 es/ 镜像 .d.ts
 *   2. 产物 d.ts 无越界导入（@dcloudio / lh-constants / lh-types / ~/ / @lh-ui/core）
 *   3. 相对导入不逃出包根
 * （react / react-dom / @lh-ui/share 为合法外部类型依赖：react 是本库 peer，
 *  share 自带类型声明；@lh-ui/core 属原生血脉，与本库零依赖）
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(root, 'src')
const esDir = join(root, 'es')

const FORBIDDEN = [
  /['"]@dcloudio/,
  /['"]lh-constants['"]/,
  /['"]lh-types/,
  /from\s+['"]~\//,
  /['"]@lh-ui\/core/,
]

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, ext, out)
    else if (name.endsWith(ext)) out.push(full)
  }
  return out
}

const errors = []

// 1. 镜像完整性：src/*.{ts,tsx} ↔ es/*.d.ts
//    （.d.ts 输入——env.d.ts 等——由 tsc 检查但不发射，不参与镜像检查）
const srcFiles = [...walk(srcDir, '.ts'), ...walk(srcDir, '.tsx')].filter(
  (file) => !file.endsWith('.d.ts'),
)
for (const file of srcFiles) {
  const rel = relative(srcDir, file)
  const dts = join(esDir, rel.replace(/\.tsx?$/, '.d.ts'))
  if (!existsSync(dts)) errors.push(`[镜像缺失] ${rel} -> ${relative(root, dts)}`)
}

// 2+3. 产物扫描
const dtsFiles = walk(esDir, '.d.ts')
for (const file of dtsFiles) {
  const content = readFileSync(file, 'utf8')
  const rel = relative(root, file)
  for (const pattern of FORBIDDEN) {
    if (pattern.test(content)) errors.push(`[越界导入] ${rel}: ${pattern}`)
  }
  for (const match of content.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const target = resolve(dirname(file), match[1])
    if (!target.startsWith(root)) errors.push(`[逃逸包根] ${rel}: ${match[1]}`)
  }
}

if (errors.length) {
  console.error(`[verify-dts] 失败（${errors.length} 项）：`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}
console.log(
  `[verify-dts] 通过：${srcFiles.length} 个源文件镜像完整，${dtsFiles.length} 个声明文件无越界导入`,
)
