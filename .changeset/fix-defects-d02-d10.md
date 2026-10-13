---
"@lh-ui/react": minor
---

# 缺陷修复 D-03 / D-04 / D-05 / D-06 / D-10

- **D-03 Tag 关闭即卸载**：`closable` Tag 点击关闭后立即从 DOM 卸载再抛 `onClose`
  （对齐 Alert 的「内部非受控」语义；plus 只抛事件、由外部 `v-if` 移除，React 无指令，
  纯展示场景的外部 state 管理过重）。
- **D-04 Input 清空回写**：`handleClear` 在 `onClear` 前补抛 `onChange('', event)`，
  受控模式下清空按钮现在能正确同步外部状态（此前 `setInputValue('')` 在受控模式是 no-op，
  外部值不变化）。
- **D-05 FormItem change 校验**：内容区 `onChange` 冒泡捕获，仅对
  `trigger === 'change'` 的规则子集触发校验；未标注 trigger 的规则仍只在失焦 / `validate()` 时运行，
  输入过程中不会反复报错。share 的 `validateFormField` 不解释 trigger，过滤在本层完成。
- **D-06 form 重置清错误**：`resetFields()` 自增内部 `resetVersion` 并入 Form 上下文，
  各 FormItem 监听版本变化清空错误态（外部 model 的还原仍由用户负责）。
- **D-10 Input 密码显隐**：新增 `showPassword` prop（React 首创，plus / vue2 无此能力），
  `type="password"` 时后缀渲染眼睛按钮切换 password ↔ text，`aria-pressed` 标记显隐态，
  Enter / Space 键盘可用；share 仅有 `eye` 图标，两态同图形靠 aria 区分。
