---
'@lh-ui/react': minor
---

# 新建 React 组件库：脚手架 + 基建层 + P0 十二组件 + 测试层 + docs 站骨架

家族 web 血脉的 React UI 层（`@lh-ui/react`），与 `@lh-ui/vue3`（plus）、`@lh-ui/vue2`
同源同构：组件逻辑、样式、主题、文案全部来自 `@lh-ui/share`，本库只写响应式胶水与 JSX。

## 首期交付

- **脚手架**：package.json（唯一运行时依赖 `@lh-ui/share ^0.3.0`；peer react/react-dom
  `^18 || ^19`）、tsconfig 矩阵、eslint（含 react-hooks 插件）、prettier、vitest、changesets、
  pnpm workspace、仓库 AGENTS.md
- **构建链**（照 vue2）：vite lib mode 按 mode 分五步（esm preserveModules / cjs / umd /
  build-styles 编译 share SCSS / tsc 镜像 d.ts），verify-dts 校验外置引用
- **基建层**：ConfigProvider（Context + useMemo 纪律）、locale 适配（useSyncExternalStore
  订阅 share 单例）、16 个 hooks（useControlled / useTransition / 弹层四件套 + z-index /
  overlayStack / breakpoint / 主题切换）、imperative 服务（单例容器 + message 完整实现，
  notification / loading 留骨架）
- **P0 十二组件**：config-provider / button / icon / input / select / checkbox / radio /
  switch / dialog / tooltip / tag / form，每组件四件套（types / 胶水 / tsx / index）
- **测试层**：12 个组件 RTL spec + components-registry 反向扫描（防漏导出）+ hooks +
  locale + message；core 单测仍在 share 仓（家族红线）
- **docs 站骨架**：VitePress（zh-CN 为主 + en 二级目录）、**ReactDemo.vue**（Vue 应用内
  createRoot 桥接 React demo）、DemoBlock、12 组件页 + 8 个 guide 页（含 Vue↔React
  迁移指南，登记 11 条实现差异）、dev 沙箱
- **样式策略**：按需注入（对齐 vue2，非 plus 的全量注入），用户引 `theme.css` + `style/<name>`

## 相对 Vue 版的有意差异

详见 `docs/guide/migration.md`。要点：Dialog 纯受控（去掉 plus 的 isVisible 中间态）、
form validateField 修正异步 validator 等待（plus 同源缺陷，已在 bugfix-log R-01 登记
待回填）、tooltip 受控简化（去掉 manual 开关）、select 定位统一走 useLhPopper。

## 验证

2026-10-11 由 AI 代跑（用户授权）实跑全部门槛，结果：

- **通过**：`pnpm install`、`pnpm typecheck`（0 错误）、`pnpm lint`（0 错误，4 个有意保留的
  warning）、`pnpm test`（16 文件 172 用例全过）、`build:esm` / `build:cjs` / `build:umd` /
  `build:styles`、`node scripts/verify-dts.mjs`（67 源文件 ↔ 67 声明文件，无越界导入）、
  dev 沙箱浏览器实跑（十二组件真实渲染，Dialog / Message / Tooltip 交互正常）
- **阻塞（非本仓缺陷，见 bugfix-log 六-C 节）**：`build:dts` 残留 17 处 TS2724、
  `docs:build` 在 vitepress config 加载阶段失败——两者同源，都是 share 的
  `lh-prefix-naming` 改名 changeset 未发版、npm `@lh-ui/share@0.3.0` 仍是旧名所致
  （plus 仓 `docs:build` 实跑同样失败）。share 发版后随 `pnpm up` 自动收敛。
- 实跑暴露并已修正的缺陷见 `docs/bugfix-log.md` 六-B 节（R-07 ~ R-20），含 locale 单例
  丢 this（R-07，首轮 72 用例失败的根因）、message duration 透传（R-08）等 14 项。

## 浏览器全面回归批次（2026-10-11，AI 代跑用户授权）

在 ZCode 内嵌浏览器里逐组件、逐场景执行用户视角交互回归（新建 `dev/regression.html` +
`dev/regression.tsx`，把 `docs/demos/` 全部 14 个 demo 同页铺开），14 个测试区两两覆盖：

- **全部通过**：button（6 语义色 / 三档尺寸 / loading / disabled）、icon、tag（closable 真删除）、
  input（受控 / maxlength / password / clearable + R-17 修复后 autosize 随内容 40→56→76→80px）、
  select（aria 契约 / 键盘导航 / 选中回显 / 点击外部关闭 + R-19/R-20 修复后定位与宽度）、
  checkbox / radio（互斥 / 禁用守卫 / role 契约）、switch（Space 激活 / disabled / loading）、
  form（空提交 2 条 role=alert + aria-invalid / 提交 / 重置）、dialog（aria 契约 / 滚动锁 /
  四种关闭路径 / 焦点圈不逃逸）、tooltip（hover / focus / click / Esc / aria-describedby）、
  message（四类型 / 堆叠 / 按时消失）、config-provider（large 尺寸 + themeVars 主色精确到 #722ed1）
- **本批次新发现并已修正**：R-17 textarea autosize 被 share 的 `min-height:100px` 架空、
  R-18 Input 未传 size 时类名拼出 `lh-input--undefined`、R-19 useLhPopper 与 useTransition
  时序缺陷导致弹出层定位永不计算、R-20 下拉面板 teleport 后宽度塌缩
- **环境假象（非缺陷）**：该内嵌浏览器 `requestAnimationFrame` 一次不触发、
  `window.innerWidth/innerHeight` 恒为 0，均已在六-B 节登记说明；真实浏览器不受影响

