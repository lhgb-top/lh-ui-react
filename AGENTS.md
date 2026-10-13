# AGENTS.md — @lh-ui/react

本仓库是 lh-ui 家族 web 血脉的 **React 18/19 UI 层**：纯函数组件库，
唯一运行时依赖 [`@lh-ui/share`](../lh-ui-share/)（core 纯函数 / theme / constants /
locales / types / utils / 组件样式唯一源）。组件名 / BEM 类名 / CSS 变量与
`@lh-ui/vue3`、`@lh-ui/vue2` 完全同构（`Lh*` / `lh-*` / `--lh-*`）。

家族总纲见 [../docs/多端组件库规划.md](../docs/多端组件库规划.md)，
React 特化实施细节见 [../docs/react/react组件库计划.md](../docs/react/react组件库计划.md)。

## 目录职责

- `src/components/<name>/` —— 组件四件套：`<Name>.tsx`（薄渲染）+ `use-<name>.ts`
  （纯胶水 hook：props 加工 + core 调用组合，barrel 导出为 `useLh<Name>`）+ `types.ts`
  （Props 接口，与 plus 同名同义同构）+ `index.ts`（re-export）。复合组件另加子组件
  `<Sub>.tsx`（`FormItem.tsx` / `TabPane.tsx` / `SkeletonItem.tsx` …）与 `context.ts`（form）
- `src/components/config-provider/` —— `LhConfigContext` + `LhConfigProvider` +
  `useLhConfigProvider`（**没有独立 `src/context/` 目录**，上下文就在该组件目录内）
- `src/hooks/index.ts` —— 全部 `useLh*` hooks（纯逻辑全部调 `@lh-ui/share/core`）
- `src/locale/index.tsx` —— share emitter 的 React 适配（useSyncExternalStore）
- `src/imperative/` —— 命令式服务（Message / Notification / Loading）：createRoot 单例容器 + 队列
- `src/utils/` —— 仅 `css-var.ts`（CSS 变量键的 React 类型断言封装）；其余工具一律从 share 引入
- `src/index.ts` —— barrel：命名导出全部组件 + hooks + locale + 服务 + 类型（**无 install 机制**）
- `src/theme.ts` / `src/constants.ts` —— 纯转发模块，保 `./theme`、`./constants` 子路径
- `tests/` —— 组件测试（RTL）+ registry + hooks + locale；**core 单测唯一一份在 share 仓**
- `dev/` —— Vite + React 沙箱
- `docs/` —— Docusaurus 3 站（React 应用；`baseUrl='/lhui/react/'`，站点根在 `docs/`）

库内**不得**出现 core / theme / constants / locales / types / utils / 组件样式副本——
共享层全部来自 `@lh-ui/share`。

## 红线（家族通用 + React 特化）

### 依赖红线

1. **唯一运行时依赖 `@lh-ui/share`**：`dependencies` 只能有这一项；`peerDependencies`
   为 `react ^18 || ^19`、`react-dom` 同。
2. **禁止引** `classnames` / `clsx`（用 share/core 的 `getClassNames`）、
   `react-transition-group`（自研 `useTransition`）、`floating-ui`（用 share/core/shared/popper）。
3. **依赖方向唯一**：本库 → `@lh-ui/share`；与 plus / vue2 / uniapp 之间零依赖、禁止跨库 import。
4. **样式源唯一**：组件 BEM 样式只存在于 `@lh-ui/share/styles/`；本库只做构建期编译，
   禁止手写 / 拷贝组件样式。颜色一律 `var(--lh-*, fallback)`，组件不得自行声明 `--lh-*` 变量。
5. **core 单测唯一一份**在 share 仓；本库只测 React 专属层（组件 + hooks + 服务 + 适配层）。
6. **发布顺序硬约束**：share 先发版，本库随其后（`pnpm up @lh-ui/share` 回归）。

### React 特化纪律（对应计划文 §八）

