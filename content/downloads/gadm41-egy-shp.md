---
slug: gadm41-egy-shp
title: GADM 4.1 埃及行政区划矢量数据 SHP（国界 / 27 省 / 343 个区两级，含阿拉伯语原名，WGS84）
summary: GADM 4.1 埃及行政区划数据集，含国界、27 个省（Muhafazah）、343 个区（Markaz / Kism）两级 Shapefile，NL_NAME_1 字段自带阿拉伯语原名，WGS84 坐标系，UTF-8 编码，可用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 埃及, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM埃及
keywordAliases: 埃及行政区划, 埃及SHP, 埃及行政区shp
code: NSH-GIS-026
download: https://downloads.planetgis.cn/GIS/gadm41_EGY_shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.8 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**埃及**部分，**2 个行政层级**（加国界共 3 级）、15 个文件，压缩包仅约 **1.8 MB（1,925,035 字节）**，是尼罗河流域与北非区域研究中最轻量的一份行政底图。一级省名带阿拉伯语原名（`NL_NAME_1`，如 `الدقهلية`），可直接做地名对照。本文所有数字均经 Python 逐要素实算（含环数、顶点数），非官方文档转述。

![hp_1](/shots/gadm41-egy-shp/hp_1.jpg)

![hp_2](/shots/gadm41-egy-shp/hp_2.jpg)

## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，由 58 个环、117,090 个顶点构成。字段 `GID_0`（EGY）、`COUNTRY`（Egypt）。
- **Level 1（省 / Muhafazah）**：**27 个要素**，全部 `TYPE_1 = Muhafazah`、`ENGTYPE_1 = Governorate`，与埃及现行 27 个省级单位口径一致（含 `Al Wadi al Jadid` 新河谷省，其面积约占全国三分之二；以及 `Janub Sina'` / `Shamal Sina'` 两个西奈省）。字段 11 个，含 `NAME_1`、`VARNAME_1`（多种拉丁拼写变体）、`NL_NAME_1`（阿拉伯语原名，**20/27 有值**）、`HASC_1`（`EG.DQ` 式）、`ISO_1`（`EG-DK` 式）。
- **Level 2（区）**：**343 个要素**。按 `TYPE_2` 实算：`Markaz`（乡村行政区）159、`Kism`（城市分区）158、`unorganized`（未划区）14、`City`（市）9、`Police-administered area`（警察管辖区）3。

两级通过 `GID_0 → GID_1 → GID_2` 编码逐级嵌套（如 `EGY.1.1_1`），可聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**；阿拉伯语字符正常存储，QGIS / ArcGIS / Python 打开无乱码（建议出图时选用支持阿拉伯语的字库）。
- 几何类型：POLYGON（MultiPolygon）。范围经度 24.70°E—36.25°E，纬度 21.73°N—31.67°N（东南含红海诸岛，西部覆盖利比亚边境沙漠地带）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；省级按 `NAME_1` 设色，区级用 `TYPE_2` 区分城乡（`Markaz` 为乡村，`Kism` 为城区）。
2. **Python 空间分析**：`geopandas.read_file("gadm41_EGY_2.shp")` 读取，`dissolve(by="NAME_1")` 聚合到省，或 `sjoin` 挂载人口 / 耕地 / 水权分配数据做尼罗河三角洲专题图。
3. **WebGIS**：343 个面体量极小，`ogr2ogr` 转 GeoJSON 后前端可整体渲染并支持点选查询。

## 已知数据瑕疵（实测发现）

- **`ENGTYPE_2` 全部为 `Subdivision`**，把乡村行政区（Markaz）与城市分区（Kism）混为同一个英文类型；要区分城乡，**必须使用 `TYPE_2`**，不能依赖 `ENGTYPE_2`。
- L2 含 **14 条 `unorganized`（未划区）** 与 **3 条 `Police-administered area`（警察管辖区）**，属西部沙漠与边境地带的非标准行政单元，做正式区划统计前应先剔除。
- `NL_NAME_1` 覆盖率约 74%（20/27 有阿拉伯语原名），`NL_NAME_2` **全为空**，二级区名只有拉丁转写。
- 一级省名使用阿拉伯语的拉丁转写（如 `Al Qahirah` = 开罗、`Al Iskandariyah` = 亚历山大），与国内常用中文译名不完全对应，配套 `VARNAME_1` 可辅助匹配。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

北非与尼罗河流域区域地理教学、省 / 区尺度的人口与耕地统计制图、阿拉伯语—拉丁地名对照、遥感影像行政区裁剪（如三角洲城市扩张监测）、跨国研究中东北非行政单元对齐等。
