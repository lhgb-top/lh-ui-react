import { notification, LhButton, useLhLocale } from '@lh-ui/react'

export default function NotificationBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhButton onClick={() => notification.info({ title: t('docs.notification.infoTitle') })}>
        {t('docs.notification.infoBtn')}
      </LhButton>
      <LhButton
        onClick={() =>
          notification.success({
            title: t('docs.notification.successTitle'),
            content: t('docs.notification.successContent'),
          })
        }
      >
        {t('docs.notification.successBtn')}
      </LhButton>
      <LhButton
        onClick={() =>
          notification.warning({
            title: t('docs.notification.warningTitle'),
            content: t('docs.notification.warningContent'),
            position: 'bottom-right',
          })
        }
      >
        {t('docs.notification.warningBtn')}
      </LhButton>
      <LhButton
        onClick={() =>
          notification.danger({
            title: t('docs.notification.dangerTitle'),
            content: t('docs.notification.dangerContent'),
            duration: 0,
          })
        }
      >
        {t('docs.notification.dangerBtn')}
      </LhButton>
    </div>
  )
}
