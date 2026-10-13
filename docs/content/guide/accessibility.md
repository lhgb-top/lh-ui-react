# 无障碍访问

`@lh-ui/react` 与家族其他库共享同一套无障碍契约：语义化标签、ARIA 属性、键盘交互全部在 `@lh-ui/share/core` 内定义，各端实现一致。本库额外保证 React 生态的常见 a11y 陷阱不出现。

## 语义与 ARIA

- **`LhSwitch`** 渲染 `<div role="switch" aria-checked>`，而非视觉伪装的 checkbox
- **`LhSelect`** 触发器为 `role="combobox"`，展开面板为 `role="listbox"`，选项为 `role="option"`，并用 `aria-activedescendant` 同步键盘高亮
- **`LhDialog`** 为 `role="dialog" aria-modal`，标题同时提供 `aria-label` 兜底与 `aria-labelledby` 精确关联
- **`LhTooltip`** 用 `aria-describedby` 把提示关联到触发器
- **`LhTag`** 可点击时升级为 `role="button"`，并响应 Enter / Space
- **`LhFormItem`** 校验失败渲染 `role="alert"` 错误提示，并设置 `aria-invalid`

## 键盘交互

| 组件 | 键位 |
| --- | --- |
| `LhButton` / `LhTag` | Enter / Space 触发点击 |
| `LhSwitch` | Enter / Space 切换 |
| `LhSelect` | ArrowUp / ArrowDown 高亮选项，Enter 选中，Escape 收起 |
| `LhDialog` | Escape 关闭（仅栈顶弹层响应） |
| `LhTooltip` | Escape 关闭 |

多弹层叠加时用 `useLhOverlayStack` 维护打开顺序栈，Escape 只关栈顶，避免一次按键带走全部弹层。

## 焦点管理

- **`LhDialog`** 打开时用 `useLhFocusTrap` 把焦点限制在对话框内（Tab / Shift+Tab 不外逃），关闭后焦点归还触发器
- **`LhFormItem`** 点击 label 时聚焦内容区首个可聚焦元素（`focusControl`），原生 label 包裹行为在复合控件上不可靠

## 装饰性图标

`LhIcon` 默认 `decorative`：输出 `aria-hidden="true"`，对屏幕阅读器不可见。需要语义时传 `decorative={false}` + `ariaLabel`：

```tsx
<LhIcon name="search" decorative={false} ariaLabel="搜索" />
```

此时渲染 `<svg role="img" aria-label="搜索">`。

## StrictMode 安全

所有组件在 React StrictMode 下安全：effect 的 cleanup 与重复挂载都做了幂等处理（弹层栈注册 / 卸载、滚动锁的持锁者校验、focus trap 的释放）。

## 家族一致性

无障碍行为在 `docs/设计语言基线.md` 登记，是双血脉（web / 原生）的统一契约。各端按同一份 `@lh-ui/share/core` 逻辑实现，aria 属性与键位语义一致。
