import { useState } from 'react'
import { LhButton, LhDialog, useLhLocale } from '@lh-ui/react'

export default function DialogBasic() {
  const [open, setOpen] = useState(false)
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhButton type="primary" onClick={() => setOpen(true)}>
        {t('docs.dialog.open')}
      </LhButton>
      <LhDialog
        open={open}
        title={t('docs.dialog.title')}
        width="420px"
        footer={
          <>
            <LhButton onClick={() => setOpen(false)}>{t('docs.common.cancel')}</LhButton>
            <LhButton type="primary" onClick={() => setOpen(false)}>
              {t('docs.common.confirm')}
            </LhButton>
          </>
        }
        onClose={() => setOpen(false)}
      >
        <p>{t('docs.dialog.controlled')}</p>
        <p>{t('docs.dialog.noIntermediate')}</p>
      </LhDialog>
    </div>
  )
}
