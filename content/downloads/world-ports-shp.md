---
slug: world-ports-shp
title: 世界港口分布数据 SHP（WGS84，Point，1,081 个海港，含官网与重要度分级）
summary: 全球主要海港点位数据集，共 1,081 个港口点位，字段构成（name / website / scalerank / natlscale / featurecla）与 Natural Earth 10m 海港点图层一致，坐标系统一为 WGS84 经纬度，属性含港口名称、港口当局官网、制图等级与国家级重要度分值，适合全球航运网络、港口体系与海运可达性分析。包体小巧（0.06 MB），是做世界贸易、航线与港口专题图的轻量底图层。
date: 2026-10-07
category: 地理数据
group: 地理数据
region: 全球
dataFormat: SHP
tags: 世界港口, 港口分布, 港口数据, Natural Earth, Shapefile, WGS84, 矢量数据, 航运, 交通地理, 地理数据
access: gated
trigger: 世界港口分布数据
keywordAliases: 全球港口数据, 港口分布数据, 世界港口SHP, 海港shp
code: NSH-GIS-018
download: https://downloads.planetgis.cn/GIS/world-ports-shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 0.06 MB
source: Natural Earth 公开海港点图层（ne_10m_ports）整理，追加 .qix 空间索引
---

> 本数据集为**全球主要海港点位数据**，以 Shapefile（.shp）形式提供，共 **1,081 个 Point（点）要素**，坐标系统一为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，`.prj` 随包附带。字段结构为 `scalerank` / `featurecla` / `name` / `website` / `natlscale`，与 Natural Earth 10m 海港点图层（ne_10m_ports）完全一致（`featurecla` 取值全部为 `Port`，且 `scalerank` 与 `natlscale` 呈严格的一一映射），据此可以判定本包整理自该公开数据集。包内已额外生成 **`.qix` 空间索引**，在 QGIS 中的平移缩放与查询响应速度明显优于原始下载状态。



