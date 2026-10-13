import { LhButton, useLhLocale } from '@lh-ui/react'

export default function ButtonBasic() {
  const { t } = useLhLocale()

  return (
    <>
      <LhButton>{t('docs.button.default')}</LhButton>
      <LhButton type="primary">{t('docs.button.primary')}</LhButton>
      <LhButton type="success">{t('docs.button.success')}</LhButton>
      <LhButton type="warning">{t('docs.button.warning')}</LhButton>
      <LhButton type="danger">{t('docs.button.danger')}</LhButton>
      <LhButton type="info">{t('docs.button.info')}</LhButton>
    </>
  )
}
