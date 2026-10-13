---
"@lh-ui/react": patch
---

文档站站点互链与 homepage 统一到家族部署域名 `www.lhgb.top/lhui/{库名}/`：

- `docs/.vitepress/config.ts` 中英文 nav 的「Vue3 版 / Vue2 版」互链原指向
  `lh-ui-plus.lhgb.top` / `lh-ui.lhgb.top`（旧规划域名，Nginx 未配置），改为
  `https://www.lhgb.top/lhui/plus/` 与 `https://www.lhgb.top/lhui/vue2/`
- `package.json` 的 `homepage` 同步改为 `https://www.lhgb.top/lhui/react/`
