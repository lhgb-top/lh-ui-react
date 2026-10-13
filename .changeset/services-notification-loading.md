---
"@lh-ui/react": minor
---

# notification / loading 命令式服务完整实现

- **notification**：`notification.info/success/warning/error/danger(options)` → `{ close }`，
  支持 `title` / `content` / `duration`（默认 4500）/ `position`（四角，默认 top-right）/
  `showClose` / `onClick` / `onClose`；字符串简写只渲染标题行。条目自管退场动画
  （`lh-notification-slide-*`，280ms），`closeAll()` 一次清空。对象式 API 对齐 plus 的
  `Notification(options)`。**FLIP 让位动画未实现**（React 无 transition-group 等价原语）。
- **loading**：`loading.show({ target?, text?, background?, lock? })` → `{ close }`。
  与 message / notification 不同：需挂到任意目标元素（全屏或局部），走 per-instance
  `createRoot`；`lock` 锁定目标滚动并对非全屏目标设 `inert`，`static` 定位自动补
  `relative`，关闭时全部还原。文案默认取语言包 `loading.text`。
- 文档：新增 message / notification / loading 三个组件页（反馈组件组），
  更新 quickstart / faq / migration 中「首期占位」的过时描述。
