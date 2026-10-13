/**
 * 一次性迁移脚本：为 en locale 生成 docs 骨架镜像
 *
 * Docusaurus 的 docs i18n 要求 i18n/<locale>/docusaurus-plugin-content-docs/current/
 * 与 docs 源**同结构同名**的文件；缺失的文件会回退到默认 locale（zh-CN），
 * 但侧边栏文档 id 不会注册，locale 切换会 404。
 *
 * 原 VitePress 的 docs/en/ 就是 5 行骨架，此处保持同一策略：
 * 每页给出英文标题 + 指向中文原文的相对链接（走 Docusaurus 的 markdown 相对链接，
 * 由其补 baseUrl 与 locale 前缀，禁止硬编码 /lhui/react/，否则 en 下会双重前缀）。
 *
 * 迁移完成后即可删除本脚本。
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(__dirname, '..', 'docs')
const contentDir = resolve(docsDir, 'content')
const enDir = resolve(docsDir, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current')

/** 从 mdx/md 提取首个一级标题，取不到就用文件名 */
function extractTitle(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const m = content.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : filePath.split(/[/\\]/).pop()
}

let count = 0
for (const dir of ['components', 'guide']) {
  const srcDir = resolve(contentDir, dir)
  const outDir = resolve(enDir, dir)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  for (const f of readdirSync(srcDir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue
    const title = extractTitle(resolve(srcDir, f))
    const slug = f.replace(/\.(md|mdx)$/, '')
    // 只保留纯文本说明：跨目录的相对链接在 i18n 镜像目录下解析不稳定
    // （Docusaurus 对 i18n 文件的相对链接以源文件位置计算，指向不存在路径），
    // 且硬编码 baseUrl 会在 en 下产生 /lhui/react/en/lhui/react/... 双重前缀
    const stub = `# ${title}

> This page is not yet translated into English. The Chinese version is the source of truth.
`
    // 扩展名必须与源文件一致（.mdx 源对应 .mdx stub，否则 Docusaurus 认为翻译缺失、
    // 回退渲染中文全文）
    writeFileSync(resolve(outDir, f), stub, 'utf8')
    count++
  }
}
console.log(`done: ${count} en stubs at ${enDir}`)
