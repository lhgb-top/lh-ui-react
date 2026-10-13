import { useState } from 'react'
import { message, LhButton, LhPopconfirm, useLhLocale } from '@lh-ui/react'

export default function PopconfirmBasic() {
  const [count, setCount] = useState(0)
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhPopconfirm
        title={t('docs.popconfirm.defaultTitle')}
        onConfirm={() => message.success(t('docs.popconfirm.confirmed'))}
      >
        <LhButton>{t('docs.popconfirm.defaultBtn')}</LhButton>
      </LhPopconfirm>
      <LhPopconfirm
        title={t('docs.popconfirm.dangerTitle')}
        type="danger"
        confirmText={t('docs.popconfirm.confirmText')}
        onConfirm={() => message.error(t('docs.popconfirm.deleted'))}
      >
        <LhButton type="danger">{t('docs.popconfirm.dangerBtn')}</LhButton>
      </LhPopconfirm>
      <LhPopconfirm
        title={t('docs.popconfirm.countTitle')}
        type="info"
        onConfirm={() => setCount((value) => value + 1)}
      >
        <LhButton type="primary">{t('docs.popconfirm.countBtn')}</LhButton>
      </LhPopconfirm>
      <span>{t('docs.popconfirm.countLabel', { count })}</span>
    </div>
  )
}
