/**
 * DemoBlock —— 文档页的 demo 容器（替代 VitePress 的 DemoBlock.vue）
 *
 * 用法（MDX 内）：
 *
 * ```mdx
 * import DemoBlock from '@site/src/components/DemoBlock'
 * import Basic from '@site/demos/button/basic'
 *
 * <DemoBlock title="基础用法">
 *   <Basic />
 * </DemoBlock>
 * ```
 *
 * 紧随其后用 ```tsx 围栏给出同一段 demo 的源码（展示给用户的代码必须只用
 * npm 包名 @lh-ui/react，禁止 ~/、@/ 等内部别名）。
 *
 * 与 lh-ui-plus 的 DemoBlock 同构：差异仅在容器由 Vue 组件改为 React 组件。
 */
import type { ReactNode } from 'react'
import styles from './DemoBlock.module.css'

export interface DemoBlockProps {
  /** demo 标题 */
  title?: string
  children?: ReactNode
}

export default function DemoBlock({ title, children }: DemoBlockProps) {
  return (
    <div className={styles.demoBlock}>
      {title ? (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
        </div>
      ) : null}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
