---
slug: global-dem-2024
title: 全球数字高程模型（2024 版 · GeoTIFF 单文件 DEM）
summary: 全球尺度数字高程模型（Global DEM，2024 版），以单文件 GeoTIFF（.tif）形式提供，覆盖全球经纬度范围，每个像素记录地形高程，可直接用于 QGIS / ArcGIS / Python 地形分析与三维可视化，适合全球尺度科研、教学与制图底图。
date: 2026-09-16
category: 地理数据
tags: 全球DEM, DEM, 数字高程模型, 地形, 全球, GIS, 遥感, 三维可视化, 地理数据
access: gated
trigger: 全球DEM
keywordAliases: 全球高程, 全球地形, 世界DEM
code: NSH-GDEM-001
downloadType: baidu
download: https://pan.baidu.com/s/1Zk47CY6Fm2-0y4NxPb2Lvw?pwd=xart
panCode: xart
cover: /covers/geo-data-cover.jpg
format: GeoTIFF（.tif 单文件，RAR 压缩包）
size: 4.02 GB
---

> 本数据集为**全球数字高程模型（Global DEM，2024 版）**，以**单文件 GeoTIFF（.tif）**形式提供，封装于 **RAR 压缩包**内（压缩包仅含一个 .tif 文件），覆盖全球经纬度范围，每个像素记录该点的地形高程（米）。地理参考信息内嵌于 TIFF 标签中，无需额外投影文件即可加载。坐标基准为 **WGS84 经纬度（EPSG:4326）**。**栅格分辨率以下载后的实际文件为准**——常见全球 DEM 的分辨率为 30 m / 90 m / 250 m / 1 km 等。

![earth_2](https://blogphoto.planetgis.cn/PicGo/2026-09-16-earth_2.jpg)

## 数据内容

- **全球高程栅格**：单一 GeoTIFF，覆盖范围含全球（经度 −180°~180°，纬度 −90°~90°，或按数据实际范围），每个像素对应一个地形高程值，可用于山体阴影、坡度坡向、流域提取与地形起伏分析。
- **地理参考**：经纬度直投网格，坐标单位为度；高程以米为单位。全球 DEM 通常不带标准地球 EPSG 之外的特殊基准，加载时按经纬度投影即可，具体基准请核对文件内嵌的 .prj / 坐标标签。
- **文件规模**：单文件 TIFF，全球范围数据量随分辨率不同差异很大（从数百 MB 到数 GB 不等），加载前请确认磁盘空间与内存是否充足。

![earth_1](https://blogphoto.planetgis.cn/PicGo/2026-09-16-earth_1.jpg)

## 坐标系与格式

数据以 GeoTIFF 封装，栅格像元按经纬度排列，坐标基准为 **WGS84（GCS_WGS_1984，EPSG:4326）**——这是全球 DEM 的标准地理坐标系。文件内嵌或附带的 `.prj` 其定义即为 WGS84，无需自行指定；在 QGIS / ArcGIS 中加载前，建议先核对图层属性中的「坐标系 / 空间参考」确为 EPSG:4326，避免被软件误设为未知基准而导致经纬度偏移或与其他底图错位叠加。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-09-16-earth_d.jpg" alt="earth_d" style="zoom: 50%;" />

## 使用方法

1. **QGIS / ArcGIS**：直接「添加栅格图层」打开 .tif，做山体阴影（Hillshade）或重分类即可观察全球地形；可按需反转色带以符合「高处亮」的直觉。
2. **Python 空间处理**：用 `rasterio` / `GDAL` 读取，配合 `numpy` 计算坡度、提取剖面，或裁剪出特定区域（如某大洲、某国家）做局部分析。
3. **三维可视化**：可作为 Blender / Three.js / Unity 的高度图（heightmap）生成全球或区域地形网格，叠加纹理做沉浸式地形模型。
4. **WebGIS**：经 GDAL 转为 COG / MBTiles 后，可在 MapLibre / Cesium 上做全球地形三维展示。

## 使用须知

- 数据为科学 / 公开 DEM 产品，公开使用建议标注数据来源与版本（如「Global DEM 2024」），并遵守数据提供方的许可条款。
- 若基于本数据制作**中国区域**地图或公开成果，请注意遵守《地图管理条例》相关要求，必要时核对审图号与行政界线画法，不得私自改动国界与行政界线。
- 全球 DEM 为插值 / 融合产品，存在平坦区过度平滑、植被冠层偏移、极区与高纬误差等局限，正式科研使用前请核对原始数据文档的精度说明。

## 适用场景

全球 / 大洲尺度地形分析、气候与水文建模底图、世界地理教学与科普、三维地球可视化、遥感影像地形校正（地形辐射校正）、以及作为区域 DEM 的全局背景底图等。
