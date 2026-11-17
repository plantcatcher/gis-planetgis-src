---
slug: gauss-kruger-zone-table
title: 高斯-克吕格 3° 带 / 6° 带带号与中央经线对照表（含各省所在带）
summary: 我国高斯-克吕格投影 6° 带 13–23 带、3° 带 25–45 带的经度范围与中央经线全表，附由经度求带号、由带号求中央经线的公式与例题，并按 34 个省级行政区列出覆盖的带号、省会所在带及对应的 CGCS2000 EPSG 代码。
date: 2026-11-15
category: 地理基础
subject: 地理信息技术
tags: 高斯-克吕格投影, 3度带, 6度带, 中央经线, 带号, CGCS2000, 测绘, GIS
tableSearch: true
tableSearchPlaceholder: 输入带号、中央经线或省份，如 39 / 117°E / 北京
---

> 本页给出我国范围内（约 73°E–135°E）高斯-克吕格投影 **6° 带 13–23 带、3° 带 25–45 带**的经度范围与中央经线，并按省列出覆盖的带号和省会所在带。顶部搜索框可搜省份、带号或经度，如 `浙江`、`39`、`117°`。

## 一、为什么要分带

高斯-克吕格投影离中央经线越远，长度变形越大。为了把变形控制在允许范围内，就把地球按经度切成一条条窄带，**每条带用自己的中央经线单独投影**。

- **6° 分带**：从 0° 经线起每 6° 一带，全球 60 带。主要用于 1:2.5 万–1:50 万的中小比例尺地形图。
- **3° 分带**：从 1.5°E 起每 3° 一带，全球 120 带。变形更小，用于 1:1 万及更大比例尺测图、城市测量和规划成果，**国内项目最常用**。

## 二、带号和中央经线怎么算

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th></th><th>6° 带</th><th>3° 带</th></tr>
  </thead>
  <tbody>
    <tr><td>由经度 L 求带号 n</td><td>n = ⌊L / 6⌋ + 1</td><td>n = ⌊(L + 1.5) / 3⌋，也就是 L / 3 四舍五入</td></tr>
    <tr><td>由带号 n 求中央经线 L₀</td><td>L₀ = 6n − 3</td><td>L₀ = 3n</td></tr>
    <tr><td>中国范围内的带号</td><td>13–23</td><td>25–45</td></tr>
  </tbody>
</table>
</div>

举例：杭州约 120.2°E，6° 带 n = ⌊120.2 / 6⌋ + 1 = 21，中央经线 123°E；3° 带 n = ⌊121.7 / 3⌋ = 40，中央经线 120°E。

小技巧：国内 6° 带号和 3° 带号不会重叠（13–23 和 25–45），拿到一个带号就能直接判断是哪种分带。

## 三、6° 带对照表（13–23 带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>经度范围</th><th>中央经线</th></tr>
  </thead>
  <tbody>
    <tr><td>13</td><td>72°–78°E</td><td>75°E</td></tr>
    <tr><td>14</td><td>78°–84°E</td><td>81°E</td></tr>
    <tr><td>15</td><td>84°–90°E</td><td>87°E</td></tr>
    <tr><td>16</td><td>90°–96°E</td><td>93°E</td></tr>
    <tr><td>17</td><td>96°–102°E</td><td>99°E</td></tr>
    <tr><td>18</td><td>102°–108°E</td><td>105°E</td></tr>
    <tr><td>19</td><td>108°–114°E</td><td>111°E</td></tr>
    <tr><td>20</td><td>114°–120°E</td><td>117°E</td></tr>
    <tr><td>21</td><td>120°–126°E</td><td>123°E</td></tr>
    <tr><td>22</td><td>126°–132°E</td><td>129°E</td></tr>
    <tr><td>23</td><td>132°–138°E</td><td>135°E</td></tr>
  </tbody>
</table>
</div>

