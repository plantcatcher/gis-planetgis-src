---
slug: china-epsg-codes
title: 中国常用坐标系 EPSG 代码速查：CGCS2000、西安 80、北京 54 高斯投影全表
summary: 一页查全国内常用坐标系的 EPSG 代码：CGCS2000（EPSG:4490）、WGS 84、西安 80、北京 54 的经纬度坐标系，以及三者 3° 带、6° 带高斯-克吕格投影的带号版与无带号版全部代码。代码与参数从 EPSG 数据库读取并校验，附带号判断方法、UTM 对照与常见踩坑。
date: 2026-11-15
category: 地理基础
subject: 地理信息技术
tags: EPSG, CGCS2000, 坐标系, 高斯-克吕格投影, 西安80, 北京54, 投影坐标系, GIS
tableSearch: true
---

> 本页所有 EPSG 代码、名称与投影参数均直接读取自 PROJ 9.3.0 自带的 EPSG 数据库并逐条校验（中央经线、假东偏移、带号三者一致），不是手抄的。顶部搜索框可直接搜 `4549`、`120°E` 或 `CGCS2000`。

## 一、先分清两件事：地理坐标系 vs 投影坐标系

- **地理坐标系**（经纬度，单位是度）：描述「用哪个椭球、哪个基准」。例如 `EPSG:4490` 就是 CGCS2000 经纬度。
- **投影坐标系**（平面坐标，单位是米）：在地理坐标系基础上再做投影。我国大比例尺测绘、规划成果几乎都用**高斯-克吕格投影**，按 3° 或 6° 分带。

拿到一份数据，先看它的坐标是「三位数.小数」的经纬度，还是「六七位数」的米制坐标，就能大致判断是哪一类。

## 二、常用地理坐标系

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>EPSG</th><th>中文名</th><th>EPSG 名称</th><th>椭球</th><th>长半轴 / 扁率</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>EPSG:4490</code></td><td>CGCS2000 地理坐标</td><td>China Geodetic Coordinate System 2000</td><td>CGCS2000</td><td>6,378,137 m / 1:298.257222</td><td>我国现行法定大地坐标系，2008 年 7 月 1 日起启用；天地图、自然资源部门成果默认用它</td></tr>
    <tr><td><code>EPSG:4326</code></td><td>WGS 84 地理坐标</td><td>WGS 84</td><td>WGS 84</td><td>6,378,137 m / 1:298.257224</td><td>GPS 使用的坐标系；与 CGCS2000 在一般制图精度下可视为一致（差异在厘米级）</td></tr>
    <tr><td><code>EPSG:4610</code></td><td>西安 80 地理坐标</td><td>Xian 1980</td><td>IAG 1975</td><td>6,378,140 m / 1:298.257</td><td>1980 西安坐标系，大量 2000–2010 年代的国土、规划数据仍在用</td></tr>
    <tr><td><code>EPSG:4214</code></td><td>北京 54 地理坐标</td><td>Beijing 1954</td><td>Krassowsky 1940</td><td>6,378,245 m / 1:298.3</td><td>1954 北京坐标系，更早期的地形图和测绘成果</td></tr>
    <tr><td><code>EPSG:4555</code></td><td>新北京 54 地理坐标</td><td>New Beijing</td><td>Krassowsky 1940</td><td>6,378,245 m / 1:298.3</td><td>把北京 54 换到 IAG-75 椭球上的过渡坐标系，部分老软件和数据里能见到</td></tr>
  </tbody>
</table>
</div>

另外两个常见的 Web 坐标：
- `EPSG:3857`（WGS 84 / Pseudo-Mercator，Web 墨卡托）：谷歌、OSM、天地图瓦片等网络地图的通用投影，中央经线 0°，**只适合显示，不适合量算面积和距离**。
- **GCJ-02（火星坐标）和 BD-09（百度坐标）没有 EPSG 代码**，它们是在 WGS 84 上加了非线性偏移的加密坐标，需要专门的算法转换。可以用本站的[坐标转换工具](/tools/coord-tool)在 WGS 84 / GCJ-02 / BD-09 之间互转。

## 三、CGCS2000 高斯-克吕格投影 EPSG 全表

现在新做的项目基本都用这一组。每个带都有**两个 EPSG 代码**，区别只在于横坐标前面有没有加带号（见第六节）。

