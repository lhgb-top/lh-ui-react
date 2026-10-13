import { LhCard, useLhLocale } from '@lh-ui/react'

export default function CardBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhCard title={t('docs.card.landscapeTitle')} sx={{ w: 300 }}>
        <p>{t('docs.card.landscapeText1')}</p>
        <p>{t('docs.card.landscapeText2')}</p>
      </LhCard>
      <LhCard title={t('docs.card.interactiveTitle')} clickable shadow="hover" sx={{ w: 300 }}>
        <p>{t('docs.card.interactiveText')}</p>
      </LhCard>
    </div>
  )
}
