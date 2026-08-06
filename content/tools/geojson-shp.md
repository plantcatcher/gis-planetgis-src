---
slug: geojson-shp
title: GeoJson转SHP工具
summary: 将 GeoJSON 转换为 Shapefile，支持属性表保留与坐标系转换，是 GIS 数据处理的实用小工具。
link: https://covertool.planetgis.cn
order: 2
category: 地理小工具
tags: 地理, 地理工具, 地理小工具
---

## 介绍

「GeoJson转SHP工具」专为 GIS 工作者准备。GeoJSON 轻量、浏览器友好，是 Web 地图的首选；而 Shapefile（SHP）仍是 ArcGIS、QGIS 等桌面软件的事实标准。两者之间的转换，是日常绕不开的一步。

这个工具让你在浏览器里几秒完成转换，不必安装任何桌面 GIS 软件，也不必把数据上传到不可信的服务器——转换在本地完成。

## 功能特点

- **格式互转**：GeoJSON 与 Shapefile 双向支持。
- **属性保留**：字段名、类型与值完整带入输出文件。
- **坐标系提示**：自动识别常见 CRS，避免坐标错位。
- **本地优先**：数据在浏览器内处理，不上传第三方。

## 使用教程

1. 上传你的 `.geojson` 文件（或粘贴 JSON 文本）。
2. 确认编码与字段映射无误。
3. 点击"转换为 SHP"，系统打包生成含 .shp/.shx/.dbf 的压缩包。
4. 下载后在 QGIS / ArcGIS 中直接打开使用。

## 常见问题 FAQ

<details>
<summary>Q: 转换后坐标偏了几百米？</summary>

多半是坐标系不一致。GeoJSON 多为 WGS84，而部分 SHP 工程用投影坐标系，转换时请确认目标 CRS。

</details>

<details>
<summary>Q: 中文属性名会乱码吗？</summary>

工具对字段名做兼容处理，建议字段名使用英文，中文属性值可正常保留。

</details>

<details>
<summary>Q: 文件太大传不上去？</summary>

超大文件建议先用桌面软件分块，或联系我们获取本地版处理方案。

</details>