## 四、3° 带对照表（25–45 带）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>带号</th><th>经度范围</th><th>中央经线</th></tr>
  </thead>
  <tbody>
    <tr><td>25</td><td>73.5°–76.5°E</td><td>75°E</td></tr>
    <tr><td>26</td><td>76.5°–79.5°E</td><td>78°E</td></tr>
    <tr><td>27</td><td>79.5°–82.5°E</td><td>81°E</td></tr>
    <tr><td>28</td><td>82.5°–85.5°E</td><td>84°E</td></tr>
    <tr><td>29</td><td>85.5°–88.5°E</td><td>87°E</td></tr>
    <tr><td>30</td><td>88.5°–91.5°E</td><td>90°E</td></tr>
    <tr><td>31</td><td>91.5°–94.5°E</td><td>93°E</td></tr>
    <tr><td>32</td><td>94.5°–97.5°E</td><td>96°E</td></tr>
    <tr><td>33</td><td>97.5°–100.5°E</td><td>99°E</td></tr>
    <tr><td>34</td><td>100.5°–103.5°E</td><td>102°E</td></tr>
    <tr><td>35</td><td>103.5°–106.5°E</td><td>105°E</td></tr>
    <tr><td>36</td><td>106.5°–109.5°E</td><td>108°E</td></tr>
    <tr><td>37</td><td>109.5°–112.5°E</td><td>111°E</td></tr>
    <tr><td>38</td><td>112.5°–115.5°E</td><td>114°E</td></tr>
    <tr><td>39</td><td>115.5°–118.5°E</td><td>117°E</td></tr>
    <tr><td>40</td><td>118.5°–121.5°E</td><td>120°E</td></tr>
    <tr><td>41</td><td>121.5°–124.5°E</td><td>123°E</td></tr>
    <tr><td>42</td><td>124.5°–127.5°E</td><td>126°E</td></tr>
    <tr><td>43</td><td>127.5°–130.5°E</td><td>129°E</td></tr>
    <tr><td>44</td><td>130.5°–133.5°E</td><td>132°E</td></tr>
    <tr><td>45</td><td>133.5°–136.5°E</td><td>135°E</td></tr>
  </tbody>
</table>
</div>

## 五、各省覆盖的带号

