import { message, LhButton, useLhLocale } from '@lh-ui/react'

export default function MessageBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhButton onClick={() => message.info(t('docs.message.infoText'))}>
        {t('docs.message.infoBtn')}
      </LhButton>
      <LhButton onClick={() => message.success(t('docs.message.successText'))}>
        {t('docs.message.successBtn')}
      </LhButton>
      <LhButton onClick={() => message.warning(t('docs.message.warningText'))}>
        {t('docs.message.warningBtn')}
      </LhButton>
      <LhButton onClick={() => message.error(t('docs.message.errorText'))}>
        {t('docs.message.errorBtn')}
      </LhButton>
      <LhButton onClick={() => message.loading(t('docs.message.loadingText'), { duration: 0 })}>
        {t('docs.message.persistentBtn')}
      </LhButton>
    </div>
  )
}
