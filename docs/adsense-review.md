# Google AdSense 审核报告 — planetgis.cn

## 审核日期：2026-07-07

---

## 一、被拒原因分析（原网站问题）

### 1. 缺少 SEO 元标签（严重）
- `<title>` 标签缺失，页面无标题
- `<meta name="description">` 缺失，搜索引擎无法理解页面内容
- `<meta name="keywords">` 缺失
- `<html lang="en">` 但网站内容全为中文，应改为 `lang="zh-CN"`

### 2. 缺少关键法律页面（严重）
- **无隐私政策页面**：Footer 中"隐私政策"链接指向 `#`（空链接）
- **无服务条款页面**：Footer 中"版权声明"链接指向 `#`（空链接）
- **无联系页面**
- **无关于页面**（独立页面，不是首页中的 section）
- Google AdSense 明确要求：网站必须有清晰的隐私政策、服务条款和联系方式

### 3. 缺少 SEO 基础文件（严重）
- 无 `robots.txt` — 搜索引擎无法正确抓取
- 无 `sitemap.xml` — 搜索引擎无法发现页面
- 无 `ads.txt` — AdSense 无法验证广告发布者身份

### 4. 内容质量问题（中等）
- 工具列表中"地形分析"链接指向 `#`（无效链接）
- 子站导航中"地图工具"和"资源下载"链接指向 `#`（无效链接）
- 作品描述过于简短（仅一句话），AdSense 偏好有实质内容的页面
- 部分作品图片使用了外部临时 API 生成（trae-api-cn.mchost.guru），可能导致图片加载失败

### 5. SPA 搜索引擎可抓取性问题（中等）
- 纯客户端渲染的 React SPA，无 SSR/SSG
- 虽然现代 Googlebot 可以渲染 JS，但纯 SPA 仍然对 SEO 不利
- 所有页面通过 JS 渲染，初始 HTML 为空白 `<div id="root">`

### 6. 缺少社交媒体标签（轻微）
- 无 Open Graph 标签（og:title, og:description, og:image）
- 无 Twitter Card 标签

### 7. 缺少结构化数据（轻微）
- 无 JSON-LD 结构化数据，搜索引擎难以理解网站类型

---

## 二、已完成的修改

### 1. index.html — 完整 SEO 标签
- ✅ `<html lang="zh-CN">`（修正语言属性）
- ✅ `<title>` 标签
- ✅ `<meta name="description">` 描述标签
- ✅ `<meta name="keywords">` 关键词标签
- ✅ `<meta name="author">` 作者标签
- ✅ `<meta name="robots" content="index, follow">`
- ✅ Open Graph 标签（Facebook 分享卡片）
- ✅ Twitter Card 标签
- ✅ `<link rel="canonical">` 规范链接
- ✅ JSON-LD 结构化数据（Organization + WebSite）

### 2. 新增独立页面
- ✅ `/privacy-policy` — 隐私政策页面（10个章节，涵盖 Cookie、第三方服务、数据安全等）
- ✅ `/terms` — 服务条款页面（8个章节，涵盖内容使用、免责声明、广告声明等）
- ✅ `/about` — 关于我们页面（品牌介绍、三大内容支柱、数据统计）
- ✅ `/contact` — 联系我们页面（6个社交渠道）

### 3. 新增 SEO 基础文件（public/ 目录）
- ✅ `robots.txt` — 允许所有爬虫抓取，指向 sitemap
- ✅ `sitemap.xml` — 包含所有5个页面的 URL 地图
- ✅ `ads.txt` — AdSense 发布者验证文件

### 4. 路由与布局优化
- ✅ 共享导航栏组件（Navbar）— 支持桌面端和移动端
- ✅ 共享页脚组件（Footer）— 所有页面统一页脚
- ✅ ScrollToTop 组件 — 页面切换时自动滚动到顶部
- ✅ App.tsx 集成 react-helmet-async 动态管理页面标题

### 5. Home.tsx 内容优化
- ✅ 移除重复的导航栏和页脚（改为共享组件）
- ✅ 修复空链接：移除指向 `#` 的"地形分析"和"地图工具"、"资源下载"
- ✅ 扩充作品描述（每条从1句扩展到2-3句）
- ✅ 为图片添加 alt 文本（无障碍 + SEO）
- ✅ 子站导航从4个精简为2个（只保留实际可访问的 wiki 和 blog）

