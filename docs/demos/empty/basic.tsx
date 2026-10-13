import { LhEmpty, LhButton, useLhLocale } from '@lh-ui/react'

export default function EmptyBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhEmpty />
      <LhEmpty
        description={t('docs.empty.customDescription')}
        actions={<LhButton type="primary">{t('docs.empty.reload')}</LhButton>}
      />
    </div>
  )
}
