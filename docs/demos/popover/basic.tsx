import { LhButton, LhPopover, useLhLocale } from '@lh-ui/react'

export default function PopoverBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhPopover title={t('docs.common.title')} content={t('docs.popover.topContent')} placement="top">
        <LhButton>{t('docs.popover.topBtn')}</LhButton>
      </LhPopover>
      <LhPopover
        title={t('docs.common.title')}
        content={t('docs.popover.clickContent')}
        placement="right"
        trigger="click"
      >
        <LhButton>{t('docs.popover.clickBtn')}</LhButton>
      </LhPopover>
      <LhPopover content={t('docs.popover.noTitleContent')} placement="bottom">
        <LhButton>{t('docs.popover.noTitleBtn')}</LhButton>
      </LhPopover>
      <LhPopover
        title={t('docs.common.title')}
        content={t('docs.popover.noArrowContent')}
        placement="left"
        arrow={false}
      >
        <LhButton>{t('docs.popover.noArrowBtn')}</LhButton>
      </LhPopover>
    </div>
  )
}