经度范围按省级行政区边界计算。一个省往往跨好几个带，具体项目用哪个带，以当地测绘或自然资源主管部门的规定为准（很多城市还有自己的地方独立坐标系）。

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>省级行政区</th><th>经度范围</th><th>覆盖的 6° 带（中央经线）</th><th>覆盖的 3° 带（中央经线）</th></tr>
  </thead>
  <tbody>
    <tr><td>北京市</td><td>115.4°–117.5°E</td><td>20（117°）</td><td>38（114°）、39（117°）</td></tr>
    <tr><td>天津市</td><td>116.7°–118.1°E</td><td>20（117°）</td><td>39（117°）</td></tr>
    <tr><td>河北省</td><td>113.5°–119.9°E</td><td>19（111°）、20（117°）</td><td>38（114°）、39（117°）、40（120°）</td></tr>
    <tr><td>山西省</td><td>110.2°–114.6°E</td><td>19（111°）、20（117°）</td><td>37（111°）、38（114°）</td></tr>
    <tr><td>内蒙古自治区</td><td>97.2°–126.1°E</td><td>17（99°）、18（105°）、19（111°）、20（117°）、21（123°）、22（129°）</td><td>32（96°）、33（99°）、34（102°）、35（105°）、36（108°）、37（111°）、38（114°）、39（117°）、40（120°）、41（123°）、42（126°）</td></tr>
    <tr><td>辽宁省</td><td>118.8°–125.8°E</td><td>20（117°）、21（123°）</td><td>40（120°）、41（123°）、42（126°）</td></tr>
    <tr><td>吉林省</td><td>121.6°–131.3°E</td><td>21（123°）、22（129°）</td><td>41（123°）、42（126°）、43（129°）、44（132°）</td></tr>
    <tr><td>黑龙江省</td><td>121.2°–135.1°E</td><td>21（123°）、22（129°）、23（135°）</td><td>40（120°）、41（123°）、42（126°）、43（129°）、44（132°）、45（135°）</td></tr>
    <tr><td>上海市</td><td>120.9°–122.1°E</td><td>21（123°）</td><td>40（120°）、41（123°）</td></tr>
    <tr><td>江苏省</td><td>116.4°–122.0°E</td><td>20（117°）、21（123°）</td><td>39（117°）、40（120°）、41（123°）</td></tr>
    <tr><td>浙江省</td><td>118.0°–122.8°E</td><td>20（117°）、21（123°）</td><td>39（117°）、40（120°）、41（123°）</td></tr>
    <tr><td>安徽省</td><td>114.9°–119.6°E</td><td>20（117°）</td><td>38（114°）、39（117°）、40（120°）</td></tr>
    <tr><td>福建省</td><td>115.9°–120.5°E</td><td>20（117°）、21（123°）</td><td>39（117°）、40（120°）</td></tr>
    <tr><td>江西省</td><td>113.6°–118.5°E</td><td>19（111°）、20（117°）</td><td>38（114°）、39（117°）</td></tr>
    <tr><td>山东省</td><td>114.8°–122.7°E</td><td>20（117°）、21（123°）</td><td>38（114°）、39（117°）、40（120°）、41（123°）</td></tr>
    <tr><td>河南省</td><td>110.4°–116.6°E</td><td>19（111°）、20（117°）</td><td>37（111°）、38（114°）、39（117°）</td></tr>
    <tr><td>湖北省</td><td>108.4°–116.1°E</td><td>19（111°）、20（117°）</td><td>36（108°）、37（111°）、38（114°）、39（117°）</td></tr>
    <tr><td>湖南省</td><td>108.8°–114.3°E</td><td>19（111°）、20（117°）</td><td>36（108°）、37（111°）、38（114°）</td></tr>
    <tr><td>广东省</td><td>109.7°–117.2°E</td><td>19（111°）、20（117°）</td><td>37（111°）、38（114°）、39（117°）</td></tr>
    <tr><td>广西壮族自治区</td><td>104.5°–112.1°E</td><td>18（105°）、19（111°）</td><td>35（105°）、36（108°）、37（111°）</td></tr>
    <tr><td>海南省</td><td>108.6°–117.8°E（含南海诸岛；海南岛 108.6°–111.1°E）</td><td>19（111°）、20（117°）</td><td>36（108°）、37（111°）、38（114°）、39（117°）</td></tr>
    <tr><td>重庆市</td><td>105.3°–110.2°E</td><td>18（105°）、19（111°）</td><td>35（105°）、36（108°）、37（111°）</td></tr>
    <tr><td>四川省</td><td>97.3°–108.5°E</td><td>17（99°）、18（105°）、19（111°）</td><td>32（96°）、33（99°）、34（102°）、35（105°）、36（108°）</td></tr>
    <tr><td>贵州省</td><td>103.6°–109.6°E</td><td>18（105°）、19（111°）</td><td>35（105°）、36（108°）、37（111°）</td></tr>
    <tr><td>云南省</td><td>97.5°–106.2°E</td><td>17（99°）、18（105°）</td><td>33（99°）、34（102°）、35（105°）</td></tr>
    <tr><td>西藏自治区</td><td>78.4°–99.1°E</td><td>14（81°）、15（87°）、16（93°）、17（99°）</td><td>26（78°）、27（81°）、28（84°）、29（87°）、30（90°）、31（93°）、32（96°）、33（99°）</td></tr>
    <tr><td>陕西省</td><td>105.5°–111.2°E</td><td>18（105°）、19（111°）</td><td>35（105°）、36（108°）、37（111°）</td></tr>
    <tr><td>甘肃省</td><td>92.3°–108.7°E</td><td>16（93°）、17（99°）、18（105°）、19（111°）</td><td>31（93°）、32（96°）、33（99°）、34（102°）、35（105°）、36（108°）</td></tr>
    <tr><td>青海省</td><td>89.4°–103.1°E</td><td>15（87°）、16（93°）、17（99°）、18（105°）</td><td>30（90°）、31（93°）、32（96°）、33（99°）、34（102°）</td></tr>
    <tr><td>宁夏回族自治区</td><td>104.3°–107.7°E</td><td>18（105°）</td><td>35（105°）、36（108°）</td></tr>
    <tr><td>新疆维吾尔自治区</td><td>73.5°–96.4°E</td><td>13（75°）、14（81°）、15（87°）、16（93°）、17（99°）</td><td>25（75°）、26（78°）、27（81°）、28（84°）、29（87°）、30（90°）、31（93°）、32（96°）</td></tr>
    <tr><td>台湾省</td><td>119.4°–124.6°E（含澎湖列岛、钓鱼岛及其附属岛屿等；台湾本岛 120.0°–122.0°E）</td><td>20（117°）、21（123°）</td><td>40（120°）、41（123°）、42（126°）</td></tr>
    <tr><td>香港特别行政区</td><td>113.8°–114.4°E</td><td>19（111°）、20（117°）</td><td>38（114°）</td></tr>
    <tr><td>澳门特别行政区</td><td>113.5°–113.6°E</td><td>19（111°）</td><td>38（114°）</td></tr>
  </tbody>
</table>
</div>

