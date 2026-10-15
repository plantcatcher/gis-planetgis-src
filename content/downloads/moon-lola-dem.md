---
slug: moon-lola-dem
title: 月球全球 DEM 高程数据包（LOLA 三档分辨率 · 原始 IMG + GeoTIFF）
summary: NASA 月球勘测轨道器（LRO）LOLA 激光测高仪获取的月球全球数字高程模型（DEM），覆盖全月，含 4 / 16 / 128 像素每度三档分辨率的官方原始 IMG（PDS）与对应 GeoTIFF 栅格，并附全月渲染图、4 个地标高清切片与可交互三维预览页。适用于 QGIS / ArcGIS 地形出图、三维可视化、游戏与科普等场景。百度网盘分享，关注公众号获取提取码。
date: 2026-10-15
category: 地理数据
group: 地理数据
region: 月球
dataFormat: GeoTIFF
tags: 月球, LOLA, DEM, 数字高程模型, 地形数据, 月球勘测轨道器, NASA, 三维可视化, 行星科学, 遥感, 地理数据
access: gated
trigger: 月球DEM
keywordAliases: 月球DEM数据, 月球高程, 月球地形, 月球三维地形, LOLA月球高程
code: NSH-MOON-001
downloadType: baidu
download: https://pan.baidu.com/s/1lwWqFdeM4UO0RtVDojSCOA?pwd=qije
panCode: qije
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-15-moon_dem_2.jpg
format: GeoTIFF（ZIP 压缩包）
size: 4.13 GB
---

> **数据概况**：本包为月球全球数字高程模型（DEM，地形高度数据），由 NASA 月球勘测轨道器（LRO）搭载的 **LOLA 激光测高仪**测得，覆盖月球全球。数据分 **4 / 16 / 128 像素每度**三档分辨率，每档均提供官方原始数据（PDS 的 IMG 格式）与对应的 GeoTIFF 栅格，并附带全月渲染图、4 个地标高清切片与 1 个可交互三维预览页。合计 **35 个文件，约 4.13 GB**。适用于 QGIS / ArcGIS 地形出图、三维可视化、游戏与科普等场景。

