---
slug: gadm41-kor-shp
title: GADM 4.1 韩国行政区划矢量数据 SHP（国界 / 17 个道市 / 229 个市郡区 / 3503 个洞邑面四级，含韩文汉字名，WGS84）
summary: GADM 4.1 韩国行政区划数据集，含国界、17 个一级行政区、229 个市郡区、3503 个邑面洞四级 Shapefile，NL_NAME_1 字段以「韩文 | 汉字」双写形式给出官方名称，WGS84 坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 韩国, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM韩国
keywordAliases: 韩国行政区划, 韩国SHP, 韩国行政区shp
code: NSH-GIS-023
download: https://downloads.planetgis.cn/GIS/gadm41_KOR_shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 17.7 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**韩国（大韩民国）**部分，共 **4 个行政层级**、20 个文件，压缩包约 **17.7 MB（18,546,868 字节）**。最大亮点：一级行政区的 `NL_NAME_1` 字段以「韩文 | 汉字」双写形式给出官方名称（`부산광역시 | 釜山廣域市`），17 条全部有值，中文使用者可直接当作地名对照表。本文所有数字均经 Python 逐要素实算（含环数、顶点数），非官方文档转述。

![hp_1](/shots/gadm41-kor-shp/hp_1.jpg)

![hp_2](/shots/gadm41-kor-shp/hp_2.jpg)

## 数据内容

包内按行政层级分为 4 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，全部国土边界，由 1,316 个环、237,119 个顶点构成。字段 `GID_0`（KOR）、`COUNTRY`（South Korea）。
- **Level 1（道 / 广域市）**：**17 个要素** = 9 个道级单位（8 个以 `-do` 结尾的道 + 济州）+ 6 个广域市 + 首尔特别市 + 世宗特别自治市，与韩国现行 17 个一级行政区口径一致。字段 11 个，含 `NAME_1`、`VARNAME_1`（罗马字变体）、`NL_NAME_1`（韩文 + 汉字双写）、`TYPE_1 / ENGTYPE_1`、`HASC_1`（`KR.PU` 式）、`ISO_1`（`KR-11` 式，17 条全部有值）。
- **Level 2（市 / 郡 / 区）**：**229 个要素**。按 `TYPE_2` 实算：Gun（郡）82、Si（市）76、Gu（区）69，另有 **2 条 `TYPE_2` 为 NA** 的非标准记录。字段 13 个。
- **Level 3（邑 / 面 / 洞）**：**3,503 个要素**。按 `TYPE_3` 实算：Dong（洞）2,091、Myeon（面）1,186、Eup（邑）226。字段 16 个，含 `GID_1 / NAME_1 / GID_2 / NAME_2` 等上级回溯字段。

四级通过 `GID_0 → GID_1 → GID_2 → GID_3` 编码严格逐级嵌套（如 `KOR.1.1.1_2`），可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带，无需自行定义投影。
- 文本编码：`.cpg` 指定 **UTF-8**，韩文与汉字直接以 UTF-8 存储，QGIS / ArcGIS / Python 打开无乱码。
- 几何类型：POLYGON（MultiPolygon）。国土范围经度 124.61°E—131.87°E，纬度 33.11°N—38.61°N（含济州岛及西南海域诸多离岛）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；一级行政区按 `NAME_1` 设色，市郡区按 `TYPE_2` 分类渲染，标注用 `NL_NAME_1` 可得到汉字名。
2. **Python 空间分析**：`geopandas.read_file("gadm41_KOR_2.shp")` 读取，配合 `sjoin` 把人口 / 经济数据挂到市郡区，或用 `dissolve(by="NAME_1")` 聚合到道市级。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 后接入 MapLibre / Leaflet；3,503 个邑面洞体量适中，前端可整体渲染并支持点选查询。

## 已知数据瑕疵（实测发现）

- **世宗（Sejong）的 `TYPE_1` 为 `Do`**，但 `ENGTYPE_1` 是 `Metropolitan Autonomous City`，同一行的类型字段自相矛盾。
- **蔚山（Ulsan）的 `TYPE_1` 直接写作 `Metropolitan City`**，其余 5 个广域市统一为 `Gwangyeoksi`，同类不同写，按类型筛选时需注意。
- L2 存在 **2 条 `TYPE_2 = NA`** 的记录；与官方口径（基础自治体约 226 个：市 75 / 郡 82 / 区 69）做严格统计前需先剔除。
- `NL_NAME_2` 与 `NL_NAME_3` **全为空**（229 条、3,503 条均无值），只有一级行政区带韩文汉字双写名。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

朝鲜半岛区域地理教学、市郡区尺度的人口与灾害统计制图、韩文—汉字地名对照与译名整理、遥感影像行政区裁剪、中日韩跨国研究中的行政单元对齐等。
