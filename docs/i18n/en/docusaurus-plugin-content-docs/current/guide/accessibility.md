# Accessibility

`@lh-ui/react` shares one accessibility contract with the rest of the family: semantic tags, ARIA attributes, and keyboard interactions are all defined inside `@lh-ui/share/core`, so every platform implements them identically. This library additionally makes sure the common a11y pitfalls of the React ecosystem do not appear.

## Semantics and ARIA

- **`LhSwitch`** renders `<div role="switch" aria-checked>` instead of a visually disguised checkbox
- **`LhSelect`** uses `role="combobox"` for the trigger, `role="listbox"` for the expanded panel, `role="option"` for items, and `aria-activedescendant` to sync the keyboard highlight
- **`LhDialog`** uses `role="dialog" aria-modal`; the title provides both an `aria-label` fallback and a precise `aria-labelledby` association
- **`LhTooltip`** associates the tip with the trigger through `aria-describedby`
- **`LhTag`** upgrades to `role="button"` when clickable and responds to Enter / Space
- **`LhFormItem`** renders a `role="alert"` error message on failed validation and sets `aria-invalid`

## Keyboard interaction

| Component | Keys |
| --- | --- |
| `LhButton` / `LhTag` | Enter / Space triggers a click |
| `LhSwitch` | Enter / Space toggles |
| `LhSelect` | ArrowUp / ArrowDown highlights an option, Enter selects, Escape collapses |
| `LhDialog` | Escape closes (only the topmost overlay responds) |
| `LhTooltip` | Escape closes |

When multiple overlays stack, `useLhOverlayStack` maintains the open order; Escape only closes the topmost one, so a single keypress cannot dismiss every overlay at once.

## Focus management

- **`LhDialog`** uses `useLhFocusTrap` on open to keep focus inside the dialog (Tab / Shift+Tab cannot escape); on close, focus returns to the trigger
- **`LhFormItem`** focuses the first focusable element of the content area when the label is clicked (`focusControl`), because native label-wrapping behavior is unreliable on composite controls

## Decorative icons

`LhIcon` is `decorative` by default: it outputs `aria-hidden="true"` and is invisible to screen readers. When it carries meaning, pass `decorative={false}` + `ariaLabel`:

```tsx
<LhIcon name="search" decorative={false} ariaLabel="Search" />
```

It then renders `<svg role="img" aria-label="Search">`.

## StrictMode safety

Every component is safe under React StrictMode: effect cleanups and remounts are idempotent (overlay stack register / unregister, scroll-lock ownership checks, focus trap release).

## Family consistency

Accessibility behavior is registered in `docs/设计语言基线.md` as the unified contract of both bloodlines (web / native). Every platform implements the same `@lh-ui/share/core` logic, so ARIA attributes and key semantics stay consistent.