**6° 分带**（11 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>13</td><td>75°E</td><td><code>EPSG:4491</code></td><td><code>EPSG:4502</code></td></tr>
    <tr><td>14</td><td>81°E</td><td><code>EPSG:4492</code></td><td><code>EPSG:4503</code></td></tr>
    <tr><td>15</td><td>87°E</td><td><code>EPSG:4493</code></td><td><code>EPSG:4504</code></td></tr>
    <tr><td>16</td><td>93°E</td><td><code>EPSG:4494</code></td><td><code>EPSG:4505</code></td></tr>
    <tr><td>17</td><td>99°E</td><td><code>EPSG:4495</code></td><td><code>EPSG:4506</code></td></tr>
    <tr><td>18</td><td>105°E</td><td><code>EPSG:4496</code></td><td><code>EPSG:4507</code></td></tr>
    <tr><td>19</td><td>111°E</td><td><code>EPSG:4497</code></td><td><code>EPSG:4508</code></td></tr>
    <tr><td>20</td><td>117°E</td><td><code>EPSG:4498</code></td><td><code>EPSG:4509</code></td></tr>
    <tr><td>21</td><td>123°E</td><td><code>EPSG:4499</code></td><td><code>EPSG:4510</code></td></tr>
    <tr><td>22</td><td>129°E</td><td><code>EPSG:4500</code></td><td><code>EPSG:4511</code></td></tr>
    <tr><td>23</td><td>135°E</td><td><code>EPSG:4501</code></td><td><code>EPSG:4512</code></td></tr>
  </tbody>
</table>
</div>

**3° 分带**（21 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>25</td><td>75°E</td><td><code>EPSG:4513</code></td><td><code>EPSG:4534</code></td></tr>
    <tr><td>26</td><td>78°E</td><td><code>EPSG:4514</code></td><td><code>EPSG:4535</code></td></tr>
    <tr><td>27</td><td>81°E</td><td><code>EPSG:4515</code></td><td><code>EPSG:4536</code></td></tr>
    <tr><td>28</td><td>84°E</td><td><code>EPSG:4516</code></td><td><code>EPSG:4537</code></td></tr>
    <tr><td>29</td><td>87°E</td><td><code>EPSG:4517</code></td><td><code>EPSG:4538</code></td></tr>
    <tr><td>30</td><td>90°E</td><td><code>EPSG:4518</code></td><td><code>EPSG:4539</code></td></tr>
    <tr><td>31</td><td>93°E</td><td><code>EPSG:4519</code></td><td><code>EPSG:4540</code></td></tr>
    <tr><td>32</td><td>96°E</td><td><code>EPSG:4520</code></td><td><code>EPSG:4541</code></td></tr>
    <tr><td>33</td><td>99°E</td><td><code>EPSG:4521</code></td><td><code>EPSG:4542</code></td></tr>
    <tr><td>34</td><td>102°E</td><td><code>EPSG:4522</code></td><td><code>EPSG:4543</code></td></tr>
    <tr><td>35</td><td>105°E</td><td><code>EPSG:4523</code></td><td><code>EPSG:4544</code></td></tr>
    <tr><td>36</td><td>108°E</td><td><code>EPSG:4524</code></td><td><code>EPSG:4545</code></td></tr>
    <tr><td>37</td><td>111°E</td><td><code>EPSG:4525</code></td><td><code>EPSG:4546</code></td></tr>
    <tr><td>38</td><td>114°E</td><td><code>EPSG:4526</code></td><td><code>EPSG:4547</code></td></tr>
    <tr><td>39</td><td>117°E</td><td><code>EPSG:4527</code></td><td><code>EPSG:4548</code></td></tr>
    <tr><td>40</td><td>120°E</td><td><code>EPSG:4528</code></td><td><code>EPSG:4549</code></td></tr>
    <tr><td>41</td><td>123°E</td><td><code>EPSG:4529</code></td><td><code>EPSG:4550</code></td></tr>
    <tr><td>42</td><td>126°E</td><td><code>EPSG:4530</code></td><td><code>EPSG:4551</code></td></tr>
    <tr><td>43</td><td>129°E</td><td><code>EPSG:4531</code></td><td><code>EPSG:4552</code></td></tr>
    <tr><td>44</td><td>132°E</td><td><code>EPSG:4532</code></td><td><code>EPSG:4553</code></td></tr>
    <tr><td>45</td><td>135°E</td><td><code>EPSG:4533</code></td><td><code>EPSG:4554</code></td></tr>
  </tbody>
