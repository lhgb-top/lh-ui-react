import { useState } from 'react'
import { LhCheckbox, LhCheckboxGroup, useLhLocale } from '@lh-ui/react'

export default function CheckboxBasic() {
  const [checked, setChecked] = useState(false)
  const [group, setGroup] = useState<string[]>(['ink'])
  const { t } = useLhLocale()

  return (
    <div className="demo-col">
      <LhCheckbox checked={checked} onChange={(val) => setChecked(val)}>
        {t('docs.checkbox.single')}
        {checked ? t('docs.checkbox.checked') : t('docs.checkbox.unchecked')}
      </LhCheckbox>
      <LhCheckboxGroup value={group} onChange={(val) => setGroup(val as string[])}>
        <LhCheckbox value="ink">{t('docs.common.ink')}</LhCheckbox>
        <LhCheckbox value="danqing">{t('docs.common.danqing')}</LhCheckbox>
        <LhCheckbox value="blank">{t('docs.common.blank')}</LhCheckbox>
        <LhCheckbox value="gongbi" disabled>
          {t('docs.checkbox.gongbiDisabled')}
        </LhCheckbox>
      </LhCheckboxGroup>
      <p>
        {t('docs.common.selected')}
        {group.join(t('docs.common.listSeparator')) || t('docs.common.none')}
      </p>
    </div>
  )
}
