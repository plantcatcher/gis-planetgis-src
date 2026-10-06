---
slug: global-hydro-plants-shp
title: 全球水电站分布数据 SHP（GloHydroRes v1，WGS84，Point，7,778 座，附原始 CSV）
summary: 全球水电站（Hydropower）综合台账数据集 GloHydroRes v1，本包同时提供同名 Shapefile 点图层与原始 CSV 台账，共 7,778 座水电站，覆盖 128 个国家/地区，WGS84 经纬度坐标系，29 个字段含装机容量、投产年份、开发型式（蓄水式/径流式/抽水蓄能/渠道引水）、坝名坝高、水库名称与面积库容、水头、所属河流及逐条数据来源，适合全球水能分布、坝库耦合与电站型式构成分析。
date: 2026-10-07
category: 地理数据
tags: 全球水电站, 水电站分布, GloHydroRes, 水电装机, Shapefile, WGS84, 矢量数据, 水能资源, 能源地理, 地理数据
access: gated
trigger: 全球水电站分布数据
keywordAliases: 全球水电数据, 水电站分布数据, 全球水电站SHP, GloHydroRes
code: NSH-GIS-019
download: https://downloads.planetgis.cn/GIS/global-hydro-plants-shp.zip
cover: /covers/geo-data-cover.jpg
format: SHP（ZIP 压缩包）
size: 1.67 MB
source: GloHydroRes v1（WRI / JRC / EHA / RePP 合并的全球水电站台账）
---

> 本数据集为全球水电站综合台账 **GloHydroRes v1（Global Hydropower Reservoir / Plants dataset, version 1）**，包内含 **同名 Shapefile 点图层（7,778 座）+ 原始 CSV 台账（`GloHydroRes_vs1.csv`，2.1 MB）+ ArcGIS 元数据 `.shp.xml`**。坐标系统一为 **GCS_WGS_1984（WGS84，EPSG:4326 经纬度）**，`.prj` 随包附带，并附 `.sbn / .sbx` 空间索引。数据由 **WRI（世界资源研究所）、JRC（欧盟委员会联合研究中心）、EHA、RePP** 等多个公开来源整合而成，每条记录所属的原始来源见 `plant_sour` 字段（WRI 3,983 座、JRC 2,263 座、EHA 1,223 座、RePP 242 座，其余为个别国家的官方名录链接）。**29 个属性字段**覆盖装机、年份、型式、坝体、水库、水头、所属河流与溯源链接，是做全球水电专题分析时能拿到的信息密度最高的一版开源数据。

> 提示：本站「全球水电站」互动地图的数据源与本包同源（均出自 `GloHydroRes_vs1.csv`），如果你在那张图上验证过某个点位，用本包在本地复算的结果应当一致。

