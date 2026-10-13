import { LhButton, LhConfigProvider, useLhLocale } from '@lh-ui/react'

export default function ConfigProviderBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-col">
      <LhConfigProvider size="large" themeVars={{ 'primary-color': '#722ed1' }}>
        <div className="demo-row">
          <LhButton type="primary">{t('docs.config-provider.largeCustom')}</LhButton>
        </div>
      </LhConfigProvider>
      <LhConfigProvider size="small">
        <div className="demo-row">
          <LhButton type="primary">{t('docs.config-provider.small')}</LhButton>
        </div>
      </LhConfigProvider>
    </div>
  )
}
