/**
 * 一次性迁移脚本：相对内部链接补 .md 后缀
 *
 * Docusaurus 的 markdown 相对链接必须指向 .md / .mdx 文件本体，
 * 无后缀的 `../guide/accessibility` 会被判为 broken link。
 * 外链（http）与 @site 别名不动。
 *
 * 迁移完成后即可删除本脚本。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(__dirname, '..', 'docs', 'content')

const files = []
for (const dir of ['components', 'guide']) {
  for (const f of readdirSync(resolve(contentDir, dir))) {
    if (f.endsWith('.md') || f.endsWith('.mdx')) files.push(resolve(contentDir, dir, f))
  }
}

// 匹配 [text](../guide/x) 或 [text](../guide/x#anchor)，不匹配 http(s) / @site / mailto
const linkRe = /(\]\()(\.\.?\/[^)\s]*?)(#[^)\s]*)?\)/g

let total = 0
for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8')
  const replaced = content.replace(linkRe, (full, prefix, pathPart, anchor) => {
    // 已带后缀则不动
    if (/\.(md|mdx)(#[^#]*)?$/.test(pathPart)) return full
    const fixed = `${prefix}${pathPart}.md${anchor ?? ''})`
    total++
    return fixed
  })
  if (replaced !== content) {
    writeFileSync(filePath, replaced, 'utf8')
    console.log(filePath.split(/[/\\]content[/\\]/)[1])
  }
}
console.log(`done: ${total} links`)
