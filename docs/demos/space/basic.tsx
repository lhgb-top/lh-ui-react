import { LhSpace, useLhLocale } from '@lh-ui/react'

export default function SpaceBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <LhSpace>
        <span>{t('docs.space.medium')}</span>
        <span>{t('docs.space.item')}</span>
        <span>{t('docs.space.item')}</span>
      </LhSpace>
      <LhSpace size="large">
        <span>{t('docs.space.large')}</span>
        <span>{t('docs.space.item')}</span>
        <span>{t('docs.space.item')}</span>
      </LhSpace>
      <LhSpace size={8}>
        <span>{t('docs.space.numeric')}</span>
        <span>{t('docs.space.item')}</span>
        <span>{t('docs.space.item')}</span>
      </LhSpace>
      <LhSpace direction="vertical">
        <span>{t('docs.space.vertical')}</span>
        <span>{t('docs.space.item')}</span>
        <span>{t('docs.space.item')}</span>
      </LhSpace>
    </div>
  )
}
