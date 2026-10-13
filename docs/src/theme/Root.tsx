/**
 * 站点根包装（Docusaurus Root swizzle）
 *
 * 唯一职责：把 locale 初始化的模块副作用挂在应用最顶层，
 * 保证 demo 渲染前 lhlocale 已注册 demo 文案并切到当前构建语言。
 * 其余行为原样透传。
 */
import type { ReactNode } from 'react'

import '../locale/init'

export default function Root({ children }: { children: ReactNode }): ReactNode {
  return children
}