</table>
</div>

## 四、西安 80 高斯-克吕格投影 EPSG 全表

**6° 分带**（11 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>13</td><td>75°E</td><td><code>EPSG:2327</code></td><td><code>EPSG:2338</code></td></tr>
    <tr><td>14</td><td>81°E</td><td><code>EPSG:2328</code></td><td><code>EPSG:2339</code></td></tr>
    <tr><td>15</td><td>87°E</td><td><code>EPSG:2329</code></td><td><code>EPSG:2340</code></td></tr>
    <tr><td>16</td><td>93°E</td><td><code>EPSG:2330</code></td><td><code>EPSG:2341</code></td></tr>
    <tr><td>17</td><td>99°E</td><td><code>EPSG:2331</code></td><td><code>EPSG:2342</code></td></tr>
    <tr><td>18</td><td>105°E</td><td><code>EPSG:2332</code></td><td><code>EPSG:2343</code></td></tr>
    <tr><td>19</td><td>111°E</td><td><code>EPSG:2333</code></td><td><code>EPSG:2344</code></td></tr>
    <tr><td>20</td><td>117°E</td><td><code>EPSG:2334</code></td><td><code>EPSG:2345</code></td></tr>
    <tr><td>21</td><td>123°E</td><td><code>EPSG:2335</code></td><td><code>EPSG:2346</code></td></tr>
    <tr><td>22</td><td>129°E</td><td><code>EPSG:2336</code></td><td><code>EPSG:2347</code></td></tr>
    <tr><td>23</td><td>135°E</td><td><code>EPSG:2337</code></td><td><code>EPSG:2348</code></td></tr>
  </tbody>
</table>
</div>

**3° 分带**（21 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>25</td><td>75°E</td><td><code>EPSG:2349</code></td><td><code>EPSG:2370</code></td></tr>
    <tr><td>26</td><td>78°E</td><td><code>EPSG:2350</code></td><td><code>EPSG:2371</code></td></tr>
    <tr><td>27</td><td>81°E</td><td><code>EPSG:2351</code></td><td><code>EPSG:2372</code></td></tr>
    <tr><td>28</td><td>84°E</td><td><code>EPSG:2352</code></td><td><code>EPSG:2373</code></td></tr>
    <tr><td>29</td><td>87°E</td><td><code>EPSG:2353</code></td><td><code>EPSG:2374</code></td></tr>
    <tr><td>30</td><td>90°E</td><td><code>EPSG:2354</code></td><td><code>EPSG:2375</code></td></tr>
    <tr><td>31</td><td>93°E</td><td><code>EPSG:2355</code></td><td><code>EPSG:2376</code></td></tr>
    <tr><td>32</td><td>96°E</td><td><code>EPSG:2356</code></td><td><code>EPSG:2377</code></td></tr>
    <tr><td>33</td><td>99°E</td><td><code>EPSG:2357</code></td><td><code>EPSG:2378</code></td></tr>
    <tr><td>34</td><td>102°E</td><td><code>EPSG:2358</code></td><td><code>EPSG:2379</code></td></tr>
    <tr><td>35</td><td>105°E</td><td><code>EPSG:2359</code></td><td><code>EPSG:2380</code></td></tr>
    <tr><td>36</td><td>108°E</td><td><code>EPSG:2360</code></td><td><code>EPSG:2381</code></td></tr>
    <tr><td>37</td><td>111°E</td><td><code>EPSG:2361</code></td><td><code>EPSG:2382</code></td></tr>
    <tr><td>38</td><td>114°E</td><td><code>EPSG:2362</code></td><td><code>EPSG:2383</code></td></tr>
    <tr><td>39</td><td>117°E</td><td><code>EPSG:2363</code></td><td><code>EPSG:2384</code></td></tr>
    <tr><td>40</td><td>120°E</td><td><code>EPSG:2364</code></td><td><code>EPSG:2385</code></td></tr>
    <tr><td>41</td><td>123°E</td><td><code>EPSG:2365</code></td><td><code>EPSG:2386</code></td></tr>
    <tr><td>42</td><td>126°E</td><td><code>EPSG:2366</code></td><td><code>EPSG:2387</code></td></tr>
    <tr><td>43</td><td>129°E</td><td><code>EPSG:2367</code></td><td><code>EPSG:2388</code></td></tr>
    <tr><td>44</td><td>132°E</td><td><code>EPSG:2368</code></td><td><code>EPSG:2389</code></td></tr>
    <tr><td>45</td><td>135°E</td><td><code>EPSG:2369</code></td><td><code>EPSG:2390</code></td></tr>
  </tbody>