---

## 三、子域名影响分析

### 网站中存在的子域名
| 子域名 | 用途 | 状态 |
|--------|------|------|
| sealevel.planetgis.cn | 海平面模拟实验室 | 作品链接 |
| 3dboard.planetgis.cn | 3D大屏显示系统 | 作品链接 |
| terrain.planetgis.cn | 地球地貌探索 | 作品链接 |
| sky.planetgis.cn | 星空观测指南 | 作品链接 |
| climate.planetgis.cn | 气候变化影响 | 作品链接 |
| cityroad.planetgis.cn | 城市路网 | 作品链接 |
| xyz.planetgis.cn | 经纬度查询工具 | 工具链接 |
| covertool.planetgis.cn | GeoJson转SHP工具 | 工具链接 |
| wiki.planetgis.cn | 地理知识库 | 子站导航 |
| blog.planetgis.cn | 科普博客 | 子站导航+社交链接 |

### 子域名对 AdSense 审核的影响

**有一定影响，但不是决定性因素。**

Google AdSense 审核主要关注**你申请的那个域名**（planetgis.cn）。子域名的处理方式取决于以下情况：

#### 不会影响的场景：
- 子域名作为外部链接出现，指向独立的网站/应用
- 子域名有各自独立的内容和功能
- 你在 AdSense 中只申请了主域名

#### 可能影响的场景：
- **如果子域名无法访问或内容为空**：Google 爬虫可能尝试抓取这些子域名，如果返回404或空白页面，会被视为低质量信号
- **如果子域名内容与主站重复**：可能被视为内容农场
- **如果子域名包含违规内容**：会影响整个域名的审核

### 建议

1. **确保所有子域名可访问**：如果某个子域名尚未上线，先不要在首页展示其链接
2. **已移除的空链接**：已将子站导航从4个精简为2个（仅保留 wiki 和 blog 两个实际可访问的子站）
3. **子域名各自申请 AdSense**：如果子域名有独立内容（如 blog.planetgis.cn），可以单独申请 AdSense，不一定依赖主站
4. **主站内容充实**：主站 planetgis.cn 本身需要有足够丰富的原创内容

---

## 四、重新申请 AdSense 前的检查清单

- [ ] 部署更新后的网站到线上
- [ ] 确认 `https://planetgis.cn/robots.txt` 可访问
- [ ] 确认 `https://planetgis.cn/sitemap.xml` 可访问
- [ ] 确认 `https://planetgis.cn/ads.txt` 可访问
- [ ] 确认 `https://planetgis.cn/privacy-policy` 可访问
- [ ] 确认 `https://planetgis.cn/terms` 可访问
- [ ] 确认 `https://planetgis.cn/about` 可访问
- [ ] 确认 `https://planetgis.cn/contact` 可访问
- [ ] 在 Google Search Console 提交 sitemap.xml
- [ ] 确认所有子域名链接可正常打开
- [ ] 等待 1-2 周让 Google 重新抓取更新后的页面
- [ ] 然后重新提交 AdSense 申请

---

## 五、修改的文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `index.html` | 修改 | 添加完整 SEO 标签 |
| `src/App.tsx` | 修改 | 集成共享布局组件 |
| `src/routes.tsx` | 修改 | 添加4个新页面路由 |
| `src/pages/Home.tsx` | 修改 | 移除重复导航/页脚，修复链接，扩充内容 |
| `src/pages/PrivacyPolicy.tsx` | 新增 | 隐私政策页面 |
| `src/pages/Terms.tsx` | 新增 | 服务条款页面 |
| `src/pages/About.tsx` | 新增 | 关于我们页面 |
| `src/pages/Contact.tsx` | 新增 | 联系我们页面 |
| `src/components/layout/Navbar.tsx` | 新增 | 共享导航栏 |
| `src/components/layout/Footer.tsx` | 新增 | 共享页脚 |
| `src/components/common/ScrollToTop.tsx` | 新增 | 路由切换滚动控制 |
| `public/robots.txt` | 新增 | SEO 爬虫文件 |
| `public/sitemap.xml` | 新增 | SEO 站点地图 |
| `public/ads.txt` | 新增 | AdSense 验证文件 |
