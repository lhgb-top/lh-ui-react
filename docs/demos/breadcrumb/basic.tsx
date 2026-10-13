import { LhBreadcrumb, LhBreadcrumbItem, useLhLocale } from '@lh-ui/react'

export default function BreadcrumbBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <LhBreadcrumb>
        <LhBreadcrumbItem to="/">{t('docs.common.home')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/components">{t('docs.breadcrumb.components')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/components/navigation">
          {t('docs.breadcrumb.navigation')}
        </LhBreadcrumbItem>
        <LhBreadcrumbItem>{t('docs.breadcrumb.breadcrumb')}</LhBreadcrumbItem>
      </LhBreadcrumb>

      <LhBreadcrumb separator="·">
        <LhBreadcrumbItem to="/">{t('docs.common.home')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/guide">{t('docs.breadcrumb.guide')}</LhBreadcrumbItem>
        <LhBreadcrumbItem>{t('docs.breadcrumb.customSeparator')}</LhBreadcrumbItem>
      </LhBreadcrumb>

      <LhBreadcrumb maxItems={3}>
        <LhBreadcrumbItem to="/">{t('docs.common.home')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/a">{t('docs.breadcrumb.firstLevel')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/b">{t('docs.breadcrumb.secondLevel')}</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/c">{t('docs.breadcrumb.thirdLevel')}</LhBreadcrumbItem>
        <LhBreadcrumbItem>{t('docs.breadcrumb.expandHint')}</LhBreadcrumbItem>
      </LhBreadcrumb>
    </div>
  )
}
