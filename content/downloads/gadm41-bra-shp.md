---
slug: gadm41-bra-shp
title: GADM 4.1 巴西行政区划矢量数据 SHP（国界 / 27 州级 / 5572 市镇，WGS84）
summary: GADM 4.1 巴西行政区划数据集，含国界、27 个州级单元（26 州 + 联邦区）、5572 个市镇三级 Shapefile，WGS84 坐标系，附 ISO/HASC 行政编码，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-09
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 巴西, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM巴西
keywordAliases: 巴西行政区划, 巴西SHP, 巴西shp
code: NSH-GIS-029
download: https://pan.baidu.com/s/1DTtPqQx1NGRDMxd-K3fSNA?pwd=tc3s
downloadType: baidu
panCode: tc3s
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-bra-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 212.6 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**巴西**部分，三级 Shapefile 共 15 个文件，压缩包约 **212.6 MB（212,631,948 字节）**。巴西是「州—市镇」两级扁平结构，没有中间的地级行政区，做国土尺度分析时一级 27 个单元就能聚合出绝大多数专题。本文所有数字均经 Python geopandas 逐要素实算，非官方文档转述。



## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，巴西全国边界。字段 `GID_0`（BRA）、`COUNTRY`。
- **Level 1（州级）**：**27 个要素**，即 26 个州（State）+ 1 个联邦区（Federal District，首都巴西利亚所在）。字段含 `NAME_1`、`VARNAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（如 BR-SP 圣保罗）、`HASC_1`、`CC_1` 等 12 个。
- **Level 2（市镇）**：**5572 个要素**，即 município——巴西最基础的自治体一级。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`CC_2`、`HASC_2` 等 14 个。

各层级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套（如 `BRA.1.1_1`），可任意聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，无乱码。
- 几何类型：POLYGON（MultiPolygon）。范围经度 -73.99°—-28.85°，纬度 -33.75°—5.26°N，全国轮廓面积约 **850.9 万 km²**（EPSG:6933 等面积投影实算），居世界第五。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；做巴西专题图通常选 L1（27 个单元）即可，L2 用于市镇尺度的精细分析（5572 要素，建议先建空间索引）。
2. **Python 空间分析**：`geopandas.read_file("gadm41_BRA_2.shp")`；`sjoin` 挂载人口 / 环境监测点数据，`dissolve(by="NAME_1")` 聚合到州。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；L2 建议先简化几何（`mapshaper -simplify`）再上线。

## 已知数据瑕疵（实测发现）

- **L2 市镇数量为 5572**，与巴西官方现行 5570 个市镇的口径略有出入，源于 GADM 4.1 的数据基准年代不同；做严格逐年统计时需自行核对当年市镇名录。
- 部分市镇多边形顶点较密（亚马孙雨林区沿河界线），L2 单文件体积占全包九成以上，Web 端使用务必先简化。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

巴西区域地理教学、州级 / 市镇尺度的人口与农业统计制图、亚马孙流域森林变化监测的行政区裁剪、葡萄牙语地名与中文译名对照、金砖国家研究中的行政单元对齐。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [巴西行政区划互动地图](/maps/bra-regions)
