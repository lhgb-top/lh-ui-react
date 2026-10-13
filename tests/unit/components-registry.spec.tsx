import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import * as lhReact from '../../src/index'

/**
 * 组件注册表测试
 *
 * 与 plus 的 registry 测试差异：React 版无 install 机制，没有 lhComponents 注册表，
 * 改为「反向扫描 src/components 目录 + 断言 barrel 导出存在」——
 * 新增组件目录但忘了在 src/index.ts 导出时，本测试必然失败。
 */

const COMPONENTS_DIR = path.resolve(__dirname, '../../src/components')

/** 目录名 → 组件导出名（kebab → Pascal，加 Lh 前缀） */
function toExportName(dir: string): string {
  const pascal = dir
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `Lh${pascal}`
}

/** 目录名 → 胶水 hook 导出名 */
function toHookName(dir: string): string {
  const pascal = dir
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `useLh${pascal}`
}

const componentDirs = fs.readdirSync(COMPONENTS_DIR).filter((dir) => {
  return fs.statSync(path.join(COMPONENTS_DIR, dir)).isDirectory()
})

describe('components registry', () => {
  it('src/components 目录存在且非空', () => {
    expect(componentDirs.length).toBeGreaterThan(0)
  })

  it('Wave A + B + C 二十六组件全部在位', () => {
    expect(componentDirs).toEqual([
      'alert',
      'breadcrumb',
      'button',
      'card',
      'checkbox',
      'config-provider',
      'dialog',
      'divider',
      'drawer',
      'dropdown',
      'empty',
      'form',
      'icon',
      'input',
      'pagination',
      'popconfirm',
      'popover',
      'radio',
      'select',
      'skeleton',
      'space',
      'steps',
      'switch',
      'tabs',
      'tag',
      'tooltip',
    ])
  })

  it('每个组件目录都在 barrel 中导出了组件与胶水 hook', () => {
    const missing: string[] = []
    for (const dir of componentDirs) {
      const exportName = toExportName(dir)
      const hookName = toHookName(dir)
      if (!(exportName in lhReact)) missing.push(exportName)
      // config-provider 的胶水是 useLhConfigProvider，同样覆盖
      if (!(hookName in lhReact)) missing.push(hookName)
    }
    expect(missing).toEqual([])
  })

  it('组件导出名为 Lh 前缀（家族命名规范）', () => {
    for (const dir of componentDirs) {
      expect(toExportName(dir)).toMatch(/^Lh[A-Z]/)
    }
  })

  it('复合组件成对导出', () => {
    expect(lhReact.LhCheckbox).toBeDefined()
    expect(lhReact.LhCheckboxGroup).toBeDefined()
    expect(lhReact.LhRadio).toBeDefined()
    expect(lhReact.LhRadioGroup).toBeDefined()
    expect(lhReact.LhForm).toBeDefined()
    expect(lhReact.LhFormItem).toBeDefined()
    expect(lhReact.LhSkeleton).toBeDefined()
    expect(lhReact.LhSkeletonItem).toBeDefined()
    expect(lhReact.LhBreadcrumb).toBeDefined()
    expect(lhReact.LhBreadcrumbItem).toBeDefined()
    expect(lhReact.LhTabs).toBeDefined()
    expect(lhReact.LhTabPane).toBeDefined()
    expect(lhReact.LhSteps).toBeDefined()
    expect(lhReact.LhStep).toBeDefined()
    expect(lhReact.LhDropdown).toBeDefined()
    expect(lhReact.LhDropdownItem).toBeDefined()
  })

  it('hooks 全部导出', () => {
    const hooks = [
      'useIsomorphicLayoutEffect',
      'useLhNamespace',
      'useLhSize',
      'useLhDisabled',
      'useLhComponentTheme',
      'useLhTheme',
      'useLhPresetTheme',
      'useLhZIndex',
      'useLhOverlayStack',
      'useLhBreakpoint',
      'useControlled',
      'useTransition',
      'useLhPopper',
      'useLhClickOutside',
      'useLhFocusTrap',
      'useLhTrigger',
    ]
    const missing = hooks.filter((name) => !(name in lhReact))
    expect(missing).toEqual([])
  })

  it('locale 与命令式服务导出', () => {
    expect(lhReact.useLhLocale).toBeDefined()
    expect(lhReact.lhlocale).toBeDefined()
    expect(lhReact.zhCN).toBeDefined()
    expect(lhReact.enUS).toBeDefined()
    expect(lhReact.message).toBeDefined()
    expect(lhReact.message.success).toBeTypeOf('function')
    expect(lhReact.notification).toBeDefined()
    expect(lhReact.loading).toBeDefined()
    expect(lhReact.destroyContainer).toBeDefined()
  })
})
