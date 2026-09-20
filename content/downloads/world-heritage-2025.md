---
slug: world-heritage-2025
title: 2025 世界遗产名录矢量数据集 SHP（全球 1248 处 + 中国 59 处 · WGS84）
summary: 2025 年世界遗产名录的空间矢量数据集，包含全球 1248 处世界遗产（文化遗产 972、自然遗产 235、混合遗产 41）及独立的中国子集 59 处，Shapefile 格式，WGS84 坐标系，49 个多语言与遴选标准属性字段，可直接用于 QGIS / ArcGIS / Python 空间分析与世界遗产专题制图。
date: 2026-09-20
category: 地理数据
tags: 世界遗产, 世界遗产名录, UNESCO, SHP, 矢量数据, WGS84, 文化遗产, 自然遗产, 地理数据
access: gated
trigger: 世界遗产名录2025
keywordAliases: 世界遗产SHP, 世界遗产矢量, 世界遗产名录数据
code: NSH-WH-001
download: https://downloads.planetgis.cn/GIS/world-heritage-2025.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.33 MB
---

> 本数据集为 **2025 年世界遗产名录（World Heritage List）空间矢量数据**，整理自联合国教科文组织世界遗产中心（UNESCO World Heritage Centre）公开发布的名录空间数据，坐标系为 **GCS_WGS_1984（EPSG:4326，WGS84 地理坐标）**，编码 **UTF-8**，以 Shapefile（.shp）形式提供，压缩包约 **1.33 MB**。**无官方审图号**，属国际公开数据集，字段结构与 UNESCO 官方 schema 一致。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-20-sjyc_2.jpg" alt="sjyc_2" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-20-sjyc_3.jpg" alt="sjyc_3" style="zoom:50%;" />

## 数据内容

压缩包内含 **2 个 Shapefile 数据集**：

- **全球数据集（2025世界遗产名录数据集）**：共 **1,248** 处世界遗产要素，其中文化遗产 **972** 处、自然遗产 **235** 处、混合遗产 **41** 处；覆盖欧洲与北美 579、亚太 303、拉美与加勒比 153、非洲 112、阿拉伯国家 97 处（含少量跨国遗产跨地区计）。
- **中国子集（2025世界遗产名录数据集_中国）**：共 **59** 处，含泰山、长城、明清故宫、莫高窟、秦始皇陵及兵马俑坑、黄山、九寨沟等。

每个数据集属性表含 **49 个字段**，核心字段包括：`name_zh` / `name_en`（中英文名称）、`category`（遗产类别 Cultural/Natural/Mixed）、`criteria_t`（遴选标准 i–x）、`region_en`（所属地区）、`states_nam`（所属国家）、`date_inscr`（列入年份）、`longitude` / `latitude`（中心点经纬度）、`danger`（是否濒危）、`iso_code`（ISO 国家代码）等，可直接按类别、地区、国家筛选统计或在地图上分级设色。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-20-sjyc_1.jpg" alt="sjyc_1" style="zoom:50%;" />



## 坐标系与格式

所有图层统一采用 **GCS_WGS_1984 / EPSG:4326** 地理坐标系（经纬度），`.prj` 投影文件随包附带，无需自行定义投影。每个数据集配套 `.shp / .shx / .dbf / .prj / .cpg` 齐全，全球数据集另含 `.sbn / .sbx` 空间索引与 `.xml` 元数据，文本编码由 `.cpg` 指定（UTF-8），中文名称可直接正常显示。

## 使用方法

1. **QGIS / ArcGIS**：直接「添加矢量图层」选择 .shp 即可加载，可按 `category` 分级设色区分文化 / 自然 / 混合遗产，或按 `region_en` 做分大洲统计。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，配合 `matplotlib` / `keplergl` 出图，或按国家 / 地区做数量统计、核密度分析。
3. **WebGIS 可视化**：经 `tippecanoe` 转为 MBTiles / Vector PG，或导入 MapLibre / Leaflet / Cesium 做世界遗产分布交互地图。
4. **教学与科普**：配合 `longitude` / `latitude` 中心点快速定位至 Google Earth / 天地图，制作世界遗产巡礼专题。

## 使用须知

- 本数据属 **UNESCO 世界遗产中心公开数据集**，公开使用建议标注来源（UNESCO World Heritage Centre）与数据年份；属性字段的官方释义以 UNESCO 发布文档为准。
- 数据为点 / 面要素的空间表达，**不得**在制作涉及中国及其周边区域的地图时改动国界、行政界线与南海十段线画法，公开用途须遵守《地图管理条例》与测绘成果保密相关规定。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异；用于正式出版或教学挂图前，建议核对最新官方数据与坐标基准。
- 数据仅供学习、科研与教学制图参考，商业用途请自行向数据提供方申请授权。

## 适用场景

世界遗产分布专题图、文化遗产 / 自然遗产空间格局研究、地理与历史教学科普、文旅路线可视化、UNESCO 名录数据的新闻与报告配图、QGIS / ArcGIS 入门空间分析练习等。
