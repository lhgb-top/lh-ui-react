/**
 * 站点首页（替代 VitePress 的 layout: home）
 *
 * Docusaurus 页面走 src/pages/，routeBasePath '/' 的 docs 插件不与之冲突
 * （docs 无 slug: '/' 的文档）。
 *
 * 文案一律走 translate()（@docusaurus/Translate），条目在
 * i18n/<locale>/code.json 的 homepage.* 命名空间下。
 *
 * 导入路径说明：Docusaurus 用细粒度 webpack alias 把
 * @docusaurus/<文件名> 指向 core/lib/client/exports/<文件名>，
 * translate() 的公开来源是 client/exports/Translate.js，即
 * @docusaurus/Translate（不是 @docusaurus/Translator，后者多了 r，
 * 不存在也不走该 alias）。
 */
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { translate } from '@docusaurus/Translate'
import Layout from '@theme/Layout'

import styles from './index.module.css'

interface FeatureItem {
  title: string
  description: string
}

function getFeatures(): FeatureItem[] {
  return [
    {
      title: translate({ id: 'homepage.features.isomorphic.title', message: '同源同构' }),
      description: translate({
        id: 'homepage.features.isomorphic.description',
        message:
          '组件逻辑来自 @lh-ui/share/core，与 lh-ui-plus（Vue 3）、lh-ui-vue2 零副本共享，props 同名同义。',
      }),
    },
    {
      title: translate({ id: 'homepage.features.react.title', message: 'React 18 / 19' }),
      description: translate({
        id: 'homepage.features.react.description',
        message:
          'forwardRef 转发 ref、Context value 快照化、StrictMode 安全、SSR 友好，两个主版本都经过设计。',
      }),
    },
    {
      title: translate({ id: 'homepage.features.onDemand.title', message: '按需引入' }),
      description: translate({
        id: 'homepage.features.onDemand.description',
        message: '主题与组件样式按需引入，打包器精确裁剪未用到的样式，不引入全量 side-effect。',
      }),
    },
    {
      title: translate({ id: 'homepage.features.theme.title', message: '国风水墨' }),
      description: translate({
        id: 'homepage.features.theme.description',
        message: '五套预设色板（青蓝 / 松花 / 朱砂 / 水墨 / 鎏金）、花纹背景系统、明暗双模式。',
      }),
    },
    {
      title: translate({ id: 'homepage.features.a11y.title', message: '无障碍' }),
      description: translate({
        id: 'homepage.features.a11y.description',
        message: 'ARIA 语义、键盘交互、焦点管理全部在共享层定义，各端实现一致，符合 APG 模式。',
      }),
    },
    {
      title: translate({ id: 'homepage.features.types.title', message: '类型完备' }),
      description: translate({
        id: 'homepage.features.types.description',
        message: 'TypeScript 编写，tsc 镜像直出 d.ts，props 类型与 Vue 版一一对应。',
      }),
    },
  ]
}

function Hero() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroTagline}>
          {translate({ id: 'homepage.hero.tagline', message: '企业级 React 国风组件库' })}
        </p>
        <p className={styles.heroSubtitle}>
          {translate({
            id: 'homepage.hero.subtitle',
            message:
              '与 lh-ui-plus 同源同构，共享设计令牌、组件逻辑与样式。支持 React 18 / 19。',
          })}
        </p>
        <div className={styles.heroButtons}>
          <Link className="button button--primary button--lg" to="/guide/quickstart">
            {translate({ id: 'homepage.hero.quickstart', message: '快速开始' })}
          </Link>
          <Link className="button button--secondary button--lg" to="/components/button">
            {translate({ id: 'homepage.hero.components', message: '组件总览' })}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const features = getFeatures()
  return (
    <Layout>
      <Hero />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((feature) => (
                <div key={feature.title} className="col col--4 margin-bottom--lg">
                  <div className="card">
                    <div className="card__header">
                      <h3>{feature.title}</h3>
                    </div>
                    <div className="card__body">
                      <p>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