## 六、省会所在带与 CGCS2000 EPSG

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>省级行政区</th><th>省会经度</th><th>6° 带</th><th>3° 带</th><th>CGCS2000 3° 无带号版</th><th>CGCS2000 3° 带号版</th></tr>
  </thead>
  <tbody>
    <tr><td>北京市</td><td>116.41°E</td><td>20 带 / 117°E</td><td>39 带 / 117°E</td><td><code>EPSG:4548</code></td><td><code>EPSG:4527</code></td></tr>
    <tr><td>天津市</td><td>117.19°E</td><td>20 带 / 117°E</td><td>39 带 / 117°E</td><td><code>EPSG:4548</code></td><td><code>EPSG:4527</code></td></tr>
    <tr><td>河北省</td><td>114.50°E</td><td>20 带 / 117°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>山西省</td><td>112.55°E</td><td>19 带 / 111°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>内蒙古自治区</td><td>111.67°E</td><td>19 带 / 111°E</td><td>37 带 / 111°E</td><td><code>EPSG:4546</code></td><td><code>EPSG:4525</code></td></tr>
    <tr><td>辽宁省</td><td>123.43°E</td><td>21 带 / 123°E</td><td>41 带 / 123°E</td><td><code>EPSG:4550</code></td><td><code>EPSG:4529</code></td></tr>
    <tr><td>吉林省</td><td>125.32°E</td><td>21 带 / 123°E</td><td>42 带 / 126°E</td><td><code>EPSG:4551</code></td><td><code>EPSG:4530</code></td></tr>
    <tr><td>黑龙江省</td><td>126.64°E</td><td>22 带 / 129°E</td><td>42 带 / 126°E</td><td><code>EPSG:4551</code></td><td><code>EPSG:4530</code></td></tr>
    <tr><td>上海市</td><td>121.47°E</td><td>21 带 / 123°E</td><td>40 带 / 120°E</td><td><code>EPSG:4549</code></td><td><code>EPSG:4528</code></td></tr>
    <tr><td>江苏省</td><td>118.77°E</td><td>20 带 / 117°E</td><td>40 带 / 120°E</td><td><code>EPSG:4549</code></td><td><code>EPSG:4528</code></td></tr>
    <tr><td>浙江省</td><td>120.15°E</td><td>21 带 / 123°E</td><td>40 带 / 120°E</td><td><code>EPSG:4549</code></td><td><code>EPSG:4528</code></td></tr>
    <tr><td>安徽省</td><td>117.28°E</td><td>20 带 / 117°E</td><td>39 带 / 117°E</td><td><code>EPSG:4548</code></td><td><code>EPSG:4527</code></td></tr>
    <tr><td>福建省</td><td>119.31°E</td><td>20 带 / 117°E</td><td>40 带 / 120°E</td><td><code>EPSG:4549</code></td><td><code>EPSG:4528</code></td></tr>
    <tr><td>江西省</td><td>115.89°E</td><td>20 带 / 117°E</td><td>39 带 / 117°E</td><td><code>EPSG:4548</code></td><td><code>EPSG:4527</code></td></tr>
    <tr><td>山东省</td><td>117.00°E</td><td>20 带 / 117°E</td><td>39 带 / 117°E</td><td><code>EPSG:4548</code></td><td><code>EPSG:4527</code></td></tr>
    <tr><td>河南省</td><td>113.67°E</td><td>19 带 / 111°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>湖北省</td><td>114.30°E</td><td>20 带 / 117°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>湖南省</td><td>112.98°E</td><td>19 带 / 111°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>广东省</td><td>113.28°E</td><td>19 带 / 111°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>广西壮族自治区</td><td>108.32°E</td><td>19 带 / 111°E</td><td>36 带 / 108°E</td><td><code>EPSG:4545</code></td><td><code>EPSG:4524</code></td></tr>
    <tr><td>海南省</td><td>110.33°E</td><td>19 带 / 111°E</td><td>37 带 / 111°E</td><td><code>EPSG:4546</code></td><td><code>EPSG:4525</code></td></tr>
    <tr><td>重庆市</td><td>106.50°E</td><td>18 带 / 105°E</td><td>36 带 / 108°E</td><td><code>EPSG:4545</code></td><td><code>EPSG:4524</code></td></tr>
    <tr><td>四川省</td><td>104.07°E</td><td>18 带 / 105°E</td><td>35 带 / 105°E</td><td><code>EPSG:4544</code></td><td><code>EPSG:4523</code></td></tr>
    <tr><td>贵州省</td><td>106.71°E</td><td>18 带 / 105°E</td><td>36 带 / 108°E</td><td><code>EPSG:4545</code></td><td><code>EPSG:4524</code></td></tr>
    <tr><td>云南省</td><td>102.71°E</td><td>18 带 / 105°E</td><td>34 带 / 102°E</td><td><code>EPSG:4543</code></td><td><code>EPSG:4522</code></td></tr>
    <tr><td>西藏自治区</td><td>91.13°E</td><td>16 带 / 93°E</td><td>30 带 / 90°E</td><td><code>EPSG:4539</code></td><td><code>EPSG:4518</code></td></tr>
    <tr><td>陕西省</td><td>108.95°E</td><td>19 带 / 111°E</td><td>36 带 / 108°E</td><td><code>EPSG:4545</code></td><td><code>EPSG:4524</code></td></tr>
    <tr><td>甘肃省</td><td>103.82°E</td><td>18 带 / 105°E</td><td>35 带 / 105°E</td><td><code>EPSG:4544</code></td><td><code>EPSG:4523</code></td></tr>
    <tr><td>青海省</td><td>101.78°E</td><td>17 带 / 99°E</td><td>34 带 / 102°E</td><td><code>EPSG:4543</code></td><td><code>EPSG:4522</code></td></tr>
    <tr><td>宁夏回族自治区</td><td>106.28°E</td><td>18 带 / 105°E</td><td>35 带 / 105°E</td><td><code>EPSG:4544</code></td><td><code>EPSG:4523</code></td></tr>
    <tr><td>新疆维吾尔自治区</td><td>87.62°E</td><td>15 带 / 87°E</td><td>29 带 / 87°E</td><td><code>EPSG:4538</code></td><td><code>EPSG:4517</code></td></tr>
    <tr><td>台湾省</td><td>121.51°E</td><td>21 带 / 123°E</td><td>41 带 / 123°E</td><td><code>EPSG:4550</code></td><td><code>EPSG:4529</code></td></tr>
    <tr><td>香港特别行政区</td><td>114.17°E</td><td>20 带 / 117°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
    <tr><td>澳门特别行政区</td><td>113.55°E</td><td>19 带 / 111°E</td><td>38 带 / 114°E</td><td><code>EPSG:4547</code></td><td><code>EPSG:4526</code></td></tr>
  </tbody>
