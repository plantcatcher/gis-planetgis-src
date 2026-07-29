# 星球小捕手品牌主站开发计划

## 待办事项
- [x] 步骤 1: 初始化 Supabase 并应用数据库迁移
  - [x] 创建 `sections_config` 表（管理板块顺序和启用状态）
  - [x] 创建 `profile` 表（个人介绍）
  - [x] 创建 `items` 表（作品、工具、子域名汇总，通过 type 区分）
  - [x] 创建 `social_links` 表（平台链接）
  - [x] 创建 Supabase Storage Bucket 用于图片上传
- [x] 步骤 2: 系统设计与主题配置
  - [x] 配置 `index.css` 蓝色与绿色主题变量
  - [x] 配置 `tailwind.config.js` 语义化 Token
- [x] 步骤 3: 数据访问层 (API & Types)
  - [x] 定义 TypeScript 类型
  - [x] 实现 Supabase API 调用函数
- [x] 步骤 4: 开发主站首页
  - [x] 实现 Hero Section (个人介绍)
  - [x] 实现作品展示板块 (Dynamic)
  - [x] 实现工具/子域名展示板块 (Dynamic)
  - [x] 实现社交平台链接板块 (Dynamic)
  - [x] 实现底部合规声明 (版权、隐私政策)
- [x] 步骤 5: 开发后台管理系统
  - [x] 实现登录保护 (基于 Supabase Auth)
  - [x] 实现板块配置管理 (排序、开关)
  - [x] 实现内容编辑 (文字、图片上传、链接)
- [x] 步骤 6: 图片资源填充与优化
  - [x] 使用 `image_search` 获取地理科普相关图片
  - [x] 优化页面动效 (Framer Motion 或 CSS Transitions)
- [x] 步骤 7: 最终核对与部署准备
  - [x] 运行 `npm run lint` 修复问题
  - [x] 确认所有合规性声明已就位

## 备注
- 视觉风格：蓝色 (#1E3A8A) 和 绿色 (#10B981) 为主色调。
- 动画要求：顺滑、动感，体现地球探索感。
