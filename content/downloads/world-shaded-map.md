---
slug: world-shaded-map
title: 世界晕渲地形图43K（Shaded Relief · 43200×21600 · JPG）
summary: 一张覆盖全球、超高清（43200×21600）的世界晕渲地形图（Shaded Relief），以光影晕渲表现地表起伏与山脉走向，纯地形渲染、通常不含政治边界线，JPG 格式，ZIP 压缩包约 43.8 MB，适合作为地球底图、PPT 科普配图、WebGIS / 三维地球纹理与地理教学素材。
date: 2026-09-24
category: 地理数据
tags: 世界地图, 晕渲地形图, 地形图, shaded relief, 世界地形, 地球底图, 栅格地图, 地理数据
access: gated
trigger: 世界晕渲地形图
keywordAliases: 世界地图, 世界地形图, 晕渲地形图
code: NSH-DT-002
download: https://downloads.planetgis.cn/GIS/world-shaded-map.zip
cover: https://blogphoto.planetgis.cn/PicGo/2026-09-24-yazhou.jpg
format: JPG 图片（ZIP 压缩包）
size: 43.8 MB
---

> 本资料为一张**世界晕渲地形图（World Shaded Relief）**，以计算机晕渲（hillshade）算法模拟光照，表现全球地表起伏、山脉走向与高原盆地形态。图像为**纯地形渲染，通常不含政治边界线与国界**，文件名 `world_shaded_43k` 中「43k」即对应其横向 43200 像素的超大幅面。ZIP 压缩包约 **43.8 MB**，解压后为单张 JPG 图片（约 52.8 MB）。**未标注官方审图号**，作为公开地形影像参考使用。

![worldmap_1](https://blogphoto.planetgis.cn/PicGo/2026-09-24-worldmap_1.jpg)

## 数据内容

压缩包内仅含 **1 个文件**：

- **world_shaded_43k.jpg**：全球晕渲地形正射影像，尺寸 **43200 × 21600 像素**（宽高比 2:1），按等距圆柱（Plate Carrée / Equirectangular）投影布局，横向对应经度 −180° 至 180°、纵向对应纬度 −90° 至 90°。地形明暗由模拟太阳高度角生成，山体立体感强，海洋以均匀深色表现，整幅图覆盖七大洲与四大洋的地表起伏。

![beimei](https://blogphoto.planetgis.cn/PicGo/2026-09-24-beimei.jpg)

![nanmei](https://blogphoto.planetgis.cn/PicGo/2026-09-24-nanmei.jpg)

![ouzhou](https://blogphoto.planetgis.cn/PicGo/2026-09-24-ouzhou.jpg)

![yazhou](https://blogphoto.planetgis.cn/PicGo/2026-09-24-yazhou.jpg)

![zhouya](https://blogphoto.planetgis.cn/PicGo/2026-09-24-zhouya.jpg)

![aozhou](https://blogphoto.planetgis.cn/PicGo/2026-09-24-aozhou.jpg)



## 坐标系与格式

本图为 **JPG 栅格影像**，本身不带地理配准文件（.tfw / .jgw 等）。按等距圆柱投影约定，像素与经纬度的对应关系为：横向每像素 = 360° / 43200 ≈ 0.00833°，纵向每像素 = 180° / 21600 ≈ 0.00833°，即约 **1 像素 ≈ 1 公里**（在赤道处）。若需在 GIS 中精确叠加矢量数据，可在 QGIS 中用「栅格地理配准（Georeferencer）」按经纬度控制点赋予 WGS84 坐标，或直接以 EPSG:4326 等距圆柱范围（−180, −90, 180, 90）定义其变换。

## 使用方法

1. **PPT / 科普配图**：直接插入幻灯片或文章，作为世界地形背景或板块构造、气候带讲解的底图，光影立体、视觉冲击强。
2. **QGIS / ArcGIS 底图**：作为栅格图层加载，按上述范围配准为 WGS84 后，叠加国界、河流、城市等矢量做专题图。
3. **WebGIS / 三维地球纹理**：可裁剪后作为 MapLibre / Cesium / Three.js 地球球面的地表纹理（texture），或转 WebP / 瓦片以提升加载性能。
4. **教学与海报**：打印为大幅面世界地形挂图，或用于展厅、科普长图的世界地貌板块展示。

## 使用须知

- 本图为**地形晕渲影像，不绘制国界与行政界线**；若将其用于涉及中国及其周边区域的正式出图，涉及领土与主权的表达须以自然资源部发布的最新标准地图与南海十段线为准，不得出现错误或缺失。
- 图像未标注官方审图号，公开或商业用途请评估合规风险，必要时向主管部门确认；本资料仅供学习、科研、教学与科普创作参考。
- 超高清大图加载占用内存较高，网页使用前建议按需裁剪、分块或压缩。

## 适用场景

世界地形 / 板块构造科普配图、地球科学与地理教学底图、WebGIS 与三维地球可视化纹理、PPT 与科普长图背景、展厅大幅面地形挂图、地形起伏与山脉走向的直观演示等。