</table>
</div>

完整的 EPSG 代码（含西安 80、北京 54）见[中国常用坐标系 EPSG 代码速查](/learn/china-epsg-codes)。

## 常见问题 FAQ

<details>
<summary>Q: 3° 带和 6° 带的中央经线有什么关系？</summary>

3° 带的中央经线是 3 的倍数，6° 带的中央经线是 6n − 3（如 75°、81°、87°……）。6° 带的中央经线一定也是某个 3° 带的中央经线，但 3° 带的中央经线只有一半是 6° 带的中央经线。

</details>

<details>
<summary>Q: 一个市跨了两个 3° 带，用哪个？</summary>

一般选覆盖面积最大、或主城区所在的那个带，整个项目统一用同一个中央经线，避免拼接时出现接缝。很多城市的测绘主管部门对此有明确规定，以当地规定为准。

</details>

<details>
<summary>Q: 坐标横坐标前两位是 39，代表什么？</summary>

代表 3° 带第 39 带，中央经线 117°E（39 × 3）。这是「带号版」坐标，对应 CGCS2000 的 EPSG:4527。

</details>

<details>
<summary>Q: 为什么我算出来的带号和别人说的不一样？</summary>

先确认是 3° 带还是 6° 带。另外有些地方采用 1.5° 带或任意中央经线的地方独立坐标系，这些不在标准分带里。

</details>

## 七、数据来源

- 分带规则：我国测绘通用的高斯-克吕格 6° / 3° 分带方案；带号、中央经线与 EPSG 代码均经 PROJ 9.3.0 数据库校验。
- 各省经度范围：按省级行政区划边界（阿里云 DataV 公开 GeoJSON）计算，保留 1 位小数，仅供选带参考，不作为权威界线。

## 地理编码速查系列

- [行政区划代码全表](/learn/china-admin-division-codes)
- [身份证前六位地区码对照](/learn/id-card-region-codes)
- [34 个省级行政区一览](/learn/china-provinces-overview)
- [全国车牌代码对照表](/learn/china-license-plate-codes)
- [全国电话区号表](/learn/china-telephone-area-codes)
- [全国邮政编码表](/learn/china-postal-codes)
- [全国机场三字码 / 四字码](/learn/china-airport-codes)
- [世界国家和地区代码（ISO 3166）](/learn/iso-3166-country-codes)
- [中国常用坐标系 EPSG 代码](/learn/china-epsg-codes)
- [用地用海分类代码表](/learn/land-sea-use-classification-codes)
- [河流国标码](/learn/china-river-codes)
