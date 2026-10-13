/**
 * 侧边栏配置
 *
 * 分组沿用家族约定（与 lh-ui-plus / lh-ui-vue2 的组件分组一致）。
 * 中英双语标签在 navbar 的 localeDropdown 切换时由 i18n JSON 目录提供。
 */
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const config: SidebarsConfig = {
  // 指南：手动维护顺序（安装在前）
  guide: [
    {
      type: 'category',
      label: '指南',
      collapsed: false,
      items: [
        'guide/installation',
        'guide/quickstart',
        'guide/theme-customization',
        'guide/theme-studio',
        'guide/themes',
        'guide/i18n',
        'guide/accessibility',
        'guide/migration',
        'guide/faq',
      ],
    },
  ],

  // 组件：四组家族约定分组
  components: [
    {
      type: 'category',
      label: '基础组件',
      collapsed: false,
      items: [
        'components/config-provider',
        'components/button',
        'components/icon',
        'components/tag',
        'components/divider',
        'components/space',
        'components/card',
      ],
    },
    {
      type: 'category',
      label: '导航组件',
      collapsed: false,
      items: [
        'components/breadcrumb',
        'components/pagination',
        'components/dropdown',
        'components/tabs',
        'components/steps',
      ],
    },
    {
      type: 'category',
      label: '表单组件',
      collapsed: false,
      items: [
        'components/input',
        'components/select',
        'components/checkbox',
        'components/radio',
        'components/switch',
        'components/form',
      ],
    },
    {
      type: 'category',
      label: '反馈组件',
      collapsed: false,
      items: [
        'components/dialog',
        'components/drawer',
        'components/tooltip',
        'components/popover',
        'components/popconfirm',
        'components/alert',
        'components/empty',
        'components/skeleton',
        'components/message',
        'components/notification',
        'components/loading',
      ],
    },
  ],
}

export default config
