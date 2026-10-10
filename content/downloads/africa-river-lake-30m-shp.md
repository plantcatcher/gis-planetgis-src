---
slug: africa-river-lake-30m-shp
title: 非洲 30m 河湖基础矢量数据 SHP（99.9 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的非洲部分，单一 Shapefile 含 99.9 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖尼罗河、刚果河、尼日尔河水系与东非大湖群，压缩包 116 MB，适合非洲尺度水体制图与水域统计。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 非洲, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 东非大湖, 地理数据
access: gated
trigger: 非洲河湖30m
keywordAliases: 非洲河湖矢量, 非洲水体SHP, 非洲30m水体
code: NSH-GIS-039
download: https://pan.baidu.com/s/18YfKFxoBUjtyeXGUv0K1uA?pwd=en23
downloadType: baidu
panCode: en23
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 116 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**非洲部分**，压缩包内仅一个图层（文件名 `非洲_Intersect result.shp`），含 **998,599 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **116 MB**，解压后约 **224 MB**。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 8 个文件（`.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx / .xml`）：

- **要素数**：998,599 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 187.9 MB、`.dbf` 20.0 MB、`.sbn` 7.9 MB、`.shx` 7.6 MB。

要素主要来自尼罗河、刚果河、尼日尔河、赞比西河等水系的河网，维多利亚湖、坦噶尼喀湖、马拉维湖等东非大湖群，以及撒哈拉与卡拉哈里的季节性洼地水体。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-feizhou.jpg" alt="feizhou" style="zoom:67%;" />

## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后，再用「相交（Intersect）」按大洲范围裁剪（图层名中的 `Intersect result` 即这一步的产物）合并而成，对应 2010 基准年的全球地表覆盖水体层。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到维多利亚湖这样的整块巨面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。属性表**不含** `Shape_Length` / `Shape_Area`，需自行计算几何。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；近百万面在桌面端可正常渲染，叠加行政边界裁剪后做分国统计最方便。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到等面积坐标系（非洲可用 EPSG:102022 或全球 EPSG:6933）算水域面积。
3. **WebGIS**：体量适中，简化后转 GeoPackage / MBTiles 即可接入前端地图。

## 已知数据瑕疵（实测发现，重要）

- **文件头范围远超非洲大陆**：记录范围为经度 **-179.15°—173.40°**、纬度 **-54.04°—37.31°**，横跨几乎全部经度带，与非洲本体（-17°—51°、37°N—35°S）不符，疑似沿用上游图层的范围记录或含印度洋 / 大西洋方向的离岛。**使用前请先在 GIS 里查看实际要素分布，再按研究区 bbox 或行政边界裁剪**，不要直接假定包内只有非洲。
- **图层名含空格**（`非洲_Intersect result`）：ogr2ogr、tippecanoe 等命令行工具对空格路径敏感，建议解压后先改名。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有水体名称、河流等级等字段。
- **30 m 精度限制**：季节性泛滥平原、旱谷（wadi）与细小溪流会漏提。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及国界表达时须以官方标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

非洲分国水域面积统计、尼罗河与刚果河流域河网制图、东非大湖群边界提取、萨赫勒地区季节性水体变化本底、水资源与干旱研究、遥感水体提取结果验证参照。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链）](/downloads/seasia-river-lake-30m-shp)（55.4 万面，53 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
