import { useState } from 'react'
import { LhTag, useLhLocale } from '@lh-ui/react'

export default function TagBasic() {
  const { t } = useLhLocale()
  const [tags, setTags] = useState<string[]>(() => [
    t('docs.common.ink'),
    t('docs.tag.chineseStyle'),
    t('docs.tag.componentLibrary'),
  ])

  const handleClose = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag))
  }

  return (
    <div className="demo-row">
      <LhTag>{t('docs.tag.default')}</LhTag>
      <LhTag type="primary">{t('docs.tag.primary')}</LhTag>
      <LhTag type="success">{t('docs.tag.success')}</LhTag>
      <LhTag type="warning" round>
        {t('docs.tag.round')}
      </LhTag>
      <LhTag type="danger" hit>
        {t('docs.tag.hit')}
      </LhTag>
      {tags.map((tag) => (
        <LhTag key={tag} closable onClose={() => handleClose(tag)}>
          {tag}
        </LhTag>
      ))}
    </div>
  )
}
