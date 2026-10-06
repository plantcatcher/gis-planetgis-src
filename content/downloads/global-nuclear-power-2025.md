---
slug: global-nuclear-power-2025
title: 全球核电机组与核设施分布数据 SHP（GNPT 2025-09，WGS84，Point，1,387 台机组 / 485 座场址）
summary: 依据 Global Energy Monitor「全球核电站追踪器」（Global Nuclear Power Tracker，GNPT，2025 年 9 月发布版）整理的全球核电矢量数据集，含机组级（1,387 台）与场址级（485 座）两个 Point 图层，WGS84 坐标系，属性含国别、项目名、机组名、净容量、运行状态、堆型、型号、投运与退役日期、业主、运营商及 GEM 词条链接，适合做全球核电装机格局、堆型结构与在建/退役趋势分析。数据许可 CC BY 4.0。
date: 2026-10-07
category: 地理数据
tags: 全球核电, 核电站, 核电机组, GNPT, Global Energy Monitor, 堆型, Shapefile, WGS84, 矢量数据, 能源地理, 地理数据
access: gated
trigger: 全球核电站分布数据
keywordAliases: 全球核电数据, 核电站分布数据, 全球核电SHP, GNPT
code: NSH-GIS-017
download: https://downloads.planetgis.cn/GIS/global-nuclear-power-2025.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 0.19 MB
source: Global Energy Monitor, Global Nuclear Power Tracker（2025-09 发布版，CC BY 4.0）
---

> 本数据集依据 **Global Energy Monitor（GEM）** 的 **Global Nuclear Power Tracker（GNPT）** 2025 年 9 月发布版（文件名标注 2025-09）整理，以 Shapefile 形式交付 **两个图层**：**机组级 1,387 台**与**场址级 485 座**，均为 Point（点）要素，坐标系统一为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，`.prj` 随包附带。属性涵盖国别、项目名、机组名、净容量、运行状态、反应堆类型、型号、建造开工／首次临界／首次并网／商业运行／退役日期、业主与运营商、经纬度、UN 地理分区与 GEM 词条链接，包内另附一份中英文数据源说明 `_README.txt`。数据许可为 **Creative Commons Attribution 4.0（CC BY 4.0）**，可自由使用但须署名来源。



