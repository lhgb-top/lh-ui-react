/**
 * 一次性迁移脚本：VitePress admonition → Docusaurus admonition
 *
 * - `::: tip 标题`  → `:::tip[标题]`
 * - `::: warning X` → `:::warning[X]`（无标题则 `:::warning`）
 * - `::: tip`（无标题）→ `:::tip`
 *
 * 标题内容可能含 markdown（如 **加粗**），Docusaurus 的 [title] 不解析 markdown，
 * 纯文本标题可直接搬。本脚本只处理纯文本标题。
 *
 * 迁移完成后即可删除本脚本。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(__dirname, '..', 'docs', 'content')

const files = []
for (const dir of ['components', 'guide']) {
  for (const f of readdirSync(resolve(contentDir, dir))) {
    if (f.endsWith('.md') || f.endsWith('.mdx')) files.push(resolve(contentDir, dir, f))
  }
}

const openerRe = /^::: (tip|warning|danger|note|info|details)(?: (.*))?$/

let total = 0
for (const filePath of files) {
  const lines = readFileSync(filePath, 'utf8').split('\n')
  let changed = false
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(openerRe)
    if (!m) continue
    const [, type, title] = m
    lines[i] = title ? `:::${type}[${title.trim()}]` : `:::${type}`
    changed = true
    total++
  }
  if (changed) writeFileSync(filePath, lines.join('\n'), 'utf8')
  if (changed) console.log(join('docs/content', filePath.split(/[/\\]content[/\\]/)[1]))
}
console.log(`done: ${total} admonition openers`)
