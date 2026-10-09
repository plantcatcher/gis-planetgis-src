---
slug: gadm41-usa-shp
title: GADM 4.1 美国行政区划矢量数据 SHP（国界 / 51 州级 / 3148 县，WGS84）
summary: GADM 4.1 美国行政区划数据集，三级 Shapefile：国界、50 州 + 哥伦比亚特区共 51 个州级单元、3148 个县级行政区，含阿拉斯加与夏威夷，WGS84 坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-09
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 美国, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM美国
keywordAliases: 美国行政区划, 美国SHP, 美国县shp
code: NSH-GIS-034
download: https://pan.baidu.com/s/1RcijhDY38UeFXaj-IBWrLw?pwd=zxfk
downloadType: baidu
panCode: zxfk
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-usa-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 50.6 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**美国**部分，三级 Shapefile 共 15 个文件，压缩包约 **50.6 MB（50,609,414 字节）**。美国是「州—县」两级扁平结构：一级 50 州 + 哥伦比亚特区，二级 3148 个县级单元（county / county equivalent），是做美国社会经济分析最常用的两个层级。阿拉斯加与夏威夷一并收录，数据横跨 180° 经线（阿留申群岛），有个值得注意的技术细节。本文所有数字均经 Python geopandas 逐要素实算，非官方文档转述。



## 数据内容

包内按行政层级分为 3 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，美国全国边界（含阿拉斯加、夏威夷）。字段 `GID_0`（USA）、`COUNTRY`。
- **Level 1（州级）**：**51 个要素**，50 个州（State）+ 1 个联邦特区（Federal District，哥伦比亚特区）。字段含 `NAME_1`、`VARNAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（如 US-CA 加利福尼亚）、`HASC_1`、`CC_1` 等 12 个。
- **Level 2（县级）**：**3148 个要素**，county / county equivalent 一级，与常见美国县级统计（人口、选举、气候）的口径基本对齐。

各层级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套（如 `USA.1.1_1`），可任意聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，无乱码。
- 几何类型：POLYGON（MultiPolygon）。范围经度 -179.15°—179.77°（**阿留申群岛跨 180° 经线**）、纬度 18.91°N—72.69°N，全国轮廓面积约 **947.3 万 km²**（EPSG:6933 等面积投影实算，含水域外的陆地部分）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；做美国专题图选 L1（51 州级）或 L2（3148 县），与人口普查、选举等公开数据集按州名 / 县名 join 即可。
2. **Python 空间分析**：`geopandas.read_file("gadm41_USA_2.shp")`；`sjoin` 挂载 POI / 气象站数据，`dissolve(by="NAME_1")` 聚合到州。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；县级图建议用 Albers USA 类投影渲染，避免高纬的阿拉斯加变形失真。

## 已知数据瑕疵（实测发现，重要）

- **波多黎各等海外领地不在本包内**：L1 仅 50 州 + 哥伦比亚特区共 51 个单元，波多黎各、关岛、美属萨摩亚等未收录，做美国全境统计时需另行补充。
- **阿留申群岛横跨 180° 经线**，全包经度范围 -179.15°—179.77°；用简单 bbox 判断会误以为数据横跨整个世界，QGIS / ArcGIS / geopandas 正常读取即可，自定义渲染需做跨经线平移。
- 县级单元数量 3148 与美国人口普查局现行口径（约 3143 个 county equivalent，逐年微调）存在小幅出入，源于 GADM 4.1 的数据基准年代不同，严格对表时注意。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

美国区域地理教学、州级 / 县级人口与选举统计制图、环境与气候数据的行政区裁剪、与加拿大 / 墨西哥数据包的北美行政框架对齐、GIS 教学中的经典入门练习数据。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [美国行政区划互动地图](/maps/usa-regions)


