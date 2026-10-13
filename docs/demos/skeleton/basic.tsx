import { LhSkeleton } from '@lh-ui/react'

export default function SkeletonBasic() {
  return (
    <div className="demo-row">
      <LhSkeleton sx={{ w: 300 }} />
      <LhSkeleton avatar rows={2} sx={{ w: 300 }} />
    </div>
  )
}
