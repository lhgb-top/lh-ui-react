/**
 * 一次性迁移脚本：VitePress 组件页 .md → Docusaurus .mdx
 *
 * 做三件事：
 * 1. <DemoBlock title="X">\n  <ReactDemo src="a/b" />\n</DemoBlock>
 *    → 在文件顶部插入 import，标签换成 <DemoBlock title="X"><<AB />></DemoBlock>
 * 2. 文件名 .md → .mdx
 * 3. 删除原 .md
 *
 * 迁移完成后即可删除本脚本。
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentsDir = resolve(__dirname, '..', 'docs', 'content', 'components')

/** config-provider/basic → ConfigProviderBasic（按 / 与 - 切分，逐段驼峰大写） */
function componentName(src) {
  return src
    .split(/[-/]/)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('')
}

function convertFile(file) {
  const filePath = resolve(componentsDir, file)
  let content = readFileSync(filePath, 'utf8')

  const importLines = new Map()
  const srcRe = /<ReactDemo src="([^"]+)"\s*\/>/
  let match
  while ((match = srcRe.exec(content))) {
    const src = match[1]
    const name = componentName(src)
    importLines.set(name, src)
    content = content.replace(srcRe, `<${name} />`)
  }

  if (importLines.size === 0) return { file, demos: 0 }

  // import 段插在 frontmatter 与首个标题之间（frontmatter 后的第一个空行之后）
  const fmEnd = content.indexOf('\n---\n')
  let insertPos = 0
  if (fmEnd !== -1) {
    insertPos = fmEnd + '\n---\n'.length
    // 跳过紧随的空行
    while (insertPos < content.length && content[insertPos] === '\n') insertPos++
  }

  const imports = [...importLines.entries()]
    .map(([name, src]) => `import ${name} from '@site/demos/${src}'`)
    .join('\n')
  const demoBlockImport = "import DemoBlock from '@site/src/components/DemoBlock'"

  const before = content.slice(0, insertPos)
  const after = content.slice(insertPos)
  content = `${before}${demoBlockImport}\n${imports}\n\n${after}`

  const outPath = filePath.replace(/\.md$/, '.mdx')
  writeFileSync(outPath, content, 'utf8')
  unlinkSync(filePath)
  return { file: file.replace(/\.md$/, '.mdx'), demos: importLines.size }
}

const files = readdirSync(componentsDir).filter((f) => f.endsWith('.md'))
for (const f of files) {
  const r = convertFile(f)
  console.log(`${r.file} (${r.demos} demo)`)
}
console.log(`done: ${files.length} files`)
