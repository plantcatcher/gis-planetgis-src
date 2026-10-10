---
slug: namerica-river-lake-30m-shp
title: 北美洲 30m 河湖基础矢量数据 SHP（679.2 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的北美洲部分，单一 Shapefile 含 679.2 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖北美五大湖、密西西比水系与北极群岛一带，适合北美尺度水体制图与水域统计。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 北美洲, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 五大湖, 地理数据
access: gated
trigger: 北美洲河湖30m
keywordAliases: 北美洲河湖矢量, 北美水体SHP, 北美30m水体
code: NSH-GIS-037
download: https://pan.baidu.com/s/1GliTZqFhfpdmknFv71SULQ?pwd=9jme
downloadType: baidu
panCode: 9jme
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 988 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**北美洲部分**，压缩包内仅一个图层（`北美洲.shp`），含 **6,791,646 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 -179.13°—179.66°、纬度 27.12°S—81.66°N**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **988 MB**，解压后约 **1.73 GB**。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`北美洲.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：6,791,646 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 1528.0 MB、`.dbf` 136.0 MB、`.sbn` 52.8 MB、`.shx` 51.8 MB。

北美洲是全球 7 个大区包中体量第二大的一块（仅次于亚欧），五大湖群、密西西比河水系、加拿大北极群岛的密集湖群是要素数的主要来源。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-beimei.jpg" alt="beimei" style="zoom:67%;" />

## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后 Append 合并而成，对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到五大湖这样的整块巨面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。本包属性表**不含** `Shape_Length` / `Shape_Area` 字段，需自行计算几何。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；600 多万个面建议先按州/省或流域裁剪再渲染。空间索引 `.sbn / .sbx` 已随包附带。
2. **Python 空间分析**：`geopandas.read_file()` 读取后 `dissolve()` 融合相邻斑块，投影到等面积坐标系（北美可用 EPSG:5070 或全球 EPSG:6933）再算水域面积。
3. **WebGIS**：先简化 + 转 GeoPackage / MBTiles，不建议把原始 SHP 直接给前端。

## 已知数据瑕疵（实测发现，重要）

- **`.shp` 单文件 1528.0 MB**，接近 Shapefile 2 GB 规格上限的 75%，属性查询与叠加分析明显偏慢，建议转 GeoPackage / PostGIS。
- **文件头纬度下限 27.12°S**：说明包内含赤道以南的水体要素（太平洋与加勒比海方向的离岛），不全是北美大陆；做严格北美研究区时请自行按行政边界或 bbox 裁剪。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有水体名称、湖泊名称、河流等级等字段。
- **30 m 精度限制**：细小溪流与季节性水体存在漏提。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及国界表达时须以官方标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

北美五大湖与密西西比水系制图、加拿大北极群岛湖群密度统计、美国/加拿大分州分省水域面积汇总、湿地与地表水变化本底、水文模型的陆地水掩膜、遥感水体提取结果验证参照。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
