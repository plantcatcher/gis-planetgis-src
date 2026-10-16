# 公众号自动回复：中国绿地 SHP 数据（cn-greenland-shp-2024）

> 2026-10-16 已由 AI 用浏览器代填进公众号后台并保存复核（本批仅 1 条规则）。
> 资料页：`content/downloads/cn-greenland-shp-2024.md`（gated / direct，R2 zip 28.7 MB）

## 规则

- **规则名称**：中国绿地SHP数据2024
- **匹配方式**：半匹配（后台默认）
- **关键词（4 个）**：`中国绿地2024` / `中国绿地` / `绿地数据` / `公园绿地SHP`
  - 与资料页 frontmatter 的 `trigger` + `keywordAliases` 完全一致，勿单边改动。
- **回复**：1 条文本（208/300 字）

## 回复正文（后台实际保存内容）

```
🌳 中国绿地与休闲用地 SHP 矢量数据（OSM 提取，18.8 万个面，WGS84）

🔑领取码：NSH-GIS-055

👇 复制领取码，到资料页免费下载：
https://planetgis.cn/downloads/cn-greenland-shp-2024

数据含公园、球场、景区等 12 类；想先看分布，资料页顶部可打开配套互动地图，按省市筛选预览。

🌟 关注「那山那海那座城」，回复关键词，获取更多地理好书与数据集。
```

## 冲突检查（2026-10-16 实测）

- 后台搜索「绿地」命中 0 条、「公园」命中 0 条 → 4 个关键词与既有规则零冲突。
- 注意「格陵兰岛30m河湖矢量数据」规则的「格陵兰」关键词与本规则的「中国绿地」无包含关系，不会互相误触发。

## 代填方式（同 GADM 批次）

- `D:/WorkSpace/_tmp_gadm/`：`hold_wait.js`（起 Chrome 常驻）→ `fill_new3.js`（RULES_FILE=rules_greenland.json 0）→ `search_rule.js`（复核）。
- 登录态仍在 `chrome-profile`，本次无需扫码；token 已刷新为 628220030（`token30m.txt`）。
- 保存后已重新搜索 + 重开编辑框逐字核对，与 JSON 完全一致。
