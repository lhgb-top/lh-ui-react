import { useState } from 'react'
import { LhSteps, LhStep, useLhLocale } from '@lh-ui/react'

export default function StepsBasic() {
  const [current, setCurrent] = useState(1)
  const { t } = useLhLocale()

  return (
    <div className="demo-column">
      <LhSteps current={current} clickable onChange={(index) => setCurrent(index)}>
        <LhStep title={t('docs.steps.step1Title')} description={t('docs.steps.step1Desc')} />
        <LhStep title={t('docs.steps.step2Title')} description={t('docs.steps.step2Desc')} />
        <LhStep title={t('docs.steps.step3Title')} description={t('docs.steps.step3Desc')} />
        <LhStep title={t('docs.steps.step4Title')} description={t('docs.steps.step4Desc')} />
      </LhSteps>

      <LhSteps current={2} status="error">
        <LhStep title={t('docs.steps.step1Title')} />
        <LhStep title={t('docs.steps.step2Title')} />
        <LhStep title={t('docs.steps.step3Title')} description={t('docs.steps.errorDesc')} />
        <LhStep title={t('docs.steps.step4Title')} />
      </LhSteps>

      <LhSteps current={1} direction="vertical">
        <LhStep title={t('docs.steps.step1Title')} description={t('docs.steps.step1Desc')} />
        <LhStep title={t('docs.steps.step2Title')} description={t('docs.steps.step2Desc')} />
        <LhStep title={t('docs.steps.step3Title')} />
        <LhStep title={t('docs.steps.step4Title')} />
      </LhSteps>
    </div>
  )
}
