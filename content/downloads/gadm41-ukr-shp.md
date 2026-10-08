---
slug: gadm41-ukr-shp
title: GADM 4.1 乌克兰行政区划矢量数据 SHP（国界 / 28 个州级 / 629 个区市两级，含西里尔原名，WGS84）
summary: GADM 4.1 乌克兰行政区划数据集，含国界、28 个州级单位、629 个区 / 市级单位两级 Shapefile，NL_NAME 字段自带西里尔原名，WGS84 坐标系，UTF-8 编码，可用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 乌克兰, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM乌克兰
keywordAliases: 乌克兰行政区划, 乌克兰SHP, 乌克兰行政区shp
code: NSH-GIS-025
download: https://downloads.planetgis.cn/GIS/gadm41_UKR_shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 3.1 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**乌克兰**部分，**3 个行政层级**、15 个文件，压缩包约 **3.1 MB（3,230,416 字节）**，体量轻、加载快。一级单位带西里尔文原名（`NL_NAME_1`，如 `Черкаська`），适合做地名转写对照；同时需特别注意其**区级结构是 2020 年行政区划改革前的旧口径**（详见「已知数据瑕疵」）。本文所有数字均经 Python 逐要素实算（含环数、顶点数），非官方文档转述。

![hp_1](/shots/gadm41-ukr-shp/hp_1.jpg)

![hp_2](/shots/gadm41-ukr-shp/hp_2.jpg)

## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，由 65 个环、123,275 个顶点构成。字段 `GID_0`（UKR）、`COUNTRY`（Ukraine）。
- **Level 1（州级）**：**28 个要素**。按 `TYPE_1` 实算：`Oblast'`（州）24、`Autonomous Republic`（自治共和国）2、`Independent City`（独立市）1，另有 **1 条 `TYPE_1 = ?` 的异常记录**。字段 11 个，含 `NAME_1`、`VARNAME_1`（拉丁转写变体）、`NL_NAME_1`（西里尔原名，27/28 有值）、`HASC_1`（`UA.CK` 式）。
- **Level 2（区 / 市）**：**629 个要素**。按 `TYPE_2` 实算：`Raion`（区）497、`Misto`（市）71、`Mis'ka Rada`（市议会辖区）60，另有 **1 条 `TYPE_2 = ?`**。字段 13 个，含 `GID_1 / NAME_1` 回溯字段与 `HASC_2`（`UA.CK.CM` 式）。

两级通过 `GID_0 → GID_1 → GID_2` 编码逐级嵌套（如 `UKR.1.1_1`），可聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**；西里尔字母正常存储。同时提供 `VARNAME_1` 拉丁转写字段（如 `Cherkas'ka Oblast'`），方便不熟悉西里尔的场景。
- 几何类型：POLYGON（MultiPolygon）。范围经度 22.14°E—40.22°E，纬度 44.39°N—52.38°N。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」；`NAME_1` 做州级设色，`TYPE_2` 区分区（Raion）与市（Misto / Mis'ka Rada）。
2. **Python 空间分析**：`geopandas.read_file("gadm41_UKR_2.shp")` 读取，`dissolve(by="NAME_1")` 聚合到州级，或 `sjoin` 挂载人口 / 农业统计做专题图。
3. **WebGIS**：629 个面体量很小，`ogr2ogr` 转 GeoJSON 后前端可整体渲染并支持点选。

## 已知数据瑕疵（实测发现）

- **区级结构为 2020 年改革前口径**：L2 的 497 个 `Raion` 对应旧区划（改革前全国约 490 个区，2020 年 7 月合并为 136 个）。做**现行**口径的区域统计，必须自行按新区（raion）重新归并，不能直接使用本层。
- **存在 11 条命名异常记录**：1 条 L1 与 1 条 L2 记录的全部字段值为 `?`；L2 另有 10 条 `NAME_2` 为 `n.a. ( 181)` 这类占位符，做名称匹配或分区统计前应先剔除。
- `NL_NAME_2` 覆盖率极低：629 条中仅 25 条有西里尔原名，二级单位基本只有拉丁转写名。
- ✋ **政治敏感性提示**：本数据包含 Crimea（列为自治共和国）与 `Sevastopol'`（列为独立市）等条目，其**归属与界线画法完全沿用 GADM 源数据口径，不代表任何立场**。涉及相关区域及任何国界的正式制图，请以中国官方发布及自然资源部标准地图服务为准。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

东欧区域地理教学、州（Oblast）尺度的人口与农业 / 土地覆盖统计制图、西里尔—拉丁地名转写对照、遥感影像行政区裁剪、跨国研究中东欧行政单元对齐等。
