import { useState } from 'react'
import { LhTabs, LhTabPane, useLhLocale } from '@lh-ui/react'

export default function TabsBasic() {
  const [value, setValue] = useState('ink')
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <LhTabs value={value} onChange={(name) => setValue(name)}>
        <LhTabPane name="ink" label={t('docs.common.ink')}>
          {t('docs.tabs.inkContent')}
        </LhTabPane>
        <LhTabPane name="danqing" label={t('docs.common.danqing')}>
          {t('docs.tabs.danqingContent')}
        </LhTabPane>
        <LhTabPane name="blank" label={t('docs.common.blank')} disabled>
          {t('docs.tabs.blankContent')}
        </LhTabPane>
      </LhTabs>

      <LhTabs type="card" defaultValue="gongbi">
        <LhTabPane name="gongbi" label={t('docs.common.gongbi')}>
          {t('docs.tabs.gongbiContent')}
        </LhTabPane>
        <LhTabPane name="xieyi" label={t('docs.tabs.xieyiLabel')}>
          {t('docs.tabs.xieyiContent')}
        </LhTabPane>
      </LhTabs>
    </div>
  )
}
