/**
 * dev 沙箱：本地冒烟预览 P0 组件
 *
 * 沙箱直接吃 src/ 源码（dev/vite.config.ts 的 alias），改组件即时热更新。
 * 样式从 share 的 SCSS 源引（本地联动 alias 指向同级仓），等价于用户侧的
 * `import '@lh-ui/react/theme.css'` + `import '@lh-ui/react/style/<name>'`。
 */
import { useRef, useState } from 'react'
import {
  LhButton,
  LhCheckbox,
  LhCheckboxGroup,
  LhConfigProvider,
  LhDialog,
  LhForm,
  LhFormItem,
  LhIcon,
  LhInput,
  LhRadio,
  LhRadioGroup,
  LhSelect,
  LhSwitch,
  LhTag,
  LhTooltip,
  message,
} from '@lh-ui/react'
import type { LhFormInstance, LhFormRule } from '@lh-ui/react'

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

interface SandboxFormData {
  [key: string]: unknown
  name: string
  style: string
}

const rules: Record<string, LhFormRule[]> = {
  name: [{ required: true, message: '请输入作品名称', trigger: 'blur' }],
  style: [{ required: true, message: '请选择画风', trigger: 'change' }],
}

function Sandbox() {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [radio, setRadio] = useState('ink')
  const [checkboxGroup, setCheckboxGroup] = useState<string[]>(['ink'])
  const [switchOn, setSwitchOn] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [formData, setFormData] = useState<SandboxFormData>({ name: '', style: '' })
  const formRef = useRef<LhFormInstance>(null)

  const handleSubmit = async () => {
    const valid = await formRef.current?.validate()
    if (valid) message.success(`提交成功：${formData.name} / ${formData.style}`)
  }

  return (
    <LhConfigProvider>
      <header className="sandbox-header">
        <h1>lh-ui-react dev 沙箱</h1>
        <p>本地冒烟预览 P0 十二组件。样式直接吃 share SCSS 源，组件直接吃 src/ 源码。</p>
      </header>

      <section className="sandbox-section">
        <h2>Button / Icon / Tag</h2>
        <div className="sandbox-row">
          <LhButton>默认</LhButton>
          <LhButton type="primary">主要</LhButton>
          <LhButton type="success">成功</LhButton>
          <LhButton type="warning">警告</LhButton>
          <LhButton type="danger">危险</LhButton>
          <LhButton type="primary" loading>
            加载中
          </LhButton>
          <LhButton type="primary" icon="search">
            图标
          </LhButton>
          <LhIcon name="search" color="var(--lh-primary-color, #1677ff)" />
          <LhTag>标签</LhTag>
          <LhTag type="primary" round>
            圆角
          </LhTag>
          <LhTag type="danger" closable onClose={() => message.info('标签已关闭')}>
            可关闭
          </LhTag>
        </div>
      </section>

      <section className="sandbox-section">
        <h2>Input</h2>
        <div className="sandbox-col" style={{ width: '320px' }}>
          <LhInput value={text} onChange={setText} placeholder="受控输入" clearable />
          <LhInput placeholder="密码框" type="password" />
          <LhInput placeholder="字数限制" maxlength={10} showWordLimit />
          <LhInput placeholder="多行自适应" type="textarea" autosize={{ minRows: 2, maxRows: 4 }} />
        </div>
      </section>

      <section className="sandbox-section">
        <h2>Select</h2>
        <div className="sandbox-col" style={{ width: '240px' }}>
          <LhSelect
            value={selectValue}
            onChange={(val) => setSelectValue(val as string)}
            placeholder="请选择画风"
            clearable
            options={[
              { label: '水墨', value: 'ink' },
              { label: '丹青', value: 'danqing' },
              { label: '留白', value: 'blank' },
              { label: '工笔', value: 'gongbi' },
            ]}
          />
        </div>
      </section>

      <section className="sandbox-section">
        <h2>Checkbox / Radio / Switch</h2>
        <div className="sandbox-col">
          <LhCheckbox checked={checked} onChange={setChecked}>
            单个复选框：{checked ? '已选' : '未选'}
          </LhCheckbox>
          <LhCheckboxGroup value={checkboxGroup} onChange={(v) => setCheckboxGroup(v as string[])}>
            <LhCheckbox value="ink">水墨</LhCheckbox>
            <LhCheckbox value="danqing">丹青</LhCheckbox>
            <LhCheckbox value="blank">留白</LhCheckbox>
          </LhCheckboxGroup>
          <LhRadioGroup value={radio} onChange={(v) => setRadio(v as string)}>
            <LhRadio value="ink">水墨</LhRadio>
            <LhRadio value="danqing">丹青</LhRadio>
            <LhRadio value="blank">留白</LhRadio>
          </LhRadioGroup>
          <div className="sandbox-row">
            <LhSwitch checked={switchOn} onChange={setSwitchOn} activeText="开" inactiveText="关" />
          </div>
        </div>
      </section>

      <section className="sandbox-section">
        <h2>Form</h2>
        <LhForm
          ref={formRef}
          model={formData}
          rules={rules}
          labelWidth="80px"
          sx={{ width: '360px' }}
        >
          <LhFormItem label="作品名称" prop="name">
            <LhInput
              value={formData.name}
              onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
              placeholder="请输入作品名称"
            />
          </LhFormItem>
          <LhFormItem label="画风" prop="style">
            <LhSelect
              value={formData.style}
              onChange={(val) => setFormData((prev) => ({ ...prev, style: val as string }))}
              placeholder="请选择画风"
              options={[
                { label: '水墨', value: 'ink' },
                { label: '丹青', value: 'danqing' },
                { label: '工笔', value: 'gongbi' },
              ]}
            />
          </LhFormItem>
          <LhFormItem>
            <LhButton type="primary" onClick={handleSubmit}>
              提交
            </LhButton>
            <LhButton onClick={() => formRef.current?.resetFields()}>重置</LhButton>
          </LhFormItem>
        </LhForm>
      </section>

      <section className="sandbox-section">
        <h2>Dialog / Tooltip / Message</h2>
        <div className="sandbox-row">
          <LhButton type="primary" onClick={() => setDialogOpen(true)}>
            打开对话框
          </LhButton>
          <LhTooltip content="上方提示" placement="top">
            <LhButton>hover 我</LhButton>
          </LhTooltip>
          <LhButton onClick={() => message.success('成功提示')}>成功 message</LhButton>
          <LhButton onClick={() => message.warning('警告提示')}>警告 message</LhButton>
        </div>
        <LhDialog
          open={dialogOpen}
          title="提示"
          width="420px"
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <LhButton onClick={() => setDialogOpen(false)}>取消</LhButton>
              <LhButton type="primary" onClick={() => setDialogOpen(false)}>
                确定
              </LhButton>
            </>
          }
        >
          <p>这是一个受控对话框：显隐完全由外部 state 驱动。</p>
        </LhDialog>
      </section>
    </LhConfigProvider>
  )
}

export default function App() {
  return <Sandbox />
}
