/// <reference types="vite/client" />

declare module '*.scss'
declare module '*.css'
declare module '*.module.css'
declare module '*.module.scss'
declare module '*.mjs'

// @lh-ui/share 的 ./styles/* 子路径经 exports 映射到 */index.scss，
// 编辑器与 tsc 都找不到类型，补 ambient 声明兜底
declare module '@lh-ui/share/styles/*'
