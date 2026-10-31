# 星球小捕手（PlanetGIS）源码

「星球小捕手」是一个自助探索的地理知识库，站点 **planetgis.cn**。四大方向——自然地理、人文地理、区域地理、地理信息技术（GIS），按主题随意翻阅，把课本里的知识点讲透、讲活。

纯静态站点（SSG 预渲染），无后端、无数据库。

## 技术栈

- 构建：**Vite + React + TypeScript**（rolldown-vite）
- 样式：Tailwind CSS + Radix UI 组件体系
- 内容：**Markdown 驱动**，编译期经 `import.meta.glob` 打包进 bundle，构建期预渲染为静态 HTML
- 部署：Cloudflare Pages（连接 GitHub 自动构建）

## 目录结构

```
.
├── content/                # 全站内容（Markdown，日常只改这里）
│   ├── articles/           # 科普文章
│   ├── works/              # 地理可视化作品
│   ├── tools/              # 地理小工具
│   ├── learn/              # 地理学习条目（学科 + 学段 + 标签）
│   └── changelog.md        # 更新日志
├── public/                 # 静态资源（favicon、images、ads.txt、CNAME、robots.txt 等）
├── scripts/                # 构建期脚本
│   ├── prerender.mjs       # SSG 预渲染（遍历路由写 dist/<route>/index.html）
│   ├── gen-sitemap.mjs     # 自动生成 dist/sitemap.xml
│   └── baidu-push.mjs      # 百度主动推送（需环境变量，否则跳过）
├── src/
│   ├── components/         # 通用 / 布局 / 知识组件
│   ├── pages/              # 页面（Home / Listing / ContentDetail / TagPage 等）
│   ├── lib/                # 核心库（content.ts 内容解析、knowledge.ts 检索、seo.tsx 结构化数据）
│   ├── data/               # 静态数据（如 subdomains.json 子站导航）
│   ├── hooks/  contexts/   # 钩子与上下文
│   ├── App.tsx  routes.tsx  main.tsx  entry-server.tsx
│   └── index.css           # 全局样式（杂志长读式排版系统）
├── index.html              # 入口 HTML（含 GA4 / AdSense / busuanzi 脚本）
├── vite.config.ts          # Vite 配置
└── package.json            # npm 脚本与依赖（lockfile: package-lock.json）
```

## 本地开发

要求 **Node.js ≥ 20**（Cloudflare 构建用 22），包管理用 **npm**（pnpm/yarn 已弃用）。

```bash
npm install      # 安装依赖（生成 package-lock.json）
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
```

## 构建

```bash
npm run build
# = tsc && vite build && node scripts/prerender.mjs && node scripts/gen-sitemap.mjs && node scripts/baidu-push.mjs
```

产物输出到 `dist/`（含全部预渲染页面 + sitemap.xml）。

> 注意：`dist/ads.txt` 若被正在运行的 `npm run dev` / preview 进程锁占，构建会报 `EPERM`；先停掉 dev/preview 再构建即可。

## 部署（Cloudflare Pages）

连接 GitHub 仓库 `plantcatcher/gis-planetgis-src`（分支 `main`），构建设置：

- **Build command**：`npm run build`
- **Build output directory**：`dist`
- **环境变量**（可选）：`NODE_VERSION=22`；`BAIDU_SITE` / `BAIDU_PUSH_TOKEN`（启用百度主动推送，不填则构建时跳过）；`VITE_TAWK_PROPERTY_ID` / `VITE_TAWK_WIDGET_ID`（覆盖内置的 Tawk.to 客服 ID，不填则使用仓库内置 ID）

绑定自定义域名 `planetgis.cn` 后，Cloudflare 自动签发 SSL（建议 Full strict）。

> 旧的 `.github/workflows/deploy.yml`（GitHub Pages）已废弃，迁移 Cloudflare 后可删除。

## 在线客服（Tawk.to）

右下角在线客服由 **Tawk.to** 提供，站点内置了当前账号的公开 Property / Widget ID，无需额外配置即可加载。如需换号，到 Tawk.to 后台复制 Widget Code，取其中 `https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>` 两段 ID，通过构建环境变量覆盖：

```bash
VITE_TAWK_PROPERTY_ID=你的propertyId
VITE_TAWK_WIDGET_ID=你的widgetId
```

本地可写入 `.env`（已被 git 忽略），线上在 Cloudflare Pages 的环境变量中配置后重新部署。Vite 的环境变量在**构建期**注入，修改后必须重新构建。

客服脚本只在实际渲染页面时异步加载；全屏地图 `/maps/<slug>/full` 和游戏页会自动隐藏。ID 格式不正确时组件静默禁用，不会出现打不开的客服按钮。Tawk.to 在中国大陆的可达性不稳定；如果客服没有加载出来，可通过 [联系我们](https://planetgis.cn/contact) 页的邮箱联系。

## 发布 / 更新内容

日常更新**只改 `content/` 与 `src/data/subdomains.json`，无需碰 React 代码**：

- 新增文章 / 作品 / 工具：在 `content/{articles,works,tools}/` 放 `.md`，frontmatter 含 `slug / title / cover / summary / date / category / tags`。
- 新增学习条目：在 `content/learn/` 放 `.md`，额外含 `subject`（自然 / 人文 / 区域 / GIS）与 `category`（初中 / 高中 / 大学 / 通识地理）。
- 内容改动后 `npm run build` 重新生成静态页（或等 Cloudflare 自动部署）。

## SEO 与统计

- **自动 sitemap**：构建期从所有详情页 + 标签页生成 `dist/sitemap.xml`。
- **百度主动推送**：`scripts/baidu-push.mjs` 读取 sitemap 调用百度搜索资源平台接口（需 `BAIDU_SITE` + `BAIDU_PUSH_TOKEN`）。
- **结构化数据**：详情页注入 `BlogPosting` / `Course` JSON-LD，首页注入 `Organization` / `WebSite`。
- **统计**：GA4（后台分析）+ AdSense（变现）+ 不蒜子 busuanzi（页面可见访客量）。
