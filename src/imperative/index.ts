/**
 * 命令式服务统一出口
 *
 * 用法：
 * ```ts
 * import { message, notification, loading } from '@lh-ui/react'
 * message.success('保存成功')
 * ```
 */
export { message } from './message'
export type { LhMessageOptions } from './message'
export { notification } from './notification'
export type { LhNotificationOptions } from './notification'
export { loading } from './loading'
export type { LhLoadingOptions } from './loading'
export { destroyContainer } from './container'
