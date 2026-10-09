---
slug: gadm41-esp-shp
title: GADM 4.1 西班牙行政区划矢量数据 SHP（国界 / 18 自治区 / 52 省 / 369 县 / 8302 市镇，五级最全，WGS84）
summary: GADM 4.1 西班牙行政区划数据集，含国界、17 自治区 + 1 自治市、50 省 + 2 自治市、369 个县（Comarca）、8302 个市镇五级 Shapefile，WGS84 坐标系，UTF-8 编码，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 西班牙, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM西班牙
keywordAliases: 西班牙行政区划, 西班牙SHP, 西班牙行政区shp
code: NSH-GIS-024
download: https://downloads.planetgis.cn/GIS/gadm41_ESP_shp.zip
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-esp-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 11.8 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**西班牙**部分，是这一批国家包里**层级最深的一份**：从国界一直到市镇（Municipality）共 **5 级**、25 个文件，压缩包约 **11.8 MB（12,395,844 字节）**。适合需要「自治区 → 省 → 县 → 市镇」全链条下钻的研究与制图场景（例如按市镇做人口密度或选举空间分析）。本文所有数字均经 Python 逐要素实算（含环数、顶点数），非官方文档转述。



## 数据内容

包内按行政层级分为 5 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，由 178 个环、244,258 个顶点组成，含本土、巴利阿里群岛与加那利群岛。
- **Level 1（自治区）**：**18 个要素** = 17 个 `Comunidad Autónoma`（自治区）+ 1 个 `Ciudad Autónoma`。注意 GADM 把休达（Ceuta）与梅利利亚（Melilla）两个自治市**合并为一条** `Ceuta y Melilla` 记录。
- **Level 2（省）**：**52 个要素** = 50 个 `Provincia`（省）+ 2 个 `Ciudad Autónoma`（自治区级自治市单列到省级）。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`CC_2`（官方省代码 01—52）、`HASC_2`（`ES.AN.AM` 式）。
- **Level 3（县 / Comarca）**：**369 个要素**，全部为 `Comarca` 类型。⚠️ 其中 **292 条的名称是 `n.a. (15)` 这类占位符**，真正带地名只有 77 条——该层级可用性最弱，建议仅作几何参考。
- **Level 4（市镇）**：**8,302 个要素** = 8,298 个 `Municipality` + 4 条主权属地（`Isla del Perejil`、`Peñón de Vélez de la Gomeral`、`Islas Chafarina`、`Peñón de Alhucemas`）。

五级通过 `GID_0 → GID_1 → … → GID_4` 编码严格逐级嵌套（如 `ESP.1.1.1.1_1`），可任意聚合或下钻。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，西班牙语重音字符（`Andalucía`、`Cataluña`、`Cádiz`）正常存储；`NL_NAME_*` 字段在本包中**全部为空**，没有本地语别名字段可用。
- 几何类型：五级均为 POLYGON（MultiPolygon）。范围经度 -18.16°E—4.33°E、纬度 27.64°N—43.79°N（西含加那利群岛，东至巴利阿里群岛）。

## 使用方法

1. **QGIS / ArcGIS**：解压后按需加载对应层级；做全国市镇图直接加载 `gadm41_ESP_4.shp`（8,302 个面），自治区级设色用 `NAME_1`。
2. **Python 空间分析**：`geopandas.read_file("gadm41_ESP_4.shp")` 读取市镇，用 `dissolve(by="NAME_2")` 聚合到省，或 `sjoin` 把 INE 统计表挂到市镇做专题图。
3. **WebGIS**：市镇层 8,302 个面建议先用 `tippecanoe` 做简化与分级（-z 参数），再接入 MapLibre / Leaflet，避免前端一次性渲染压力。

## 已知数据瑕疵（实测发现）

- **L3「县（Comarca）」层大面积缺名**：369 条中 292 条为 `n.a. (xx)` 占位符，实际可用地名仅 77 条，做县级统计前务必先筛掉。
- **市镇数量与官方口径不同**：本包 L4 为 8,302 条（含 4 条主权属地），而西班牙国家统计局（INE）口径的市镇数约 8,131 个，差异来自 GADM 对各自治区数据的整合与属地单列。
- **Ceuta 与 Melilla 在 L1 被合并**（`Ceuta y Melilla` 一条），在 L2 才拆成 2 条，跨层级统计时需留意层级间基数不一致。
- L1 的 `ISO_1` 字段**全部为 `NA`**，需要 ISO 3166-2 代码请改用 `HASC_1`（如 `ES.AN`）或 `CC_1`（官方自治区代码）。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。

## 适用场景

西班牙区域地理教学、市镇尺度的人口 / 就业 / 选举空间分析、NUTS 与行政单元对照、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。


## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [西班牙行政区划互动地图](/maps/esp-regions)
