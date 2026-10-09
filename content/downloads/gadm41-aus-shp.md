---
slug: gadm41-aus-shp
title: GADM 4.1 澳大利亚行政区划矢量数据 SHP（国界 / 州领地 / 地方政府区三级，WGS84）
summary: GADM 4.1 澳大利亚行政区划数据集，含国界、6 州 + 5 领地、568 个地方政府区（LGA）三级 Shapefile，WGS84 地理坐标系，UTF-8 编码，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 澳大利亚, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM澳大利亚
keywordAliases: 澳大利亚行政区划, 澳大利亚行政区shp, 澳大利亚SHP
code: NSH-GIS-020
download: https://pan.baidu.com/s/1gTD0oB6yV7fy0DgfR32X4A?pwd=hgzc
downloadType: baidu
panCode: hgzc
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-aus-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 50.5 MB
---

> 本数据集为 GADM（Global Administrative Areas，全球行政区划数据库）v4.1 的**澳大利亚**部分，以 Shapefile 格式提供三级行政区划边界，压缩包约 **50.5 MB（52,947,189 字节）**，共 15 个文件。GADM 是国际学术界广泛引用的全球行政区划数据项目，覆盖全球 400+ 国家和地区的高精度行政边界，**仅限学术研究等非商业用途**（详见使用须知）。本文所有数字均经 Python pyshp 逐要素实算，非官方文档转述。

![aus_0](https://blogphoto.planetgis.cn/PicGo/2026-10-08-aus_0.jpg)

![aus_1](https://blogphoto.planetgis.cn/PicGo/2026-10-08-aus_1.jpg)

![aus_2](https://blogphoto.planetgis.cn/PicGo/2026-10-08-aus_2.jpg)

## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`，齐全）：

- **Level 0（国界）**：1 个要素，澳大利亚全国边界（含海外属地范围），字段为 `GID_0`（国家代码 AUS）与 `COUNTRY`（国家名）。
- **Level 1（州 / 领地）**：**11 个要素** = **6 个州（State）** + **5 个领地（Territory）**。6 州为新南威尔士、维多利亚、昆士兰、南澳大利亚、西澳大利亚、塔斯马尼亚；5 领地为北领地、首都领地（ACT）、杰维斯湾领地、珊瑚海群岛领地、阿什莫尔和卡捷群岛。字段含 `NAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（ISO 3166-2 代码）、`HASC_1` 等 11 个。
- **Level 2（地方政府区 LGA）**：**568 个要素**，即澳大利亚的 Local Government Area 一级。类型构成（按 `TYPE_2` 实算）：Shire 199、City 129、Area 104、District Council 41、Region 31、Municipality 27、Town 15、Rural City 8、Unincorporated Area 4、Territory 3、Aboriginal Council 2，另有 Regional Council、State reserve、Borough、Islands 各 1。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`CC_2`（统计区代码）、`HASC_2` 等 13 个。

三个层级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套（如 `AUS.4.130_1` 表示新南威尔士州第 130 个 LGA），可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-08-aus_list.jpg" alt="aus_list" style="zoom:67%;" />

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带，无需自行定义投影。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，QGIS / ArcGIS / Python 打开无乱码。
- 几何类型：三层数据均为 POLYGON（MultiPolygon）。全国范围经度 112.92°E—159.11°E，纬度 -55.12°—-9.14°（南至麦夸里岛，东至豪勋爵岛以东海域）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`，按 `TYPE_1` 区分州与领地，按 `TYPE_2` 对 LGA 分级设色；与人口 / 经济表通过 `CC_2` 或 `NAME_2` 做表连接即可出专题图。
2. **Python 空间分析**：`geopandas.read_file("gadm41_AUS_2.shp")` 读取，配合 `geopandas.sjoin` 把站点 / 网格数据挂到行政区，或用 `dissolve(by="NAME_1")` 聚合到州级。
3. **WebGIS**：经 `tippecanoe` 或 `ogr2ogr` 转 GeoJSON / MBTiles 后接入 MapLibre / Leaflet，做可点选的行政区划查询。

## 已知数据瑕疵（实测发现）

- L2 中新南威尔士的「Unincorporated New South Wales」要素，其 `TYPE_2` 字段值为 `Unincorporated AreaUnincorporate`（源数据字符串拼接错误），按类型统计或筛选时需注意该值。
- 麦夸里岛（State reserve）、Queenscliffe（Borough）、Scott and Seringapatam Reefs（Islands）等非典型 LGA 类型一并计入 L2 共 568 个，与其他统计口径（如 ABS 官方 537 个 LGA）存在出入，属 GADM 整合各州数据的自然结果。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据亦未标注任何审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

澳大利亚区域地理教学、LGA 尺度的人口 / 气候 / 生态专题制图、空间插值与区域统计、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [澳大利亚行政区划互动地图](/maps/au-regions)