</table>
</div>

## 五、北京 54 高斯-克吕格投影 EPSG 全表

**6° 分带**（11 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>13</td><td>75°E</td><td><code>EPSG:21413</code></td><td><code>EPSG:21453</code></td></tr>
    <tr><td>14</td><td>81°E</td><td><code>EPSG:21414</code></td><td><code>EPSG:21454</code></td></tr>
    <tr><td>15</td><td>87°E</td><td><code>EPSG:21415</code></td><td><code>EPSG:21455</code></td></tr>
    <tr><td>16</td><td>93°E</td><td><code>EPSG:21416</code></td><td><code>EPSG:21456</code></td></tr>
    <tr><td>17</td><td>99°E</td><td><code>EPSG:21417</code></td><td><code>EPSG:21457</code></td></tr>
    <tr><td>18</td><td>105°E</td><td><code>EPSG:21418</code></td><td><code>EPSG:21458</code></td></tr>
    <tr><td>19</td><td>111°E</td><td><code>EPSG:21419</code></td><td><code>EPSG:21459</code></td></tr>
    <tr><td>20</td><td>117°E</td><td><code>EPSG:21420</code></td><td><code>EPSG:21460</code></td></tr>
    <tr><td>21</td><td>123°E</td><td><code>EPSG:21421</code></td><td><code>EPSG:21461</code></td></tr>
    <tr><td>22</td><td>129°E</td><td><code>EPSG:21422</code></td><td><code>EPSG:21462</code></td></tr>
    <tr><td>23</td><td>135°E</td><td><code>EPSG:21423</code></td><td><code>EPSG:21463</code></td></tr>
  </tbody>
</table>
</div>

**3° 分带**（21 个带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>中央经线</th><th>带号版（加带号）</th><th>无带号版（CM）</th></tr>
  </thead>
  <tbody>
    <tr><td>25</td><td>75°E</td><td><code>EPSG:2401</code></td><td><code>EPSG:2422</code></td></tr>
    <tr><td>26</td><td>78°E</td><td><code>EPSG:2402</code></td><td><code>EPSG:2423</code></td></tr>
    <tr><td>27</td><td>81°E</td><td><code>EPSG:2403</code></td><td><code>EPSG:2424</code></td></tr>
    <tr><td>28</td><td>84°E</td><td><code>EPSG:2404</code></td><td><code>EPSG:2425</code></td></tr>
    <tr><td>29</td><td>87°E</td><td><code>EPSG:2405</code></td><td><code>EPSG:2426</code></td></tr>
    <tr><td>30</td><td>90°E</td><td><code>EPSG:2406</code></td><td><code>EPSG:2427</code></td></tr>
    <tr><td>31</td><td>93°E</td><td><code>EPSG:2407</code></td><td><code>EPSG:2428</code></td></tr>
    <tr><td>32</td><td>96°E</td><td><code>EPSG:2408</code></td><td><code>EPSG:2429</code></td></tr>
    <tr><td>33</td><td>99°E</td><td><code>EPSG:2409</code></td><td><code>EPSG:2430</code></td></tr>
    <tr><td>34</td><td>102°E</td><td><code>EPSG:2410</code></td><td><code>EPSG:2431</code></td></tr>
    <tr><td>35</td><td>105°E</td><td><code>EPSG:2411</code></td><td><code>EPSG:2432</code></td></tr>
    <tr><td>36</td><td>108°E</td><td><code>EPSG:2412</code></td><td><code>EPSG:2433</code></td></tr>
    <tr><td>37</td><td>111°E</td><td><code>EPSG:2413</code></td><td><code>EPSG:2434</code></td></tr>
    <tr><td>38</td><td>114°E</td><td><code>EPSG:2414</code></td><td><code>EPSG:2435</code></td></tr>
    <tr><td>39</td><td>117°E</td><td><code>EPSG:2415</code></td><td><code>EPSG:2436</code></td></tr>
    <tr><td>40</td><td>120°E</td><td><code>EPSG:2416</code></td><td><code>EPSG:2437</code></td></tr>
    <tr><td>41</td><td>123°E</td><td><code>EPSG:2417</code></td><td><code>EPSG:2438</code></td></tr>
    <tr><td>42</td><td>126°E</td><td><code>EPSG:2418</code></td><td><code>EPSG:2439</code></td></tr>
    <tr><td>43</td><td>129°E</td><td><code>EPSG:2419</code></td><td><code>EPSG:2440</code></td></tr>
    <tr><td>44</td><td>132°E</td><td><code>EPSG:2420</code></td><td><code>EPSG:2441</code></td></tr>
    <tr><td>45</td><td>135°E</td><td><code>EPSG:2421</code></td><td><code>EPSG:2442</code></td></tr>
  </tbody>
