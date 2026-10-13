/**
 * @lh-ui/react —— lh-ui 家族 web 血脉的 React UI 层
 *
 * 唯一运行时依赖 @lh-ui/share：组件纯逻辑（core）、样式（styles）、主题（theme）、
 * 文案（locales）全部来自 share，本库只写响应式胶水、JSX 与命令式服务。
 *
 * 样式按需引入（与 lh-ui/vue2 对齐，不在本文件注入全量样式）：
 *
 * ```ts
 * import '@lh-ui/react/theme.css'          // 主题变量（必需）
 * import '@lh-ui/react/style/button'       // 组件样式（按需）
 * import '@lh-ui/react/theme-dark.css'     // 暗色预设（可选）
 * ```
 *
 * 无 install 机制：全部为命名导出，按需引入即可。
 */

// ── 组件 ────────────────────────────────────────────────────────────────
export {
  LhConfigProvider,
  useLhConfigProvider,
  useLhConfigContext,
  LhConfigContext,
  type LhConfigProviderProps,
  type LhConfigContextValue,
  type LhThemeableComponent,
} from './components/config-provider'

export { LhButton, useLhButton, type LhButtonProps, type LhButtonType, type LhButtonSize } from './components/button'

export { LhIcon, useLhIcon, type LhIconProps, type LhIconSize } from './components/icon'

export { LhTag, useLhTag, type LhTagProps, type LhTagSize } from './components/tag'

export {
  LhCheckbox,
  LhCheckboxGroup,
  useLhCheckbox,
  useLhCheckboxGroup,
  LhCheckboxGroupContext,
  type LhCheckboxProps,
  type LhCheckboxSize,
  type LhCheckboxGroupProps,
  type LhCheckboxGroupContextValue,
} from './components/checkbox'

export {
  LhRadio,
  LhRadioGroup,
  useLhRadio,
  useLhRadioGroup,
  LhRadioGroupContext,
  type LhRadioProps,
  type LhRadioSize,
  type LhRadioGroupProps,
  type LhRadioGroupContextValue,
} from './components/radio'

export { LhSwitch, useLhSwitch, type LhSwitchProps, type LhSwitchSize } from './components/switch'

export {
  LhInput,
  useLhInput,
  LH_INPUT_TYPE_CONST,
  type LhInputProps,
  type LhInputSize,
  type LhInputType,
} from './components/input'

export {
  LhForm,
  LhFormItem,
  useLhForm,
  useLhFormItem,
  LhFormContext,
  LhFormItemContext,
  DEFAULT_FORM_CONTEXT,
  DEFAULT_FORM_ITEM_CONTEXT,
  type LhFormProps,
  type LhFormItemProps,
  type LhFormContextValue,
  type LhFormItemContextValue,
  type LhFormInstance,
  type LhFormItemInstance,
  type LhFormLabelPosition,
  type LhFormRule,
} from './components/form'

export {
  LhSelect,
  useLhSelect,
  type LhSelectProps,
  type LhSelectSize,
  type LhSelectInstance,
  type LhSelectOption,
} from './components/select'

export {
  LhDialog,
  useLhDialog,
  DIALOG_TRANSITION_DURATION,
  type LhDialogProps,
  type LhDialogPosition,
  type LhDialogInstance,
} from './components/dialog'

export {
  LhTooltip,
  useLhTooltip,
  TOOLTIP_TRANSITION_DURATION,
  type LhTooltipProps,
  type LhTooltipPlacement,
  type LhTooltipTrigger,
  type LhTooltipEffect,
  type LhTooltipType,
  type LhTooltipInstance,
} from './components/tooltip'

// ── Wave A：布局与反馈基础件 ────────────────────────────────────────────
export {
  LhDivider,
  useLhDivider,
  type LhDividerProps,
  type LhDividerDirection,
  type LhDividerLabelPosition,
} from './components/divider'

export {
  LhSpace,
  useLhSpace,
  type LhSpaceProps,
  type LhSpaceAlignment,
  type LhSpaceSizeInput,
} from './components/space'

export {
  LhCard,
  useLhCard,
  type LhCardProps,
  type LhCardShadow,
} from './components/card'

