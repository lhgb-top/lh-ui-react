import { useState } from 'react'
import { LhRadio, LhRadioGroup, useLhLocale } from '@lh-ui/react'

export default function RadioBasic() {
  const [value, setValue] = useState('ink')
  const { t } = useLhLocale()

  return (
    <div className="demo-col">
      <LhRadioGroup value={value} onChange={(val) => setValue(val as string)}>
        <LhRadio value="ink">{t('docs.common.ink')}</LhRadio>
        <LhRadio value="danqing">{t('docs.common.danqing')}</LhRadio>
        <LhRadio value="blank">{t('docs.common.blank')}</LhRadio>
        <LhRadio value="gongbi" disabled>
          {t('docs.radio.gongbiDisabled')}
        </LhRadio>
      </LhRadioGroup>
      <p>
        {t('docs.common.selected')}
        {value}
      </p>
    </div>
  )
}
