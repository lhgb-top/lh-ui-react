import { useState } from 'react'
import { LhSwitch, useLhLocale } from '@lh-ui/react'

export default function SwitchBasic() {
  const [active, setActive] = useState(false)
  const { t } = useLhLocale()

  return (
    <div className="demo-col">
      <div className="demo-row">
        <LhSwitch checked={active} onChange={(val) => setActive(val)} />
        <LhSwitch
          checked={active}
          activeText={t('docs.common.on')}
          inactiveText={t('docs.common.off')}
          onChange={(val) => setActive(val)}
        />
        <LhSwitch disabled />
        <LhSwitch loading />
      </div>
      <p>
        {t('docs.switch.statusPrefix')}
        {active ? t('docs.common.on') : t('docs.common.off')}
      </p>
    </div>
  )
}
