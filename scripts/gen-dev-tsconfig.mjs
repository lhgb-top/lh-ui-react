/**
 * 生成 tsconfig.dev.json —— 本地 typecheck 的联动配置
 *
 * 根 tsconfig.json 是构建链读取的那一份（tsc -p tsconfig.build.json 通过 extends
 * 继承它）。不能直接在根配置里加 @lh-ui/share 的源码映射——声明构建会把兄弟仓的
 * .ts 拉进 program，拖慢编译；而且 types 映射到源码后，发布声明会脱离
 * 「随包发布的 .d.ts」语义。所以本地 typecheck 单走一份派生配置，根配置逐字节不动。
 *
 * 派生配置只覆盖两件事：
 *   - noEmit：typecheck 只做检查，顺带让 TS6059（rootDir 检查）无从触发
 *   - paths：追加 @lh-ui/share/* → 同级 lh-ui-share 源码。TS 的 extend() 对 compilerOptions
 *     是浅合并、对 paths 是**整体替换**，根配置的别名必须原样重声明，否则会丢别名
 *
 * 守卫与 local-share-alias.mjs 一致：兄弟仓不存在（CI 单仓 clone、独立下载）时生成的配置
 * 不含任何 share 映射，回退 node_modules 里 npm 包的类型，与本次改动前行为完全一致。
 *
 * 产物 tsconfig.dev.json 是生成文件，已在 .gitignore 里忽略。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const shareSrc = path.resolve(root, '..', 'lh-ui-share', 'src')

/** 转成 tsconfig paths 用的正斜杠相对路径（Windows 下 path.relative 给反斜杠） */
const rel = (p) => path.relative(root, p).split(path.sep).join('/')

function main() {
  const baseConfig = JSON.parse(fs.readFileSync(path.resolve(root, 'tsconfig.json'), 'utf8'))
  const basePaths = baseConfig.compilerOptions?.paths ?? {}

  if (!fs.existsSync(shareSrc)) {
    write(basePaths)
    console.log(`[gen-dev-tsconfig] 兄弟仓不存在（${rel(shareSrc)}），未追加 share 映射，回退 npm 包类型`)
    return
  }

  // 只映射带类型的子路径：styles/* 没有类型（env.d.ts 的 ambient 声明已兜底），刻意不映射，
  // 保持与 npm 包一致的解析路径。core/<name> 与 core/<name>/logic 两层都由 core/* 一条覆盖。
  write({
    ...basePaths,
    '@lh-ui/share': [rel(path.join(shareSrc, 'index.ts'))],
    '@lh-ui/share/core/*': [rel(path.join(shareSrc, 'core/*'))],
    '@lh-ui/share/utils': [rel(path.join(shareSrc, 'utils'))],
    '@lh-ui/share/utils/*': [rel(path.join(shareSrc, 'utils/*'))],
    '@lh-ui/share/constants': [rel(path.join(shareSrc, 'constants'))],
    '@lh-ui/share/constants/*': [rel(path.join(shareSrc, 'constants/*'))],
    '@lh-ui/share/theme': [rel(path.join(shareSrc, 'theme'))],
    '@lh-ui/share/theme/*': [rel(path.join(shareSrc, 'theme/*'))],
    '@lh-ui/share/locales': [rel(path.join(shareSrc, 'locales'))],
    '@lh-ui/share/locales/*': [rel(path.join(shareSrc, 'locales/*'))],
    '@lh-ui/share/types': [rel(path.join(shareSrc, 'types'))],
    '@lh-ui/share/types/*': [rel(path.join(shareSrc, 'types/*'))],
  })
  console.log(`[gen-dev-tsconfig] 已联动 ${rel(shareSrc)}，typecheck 走兄弟仓源码`)
}

function write(paths) {
  const devConfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      noEmit: true,
      paths,
    },
  }
  fs.writeFileSync(path.resolve(root, 'tsconfig.dev.json'), `${JSON.stringify(devConfig, null, 2)}\n`)
}

main()