![hedian_1](https://blogphoto.planetgis.cn/PicGo/2026-10-07-hedian_1.jpg)

![hedian_2](https://blogphoto.planetgis.cn/PicGo/2026-10-07-hedian_2.jpg)

## 数据内容

数据包共 **2 个 Point 图层**，`.shp / .shx / .dbf / .prj / .cpg / .sbn / .sbx` 齐全，**两个图层一一对应，可用 `GEM locati` 字段做连接**：

- **全球核电机组_GNPT_2025-09（1,387 台机组）**：每条记录**一台机组**。同一座核电站有几台机组就有几条记录，因此美国这样的大机组国家记录数最多（410 条）。这是做「装机容量、机组数量、堆型结构」统计的主图层。
- **全球核电设施地点_GNPT_2025-09（485 座场址）**：按 **GEM location ID** 去重，把同一项目场址的多台机组合并为一条记录，属性含 `Unit Count`（机组数）、`Total Capa`（场址总容量）、`Unit Statu`（状态集合）、`Reactor Ty`（堆型集合）。做**点位制图、符号化分级、底图打点**时用这一层，避免同一地址叠加多个重叠点。

两者的机组数量口径一致：场址层 `Unit Count` 合计 1,387，与机组层记录数完全吻合。



<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-07-hedian_0.jpg" alt="hedian_0" style="zoom:67%;" />

## 字段说明

Shapefile 字段名最长 **10 个字符**，源文件里的长字段名被强制截断，这是该数据最容易让人困惑的地方。恢复后的对应关系如下（推断依据官方 XLSX 与 KML，使用前建议核对）：

- **标识与位置**：`Date Last`（数据更新日期）、`Country/Ar`（Country/Area，国家/地区）、`Project Na`（项目名）、`Unit Name`（机组编号）、`Latitude` / `Longitude`（纬度 / 经度）、`City`、`State/Prov`（州 / 省）、`Local Area`、`Major Area`、`Subregion` / `Region`（UN 次区域 / 大洲）
- **规模与状态**：`Capacity (`（Capacity (MW)，机组净容量，单位 MW）、`Reference`（参考净容量）、`Design Net`（设计净容量）、`Thermal Ca`（热功率）、`Status`（机组状态）
- **堆型**：`Reactor Ty`（Reactor Type，反应堆类型）、`Model`（具体型号，如 Hualong One、PHWR KWU）
- **时间线**：`Constructi`（开工）、`First Crit`（首次临界）、`First Grid`（首次并网）、`Commercial`（商业运行）、`Start Year`（投运年份）、`Retirement`（退役年份）、`Retireme_1`（退役日期）、`Cancellati`（取消年份）、`Planned Re`（是否计划退役）
- **权属**：`Owner` / `Owner Name`（业主及持股比例）、`Operator` / `Operator N`（运营商）
- **定位与溯源**：`Location A`（Location Accuracy，定位精度）、`GEM locati`（场址 ID）、`GEM unit I`（机组 ID）、`Wiki URL`（GEM 官方词条）

**`.cpg` 已声明为 UTF-8**，QGIS / ArcGIS 一般能自动识别；若个别非 ASCII 名称显示异常（如拉美、法语人名），在加载时手动指定 UTF-8 即可。

## 覆盖范围与已知缺口

- **实测覆盖 59 个国家/地区、1,387 台机组**（机组层）。按大洲分布：欧洲 576 台、美洲 481 台、亚洲 284 台、非洲 46 台；按机组数量排序前五位为美国（410）、俄罗斯（124）、英国（88）、法国（83）、日本（81）。
- **在运机组 363 台，合计 340,443 MW（约 340 GW）**，分布在 31 个国家/地区；在运数量前列：美国 94 台、法国 57 台、俄罗斯 36 台、韩国 26 台、印度 21 台、加拿大 19 台、乌克兰 15 台、日本 14 台。
- **状态口径为 10 类**：operating（在运）363、cancelled（已取消）310、announced（已宣布）235、retired（已退役）221、pre-construction（开工前）117、cancelled - inferred 4 y（超 4 年无进展推断取消）47、construction（在建）43、mothballed（封停）25、shelved（搁置）15、shelved - inferred 2 y 11。做「当前在运」专题时必须**先按 Status 过滤**，否则会把历史上取消或退役的项目一并统计。
- **堆型构成（17 类）**：压水堆 pressurized water reactor 665 台、沸水堆 boiling water reactor 184 台、小型模块化堆 small modular reactor 140 台、未标注 127 台、重水压水堆（PHWR/CANDU 类）pressurized heavy water reactor 87 台、气冷堆 gas-cooled reactor 58 台、石墨水冷堆 light water graphite reactor 34 台、高温气冷堆 high temperature gas reactor 26 台、快中子增殖堆 fast breeder reactor 22 台，其余为先进沸水堆、液态金属快堆、熔盐堆、微型堆等小众堆型。
- **投运年份跨度 1951—2040**（后者为在建／计划项目的预计年份），可用于堆龄结构分析。
- **定位精度**：机组层 1,025 条为 exact（精确）、362 条为 approximate（近似）；拟建项目的坐标多为近似位置，不宜用于工程尺度分析。
- ⚠️ **重要缺口：本包实测数据不包含中国大陆与中国台湾的核电机组**。59 个国家/地区清单中没有 China / Taiwan 取值，这是源数据整理过程中的过滤结果，不是坐标系或读取方式造成的缺失。**若要制作完整的全球核电视图，必须自行补充中国核电数据**（可参考中国核能行业协会公开机组清单），否则会得出严重的区域结构性偏差。
- ⚠️ **数量口径差异**：包内 `_README.txt` 标注为「1,749 个点 / 571 个点 / 61 个国家」，与包内实际 Shapefile 的 **1,387 / 485 / 59** 不一致。**一切统计请以实际加载的数据为准**，本站上述数字均为对 Shapefile 的实测结果。
- 该数据集所称「核设施地点」指 GNPT 的**核电项目场址**，**不包含**铀矿、铀浓缩厂、核燃料制造厂、核废料处置场与纯科研反应堆。

## 坐标系与格式

统一 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，`.prj` 已随包附带，与天地图、高德、OSM 等 Web 底图天然对齐。压缩后包体 **0.19 MB**，解压后约 **4.04 MB**（15 个文件），可直接加载，无需投影转换。

## 使用方法

1. **QGIS / ArcGIS**：场址层用于制图 —— 按 `Total Capa` 用分级符号（Graduated）做气泡大小，`Status` 字段虽为合并后的多值集合，可用表达式 `strpos("Unit Statu", 'operating') >= 0` 判定场址是否含在运机组；机组层用于统计 —— 按 `Country/Ar` 做分区统计汇总，或按 `Start Year` 做堆龄直方图。
2. **Python 空间分析**：用 `geopandas.read_file()` 读取，` df.groupby('Status')['Capacity ('].sum()` 得到分状态装机；配合 `matplotlib` 或 `plotly` 出堆型构成饼图与装机排名条形图。
3. **WebGIS 专题图**：场址层经 `ogr2ogr` 转 GeoJSON 后可直接作为 MapLibre / Leaflet 的数据源；建议以 `GEM locati` 作为 join key，把机组层按 `sum(capacity)` 聚合后写入场址层属性，前端只加载 485 个点，交互性能与信息量兼得。

## 使用须知

- 数据来源 **Global Energy Monitor, Global Nuclear Power Tracker, September 2025 release**，许可 **CC BY 4.0**：可自由复制、修改、再发布，**必须署名来源**并保留许可声明。建议引用格式：Global Energy Monitor, Global Nuclear Power Tracker, September 2025 release.（官方页面 https://globalenergymonitor.org/projects/global-nuclear-power-tracker/）
- 数据中的国家/地区名称沿用 GEM 原始表述。本数据集**不含**任何国界与行政界线画法，如制图中需要表达国界、海岸线或南海十段线，须以自然资源部发布的标准地图为准，**严禁**对国界与十段线进行删改、位移或歪曲。
- 同一坐标可能存在多座项目场址与多期机组；「在运」容量随版本月度更新，用于正式报告前请核对 GEM 官网最新发布版。
- 数据仅供学习、科研与教学制图参考；涉及核电设施的高精度坐标发布请遵守所在国相关法规。

## 适用场景

全球核电装机格局与堆型结构分析、在运／在建／退役机组的时间演化、全球能源转型与低碳电源地理、 owner集中度与核电产业链分析、世界地理与能源地理教学演示、WebGIS 全球核能专题底图。
