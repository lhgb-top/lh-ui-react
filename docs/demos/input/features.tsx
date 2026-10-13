import { LhInput, useLhLocale } from '@lh-ui/react'

export default function InputFeatures() {
  const { t } = useLhLocale()

  return (
    <div className="demo-col" style={{ width: '320px' }}>
      <LhInput placeholder={t('docs.input.clearable')} clearable />
      <LhInput placeholder={t('docs.input.wordLimit')} maxlength={10} showWordLimit />
      <LhInput placeholder={t('docs.input.password')} type="password" />
      <LhInput placeholder={t('docs.input.passwordToggle')} type="password" showPassword />
      <LhInput
        placeholder={t('docs.input.textarea')}
        type="textarea"
        autosize={{ minRows: 2, maxRows: 4 }}
      />
    </div>
  )
}
