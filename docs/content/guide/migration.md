# 迁移指南

本页讲两件事：**Vue（lh-ui-plus / lh-ui-vue2）→ React 的通用概念映射**，以及**本库实现中与 Vue 版有意的差异**。

## 概念映射总表

| Vue（lh-ui-plus） | React（@lh-ui/react） |
| --- | --- |
| `defineProps<T>()` | `interface LhXxxProps` + 解构默认参数 |
| `withDefaults(...)` | 解构默认值（**不用 `defaultProps`**） |
| `emits` + `emit('change', [val, e])` | `onChange?: (value, event) => void` |
| `v-model="x"` | `value={x} onChange={...}` |
| `v-model:visible="x"` | `visible={x} onVisibleChange={...}` |
| `defineExpose({ ... })` | `forwardRef` + `useImperativeHandle` |
| `<slot>` | `children` |
| `<slot name="footer">` | `footer?: ReactNode` prop |
| 具名插槽 `#header` | `header?: ReactNode` prop |
| `provide(...) / inject(...)` | `Context.Provider / useContext` |
| `provide` 必须 `computed` | Context value 必须 `useMemo` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| `watch(src, cb)` | `useEffect(() => cb(), [src])` |
| `watch(src, cb, { immediate: true })` | `useEffect`（effect 天生立即执行一次） |
| `onMounted / onUnmounted` | `useEffect` 的 setup / cleanup |
| `<Transition name="lh-x-fade">` | `useTransition(visible, duration)` 驱动同名类名 |
| `<Teleport to="body">` | `createPortal(..., document.body)` |
| `ref="<name>"` | `useRef<HTMLDivElement>(null)` |
| `nextTick()` | `flushSync()` 或 effect（通常不需要） |
| `app.use(LhUI)` | 无——命名导出按需引入 |
| `<LhXxx v-bind="obj">` | `<LhXxx {...obj}>` |

## 受控与非受控

Vue 的 `modelValue / update:modelValue` 在 React 里拆成两套 props：

```vue
<!-- Vue -->
<LhInput v-model="text" />
```

```tsx
// React：受控
<LhInput value={text} onChange={(val) => setText(val)} />

// React：非受控
<LhInput defaultValue="初始值" />
```

混用（同时传 `value` 与 `defaultValue`）会在开发态打一条告警，与 React 原生表单语义一致。

## 事件回调

所有事件 props 统一 `onXxx` 命名，回调签名统一双参数 `(value, event)`：

```vue
<!-- Vue -->
<LhSelect @change="onChange" />
```

```tsx
// React
<LhSelect onChange={(value, option) => console.log(value, option)} />
```

## 过渡动画

Vue 的 `<Transition>` 是声明式的，React 版用自研 `useTransition` hook 驱动同一套类名：

```tsx
import { useTransition } from '@lh-ui/react'

const { mounted, phase } = useTransition(visible, 300)
// 类名：`lh-dialog-fade-${phase}` —— phase ∈ enter-from / enter-active / enter-to
```

类名与 share SCSS 完全一致，视觉表现与 Vue 版逐帧相同。

## 弹层与传送

Vue 的 `<Teleport to="body">` 对应 React 的 `createPortal`，Dialog / Select 下拉 / Tooltip 全部挂到 `document.body`。定位几何由 `useLhPopper` 计算（与 Vue 版共用 `@lh-ui/share/core/shared/popper`）。

## 命令式 ref

Vue 的 `defineExpose` 对应 `forwardRef` + `useImperativeHandle`：

```vue
<!-- Vue -->
<LhForm ref="formRef" />
```

```tsx
// React
const formRef = useRef<LhFormInstance>(null)
<LhForm ref={formRef} />
<formRef.current?.validate() />
```

## 全局配置

```vue
<!-- Vue -->
<LhConfigProvider :size="size">
  <App />
</LhConfigProvider>
```

```tsx
// React
<LhConfigProvider size={size}>
  <App />
</LhConfigProvider>
```

---

## 本库与 Vue 版的实现差异

以下差异是 React 形态下的有意调整，迁移时需注意。每条都已在仓库内登记。

### 1. 样式按需注入

与 lh-ui-plus（全量注入）不同，本库与 lh-ui-vue2 对齐：包入口不注入样式，用户显式引 `theme.css` + `style/<name>`。

### 2. 构建链同 vue2

vite lib mode + `preserveModules` + `tsc` 镜像直出 d.ts（plus 用 rollup 多入口扫描）。`preserveModules` 天然支持按需引入，tsx 无 SFC 虚拟模块，`tsc` 直出 d.ts 最简。

### 3. ConfigProvider 消费侧兜底

Vue 版 `inject(..., null)` 让每个组件判空。React 版的消费 hook 返回全字段 `undefined` 的兜底对象，组件内不需要判空——这是 React Context 的常见做法，因为 `useContext` 无法在调用处给默认值。

### 4. notification / loading 的挂载差异