![moon_128ppi_elevation_color_4096x2048](https://blogphoto.planetgis.cn/PicGo/2026-10-15-moon_128ppi_elevation_color_4096x2048.jpg)

## 数据内容

- **覆盖范围**：月球全球（经度 0~360°，纬度 −90°~+90°），以等距圆柱（Equirectangular）栅格组织，第 0 行为北极、第 0 列为 0° 经线，东经为正。
- **三档分辨率**：4 ppi（全月 1440×720）、16 ppi（5760×2880）、128 ppi（46080×23040），分辨率越高越能刻画更深的撞击坑与更高的山峰。
- **文件组成**：
  - `01_原始数据/`：三档官方 PDS 原始 IMG + 同名 LBL 标签，16 ppi 另含 JPEG2000 有损压缩版；
  - `02_渲染图与地标切片/`：4 张全月渲染图（配色晕渲 / 高程配色 / 灰度晕渲）+ 第谷坑、雨海、南极艾特肯盆地、静海 4 个地标各 3 个切片文件；
  - `03_GeoTIFF/`：三档 GeoTIFF，含同名 `.tfw` / `.prj` 坐标备用文件，QGIS / ArcGIS 直接打开；
  - `moon_3d_preview.html`：内嵌地形数据的可旋转、可缩放三维预览页（浏览器双击打开）。



## 三档分辨率对比

- **4 像素/度（最粗）**：全月网格 1440×720，像素尺寸约 7580.84 米，高程范围 −8878.5 ~ +10504.0 米。
- **16 像素/度（中等）**：全月网格 5760×2880，像素尺寸约 1895.21 米，高程范围 −8981.5 ~ +10685.5 米。
- **128 像素/度（最细）**：全月网格 46080×23040，像素尺寸约 236.90 米，高程范围 −9127.0 ~ +10778.5 米。
- 三档高程均值都在 −519.5 米左右，互相印证；分辨率越高，捕捉到的极值越极端。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-15-moon_dem_3.jpg" alt="moon_dem_3" style="zoom:67%;" />

## 高程基准与坐标

- 所有高程值均为**相对 1737.4 公里参考球面**的起伏：月球表面实际半径 = 高程值 + 1737400 米；正值为高于参考球面，负值为低于参考球面。
- 本数据是**形状模型（shape map）**，非大地水准面相对地形；月球可视为正球体（扁率为 0）。
- 投影为等距圆柱，坐标系 Moon_2000（地理坐标，单位：度），参考球半径 1737400 米、扁率 0。

## 数据格式与用法

- **原始 IMG**：裸二进制、无文件头，有符号 16 位整数小端序，高程(米) = DN × 0.5；128 ppi 文件约 1.98 GB，请用 `numpy.memmap` 按需读取，勿整块载入。
- **GeoTIFF**：与原始 IMG 像素一一对应、未降采样，16 位无符号整数、坐标已内嵌；存的是归一化到 0~65535 的整数，还原参数三档各不相同（128 ppi：VMIN −9127.0 / VMAX 10778.5），精确还原公式为 `DN = round(DN_MIN + 像素值 × SPAN / 65535)`，再 `高程 = DN × 0.5`。
- **三维预览页**：页面内嵌约 9.2 MB 地形数据，三维引擎从网络加载，首次打开需联网。

## 使用建议

1. **看效果**：打开 `02_渲染图与地标切片` 里的 JPG 渲染图与 4 个地标切片浮雕图。
2. **进 GIS 出图**：把 `03_GeoTIFF` 对应精度的 `.tif` 拖进 QGIS / ArcGIS。
3. **做三维 / 游戏**：用 16 位高度图切片，或用 GeoTIFF 作为位移贴图。
4. **做精确计算**：用 `01_原始数据` 的 IMG，按上述公式换算。

## 使用须知

- 数据版权归 **NASA / PDS** 所有，PDS 数据对公众开放、可自由使用，建议注明出处：Smith, D. E., et al. (2010), *The Lunar Orbiter Laser Altimeter investigation on the Lunar Reconnaissance Orbiter Mission*, Space Sci. Rev., 150, 209–241.
- 原始 IMG 是裸二进制、无文件头，必须按本文公式读取；16 ppi 的 `.JP2` 为有损压缩版，与原始 IMG 约有 50 米偏差，精确计算请用 `.IMG`。
- 等距圆柱投影在极区有拉伸变形，极点附近像素实际覆盖面积远小于赤道，做面积统计时需注意。
- 三维预览页需联网加载引擎；总大小 4.13 GB，其中 128 ppi 的原始 IMG 与 GeoTIFF 各约 1.98 GB，建议最后单独传输。

![moon_dem_2](https://blogphoto.planetgis.cn/PicGo/2026-10-15-moon_dem_2.jpg)

## 免费低分辨率直链（无需验证码）

以下两档较低分辨率的 GeoTIFF，可直接点击下载，**无需关注公众号、无需验证码**，适合快速预览与轻量三维：

- [月球 DEM 4 ppi GeoTIFF（1440×720，约 1.9 MB）](https://downloads.planetgis.cn/GIS/moon_dem_geotiff_4ppi.zip) — 最粗分辨率，体积极小，适合快速预览与 Web 轻量三维。
- [月球 DEM 16 ppi GeoTIFF（5760×2880，约 29.5 MB）](https://downloads.planetgis.cn/GIS/moon_dem_geotiff_16ppi.zip) — 中等分辨率，兼顾精度与体积，可直接拖入 QGIS / ArcGIS。

> 两个压缩包均含 `.tif` 栅格 + 同名 `.tfw` / `.prj` 坐标文件，解压即用。

如需更高分辨率（**128 ppi 全月 46080×23040 GeoTIFF**、官方原始 IMG、渲染图与地标切片、三维预览页，合计 **4.13 GB** 完整数据包），请按页面下方提示，解锁百度网盘下载。