1. **StrictMode 双调用**：render 零副作用（不写外部变量、不创建订阅）；effect 幂等且 cleanup 完整。
2. **render 必须纯**：`generateId()`、`Date.now()` 等放事件处理器或 effect 内，不放 render 主体。
3. **forwardRef**：所有可聚焦 / 可定位组件转发 ref；**不使用 React 19 的 ref-as-prop**。
4. **不用 defaultProps**（函数组件，React 19 移除）→ 全部解构默认参数。
5. **CSS 变量键**：用 `cssVarsStyle(record)` 统一处理类型断言，避免每个组件散写 `as React.CSSProperties`。
6. **受控 / 非受控**：统一 `useControlled`；文档标注每个表单组件是否支持 `defaultValue`。
7. **Context value 必须 `useMemo`**（对应 plus「provide 必须 computed」的实测教训，
   及 form provide 快照化缺陷 V2-02 / P-05）：否则每次 render 新对象导致全子树重渲染。
8. **UMD 用 classic JSX**：esm / cjs 产物用 automatic runtime（`react/jsx-runtime` external）；
   UMD 构建切 `jsxRuntime: 'classic'`。
9. **事件对照**：Vue `@change` / `@click.stop` 到 React 的映射表进文档；`.stop` →
   `e.stopPropagation()` 需组件内显式处理。
10. **SSR**：布局类 effect 封装 `useIsomorphicLayoutEffect`；DOM 操作全部在 effect 内执行。

## 本地联动（家族布局）

dev / test 通过**带存在性守卫的 vite alias** 直接解析到同级的 `lh-ui-share/` 源码
（`src/` 与 `styles/`），改 share 即时热更新，无需构建或发版；兄弟仓不存在时
（CI 单仓 clone）自动回退到已安装的 npm 包。机制见 `scripts/local-share-alias.mjs`。

- dev 期走 TS / SCSS **源码**而非构建产物；docs 站与库构建（vite build、build-styles）
  仍消费 `node_modules/@lh-ui/share` 的构建产物，clone 后需在 share 跑一次 `pnpm build`。
- 本地 typecheck 走生成文件 `tsconfig.dev.json`（`scripts/gen-dev-tsconfig.mjs`，
  带存在性守卫）；根 `tsconfig.json` **刻意不配** `@lh-ui/share` 的 paths——
  声明构建会把兄弟仓 .ts 拉进 program，且破坏「share 类型随包发布的 .d.ts」语义。

## 样式注入策略（与 vue2 对齐，与 plus 不同）

- 本库 `src/index.ts` **不注入全量样式**：用户按需引
  `import '@lh-ui/react/theme.css'` + `import '@lh-ui/react/style/button'`。
  理由：React 生态按需引入是主流，且避免全量 side-effect 拖累 tree-shaking。
- 样式产物由 `scripts/build-styles.mjs` 从 share 源编译：`es/components/<name>/style/index.css`
  + `dist/theme/index.css`（明）+ `dist/theme/index-dark.css`（暗）。

## 新增组件清单

1. 确认 share 的 `src/core/<name>/` 与 `styles/<name>/index.scss` 已就绪（若无，先去 share 仓加）。
2. 建 `src/components/<name>/` 四件套：`types.ts` → `use-<name>.ts`（胶水 hook）→ `<Name>.tsx` → `index.ts`。
3. **同时**注册到 `src/index.ts`：`Lh<Name>` 组件 **和** `useLh<Name>` 胶水 hook（两者都必须，
   registry 测试按目录名反扫断言两者都在 barrel 内）；复合组件成对导出（如 `LhTabs` + `LhTabPane`）。
4. 更新 `tests/unit/components-registry.spec.tsx` 的期望名单（26 组件目录清单 + 复合成对清单 + hooks 清单）。
5. 加 `tests/components/<name>.spec.tsx` + `docs/content/components/<name>.mdx` + `.changeset/*.md`；
   sidebar 只改 `docs/sidebars.ts` 一条；样式注入只在 `docs/src/css/custom.scss` 加一条
   `@use`；i18n 镜像（en 骨架）在
   `docs/i18n/en/docusaurus-plugin-content-docs/current/<dir>/<name>.mdx`（扩展名必须与源一致）。
   注：`docs/content/components/` 目前 26 / 26，与组件数持平（message / notification / loading
   三页为命令式服务，不在 `src/components` 目录内）。
6. 交付命令清单给用户手动验证（Verification is manual）。

## Import 规则