三者都是命令式服务，但挂载方式不同：`message` / `notification` 共用单例容器
（惰性 `createRoot` + action 频道），`loading` 需要挂到**任意目标元素**（全屏或局部），
走 per-instance `createRoot`，每个实例持有自己的 root 与 `overflow` / `inert` 还原句柄。

`notification` 的 API 是对象式（`notification.success({ title, content })`，对齐 plus 的
`Notification(options)`），也接受字符串简写（只渲染标题行）。**FLIP 让位动画未实现**：
Vue 的 transition-group 提供的 `-move` 类在 React 侧无等价原语，队列增删时兄弟卡片瞬时跳位。

### 5. Input 的 onChange 双参数

Vue 版的 `@input` / `@change` 分开，React 版统一为 `onChange(value, event)`（另有 `onInput` 透传原生输入事件）。

### 6. Input autosize 由组件操作 DOM

Vue 版通过 `data-autosize` 属性让指令在 DOM 层算高度。React 版在 `useEffect` 里直接读 `scrollHeight` 并写 `textarea.style.height`（受 `minRows` / `maxRows` 约束），避免引入额外指令机制。

### 7. Select 定位改用 useLhPopper

部分 Vue 版本的 Select 是手写 `fixed` 定位、不翻转。React 版统一走 `useLhPopper`（与 Dialog / Tooltip 同一套几何、同样的溢出翻转与滚动收起）。

### 8. Dialog 纯受控

plus 的 Dialog 内部持有 `isVisible` 中间态，用 `watch` 双向同步 `modelValue`。React 版去掉中间态：`open` 由外部持有，所有关闭路径只调 `onClose`。受控语义更纯粹，消除 props 与内部状态的竞态。

### 9. Dialog 生命周期拆成两组 effect

Vue 版用 `watch(visible, cb, { immediate: true })` 一个回调处理开关。React 版拆成「open effect」（注册弹层栈、锁滚动、触发 `onOpen`）与「mounted effect」（focus trap、触发 `onOpened` / `onClosed`），因为过渡动画的挂载时序与 open 时序在 React 里是两个独立的生命周期。

### 10. Form 的异步校验修正

plus 的 `validateField` 用 `Promise.resolve(!message)`，**不会等待异步 validator 返回的 Promise**——异步校验恒返回 `true`。React 版加了 `isThenable` 判定，显式等待异步 validator 完成后再判定：

```ts
if (isThenable(message)) return message.then((error) => !error)
```

这条缺陷已在家族 bugfix 台账登记，Vue 版的修正待回填。

### 11. Tooltip 受控简化

plus 的 Tooltip 有 `manual` 开关配合 `visible` 受控。React 版直接看 `visible` prop：传了 `visible` 就是受控，`onVisibleChange` 回调通知外部，不再保留 `manual` 中间开关。

### 12. React 侧增强（plus 暂无）

以下差异是 React 版的增强，迁移时按新能力使用即可：

- **Tag 关闭即卸载**：点关闭按钮后 Tag 立即从 DOM 卸载，随后才抛 `onClose`
  （plus 只抛事件、由外部 `v-if` 移除节点）。
- **Input 清空回写**：`clearable` 的清空按钮会同时抛 `onChange('')`，受控状态自动同步
  （plus 的 `@clear` 只抛事件）。
- **Form change 校验**：`rule.trigger === 'change'` 的规则随内容区 change 冒泡触发
  （plus 由 reactive 的 watch 驱动）。
- **Form 重置清错误**：`resetFields()` 自增内部版本号，各 FormItem 监听后清空错误态
  （plus 靠 reactive 链路自动清）。
- **Input 密码显隐**：`showPassword` prop 在 `type="password"` 时渲染眼睛按钮切换明文，
  plus / vue2 无此 prop。

### 13. Wave C 组件的 React 特化

- **Drawer 遮罩默认不可点穿**：`maskClosable` 默认 `false`（core 的 `canDrawerClose` 默认拒绝），
  plus 的 `closeOnClickModal` 默认 `true`，迁移时需显式声明。焦点圈只在 `lockScroll` 打开时
  启用（`shouldDrawerTrapFocus`），不锁定滚动时保留背后内容的 Tab 序列。
- **Dropdown 插槽改 prop**：plus 的 `#dropdown` 插槽在 React 侧改为同名 `dropdown` prop；
  菜单项经 Context 注册 DOM，roving tabindex 由 `activeEl` 锚点态驱动
  （Vue 版靠 `getCurrentInstance` 收集子组件实例）。
- **Popover / Popconfirm 受控化**：与 Tooltip 一致，传 `visible` 即受控、
  `onVisibleChange` 外抛，无 plus 的 `manual` 开关。

---

## 类型迁移速查

```ts
// Vue：props 从 withDefaults 推断
const props = withDefaults(defineProps<LhButtonProps>(), { type: 'text' })

// React：接口 + 解构默认
function LhButton(props: LhButtonProps) {
  const { type = 'text' } = props
}
```

```ts
// Vue：emit 声明
const emit = defineEmits<{ change: [val: string, e: Event] }>()

// React：props 上的回调
interface LhXxxProps {
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
}
```
