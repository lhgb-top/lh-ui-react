import { LhButton, LhTooltip, useLhLocale } from '@lh-ui/react'

export default function TooltipBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhTooltip content={t('docs.tooltip.topContent')} placement="top">
        <LhButton>{t('docs.tooltip.topBtn')}</LhButton>
      </LhTooltip>
      <LhTooltip content={t('docs.tooltip.bottomContent')} placement="bottom">
        <LhButton>{t('docs.tooltip.bottomBtn')}</LhButton>
      </LhTooltip>
      <LhTooltip content={t('docs.tooltip.clickContent')} trigger="click">
        <LhButton>{t('docs.tooltip.clickBtn')}</LhButton>
      </LhTooltip>
      <LhTooltip content={t('docs.tooltip.semanticContent')} type="success">
        <LhButton>{t('docs.tooltip.semanticBtn')}</LhButton>
      </LhTooltip>
    </div>
  )
}