</table>
</div>

## 六、「带号版」和「无带号版」怎么选

两个代码的投影参数完全相同，只有**假东偏移（False Easting）**不一样：

- **带号版**（名称形如 `CGCS2000 / 3-degree Gauss-Kruger zone 40`）：假东 = 带号 × 1,000,000 + 500,000 米。横坐标 Y 是 8 位数，前两位就是带号，例如 `40 512345.67`。
- **无带号版**（名称形如 `CGCS2000 / 3-degree Gauss-Kruger CM 120E`）：假东 = 500,000 米。横坐标是 6 位数，例如 `512345.67`。

判断方法：**看横坐标（东向）整数部分是 6 位还是 8 位**。8 位选带号版，6 位选无带号版。选错的典型症状是数据「跑」到几千公里外，或者跟底图对不上。

另外注意我国测量习惯里 **X 是北向、Y 是东向**，和数学坐标系相反。导入 CAD 或 Excel 坐标时，如果点位全部「躺倒」了，多半是 X、Y 列反了。

## 七、各省常用哪个带？

不知道自己所在地区用哪个中央经线，可以查[高斯-克吕格分带带号与中央经线对照表](/learn/gauss-kruger-zone-table)，里面按省列出了覆盖的 3° 带、6° 带和省会所在带。几个常用例子：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>地区</th><th>省会经度（约）</th><th>3° 带中央经线</th><th>常用 EPSG（CGCS2000 无带号版）</th></tr>
  </thead>
  <tbody>
    <tr><td>北京</td><td>116.4°E</td><td>117°E</td><td><code>EPSG:4548</code></td></tr>
    <tr><td>上海</td><td>121.5°E</td><td>120°E</td><td><code>EPSG:4549</code></td></tr>
    <tr><td>广州 / 深圳</td><td>113.3°E / 114.1°E</td><td>114°E</td><td><code>EPSG:4547</code></td></tr>
    <tr><td>成都</td><td>104.1°E</td><td>105°E</td><td><code>EPSG:4544</code></td></tr>
    <tr><td>武汉</td><td>114.3°E</td><td>114°E</td><td><code>EPSG:4547</code></td></tr>
    <tr><td>西安</td><td>108.9°E</td><td>108°E</td><td><code>EPSG:4545</code></td></tr>
  </tbody>
</table>
</div>

## 八、UTM 投影（WGS 84，覆盖中国的部分）

