import { message, LhButton, LhDropdown, LhDropdownItem, useLhLocale } from '@lh-ui/react'

export default function DropdownBasic() {
  const { t } = useLhLocale()

  return (
    <div className="demo-row">
      <LhDropdown
        onCommand={(command) => message.success(t('docs.dropdown.selected', { command }))}
        dropdown={
          <>
            <LhDropdownItem command={t('docs.dropdown.newItem')}>
              {t('docs.dropdown.newItem')}
            </LhDropdownItem>
            <LhDropdownItem command={t('docs.dropdown.edit')}>
              {t('docs.dropdown.edit')}
            </LhDropdownItem>
            <LhDropdownItem command={t('docs.dropdown.delete')} disabled>
              {t('docs.dropdown.deleteDisabled')}
            </LhDropdownItem>
            <LhDropdownItem command={t('docs.dropdown.export')} divided>
              {t('docs.dropdown.export')}
            </LhDropdownItem>
          </>
        }
      >
        <LhButton>{t('docs.dropdown.hover')}</LhButton>
      </LhDropdown>

      <LhDropdown
        trigger="click"
        onCommand={(command) => message.success(t('docs.dropdown.selected', { command }))}
        dropdown={
          <>
            <LhDropdownItem command={t('docs.dropdown.saveAs')}>
              {t('docs.dropdown.saveAs')}
            </LhDropdownItem>
            <LhDropdownItem command={t('docs.dropdown.print')}>
              {t('docs.dropdown.print')}
            </LhDropdownItem>
          </>
        }
      >
        <LhButton type="primary">{t('docs.dropdown.clickOpen')}</LhButton>
      </LhDropdown>
    </div>
  )
}