export { LhEmpty, useLhEmpty, type LhEmptyProps } from './components/empty'

export {
  LhSkeleton,
  LhSkeletonItem,
  useLhSkeleton,
  useLhSkeletonItem,
  type LhSkeletonProps,
  type LhSkeletonItemProps,
  type LhSkeletonVariant,
} from './components/skeleton'

export { LhAlert, useLhAlert, type LhAlertProps, type LhAlertType } from './components/alert'

// ── Wave B：导航组件 ────────────────────────────────────────────────────
export {
  LhBreadcrumb,
  LhBreadcrumbItem,
  useLhBreadcrumb,
  LhBreadcrumbContext,
  type LhBreadcrumbProps,
  type LhBreadcrumbItemProps,
  type LhBreadcrumbContextValue,
} from './components/breadcrumb'

export {
  LhPagination,
  useLhPagination,
  type LhPaginationProps,
  type LhPaginationRangeItem,
  type LhPaginationRangeItemType,
} from './components/pagination'

export {
  LhTabs,
  LhTabPane,
  useLhTabs,
  LhTabsContext,
  type LhTabsProps,
  type LhTabPaneProps,
  type LhTabsContextValue,
  type LhTabsType,
  type LhTabsPosition,
} from './components/tabs'

export {
  LhSteps,
  LhStep,
  useLhSteps,
  LhStepsContext,
  type LhStepsProps,
  type LhStepProps,
  type LhStepsContextValue,
  type LhStepsDirection,
  type LhStepStatus,
} from './components/steps'

// ── Wave C：浮层与反馈组件 ──────────────────────────────────────────────
export {
  LhPopover,
  useLhPopover,
  POPOVER_TRANSITION_DURATION,
  type LhPopoverProps,
  type LhPopoverPlacement,
  type LhPopoverInstance,
} from './components/popover'

export {
  LhPopconfirm,
  useLhPopconfirm,
  POPCONFIRM_TRANSITION_DURATION,
  type LhPopconfirmProps,
  type LhPopconfirmPlacement,
  type LhPopconfirmInstance,
} from './components/popconfirm'

export {
  LhDrawer,
  useLhDrawer,
  DRAWER_TRANSITION_DURATION,
  type LhDrawerProps,
  type LhDrawerInstance,
} from './components/drawer'

export {
  LhDropdown,
  LhDropdownItem,
  useLhDropdown,
  LhDropdownContext,
  DROPDOWN_TRANSITION_DURATION,
  type LhDropdownProps,
  type LhDropdownItemProps,
  type LhDropdownInstance,
  type LhDropdownContextValue,
  type LhDropdownPlacement,
  type LhDropdownTrigger,
} from './components/dropdown'

// ── Hooks ───────────────────────────────────────────────────────────────
export {
  useIsomorphicLayoutEffect,
  useLhNamespace,
  useLhSize,
  useLhDisabled,
  useLhComponentTheme,
  useLhTheme,
  useLhPresetTheme,
  useLhZIndex,
  useLhOverlayStack,
  useLhBreakpoint,
  useControlled,
  useTransition,
  useLhPopper,
  useLhClickOutside,
  useLhFocusTrap,
  useLhTrigger,
  type LhThemeType,
  type LhTransitionPhase,
  type UseLhPopperOptions,
  type UseLhClickOutsideOptions,
  type UseLhFocusTrapOptions,
  type LhTriggerType,
  type UseLhTriggerOptions,
} from './hooks'

// ── 国际化 ──────────────────────────────────────────────────────────────
export {
  useLhLocale,
  lhlocale,
  zhCN,
  enUS,
  type LhLocaleType,
  type LhLocaleMessages,
  type LhLocalePath,
  type LhTranslate,
  type LhTranslateArray,
} from './locale'

// ── 命令式服务 ──────────────────────────────────────────────────────────
export {
  message,
  notification,
  loading,
  destroyContainer,
  type LhMessageOptions,
  type LhNotificationOptions,
  type LhLoadingOptions,
} from './imperative'

// ── 主题与常量（转发 share，保 ./theme 与 ./constants 子路径） ──────────
export * from './theme'
export * from './constants'