国际项目、遥感影像（如 Landsat、Sentinel-2 的 L1C / L2A 产品）常用 UTM 投影，它和高斯-克吕格同属横轴墨卡托投影，但比例因子是 0.9996，带号和中央经线的编排也不同（UTM 带号 = 高斯 6° 带号 + 30）。

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>EPSG</th><th>UTM 带</th><th>中央经线</th><th>EPSG 名称</th></tr>
  </thead>
  <tbody>
    <tr><td><code>EPSG:32643</code></td><td>UTM 43N</td><td>75°E</td><td>WGS 84 / UTM zone 43N</td></tr>
    <tr><td><code>EPSG:32644</code></td><td>UTM 44N</td><td>81°E</td><td>WGS 84 / UTM zone 44N</td></tr>
    <tr><td><code>EPSG:32645</code></td><td>UTM 45N</td><td>87°E</td><td>WGS 84 / UTM zone 45N</td></tr>
    <tr><td><code>EPSG:32646</code></td><td>UTM 46N</td><td>93°E</td><td>WGS 84 / UTM zone 46N</td></tr>
    <tr><td><code>EPSG:32647</code></td><td>UTM 47N</td><td>99°E</td><td>WGS 84 / UTM zone 47N</td></tr>
    <tr><td><code>EPSG:32648</code></td><td>UTM 48N</td><td>105°E</td><td>WGS 84 / UTM zone 48N</td></tr>
    <tr><td><code>EPSG:32649</code></td><td>UTM 49N</td><td>111°E</td><td>WGS 84 / UTM zone 49N</td></tr>
    <tr><td><code>EPSG:32650</code></td><td>UTM 50N</td><td>117°E</td><td>WGS 84 / UTM zone 50N</td></tr>
    <tr><td><code>EPSG:32651</code></td><td>UTM 51N</td><td>123°E</td><td>WGS 84 / UTM zone 51N</td></tr>
    <tr><td><code>EPSG:32652</code></td><td>UTM 52N</td><td>129°E</td><td>WGS 84 / UTM zone 52N</td></tr>
    <tr><td><code>EPSG:32653</code></td><td>UTM 53N</td><td>135°E</td><td>WGS 84 / UTM zone 53N</td></tr>
  </tbody>
</table>
</div>

## 常见问题 FAQ

<details>
<summary>Q: CGCS2000 和 WGS 84 可以直接当成一样吗？</summary>

在 1:1 万及更小比例尺的一般制图、可视化里可以，两者差异在厘米级。但做高精度测量、工程放样时要区分，并注意坐标历元。

</details>

<details>
<summary>Q: 西安 80 的数据怎么转到 CGCS2000？</summary>

两者椭球和基准都不同，不能只改 EPSG 代码，需要做坐标转换。小范围可用七参数或四参数转换，参数应使用当地测绘主管部门公布或用控制点求得的值；在 GIS 软件里直接选两个 EPSG 互转，精度通常只有米级。

</details>

<details>
<summary>Q: 我拿到的数据没有 .prj 文件，怎么判断是哪个坐标系？</summary>

先看坐标量级：经纬度一般是 73–135、3–54 之间的小数；平面坐标横坐标 6 位或 8 位、纵坐标 7 位。8 位横坐标的前两位就是带号，带号 25–45 是 3° 带，13–23 是 6° 带。再结合数据年代判断基准：2018 年以后的自然资源成果一般是 CGCS2000，更早的规划、国土数据很多是西安 80。

</details>

<details>
<summary>Q: EPSG:4547 和 EPSG:4526 有什么区别？</summary>

都是 CGCS2000 3° 带、中央经线 114°E。4547 是无带号版（假东 500 km），4526 是带号版（第 38 带，假东 38,500 km）。

</details>

<details>
<summary>Q: 网上下载的高德、百度坐标为什么叠不准？</summary>

高德、腾讯用 GCJ-02，百度用 BD-09，都在 WGS 84 基础上做了加密偏移，偏差可达几百米，必须先转换。可以用[坐标转换工具](/tools/coord-tool)批量处理。

</details>

## 九、数据来源

- EPSG 代码与参数：EPSG Geodetic Parameter Dataset，经 PROJ 9.3.0 数据库读取并校验。
- 相关工具：[坐标转换工具](/tools/coord-tool)（WGS 84 / GCJ-02 / BD-09 互转）、[GeoJSON 与 SHP 互转](/tools/geojson-shp)。

## 地理编码速查系列

- [行政区划代码全表](/learn/china-admin-division-codes)
- [身份证前六位地区码对照](/learn/id-card-region-codes)
- [34 个省级行政区一览](/learn/china-provinces-overview)
- [全国车牌代码对照表](/learn/china-license-plate-codes)
- [全国电话区号表](/learn/china-telephone-area-codes)
- [全国机场三字码 / 四字码](/learn/china-airport-codes)
- [世界国家和地区代码（ISO 3166）](/learn/iso-3166-country-codes)
- [高斯-克吕格分带带号对照](/learn/gauss-kruger-zone-table)
- [用地用海分类代码表](/learn/land-sea-use-classification-codes)
- [河流国标码](/learn/china-river-codes)
