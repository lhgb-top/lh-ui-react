import { useState } from 'react'
import { LhButton, LhDrawer, useLhLocale } from '@lh-ui/react'

export default function DrawerBasic() {
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<'right' | 'left' | 'top' | 'bottom'>('right')
  const { t } = useLhLocale()

  const openWith = (dir: typeof direction) => {
    setDirection(dir)
    setOpen(true)
  }

  // direction 字面量 → docs.common 方向文案键
  const dirKey = { right: 'dirRight', left: 'dirLeft', top: 'dirTop', bottom: 'dirBottom' }[
    direction
  ]

  return (
    <div className="demo-row">
      <LhButton onClick={() => openWith('right')}>{t('docs.drawer.right')}</LhButton>
      <LhButton onClick={() => openWith('left')}>{t('docs.drawer.left')}</LhButton>
      <LhButton onClick={() => openWith('top')}>{t('docs.drawer.top')}</LhButton>
      <LhButton onClick={() => openWith('bottom')}>{t('docs.drawer.bottom')}</LhButton>

      <LhDrawer
        title={t('docs.drawer.title')}
        direction={direction}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <LhButton onClick={() => setOpen(false)}>{t('docs.common.cancel')}</LhButton>
            <LhButton type="primary" onClick={() => setOpen(false)}>
              {t('docs.common.confirm')}
            </LhButton>
          </>
        }
      >
        <p>{t('docs.drawer.slideFrom', { direction: t(`docs.common.${dirKey}`) })}</p>
        <p>{t('docs.drawer.sizeNote')}</p>
      </LhDrawer>
    </div>
  )
}
