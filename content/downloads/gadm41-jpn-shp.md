---
slug: gadm41-jpn-shp
title: GADM 4.1 日本行政区划矢量数据 SHP（国界 / 47 都道府县 / 1811 市町村，含日文汉字名，WGS84）
summary: GADM 4.1 日本行政区划数据集，含国界、47 个都道府县、1811 个市町村三级 Shapefile，NL_NAME 字段自带日文汉字名（愛知県 / 阿久比町），WGS84 坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 日本, 行政区划, 都道府县, 市町村, SHP, WGS84, QGIS, 地理数据
access: gated
trigger: GADM日本
keywordAliases: 日本行政区划, 日本SHP, 都道府县shp
code: NSH-GIS-022
download: https://downloads.planetgis.cn/GIS/gadm41_JPN_shp.zip
downloadAlt: https://pan.baidu.com/s/1I1dPJuFjINKixmzDmFoHBw?pwd=e4ki
downloadAltType: baidu
downloadAltCode: e4ki
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-jpn-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 17.4 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**日本**部分，三级 Shapefile 共 15 个文件，压缩包仅约 **17.4 MB（18,268,989 字节）**，是三国包里最轻量的一份。亮点：属性表的 `NL_NAME_1 / NL_NAME_2` 字段自带**日文汉字名**（愛知県、長崎県、阿久比町），中文使用者可以拿来当地名对照表。本文所有数字均经 Python pyshp 逐要素实算，非官方文档转述。



![jpn_0](https://blogphoto.planetgis.cn/PicGo/2026-10-08-jpn_0.jpg)

![jpn_1](https://blogphoto.planetgis.cn/PicGo/2026-10-08-jpn_1.jpg)

![jpn_2](https://blogphoto.planetgis.cn/PicGo/2026-10-08-jpn_2.jpg)

## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，日本全国边界。字段 `GID_0`（JPN）、`COUNTRY`。
- **Level 1（都道府县）**：**47 个要素**，即「1 都 1 道 2 府 43 县」：To（東京都）1、Do（北海道）1、Fu（京都府 / 大阪府）2、Ken（县）43——与日本官方口径完全一致。字段含 `NAME_1`、`NL_NAME_1`（日文汉字）、`TYPE_1 / ENGTYPE_1`、`ISO_1`（如 JP-23 爱知）、`HASC_1` 等 11 个。
- **Level 2（市町村）**：**1811 个要素**，即基础自治体一级。类型构成（按 `TYPE_2` 实算）：Machi（町）851、Shi（市）772、Mura（村）155、Special Ward（东京 23 特别区）23、Shichō（支厅）4、Water body 2、Gun（郡）2、Capital 1、Son 1。字段含 `NAME_2`、`NL_NAME_2`（日文汉字町村名）、`TYPE_2 / ENGTYPE_2` 等 13 个。

各层级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套（如 `JPN.1.1_1` 为爱知县第一个市町村），可任意聚合或下钻。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-08-jpn_list.jpg" alt="jpn_list" style="zoom:67%;" />



## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**。日文汉字名直接以 UTF-8 存储，QGIS / ArcGIS / Python 读取无需额外转码。
- 几何类型：POLYGON（MultiPolygon）。范围经度 122.93°E—153.99°E，纬度 24.05°N—45.53°N（西至与那国岛，东至小笠原群岛，南至冲绳以南海域），离岛全部随属县收录（其中含日方单方面划入的钓鱼岛及其附属岛屿，见下文声明，本包为原始数据副本未作删改）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；标注用 `NAME_2`（罗马字）或 `NL_NAME_2`（汉字），配合 `TYPE_2` 做市 / 町 / 村分色。
2. **Python 空间分析**：`geopandas.read_file("gadm41_JPN_2.shp")`；`sjoin` 挂载人口 / 经济 / 灾害点数据，`dissolve(by="NAME_1")` 聚合到都道府县。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；1811 个市町村体量很小，前端可整体渲染并支持点选查询。

## 已知数据瑕疵（实测发现）

- **长崎县的 `NAME_1` 拼写错误**：GADM 4.1 中记作 `Naoasaki`（正确为 Nagasaki），但 `VARNAME_1 = 'Nagasaki'`、`NL_NAME_1 = '長崎県'`、`HASC_1 = 'JP.NS'` 均正确，`ISO_1` 为 `NA`。**按名称筛选长崎时请注意用 VARNAME 或 NL_NAME**。
- L2 中包含 2 个 Water body（水域）、2 个 Gun（郡）与 1 条 Capital 记录，属源数据整理时的非标准条目，做严格市町村统计（官方口径 1718 个，2024 年）时需剔除。

### 关于钓鱼岛及其附属岛屿的声明

**钓鱼岛及其附属岛屿自古以来就是中国的固有领土，中国对其拥有无可争辩的主权。**

本压缩包是 GADM 4.1 日本数据集的**原始未删改副本**：其中 Level 1 的「沖縄県」与 Level 2 的「石垣市」要素内，含有日方单方面划入的钓鱼岛及其附属岛屿多边形。GADM 依其来源口径作图，**该画法不代表也不改变中国政府的立场**，不应作为领土归属的依据；本页提到的「47 都道府县」「1811 市町村」等计数均为对该数据集的客观描述，同样不具任何主权含义。使用者在制图、出版、教学或任何对外场景中：

- 涉及中国领土（含钓鱼岛及其附属岛屿、南海诸岛、台湾岛等）请一律采用自然资源部标准地图服务发布的官方数据；
- 若用本数据制作涉华地图，须按《地图管理条例》送审并取得审图号；
- 本站同源的[日本行政区划互动地图](/maps/jp-regions)已在矢量中剔除上述多边形，可直接对照使用。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**，涉及海域与岛屿归属的表述请以中国官方口径为准；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- **钓鱼岛及其附属岛屿自古以来就是中国的固有领土**，原始数据依日方口径将其并入冲绳县石垣市，不代表对其主权的承认，详见上文声明。

## 适用场景

日本区域地理教学、都道府县 / 市町村尺度的人口与灾害统计制图、地名罗马字—汉字对照、遥感影像行政区裁剪、跨国研究中日韩行政单元对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [日本行政区划互动地图](/maps/jp-regions)
