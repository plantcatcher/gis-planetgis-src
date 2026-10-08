---
slug: gadm41-mng-shp
title: GADM 4.1 蒙古国行政区划矢量数据 SHP（国界 / 22 个省市级 / 327 个苏木，含西里尔原名，WGS84）
summary: GADM 4.1 蒙古国行政区划数据集，含国界、22 个省市一级单位、327 个苏木（Soum）二级单位 Shapefile，二级单位带蒙古西里尔原名，WGS84 坐标系，UTF-8 编码，压缩包仅 0.49 MB，可用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 蒙古, 蒙古国, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM蒙古
keywordAliases: 蒙古行政区划, 蒙古SHP, 蒙古国行政区shp
code: NSH-GIS-028
download: https://downloads.planetgis.cn/GIS/gadm41_MNG_shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 0.49 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**蒙古国**部分，**3 个行政层级**、15 个文件，压缩包仅约 **0.49 MB（516,176 字节）**，是这批国家包里最轻量的一份——全国边界只有 2 个环、6,360 个顶点，加载与渲染几乎无压力。亮点在于二级苏木（Soum）层自带**蒙古西里尔原名**（`NL_NAME_2`，如 `Батцэнгэл`），共 325/327 条有值，适合做地名转写对照。本文所有数字均经 Python 逐要素实算（含环数、顶点数），非官方文档转述。

![hp_1](/shots/gadm41-mng-shp/hp_1.jpg)

![hp_2](/shots/gadm41-mng-shp/hp_2.jpg)

## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，仅由 2 个环、6,360 个顶点构成（国土轮廓高度概括，适合做小比例尺底图，大比例尺制图建议搭配更高精度边界）。字段 `GID_0`（MNG）、`COUNTRY`（Mongolia）。
- **Level 1（省 / 市）**：**22 个要素**。按 `TYPE_1` 实算：`Aimag`（省）18、`Hot`（市，英文类型 `Municipality`）4，即达尔汗乌拉（Darhan-Uul）、戈壁苏姆贝尔（Govisümber）、鄂尔浑（Orhon）与首都乌兰巴托（Ulaanbaatar）。字段 11 个，含 `NAME_1`、`VARNAME_1`、`TYPE_1 / ENGTYPE_1`、`HASC_1`（`MN.AR` 式）。
- **Level 2（苏木 / Soum）**：**327 个要素**，全部为 `Soum` 类型（英文 `Sum`）。字段 13 个，含 `NAME_2`、`VARNAME_2`、`NL_NAME_2`（西里尔原名，**325/327 有值**）、`HASC_2`（`MN.AR.BA` 式）。一级下苏木最多的是中央省（Töv）26 个、库苏古尔省（Hövsgöl）24 个、扎布汗省（Dzavhan）23 个。

三级通过 `GID_0 → GID_1 → GID_2` 编码逐级嵌套（如 `MNG.1_1` → `MNG.1.1_1`），可任意聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，西里尔字母（`Батцэнгэл`）与拉丁变音字符（`Ömnögovi`）均正常存储。
- 几何类型：POLYGON（MultiPolygon）。范围经度 87.75°E—119.92°E，纬度 41.57°N—52.15°N（西至阿尔泰山区，东至东部草原边境）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」；省级按 `NAME_1` 设色，苏木级（327 个面）可整体渲染，标注用 `NL_NAME_2` 得到西里尔名。
2. **Python 空间分析**：`geopandas.read_file("gadm41_MNG_2.shp")` 读取苏木，`dissolve(by="NAME_1")` 聚合到省，或 `sjoin` 挂载牲畜存栏、NDVI、荒漠化监测等栅格统计结果。
3. **WebGIS**：数据量极小，`ogr2ogr` 转 GeoJSON 后可直接前端加载并支持点选查询。

## 已知数据瑕疵（实测发现）

- **一级单位类型口径与官方略有出入**：GADM 把达尔汗乌拉、戈壁苏姆贝尔、鄂尔浑与乌兰巴托列为 `Hot`（市 / Municipality），其余 18 个列为 `Aimag`（省）。而蒙古官方行政序列通常表述为「21 个省 + 首都乌兰巴托」共 22 个一级单位，与 GADM 的 18 + 4 分类方式不同，跨源统计时需先统一口径。
- **苏木数量与官方口径存在差异**：本数据 L2 为 327 个，蒙古官方公布的苏木（soum）数量约 330 个（随年度撤并略有变化）。
- **一级单位名使用旧式拉丁转写**：如 `Dzavhan`（今多写 Zavkhan）、`Övörhangay`（今多写 Uvurkhangai）、`Arhangay`，与现行常用拼写不一致，做名称匹配建议同时参照 `VARNAME_1`。
- `NL_NAME_1` **全为空**（22 条均无西里尔名），西里尔原名只存在于二级苏木层（325/327）。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

蒙古高原与中蒙边境区域地理教学、苏木尺度的人口 / 牲畜 / 荒漠化统计制图、西里尔—拉丁地名对照、遥感影像行政区裁剪、跨国研究中东北亚行政单元对齐等。
