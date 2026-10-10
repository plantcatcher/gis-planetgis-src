---
slug: samerica-river-lake-30m-shp
title: 南美洲 30m 河湖基础矢量数据 SHP（139.4 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的南美洲部分，单一 Shapefile 含 139.4 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖亚马孙与拉普拉塔水系、安第斯高山湖与巴塔哥尼亚冰湖，压缩包 188 MB，适合南美尺度水体制图与水域统计。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 南美洲, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 亚马孙, 地理数据
access: gated
trigger: 南美洲河湖30m
keywordAliases: 南美洲河湖矢量, 南美水体SHP, 南美30m水体
code: NSH-GIS-038
download: https://pan.baidu.com/s/1kJhdBp9vpq0Dj8VQp-5P0A?pwd=piu3
downloadType: baidu
panCode: piu3
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 188 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**南美洲部分**，压缩包内仅一个图层（文件名 `南美洲_intersect result.shp`），含 **1,394,070 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 -81.32°—-34.80°、纬度 55.91°S—14.86°N**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **188 MB**，解压后约 **345 MB**。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：1,394,070 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 294.7 MB、`.dbf` 27.9 MB、`.sbn` 11.2 MB、`.shx` 10.6 MB。

要素主要来自亚马孙河与拉普拉塔河两大水系的河网、巴西与阿根廷的湖库，以及安第斯山与巴塔哥尼亚的高山湖、冰川湖。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-nanmei.jpg" alt="nanmei" style="zoom:67%;" />

## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后，再用「相交（Intersect）」按大洲范围裁剪（图层名中的 `intersect result` 即这一步的产物）合并而成，对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到大型湖库与宽阔河面的整块面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。属性表**不含** `Shape_Length` / `Shape_Area`，需自行计算几何。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；139 万面在桌面端可正常渲染，但符号化建议用单一填充色，避免分级渲染拖慢。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到等面积坐标系（南美可用 EPSG:5880 / 全球 EPSG:6933）算水域面积；配合行政边界做分国统计。
3. **WebGIS**：中等体量，简化后转 GeoPackage 或 MBTiles 即可接入 MapLibre / Leaflet。

## 已知数据瑕疵（实测发现，重要）

- **文件头经度上限 -34.80°**：费尔南多·迪诺罗尼亚群岛（-32.4°）等更靠东的巴西离岛不在本包内；做巴西全境统计时需留意。
- **图层名含空格**（`南美洲_intersect result`）：部分命令行工具（ogr2ogr、tippecanoe）对空格路径敏感，建议解压后先改名为 `samerica_water.shp` 之类再处理。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有水体名称、河流等级等字段。
- **30 m 精度限制**：细小溪流、季节性泛滥平原与小于一个像元的水面会漏提。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及国界表达时须以官方标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

亚马孙与拉普拉塔流域河网制图、南美分国水域面积统计、安第斯高山湖与巴塔哥尼亚冰川湖提取、湿地与地表水变化本底、水文模型陆地水掩膜、遥感水体提取结果验证参照。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
