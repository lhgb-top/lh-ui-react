import { LhIcon } from '@lh-ui/react'

export default function IconBasic() {
  return (
    <>
      <LhIcon name="search" />
      <LhIcon name="search" size={32} />
      <LhIcon name="search" color="var(--lh-primary-color, #1677ff)" />
      <LhIcon name="loading" color="var(--lh-success-color, #52c41a)" />
      <LhIcon name="close" color="var(--lh-danger-color, #f56c6c)" size="large" />
    </>
  )
}
