---
slug: gadm41-deu-shp
title: GADM 4.1 德国行政区划矢量数据 SHP（五级至乡镇：国界 / 16 联邦州 / 403 / 4680 / 11302，WGS84）
summary: GADM 4.1 德国行政区划数据集，最深五级：国界、16 个联邦州、403 个二级行政区、4680 个三级单元、11302 个乡镇（Gemeinde），WGS84 坐标系 Shapefile，可直接用于 QGIS / ArcGIS / Python 空间分析。
date: 2026-10-09
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 德国, 行政区划, 联邦州, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM德国
keywordAliases: 德国行政区划, 德国SHP, 联邦州shp
code: NSH-GIS-031
download: https://pan.baidu.com/s/18NhUtsWDOHcH1HqSQ7TafQ?pwd=xei2
downloadType: baidu
panCode: xei2
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-deu-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 50.6 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**德国**部分，是六国包里**层级最深**的一份：5 级 Shapefile、共 25 个文件，压缩包仅约 **50.6 MB（50,593,742 字节）**，最深层级下钻到乡镇（Gemeinde）一级、11302 个要素。德国行政区划的「联邦州—行政区/县—乡镇」结构在这份数据里完整可见，适合做欧洲对比研究的底层数据。本文所有数字均经 Python geopandas 逐要素实算，非官方文档转述。



## 数据内容

包内按行政层级分为 5 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，德国全国边界。字段 `GID_0`（DEU）、`COUNTRY`。
- **Level 1（联邦州）**：**16 个要素**，即 16 个联邦州（Bundesland），`TYPE_1` 含 State 15 个、Free State 1 个（巴伐利亚的「自由州」称谓）。字段含 `NAME_1`、`VARNAME_1`、`ISO_1`（如 DE-BY 拜恩）、`HASC_1` 等 12 个。
- **Level 2**：**403 个要素**，县 / 直辖市一级（Landkreis / kreisfreie Stadt 等）。
- **Level 3**：**4680 个要素**，行政联合体 / 集中市镇一级（Verwaltungsgemeinschaft 等），主要见于德东与巴伐利亚。
- **Level 4（乡镇）**：**11302 个要素**，即 Gemeinde——德国最基础的自治体一级，全包体量的主要来源。

各层级通过 `GID_0 → GID_1 → … → GID_4` 编码严格逐级嵌套（如 `DEU.1.1.1.1_1`），字段含各级 `NAME_x / VARNAME_x / TYPE_x / ENGTYPE_x / CC_x / HASC_x`。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，无乱码。
- 几何类型：POLYGON（MultiPolygon）。范围经度 5.87°E—15.04°E，纬度 47.27°N—55.06°N，全国轮廓面积约 **35.8 万 km²**（EPSG:6933 等面积投影实算）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`；做德国专题图通常选 L1（16 州）或 L2（403 县），L4 乡镇用于精细分析（11302 要素，建议先建空间索引）。
2. **Python 空间分析**：`geopandas.read_file("gadm41_DEU_4.shp")`；`sjoin` 挂载人口 / 能源站点数据，`dissolve(by="NAME_1")` 聚合到联邦州。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；L4 建议先简化几何（`mapshaper -simplify`）再上线。

## 已知数据瑕疵（实测发现）

- **L4 乡镇数量为 11302**，与德国官方现行市镇数量（约 1.07 万，持续合并中）存在出入，源于 GADM 4.1 的数据基准年代不同；德国市镇合并频繁，做逐年统计需自行核对当年名录。
- L3 的 4680 个联合体单元在北威州等大州覆盖不全（这些州县下直接接乡镇），跨州做 L3 层级对比时口径不一致，建议优先用 L1 / L2 / L4 三个稳定层级。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

德国区域地理与欧洲一体化教学、联邦州 / 县级社会经济制图、可再生能源（风电 / 光伏）分布分析的行政区裁剪、德语地名与中文译名对照、与法国 / 波兰等欧洲数据包的跨国行政框架对齐。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [德国行政区划互动地图](/maps/deu-regions)
