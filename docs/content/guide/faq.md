# 常见问题

## 为什么没有 `app.use()` 安装机制

React 没有 Vue 的插件体系。`@lh-ui/react` 全部为命名导出，按需引入即可，这也让 tree-shaking 更友好。全局配置用 `LhConfigProvider` 组件包裹。

## 为什么样式不自动注入

与 `@lh-ui/vue2` 对齐的按需策略：包入口不注入全量样式 side-effect，由用户显式引入 `@lh-ui/react/theme.css` 与 `@lh-ui/react/style/<name>`。理由是 React 生态的按需引入是主流，且全量 side-effect 会破坏 tree-shaking。

## 为什么 `onChange` 是两个参数

`(value, event)` 的双参数设计与 lh-ui-plus 的 `emit('change', [val, e])` 同构，方便从 Vue 迁移，也保留了拿到原生事件的能力。

## 弹层定位为什么不用 floating-ui

家族红线：弹层几何计算在 `@lh-ui/share/core/shared/popper` 内实现，各端共享同一份逻辑与边界处理（翻转、溢出收起、箭头）。引入第三方库会造成各端行为漂移。

## 过渡动画为什么不用 react-transition-group

同上。`useTransition` 是本库自研的 mounted + phase 状态机，类名与 share SCSS 完全一致（`*-enter-from` / `*-enter-active` / `*-enter-to`），且 StrictMode 安全。

## Dialog 为什么是纯受控

`open` 完全由外部 state 持有，任何关闭路径（遮罩点击 / Esc / 关闭按钮）都只调 `onClose`。lh-ui-plus 内部有 `isVisible` 中间态 + `watch` 双向同步，React 版去掉了这一层：受控语义更纯粹，也避免了 props 与内部状态竞态。

## 多个 Dialog 同时打开，Esc 为什么只关一个

`useLhOverlayStack` 维护打开顺序栈，Esc 只关栈顶弹层。这是 APG dialog pattern 的要求，避免一次按键把所有弹层一起带走。

## 命令式服务会创建多个 React root 吗

不会。`message` 等服务共享一个惰性创建的单例容器 root，首次调用才创建并 append 到 body，组件内部 state 管理消息队列。`destroyContainer()` 显式 `root.unmount()`。

## 在 SSR 里调用 `message` 会怎样

只打一条开发告警并 no-op，不创建 DOM。DOM 操作全部在 `useEffect` / `useIsomorphicLayoutEffect` 内，`useLhLocale` 用 `useSyncExternalStore` 提供一致的 SSR 快照。

## 为什么需要 `forwardRef` 而不直接用 ref prop

支持 React 18 与 19 双版本。React 19 的 ref-as-prop 在 18 上不存在，`forwardRef` 是两个版本共同的超集。可聚焦组件（button / input / select / dialog / tooltip）都转发 ref。

## 可以和 lh-ui-plus 在同一个项目里用吗

可以，两者类名与令牌完全一致，样式不冲突。但通常没必要——它们是同一批组件的两种框架形态。若在渐进迁移场景下混用，注意两库的 `@lh-ui/share` 版本范围要相容。

## 首期有哪些未实现的

P1/P2 组件（Popover、Drawer、Dropdown、Table 等）未实现。三个命令式服务
（`message` / `notification` / `loading`）均已完整实现。
