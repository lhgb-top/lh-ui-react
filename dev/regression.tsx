/**
 * 回归测试区：把 docs/demos 下的全部 demo 逐一铺在同一页上，
 * 供浏览器逐区做用户视角的交互回归。
 *
 * demo 文件本身只依赖 @lh-ui/react（dev alias 解析到 src/ 源码），
 * 直接引入即可，不为测试重写场景。样式 import 与 App.tsx 保持一致。
 *
 * 顶层挂一个错误收集器：除页面 JS 异常外，还拦截 console.error，
 * 把 React 开发期警告（key / props / effect deps 等）一并收进 window.__errs，
 * 每个测试区结束后读取核对。
 */
import { createRoot } from 'react-dom/client'

import './sandbox.css'

import '@lh-ui/share/styles/theme/common/var.scss'
import '@lh-ui/share/styles/button'
import '@lh-ui/share/styles/icon'
import '@lh-ui/share/styles/tag'
import '@lh-ui/share/styles/input'
import '@lh-ui/share/styles/select'
import '@lh-ui/share/styles/checkbox'
import '@lh-ui/share/styles/radio'
import '@lh-ui/share/styles/switch'
import '@lh-ui/share/styles/form'
import '@lh-ui/share/styles/dialog'
import '@lh-ui/share/styles/tooltip'
import '@lh-ui/share/styles/message'
import '@lh-ui/share/styles/notification'
import '@lh-ui/share/styles/loading'
import '@lh-ui/share/styles/popover'
import '@lh-ui/share/styles/popconfirm'
import '@lh-ui/share/styles/drawer'
import '@lh-ui/share/styles/dropdown'

import ButtonBasic from '../docs/demos/button/basic'
import ButtonSize from '../docs/demos/button/size'
import CheckboxBasic from '../docs/demos/checkbox/basic'
import ConfigProviderBasic from '../docs/demos/config-provider/basic'
import DialogBasic from '../docs/demos/dialog/basic'
import FormBasic from '../docs/demos/form/basic'
import IconBasic from '../docs/demos/icon/basic'
import InputBasic from '../docs/demos/input/basic'
import InputFeatures from '../docs/demos/input/features'
import LoadingBasic from '../docs/demos/loading/basic'
import MessageBasic from '../docs/demos/message/basic'
import NotificationBasic from '../docs/demos/notification/basic'
import PopconfirmBasic from '../docs/demos/popconfirm/basic'
import PopoverBasic from '../docs/demos/popover/basic'
import DrawerBasic from '../docs/demos/drawer/basic'
import DropdownBasic from '../docs/demos/dropdown/basic'
import RadioBasic from '../docs/demos/radio/basic'
import SelectBasic from '../docs/demos/select/basic'
import SwitchBasic from '../docs/demos/switch/basic'
import TagBasic from '../docs/demos/tag/basic'
import TooltipBasic from '../docs/demos/tooltip/basic'

// 错误收集（在组件挂载前挂好，首批渲染的警告才不会漏）
;(globalThis as Record<string, unknown>).__errs = [] as string[]
const errs: string[] = (globalThis as Record<string, unknown>).__errs as string[]
window.addEventListener('error', (e) => errs.push(`[error] ${e.message}`))
window.addEventListener('unhandledrejection', (e) =>
  errs.push(`[rejection] ${String(e.reason)}`),
)
const rawConsoleError = console.error
console.error = (...args: unknown[]) => {
  errs.push(`[console.error] ${args.map(String).join(' ')}`)
  rawConsoleError(...args)
}

interface Section {
  title: string
  Demo: React.ComponentType
}

const sections: Section[] = [
  { title: 'button/basic', Demo: ButtonBasic },
  { title: 'button/size', Demo: ButtonSize },
  { title: 'icon/basic', Demo: IconBasic },
  { title: 'tag/basic', Demo: TagBasic },
  { title: 'input/basic', Demo: InputBasic },
  { title: 'input/features', Demo: InputFeatures },
  { title: 'select/basic', Demo: SelectBasic },
  { title: 'checkbox/basic', Demo: CheckboxBasic },
  { title: 'radio/basic', Demo: RadioBasic },
  { title: 'switch/basic', Demo: SwitchBasic },
  { title: 'form/basic', Demo: FormBasic },
  { title: 'dialog/basic', Demo: DialogBasic },
  { title: 'tooltip/basic', Demo: TooltipBasic },
  { title: 'message/basic', Demo: MessageBasic },
  { title: 'notification/basic', Demo: NotificationBasic },
  { title: 'loading/basic', Demo: LoadingBasic },
  { title: 'popover/basic', Demo: PopoverBasic },
  { title: 'popconfirm/basic', Demo: PopconfirmBasic },
  { title: 'drawer/basic', Demo: DrawerBasic },
  { title: 'dropdown/basic', Demo: DropdownBasic },
  { title: 'config-provider/basic', Demo: ConfigProviderBasic },
]

function RegressionApp() {
  return (
    <>
      <header className="sandbox-header">
        <h1>lh-ui-react 回归测试区</h1>
        <p>docs/demos 全部场景同页铺开，逐区做用户视角交互回归。</p>
      </header>
      {sections.map(({ title, Demo }) => (
        <section className="sandbox-section" key={title} data-section={title}>
          <h2>{title}</h2>
          <Demo />
        </section>
      ))}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<RegressionApp />)
