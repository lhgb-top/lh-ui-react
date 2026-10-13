/**
 * Navbar item 类型注册表（swizzle @theme/NavbarItem/ComponentTypes）。
 *
 * Docusaurus 运行时按 navbar items 的完整 type 字符串查本表取组件
 * （@theme/NavbarItem 的 normalizeComponentType + ComponentTypes[componentType]）；
 * 配置校验还要求自定义类型以 custom- 开头（@docusaurus/theme-classic 的
 * CustomNavbarItemRegexp），故 docusaurus.config.ts 写 custom-presetThemeSwitcher，
 * 本表注册同名键。不注册时运行时会抛「No NavbarItem component found for type」。
 *
 * 注意：不能 `import ComponentTypes from '@theme/NavbarItem/ComponentTypes'`
 * 再展开——该别名会被 createThemeAliases 解析回本文件自身，形成自引用，
 * SSR 时 default 导出在初始化前被访问，抛
 * `Cannot access '__WEBPACK_DEFAULT_EXPORT__' before initialization`。
 * 正确做法是逐个引入各原始子组件（这些路径未 swizzle，解析到 theme-classic）再组装。
 */
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem'
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem'
import LocaleDropdownNavbarItem from '@theme/NavbarItem/LocaleDropdownNavbarItem'
import SearchNavbarItem from '@theme/NavbarItem/SearchNavbarItem'
import HtmlNavbarItem from '@theme/NavbarItem/HtmlNavbarItem'
import DocNavbarItem from '@theme/NavbarItem/DocNavbarItem'
import DocSidebarNavbarItem from '@theme/NavbarItem/DocSidebarNavbarItem'
import DocsVersionNavbarItem from '@theme/NavbarItem/DocsVersionNavbarItem'
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem'
import PresetThemeSwitcher from './PresetThemeSwitcher'

export default {
  default: DefaultNavbarItem,
  dropdown: DropdownNavbarItem,
  localeDropdown: LocaleDropdownNavbarItem,
  search: SearchNavbarItem,
  html: HtmlNavbarItem,
  doc: DocNavbarItem,
  docSidebar: DocSidebarNavbarItem,
  docsVersion: DocsVersionNavbarItem,
  docsVersionDropdown: DocsVersionDropdownNavbarItem,
  'custom-presetThemeSwitcher': PresetThemeSwitcher,
}
