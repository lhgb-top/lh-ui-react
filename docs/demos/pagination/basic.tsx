import { useState } from 'react'
import { LhPagination } from '@lh-ui/react'

export default function PaginationBasic() {
  const [current, setCurrent] = useState(1)

  return (
    <div className="demo-column">
      <LhPagination total={128} current={current} onChange={(page) => setCurrent(page)} />

      <LhPagination
        total={256}
        showTotal
        showSizeChanger
        showJumper
        onChange={(page, size) => console.log('page:', page, 'size:', size)}
      />

      <LhPagination total={60} simple />

      <LhPagination total={128} disabled />
    </div>
  )
}
