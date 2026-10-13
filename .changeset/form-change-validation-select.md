---
'@lh-ui/react': patch
---

修复 trigger: 'change' 规则的两处缺陷：

- **LhSelect 选中选项不触发 change 校验**：选项点击只产生 click 事件，没有原生 change
  事件冒泡到 FormItem 内容区，`trigger: 'change'` 的规则在自定义控件上完全不生效。
  现把 `validateChange(value)` 挂到 `LhFormItemContext`，LhSelect 在选中 / 清空时
  主动带着新值触发，与原生控件的冒泡路径对齐。
- **change 校验滞后一拍**：React 的状态更新与事件派发不在同一拍，校验回头读 model
  会拿到旧值，错误态总是慢一拍清除。FormItem 现在取事件目标的新值参与校验
  （勾选类控件仍走 model，其 value 不代表选中态）。
