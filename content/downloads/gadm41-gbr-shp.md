---
slug: gadm41-gbr-shp
title: GADM 4.1 英国行政区划矢量数据 SHP（五级至选区，含构成国 / 郡 / 区 / 民政教区，WGS84）
summary: GADM 4.1 英国行政区划数据集，最深五级：国界、构成国、183 个二级行政区、406 个三级行政区、9111 个四级选区，WGS84 坐标系 Shapefile，可用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-08
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, 英国, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
trigger: GADM英国
keywordAliases: 英国行政区划, 英国行政区shp, 英国SHP
code: NSH-GIS-021
download: https://pan.baidu.com/s/1AVwW8DKg0GRanfvlRV4DAA?pwd=4nfp
downloadType: baidu
panCode: 4nfp
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-gadm41-gbr-shp-cover.jpg
format: SHP（ZIP 压缩包）
size: 272 MB
---

> 本数据集为 GADM（Global Administrative Areas）v4.1 的**英国**部分，是三国包里层级最深、体量最大的一个：**5 级 Shapefile、共 25 个文件，压缩包约 272 MB（285,226,908 字节）**，最深层级下钻到英格兰的选区（ward）一级。GADM 是国际学术界广泛引用的全球行政区划数据项目，**仅限学术研究等非商业用途**（详见使用须知）。本文所有数字均经 Python pyshp 逐要素实算，非官方文档转述。

![gbr_0](https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_0.jpg)

![gbr_1](https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_1.jpg)

![gbr_2](https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_2.jpg)

![gbr_3](https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_3.jpg)

![gbr_4](https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_4.jpg)





## 数据内容

包内按行政层级分为 5 个独立 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`）：

- **Level 0（国界）**：1 个要素，英国全国边界。字段 `GID_0`（GBR）、`COUNTRY`。
- **Level 1（构成国）**：**5 个要素**。英格兰、苏格兰、威尔士、北爱尔兰 4 个构成国（Constituent Country），外加 1 条几乎全字段为 `NA` 的空记录（见「已知数据瑕疵」）。
- **Level 2**：**183 个要素**，英格兰的单位 autoridades / 行政郡、伦敦自治市镇、大都会自治市镇与苏格兰 / 威尔士 / 北爱尔兰的相应层级。类型构成（按 `TYPE_2` 实算）：Unitary Authority 64、Administrative County 26、Metropolitan Borough 25、Unitary District 25、District 11、Metropolitan Borough (City) 10、Unitary Authority (City) 10、Unitary District (City) 4、Island area 2、Unitary Authority (County) 1，另有 5 个类型字段为 `NA`。
- **Level 3**：**406 个要素**，主要为 Administrative county district 200、Unitary authority 44、District 26、Metropolitan borough 25、Unitary district 25、London borough 24、Unitary authority (Wales) 22 等。
- **Level 4**：**9111 个要素**，英格兰的选区 / 民政区一级（`TYPE_4` 字段未标注），单此一层 `.shp` 即约 204 MB，是整个包体积的主要来源。

各层级通过 `GID_0 → GID_1 → GID_2 → GID_3 → GID_4` 编码严格逐级嵌套（如 `GBR.1.2.1_1`），字段含各级 `NAME_x / VARNAME_x / TYPE_x / ENGTYPE_x / HASC_x / ISO_x`，苏格兰与威尔士的 VARNAME 保留了本地语言名（Alba / Cymru）。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-08-gbr_lsit.jpg" alt="gbr_lsit" style="zoom:67%;" />

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 随包附带。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，无乱码。
- 几何类型：POLYGON（MultiPolygon）。全国范围经度 -8.65°—1.76°，纬度 49.87°N—60.85°N（北至设得兰群岛）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载，L4 体量大（9111 要素），建议先建空间索引；做英国专题图通常选 L2 或 L3 即可，L4 用于选区尺度的精细分析。
2. **Python 空间分析**：`geopandas.read_file("gadm41_GBR_2.shp")`；用 `sjoin` 挂载点 / 面数据，`dissolve(by="NAME_1")` 聚合到构成国。
3. **WebGIS**：`ogr2ogr` / `tippecanoe` 转 GeoJSON / MBTiles 接入 MapLibre / Leaflet；L4 建议先简化几何（`mapshaper -simplify`）再上线。

## 已知数据瑕疵（实测发现，重要）

- **英格兰的 Level 1 元数据缺失**：`GBR.1_1` 这条记录的 `NAME_1 / TYPE_1 / ISO_1` 等字段值均为 `NA`（而 L2 / L3 / L4 子要素的 `NAME_1` 正常显示 "England"）。**按构成国筛选 England 时请用 `GID_1 = 'GBR.1_1'`，不要用 `NAME_1`**。
- L1 存在 1 条几乎全字段为 `NA` 的空壳记录（`GID_1 = 'NA'`），L2 中另有少量要素的 `GID_1` 挂在 `NA` 下但 `NAME_1` 实际为 England / Scotland——做严格逐级聚合前建议先按 GID 清洗。
- 约 5 个 L2 与 12 个 L3 要素的类型字段为 `NA`，类型统计时需单独归入「未标注」。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表中国政府立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务的官方数据。数据未标注审图号，公开使用请遵守《地图管理条例》。

## 适用场景

英国区域地理与城市地理教学、选区尺度社会经济分析、行政单元变迁研究、遥感影像行政区裁剪、与英加澳新等英联邦国家数据的跨国防级行政框架对齐。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [英国行政区划互动地图](/maps/uk-regions)
