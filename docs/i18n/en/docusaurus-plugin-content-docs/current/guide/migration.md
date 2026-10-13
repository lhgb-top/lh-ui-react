# Migration guide

This page covers two things: the **general concept mapping from Vue (lh-ui-plus / lh-ui-vue2) to React**, and the **intentional differences between this library and the Vue versions**.

## Concept mapping

| Vue (lh-ui-plus) | React (@lh-ui/react) |
| --- | --- |
| `defineProps<T>()` | `interface LhXxxProps` + destructured default parameters |
| `withDefaults(...)` | Destructured defaults (**no `defaultProps`**) |
| `emits` + `emit('change', [val, e])` | `onChange?: (value, event) => void` |
| `v-model="x"` | `value={x} onChange={...}` |
| `v-model:visible="x"` | `visible={x} onVisibleChange={...}` |
| `defineExpose({ ... })` | `forwardRef` + `useImperativeHandle` |
| `<slot>` | `children` |
| `<slot name="footer">` | `footer?: ReactNode` prop |
| Named slot `#header` | `header?: ReactNode` prop |
| `provide(...) / inject(...)` | `Context.Provider / useContext` |
| `provide` must be `computed` | Context value must be `useMemo` |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` |
| `watch(src, cb)` | `useEffect(() => cb(), [src])` |
| `watch(src, cb, { immediate: true })` | `useEffect` (effects always run once immediately) |
| `onMounted / onUnmounted` | setup / cleanup of `useEffect` |
| `<Transition name="lh-x-fade">` | `useTransition(visible, duration)` driving the same class names |
| `<Teleport to="body">` | `createPortal(..., document.body)` |
| `ref="<name>"` | `useRef<HTMLDivElement>(null)` |
| `nextTick()` | `flushSync()` or an effect (usually unnecessary) |
| `app.use(LhUI)` | None — named imports, on demand |
| `<LhXxx v-bind="obj">` | `<LhXxx {...obj}>` |

## Controlled and uncontrolled

Vue's `modelValue / update:modelValue` splits into two props in React:

```vue
<!-- Vue -->
<LhInput v-model="text" />
```

```tsx
// React: controlled
<LhInput value={text} onChange={(val) => setText(val)} />

// React: uncontrolled
<LhInput defaultValue="Initial value" />
```

Mixing the two (passing both `value` and `defaultValue`) logs a development warning, consistent with native React form semantics.

## Event callbacks

Every event prop follows the `onXxx` naming, and every callback takes two arguments `(value, event)`:

```vue
<!-- Vue -->
<LhSelect @change="onChange" />
```

```tsx
// React
<LhSelect onChange={(value, option) => console.log(value, option)} />
```

## Transitions

Vue's `<Transition>` is declarative; the React version drives the same class names with the in-house `useTransition` hook:

```tsx
import { useTransition } from '@lh-ui/react'

