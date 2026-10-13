import type { LhSxProps } from '@lh-ui/share/core/shared'

/**
 * Pagination Props（与 lh-ui-plus 的 LhPaginationProps 同名同义）
 *
 * 受控 / 非受控双模式：传 current 即受控，传 defaultCurrent 走非受控内部态；
 * pageSize 同理。
 */
export interface LhPaginationProps {
  /** 数据总数（必填） */
  total: number
  /** 每页条数（受控） */
  pageSize?: number
  /** 每页条数默认值（非受控） */
  defaultPageSize?: number
  /** 当前页（受控，1 起） */
  current?: number
  /** 当前页默认值（非受控） */
  defaultCurrent?: number
  /** 当前页两侧各显示的页码数 */
  siblingCount?: number
  /** 每页条数选项 */
  pageSizes?: number[]
  /** 是否显示总条数 */
  showTotal?: boolean
  /** 是否显示每页条数切换 */
  showSizeChanger?: boolean
  /** 是否显示跳页输入 */
  showJumper?: boolean
  /** 紧凑模式 */
  simple?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 页码变化时触发（页码切换、跳页、每页条数变化导致的钳制都会触发） */
  onChange?: (current: number, pageSize: number) => void
  /** 每页条数变化时触发 */
  onSizeChange?: (pageSize: number) => void
}

export type { LhPaginationRangeItem, LhPaginationRangeItemType } from '@lh-ui/share/core/pagination'
