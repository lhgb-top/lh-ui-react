import { useRef, useState } from 'react'
import { LhButton, LhForm, LhFormItem, LhInput, LhSelect, useLhLocale } from '@lh-ui/react'
import type { LhFormInstance, LhFormRule } from '@lh-ui/react'

interface FormDemoData {
  [key: string]: unknown
  name: string
  style: string
}

export default function FormBasic() {
  const [formData, setFormData] = useState<FormDemoData>({ name: '', style: '' })
  const formRef = useRef<LhFormInstance>(null)
  const { t } = useLhLocale()

  const rules: Record<string, LhFormRule[]> = {
    name: [{ required: true, message: t('docs.form.nameRequired'), trigger: 'blur' }],
    style: [{ required: true, message: t('docs.form.styleRequired'), trigger: 'change' }],
  }

  const handleSubmit = async () => {
    const valid = await formRef.current?.validate()
    if (valid) {
      alert(t('docs.form.submitSuccess', { name: formData.name, style: formData.style }))
    }
  }

  const handleReset = () => {
    formRef.current?.resetFields()
    setFormData({ name: '', style: '' })
  }

  return (
    <LhForm
      ref={formRef}
      model={formData}
      rules={rules}
      labelWidth="80px"
      sx={{ width: '360px' }}
    >
      <LhFormItem label={t('docs.form.nameLabel')} prop="name">
        <LhInput
          value={formData.name}
          onChange={(val) => setFormData((prev) => ({ ...prev, name: val }))}
          placeholder={t('docs.form.namePlaceholder')}
        />
      </LhFormItem>
      <LhFormItem label={t('docs.form.styleLabel')} prop="style">
        <LhSelect
          value={formData.style}
          onChange={(val) => setFormData((prev) => ({ ...prev, style: val as string }))}
          placeholder={t('docs.form.stylePlaceholder')}
          options={[
            { label: t('docs.common.ink'), value: 'ink' },
            { label: t('docs.common.danqing'), value: 'danqing' },
            { label: t('docs.common.gongbi'), value: 'gongbi' },
          ]}
        />
      </LhFormItem>
      <LhFormItem>
        <LhButton type="primary" onClick={handleSubmit}>
          {t('docs.form.submit')}
        </LhButton>
        <LhButton onClick={handleReset}>{t('docs.form.reset')}</LhButton>
      </LhFormItem>
    </LhForm>
  )
}