const { mounted, phase } = useTransition(visible, 300)
// Class: `lh-dialog-fade-${phase}` — phase ∈ enter-from / enter-active / enter-to
```

The class names match the share SCSS exactly, so the visuals are frame-identical to the Vue version.

## Overlays and portals

Vue's `<Teleport to="body">` maps to React's `createPortal`; Dialog / Select dropdown / Tooltip all mount to `document.body`. Positioning geometry is computed by `useLhPopper` (sharing `@lh-ui/share/core/shared/popper` with the Vue version).

## Imperative refs

Vue's `defineExpose` maps to `forwardRef` + `useImperativeHandle`:

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

## Global configuration

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

## Implementation differences from the Vue version

The differences below are deliberate adjustments for the React shape. Each one is registered in the repository.

### 1. On-demand style injection

Unlike lh-ui-plus (full injection), this library aligns with lh-ui-vue2: the package entry injects no styles; users explicitly import `theme.css` + `style/<name>`.

### 2. Build chain like vue2

Vite lib mode + `preserveModules` + a `tsc` mirror that emits d.ts directly (plus uses rollup multi-entry scanning). `preserveModules` supports on-demand import naturally, tsx has no SFC virtual modules, and `tsc`-emitted d.ts is the simplest option.

### 3. ConfigProvider consumer fallback

The Vue version uses `inject(..., null)` so every component null-checks. The React version's consumer hook returns a fallback object with every field `undefined`, so components need no null checks — a common React pattern, since `useContext` cannot take a default at the call site.

### 4. Mounting differences of notification / loading

All three are imperative services, but they mount differently: `message` / `notification` share a singleton container (lazy `createRoot` + an action channel), while `loading` must mount to **an arbitrary target element** (fullscreen or local) through a per-instance `createRoot`, where each instance holds its own root plus `overflow` / `inert` restore handles.

The `notification` API is object-style (`notification.success({ title, content })`, mirroring plus's `Notification(options)`) and also accepts a string shorthand (rendering only the title line). **FLIP shuffle animations are not implemented**: the `-move` class provided by Vue's transition-group has no React equivalent, so sibling cards jump instantly when the queue changes.

### 5. Input onChange takes two arguments

The Vue version splits `@input` / `@change`; the React version unifies them into `onChange(value, event)` (plus an `onInput` passthrough of the native input event).

### 6. Input autosize is done by the component

The Vue version uses a `data-autosize` attribute so a directive computes the height at the DOM level. The React version reads `scrollHeight` inside `useEffect` and writes `textarea.style.height` directly (bounded by `minRows` / `maxRows`), avoiding an extra directive mechanism.

### 7. Select positioning uses useLhPopper

Some Vue versions of Select hand-write `fixed` positioning without flipping. The React version goes through `useLhPopper` uniformly (the same geometry as Dialog / Tooltip, with the same overflow flipping and scroll collapse).

### 8. Dialog is purely controlled

The plus Dialog holds an internal `isVisible` intermediate state and syncs `modelValue` with a `watch`. The React version removes the intermediate state: `open` is held externally, and every close path only calls `onClose`. The controlled semantics are purer, eliminating races between props and internal state.

### 9. Dialog lifecycle split into two effect groups

The Vue version uses a single `watch(visible, cb, { immediate: true })` callback for both opening and closing. The React version splits into an "open effect" (registering the overlay stack, locking scroll, firing `onOpen`) and a "mounted effect" (focus trap, firing `onOpened` / `onClosed`), because the mount timing of the transition and the open timing are two independent lifecycles in React.

### 10. Form async validation fix

The plus `validateField` uses `Promise.resolve(!message)` and **never awaits the Promise returned by an async validator** — async validation always resolves to `true`. The React version adds an `isThenable` check and explicitly awaits async validators before deciding:

```ts
if (isThenable(message)) return message.then((error) => !error)
```

This defect is registered in the family bugfix ledger; the Vue fix is still pending.

### 11. Tooltip control simplified

The plus Tooltip has a `manual` switch paired with the controlled `visible`. The React version just reads the `visible` prop: passing `visible` means controlled, `onVisibleChange` notifies the outside, and the `manual` switch is gone.

### 12. React-side enhancements (not yet in plus)

These differences are enhancements of the React version — just use the new capabilities when migrating:

- **Tag unmounts on close**: after the close button is clicked, the Tag unmounts from the DOM immediately, then fires `onClose` (plus only fires the event and lets the outside remove the node with `v-if`).
- **Input clear writes back**: the clear button of `clearable` also fires `onChange('')`, so controlled state syncs automatically (plus's `@clear` only fires an event).
- **Form change validation**: rules with `rule.trigger === 'change` fire as changes bubble up from the content area (plus drives them through reactive watches).
- **Form reset clears errors**: `resetFields()` increments an internal version number, which each FormItem watches to clear its error state (plus relies on the reactive chain).
- **Input password toggle**: the `showPassword` prop renders an eye button to toggle plaintext when `type="password"`; plus / vue2 have no such prop.

### 13. React-specific Wave C components

- **Drawer mask is not closable by default**: `maskClosable` defaults to `false` (core's `canDrawerClose` denies by default), while plus's `closeOnClickModal` defaults to `true` — declare it explicitly when migrating. The focus trap is only enabled when `lockScroll` is on (`shouldDrawerTrapFocus`); without scroll locking, the Tab order of the content behind is preserved.
- **Dropdown slot becomes a prop**: plus's `#dropdown` slot becomes a same-named `dropdown` prop on the React side; menu items register their DOM through Context, and roving tabindex is driven by the `activeEl` anchor state (the Vue version collects child component instances via `getCurrentInstance`).
- **Popover / Popconfirm go controlled**: same as Tooltip — passing `visible` means controlled, `onVisibleChange` notifies out; there is no plus `manual` switch.

---

## Type migration cheatsheet

```ts
// Vue: props inferred from withDefaults
const props = withDefaults(defineProps<LhButtonProps>(), { type: 'text' })

// React: interface + destructured defaults
function LhButton(props: LhButtonProps) {
  const { type = 'text' } = props
}
```

```ts
// Vue: emit declaration
const emit = defineEmits<{ change: [val: string, e: Event] }>()

// React: callback on props
interface LhXxxProps {
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
}
```
