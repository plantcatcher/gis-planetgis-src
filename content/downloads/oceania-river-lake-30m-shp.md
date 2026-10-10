---
slug: oceania-river-lake-30m-shp
title: 大洋洲 30m 河湖基础矢量数据 SHP（90.3 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的大洋洲部分，单一 Shapefile 含 90.3 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖澳大利亚、新西兰与南太平洋岛屿，文件头纬度南至 54.7°S，压缩包 80 MB。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 大洋洲, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 澳大利亚, 地理数据
access: gated
trigger: 大洋洲河湖30m
keywordAliases: 大洋洲河湖矢量, 澳洲水体SHP, 大洋洲30m水体
code: NSH-GIS-040
download: https://pan.baidu.com/s/1mVIRmSDozlpzNTvmsIM9Pw?pwd=qcid
downloadType: baidu
panCode: qcid
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 80 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**大洋洲部分**，压缩包内仅一个图层（文件名 `大洋洲_intersect_result.shp`），含 **903,342 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 113.04°—178.48°、纬度 54.70°S—10.00°S**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **80 MB**，解压后约 **176 MB**。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：903,342 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 143.5 MB、`.dbf` 18.1 MB、`.sbn` 7.2 MB、`.shx` 6.9 MB。

要素主要来自澳大利亚大陆的盐湖与季节性河网（艾尔湖一带占比很大）、塔斯马尼亚与新几内亚南部的水系、新西兰的湖泊与河流，以及南太平洋各岛的潟湖与海岸水体。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-dayang.jpg" alt="dayang" style="zoom:67%;" />



## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后，再用「相交（Intersect）」按大洲范围裁剪（图层名中的 `intersect_result` 即这一步的产物）合并而成，对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到艾尔湖这类巨型盐湖壳面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。属性表**不含** `Shape_Length` / `Shape_Area`，需自行计算几何。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；90 万面在桌面端流畅，可直接与澳大利亚行政区划叠加做分州统计。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到等面积坐标系（澳洲可用 EPSG:3577 / 全球 EPSG:6933）算水域面积；盐湖干湿变化可结合多时相影像分析。
3. **WebGIS**：体量小，简化后转 GeoPackage / MBTiles 即可接入 MapLibre / Leaflet。

## 已知数据瑕疵（实测发现，重要）

- **纬度北界止于南纬 10°**：赤道至南纬 10° 之间的岛屿水体（新几内亚北部、印尼东部等）不在本包内，需配合 [东南亚包](/downloads/seasia-river-lake-30m-shp) 使用；两个包在南纬 10°—18.8° 一带有范围交叠，拼接后注意去重。
- **干盐湖被算作水体**：澳大利亚中部的盐壳洼地在地表覆盖分类中常被归入水体/湿地类，做「常年有水」统计时要另行剔除或叠加降水/水体频率数据。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有水体名称、河流等级等字段。
- **30 m 精度限制**：季节性溪流与小于一个像元的海岸潟湖会漏提。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及国界表达时须以官方标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

澳大利亚分州水域与盐湖统计、新西兰湖库制图、南太平洋岛国潟湖与海岸水体提取、干旱区季节性水体变化本底、水文模型陆地水掩膜、遥感水体提取结果验证参照。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
