---
'@lh-ui/react': patch
---

# 开源化与 GitHub 发包链路接入

- 新增 Apache License 2.0（LICENSE），`package.json` 的 `repository` / `bugs` 修正为家族组织 `lhgb-top`（原误写 `lh-ui`）
- 新增 `scripts/push-release.mjs`：推 master + `@lh-ui/react@<版本>` tag 到 GitHub，触发 release.yml 自动留档（支持 `--dry-run` 自检）
- 新增 `scripts/release-notes.mjs`：从 CHANGELOG.md 提取指定版本发行版说明
- 新增 `.github/workflows/ci.yml`（lint / typecheck / test / build / verify:dts / docs:build 全量门禁）
- 新增 `.github/workflows/release.yml`：tag 触发，从 npm 拉原版 tarball 建 GitHub Release 并同步 Gitee
- `package.json` 补 `release`（= changeset publish）与 `release:push` 脚本
- `.changeset/config.json` 的 `baseBranch` 由 `main` 改为 `master`（家族默认分支统一）
