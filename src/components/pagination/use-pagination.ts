/**
 * Pagination 胶水层：share/core/pagination 纯函数组合
 *
 * 对应 plus 的 packages/components/pagination/src/index.vue 的 <script setup> 部分。
 * 受控 / 非受控双模式（current 与 pageSize 各一套），页码区间、钳制与文案
 * 全部走 core 纯函数，本层只做响应式接线。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import {
  clampPage,
  formatMessage,
  getPaginationRange,
  getPaginationItemAria,
  getPageCount,
} from '@lh-ui/share/core/pagination'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { useLhLocale } from '../../locale'
import type { LhPaginationProps } from './types'

export function useLhPagination(props: LhPaginationProps) {
  const {
    total,
    pageSizes = [10, 20, 30, 40],
    showTotal = false,
    showSizeChanger = false,
    showJumper = false,
    simple = false,
    disabled = false,
    siblingCount,
    onChange,
    onSizeChange,
  } = props

  const { t } = useLhLocale()

  const [pageSize, setPageSize] = useControlled<number>({
    value: props.pageSize,
    defaultValue: props.defaultPageSize ?? 10,
    onChange: onSizeChange,
  })

  const [current, setCurrent] = useControlled<number>({
    value: props.current,
    defaultValue: props.defaultCurrent ?? 1,
  })

  const pageCount = useMemo(() => getPageCount(total, pageSize), [total, pageSize])

  const range = useMemo(
    () => getPaginationRange({ current, pageCount, siblingCount }),
    [current, pageCount, siblingCount],
  )

  /** 页数变化后当前页可能越界，钳制并通知（对齐 plus 的 watch(pageCount)） */
  useEffect(() => {
    const target = clampPage(current, pageCount)
    if (target === current) return
    setCurrent(target)
    onChange?.(target, pageSize)
  }, [current, pageCount, setCurrent, onChange, pageSize])

  const go = useCallback(
    (page: number) => {
      const target = clampPage(page, pageCount)
      if (disabled || target === current) return
      setCurrent(target)
      onChange?.(target, pageSize)
    },
    [disabled, current, pageCount, setCurrent, onChange, pageSize],
  )

  const handleSizeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const next = Number(e.target.value)
      if (Number.isNaN(next)) return
      setPageSize(next)
      onSizeChange?.(next)
      // 条数变化后当前页可能越界，钳制并通知
      const target = clampPage(current, getPageCount(total, next))
      if (target === current) return
      setCurrent(target)
      onChange?.(target, next)
    },
    [setPageSize, onSizeChange, current, total, setCurrent, onChange],
  )

  // —— 跳页输入框：局部输入态，回车或失焦提交 ——
  const [jumpPage, setJumpPage] = useState<number | null>(null)

  const handleJump = useCallback(() => {
    if (jumpPage === null || Number.isNaN(jumpPage)) return
    go(jumpPage)
    setJumpPage(null)
  }, [jumpPage, go])

  const handleJumpKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleJump()
      }
    },
    [handleJump],
  )

  // —— 文案（formatMessage 做 {key} 插值） ——
  const totalText = useMemo(
    () => formatMessage(t('pagination.total', '共 {total} 条'), { total }),
    [t, total],
  )
  const prevLabel = t('pagination.prev', '上一页')
  const nextLabel = t('pagination.next', '下一页')
  const gotoLabel = t('pagination.goto', '前往')
  const pageSuffixText = t('pagination.pageSuffix', '页')
  const sizeChangerLabel = t('pagination.sizeChangerLabel', '每页条数')

  const pageLabel = useCallback(
    (page: number) => formatMessage(t('pagination.page', '第 {page} 页'), { page }),
    [t],
  )
  const sizeText = useCallback(
    (size: number) => formatMessage(t('pagination.sizeChanger', '{size} 条/页'), { size }),
    [t],
  )

  const pageAria = useCallback(
    (page: number) =>
      // core 返回宽泛的 LhAriaAttrs；此处已显式传 labelTemplate，两个键必在，断言收紧供 JSX 使用
      getPaginationItemAria({ page, current, labelTemplate: pageLabel(page) }) as {
        'aria-label': string
        'aria-current'?: 'page'
      },
    [current, pageLabel],
  )

  const rootClasses = useMemo(
    () =>
      ['lh-pagination', `lh-pagination--${simple ? 'simple' : 'full'}`, disabled ? 'lh-pagination--disabled' : '']
        .filter(Boolean)
        .join(' '),
    [simple, disabled],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const prevDisabled = disabled || current <= 1
  const nextDisabled = disabled || current >= pageCount

  return {
    // 值
    current,
    pageSize,
    pageCount,
    range,
    pageSizes,
    // 行为
    go,
    handleSizeChange,
    jumpPage,
    setJumpPage,
    handleJump,
    handleJumpKeyDown,
    // 文案
    totalText,
    prevLabel,
    nextLabel,
    gotoLabel,
    pageSuffixText,
    sizeChangerLabel,
    sizeText,
    pageAria,
    // 开关
    showTotal,
    showSizeChanger,
    showJumper,
    simple,
    disabled,
    prevDisabled,
    nextDisabled,
    // 样式
    rootClasses,
    sxStyle,
  }
}
