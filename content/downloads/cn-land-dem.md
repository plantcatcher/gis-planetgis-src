---
slug: cn-land-dem
title: 中国陆地区域 DEM 数字高程模型（DEM）地形数据
summary: 覆盖中国陆地范围的数字高程模型（DEM）栅格数据集，以规则网格逐像元记录地面高程，适用于地形分析、流域提取、三维地形可视化、坡度坡向计算等 GIS 与遥感应用。百度网盘分享，关注公众号获取提取码。
date: 2026-09-15
category: 地理数据
tags: DEM, 数字高程模型, 地形数据, 高程栅格, 中国陆地, GIS, 地形分析, 遥感
access: gated
downloadType: baidu
trigger: 中国陆地DEM
keywordAliases: 中国DEM地形, 陆地DEM高程
code: NSH-DEM-002
download: https://pan.baidu.com/s/15RwTIO8_HeToI5FudLj23w?pwd=r79b
panCode: r79b
cover: /covers/geo-data-cover.jpg
format: 栅格 DEM（ZIP 压缩包）
size: 85.75 MB
---

> **数据概况**：中国陆地区域数字高程模型（DEM, Digital Elevation Model）栅格数据集；坐标系 **WGS84（EPSG:4326，经纬度）**；格式 **GeoTIFF（.tif，ZIP 压缩包）**；单文件大小约 **85.75 MB**。本数据为高程栅格，非行政区划地图，不涉及审图号，公开使用请遵守原始数据版权。

## 数据内容

- **覆盖范围**：中国陆地主体范围，以规则经纬度矩形网格逐像元记录地面高程（单位：米），直观呈现全国地势西高东低、三级阶梯的地形起伏。
- **数据形式**：规则网格栅格（Raster），每个像元对应一个高程数值，纯数值栅格、无属性表。
- **典型参数**（以压缩包内实际文件为准）：空间分辨率**90 米**；坐标系 **WGS84 地理坐标系**；格式以 **GeoTIFF（.tif）** 为主，并附 `.tfw` 世界文件与 `.prj` 投影文件。
- **文件清单**：压缩包内为高程栅格主文件及配套几何 / 投影信息，解压即用，无需额外配准。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-dem_5.jpg" alt="dem_5" style="zoom:50%;" />

## 坐标系与格式

数据统一采用 **WGS84 地理坐标系**（EPSG:4326），与 Google Earth、OpenStreetMap 及多数在线底图天然对齐，便于叠加配准。栅格格式为 **GeoTIFF**，自带地理参考，在 QGIS / ArcGIS 中「添加栅格图层」即可自动定位，无需手动定义投影。若包内含 `.asc` 文本栅格，可直接用文本编辑器查看头文件（ncols / nrows / xllcorner / cellsize 等参数）。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-dem_3.jpg" alt="dem_3" style="zoom: 50%;" />



## 使用方法

1. **QGIS / ArcGIS**：「图层 → 添加栅格图层」选择 `.tif` 即可加载；用「坡度 / 坡向」「填洼」「水文分析」等工具派生地形产品。
2. **Python 空间分析**：用 `rasterio` 或 `xarray` 读取为数组，配合 `numpy` / `matplotlib` 出图，或用 `richdem` 计算地形指数。
3. **三维可视化**：导入 Blender（含 BlenderGIS）、Cesium / Mapbox / Three.js，将高程作为位移生成三维地形；或经 `gdal2tiles` 切片发布为 WebGIS 地形底图。
4. **水文与地貌分析**：基于 DEM 提取流域、河网、山脊线，计算坡长坡度（LS 因子）用于土壤侵蚀评价。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-dem_1.jpg" alt="dem_1" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-dem_2.jpg" alt="dem_2" style="zoom:50%;" />

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-15-dem_4.jpg" alt="dem_4" style="zoom:50%;" />



## 使用须知

- 本数据为**高程栅格**，非行政区划地图，**不涉及审图号**；公开使用请遵守数据原始版权与《测绘成果管理条例》相关要求。
- 数据中**不含**任何行政界线、国界或南海十段线要素，**不得**在其上自行添加、修改行政界线与国界画法；如需制图叠加边界，请使用本站 GS(2024)0650 标准地图矢量包并保留审图号。
- 数据仅供学习、科研与教学使用，商业用途请自行向数据原始提供方申请授权。

## 适用场景

地形三维可视化、坡度坡向与地貌类型制图、流域与水文分析、土壤侵蚀与地质灾害评价、城乡规划用地适宜性、遥感影像地形校正、中小学与高校地理教学等。

