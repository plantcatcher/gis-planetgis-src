---
slug: cn-dem-prov125
title: 全国 DEM 分省 12.5 米数字高程模型
summary: 覆盖全国 34 个省级行政区的数字高程模型（DEM）分省数据集，空间分辨率约 12.5 米，按省（区、市）组织为独立文件，便于分区域调用与裁剪。适用于地形三维可视化、坡度坡向分析、水文流域提取、城乡规划等 GIS 与遥感应用。百度网盘分享，关注公众号获取提取码。
date: 2026-09-04
category: 地理数据
tags: DEM, 数字高程模型, 分省, 地形数据, 12.5米, 全国, GIS, 遥感
access: gated
downloadType: baidu
trigger: 全国DEM分省12.5
keywordAliases: 全国DEM12.5, 分省DEM数据, 12.5米分辨率DEM
code: NSH-DEM-003
download: https://pan.baidu.com/s/1lF0A8ZdhHAp_NRLGhVCPlA?pwd=syy4
panCode: syy4
cover: /covers/geo-data-cover.jpg
format: GeoTIFF 等，以网盘实际为准
size: 62.18G
---

> **数据概况**：全国范围数字高程模型（DEM, Digital Elevation Model）分省数据集；空间分辨率约 **12.5 米**；按 **34 个省级行政区**（省、自治区、直辖市、特别行政区）分别组织为独立文件；坐标系与格式**以网盘内实际文件为准**（常见为 WGS84 / CGCS2000 地理坐标系、GeoTIFF 栅格）。总大小**62.18G**（分省多文件，体量较大）。本数据为高程栅格，非行政区划地图，不涉及审图号，公开使用请遵守原始数据版权。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-G_dem_1.jpg" alt="G_dem_1" style="zoom: 50%;" />

## 数据内容

- **覆盖范围**：全国陆域（含主要岛屿），以省级行政区为单位拆分，每个省（区、市）对应一个或一组高程栅格文件，可单独下载、单独加载，无需为单一省份拉取全国数据。
- **数据形式**：规则网格栅格（Raster），逐像元记录地面高程（单位：米），分辨率约 **12.5 米**，相较 30 米 / 90 米公开 DEM 能呈现更细腻的沟谷、山脊与建成区微地形。
- **典型参数**（以网盘内实际文件为准）：空间分辨率 **12.5 米**；坐标系常见 **WGS84（EPSG:4326）或 CGCS2000（EPSG:4490）**；格式以 **GeoTIFF（.tif）** 为主，部分可能附 `.tfw` / `.prj` 几何与投影信息。
- **文件清单**：压缩包（或分省子目录）内按省级行政区命名组织，解压后按省调用即可，便于批量处理与按需裁剪。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-lish_dem.jpg" alt="lish_dem" style="zoom:50%;" />

## 坐标系与格式

分省 DEM 若采用 **WGS84 地理坐标系**（EPSG:4326），可与 Google Earth、OpenStreetMap 及多数在线底图天然对齐；若采用 **CGCS2000**（EPSG:4490，国家2000坐标系），则更适配国内天地图、国土空间规划等官方底图。栅格格式为 **GeoTIFF**，自带地理参考，在 QGIS / ArcGIS 中「添加栅格图层」即可自动定位，无需手动定义投影。加载前请先用 `.prj` 或 `gdalinfo` 确认各省份的坐标系是否一致，必要时用 `gdalwarp` 统一重投影后再拼接。

![AH_dem](https://blogphoto.planetgis.cn/PicGo/2026-09-15-AH_dem.jpg)

![FJ_dem](https://blogphoto.planetgis.cn/PicGo/2026-09-15-FJ_dem.jpg)

![HN_dem](https://blogphoto.planetgis.cn/PicGo/2026-09-15-HN_dem.jpg)

## 使用方法

1. **QGIS / ArcGIS**：「图层 → 添加栅格图层」选择对应省份的 `.tif` 即可加载；用「坡度 / 坡向」「填洼」「水文分析」等工具派生地形产品，或用「按掩膜提取」裁剪到研究区。
2. **Python 空间分析**：用 `rasterio` / `xarray` 读取为数组，配合 `numpy` / `matplotlib` 出图，或用 `richdem` 计算地形指数；多省拼接可用 `rioxarray` 的 `merge` 实现。
3. **三维可视化**：导入 Blender（含 BlenderGIS）、Cesium / Mapbox / Three.js，将高程作为位移生成三维地形；或经 `gdal2tiles` 切片发布为 WebGIS 地形底图。
4. **水文与地貌分析**：基于 DEM 提取流域、河网、山脊线，计算坡长坡度（LS 因子）用于土壤侵蚀评价；12.5 米分辨率对小流域刻画明显优于粗分辨率数据。







## 使用须知

- 本数据为**高程栅格**，非行政区划地图，**不涉及审图号**；公开使用请遵守数据原始版权与《测绘成果管理条例》相关要求。
- 数据中**不含**任何行政界线、国界或南海十段线要素，**不得**在其上自行添加、修改行政界线与国界画法；如需制图叠加边界，请使用本站 GS(2024)0650 标准地图矢量包并保留审图号。
- 数据仅供学习、科研与教学使用，商业用途请自行向数据原始提供方申请授权。

## 适用场景

分区域地形三维可视化、省域尺度坡度坡向与地貌类型制图、小流域水文分析、城乡规划用地适宜性、地质灾害风险评价、遥感影像地形校正、中小学与高校地理教学等。
