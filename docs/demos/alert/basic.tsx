import { useState } from 'react'
import { LhAlert, LhButton, useLhLocale } from '@lh-ui/react'

export default function AlertBasic() {
  const [show, setShow] = useState(true)
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <LhAlert type="info" title={t('docs.alert.infoTitle')} showIcon>
        {t('docs.alert.infoText')}
      </LhAlert>
      <LhAlert type="success" title={t('docs.alert.successTitle')} showIcon closable>
        {t('docs.alert.successText')}
      </LhAlert>
      <LhAlert type="warning" title={t('docs.alert.warningTitle')} showIcon plain>
        {t('docs.alert.warningText')}
      </LhAlert>
      <LhAlert type="danger" showIcon closable>
        {t('docs.alert.dangerText')}
      </LhAlert>
      {show && (
        <LhAlert
          type="info"
          title={t('docs.alert.stateTitle')}
          showIcon
          closable
          onClose={() => setShow(false)}
        >
          {t('docs.alert.stateText')}
        </LhAlert>
      )}
      {!show && (
        <LhButton size="small" onClick={() => setShow(true)}>
          {t('docs.alert.reshow')}
        </LhButton>
      )}
    </div>
  )
}
