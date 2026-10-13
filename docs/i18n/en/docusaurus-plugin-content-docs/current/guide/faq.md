# FAQ

## Why is there no `app.use()` install mechanism?

React has no plugin system like Vue. Everything in `@lh-ui/react` is a named import — use it on demand, which is also friendlier to tree-shaking. For global configuration, wrap your app in the `LhConfigProvider` component.

## Why are styles not injected automatically?

An on-demand strategy aligned with `@lh-ui/vue2`: the package entry injects no full-stylesheet side effect; users explicitly import `@lh-ui/react/theme.css` and `@lh-ui/react/style/<name>`. The reasoning is that on-demand import is the mainstream in the React ecosystem, and a full side effect would break tree-shaking.

## Why does `onChange` take two arguments?

The two-argument `(value, event)` design mirrors lh-ui-plus's `emit('change', [val, e])`, which eases migration from Vue and keeps the ability to reach the native event.

## Why not use floating-ui for overlay positioning?

Family red line: overlay geometry is implemented in `@lh-ui/share/core/shared/popper`, and every platform shares the same logic and edge-case handling (flipping, overflow collapse, arrows). Pulling in a third-party library would cause behavior drift between platforms.

## Why not use react-transition-group for transitions?

Same reason. `useTransition` is an in-house mounted + phase state machine whose class names match the share SCSS exactly (`*-enter-from` / `*-enter-active` / `*-enter-to`), and it is StrictMode safe.

## Why is Dialog purely controlled?

`open` is held entirely by external state; every close path (mask click / Esc / close button) only calls `onClose`. lh-ui-plus keeps an internal `isVisible` intermediate state synced with a `watch`; the React version drops that layer: the controlled semantics are purer, and the race between props and internal state is gone.

## With multiple Dialogs open, why does Esc only close one?

`useLhOverlayStack` maintains the open-order stack; Esc only closes the topmost overlay. This is required by the APG dialog pattern, so one keypress cannot dismiss every overlay at once.

## Do imperative services create multiple React roots?

No. Services like `message` share one lazily created singleton container root — it is created on first call, appended to body, and the component's internal state manages the message queue. `destroyContainer()` explicitly calls `root.unmount()`.

## What happens if I call `message` during SSR?

It only logs a development warning and no-ops, creating no DOM. All DOM operations live inside `useEffect` / `useIsomorphicLayoutEffect`, and `useLhLocale` provides a consistent SSR snapshot via `useSyncExternalStore`.

## Why `forwardRef` instead of a `ref` prop?

Both React 18 and 19 are supported. React 19's ref-as-prop does not exist on 18, and `forwardRef` is the common superset of both versions. Focusable components (button / input / select / dialog / tooltip) all forward refs.

## Can I use it alongside lh-ui-plus in the same project?

Yes — the class names and tokens are identical, so the styles do not conflict. It is usually unnecessary, though, since they are two framework shapes of the same set of components. If you mix them during a gradual migration, make sure the `@lh-ui/share` version ranges of the two libraries are compatible.

## What is not implemented in the first release?

P1/P2 components (Popover, Drawer, Dropdown, Table, etc.) are not implemented. The three imperative services (`message` / `notification` / `loading`) are all fully implemented.
