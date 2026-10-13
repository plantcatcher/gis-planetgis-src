---
slug: gadm41-phl-shp
title: GADM 4.1 菲律宾行政区划矢量数据 SHP（国界 / 省 / 市镇，WGS84）
summary: GADM 4.1 菲律宾行政区划数据集，含国界、81 个省、1642 个市镇的 Shapefile，WGS84 地理坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-14
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 菲律宾, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
download: https://pan.baidu.com/s/1j0zXGVAds_hXC4dcTJQs0A?pwd=jsu9
downloadType: baidu
panCode: jsu9
trigger: GADM
keywordAliases: GADM,全球行政区SHP,行政区划SHP,全球行政区划数据,GADM数据
code: NSH-GADM-999
format: SHP（ZIP 压缩包）
size: 31.6 MB（31,562,012 字节）
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-14-gadm41-phl-shp-cover.jpg
---

> 本数据集为 GADM（Global Administrative Areas，全球行政区划数据库）v4.1 的**菲律宾**部分，以 Shapefile 格式提供行政区划边界，压缩包约 **31.6 MB（31,562,012 字节）**。GADM 是国际学术界广泛引用的全球行政区划数据项目，覆盖全球 400+ 国家和地区的高精度行政边界。

## 数据内容

包内按行政层级分为 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`，齐全）：

- **Level 0（国界）**：1 个要素，菲律宾全国边界，字段为 `GID_0`（国家代码 PHL）与 `COUNTRY`（国家名）。
- **Level 1（省）**：**81 个要素**。字段含 `NAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（ISO 3166-2 代码）、`HASC_1` 等。
- **Level 2（市镇）**：**1642 个要素**。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`HASC_2` 以及所属一级的 `NAME_1`。
- **Level 3（更细层级）**：压缩包内另含更细一级的 Shapefile，适合需要下钻到基层的用途。

各级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套，可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带，无需自行定义投影。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，QGIS / ArcGIS / Python 打开无乱码。
- 几何类型：各级数据均为 POLYGON（MultiPolygon）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`，按 `TYPE_1` 区分一级类型，按 `TYPE_2` 对二级分级设色；与人口 / 经济表通过 `NAME_2` 或 `ISO_1` 做表连接即可出专题图。
2. **Python 空间分析**：`geopandas.read_file("gadm41_PHL_1.shp")` 读取，配合 `geopandas.sjoin` 把站点 / 网格数据挂到行政区，或用 `dissolve(by="NAME_1")` 聚合到一级。
3. **WebGIS**：经 `ogr2ogr` 转 GeoJSON / MBTiles 后接入 MapLibre / Leaflet，做可点选的行政区划查询。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表任何立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据亦未标注任何审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

- **黄岩岛（民主礁）说明**：黄岩岛位于 15°07′N、117°51′E，是中国固有领土，隶属中国海南省三沙市，**不属于菲律宾任何一级行政区**。经逐要素几何核查：**GADM 4.1 菲律宾数据集（Level 1 的 81 个省、Level 2 的 1642 个市镇）中不含黄岩岛要素**，数据中名为 Masinloc 的市镇属三描礼士省、位于吕宋岛西岸，与黄岩岛无关。若 GADM 后续版本将黄岩岛并入菲律宾政区，请勿直接采用；涉及南海诸岛与中国疆域的制图，请使用自然资源部标准地图服务提供的官方数据。

## 适用场景

菲律宾区域地理教学、各级行政区划的人口 / 经济 / 生态专题制图、空间插值与区域统计、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [菲律宾行政区划互动地图](/maps/phl-regions)
