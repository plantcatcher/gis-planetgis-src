---
slug: seasia-river-lake-30m-shp
title: 东南亚 30m 河湖基础矢量数据 SHP（含夏威夷岛链，55.4 万水体斑块，WGS84）
summary: 全球 30 m 河湖基础矢量数据的东南亚-太平洋部分，单一 Shapefile 含 55.4 万个水体面要素，GCS_WGS_1984 经纬度坐标系，属性 GRIDCODE=60 标识水体，覆盖中南半岛、印尼与菲律宾群岛及热带太平洋岛链，压缩包 53 MB。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: 东南亚, 夏威夷, 河湖, 水体, 30m, SHP, 矢量数据, WGS84, 水文, 地理数据
access: gated
trigger: 东南亚河湖30m
keywordAliases: 东南亚河湖矢量, 东南亚水体SHP, 东南亚30m水体
code: NSH-GIS-041
download: https://pan.baidu.com/s/1Ax7ytTQau0llJCy89d9ZQA?pwd=aksv
downloadType: baidu
panCode: aksv
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 53 MB
---

> 本数据包是全球 30 m 分辨率河湖基础矢量数据的**东南亚—太平洋岛链部分**，压缩包内仅一个图层（文件名 `东南亚_夏威夷岛链.shp`），含 **553,579 个水体面要素**，几何类型 Polygon，坐标系 **GCS_WGS_1984（EPSG:4326 经纬度）**，文件头记录范围 **经度 -160.38°—179.89°、纬度 18.79°S—18.96°N**。属性表 `GRIDCODE` 恒为 **60**（30 m 全球地表覆盖分类中的水体类型码）。压缩包约 **53 MB**，解压后约 **111 MB**。本文数字均由 Python 直接读取压缩包内文件头与属性表实算。

## 数据内容

单一 Shapefile，包内 9 个文件（`.shp / .shx / .dbf / .prj / .CPG / .sbn / .sbx` + 2 份 `.xml`）：

- **要素数**：553,579 个面要素。
- **属性字段（2 个）**：`ID`、`GRIDCODE`（=60）。
- **体积构成**：`.shp` 91.6 MB、`.dbf` 11.1 MB、`.sbn` 4.4 MB、`.shx` 4.2 MB。

本包是唯一一个**跨太平洋**的分包：图层名中的「夏威夷岛链」指它同时覆盖了中太平洋的岛链水体，与中南半岛（湄公河、湄南河、伊洛瓦底江）、印尼与菲律宾群岛的水体一并打包。这也是它经度跨度从 -160° 一直到 180° 的原因。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-10-dongnanya.jpg" alt="dongnanya" style="zoom:67%;" />

## 数据来源与处理方式

由 30 m 分辨率栅格水体图层经 ArcGIS「栅格转面」按 5°×5° 分幅批量转换后 Append 合并而成，元数据保留的处理链显示源分幅命名形如 `n50_15`、`s48_05`（n/s 表示南北纬，数字为纬度带与 5° 经度步长），对应 2010 基准年的全球地表覆盖水体层；其中 `n04_00` 一幅还做过一次 UTM Zone 4N 的投影变换（元数据中保留了这次 Project 操作的记录）。由此产生的特性：

1. **水体是碎面集合**：河流被切成一串串小方块，未做 dissolve 与中心线提取，「要素数」不等于「河流条数」。
2. **面大小两极分化**：小到单个 30 m 栅格单元，大到大型湖库与宽阔河口的整块面。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326）**，`.prj` 随包附带（虽然处理过程中间用到了 UTM Zone 4N，最终成果已回到经纬度）。
- 文本编码：**UTF-8**（`.cpg` 随包附带）。
- 几何类型：Polygon（shapeType=5），坐标单位度。属性表**不含** `Shape_Length` / `Shape_Area`，需自行计算几何。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接加载；55 万面在桌面端很流畅，适合直接做群岛尺度水体制图。
2. **Python 空间分析**：`geopandas.read_file()` → `dissolve()` 融合相邻斑块 → 投影到等面积坐标系（东南亚可用 EPSG:102028 或全球 EPSG:6933）算水域面积；配合 GADM 行政边界做分国统计。
3. **WebGIS**：体量小，简化后转 GeoPackage / MBTiles 即可接入前端地图。

## 已知数据瑕疵（实测发现，重要）

- **包内含两份元数据**：`东南亚_夏威夷岛链.shp.xml` 与一份 `- Copy.xml` 副本内容重复，忽略即可。
- **跨 180° 经线**：经度范围 -160.38°—179.89°，在部分 GIS 与 Web 地图里跨反子午线渲染可能出现横跨全图的连线，建议按东西半球拆分或把经度统一到 0—360° 后再处理。
- **属性无语义**：只有 `ID` 与 `GRIDCODE`，没有水体名称、河流等级等字段。
- **30 m 精度限制**：红树林潮沟、细小溪流与季节性水体存在漏提。

## 使用须知

- 数据仅含水体轮廓，**不含任何行政界线与国界画法**；涉及中国疆域（南海诸岛）的正式制图，界线须以自然资源部标准地图服务发布的标准地图为准。
- 仅供学习、科研与教学参考；商业用途请自行向原始地表覆盖数据提供方确认授权。

## 适用场景

湄公河与湄南河流域河网制图、印尼与菲律宾群岛湖泊水库统计、太平洋岛国海岸与潟湖水体提取、红树林与海岸带变化本底、水文模型陆地水掩膜、遥感水体提取结果验证参照。

## 同系列数据

本页为单个大区包。需要**全球完整版**（7 大区合一，2276.5 万面，2.82 GB）请下载：

- [全球 30m 河湖基础矢量数据 SHP（7 大区合集）](/downloads/global-river-lake-30m-shp)

其余大区包：

- [亚欧 30m 河湖基础矢量数据 SHP](/downloads/eurasia-river-lake-30m-shp)（1204.7 万面，1.39 GB）
- [北美洲 30m 河湖基础矢量数据 SHP](/downloads/namerica-river-lake-30m-shp)（679.2 万面，988 MB）
- [南美洲 30m 河湖基础矢量数据 SHP](/downloads/samerica-river-lake-30m-shp)（139.4 万面，188 MB）
- [非洲 30m 河湖基础矢量数据 SHP](/downloads/africa-river-lake-30m-shp)（99.9 万面，116 MB）
- [大洋洲 30m 河湖基础矢量数据 SHP](/downloads/oceania-river-lake-30m-shp)（90.3 万面，80 MB）
- [格陵兰岛 30m 河湖基础矢量数据 SHP](/downloads/greenland-river-lake-30m-shp)（7.7 万面，12 MB）

需要**带河流名称与等级**的中国水系图层，请看 [中国 1-5 级水系 SHP 数据](/downloads/cn-zhuyao-shuixi-shp)。
