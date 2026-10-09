---
slug: gadm41-can-shp
title: GADM 4.1 加拿大行政区划矢量数据 SHP（国界 / 13 省级 / 293 分区 / 5581 三级，WGS84）
summary: GADM 4.1 加拿大行政区划数据集，四级 Shapefile：国界、10 省 + 3 地区、293 个二级行政区、5581 个三级单元，最北至北纬 83°，WGS84 坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-09
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 加拿大, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM加拿大
keywordAliases: 加拿大行政区划, 加拿大SHP, 加拿大shp
code: NSH-GIS-030
download: https://pan.baidu.com/s/1bpguIwu8sNe03suanZLGow?pwd=tg2b
downloadType: baidu
panCode: tg2b
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-can-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 138.5 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**加拿大**部分，四级 Shapefile 共 18 个文件，压缩包约 **138.5 MB（138,486,911 字节）**。加拿大是「省—县」制：一级 10 省 + 3 地区，往下是人口普查区 / 县一级。数据北至北纬 83.1°（伊丽莎白女王群岛），北极群岛的破碎海岸线是这份数据几何精细度的主要来源。本文所有数字均经 Python geopandas 逐要素实算，非官方文档转述。



## 数据内容

包内按行政层级分为 4 个独立 Shapefile：

- **Level 0（国界）**：1 个要素，加拿大全国边界。字段 `GID_0`（CAN）、`COUNTRY`。
- **Level 1（省级）**：**13 个要素**，10 个省（Province）+ 3 个地区（Territory：西北地区、育空、努纳武特）。字段含 `NAME_1`、`VARNAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（如 CA-ON 安大略）、`HASC_1`、`CC_1` 等 12 个。
- **Level 2**：**293 个要素**，县级 / 普查区一级（county / regional municipality / census division 等）。
- **Level 3**：**5581 个要素**，更细的市镇 / 乡一级单元，是全包体量的主要来源。

各层级通过 `GID_0 → GID_1 → GID_2 → GID_3` 编码严格逐级嵌套（如 `CAN.1.2.1_1`），字段含各级 `NAME_x / VARNAME_x / TYPE_x / ENGTYPE_x / HASC_x`。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带（L2 除外，见「已知数据瑕疵」）。
- 文本编码：L2 无 `.cpg`，其余各级为 **UTF-8**，属性表英文存储。
- 几何类型：POLYGON（MultiPolygon）。范围经度 -141.01°—-52.62°，纬度 41.68°N—83.11°N，全国轮廓面积约 **995.5 万 km²**（EPSG:6933 等面积投影实算），居世界第二。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；做加拿大专题图通常选 L1（13 个单元），L2 / L3 用于县级与市镇尺度分析（L3 有 5581 要素，建议先建空间索引）。
2. **Python 空间分析**：`geopandas.read_file("gadm41_CAN_3.shp", encoding="utf-8")`（L2 需手动指定坐标系，见下文）；`dissolve(by="NAME_1")` 聚合到省。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；高纬度区域建议换等面积投影再渲染，避免墨卡托下被过度放大。

## 已知数据瑕疵（实测发现，重要）

- **Level 2 缺 `.prj` 与 `.cpg`**：`gadm41_CAN_2` 只含 `.shp / .shx / .dbf` 三个文件。QGIS 加载时会提示未定义坐标系，手动指定 EPSG:4326 即可；`.dbf` 为标准 ASCII，读表不受影响。
- 北部高纬岛屿（伊丽莎白女王群岛等）多边形极碎，L1 中努纳武特地区一个要素就含数千个环，简化几何时注意保底最小面积，避免小岛全部消失。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

加拿大区域地理教学、省级 / 县级人口与资源统计制图、北方针叶林与冻土研究的行政区裁剪、极地航运与原住民聚落分析、与美墨等北美数据包的跨国行政框架对齐。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [加拿大行政区划互动地图](/maps/can-regions)


