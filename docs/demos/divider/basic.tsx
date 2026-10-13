import { LhDivider, useLhLocale } from '@lh-ui/react'

export default function DividerBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <span>{t('docs.divider.verse1')}</span>
      <LhDivider />
      <span>{t('docs.divider.verse2')}</span>
      <LhDivider dashed />
      <LhDivider labelPosition="left">{t('docs.divider.leftGroup')}</LhDivider>
      <LhDivider labelPosition="right">{t('docs.divider.rightGroup')}</LhDivider>
      <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
        <span>{t('docs.divider.vertical')}</span>
        <LhDivider direction="vertical" />
        <span>{t('docs.divider.split')}</span>
      </div>
      <div style={{ height: 120, display: 'flex', alignItems: 'center' }}>
        <span>{t('docs.divider.top')}</span>
        <LhDivider direction="vertical">{t('docs.common.ink')}</LhDivider>
        <span>{t('docs.divider.bottom')}</span>
      </div>
    </div>
  )
}
