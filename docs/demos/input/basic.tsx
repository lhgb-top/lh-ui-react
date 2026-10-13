import { useState } from 'react'
import { LhInput, useLhLocale } from '@lh-ui/react'

export default function InputBasic() {
  const [value, setValue] = useState('')
  const { t } = useLhLocale()

  return (
    <div className="demo-col" style={{ width: '320px' }}>
      <LhInput value={value} onChange={(val) => setValue(val)} placeholder={t('docs.input.controlledPlaceholder')} />
      <p>
        {t('docs.common.currentValue')}
        {value || t('docs.common.empty')}
      </p>
    </div>
  )
}