![gangkou_1](https://blogphoto.planetgis.cn/PicGo/2026-10-07-gangkou_1.jpg)

![gangkou_2](https://blogphoto.planetgis.cn/PicGo/2026-10-07-gangkou_2.jpg)

## 数据内容与字段

数据包为**单一 Point 图层**，共 **1,081 个港口点位**，覆盖纬度 -54.81°（南美最南端）至 78.23°（北极圈附近斯瓦尔巴群岛），经度 -171.76° 至 179.31°，即真正意义上的全球覆盖。字段只有 5 个，短小精悍，全部非 NULL（name 无空值）：

- **`name`（字符，50 位）**：港口名称，1,081 条记录去重后为 **1,042 个不同名称** —— 存在跨国家重名，如 Piraeus（比雷埃夫斯）、Wilmington、Portsmouth、Portland 各出现 3 次（分别位于希腊/美国牙买加、美国不同州、英国/美国、美国/英国等），做「按名称连接」时必须同时校验国家。
- **`website`（字符，254 位）**：港口当局或运营公司官网，**699 条有值**（约占 64.7%），涉及 578 个不同域名，是批量核对港口官方信息、爬补充数据的入口字段。注意该字段**不含 http:// 前缀**（如 `www.consejoportuario.com.ar`），使用时要自行拼接协议头。
- **`scalerank`（整型）**：制图比例尺等级，取值 **3—8**，值越小代表港口越重要、越适合在小比例尺（如世界地图）上优先保留。**这是做分级制图的第一首选字段。**
- **`natlscale`（浮点）**：国家级重要度分值，取值 **75 / 50 / 30 / 20 / 10 / 5**，与 `scalerank` 严格一一对应（3↔75、4↔50、5↔30、6↔20、7↔10、8↔5）。适合直接当作符号大小的数值字段。
- **`featurecla`（字符）**：要素类别，全部恒为 `Port`。

**等级分布（scalerank → 港口数量）**：3（全球级枢纽）**67 个**、4 **76 个**、5 **150 个**、6 **229 个**、7 **297 个**、8（地方性小港）**262 个**。也就是说，适合在国家 / 世界尺度呈现的核心港口约 300 个（rank ≤ 5），剩下的是区域级补充。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-07-gangkou_0.jpg" alt="gangkou_0" style="zoom: 67%;" />



## 坐标系与格式

坐标系为 **WGS84 地理坐标系（EPSG:4326，经纬度）**，`.prj` 与 `.cpg` 均已随包附带（后者声明为 UTF-8），加载后与天地图、高德、OSM、Esri 影像等 Web 底图天然对齐，无需投影转换。

- **压缩后包体 0.06 MB**，解压后约 **0.51 MB**（6 个文件：`.shp / .shx / .dbf / .prj / .qix / .CPG`）。这是本站目前体积最小的矢量数据集之一，非常适合作为「叠加层」反复使用。
- 因已内含 `.qix`（MapServer / GDAL 生成的 quadtree 空间索引），在 QGIS 中的浏览与查询体验会明显流畅。

## 使用方法

1. **分级符号制图（最推荐场景）**：在 QGIS 中用 `natlscale` 做「按字段控制符号大小」（Size Assistant / Data-defined Override），用 `scalerank` 做分类设色，立刻得到一张「世界港口重要度」分级图 —— 这是表现全球航运体系层级最直观的画法。
2. **国别统计（需自行空间连接）**：本图层**不带国别字段**。如需「各国港口数量」排名，须先用 QGIS 的「按位置连接属性（Join attributes by location）」或 Python 中 `geopandas.sjoin()`，与国家行政区划面图层做空间连接（推荐用 Natural Earth 的 Admin-0 国界面图层，同为 WGS84，可直接叠加）。
3. **Python 分析与浏览**：`geopandas.read_file()` 读取后可一行得到层级占比：`df.groupby('scalerank').size()`；或把 `website` 缺失的 382 个港口筛出来做补齐。
4. **WebGIS 专题图**：转 GeoJSON 后仅约 200 KB，可直接内联到 MapLibre / Leaflet 做全球港口热点图；建议按 `scalerank` 分 6 级做 circle-radius，小比例尺只显示 rank ≤ 5 的 293 个核心港口，放大再逐级显示，避免世界图上点位糊成一片。

## 使用须知

- 数据整理自 **Natural Earth** 公开数据集（公有领域，Public Domain），可自由使用、修改与再发布，无须授权；建议注明数据出处为 Natural Earth。
- **重要：** 本图层**不含任何国界与行政界线**，港口点位的国别归属需要自行通过空间连接判定。数据中涉及中国台湾地区的港口（如 Keelung 基隆、Kaohsiung 高雄、Taipei 台北等），在制图与统计中一律按**中国台湾地区**处理，与中国大陆港口（Shanghai 上海、Ningbo 宁波、Qingdao 青岛、Tianjin 天津等）同属中国；任何场合都不得将其表述为独立国家。
- 若图中需要表达国界、海岸线或南海十段线，必须以自然资源部发布的标准地图为准，**严禁**对国界与十段线进行删改、位移或歪曲。
- 港口坐标为港口参考点，非泊位精确位置，也非水深或码头等级数据，不能用于航道设计、靠泊作业等工程用途。名称受 50 字符限制且存在跨国重名，正式成果请以港口当局官网（`website` 字段）或 UN/LOCODE 为准进行校核。

## 适用场景

全球航运网络主线梳理、世界级枢纽港与区域港的层级体系分析、海运可达性与港口密度制图、贸易地理与港口经济教学演示、WebGIS 世界港口专题底图、作为其他业务数据（航线、货运量、船舶轨迹）的空间参照层。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级筛选、逐点查询与移动端浏览：

- [世界港口分布互动地图](/maps/world-ports)
