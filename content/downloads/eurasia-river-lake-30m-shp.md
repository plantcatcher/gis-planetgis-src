---
slug: eurasia-river-lake-30m-shp
title: 亚欧 30m 河湖基础矢量数据 SHP（1204.7 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的亚欧部分，单一 Shapefile 图层含 1204.7 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性表 10 个字段含 GRIDCODE=60 与形状长度面积，是全球包中体量最大的一块，适合亚欧大陆尺度水体制图与水域统计。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 亚欧, 欧亚大陆, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 地理数据
access: gated
trigger: 亚欧河湖30m
keywordAliases: 亚欧河湖矢量, 欧亚水体SHP, 亚欧30m水体
code: NSH-GIS-036
download: https://pan.baidu.com/s/1kS4sQ6Z0nTUQqMyZ6oZVZQ?pwd=mnfw
downloadType: baidu
panCode: mnfw
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.39 GB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**亚欧部分**，压缩包内仅一个图层（文件名 `欧亚.shp`），含 **12,046,870 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 -180°—180°、纬度 0.33°N—79.88°N**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **1.39 GB**，解压后约 **3.47 GB**——它是 7 个大区包里最大的一个，也是 Shapefile 格式承压最明显的一个。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`欧亚.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：12,046,870 个面要素。
- **属性字段（10 个）**：`OBJECTID`、`ID`、`GRIDCODE`（=60）、`FID_2`、`FID_n50_30`、`ID_1`、`FID_44_15`、`FID_n44_15`、`Shape_Length`、`Shape_Area`。
- **体积构成**：`.shp` 2000.5 MB、`.dbf` 1367.2 MB、`.sbn` 93.3 MB、`.shx` 91.9 MB。

与其余 6 个大区包不同，亚欧包**额外保留了 `Shape_Length` 与 `Shape_Area`** 两个形状字段（单位为度与平方度，不是米与平方米），以及合并前各分块的 `FID_*` 痕迹字段。这些分块 FID 在生产流程里有意义，对终端用户基本无用，可删除以缩减属性表体积。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-yaou.jpg" alt="yaou" style="zoom:67%;" />

## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后 Append 合并而成，元数据保留的处理链显示源分幅命名形如 `n29_35`、`n31_75`（纬度带 + 5° 经度步长），对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元（属性表面积约 1.4×10⁻⁷ 平方度），大到平方公里级湖面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度；`Shape_Area` 为平方度，做面积统计必须先投影到等面积坐标系（推荐 EPSG:6933）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载，但**务必先按研究区裁剪**——1200 万个面一次性渲染基本会卡死。可用「按位置提取」裁出目标国家/流域，或先用 5°×5° 渔网分批加载。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到等面积系算水域面积；按行政区/流域做 `sjoin` 统计河湖密度。
3. **入库**：强烈建议转 **GeoPackage 或 PostGIS**。1200 万要素在 Shapefile 里做属性查询极慢。

## 已知数据瑕疵（实测发现，重要）

- **`.shp` 单文件 2000.5 MB，已逼近 Shapefile 2 GB 规格上限**：部分旧工具读取会直接失败，不建议在原格式上继续做叠加分析。
- **文件头纬度从 0.33°N 起**：本包未覆盖赤道以南的水体（东南亚、大洋洲一带的水体在对应分包里），做跨赤道研究区需拼接 东南亚 / 大洋洲 包。
- **范围跨度极大**：文件头经度覆盖 -180°—180°，是因为欧亚大陆东西横跨整个经度带，不等于「包里含南极或美洲」；实际要素仍以陆域水体为主。
- **属性无语义**：没有河流名称、等级、湖泊名称等字段。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及中国疆域的正式制图，界线须以自然资源部标准地图服务发布的标准地图为准。
- 30 m 分辨率下，细小溪流、季节性水体与小于一个像元的水面会漏提，不宜用于水利工程设计。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

亚欧大陆水体分布制图、跨国流域（多瑙河、莱茵河、伏尔加河、长江、湄公河等）水域面积统计、里海/贝加尔湖等大型湖体边界提取、湿地与地表水变化本底、水文模型的陆地水掩膜、大数据量矢量处理的教学案例。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
