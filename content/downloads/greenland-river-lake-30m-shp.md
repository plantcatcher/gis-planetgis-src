---
slug: greenland-river-lake-30m-shp
title: 格陵兰岛 30m 河湖基础矢量数据 SHP（7.7 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的格陵兰岛部分，单一 Shapefile 含 7.7 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖格陵兰冰盖边缘的融水湖、河流与海岸水体，压缩包仅 12 MB，是 7 个大区包中最小的一个。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 格陵兰岛, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 冰川, 地理数据
access: gated
trigger: 格陵兰河湖30m
keywordAliases: 格陵兰河湖矢量, 格陵兰水体SHP, 格陵兰30m水体
code: NSH-GIS-042
download: https://pan.baidu.com/s/1JxdA3RPpqKS20E_1rgpuKg?pwd=8p9c
downloadType: baidu
panCode: 8p9c
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 12 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**格陵兰岛部分**，压缩包内仅一个图层（文件名 `格陵兰岛_Intersect result.shp`），含 **77,064 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 -71.85°—-13.21°、纬度 37.75°N—81.88°N**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **12 MB**，解压后约 **20 MB**，是 7 个大区包中最小、最容易上手的一个。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：77,064 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 17.3 MB、`.dbf` 1.5 MB、`.sbn` 0.7 MB、`.shx` 0.6 MB。

要素以格陵兰冰盖边缘的**冰前湖、融水河与海岸峡湾水体**为主，内陆冰盖本体并无水体要素。对研究冰盖消融、冰前湖扩张与北极淡水通量的人来说，这是难得的 30 m 级本底数据。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-gelinglan.jpg" alt="gelinglan" style="zoom:67%;" />



## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后，再用「相交（Intersect）」按范围裁剪（图层名中的 `Intersect result` 即这一步的产物）而成，对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：融水河被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到数平方公里的冰前湖整块面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。属性表**不含** `Shape_Length` / `Shape_Area`，需自行计算几何。
- ⚠️ 高纬度地区在 Web 墨卡托（EPSG:3857）下会被极度放大，出图请用极地投影（如 EPSG:3413 格陵兰兰勃特等角投影或 EPSG:3995 北极极射赤面投影）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；7.7 万面非常轻量，可放心与冰盖边界、冰流速数据叠加。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到 EPSG:3413 算湖面面积；按流域或冰盖分冰流区做 `sjoin` 统计融水湖数量与面积变化。
3. **WebGIS**：体量最小的一个包，转 GeoJSON 后甚至可直接接入 MapLibre / Leaflet（记得换极地投影）。

## 已知数据瑕疵（实测发现，重要）

- **可能与北美洲包重复**：北美洲包的文件头范围（经度 -179.13°—179.66°、纬度 27.12°S—81.66°N）完整覆盖了格陵兰所在区间，两包在格陵兰可能存在重叠要素。**做北美整体统计时请先去重或按岛界裁剪**，不要把两包要素数直接相加。
- **图层名含空格**（`格陵兰岛_Intersect result`）：ogr2ogr、tippecanoe 等命令行工具对空格路径敏感，建议解压后先改名。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有湖泊名称、面积、类型等字段。
- **时相为 2010 基准年**：冰前湖年际变化很大，做趋势分析需叠加其他年份数据，不能把这份数据当成现状。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及国界表达时须以官方标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

格陵兰冰前湖与融水河提取、冰盖消融与北极淡水通量研究、高纬度水体制图与投影实践、北极湖泊数量与面积统计、遥感水体提取结果验证参照、大数据量矢量的轻量教学样本。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
