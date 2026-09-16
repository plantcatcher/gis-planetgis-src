---
slug: mars-mola-dem-463m
title: NASA MGS MOLA 火星全球数字高程模型（463m 分辨率 DEM / GeoTIFF）
summary: NASA 火星全球勘测者（MGS）搭载的 MOLA 激光高度计获取的全火星数字高程模型，赤道分辨率约 463 m/像素，覆盖全球经纬度，GeoTIFF 单文件格式，含相对火星基准面（areoid）的地形高程，可直接用于 QGIS / ArcGIS / Python / Blender 火星地形三维可视化与科研制图。
date: 2026-09-16
category: 地理数据
tags: 火星, MOLA, DEM, 数字高程模型, 地形, NASA, 行星科学, 三维可视化, 遥感, 地理数据
access: gated
trigger: 火星MOLA
keywordAliases: 火星DEM, 火星高程, 火星地形
code: NSH-MARS-001
downloadType: baidu
download: https://pan.baidu.com/s/1ZowGzMq9YZYq3nxMAYcp5A?pwd=ya6f
panCode: ya6f
cover: /covers/geo-data-cover.jpg
format: GeoTIFF（.tif 单文件，ZIP 压缩包）
size: 1.17G
---

> 本数据为 NASA 火星全球勘测者（Mars Global Surveyor, MGS）任务搭载的**火星轨道激光高度计（MOLA, Mars Orbiter Laser Altimeter）**获取的全球数字高程模型（DEM），赤道分辨率约 **463 m/像素**，覆盖全球（经度 −180°~180°，纬度 −90°~90°），以 **GeoTIFF** 单文件提供，高程为相对火星基准面（areoid，平均半径 3,396,000 m）的地形起伏，单位为米。压缩包内仅含一个 .tif 文件，无外部投影文件，地理参考信息已内嵌于 TIFF 标签中。

![Mars_3](https://blogphoto.planetgis.cn/PicGo/2026-09-16-Mars_3.jpg)

## 数据内容

- **全球高程栅格**：单一 GeoTIFF，行列覆盖全火星，每个像素记录该点的地形高程（米），可用于生成山体阴影、坡度坡向、流域网络与撞击坑形态分析。
- **地理参考**：采用等距圆柱（Plate Carrée / Equirectangular）经纬度网格，坐标单位为度；高程以米为单位，基准为火星 areoid（IAU 2000 平均半径 3,396,000 m）。行星数据通常无标准 EPSG 编码，加载时按经纬度直接投影即可。
- **文件规模**：单文件 TIFF，赤道分辨率约 463 m/像素，全球范围数据量较大，建议加载前确认磁盘可用空间与内存是否充足。

![Mars_1](https://blogphoto.planetgis.cn/PicGo/2026-09-16-Mars_1.jpg)

![Mars_2](https://blogphoto.planetgis.cn/PicGo/2026-09-16-Mars_2.jpg)

## 坐标系与格式

数据使用等距圆柱（经纬度直投）网格，单像素地面尺寸约 463 m（赤道处），对应约 0.0036° 的经纬度步长。高程数据类型为整型或浮点（以米计），原点基准为火星 areoid。由于这是行星数据，**不套用地球的 CGCS2000 / WGS84 坐标系**——在 QGIS / ArcGIS 中加载时，务必将坐标系设为「未知 / 自定义经纬度」，避免被软件误判为地球经纬度而与地球底图错误叠加。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-16-Mars_d.jpg" alt="Mars_d" style="zoom:50%;" />

## 使用方法

1. **QGIS / ArcGIS**：直接「添加栅格图层」打开 .tif，做山体阴影（Hillshade）或重分类即可观察全火星地形；部分软件默认低值为暗，可按需反转色带或乘 −1 以符合「高处亮」的直觉。
2. **Python 空间处理**：用 `rasterio` / `GDAL` 读取，配合 `numpy` 计算坡度、提取剖面，或直接导出为可三维渲染的高度场（heightmap）。
3. **三维可视化**：可作为 Blender / Three.js / Unity 的高度图生成火星地形网格，叠加纹理后做沉浸式星球模型。
4. **WebGIS**：经 GDAL 转为 COG / MBTiles 后，可在 MapLibre / Cesium 上做火星球三维展示，适合科普互动大屏。

## 使用须知

- 数据版权归属 NASA / USGS，遵循其开放获取与署名要求，通常可自由用于科研与教学；公开使用建议标注来源：**NASA MGS MOLA DEM**。
- 本数据为科学观测产品而非官方测绘，存在测高噪声与极区覆盖间隙，正式成果使用前请核对原始 PDS / MEAD 文档的精度说明。
- 火星地形不存在国界或行政界线问题，但若用于科普 / 教学配图，请避免与地球地图混淆标注，确保受众明确这是火星而非地球。

## 适用场景

行星科学教学与科普、火星地形三维建模与渲染、撞击坑与河谷地貌研究、科幻 / 教育类可视化项目、天文馆与展览互动大屏、少儿天文启蒙等。

## 官方来源与扩展

本数据集原始发布于 NASA Planetary Data System（PDS）与 USGS Astrogeology 科学中心。如需更高分辨率（如 200 m 或特定区域 DEM）、经纬网格版本或配套彩色 / 阴影产品，可前往上述官方渠道检索获取。公开使用仍建议注明数据来源，并遵守 NASA / USGS 的开放数据使用条款。