- 组件 `types.ts` 从**子路径** `@lh-ui/share/core/<name>` 引 core 类型、
  `@lh-ui/share/core/shared` 引共享类型，**永不从根 barrel 引**（破坏 tree-shaking 与分层）。
- 组件样式一律 `@import '@lh-ui/share/styles/<name>'`（不带 `/index.scss` 后缀）。
- 测试 import 走 `@/components/<name>`，禁止 `../../src/...`。

## 命令

| 任务 | 命令 |
| --- | --- |
| Dev 沙箱 | `pnpm dev` |
| 单测 | `pnpm test`（或 `pnpm vitest run tests/components/button.spec.tsx` 最窄范围） |
| Lint / 类型 | `pnpm lint` / `pnpm typecheck`（生成 tsconfig.dev.json 后检查） |
| 构建 | `pnpm build`（esm → cjs → umd → styles → dts） |
| dts 校验 | `pnpm verify:dts` |
| Changeset | `pnpm changeset` / `changeset:status` / `changeset:version` / `changeset:publish` |
| Dev 文档 | `pnpm docs:dev`（端口 5179） |

## Gotchas

- `es/`、`lib/`、`dist/`、`theme/`、`coverage/`、`docs/.docusaurus`、`docs/build` 全是构建产物，
  **永不手改**；样式真源在 `node_modules/@lh-ui/share/styles/`。
- UMD 文件名 `dist/lh-ui-react.umd.js` 由 vite.config.ts 的 `fileName` 函数显式给出
  （根 `type: "module"` 会让 vite 自动加 .cjs 后缀，与 package.json 声明不一致）。
- docs 站是 Docusaurus 3（React 应用），站点根在 `docs/`（自带 `docs/package.json`
  脱离根的 `type: "module"`，否则 Docusaurus 的 CJS 运行时报 `require.resolveWeak`
  不是函数）。MDX 页面直接 `import` demo，不再需要桥接组件；
  demo 源在 `docs/demos/`，**不走** `dev/` 沙箱配置。
- docs 的 share 本地联动别名在 `docusaurus.config.ts` 的插件钩子里（webpack resolve.alias，
  生成函数 `createLocalShareWebpackAliases` 在 `scripts/local-share-alias.mjs`）；
  sass 的 bare `@use` 另需 `loadPaths: [node_modules]` 兜底（Dart Sass 不读包 exports 映射）。
- Docusaurus 暗色模式在 `<html data-theme="dark">`，与 share `var-dark.scss` 的
  `[data-theme='dark'], .dark` 选择器天然吻合，暗色零适配。
- i18n：en 骨架在 `docs/i18n/en/docusaurus-plugin-content-docs/current/**`，
  **文件扩展名必须与源一致**（`.mdx` 源对应 `.mdx` stub），否则 Docusaurus 判定翻译缺失、
  回退渲染中文全文；跨 locale 链接不要硬编码 baseUrl，会双重前缀。
- dev 沙箱端口 **5180**（`dev/vite.config.ts`），docs 站 5179。
- `vitest.config.ts` 的 coverage.include 仍列 `src/context/**`——该目录已并入
  `src/components/config-provider/`，覆盖率统计实际漏掉 config-provider，核对覆盖率时注意。
- `env.d.ts` 里的 `declare module '@lh-ui/share/styles/*'` 是必需兜底：share 的
  `./styles/*` 子路径经 exports 映射到 `*/index.scss`，tsc 与编辑器都找不到类型。
- 根目录 `回归测试报告.md` + `regression-report/screenshots/` 是人工浏览器回归留证
  （2026-10-11，A 区 dev 沙箱 / B 区 docs 站，缺陷只记录不修复）；改动相关组件后可对照更新。

## Verification is manual（验证手动）

测试、构建、typecheck、lint 由**用户**运行，AI 不自动执行；AI 交付后列出命令清单，
未确认的运行不得标 ✅。

## 约定

- 注释与提交信息用中文；Prettier：单引号、无分号、2 空格、printWidth 100
  （`pnpm format` 仅覆盖配置文件与 `.changeset/`，`src/`、`tests/` 需手工对齐风格）。
- 组件类名遵循 BEM `lh-*`；自有常量 / 类 / 枚举 / 组件一律 LH 前缀（`Lh*` / `useLh*`）。