![shuidian_1](https://blogphoto.planetgis.cn/PicGo/2026-10-07-shuidian_1.jpg)

![shuidian_2](https://blogphoto.planetgis.cn/PicGo/2026-10-07-shuidian_2.jpg)



## 数据内容

- **要素与几何**：单一 Point 图层，**7,778 座水电站**（其中 **4 条为 Null Shape 空几何**，属于源数据自身的缺陷记录，加载后在属性表里会以空白⁄无 Geometry 形式出现，统计前建议剔除）。
- **覆盖 128 个国家/地区**。按站数前列：美国 1,223 座、中国 938 座、挪威 709 座、巴西 569 座、加拿大 519 座、法国 346 座、意大利 283 座、瑞士 249 座、印度 239 座、瑞典 177 座。按**总装机**排序则格局完全不同：中国 **254.8 GW**、巴西 105.8 GW、美国 101.8 GW、加拿大 80.7 GW、俄罗斯 48.8 GW、印度 46.1 GW、挪威 32.2 GW、日本 28.7 GW、法国 21.6 GW、意大利 19.0 GW。
- **总装机容量 1,101,414 MW（约 1,101 GW）**，全部 7,778 条记录的 `capacity_m` 均有有效值，无缺失。
- **开发型式（`plant_type`）**：径流式 `ROR` 3,236 座、蓄水式（水库式）`STO` 2,662 座、**未标注** 1,251 座、抽水蓄能 `PS` 332 座、渠道引水 `Canal` 297 座。未标注的 1,251 座约占 16%，做型式构成分析时要单独口径处理。
- **投产年份**：实测范围 **1830—2024**（横跨近两个世纪），但 **663 条缺年份**。按年代分箱：1900 年前约 32 座，1900—1959 年约 2,029 座，1960—1999 年约 2,693 座，2000 年以后约 2,361 座 —— 数据本身呈现出清晰的水电开发史节奏。

<img src="https://blogphoto.planetgis.cn/PicGo/2026-10-07-2026-10-07-shuidian_0.jpeg" alt="shuidian_0" style="zoom:67%;" />

## 字段说明（29 个）

Shapefile 原始字段名为英文短名，主要字段释义如下：

- **标识与位置**：`ID`（GHR 前缀顺序号，如 GHR00001，即 GloHydroRes 第 1 号）、`name`（电站名）、`country`、`plant_lat` / `plant_lon`（机组经纬度）、`man_dam_la` / `man_dam_lo`（人工校准后的坝址坐标，0 表示未校准）
- **规模与时点**：`capacity_m`（装机，MW）、`year`（投产年份）、`plant_type`（型式代码）、`plant_ty_1`（型式判定来源）、`plant_sour` / `plant_so_1`（数据来源与其内部 ID）
- **坝体**：`dam_name`、`dam_height`（坝高，米；最大值 **305 m**）、`dam_heig_1`（坝高来源）
- **水库**：`res_name`、`res_avg_de`（平均水深，米）、`res_area_k`（水库面积，km²）、`res_vol_km`（库容，km³）、`res_attr_s` / `res_attr_i`（水库属性来源与 GranD 库 ID）、`res_dam_so` / `res_dam__1`（坝库关联来源与 GranD ID，4,557 条非零）、`hydrolakes`（HydroLAKES 多边形 ID，3,394 条非零）
- **水文**：`river`（所属河流，6,371 条有值）、`head_m`（水头，米；最大值 **2,000 m**）、`head_sourc`（水头来源）
- **质量控制**：`final_comm`（574 条非空，含 JRC 标注、"Not sure if dam location is correct"、"Location is wrong in WRI" 等校验批注）

**几个高价值交叉字段**：`res_area_k` 合计约 **551,011 km²**，配合 `res_vol_km` 可做库容—面积关系分析；`hydrolakes` 与 `res_dam__1` 可直接与 HydroLAKES、GranD 两个公开库做外键关联，把水电属性 JOIN 到水库多边形上；`final_comm` 非空记录建议在正式成果中优先复核。

## 坐标系与格式

统一 **WGS84 地理坐标系（EPSG:4326 经纬度）**，`.prj` 随包附带，与天地图、Esri World Imagery、OSM 等 Web 底图天然对齐。

- 压缩后包体 **1.67 MB**，解压后 **32.35 MB**（8 个文件），主要体积来自 `.dbf`（30 MB）。
- ⚠️ **编码注意**：包内**没有 `.cpg` 文件**。实测该 DBF 为 **GBK（CP936）编码**，若按 QGIS 默认的 UTF-8 打开，欧洲（葡语、德语、法语）电站名称中的带音符字符会显示为乱码或直接变成问号。**正确做法**：在 QGIS「添加矢量图层」→ 编码选择 **GBK / CP936**，或用 `gpd.read_file(path, encoding='gbk')` 读取。此外，个别名称在源头数据清洗时就已被替换为 `?`（如 `Apol?nio Sales`），这属于源数据本身的字符丢失，不是压缩包损坏。

## 使用方法

1. **QGIS / ArcGIS**：加载后用 `plant_type` 做分类设色（4 类 + 未标注），用 `capacity_m` 做分级气泡；叠加 Esri World Imagery 可目视校验坝址坐标（本数据适用于全球尺度，境外区域高德 / 百度底图会空白）。建议按 `country` 先行 filter，7,778 个点在世界图上密度极高。
2. **Python 空间分析**：`geopandas.read_file(path, encoding='gbk')` 读取后，`df.dropna(subset=['geometry'])` 剔除 4 条空几何，再按 `country` / `plant_type` 做分组统计；配合 HydroLAKES 可进一步做「单位库容装机」「坝高—装机回归」等分析。
3. **WebGIS 专题图**：CSV 与 SHP 二选一都行 —— CSV 便于用 pandas 清洗后直接生成 GeoJSON。建议分层渲染：全球视野只展示 `capacity_m` ≥ 1,000 MW 的巨型电站，其余按 `plant_type` 用聚合气泡（cluster）呈现，交互性能最好。
4. **与原 csv 互校**：SHP 的属性表与 `GloHydroRes_vs1.csv` 行数一致，需要完整长文本（如超长溯源 URL）时以 CSV 为准 —— Shapefile 对字符型字段有 254 字节上限，部分长链接可能被截断。

## 使用须知

- 数据集整合自 WRI / JRC / EHA / RePP 等公开来源（JRC Open Data 通常为 CC BY 4.0 类别许可），**引用时请注明 GloHydroRes v1 及各条记录对应的原始来源（`plant_sour` 字段）**。
- ⚠️ **合规处理：** 原始 `country` 字段中存在独立的 **`Taiwan`** 取值（共 7 座）。这不是主权国家表述 —— 本站处理原则是将其**并入中国**（`country == 'China'` 938 座 + `Taiwan` 7 座），制图与统计口径均按「中国台湾地区」处理，任何时候不得表述为独立国家。
- 本图层**不含任何国界与行政界线**。若需表达国界、海岸线或南海十段线，必须以自然资源部发布的标准地图为准，**严禁**对国界与十段线进行删改、位移或歪曲。
- 装机容量、投产年份存在多源合并带来的口径差异，`final_comm` 标注了部分位置存疑记录；工程化或发表用途请以各国能源主管部门 / 电站业主的最新官方数据复核。
- 数据仅供学习、科研与教学制图参考。

## 适用场景

全球水能资源分布与开发强度制图、水电装机容量与型式构成（蓄水 / 径流 / 抽蓄）对比、坝—库—河流耦合分析、水库淹没面积与库容统计、水电开发史（1830—2024 年）时序可视化、能源地理与世界地理教学演示、以及与本站「全球水电站」互动地图配套的本地深化分析。
