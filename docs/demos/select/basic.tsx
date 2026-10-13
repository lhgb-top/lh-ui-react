import { useState } from 'react'
import { LhSelect, useLhLocale } from '@lh-ui/react'
import type { LhSelectOption } from '@lh-ui/react'

export default function SelectBasic() {
  const [value, setValue] = useState<string>('')
  const { t } = useLhLocale()

  const options: LhSelectOption[] = [
    { label: t('docs.common.ink'), value: 'ink' },
    { label: t('docs.common.danqing'), value: 'danqing' },
    { label: t('docs.common.blank'), value: 'blank' },
    { label: t('docs.common.gongbi'), value: 'gongbi' },
  ]

  return (
    <div className="demo-col" style={{ width: '240px' }}>
      <LhSelect
        value={value}
        options={options}
        placeholder={t('docs.select.placeholder')}
        onChange={(val) => setValue(val as string)}
      />
      <p>
        {t('docs.common.currentValue')}
        {value || t('docs.common.unselected')}
      </p>
    </div>
  )
}
