'@lh-ui/react': minor
---

# Wave C：popover / popconfirm / drawer / dropdown 四组件

- **popover 气泡卡片**：`trigger` 默认 click；`title` / `content` 双区结构；`visible` 受控
  （`useControlled`）；复用 `useLhPopper` / `useLhTrigger` / `useLhClickOutside` 基建，
  溢出视口自动翻转、滚出收起；click 触发按 `role="dialog"` 圈焦（对齐 plus 的 isModal）；
  `lh-popover-fade-*` 自研过渡。
- **popconfirm 气泡确认框**：`role="alertdialog"`，打开即圈焦；`type`（info / warning / danger，
  默认 warning）切换图标；确认 / 取消按钮文案走语言包（`popconfirm.confirm` / `popconfirm.cancel`）；
  确认 / 取消 / Esc 均先回调后关闭。
- **drawer 抽屉**：clone dialog 的弹层栈 + 滚动锁 + `beforeClose` 拦截；方向 `right` / `left` /
  `top` / `bottom`，`size` 经 core 的 `normalizeDrawerSize` / `getDrawerPanelStyle` 按方向落到
  width / height；`maskClosable` 默认 false（core 的 `canDrawerClose`）；焦点圈只在 `lockScroll`
  打开时启用（`shouldDrawerTrapFocus`）；`onCloseStart` 生命周期。
- **dropdown 下拉菜单（复合）**：`LhDropdown` + `LhDropdownItem` + Context；菜单 `role="menu"`、
  菜单项 `role="menuitem"`；trigger 支持 hover / click / contextmenu；APG menu pattern 键盘导航
  （`getNextListIndex` 循环跳禁用、Home / End、Enter / Space 激活、Esc 关闭并归还焦点）；
  roving tabindex（Context 注册 DOM + `activeEl` 锚点）；`onCommand` 命令式编程 +
  `hideOnClick` 自动关闭。菜单内容由 `dropdown` prop 传入（对应 plus 的 `#dropdown` 插槽）。
- 注册：`src/index.ts` 新增 4 个导出块（复合组件成对导出 `LhDropdown` / `LhDropdownItem`），
  registry 测试组件清单 22 → 26。
- 文档：4 个组件页 + demo + en i18n 骨架，反馈 / 导航组件组各增条目，
  `docs/src/css/custom.scss` 追加 4 条样式 `@use`。
- 测试：popover 10 / popconfirm 11 / drawer 16 / dropdown 17 用例。
