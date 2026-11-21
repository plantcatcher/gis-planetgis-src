---
slug: id-card-region-codes
title: 身份证前六位地区码对照表（含 1981 年以来历史旧代码）
summary: 身份证号前 6 位是首次办证时户籍所在县级行政区划代码，号码终身不变，所以很多老身份证用的是已停用的旧代码。本文收录 1981–2025 年间停用或更名的 3612 条代码记录及其现对应地区，可直接输入前六位检索，并讲清 18 位身份证号结构与第 18 位校验码算法。
date: 2026-11-15
category: 地理基础
subject: 人文地理
tags: 身份证前六位, 身份证地区码, 行政区划代码, GB 11643, GB/T 2260, 历史行政区划
tableSearch: true
tableSearchPlaceholder: 输入身份证前六位或地名，如 440305 / 宝安
---

> 数据更新：**2026-11-15**。下方表格收录 **1981–2025 年间已经停用或更名的 3612 条县以上行政区划代码记录**，可以在顶部搜索框直接输入身份证前 6 位查询。现行代码请查[行政区划代码全表](/learn/china-admin-division-codes)。

## 一、为什么身份证前六位经常「查不到」

身份证号码的前 6 位叫**地址码**，是持证人**首次申领身份证时**常住户口所在县（市、旗、区）的行政区划代码。

关键在于：**身份证号码终身不变**。之后哪怕县改了区、两个区合并、地级市改了名，已经发出去的号码都不会跟着改。所以：
- 1990 年在「北京市崇文区」办的证，前 6 位是 `110103`，而崇文区 2010 年就并入了东城区（`110101`）；
- 在「湖北省襄樊市」办的证，前 6 位以 `4206` 开头，现在这个地方叫襄阳市，代码没变，名字变了；
- 很多「撤县设区」的地方，代码本身也换了，例如河北滦县 `130223` 在 2018 年撤县设市，新代码是 `130284` 滦州市。

用现行代码表去查老身份证，自然会有一部分查不到。这一页就是专门补这个缺口的。

## 二、18 位身份证号的结构

现行居民身份证号码依据国家标准 **GB 11643《公民身份号码》**，共 18 位：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>位置</th><th>名称</th><th>含义</th></tr>
  </thead>
  <tbody>
    <tr><td>第 1–6 位</td><td>地址码</td><td>首次办证时户籍所在县级行政区划代码（GB/T 2260）</td></tr>
    <tr><td>第 7–14 位</td><td>出生日期码</td><td>YYYYMMDD，例如 19900101</td></tr>
    <tr><td>第 15–17 位</td><td>顺序码</td><td>同一地址码、同一天出生的人的编号；<strong>第 17 位奇数为男、偶数为女</strong></td></tr>
    <tr><td>第 18 位</td><td>校验码</td><td>由前 17 位按 ISO 7064 MOD 11-2 算出，取值 0–9 或 X</td></tr>
  </tbody>
</table>
</div>

1999 年以前还发过 **15 位**身份证：6 位地址码 + 6 位出生日期（YYMMDD，年份只有两位）+ 3 位顺序码，没有校验码。15 位升 18 位时，在年份前补「19」，再在末尾算出校验码。

## 三、校验码怎么算

第 18 位不是随便给的，可以用前 17 位算出来，用来发现抄错、输错的号码：

1. 前 17 位数字分别乘以权重 `7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2`；
2. 把 17 个乘积相加，求和后除以 11 取余数；
3. 余数 `0 1 2 3 4 5 6 7 8 9 10` 依次对应校验码 `1 0 X 9 8 7 6 5 4 3 2`。

校验码只能证明号码**格式正确**，不能证明这个号码真实存在、属于某个人。

## 四、怎么查自己的前六位

1. 先到[现行行政区划代码全表](/learn/china-admin-division-codes)里搜，能搜到就说明代码仍在使用；
2. 搜不到，就在下面的历史代码表里搜。表中「使用年份」是这个代码在官方代码表中出现的年份区间，「现对应代码」是区划调整后原地区现在归属的代码；
3. 同一个代码在不同年份可能对应不同名称（例如更名、撤销后又重新启用），表中会分行列出，按办证年份对照即可。现行表里仍在用、但历史上曾对应其他名称的代码共有 0 个。

## 五、1981 年以来已停用或更名的行政区划代码

共 3612 条，按代码排序。「停用」表示这个代码已不再使用，原地区并入「现对应」列的代码；「更名」表示代码沿用至今，只是名称变了。

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>当时名称</th><th>变动</th><th>所属</th><th>使用年份</th><th>现对应</th></tr>
  </thead>
  <tbody>
    <tr><td><code>110103</code></td><td>崇文区</td><td>停用</td><td>北京市</td><td>1981–2009</td><td><code>110101</code> 东城区</td></tr>
    <tr><td><code>110104</code></td><td>宣武区</td><td>停用</td><td>北京市</td><td>1981–2009</td><td><code>110102</code> 西城区</td></tr>
    <tr><td><code>110110</code></td><td>燕山区</td><td>停用</td><td>北京市</td><td>1981–1985</td><td><code>110111</code> 房山区</td></tr>
    <tr><td><code>110221</code></td><td>昌平县</td><td>停用</td><td>北京市</td><td>1981–1998</td><td><code>110114</code> 昌平区</td></tr>
    <tr><td><code>110222</code></td><td>顺义县</td><td>停用</td><td>北京市</td><td>1981–1997</td><td><code>110113</code> 顺义区</td></tr>
    <tr><td><code>110223</code></td><td>通县</td><td>停用</td><td>北京市</td><td>1981–1996</td><td><code>110112</code> 通州区</td></tr>
    <tr><td><code>110224</code></td><td>大兴县</td><td>停用</td><td>北京市</td><td>1981–2000</td><td><code>110115</code> 大兴区</td></tr>
    <tr><td><code>110225</code></td><td>房山县</td><td>停用</td><td>北京市</td><td>1981–1985</td><td><code>110111</code> 房山区</td></tr>
    <tr><td><code>110226</code></td><td>平谷县</td><td>停用</td><td>北京市</td><td>1981–2000</td><td><code>110117</code> 平谷区</td></tr>
    <tr><td><code>110227</code></td><td>怀柔县</td><td>停用</td><td>北京市</td><td>1981–2000</td><td><code>110116</code> 怀柔区</td></tr>
    <tr><td><code>110228</code></td><td>密云县</td><td>停用</td><td>北京市</td><td>1981–2014</td><td><code>110118</code> 密云区</td></tr>
    <tr><td><code>110229</code></td><td>延庆县</td><td>停用</td><td>北京市</td><td>1981–2014</td><td><code>110119</code> 延庆区</td></tr>
    <tr><td><code>120107</code></td><td>塘沽区</td><td>停用</td><td>天津市</td><td>1981–2008</td><td><code>120116</code> 滨海新区</td></tr>
    <tr><td><code>120108</code></td><td>汉沽区</td><td>停用</td><td>天津市</td><td>1981–2008</td><td><code>120116</code> 滨海新区</td></tr>
    <tr><td><code>120109</code></td><td>大港区</td><td>停用</td><td>天津市</td><td>1981–2008</td><td><code>120116</code> 滨海新区</td></tr>
    <tr><td><code>120110</code></td><td>东郊区</td><td>更名</td><td>天津市</td><td>1981–1991</td><td>代码未变，现名 东丽区</td></tr>
    <tr><td><code>120111</code></td><td>西郊区</td><td>更名</td><td>天津市</td><td>1981–1991</td><td>代码未变，现名 西青区</td></tr>
    <tr><td><code>120112</code></td><td>南郊区</td><td>更名</td><td>天津市</td><td>1981–1991</td><td>代码未变，现名 津南区</td></tr>
    <tr><td><code>120113</code></td><td>北郊区</td><td>更名</td><td>天津市</td><td>1981–1991</td><td>代码未变，现名 北辰区</td></tr>
    <tr><td><code>120221</code></td><td>宁河县</td><td>停用</td><td>天津市</td><td>1981–2014</td><td><code>120117</code> 宁河区</td></tr>
    <tr><td><code>120222</code></td><td>武清县</td><td>停用</td><td>天津市</td><td>1981–1999</td><td><code>120114</code> 武清区</td></tr>
    <tr><td><code>120223</code></td><td>静海县</td><td>停用</td><td>天津市</td><td>1981–2014</td><td><code>120118</code> 静海区</td></tr>
    <tr><td><code>120224</code></td><td>宝坻县</td><td>停用</td><td>天津市</td><td>1981–2000</td><td><code>120115</code> 宝坻区</td></tr>
    <tr><td><code>120225</code></td><td>蓟县</td><td>停用</td><td>天津市</td><td>1981–2015</td><td><code>120119</code> 蓟州区</td></tr>
    <tr><td><code>130103</code></td><td>桥东区</td><td>停用</td><td>河北省 · 石家庄市</td><td>1983–2013</td><td><code>130102</code> 长安区；<code>130104</code> 桥西区</td></tr>
    <tr><td><code>130106</code></td><td>郊区</td><td>停用</td><td>河北省 · 石家庄市</td><td>1983–2000</td><td><code>130102</code> 长安区；<code>130103</code> 桥东区；<code>130104</code> 桥西区；<code>130105</code> 新华区；<code>130108</code> 裕华区</td></tr>
    <tr><td><code>130107</code></td><td>井陉矿区</td><td>更名</td><td>河北省 · 石家庄市</td><td>1983–1988</td><td>代码未变，现名 井陉矿区</td></tr>
    <tr><td><code>130122</code></td><td>获鹿县</td><td>停用</td><td>河北省 · 石家庄市</td><td>1983–1993</td><td><code>130185</code> 鹿泉市</td></tr>
    <tr><td><code>130124</code></td><td>栾城县</td><td>停用</td><td>河北省 · 石家庄市</td><td>1986–2013</td><td><code>130108</code> 裕华区；<code>130111</code> 栾城区</td></tr>
    <tr><td><code>130182</code></td><td>藁城市</td><td>停用</td><td>河北省 · 石家庄市</td><td>1993–2013</td><td><code>130109</code> 藁城区</td></tr>
    <tr><td><code>130185</code></td><td>鹿泉市</td><td>停用</td><td>河北省 · 石家庄市</td><td>1994–2013</td><td><code>130110</code> 鹿泉区</td></tr>
    <tr><td><code>130204</code></td><td>东矿区</td><td>更名</td><td>河北省 · 唐山市</td><td>1983–1994</td><td>代码未变，现名 古冶区</td></tr>
    <tr><td><code>130206</code></td><td>新区</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–2001</td><td><code>130208</code> 丰润区</td></tr>
    <tr><td><code>130221</code></td><td>丰润县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–2001</td><td><code>130208</code> 丰润区</td></tr>
    <tr><td><code>130222</code></td><td>丰南县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–1993</td><td><code>130282</code> 丰南市</td></tr>
    <tr><td><code>130223</code></td><td>滦县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–2017</td><td><code>130284</code> 滦州市</td></tr>
    <tr><td><code>130226</code></td><td>迁安县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–1995</td><td><code>130283</code> 迁安市</td></tr>
    <tr><td><code>130228</code></td><td>遵化县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–1991</td><td><code>130281</code> 遵化市</td></tr>
    <tr><td><code>130230</code></td><td>唐海县</td><td>停用</td><td>河北省 · 唐山市</td><td>1983–2011</td><td><code>130209</code> 曹妃甸区</td></tr>
    <tr><td><code>130282</code></td><td>丰南市</td><td>停用</td><td>河北省 · 唐山市</td><td>1994–2001</td><td><code>130207</code> 丰南区</td></tr>
    <tr><td><code>130305</code></td><td>郊区</td><td>停用</td><td>河北省 · 秦皇岛市</td><td>1983</td><td><code>130302</code> 海港区；<code>130303</code> 山海关区；<code>130304</code> 北戴河区</td></tr>
    <tr><td><code>130321</code></td><td>青龙县</td><td>更名</td><td>河北省 · 秦皇岛市</td><td>1983–1985</td><td>代码未变，现名 青龙满族自治县</td></tr>
    <tr><td><code>130323</code></td><td>抚宁县</td><td>停用</td><td>河北省 · 秦皇岛市</td><td>1983–2014</td><td><code>130302</code> 海港区；<code>130304</code> 北戴河区；<code>130306</code> 抚宁区</td></tr>
    <tr><td><code>130405</code></td><td>郊区</td><td>停用</td><td>河北省 · 邯郸市</td><td>1983–1985</td><td><code>130402</code> 邯山区；<code>130403</code> 丛台区；<code>130404</code> 复兴区</td></tr>
    <tr><td><code>130421</code></td><td>邯郸县</td><td>停用</td><td>河北省 · 邯郸市</td><td>1983–2015</td><td><code>130404</code> 复兴区；<code>130402</code> 邯山区；<code>130403</code> 丛台区</td></tr>
    <tr><td><code>130422</code></td><td>武安县</td><td>停用</td><td>河北省 · 邯郸市</td><td>1986–1987</td><td><code>139001</code> 武安市</td></tr>
    <tr><td><code>130428</code></td><td>肥乡县</td><td>停用</td><td>河北省 · 邯郸市</td><td>1993–2015</td><td><code>130407</code> 肥乡区</td></tr>
    <tr><td><code>130429</code></td><td>永年县</td><td>停用</td><td>河北省 · 邯郸市</td><td>1993–2015</td><td><code>130403</code> 丛台区；<code>130408</code> 永年区</td></tr>
    <tr><td><code>130430</code></td><td>丘县</td><td>更名</td><td>河北省 · 邯郸市</td><td>1993–1995</td><td>代码未变，现名 邱县</td></tr>
    <tr><td><code>130502</code></td><td>桥东区</td><td>更名</td><td>河北省 · 邢台市</td><td>1983–2019</td><td>代码未变，现名 襄都区</td></tr>
    <tr><td><code>130503</code></td><td>桥西区</td><td>更名</td><td>河北省 · 邢台市</td><td>1983–2019</td><td>代码未变，现名 信都区</td></tr>
    <tr><td><code>130504</code></td><td>郊区</td><td>停用</td><td>河北省 · 邢台市</td><td>1983–1987</td><td><code>130502</code> 襄都区；<code>130503</code> 信都区</td></tr>
    <tr><td><code>130521</code></td><td>邢台县</td><td>停用</td><td>河北省 · 邢台市</td><td>1986–2019</td><td><code>130502</code> 襄都区；<code>130503</code> 信都区</td></tr>
    <tr><td><code>130526</code></td><td>任县</td><td>停用</td><td>河北省 · 邢台市</td><td>1993–2019</td><td><code>130505</code> 任泽区</td></tr>
    <tr><td><code>130527</code></td><td>南和县</td><td>停用</td><td>河北省 · 邢台市</td><td>1993–2019</td><td><code>130506</code> 南和区</td></tr>
    <tr><td><code>130602</code></td><td>新市区</td><td>更名</td><td>河北省 · 保定市</td><td>1983–2014</td><td>代码未变，现名 竞秀区</td></tr>
    <tr><td><code>130603</code></td><td>北市区</td><td>停用</td><td>河北省 · 保定市</td><td>1983–2014</td><td><code>130606</code> 莲池区</td></tr>
    <tr><td><code>130604</code></td><td>南市区</td><td>停用</td><td>河北省 · 保定市</td><td>1983–2014</td><td><code>130606</code> 莲池区</td></tr>
    <tr><td><code>130605</code></td><td>郊区</td><td>停用</td><td>河北省 · 保定市</td><td>1983–1986</td><td><code>130602</code> 竞秀区；<code>130603</code> 北市区；<code>130604</code> 南市区</td></tr>
    <tr><td><code>130621</code></td><td>满城县</td><td>停用</td><td>河北省 · 保定市</td><td>1983–2014</td><td><code>130607</code> 满城区</td></tr>
    <tr><td><code>130622</code></td><td>清苑县</td><td>停用</td><td>河北省 · 保定市</td><td>1986–2014</td><td><code>130608</code> 清苑区</td></tr>
    <tr><td><code>130625</code></td><td>徐水县</td><td>停用</td><td>河北省 · 保定市</td><td>1994–2014</td><td><code>130609</code> 徐水区</td></tr>
    <tr><td><code>130704</code></td><td>茶坊区</td><td>停用</td><td>河北省 · 张家口市</td><td>1983–1988</td><td><code>130702</code> 桥东区；<code>130703</code> 桥西区</td></tr>
    <tr><td><code>130707</code></td><td>庞家堡区</td><td>停用</td><td>河北省 · 张家口市</td><td>1983–1988</td><td><code>130721</code> 宣化县</td></tr>
    <tr><td><code>130721</code></td><td>宣化县</td><td>停用</td><td>河北省 · 张家口市</td><td>1983–2015</td><td><code>130702</code> 桥东区；<code>130703</code> 桥西区；<code>130705</code> 宣化区</td></tr>
    <tr><td><code>130729</code></td><td>万全县</td><td>停用</td><td>河北省 · 张家口市</td><td>1993–2015</td><td><code>130708</code> 万全区</td></tr>
    <tr><td><code>130733</code></td><td>崇礼县</td><td>停用</td><td>河北省 · 张家口市</td><td>1993–2015</td><td><code>130709</code> 崇礼区</td></tr>
    <tr><td><code>130823</code></td><td>平泉县</td><td>停用</td><td>河北省 · 承德市</td><td>1993–2016</td><td><code>130881</code> 平泉市</td></tr>
    <tr><td><code>130904</code></td><td>郊区</td><td>停用</td><td>河北省 · 沧州市</td><td>1983–1996</td><td><code>130902</code> 新华区；<code>130903</code> 运河区</td></tr>
    <tr><td><code>131021</code></td><td>三河县</td><td>停用</td><td>河北省 · 廊坊市</td><td>1988–1992</td><td><code>131082</code> 三河市</td></tr>
    <tr><td><code>131027</code></td><td>霸县</td><td>停用</td><td>河北省 · 廊坊市</td><td>1988–1989</td><td><code>131081</code> 霸州市</td></tr>
    <tr><td><code>131181</code></td><td>冀州市</td><td>停用</td><td>河北省 · 衡水市</td><td>1996–2015</td><td><code>131103</code> 冀州区</td></tr>
    <tr><td><code>132100</code></td><td>邯郸地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132101</code></td><td>邯郸市</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1982</td><td><code>130402</code> 邯山区；<code>130403</code> 丛台区；<code>130404</code> 复兴区；<code>130405</code> 郊区；<code>130406</code> 峰峰矿区</td></tr>
    <tr><td><code>132121</code></td><td>大名县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130425</code> 大名县</td></tr>
    <tr><td><code>132122</code></td><td>魏县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130434</code> 魏县</td></tr>
    <tr><td><code>132123</code></td><td>曲周县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130435</code> 曲周县</td></tr>
    <tr><td><code>132124</code></td><td>丘县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130430</code> 邱县</td></tr>
    <tr><td><code>132125</code></td><td>鸡泽县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130431</code> 鸡泽县</td></tr>
    <tr><td><code>132126</code></td><td>肥乡县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130428</code> 肥乡县</td></tr>
    <tr><td><code>132127</code></td><td>广平县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130432</code> 广平县</td></tr>
    <tr><td><code>132128</code></td><td>成安县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130424</code> 成安县</td></tr>
    <tr><td><code>132129</code></td><td>临漳县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130423</code> 临漳县</td></tr>
    <tr><td><code>132130</code></td><td>磁县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130427</code> 磁县</td></tr>
    <tr><td><code>132131</code></td><td>武安县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1985</td><td><code>130422</code> 武安县</td></tr>
    <tr><td><code>132132</code></td><td>涉县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130426</code> 涉县</td></tr>
    <tr><td><code>132133</code></td><td>永年县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130429</code> 永年县</td></tr>
    <tr><td><code>132134</code></td><td>邯郸县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1982</td><td><code>130421</code> 邯郸县</td></tr>
    <tr><td><code>132135</code></td><td>馆陶县</td><td>停用</td><td>河北省 · 邯郸地区</td><td>1981–1992</td><td><code>130433</code> 馆陶县</td></tr>
    <tr><td><code>132200</code></td><td>邢台地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132201</code></td><td>邢台市</td><td>更名</td><td>河北省 · 邢台地区</td><td>1981–1982</td><td>代码未变，现名 邢台市</td></tr>
    <tr><td><code>132201</code></td><td>南宫市</td><td>停用</td><td>河北省 · 邢台地区</td><td>1986–1992</td><td><code>130581</code> 南宫市</td></tr>
    <tr><td><code>132202</code></td><td>沙河市</td><td>停用</td><td>河北省 · 邢台地区</td><td>1987–1992</td><td><code>130582</code> 沙河市</td></tr>
    <tr><td><code>132221</code></td><td>邢台县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1985</td><td><code>130521</code> 邢台县</td></tr>
    <tr><td><code>132222</code></td><td>沙河县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1986</td><td><code>132202</code> 沙河市</td></tr>
    <tr><td><code>132223</code></td><td>临城县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130522</code> 临城县</td></tr>
    <tr><td><code>132224</code></td><td>内丘县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130523</code> 内丘县</td></tr>
    <tr><td><code>132225</code></td><td>柏乡县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130524</code> 柏乡县</td></tr>
    <tr><td><code>132226</code></td><td>隆尧县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130525</code> 隆尧县</td></tr>
    <tr><td><code>132227</code></td><td>任县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130526</code> 任县</td></tr>
    <tr><td><code>132228</code></td><td>南和县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130527</code> 南和县</td></tr>
    <tr><td><code>132229</code></td><td>宁晋县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130528</code> 宁晋县</td></tr>
    <tr><td><code>132230</code></td><td>南宫县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1985</td><td><code>132201</code> 邢台市</td></tr>
    <tr><td><code>132231</code></td><td>巨鹿县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130529</code> 巨鹿县</td></tr>
    <tr><td><code>132232</code></td><td>新河县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130530</code> 新河县</td></tr>
    <tr><td><code>132233</code></td><td>广宗县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130531</code> 广宗县</td></tr>
    <tr><td><code>132234</code></td><td>平乡县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130532</code> 平乡县</td></tr>
    <tr><td><code>132235</code></td><td>威县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130533</code> 威县</td></tr>
    <tr><td><code>132236</code></td><td>清河县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130534</code> 清河县</td></tr>
    <tr><td><code>132237</code></td><td>临西县</td><td>停用</td><td>河北省 · 邢台地区</td><td>1981–1992</td><td><code>130535</code> 临西县</td></tr>
    <tr><td><code>132300</code></td><td>石家庄地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132301</code></td><td>辛集市</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1986–1992</td><td><code>130181</code> 辛集市</td></tr>
    <tr><td><code>132302</code></td><td>藁城市</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1989–1992</td><td><code>130182</code> 藁城市</td></tr>
    <tr><td><code>132303</code></td><td>晋州市</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1991–1992</td><td><code>130183</code> 晋州市</td></tr>
    <tr><td><code>132304</code></td><td>新乐市</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1992</td><td><code>130184</code> 新乐市</td></tr>
    <tr><td><code>132321</code></td><td>束鹿县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1985</td><td><code>132301</code> 辛集市</td></tr>
    <tr><td><code>132322</code></td><td>晋县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1990</td><td><code>132303</code> 晋州市</td></tr>
    <tr><td><code>132323</code></td><td>深泽县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130128</code> 深泽县</td></tr>
    <tr><td><code>132324</code></td><td>无极县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130130</code> 无极县</td></tr>
    <tr><td><code>132325</code></td><td>藁城县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1988</td><td><code>132302</code> 藁城市</td></tr>
    <tr><td><code>132326</code></td><td>赵县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130133</code> 赵县</td></tr>
    <tr><td><code>132327</code></td><td>栾城县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1985</td><td><code>130124</code> 栾城县</td></tr>
    <tr><td><code>132328</code></td><td>正定县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1985</td><td><code>130123</code> 正定县</td></tr>
    <tr><td><code>132329</code></td><td>新乐县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1991</td><td><code>132304</code> 新乐市</td></tr>
    <tr><td><code>132330</code></td><td>高邑县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130127</code> 高邑县</td></tr>
    <tr><td><code>132331</code></td><td>元氏县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130132</code> 元氏县</td></tr>
    <tr><td><code>132332</code></td><td>赞皇县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130129</code> 赞皇县</td></tr>
    <tr><td><code>132333</code></td><td>井陉县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1982</td><td><code>130121</code> 井陉县</td></tr>
    <tr><td><code>132334</code></td><td>获鹿县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1982</td><td><code>130122</code> 获鹿县</td></tr>
    <tr><td><code>132335</code></td><td>平山县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130131</code> 平山县</td></tr>
    <tr><td><code>132336</code></td><td>灵寿县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130126</code> 灵寿县</td></tr>
    <tr><td><code>132337</code></td><td>行唐县</td><td>停用</td><td>河北省 · 石家庄地区</td><td>1981–1992</td><td><code>130125</code> 行唐县</td></tr>
    <tr><td><code>132400</code></td><td>保定地区</td><td>停用</td><td>河北省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132401</code></td><td>保定市</td><td>更名</td><td>河北省 · 保定地区</td><td>1981–1982</td><td>代码未变，现名 保定市</td></tr>
    <tr><td><code>132401</code></td><td>定州市</td><td>停用</td><td>河北省 · 保定地区</td><td>1986–1993</td><td><code>130682</code> 定州市</td></tr>
    <tr><td><code>132402</code></td><td>涿州市</td><td>停用</td><td>河北省 · 保定地区</td><td>1986–1993</td><td><code>130681</code> 涿州市</td></tr>
    <tr><td><code>132403</code></td><td>安国市</td><td>停用</td><td>河北省 · 保定地区</td><td>1991–1993</td><td><code>130683</code> 安国市</td></tr>
    <tr><td><code>132404</code></td><td>高碑店市</td><td>停用</td><td>河北省 · 保定地区</td><td>1993</td><td><code>130684</code> 高碑店市</td></tr>
    <tr><td><code>132421</code></td><td>易县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130633</code> 易县</td></tr>
    <tr><td><code>132422</code></td><td>满城县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1982</td><td><code>130621</code> 满城县</td></tr>
    <tr><td><code>132423</code></td><td>徐水县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130625</code> 徐水县</td></tr>
    <tr><td><code>132424</code></td><td>涞源县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130630</code> 涞源县</td></tr>
    <tr><td><code>132425</code></td><td>定兴县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130626</code> 定兴县</td></tr>
    <tr><td><code>132426</code></td><td>完县</td><td>更名</td><td>河北省 · 保定地区</td><td>1981–1992</td><td>代码未变，现名 完县</td></tr>
    <tr><td><code>132426</code></td><td>顺平县</td><td>停用</td><td>河北省 · 保定地区</td><td>1993</td><td><code>130636</code> 顺平县</td></tr>
    <tr><td><code>132427</code></td><td>唐县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130627</code> 唐县</td></tr>
    <tr><td><code>132428</code></td><td>望都县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130631</code> 望都县</td></tr>
    <tr><td><code>132429</code></td><td>涞水县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130623</code> 涞水县</td></tr>
    <tr><td><code>132430</code></td><td>涿县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1985</td><td><code>132402</code> 涿州市</td></tr>
    <tr><td><code>132431</code></td><td>清苑县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1985</td><td><code>130622</code> 清苑县</td></tr>
    <tr><td><code>132432</code></td><td>高阳县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130628</code> 高阳县</td></tr>
    <tr><td><code>132433</code></td><td>安新县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130632</code> 安新县</td></tr>
    <tr><td><code>132434</code></td><td>雄县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130638</code> 雄县</td></tr>
    <tr><td><code>132435</code></td><td>容城县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130629</code> 容城县</td></tr>
    <tr><td><code>132436</code></td><td>新城县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1992</td><td><code>132404</code> 高碑店市</td></tr>
    <tr><td><code>132437</code></td><td>曲阳县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130634</code> 曲阳县</td></tr>
    <tr><td><code>132438</code></td><td>阜平县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130624</code> 阜平县</td></tr>
    <tr><td><code>132439</code></td><td>定县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1985</td><td><code>132401</code> 保定市</td></tr>
    <tr><td><code>132440</code></td><td>安国县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1990</td><td><code>132403</code> 安国市</td></tr>
    <tr><td><code>132441</code></td><td>博野县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130637</code> 博野县</td></tr>
    <tr><td><code>132442</code></td><td>蠡县</td><td>停用</td><td>河北省 · 保定地区</td><td>1981–1993</td><td><code>130635</code> 蠡县</td></tr>
    <tr><td><code>132500</code></td><td>张家口地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132501</code></td><td>张家口市</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1982</td><td><code>130702</code> 桥东区；<code>130703</code> 桥西区；<code>130704</code> 茶坊区；<code>130705</code> 宣化区；<code>130706</code> 下花园区；<code>130707</code> 庞家堡区</td></tr>
    <tr><td><code>132521</code></td><td>张北县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130722</code> 张北县</td></tr>
    <tr><td><code>132522</code></td><td>康保县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130723</code> 康保县</td></tr>
    <tr><td><code>132523</code></td><td>沽源县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130724</code> 沽源县</td></tr>
    <tr><td><code>132524</code></td><td>尚义县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130725</code> 尚义县</td></tr>
    <tr><td><code>132525</code></td><td>蔚县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130726</code> 蔚县</td></tr>
    <tr><td><code>132526</code></td><td>阳原县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130727</code> 阳原县</td></tr>
    <tr><td><code>132527</code></td><td>怀安县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130728</code> 怀安县</td></tr>
    <tr><td><code>132528</code></td><td>万全县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130729</code> 万全县</td></tr>
    <tr><td><code>132529</code></td><td>怀来县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130730</code> 怀来县</td></tr>
    <tr><td><code>132530</code></td><td>涿鹿县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130731</code> 涿鹿县</td></tr>
    <tr><td><code>132531</code></td><td>宣化县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1982</td><td><code>130721</code> 宣化县</td></tr>
    <tr><td><code>132532</code></td><td>赤城县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130732</code> 赤城县</td></tr>
    <tr><td><code>132533</code></td><td>崇礼县</td><td>停用</td><td>河北省 · 张家口地区</td><td>1981–1992</td><td><code>130733</code> 崇礼县</td></tr>
    <tr><td><code>132600</code></td><td>承德地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132601</code></td><td>承德市</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1982</td><td><code>130802</code> 双桥区；<code>130803</code> 双滦区；<code>130804</code> 鹰手营子矿区</td></tr>
    <tr><td><code>132621</code></td><td>青龙县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1982</td><td><code>130321</code> 青龙满族自治县</td></tr>
    <tr><td><code>132622</code></td><td>宽城县</td><td>更名</td><td>河北省 · 承德地区</td><td>1981–1988</td><td>代码未变，现名 宽城县</td></tr>
    <tr><td><code>132622</code></td><td>宽城满族自治县</td><td>停用</td><td>河北省 · 承德地区</td><td>1989–1992</td><td><code>130827</code> 宽城满族自治县</td></tr>
    <tr><td><code>132623</code></td><td>兴隆县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1992</td><td><code>130822</code> 兴隆县</td></tr>
    <tr><td><code>132624</code></td><td>平泉县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1992</td><td><code>130823</code> 平泉县</td></tr>
    <tr><td><code>132625</code></td><td>承德县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1982</td><td><code>130821</code> 承德县</td></tr>
    <tr><td><code>132626</code></td><td>滦平县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1992</td><td><code>130824</code> 滦平县</td></tr>
    <tr><td><code>132627</code></td><td>丰宁县</td><td>更名</td><td>河北省 · 承德地区</td><td>1981–1985</td><td>代码未变，现名 丰宁县</td></tr>
    <tr><td><code>132627</code></td><td>丰宁满族自治县</td><td>停用</td><td>河北省 · 承德地区</td><td>1986–1992</td><td><code>130826</code> 丰宁满族自治县</td></tr>
    <tr><td><code>132628</code></td><td>隆化县</td><td>停用</td><td>河北省 · 承德地区</td><td>1981–1992</td><td><code>130825</code> 隆化县</td></tr>
    <tr><td><code>132629</code></td><td>围场县</td><td>更名</td><td>河北省 · 承德地区</td><td>1981–1988</td><td>代码未变，现名 围场县</td></tr>
    <tr><td><code>132629</code></td><td>围场满族蒙古族自治县</td><td>停用</td><td>河北省 · 承德地区</td><td>1989–1992</td><td><code>130828</code> 围场满族蒙古族自治县</td></tr>
    <tr><td><code>132700</code></td><td>唐山地区</td><td>停用</td><td>河北省</td><td>1981–1982</td><td><code>132733</code> 唐海县</td></tr>
    <tr><td><code>132701</code></td><td>秦皇岛市</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130302</code> 海港区；<code>130303</code> 山海关区；<code>130304</code> 北戴河区；<code>130305</code> 郊区</td></tr>
    <tr><td><code>132721</code></td><td>丰润县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130221</code> 丰润县</td></tr>
    <tr><td><code>132722</code></td><td>丰南县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130222</code> 丰南县</td></tr>
    <tr><td><code>132723</code></td><td>滦县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130223</code> 滦县</td></tr>
    <tr><td><code>132724</code></td><td>滦南县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130224</code> 滦南县</td></tr>
    <tr><td><code>132725</code></td><td>乐亭县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130225</code> 乐亭县</td></tr>
    <tr><td><code>132726</code></td><td>昌黎县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130322</code> 昌黎县</td></tr>
    <tr><td><code>132727</code></td><td>抚宁县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130323</code> 抚宁县</td></tr>
    <tr><td><code>132728</code></td><td>卢龙县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130324</code> 卢龙县</td></tr>
    <tr><td><code>132729</code></td><td>迁安县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130226</code> 迁安县</td></tr>
    <tr><td><code>132730</code></td><td>迁西县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130227</code> 迁西县</td></tr>
    <tr><td><code>132731</code></td><td>遵化县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130228</code> 遵化县</td></tr>
    <tr><td><code>132732</code></td><td>玉田县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1981–1982</td><td><code>130229</code> 玉田县</td></tr>
    <tr><td><code>132733</code></td><td>唐海县</td><td>停用</td><td>河北省 · 唐山地区</td><td>1982</td><td><code>130230</code> 唐海县</td></tr>
    <tr><td><code>132800</code></td><td>廊坊地区</td><td>停用</td><td>河北省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132801</code></td><td>廊坊市</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131002</code> 安次区</td></tr>
    <tr><td><code>132821</code></td><td>三河县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131021</code> 三河县</td></tr>
    <tr><td><code>132822</code></td><td>大厂回族自治县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131028</code> 大厂回族自治县</td></tr>
    <tr><td><code>132823</code></td><td>香河县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131024</code> 香河县</td></tr>
    <tr><td><code>132824</code></td><td>安次县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1982</td><td><code>132801</code> 廊坊市</td></tr>
    <tr><td><code>132825</code></td><td>永清县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131023</code> 永清县</td></tr>
    <tr><td><code>132826</code></td><td>固安县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131022</code> 固安县</td></tr>
    <tr><td><code>132827</code></td><td>霸县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131027</code> 霸县</td></tr>
    <tr><td><code>132828</code></td><td>文安县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131026</code> 文安县</td></tr>
    <tr><td><code>132829</code></td><td>大城县</td><td>停用</td><td>河北省 · 廊坊地区</td><td>1981–1987</td><td><code>131025</code> 大城县</td></tr>
    <tr><td><code>132900</code></td><td>沧州地区</td><td>停用</td><td>河北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>132901</code></td><td>沧州市</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1982</td><td><code>130902</code> 新华区；<code>130903</code> 运河区；<code>130904</code> 郊区</td></tr>
    <tr><td><code>132902</code></td><td>泊头市</td><td>停用</td><td>河北省 · 沧州地区</td><td>1982–1992</td><td><code>130981</code> 泊头市</td></tr>
    <tr><td><code>132903</code></td><td>任丘市</td><td>停用</td><td>河北省 · 沧州地区</td><td>1986–1992</td><td><code>130982</code> 任丘市</td></tr>
    <tr><td><code>132904</code></td><td>黄骅市</td><td>停用</td><td>河北省 · 沧州地区</td><td>1989–1992</td><td><code>130983</code> 黄骅市</td></tr>
    <tr><td><code>132905</code></td><td>河间市</td><td>停用</td><td>河北省 · 沧州地区</td><td>1990–1992</td><td><code>130984</code> 河间市</td></tr>
    <tr><td><code>132921</code></td><td>沧县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1982</td><td><code>130921</code> 沧县</td></tr>
    <tr><td><code>132922</code></td><td>河间县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1989</td><td><code>132905</code> 河间市</td></tr>
    <tr><td><code>132923</code></td><td>肃宁县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130926</code> 肃宁县</td></tr>
    <tr><td><code>132924</code></td><td>献县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130929</code> 献县</td></tr>
    <tr><td><code>132925</code></td><td>交河县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1982</td><td><code>132902</code> 泊头市；<code>132902</code> 泊头市</td></tr>
    <tr><td><code>132926</code></td><td>吴桥县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130928</code> 吴桥县</td></tr>
    <tr><td><code>132927</code></td><td>东光县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130923</code> 东光县</td></tr>
    <tr><td><code>132928</code></td><td>南皮县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>132902</code> 泊头市；<code>130927</code> 南皮县</td></tr>
    <tr><td><code>132929</code></td><td>盐山县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130925</code> 盐山县</td></tr>
    <tr><td><code>132930</code></td><td>黄骅县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1988</td><td><code>132904</code> 黄骅市</td></tr>
    <tr><td><code>132931</code></td><td>孟村回族自治县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130930</code> 孟村回族自治县</td></tr>
    <tr><td><code>132932</code></td><td>青县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1985</td><td><code>130922</code> 青县</td></tr>
    <tr><td><code>132933</code></td><td>任丘县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1985</td><td><code>132903</code> 任丘市</td></tr>
    <tr><td><code>132934</code></td><td>海兴县</td><td>停用</td><td>河北省 · 沧州地区</td><td>1981–1992</td><td><code>130924</code> 海兴县</td></tr>
    <tr><td><code>133000</code></td><td>衡水地区</td><td>停用</td><td>河北省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>133001</code></td><td>衡水市</td><td>停用</td><td>河北省 · 衡水地区</td><td>1982–1995</td><td><code>131102</code> 桃城区</td></tr>
    <tr><td><code>133002</code></td><td>冀州市</td><td>停用</td><td>河北省 · 衡水地区</td><td>1993–1995</td><td><code>131181</code> 冀州市</td></tr>
    <tr><td><code>133003</code></td><td>深州市</td><td>停用</td><td>河北省 · 衡水地区</td><td>1994–1995</td><td><code>131182</code> 深州市</td></tr>
    <tr><td><code>133021</code></td><td>衡水县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1982</td><td><code>133001</code> 衡水市；<code>133001</code> 衡水市</td></tr>
    <tr><td><code>133022</code></td><td>冀县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1992</td><td><code>133002</code> 冀州市</td></tr>
    <tr><td><code>133023</code></td><td>枣强县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131121</code> 枣强县</td></tr>
    <tr><td><code>133024</code></td><td>武邑县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131122</code> 武邑县</td></tr>
    <tr><td><code>133025</code></td><td>深县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1993</td><td><code>133003</code> 深州市</td></tr>
    <tr><td><code>133026</code></td><td>武强县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131123</code> 武强县</td></tr>
    <tr><td><code>133027</code></td><td>饶阳县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131124</code> 饶阳县</td></tr>
    <tr><td><code>133028</code></td><td>安平县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131125</code> 安平县</td></tr>
    <tr><td><code>133029</code></td><td>故城县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131126</code> 故城县</td></tr>
    <tr><td><code>133030</code></td><td>景县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131127</code> 景县</td></tr>
    <tr><td><code>133031</code></td><td>阜城县</td><td>停用</td><td>河北省 · 衡水地区</td><td>1981–1995</td><td><code>131128</code> 阜城县</td></tr>
    <tr><td><code>139001</code></td><td>武安市</td><td>停用</td><td>河北省</td><td>1988–1989</td><td><code>130481</code> 武安市</td></tr>
    <tr><td><code>140102</code></td><td>南城区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1996</td><td><code>140105</code> 小店区；<code>140106</code> 迎泽区</td></tr>
    <tr><td><code>140103</code></td><td>北城区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1996</td><td><code>140107</code> 杏花岭区；<code>140108</code> 尖草坪区</td></tr>
    <tr><td><code>140104</code></td><td>河西区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1996</td><td><code>140109</code> 万柏林区；<code>140110</code> 晋源区</td></tr>
    <tr><td><code>140111</code></td><td>古交工矿区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1987</td><td><code>149001</code> 古交市</td></tr>
    <tr><td><code>140112</code></td><td>南郊区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1996</td><td><code>140105</code> 小店区；<code>140106</code> 迎泽区；<code>140107</code> 杏花岭区；<code>140110</code> 晋源区</td></tr>
    <tr><td><code>140113</code></td><td>北郊区</td><td>停用</td><td>山西省 · 太原市</td><td>1983–1996</td><td><code>140107</code> 杏花岭区；<code>140108</code> 尖草坪区；<code>140109</code> 万柏林区</td></tr>
    <tr><td><code>140202</code></td><td>城区</td><td>停用</td><td>山西省 · 大同市</td><td>1983–2017</td><td><code>140213</code> 平城区；<code>140214</code> 云冈区</td></tr>
    <tr><td><code>140203</code></td><td>矿区</td><td>停用</td><td>山西省 · 大同市</td><td>1983–2017</td><td><code>140214</code> 云冈区</td></tr>
    <tr><td><code>140211</code></td><td>南郊区</td><td>停用</td><td>山西省 · 大同市</td><td>1983–2017</td><td><code>140212</code> 新荣区；<code>140213</code> 平城区；<code>140214</code> 云冈区</td></tr>
    <tr><td><code>140227</code></td><td>大同县</td><td>停用</td><td>山西省 · 大同市</td><td>1993–2017</td><td><code>140215</code> 云州区</td></tr>
    <tr><td><code>140402</code></td><td>城区</td><td>停用</td><td>山西省 · 长治市</td><td>1983–2017</td><td><code>140403</code> 潞州区</td></tr>
    <tr><td><code>140411</code></td><td>郊区</td><td>停用</td><td>山西省 · 长治市</td><td>1983–2017</td><td><code>140403</code> 潞州区</td></tr>
    <tr><td><code>140421</code></td><td>长治县</td><td>停用</td><td>山西省 · 长治市</td><td>1983–2017</td><td><code>140404</code> 上党区</td></tr>
    <tr><td><code>140422</code></td><td>潞城县</td><td>停用</td><td>山西省 · 长治市</td><td>1983–1993</td><td><code>140481</code> 潞城市</td></tr>
    <tr><td><code>140424</code></td><td>屯留县</td><td>停用</td><td>山西省 · 长治市</td><td>1985–2017</td><td><code>140405</code> 屯留区</td></tr>
    <tr><td><code>140481</code></td><td>潞城市</td><td>停用</td><td>山西省 · 长治市</td><td>1994–2017</td><td><code>140406</code> 潞城区</td></tr>
    <tr><td><code>140511</code></td><td>郊区</td><td>停用</td><td>山西省 · 晋城市</td><td>1985–1995</td><td><code>140525</code> 泽州县</td></tr>
    <tr><td><code>140523</code></td><td>高平县</td><td>停用</td><td>山西省 · 晋城市</td><td>1985–1992</td><td><code>140581</code> 高平市</td></tr>
    <tr><td><code>140624</code></td><td>怀仁县</td><td>停用</td><td>山西省 · 朔州市</td><td>1993–2017</td><td><code>140681</code> 怀仁市</td></tr>
    <tr><td><code>140726</code></td><td>太谷县</td><td>停用</td><td>山西省 · 晋中市</td><td>1999–2018</td><td><code>140703</code> 太谷区</td></tr>
    <tr><td><code>142100</code></td><td>雁北地区</td><td>停用</td><td>山西省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142121</code></td><td>阳高县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140221</code> 阳高县</td></tr>
    <tr><td><code>142122</code></td><td>天镇县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140222</code> 天镇县</td></tr>
    <tr><td><code>142123</code></td><td>广灵县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140223</code> 广灵县</td></tr>
    <tr><td><code>142124</code></td><td>灵丘县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140224</code> 灵丘县</td></tr>
    <tr><td><code>142125</code></td><td>浑源县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140225</code> 浑源县</td></tr>
    <tr><td><code>142126</code></td><td>应县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140622</code> 应县</td></tr>
    <tr><td><code>142127</code></td><td>山阴县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1987</td><td><code>140621</code> 山阴县</td></tr>
    <tr><td><code>142128</code></td><td>朔县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1987</td><td><code>140602</code> 朔城区</td></tr>
    <tr><td><code>142129</code></td><td>平鲁县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1987</td><td><code>140603</code> 平鲁区</td></tr>
    <tr><td><code>142130</code></td><td>左云县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140226</code> 左云县</td></tr>
    <tr><td><code>142131</code></td><td>右玉县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140623</code> 右玉县</td></tr>
    <tr><td><code>142132</code></td><td>大同县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140227</code> 大同县</td></tr>
    <tr><td><code>142133</code></td><td>怀仁县</td><td>停用</td><td>山西省 · 雁北地区</td><td>1981–1992</td><td><code>140624</code> 怀仁县</td></tr>
    <tr><td><code>142200</code></td><td>忻县地区</td><td>更名</td><td>山西省</td><td>1981–1982</td><td>代码未变，现名 忻县地区</td></tr>
    <tr><td><code>142200</code></td><td>忻州地区</td><td>停用</td><td>山西省</td><td>1983–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142201</code></td><td>忻州市</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140902</code> 忻府区</td></tr>
    <tr><td><code>142202</code></td><td>原平市</td><td>停用</td><td>山西省 · 忻州地区</td><td>1993–1999</td><td><code>140981</code> 原平市</td></tr>
    <tr><td><code>142221</code></td><td>忻县</td><td>停用</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td><code>142201</code> 忻州市</td></tr>
    <tr><td><code>142222</code></td><td>定襄县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 定襄县</td></tr>
    <tr><td><code>142222</code></td><td>定襄县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140921</code> 定襄县</td></tr>
    <tr><td><code>142223</code></td><td>五台县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 五台县</td></tr>
    <tr><td><code>142223</code></td><td>五台县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140922</code> 五台县</td></tr>
    <tr><td><code>142224</code></td><td>原平县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 原平县</td></tr>
    <tr><td><code>142224</code></td><td>原平县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1992</td><td><code>142202</code> 原平市</td></tr>
    <tr><td><code>142225</code></td><td>代县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 代县</td></tr>
    <tr><td><code>142225</code></td><td>代县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140923</code> 代县</td></tr>
    <tr><td><code>142226</code></td><td>繁峙县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 繁峙县</td></tr>
    <tr><td><code>142226</code></td><td>繁峙县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140924</code> 繁峙县</td></tr>
    <tr><td><code>142227</code></td><td>宁武县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 宁武县</td></tr>
    <tr><td><code>142227</code></td><td>宁武县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140925</code> 宁武县</td></tr>
    <tr><td><code>142228</code></td><td>静乐县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 静乐县</td></tr>
    <tr><td><code>142228</code></td><td>静乐县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140926</code> 静乐县</td></tr>
    <tr><td><code>142229</code></td><td>神池县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 神池县</td></tr>
    <tr><td><code>142229</code></td><td>神池县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140927</code> 神池县</td></tr>
    <tr><td><code>142230</code></td><td>五寨县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 五寨县</td></tr>
    <tr><td><code>142230</code></td><td>五寨县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140928</code> 五寨县</td></tr>
    <tr><td><code>142231</code></td><td>岢岚县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 岢岚县</td></tr>
    <tr><td><code>142231</code></td><td>岢岚县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140929</code> 岢岚县</td></tr>
    <tr><td><code>142232</code></td><td>河曲县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 河曲县</td></tr>
    <tr><td><code>142232</code></td><td>河曲县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140930</code> 河曲县</td></tr>
    <tr><td><code>142233</code></td><td>保德县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 保德县</td></tr>
    <tr><td><code>142233</code></td><td>保德县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140931</code> 保德县</td></tr>
    <tr><td><code>142234</code></td><td>偏关县</td><td>更名</td><td>山西省 · 忻县地区</td><td>1981–1982</td><td>代码未变，现名 偏关县</td></tr>
    <tr><td><code>142234</code></td><td>偏关县</td><td>停用</td><td>山西省 · 忻州地区</td><td>1983–1999</td><td><code>140932</code> 偏关县</td></tr>
    <tr><td><code>142300</code></td><td>吕梁地区</td><td>停用</td><td>山西省</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142301</code></td><td>孝义市</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1992–2002</td><td><code>141181</code> 孝义市</td></tr>
    <tr><td><code>142302</code></td><td>离石市</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1996–2002</td><td><code>141102</code> 离石区</td></tr>
    <tr><td><code>142303</code></td><td>汾阳市</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1996–2002</td><td><code>141182</code> 汾阳市</td></tr>
    <tr><td><code>142321</code></td><td>汾阳县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–1995</td><td><code>142303</code> 汾阳市</td></tr>
    <tr><td><code>142322</code></td><td>文水县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141121</code> 文水县</td></tr>
    <tr><td><code>142323</code></td><td>交城县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141122</code> 交城县</td></tr>
    <tr><td><code>142324</code></td><td>孝义县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–1991</td><td><code>142301</code> 孝义市</td></tr>
    <tr><td><code>142325</code></td><td>兴县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141123</code> 兴县</td></tr>
    <tr><td><code>142326</code></td><td>临县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141124</code> 临县</td></tr>
    <tr><td><code>142327</code></td><td>柳林县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141125</code> 柳林县</td></tr>
    <tr><td><code>142328</code></td><td>石楼县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141126</code> 石楼县</td></tr>
    <tr><td><code>142329</code></td><td>岚县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141127</code> 岚县</td></tr>
    <tr><td><code>142330</code></td><td>方山县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141128</code> 方山县</td></tr>
    <tr><td><code>142331</code></td><td>离石县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–1995</td><td><code>142302</code> 离石市</td></tr>
    <tr><td><code>142332</code></td><td>中阳县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141129</code> 中阳县</td></tr>
    <tr><td><code>142333</code></td><td>交口县</td><td>停用</td><td>山西省 · 吕梁地区</td><td>1981–2002</td><td><code>141130</code> 交口县</td></tr>
    <tr><td><code>142400</code></td><td>晋中地区</td><td>停用</td><td>山西省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142401</code></td><td>榆次市</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140702</code> 榆次区</td></tr>
    <tr><td><code>142402</code></td><td>介休市</td><td>停用</td><td>山西省 · 晋中地区</td><td>1992–1998</td><td><code>140781</code> 介休市</td></tr>
    <tr><td><code>142421</code></td><td>榆社县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140721</code> 榆社县</td></tr>
    <tr><td><code>142422</code></td><td>左权县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140722</code> 左权县</td></tr>
    <tr><td><code>142423</code></td><td>和顺县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140723</code> 和顺县</td></tr>
    <tr><td><code>142424</code></td><td>昔阳县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140724</code> 昔阳县</td></tr>
    <tr><td><code>142425</code></td><td>平定县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1982</td><td><code>140321</code> 平定县</td></tr>
    <tr><td><code>142426</code></td><td>盂县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1982</td><td><code>140322</code> 盂县</td></tr>
    <tr><td><code>142427</code></td><td>寿阳县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140725</code> 寿阳县</td></tr>
    <tr><td><code>142428</code></td><td>榆次县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1982</td><td><code>142401</code> 榆次市</td></tr>
    <tr><td><code>142429</code></td><td>太谷县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140726</code> 太谷县</td></tr>
    <tr><td><code>142430</code></td><td>祁县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140727</code> 祁县</td></tr>
    <tr><td><code>142431</code></td><td>平遥县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140728</code> 平遥县</td></tr>
    <tr><td><code>142432</code></td><td>介休县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1991</td><td><code>142402</code> 介休市</td></tr>
    <tr><td><code>142433</code></td><td>灵石县</td><td>停用</td><td>山西省 · 晋中地区</td><td>1981–1998</td><td><code>140729</code> 灵石县</td></tr>
    <tr><td><code>142500</code></td><td>晋东南地区</td><td>停用</td><td>山西省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142501</code></td><td>晋城市</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1983–1984</td><td><code>140502</code> 城区；<code>140511</code> 郊区</td></tr>
    <tr><td><code>142521</code></td><td>长治县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1982</td><td><code>140421</code> 长治县</td></tr>
    <tr><td><code>142522</code></td><td>潞城县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1982</td><td><code>140422</code> 潞城县</td></tr>
    <tr><td><code>142523</code></td><td>屯留县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140424</code> 屯留县</td></tr>
    <tr><td><code>142524</code></td><td>长子县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140428</code> 长子县</td></tr>
    <tr><td><code>142525</code></td><td>沁水县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140521</code> 沁水县</td></tr>
    <tr><td><code>142526</code></td><td>阳城县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140522</code> 阳城县</td></tr>
    <tr><td><code>142527</code></td><td>晋城县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1982</td><td><code>142501</code> 晋城市</td></tr>
    <tr><td><code>142528</code></td><td>高平县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140523</code> 高平县</td></tr>
    <tr><td><code>142529</code></td><td>陵川县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140524</code> 陵川县</td></tr>
    <tr><td><code>142530</code></td><td>壶关县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140427</code> 壶关县</td></tr>
    <tr><td><code>142531</code></td><td>平顺县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140425</code> 平顺县</td></tr>
    <tr><td><code>142532</code></td><td>黎城县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140426</code> 黎城县</td></tr>
    <tr><td><code>142533</code></td><td>武乡县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140429</code> 武乡县</td></tr>
    <tr><td><code>142534</code></td><td>襄垣县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140423</code> 襄垣县</td></tr>
    <tr><td><code>142535</code></td><td>沁县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140430</code> 沁县</td></tr>
    <tr><td><code>142536</code></td><td>沁源县</td><td>停用</td><td>山西省 · 晋东南地区</td><td>1981–1984</td><td><code>140431</code> 沁源县</td></tr>
    <tr><td><code>142600</code></td><td>临汾地区</td><td>停用</td><td>山西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142601</code></td><td>临汾市</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141002</code> 尧都区</td></tr>
    <tr><td><code>142602</code></td><td>侯马市</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141081</code> 侯马市</td></tr>
    <tr><td><code>142603</code></td><td>霍州市</td><td>停用</td><td>山西省 · 临汾地区</td><td>1989–1999</td><td><code>141082</code> 霍州市</td></tr>
    <tr><td><code>142621</code></td><td>曲沃县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141021</code> 曲沃县</td></tr>
    <tr><td><code>142622</code></td><td>翼城县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141022</code> 翼城县</td></tr>
    <tr><td><code>142623</code></td><td>襄汾县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141023</code> 襄汾县</td></tr>
    <tr><td><code>142624</code></td><td>临汾县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1982</td><td><code>142601</code> 临汾市</td></tr>
    <tr><td><code>142625</code></td><td>洪洞县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141024</code> 洪洞县</td></tr>
    <tr><td><code>142626</code></td><td>霍县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1988</td><td><code>142603</code> 霍州市</td></tr>
    <tr><td><code>142627</code></td><td>古县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141025</code> 古县</td></tr>
    <tr><td><code>142628</code></td><td>安泽县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141026</code> 安泽县</td></tr>
    <tr><td><code>142629</code></td><td>浮山县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141027</code> 浮山县</td></tr>
    <tr><td><code>142630</code></td><td>吉县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141028</code> 吉县</td></tr>
    <tr><td><code>142631</code></td><td>乡宁县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141029</code> 乡宁县</td></tr>
    <tr><td><code>142632</code></td><td>蒲县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141033</code> 蒲县</td></tr>
    <tr><td><code>142633</code></td><td>大宁县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141030</code> 大宁县</td></tr>
    <tr><td><code>142634</code></td><td>永和县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141032</code> 永和县</td></tr>
    <tr><td><code>142635</code></td><td>隰县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141031</code> 隰县</td></tr>
    <tr><td><code>142636</code></td><td>汾西县</td><td>停用</td><td>山西省 · 临汾地区</td><td>1981–1999</td><td><code>141034</code> 汾西县</td></tr>
    <tr><td><code>142700</code></td><td>运城地区</td><td>停用</td><td>山西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>142701</code></td><td>运城市</td><td>停用</td><td>山西省 · 运城地区</td><td>1983–1999</td><td><code>140802</code> 盐湖区</td></tr>
    <tr><td><code>142702</code></td><td>永济市</td><td>停用</td><td>山西省 · 运城地区</td><td>1994–1999</td><td><code>140881</code> 永济市</td></tr>
    <tr><td><code>142703</code></td><td>河津市</td><td>停用</td><td>山西省 · 运城地区</td><td>1994–1999</td><td><code>140882</code> 河津市</td></tr>
    <tr><td><code>142721</code></td><td>运城县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1982</td><td><code>142701</code> 运城市</td></tr>
    <tr><td><code>142722</code></td><td>永济县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1993</td><td><code>142702</code> 永济市</td></tr>
    <tr><td><code>142723</code></td><td>芮城县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140830</code> 芮城县</td></tr>
    <tr><td><code>142724</code></td><td>临猗县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140821</code> 临猗县</td></tr>
    <tr><td><code>142725</code></td><td>万荣县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140822</code> 万荣县</td></tr>
    <tr><td><code>142726</code></td><td>新绛县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140825</code> 新绛县</td></tr>
    <tr><td><code>142727</code></td><td>稷山县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140824</code> 稷山县</td></tr>
    <tr><td><code>142728</code></td><td>河津县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1993</td><td><code>142703</code> 河津市</td></tr>
    <tr><td><code>142729</code></td><td>闻喜县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140823</code> 闻喜县</td></tr>
    <tr><td><code>142730</code></td><td>夏县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140828</code> 夏县</td></tr>
    <tr><td><code>142731</code></td><td>绛县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140826</code> 绛县</td></tr>
    <tr><td><code>142732</code></td><td>平陆县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140829</code> 平陆县</td></tr>
    <tr><td><code>142733</code></td><td>垣曲县</td><td>停用</td><td>山西省 · 运城地区</td><td>1981–1999</td><td><code>140827</code> 垣曲县</td></tr>
    <tr><td><code>149001</code></td><td>古交市</td><td>停用</td><td>山西省</td><td>1988–1989</td><td><code>140181</code> 古交市</td></tr>
    <tr><td><code>150105</code></td><td>郊区</td><td>更名</td><td>内蒙古自治区 · 呼和浩特市</td><td>1983–1999</td><td>代码未变，现名 赛罕区</td></tr>
    <tr><td><code>150205</code></td><td>石拐矿区</td><td>更名</td><td>内蒙古自治区 · 包头市</td><td>1983–1998</td><td>代码未变，现名 石拐区</td></tr>
    <tr><td><code>150207</code></td><td>郊区</td><td>更名</td><td>内蒙古自治区 · 包头市</td><td>1983–1998</td><td>代码未变，现名 九原区</td></tr>
    <tr><td><code>150404</code></td><td>郊区</td><td>更名</td><td>内蒙古自治区 · 赤峰市</td><td>1983–1992</td><td>代码未变，现名 松山区</td></tr>
    <tr><td><code>152100</code></td><td>呼伦贝尔盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152101</code></td><td>海拉尔市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150702</code> 海拉尔区</td></tr>
    <tr><td><code>152102</code></td><td>满洲里市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150781</code> 满洲里市</td></tr>
    <tr><td><code>152103</code></td><td>扎兰屯市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1983–2000</td><td><code>150783</code> 扎兰屯市</td></tr>
    <tr><td><code>152104</code></td><td>牙克石市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1983–2000</td><td><code>150782</code> 牙克石市</td></tr>
    <tr><td><code>152105</code></td><td>根河市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1994–2000</td><td><code>150785</code> 根河市</td></tr>
    <tr><td><code>152106</code></td><td>额尔古纳市</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1994–2000</td><td><code>150784</code> 额尔古纳市</td></tr>
    <tr><td><code>152121</code></td><td>布特哈旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–1982</td><td><code>152103</code> 扎兰屯市</td></tr>
    <tr><td><code>152122</code></td><td>阿荣旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150721</code> 阿荣旗</td></tr>
    <tr><td><code>152123</code></td><td>莫力达瓦达斡尔族自治旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150722</code> 莫力达瓦达斡尔族自治旗</td></tr>
    <tr><td><code>152124</code></td><td>喜桂图旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–1982</td><td><code>152104</code> 牙克石市</td></tr>
    <tr><td><code>152125</code></td><td>额尔古纳右旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–1993</td><td><code>152106</code> 额尔古纳市</td></tr>
    <tr><td><code>152126</code></td><td>额尔古纳左旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–1993</td><td><code>152105</code> 根河市</td></tr>
    <tr><td><code>152127</code></td><td>鄂伦春自治旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150723</code> 鄂伦春自治旗</td></tr>
    <tr><td><code>152128</code></td><td>鄂温克族自治旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150724</code> 鄂温克族自治旗</td></tr>
    <tr><td><code>152129</code></td><td>新巴尔虎右旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150727</code> 新巴尔虎右旗</td></tr>
    <tr><td><code>152130</code></td><td>新巴尔虎左旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150726</code> 新巴尔虎左旗</td></tr>
    <tr><td><code>152131</code></td><td>陈巴尔虎旗</td><td>停用</td><td>内蒙古自治区 · 呼伦贝尔盟</td><td>1981–2000</td><td><code>150725</code> 陈巴尔虎旗</td></tr>
    <tr><td><code>152300</code></td><td>哲里木盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152301</code></td><td>通辽市</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150502</code> 科尔沁区</td></tr>
    <tr><td><code>152302</code></td><td>霍林郭勒市</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1985–1998</td><td><code>150581</code> 霍林郭勒市</td></tr>
    <tr><td><code>152321</code></td><td>通辽县</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1985</td><td><code>152301</code> 通辽市</td></tr>
    <tr><td><code>152322</code></td><td>科尔沁左翼中旗</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150521</code> 科尔沁左翼中旗</td></tr>
    <tr><td><code>152323</code></td><td>科尔沁左翼后旗</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150522</code> 科尔沁左翼后旗</td></tr>
    <tr><td><code>152324</code></td><td>开鲁县</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150523</code> 开鲁县</td></tr>
    <tr><td><code>152325</code></td><td>库伦旗</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150524</code> 库伦旗</td></tr>
    <tr><td><code>152326</code></td><td>奈曼旗</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>150525</code> 奈曼旗</td></tr>
    <tr><td><code>152327</code></td><td>扎鲁特旗</td><td>停用</td><td>内蒙古自治区 · 哲里木盟</td><td>1981–1998</td><td><code>152302</code> 霍林郭勒市；<code>150526</code> 扎鲁特旗</td></tr>
    <tr><td><code>152400</code></td><td>昭乌达盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152401</code></td><td>赤峰市</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150402</code> 红山区；<code>150403</code> 元宝山区</td></tr>
    <tr><td><code>152421</code></td><td>阿鲁科尔沁旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150421</code> 阿鲁科尔沁旗</td></tr>
    <tr><td><code>152422</code></td><td>巴林左旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150422</code> 巴林左旗</td></tr>
    <tr><td><code>152423</code></td><td>巴林右旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150423</code> 巴林右旗</td></tr>
    <tr><td><code>152424</code></td><td>林西县</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150424</code> 林西县</td></tr>
    <tr><td><code>152425</code></td><td>克什克腾旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150425</code> 克什克腾旗</td></tr>
    <tr><td><code>152426</code></td><td>翁牛特旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150426</code> 翁牛特旗</td></tr>
    <tr><td><code>152427</code></td><td>赤峰县</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150402</code> 红山区；<code>150403</code> 元宝山区；<code>150404</code> 松山区</td></tr>
    <tr><td><code>152428</code></td><td>喀喇沁旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150403</code> 元宝山区；<code>150428</code> 喀喇沁旗</td></tr>
    <tr><td><code>152429</code></td><td>宁城县</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150429</code> 宁城县</td></tr>
    <tr><td><code>152430</code></td><td>敖汉旗</td><td>停用</td><td>内蒙古自治区 · 昭乌达盟</td><td>1981–1982</td><td><code>150430</code> 敖汉旗</td></tr>
    <tr><td><code>152521</code></td><td>阿巴哈纳尔旗</td><td>停用</td><td>内蒙古自治区 · 锡林郭勒盟</td><td>1981–1982</td><td><code>152502</code> 锡林浩特市</td></tr>
    <tr><td><code>152600</code></td><td>乌兰察布盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152601</code></td><td>集宁市</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150902</code> 集宁区</td></tr>
    <tr><td><code>152602</code></td><td>丰镇市</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1990–2002</td><td><code>150981</code> 丰镇市</td></tr>
    <tr><td><code>152621</code></td><td>武川县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–1995</td><td><code>150125</code> 武川县</td></tr>
    <tr><td><code>152622</code></td><td>和林格尔县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–1994</td><td><code>150123</code> 和林格尔县</td></tr>
    <tr><td><code>152623</code></td><td>清水河县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–1994</td><td><code>150124</code> 清水河县</td></tr>
    <tr><td><code>152624</code></td><td>卓资县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150921</code> 卓资县</td></tr>
    <tr><td><code>152625</code></td><td>化德县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150922</code> 化德县</td></tr>
    <tr><td><code>152626</code></td><td>商都县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150923</code> 商都县</td></tr>
    <tr><td><code>152627</code></td><td>兴和县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150924</code> 兴和县</td></tr>
    <tr><td><code>152628</code></td><td>丰镇县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–1989</td><td><code>152602</code> 丰镇市</td></tr>
    <tr><td><code>152629</code></td><td>凉城县</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150925</code> 凉城县</td></tr>
    <tr><td><code>152630</code></td><td>察哈尔右翼前旗</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150926</code> 察哈尔右翼前旗</td></tr>
    <tr><td><code>152631</code></td><td>察哈尔右翼中旗</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150927</code> 察哈尔右翼中旗</td></tr>
    <tr><td><code>152632</code></td><td>察哈尔右翼后旗</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150928</code> 察哈尔右翼后旗</td></tr>
    <tr><td><code>152633</code></td><td>达尔罕茂明安联合旗</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–1995</td><td><code>150223</code> 达尔罕茂明安联合旗</td></tr>
    <tr><td><code>152634</code></td><td>四子王旗</td><td>停用</td><td>内蒙古自治区 · 乌兰察布盟</td><td>1981–2002</td><td><code>150929</code> 四子王旗</td></tr>
    <tr><td><code>152700</code></td><td>伊克昭盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152701</code></td><td>东胜市</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1983–2000</td><td><code>150602</code> 东胜区</td></tr>
    <tr><td><code>152721</code></td><td>东胜县</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–1982</td><td><code>152701</code> 东胜市</td></tr>
    <tr><td><code>152722</code></td><td>达拉特旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150621</code> 达拉特旗</td></tr>
    <tr><td><code>152723</code></td><td>准格尔旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150622</code> 准格尔旗</td></tr>
    <tr><td><code>152724</code></td><td>鄂托克前旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150623</code> 鄂托克前旗</td></tr>
    <tr><td><code>152725</code></td><td>鄂托克旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150624</code> 鄂托克旗</td></tr>
    <tr><td><code>152726</code></td><td>杭锦旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150625</code> 杭锦旗</td></tr>
    <tr><td><code>152727</code></td><td>乌审旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150626</code> 乌审旗</td></tr>
    <tr><td><code>152728</code></td><td>伊金霍洛旗</td><td>停用</td><td>内蒙古自治区 · 伊克昭盟</td><td>1981–2000</td><td><code>150627</code> 伊金霍洛旗</td></tr>
    <tr><td><code>152800</code></td><td>巴彦淖尔盟</td><td>停用</td><td>内蒙古自治区</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>152801</code></td><td>临河市</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1984–2002</td><td><code>150802</code> 临河区</td></tr>
    <tr><td><code>152821</code></td><td>临河县</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–1983</td><td><code>152801</code> 临河市</td></tr>
    <tr><td><code>152822</code></td><td>五原县</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150821</code> 五原县</td></tr>
    <tr><td><code>152823</code></td><td>磴口县</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150822</code> 磴口县</td></tr>
    <tr><td><code>152824</code></td><td>乌拉特前旗</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150823</code> 乌拉特前旗</td></tr>
    <tr><td><code>152825</code></td><td>乌拉特中旗</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150824</code> 乌拉特中旗</td></tr>
    <tr><td><code>152826</code></td><td>乌拉特后旗</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150825</code> 乌拉特后旗</td></tr>
    <tr><td><code>152827</code></td><td>杭锦后旗</td><td>停用</td><td>内蒙古自治区 · 巴彦淖尔盟</td><td>1981–2002</td><td><code>150826</code> 杭锦后旗</td></tr>
    <tr><td><code>210112</code></td><td>东陵区</td><td>更名</td><td>辽宁省 · 沈阳市</td><td>1983–2013</td><td>代码未变，现名 浑南区</td></tr>
    <tr><td><code>210113</code></td><td>新城子区</td><td>更名</td><td>辽宁省 · 沈阳市</td><td>1983–2005</td><td>代码未变，现名 沈北新区</td></tr>
    <tr><td><code>210121</code></td><td>新民县</td><td>停用</td><td>辽宁省 · 沈阳市</td><td>1981–1992</td><td><code>210181</code> 新民市</td></tr>
    <tr><td><code>210122</code></td><td>辽中县</td><td>停用</td><td>辽宁省 · 沈阳市</td><td>1981–2015</td><td><code>210115</code> 辽中区</td></tr>
    <tr><td><code>210219</code></td><td>瓦房店市</td><td>停用</td><td>辽宁省 · 大连市</td><td>1985</td><td><code>219001</code> 瓦房店市</td></tr>
    <tr><td><code>210221</code></td><td>金县</td><td>停用</td><td>辽宁省 · 大连市</td><td>1981–1986</td><td><code>210211</code> 甘井子区；<code>210213</code> 金州区</td></tr>
    <tr><td><code>210222</code></td><td>新金县</td><td>停用</td><td>辽宁省 · 大连市</td><td>1981–1990</td><td><code>210282</code> 普兰店市</td></tr>
    <tr><td><code>210223</code></td><td>复县</td><td>停用</td><td>辽宁省 · 大连市</td><td>1981–1984</td><td><code>210219</code> 瓦房店市</td></tr>
    <tr><td><code>210225</code></td><td>庄河县</td><td>停用</td><td>辽宁省 · 大连市</td><td>1981–1991</td><td><code>210283</code> 庄河市</td></tr>
    <tr><td><code>210282</code></td><td>普兰店市</td><td>停用</td><td>辽宁省 · 大连市</td><td>1991–2014</td><td><code>210214</code> 普兰店区</td></tr>
    <tr><td><code>210311</code></td><td>郊区</td><td>更名</td><td>辽宁省 · 鞍山市</td><td>1983</td><td>代码未变，现名 千山区</td></tr>
    <tr><td><code>210311</code></td><td>旧堡区</td><td>更名</td><td>辽宁省 · 鞍山市</td><td>1984–1995</td><td>代码未变，现名 千山区</td></tr>
    <tr><td><code>210319</code></td><td>海城市</td><td>停用</td><td>辽宁省 · 鞍山市</td><td>1985</td><td><code>219002</code> 海城市</td></tr>
    <tr><td><code>210322</code></td><td>海城县</td><td>停用</td><td>辽宁省 · 鞍山市</td><td>1981–1984</td><td><code>210319</code> 海城市</td></tr>
    <tr><td><code>210403</code></td><td>露天区</td><td>更名</td><td>辽宁省 · 抚顺市</td><td>1983–1998</td><td>代码未变，现名 东洲区</td></tr>
    <tr><td><code>210411</code></td><td>郊区</td><td>更名</td><td>辽宁省 · 抚顺市</td><td>1983–1987</td><td>代码未变，现名 顺城区</td></tr>
    <tr><td><code>210422</code></td><td>新宾县</td><td>更名</td><td>辽宁省 · 抚顺市</td><td>1981–1984</td><td>代码未变，现名 新宾满族自治县</td></tr>
    <tr><td><code>210423</code></td><td>清原县</td><td>更名</td><td>辽宁省 · 抚顺市</td><td>1981–1988</td><td>代码未变，现名 清原满族自治县</td></tr>
    <tr><td><code>210511</code></td><td>立新区</td><td>停用</td><td>辽宁省 · 本溪市</td><td>1983</td><td><code>210502</code> 平山区；<code>210503</code> 溪湖区；<code>210504</code> 明山区；<code>210505</code> 南芬区</td></tr>
    <tr><td><code>210521</code></td><td>本溪县</td><td>更名</td><td>辽宁省 · 本溪市</td><td>1981–1988</td><td>代码未变，现名 本溪满族自治县</td></tr>
    <tr><td><code>210522</code></td><td>桓仁县</td><td>更名</td><td>辽宁省 · 本溪市</td><td>1981–1988</td><td>代码未变，现名 桓仁满族自治县</td></tr>
    <tr><td><code>210621</code></td><td>凤城县</td><td>更名</td><td>辽宁省 · 丹东市</td><td>1981–1984</td><td>代码未变，现名 凤城县</td></tr>
    <tr><td><code>210621</code></td><td>凤城满族自治县</td><td>停用</td><td>辽宁省 · 丹东市</td><td>1985–1993</td><td><code>210682</code> 凤城市</td></tr>
    <tr><td><code>210622</code></td><td>岫岩县</td><td>更名</td><td>辽宁省 · 丹东市</td><td>1981–1984</td><td>代码未变，现名 岫岩县</td></tr>
    <tr><td><code>210622</code></td><td>岫岩满族自治县</td><td>停用</td><td>辽宁省 · 丹东市</td><td>1985–1991</td><td><code>210323</code> 岫岩满族自治县</td></tr>
    <tr><td><code>210623</code></td><td>东沟县</td><td>停用</td><td>辽宁省 · 丹东市</td><td>1981–1992</td><td><code>210604</code> 振安区；<code>210681</code> 东港市</td></tr>
    <tr><td><code>210624</code></td><td>宽甸县</td><td>更名</td><td>辽宁省 · 丹东市</td><td>1981–1988</td><td>代码未变，现名 宽甸满族自治县</td></tr>
    <tr><td><code>210704</code></td><td>南票区</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1983–1988</td><td><code>211404</code> 南票区</td></tr>
    <tr><td><code>210705</code></td><td>葫芦岛区</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1983–1988</td><td><code>211403</code> 龙港区</td></tr>
    <tr><td><code>210719</code></td><td>锦西市</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1985</td><td><code>219003</code> 锦西市</td></tr>
    <tr><td><code>210721</code></td><td>锦西县</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1981–1984</td><td><code>210700</code> 锦州市；<code>210719</code> 锦西市</td></tr>
    <tr><td><code>210722</code></td><td>兴城县</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1981–1985</td><td><code>219004</code> 兴城市</td></tr>
    <tr><td><code>210723</code></td><td>绥中县</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1981–1988</td><td><code>211421</code> 绥中县</td></tr>
    <tr><td><code>210724</code></td><td>锦县</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1981–1992</td><td><code>210711</code> 太和区；<code>210781</code> 凌海市</td></tr>
    <tr><td><code>210725</code></td><td>北镇县</td><td>更名</td><td>辽宁省 · 锦州市</td><td>1981–1988</td><td>代码未变，现名 北镇县</td></tr>
    <tr><td><code>210725</code></td><td>北镇满族自治县</td><td>停用</td><td>辽宁省 · 锦州市</td><td>1989–1994</td><td><code>210782</code> 北镇市</td></tr>
    <tr><td><code>210782</code></td><td>北宁市</td><td>更名</td><td>辽宁省 · 锦州市</td><td>1995–2005</td><td>代码未变，现名 北镇市</td></tr>
    <tr><td><code>210811</code></td><td>郊区</td><td>更名</td><td>辽宁省 · 营口市</td><td>1983</td><td>代码未变，现名 老边区</td></tr>
    <tr><td><code>210812</code></td><td>鲅鱼圈区</td><td>停用</td><td>辽宁省 · 营口市</td><td>1984–1985</td><td><code>210804</code> 鲅鱼圈区</td></tr>
    <tr><td><code>210821</code></td><td>营口县</td><td>停用</td><td>辽宁省 · 营口市</td><td>1981–1991</td><td><code>210882</code> 大石桥市</td></tr>
    <tr><td><code>210822</code></td><td>盘山县</td><td>停用</td><td>辽宁省 · 营口市</td><td>1981–1983</td><td><code>211102</code> 双台子区；<code>211103</code> 兴隆台区；<code>211111</code> 郊区</td></tr>
    <tr><td><code>210823</code></td><td>大洼县</td><td>停用</td><td>辽宁省 · 营口市</td><td>1981–1983</td><td><code>211121</code> 大洼县</td></tr>
    <tr><td><code>210824</code></td><td>盖县</td><td>停用</td><td>辽宁省 · 营口市</td><td>1981–1991</td><td><code>210812</code> 鲅鱼圈区；<code>210881</code> 盖州市</td></tr>
    <tr><td><code>210911</code></td><td>郊区</td><td>更名</td><td>辽宁省 · 阜新市</td><td>1983</td><td>代码未变，现名 细河区</td></tr>
    <tr><td><code>211011</code></td><td>郊区</td><td>更名</td><td>辽宁省 · 辽阳市</td><td>1983</td><td>代码未变，现名 太子河区</td></tr>
    <tr><td><code>211022</code></td><td>灯塔县</td><td>停用</td><td>辽宁省 · 辽阳市</td><td>1981–1995</td><td><code>211081</code> 灯塔市</td></tr>
    <tr><td><code>211102</code></td><td>盘山区</td><td>更名</td><td>辽宁省 · 盘锦市</td><td>1984–1985</td><td>代码未变，现名 双台子区</td></tr>
    <tr><td><code>211111</code></td><td>郊区</td><td>停用</td><td>辽宁省 · 盘锦市</td><td>1984–1985</td><td><code>211122</code> 盘山县</td></tr>
    <tr><td><code>211121</code></td><td>大洼县</td><td>停用</td><td>辽宁省 · 盘锦市</td><td>1984–2015</td><td><code>211104</code> 大洼区</td></tr>
    <tr><td><code>211203</code></td><td>铁法区</td><td>停用</td><td>辽宁省 · 铁岭市</td><td>1984–1985</td><td><code>219005</code> 铁法市</td></tr>
    <tr><td><code>211222</code></td><td>开原县</td><td>停用</td><td>辽宁省 · 铁岭市</td><td>1984–1987</td><td><code>219007</code> 开原市</td></tr>
    <tr><td><code>211225</code></td><td>康平县</td><td>停用</td><td>辽宁省 · 铁岭市</td><td>1984–1991</td><td><code>210123</code> 康平县</td></tr>
    <tr><td><code>211226</code></td><td>法库县</td><td>停用</td><td>辽宁省 · 铁岭市</td><td>1984–1991</td><td><code>210124</code> 法库县</td></tr>
    <tr><td><code>211281</code></td><td>铁法市</td><td>更名</td><td>辽宁省 · 铁岭市</td><td>1990–2001</td><td>代码未变，现名 调兵山市</td></tr>
    <tr><td><code>211319</code></td><td>北票市</td><td>停用</td><td>辽宁省 · 朝阳市</td><td>1985</td><td><code>219006</code> 北票市</td></tr>
    <tr><td><code>211323</code></td><td>凌源县</td><td>停用</td><td>辽宁省 · 朝阳市</td><td>1984–1990</td><td><code>211382</code> 凌源市</td></tr>
    <tr><td><code>211325</code></td><td>建昌县</td><td>停用</td><td>辽宁省 · 朝阳市</td><td>1984–1988</td><td><code>211422</code> 建昌县</td></tr>
    <tr><td><code>211326</code></td><td>北票县</td><td>停用</td><td>辽宁省 · 朝阳市</td><td>1984</td><td><code>211319</code> 北票市</td></tr>
    <tr><td><code>211400</code></td><td>锦西市</td><td>更名</td><td>辽宁省</td><td>1989–1993</td><td>代码未变，现名 葫芦岛市</td></tr>
    <tr><td><code>211402</code></td><td>连山区</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1989–1993</td><td>代码未变，现名 连山区</td></tr>
    <tr><td><code>211403</code></td><td>葫芦岛区</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1989–1993</td><td>代码未变，现名 龙港区</td></tr>
    <tr><td><code>211404</code></td><td>南票区</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1989–1993</td><td>代码未变，现名 南票区</td></tr>
    <tr><td><code>211421</code></td><td>绥中县</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1989–1993</td><td>代码未变，现名 绥中县</td></tr>
    <tr><td><code>211422</code></td><td>建昌县</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1989–1993</td><td>代码未变，现名 建昌县</td></tr>
    <tr><td><code>211481</code></td><td>兴城市</td><td>更名</td><td>辽宁省 · 锦西市</td><td>1990–1993</td><td>代码未变，现名 兴城市</td></tr>
    <tr><td><code>212100</code></td><td>铁岭地区</td><td>停用</td><td>辽宁省</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>212101</code></td><td>铁岭市</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211202</code> 银州区</td></tr>
    <tr><td><code>212102</code></td><td>铁法市</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211203</code> 铁法区</td></tr>
    <tr><td><code>212121</code></td><td>铁岭县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211221</code> 铁岭县</td></tr>
    <tr><td><code>212122</code></td><td>开原县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211204</code> 清河区；<code>211222</code> 开原县</td></tr>
    <tr><td><code>212123</code></td><td>西丰县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211223</code> 西丰县</td></tr>
    <tr><td><code>212124</code></td><td>昌图县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211224</code> 昌图县</td></tr>
    <tr><td><code>212125</code></td><td>康平县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211225</code> 康平县</td></tr>
    <tr><td><code>212126</code></td><td>法库县</td><td>停用</td><td>辽宁省 · 铁岭地区</td><td>1981–1983</td><td><code>211203</code> 铁法区；<code>211226</code> 法库县</td></tr>
    <tr><td><code>212200</code></td><td>朝阳地区</td><td>停用</td><td>辽宁省</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>212201</code></td><td>朝阳市</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211302</code> 双塔区；<code>211303</code> 龙城区</td></tr>
    <tr><td><code>212221</code></td><td>朝阳县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211303</code> 龙城区；<code>211321</code> 朝阳县</td></tr>
    <tr><td><code>212222</code></td><td>建平县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211322</code> 建平县</td></tr>
    <tr><td><code>212223</code></td><td>凌源县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211323</code> 凌源县</td></tr>
    <tr><td><code>212224</code></td><td>喀喇沁左翼蒙古族自治县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211324</code> 喀喇沁左翼蒙古族自治县</td></tr>
    <tr><td><code>212225</code></td><td>建昌县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211325</code> 建昌县</td></tr>
    <tr><td><code>212226</code></td><td>北票县</td><td>停用</td><td>辽宁省 · 朝阳地区</td><td>1981–1983</td><td><code>211326</code> 北票县</td></tr>
    <tr><td><code>219001</code></td><td>瓦房店市</td><td>停用</td><td>辽宁省</td><td>1986–1989</td><td><code>210281</code> 瓦房店市</td></tr>
    <tr><td><code>219002</code></td><td>海城市</td><td>停用</td><td>辽宁省</td><td>1986–1989</td><td><code>210381</code> 海城市</td></tr>
    <tr><td><code>219003</code></td><td>锦西市</td><td>停用</td><td>辽宁省</td><td>1986–1988</td><td><code>211402</code> 连山区；<code>211403</code> 龙港区；<code>211404</code> 南票区</td></tr>
    <tr><td><code>219004</code></td><td>兴城市</td><td>停用</td><td>辽宁省</td><td>1986–1989</td><td><code>211481</code> 兴城市</td></tr>
    <tr><td><code>219005</code></td><td>铁法市</td><td>停用</td><td>辽宁省</td><td>1986–1989</td><td><code>211281</code> 调兵山市</td></tr>
    <tr><td><code>219006</code></td><td>北票市</td><td>停用</td><td>辽宁省</td><td>1986–1989</td><td><code>211381</code> 北票市</td></tr>
    <tr><td><code>219007</code></td><td>开原市</td><td>停用</td><td>辽宁省</td><td>1988–1989</td><td><code>211282</code> 开原市</td></tr>
    <tr><td><code>220105</code></td><td>二道河子区</td><td>更名</td><td>吉林省 · 长春市</td><td>1983–1994</td><td>代码未变，现名 二道区</td></tr>
    <tr><td><code>220111</code></td><td>郊区</td><td>停用</td><td>吉林省 · 长春市</td><td>1983–1994</td><td><code>220102</code> 南关区；<code>220103</code> 宽城区；<code>220104</code> 朝阳区；<code>220105</code> 二道区；<code>220106</code> 绿园区</td></tr>
    <tr><td><code>220121</code></td><td>榆树县</td><td>更名</td><td>吉林省 · 长春市</td><td>1981</td><td>代码未变，现名 榆树县</td></tr>
    <tr><td><code>220121</code></td><td>榆树县</td><td>停用</td><td>吉林省 · 长春市</td><td>1983–1989</td><td><code>220182</code> 榆树市</td></tr>
    <tr><td><code>220122</code></td><td>农安县</td><td>更名</td><td>吉林省 · 长春市</td><td>1981</td><td>代码未变，现名 农安县</td></tr>
    <tr><td><code>220123</code></td><td>九台县</td><td>更名</td><td>吉林省 · 长春市</td><td>1981</td><td>代码未变，现名 九台县</td></tr>
    <tr><td><code>220123</code></td><td>九台县</td><td>停用</td><td>吉林省 · 长春市</td><td>1983–1987</td><td><code>229005</code> 九台市</td></tr>
    <tr><td><code>220124</code></td><td>德惠县</td><td>更名</td><td>吉林省 · 长春市</td><td>1981</td><td>代码未变，现名 德惠县</td></tr>
    <tr><td><code>220124</code></td><td>德惠县</td><td>停用</td><td>吉林省 · 长春市</td><td>1983–1993</td><td><code>220183</code> 德惠市</td></tr>
    <tr><td><code>220125</code></td><td>双阳县</td><td>更名</td><td>吉林省 · 长春市</td><td>1981</td><td>代码未变，现名 双阳县</td></tr>
    <tr><td><code>220125</code></td><td>双阳县</td><td>停用</td><td>吉林省 · 长春市</td><td>1983–1994</td><td><code>220105</code> 二道区；<code>220112</code> 双阳区</td></tr>
    <tr><td><code>220181</code></td><td>九台市</td><td>停用</td><td>吉林省 · 长春市</td><td>1990–2013</td><td><code>220105</code> 二道区；<code>220113</code> 九台区</td></tr>
    <tr><td><code>220211</code></td><td>郊区</td><td>更名</td><td>吉林省 · 吉林市</td><td>1983–1991</td><td>代码未变，现名 丰满区</td></tr>
    <tr><td><code>220221</code></td><td>永吉县</td><td>更名</td><td>吉林省 · 吉林市</td><td>1981</td><td>代码未变，现名 永吉县</td></tr>
    <tr><td><code>220222</code></td><td>舒兰县</td><td>更名</td><td>吉林省 · 吉林市</td><td>1981</td><td>代码未变，现名 舒兰县</td></tr>
    <tr><td><code>220222</code></td><td>舒兰县</td><td>停用</td><td>吉林省 · 吉林市</td><td>1983–1991</td><td><code>220283</code> 舒兰市</td></tr>
    <tr><td><code>220223</code></td><td>磐石县</td><td>更名</td><td>吉林省 · 吉林市</td><td>1981</td><td>代码未变，现名 磐石县</td></tr>
    <tr><td><code>220223</code></td><td>磐石县</td><td>停用</td><td>吉林省 · 吉林市</td><td>1983–1994</td><td><code>220284</code> 磐石市</td></tr>
    <tr><td><code>220224</code></td><td>蛟河县</td><td>更名</td><td>吉林省 · 吉林市</td><td>1981</td><td>代码未变，现名 蛟河县</td></tr>
    <tr><td><code>220224</code></td><td>蛟河县</td><td>停用</td><td>吉林省 · 吉林市</td><td>1983–1988</td><td><code>229006</code> 蛟河市</td></tr>
    <tr><td><code>220225</code></td><td>桦甸县</td><td>更名</td><td>吉林省 · 吉林市</td><td>1981</td><td>代码未变，现名 桦甸县</td></tr>
    <tr><td><code>220225</code></td><td>桦甸县</td><td>停用</td><td>吉林省 · 吉林市</td><td>1983–1987</td><td><code>229004</code> 桦甸市</td></tr>
    <tr><td><code>220319</code></td><td>公主岭市</td><td>停用</td><td>吉林省 · 四平市</td><td>1985–1987</td><td><code>229001</code> 公主岭市</td></tr>
    <tr><td><code>220321</code></td><td>怀德县</td><td>停用</td><td>吉林省 · 四平市</td><td>1983–1984</td><td><code>220319</code> 公主岭市</td></tr>
    <tr><td><code>220323</code></td><td>伊通县</td><td>更名</td><td>吉林省 · 四平市</td><td>1983–1987</td><td>代码未变，现名 伊通满族自治县</td></tr>
    <tr><td><code>220324</code></td><td>双辽县</td><td>停用</td><td>吉林省 · 四平市</td><td>1983–1995</td><td><code>220382</code> 双辽市</td></tr>
    <tr><td><code>220381</code></td><td>公主岭市</td><td>停用</td><td>吉林省 · 四平市</td><td>1990–2019</td><td><code>220104</code> 朝阳区；<code>220184</code> 公主岭市</td></tr>
    <tr><td><code>220519</code></td><td>梅河口市</td><td>停用</td><td>吉林省 · 通化市</td><td>1985–1987</td><td><code>229002</code> 梅河口市</td></tr>
    <tr><td><code>220522</code></td><td>集安县</td><td>停用</td><td>吉林省 · 通化市</td><td>1985–1987</td><td><code>229003</code> 集安市</td></tr>
    <tr><td><code>220600</code></td><td>浑江市</td><td>更名</td><td>吉林省</td><td>1985–1993</td><td>代码未变，现名 白山市</td></tr>
    <tr><td><code>220602</code></td><td>八道江区</td><td>更名</td><td>吉林省 · 浑江市</td><td>1986–1993</td><td>代码未变，现名 浑江区</td></tr>
    <tr><td><code>220602</code></td><td>八道江区</td><td>更名</td><td>吉林省 · 白山市</td><td>1994–2009</td><td>代码未变，现名 浑江区</td></tr>
    <tr><td><code>220603</code></td><td>三岔子区</td><td>更名</td><td>吉林省 · 浑江市</td><td>1986–1993</td><td>代码未变，现名 三岔子区</td></tr>
    <tr><td><code>220603</code></td><td>三岔子区</td><td>停用</td><td>吉林省 · 白山市</td><td>1994</td><td><code>220625</code> 江源县</td></tr>
    <tr><td><code>220604</code></td><td>临江区</td><td>停用</td><td>吉林省 · 浑江市</td><td>1986–1991</td><td><code>220624</code> 临江县</td></tr>
    <tr><td><code>220621</code></td><td>抚松县</td><td>更名</td><td>吉林省 · 浑江市</td><td>1985–1993</td><td>代码未变，现名 抚松县</td></tr>
    <tr><td><code>220622</code></td><td>靖宇县</td><td>更名</td><td>吉林省 · 浑江市</td><td>1985–1993</td><td>代码未变，现名 靖宇县</td></tr>
    <tr><td><code>220623</code></td><td>长白朝鲜族自治县</td><td>更名</td><td>吉林省 · 浑江市</td><td>1985–1993</td><td>代码未变，现名 长白朝鲜族自治县</td></tr>
    <tr><td><code>220624</code></td><td>临江县</td><td>停用</td><td>吉林省 · 浑江市</td><td>1992</td><td><code>220681</code> 临江市</td></tr>
    <tr><td><code>220625</code></td><td>江源县</td><td>停用</td><td>吉林省 · 白山市</td><td>1995–2005</td><td><code>220605</code> 江源区</td></tr>
    <tr><td><code>220681</code></td><td>临江市</td><td>更名</td><td>吉林省 · 浑江市</td><td>1993</td><td>代码未变，现名 临江市</td></tr>
    <tr><td><code>220702</code></td><td>扶余区</td><td>更名</td><td>吉林省 · 松原市</td><td>1992–1994</td><td>代码未变，现名 宁江区</td></tr>
    <tr><td><code>220724</code></td><td>扶余县</td><td>停用</td><td>吉林省 · 松原市</td><td>1995–2012</td><td><code>220781</code> 扶余市</td></tr>
    <tr><td><code>222100</code></td><td>四平地区</td><td>停用</td><td>吉林省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>222101</code></td><td>四平市</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220302</code> 铁西区；<code>220303</code> 铁东区</td></tr>
    <tr><td><code>222102</code></td><td>辽源市</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220402</code> 龙山区；<code>220403</code> 西安区；<code>220422</code> 东辽县</td></tr>
    <tr><td><code>222121</code></td><td>怀德县</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220321</code> 怀德县</td></tr>
    <tr><td><code>222122</code></td><td>梨树县</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220322</code> 梨树县</td></tr>
    <tr><td><code>222123</code></td><td>伊通县</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220323</code> 伊通满族自治县</td></tr>
    <tr><td><code>222124</code></td><td>东丰县</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220421</code> 东丰县</td></tr>
    <tr><td><code>222125</code></td><td>双辽县</td><td>停用</td><td>吉林省 · 四平地区</td><td>1981–1982</td><td><code>220324</code> 双辽县</td></tr>
    <tr><td><code>222200</code></td><td>通化地区</td><td>停用</td><td>吉林省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>222201</code></td><td>通化市</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220500</code> 通化市</td></tr>
    <tr><td><code>222202</code></td><td>浑江市</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220600</code> 白山市</td></tr>
    <tr><td><code>222221</code></td><td>海龙县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220519</code> 梅河口市</td></tr>
    <tr><td><code>222222</code></td><td>通化县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220521</code> 通化县</td></tr>
    <tr><td><code>222223</code></td><td>柳河县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220524</code> 柳河县</td></tr>
    <tr><td><code>222224</code></td><td>辉南县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220523</code> 辉南县</td></tr>
    <tr><td><code>222225</code></td><td>集安县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220522</code> 集安县</td></tr>
    <tr><td><code>222226</code></td><td>抚松县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220621</code> 抚松县</td></tr>
    <tr><td><code>222227</code></td><td>靖宇县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220622</code> 靖宇县</td></tr>
    <tr><td><code>222228</code></td><td>长白朝鲜族自治县</td><td>停用</td><td>吉林省 · 通化地区</td><td>1981–1984</td><td><code>220623</code> 长白朝鲜族自治县</td></tr>
    <tr><td><code>222300</code></td><td>白城地区</td><td>停用</td><td>吉林省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>222301</code></td><td>白城市</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1992</td><td><code>220802</code> 洮北区</td></tr>
    <tr><td><code>222302</code></td><td>洮南市</td><td>停用</td><td>吉林省 · 白城地区</td><td>1987–1992</td><td><code>220802</code> 洮北区；<code>220881</code> 洮南市</td></tr>
    <tr><td><code>222303</code></td><td>扶余市</td><td>停用</td><td>吉林省 · 白城地区</td><td>1987–1991</td><td><code>220702</code> 宁江区</td></tr>
    <tr><td><code>222304</code></td><td>大安市</td><td>停用</td><td>吉林省 · 白城地区</td><td>1988–1992</td><td><code>220882</code> 大安市</td></tr>
    <tr><td><code>222321</code></td><td>扶余县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1986</td><td><code>222303</code> 扶余市</td></tr>
    <tr><td><code>222322</code></td><td>洮安县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1986</td><td><code>222302</code> 洮南市</td></tr>
    <tr><td><code>222323</code></td><td>长岭县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1991</td><td><code>220722</code> 长岭县</td></tr>
    <tr><td><code>222324</code></td><td>前郭尔罗斯蒙古族自治县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1991</td><td><code>220702</code> 宁江区；<code>220721</code> 前郭尔罗斯蒙古族自治县</td></tr>
    <tr><td><code>222325</code></td><td>大安县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1987</td><td><code>222304</code> 大安市</td></tr>
    <tr><td><code>222326</code></td><td>镇赉县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1992</td><td><code>220821</code> 镇赉县</td></tr>
    <tr><td><code>222327</code></td><td>通榆县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1992</td><td><code>220822</code> 通榆县</td></tr>
    <tr><td><code>222328</code></td><td>乾安县</td><td>停用</td><td>吉林省 · 白城地区</td><td>1981–1991</td><td><code>220723</code> 乾安县</td></tr>
    <tr><td><code>222421</code></td><td>延吉县</td><td>更名</td><td>吉林省 · 延边朝鲜族自治州</td><td>1981–1982</td><td>代码未变，现名 延吉县</td></tr>
    <tr><td><code>222421</code></td><td>龙井县</td><td>停用</td><td>吉林省 · 延边朝鲜族自治州</td><td>1983–1987</td><td><code>222405</code> 龙井市</td></tr>
    <tr><td><code>222422</code></td><td>敦化县</td><td>停用</td><td>吉林省 · 延边朝鲜族自治州</td><td>1981–1984</td><td><code>222403</code> 敦化市</td></tr>
    <tr><td><code>222423</code></td><td>和龙县</td><td>停用</td><td>吉林省 · 延边朝鲜族自治州</td><td>1981–1992</td><td><code>222406</code> 和龙市</td></tr>
    <tr><td><code>222425</code></td><td>珲春县</td><td>停用</td><td>吉林省 · 延边朝鲜族自治州</td><td>1981–1987</td><td><code>222404</code> 珲春市</td></tr>
    <tr><td><code>222500</code></td><td>德惠地区</td><td>停用</td><td>吉林省</td><td>1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>222521</code></td><td>榆树县</td><td>停用</td><td>吉林省 · 德惠地区</td><td>1982</td><td><code>220121</code> 榆树县</td></tr>
    <tr><td><code>222522</code></td><td>农安县</td><td>停用</td><td>吉林省 · 德惠地区</td><td>1982</td><td><code>220122</code> 农安县</td></tr>
    <tr><td><code>222523</code></td><td>九台县</td><td>停用</td><td>吉林省 · 德惠地区</td><td>1982</td><td><code>220123</code> 九台县</td></tr>
    <tr><td><code>222524</code></td><td>德惠县</td><td>停用</td><td>吉林省 · 德惠地区</td><td>1982</td><td><code>220124</code> 德惠县</td></tr>
    <tr><td><code>222525</code></td><td>双阳县</td><td>停用</td><td>吉林省 · 德惠地区</td><td>1982</td><td><code>220125</code> 双阳县</td></tr>
    <tr><td><code>222600</code></td><td>永吉地区</td><td>停用</td><td>吉林省</td><td>1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>222621</code></td><td>永吉县</td><td>停用</td><td>吉林省 · 永吉地区</td><td>1982</td><td><code>220221</code> 永吉县</td></tr>
    <tr><td><code>222622</code></td><td>舒兰县</td><td>停用</td><td>吉林省 · 永吉地区</td><td>1982</td><td><code>220222</code> 舒兰县</td></tr>
    <tr><td><code>222623</code></td><td>磐石县</td><td>停用</td><td>吉林省 · 永吉地区</td><td>1982</td><td><code>220223</code> 磐石县</td></tr>
    <tr><td><code>222624</code></td><td>蛟河县</td><td>停用</td><td>吉林省 · 永吉地区</td><td>1982</td><td><code>220224</code> 蛟河县</td></tr>
    <tr><td><code>222625</code></td><td>桦甸县</td><td>停用</td><td>吉林省 · 永吉地区</td><td>1982</td><td><code>220225</code> 桦甸县</td></tr>
    <tr><td><code>229001</code></td><td>公主岭市</td><td>停用</td><td>吉林省</td><td>1988–1989</td><td><code>220381</code> 公主岭市</td></tr>
    <tr><td><code>229002</code></td><td>梅河口市</td><td>停用</td><td>吉林省</td><td>1988–1989</td><td><code>220581</code> 梅河口市</td></tr>
    <tr><td><code>229003</code></td><td>集安市</td><td>停用</td><td>吉林省</td><td>1988–1989</td><td><code>220582</code> 集安市</td></tr>
    <tr><td><code>229004</code></td><td>桦甸市</td><td>停用</td><td>吉林省</td><td>1988–1989</td><td><code>220282</code> 桦甸市</td></tr>
    <tr><td><code>229005</code></td><td>九台市</td><td>停用</td><td>吉林省</td><td>1988–1989</td><td><code>220181</code> 九台市</td></tr>
    <tr><td><code>229006</code></td><td>蛟河市</td><td>停用</td><td>吉林省</td><td>1989</td><td><code>220281</code> 蛟河市</td></tr>
    <tr><td><code>230105</code></td><td>太平区</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1983–2003</td><td><code>230104</code> 道外区</td></tr>
    <tr><td><code>230106</code></td><td>香坊区</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1983–2003</td><td><code>230110</code> 香坊区</td></tr>
    <tr><td><code>230107</code></td><td>动力区</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1983–2005</td><td><code>230110</code> 香坊区</td></tr>
    <tr><td><code>230121</code></td><td>呼兰县</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1983–2003</td><td><code>230109</code> 松北区；<code>230111</code> 呼兰区</td></tr>
    <tr><td><code>230122</code></td><td>阿城县</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1983–1986</td><td><code>239002</code> 阿城市</td></tr>
    <tr><td><code>230181</code></td><td>阿城市</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1990–2005</td><td><code>230104</code> 道外区；<code>230112</code> 阿城区</td></tr>
    <tr><td><code>230182</code></td><td>双城市</td><td>停用</td><td>黑龙江省 · 哈尔滨市</td><td>1996–2013</td><td><code>230113</code> 双城区</td></tr>
    <tr><td><code>230207</code></td><td>华安区</td><td>更名</td><td>黑龙江省 · 齐齐哈尔市</td><td>1983</td><td>代码未变，现名 碾子山区</td></tr>
    <tr><td><code>230208</code></td><td>梅里斯区</td><td>更名</td><td>黑龙江省 · 齐齐哈尔市</td><td>1983–1987</td><td>代码未变，现名 梅里斯达斡尔族区</td></tr>
    <tr><td><code>230222</code></td><td>讷河县</td><td>停用</td><td>黑龙江省 · 齐齐哈尔市</td><td>1984–1991</td><td><code>230281</code> 讷河市</td></tr>
    <tr><td><code>230226</code></td><td>杜尔伯特蒙古族自治县</td><td>停用</td><td>黑龙江省 · 齐齐哈尔市</td><td>1984–1991</td><td><code>230624</code> 杜尔伯特蒙古族自治县</td></tr>
    <tr><td><code>230228</code></td><td>林甸县</td><td>停用</td><td>黑龙江省 · 齐齐哈尔市</td><td>1984–1991</td><td><code>230623</code> 林甸县</td></tr>
    <tr><td><code>230322</code></td><td>虎林县</td><td>停用</td><td>黑龙江省 · 鸡西市</td><td>1993–1995</td><td><code>230381</code> 虎林市</td></tr>
    <tr><td><code>230504</code></td><td>岭西区</td><td>停用</td><td>黑龙江省 · 双鸭山市</td><td>1983–1986</td><td><code>230503</code> 岭东区</td></tr>
    <tr><td><code>230702</code></td><td>伊春区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230717</code> 伊美区</td></tr>
    <tr><td><code>230703</code></td><td>南岔区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230726</code> 南岔县</td></tr>
    <tr><td><code>230704</code></td><td>友好区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230719</code> 友好区</td></tr>
    <tr><td><code>230705</code></td><td>西林区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230751</code> 金林区</td></tr>
    <tr><td><code>230706</code></td><td>翠峦区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230718</code> 乌翠区</td></tr>
    <tr><td><code>230707</code></td><td>新青区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230724</code> 丰林县</td></tr>
    <tr><td><code>230708</code></td><td>美溪区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230717</code> 伊美区</td></tr>
    <tr><td><code>230709</code></td><td>大丰区</td><td>更名</td><td>黑龙江省 · 伊春市</td><td>1983</td><td>代码未变，现名 大丰区</td></tr>
    <tr><td><code>230709</code></td><td>金山屯区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1984–2018</td><td><code>230751</code> 金林区</td></tr>
    <tr><td><code>230710</code></td><td>五营区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230724</code> 丰林县</td></tr>
    <tr><td><code>230711</code></td><td>乌敏河区</td><td>更名</td><td>黑龙江省 · 伊春市</td><td>1983</td><td>代码未变，现名 乌敏河区</td></tr>
    <tr><td><code>230711</code></td><td>乌马河区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1984–2018</td><td><code>230717</code> 伊美区；<code>230718</code> 乌翠区</td></tr>
    <tr><td><code>230712</code></td><td>东风区</td><td>更名</td><td>黑龙江省 · 伊春市</td><td>1983</td><td>代码未变，现名 东风区</td></tr>
    <tr><td><code>230712</code></td><td>汤旺河区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1984–2018</td><td><code>230723</code> 汤旺县</td></tr>
    <tr><td><code>230713</code></td><td>带岭区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230725</code> 大箐山县</td></tr>
    <tr><td><code>230714</code></td><td>乌伊岭区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230723</code> 汤旺县</td></tr>
    <tr><td><code>230715</code></td><td>红星区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230724</code> 丰林县</td></tr>
    <tr><td><code>230716</code></td><td>上甘岭区</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1983–2018</td><td><code>230719</code> 友好区</td></tr>
    <tr><td><code>230721</code></td><td>铁力县</td><td>停用</td><td>黑龙江省 · 伊春市</td><td>1981–1987</td><td><code>239005</code> 铁力市</td></tr>
    <tr><td><code>230802</code></td><td>永红区</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1983–2005</td><td><code>230811</code> 郊区</td></tr>
    <tr><td><code>230821</code></td><td>富锦县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1987</td><td><code>239004</code> 富锦市</td></tr>
    <tr><td><code>230823</code></td><td>依兰县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1990</td><td><code>230123</code> 依兰县</td></tr>
    <tr><td><code>230825</code></td><td>集贤县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1986</td><td><code>230521</code> 集贤县</td></tr>
    <tr><td><code>230827</code></td><td>宝清县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1990</td><td><code>230523</code> 宝清县</td></tr>
    <tr><td><code>230829</code></td><td>绥滨县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1986</td><td><code>230422</code> 绥滨县</td></tr>
    <tr><td><code>230830</code></td><td>萝北县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1986</td><td><code>230421</code> 萝北县</td></tr>
    <tr><td><code>230831</code></td><td>同江县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1986</td><td><code>239003</code> 同江市</td></tr>
    <tr><td><code>230832</code></td><td>饶河县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1992</td><td><code>230524</code> 饶河县</td></tr>
    <tr><td><code>230833</code></td><td>抚远县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–2015</td><td><code>230883</code> 抚远市</td></tr>
    <tr><td><code>230834</code></td><td>友谊县</td><td>停用</td><td>黑龙江省 · 佳木斯市</td><td>1984–1990</td><td><code>230522</code> 友谊县</td></tr>
    <tr><td><code>231011</code></td><td>郊区</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1996</td><td><code>231002</code> 东安区；<code>231003</code> 阳明区；<code>231004</code> 爱民区；<code>231005</code> 西安区</td></tr>
    <tr><td><code>231019</code></td><td>镜泊湖市</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1986</td><td><code>231021</code> 宁安县</td></tr>
    <tr><td><code>231020</code></td><td>绥芬河市</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1985</td><td><code>239001</code> 绥芬河市</td></tr>
    <tr><td><code>231021</code></td><td>宁安县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1992</td><td><code>231019</code> 镜泊湖市；<code>231084</code> 宁安市</td></tr>
    <tr><td><code>231022</code></td><td>海林县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1991</td><td><code>231083</code> 海林市</td></tr>
    <tr><td><code>231023</code></td><td>穆棱县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1994</td><td><code>231085</code> 穆棱市</td></tr>
    <tr><td><code>231024</code></td><td>东宁县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–2014</td><td><code>231086</code> 东宁市</td></tr>
    <tr><td><code>231026</code></td><td>密山县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1987</td><td><code>239006</code> 密山市</td></tr>
    <tr><td><code>231027</code></td><td>虎林县</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1983–1992</td><td><code>230322</code> 虎林县</td></tr>
    <tr><td><code>231082</code></td><td>密山市</td><td>停用</td><td>黑龙江省 · 牡丹江市</td><td>1990–1991</td><td><code>230382</code> 密山市</td></tr>
    <tr><td><code>231121</code></td><td>嫩江县</td><td>停用</td><td>黑龙江省 · 黑河市</td><td>1993–2018</td><td><code>231183</code> 嫩江市</td></tr>
    <tr><td><code>231122</code></td><td>德都县</td><td>停用</td><td>黑龙江省 · 黑河市</td><td>1993–1995</td><td><code>231182</code> 五大连池市</td></tr>
    <tr><td><code>232100</code></td><td>松花江地区</td><td>停用</td><td>黑龙江省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232101</code></td><td>双城市</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1988–1995</td><td><code>230182</code> 双城市</td></tr>
    <tr><td><code>232102</code></td><td>尚志市</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1988–1995</td><td><code>230183</code> 尚志市</td></tr>
    <tr><td><code>232103</code></td><td>五常市</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1993–1995</td><td><code>230184</code> 五常市</td></tr>
    <tr><td><code>232121</code></td><td>阿城县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1982</td><td><code>230122</code> 阿城县</td></tr>
    <tr><td><code>232122</code></td><td>宾县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1990</td><td><code>230125</code> 宾县</td></tr>
    <tr><td><code>232123</code></td><td>呼兰县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1982</td><td><code>230121</code> 呼兰县</td></tr>
    <tr><td><code>232124</code></td><td>双城县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1987</td><td><code>232101</code> 双城市</td></tr>
    <tr><td><code>232125</code></td><td>五常县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1992</td><td><code>232103</code> 五常市</td></tr>
    <tr><td><code>232126</code></td><td>巴彦县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1995</td><td><code>230126</code> 巴彦县</td></tr>
    <tr><td><code>232127</code></td><td>木兰县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1995</td><td><code>230127</code> 木兰县</td></tr>
    <tr><td><code>232128</code></td><td>通河县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1995</td><td><code>230128</code> 通河县</td></tr>
    <tr><td><code>232129</code></td><td>尚志县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1987</td><td><code>232102</code> 尚志市</td></tr>
    <tr><td><code>232130</code></td><td>方正县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1990</td><td><code>230124</code> 方正县</td></tr>
    <tr><td><code>232131</code></td><td>延寿县</td><td>停用</td><td>黑龙江省 · 松花江地区</td><td>1981–1995</td><td><code>230129</code> 延寿县</td></tr>
    <tr><td><code>232200</code></td><td>嫩江地区</td><td>停用</td><td>黑龙江省</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232221</code></td><td>龙江县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230221</code> 龙江县</td></tr>
    <tr><td><code>232222</code></td><td>讷河县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230222</code> 讷河县</td></tr>
    <tr><td><code>232223</code></td><td>依安县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230223</code> 依安县</td></tr>
    <tr><td><code>232224</code></td><td>泰来县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230224</code> 泰来县</td></tr>
    <tr><td><code>232225</code></td><td>甘南县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230225</code> 甘南县</td></tr>
    <tr><td><code>232226</code></td><td>杜尔伯特蒙古族自治县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230226</code> 杜尔伯特蒙古族自治县</td></tr>
    <tr><td><code>232227</code></td><td>富裕县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230227</code> 富裕县</td></tr>
    <tr><td><code>232228</code></td><td>林甸县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230228</code> 林甸县</td></tr>
    <tr><td><code>232229</code></td><td>克山县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230229</code> 克山县</td></tr>
    <tr><td><code>232230</code></td><td>克东县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230230</code> 克东县</td></tr>
    <tr><td><code>232231</code></td><td>拜泉县</td><td>停用</td><td>黑龙江省 · 嫩江地区</td><td>1981–1983</td><td><code>230231</code> 拜泉县</td></tr>
    <tr><td><code>232300</code></td><td>绥化地区</td><td>停用</td><td>黑龙江省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232301</code></td><td>绥化市</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1982–1998</td><td><code>231202</code> 北林区</td></tr>
    <tr><td><code>232302</code></td><td>安达市</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1984–1998</td><td><code>231281</code> 安达市</td></tr>
    <tr><td><code>232303</code></td><td>肇东市</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1986–1998</td><td><code>231282</code> 肇东市</td></tr>
    <tr><td><code>232304</code></td><td>海伦市</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1989–1998</td><td><code>231283</code> 海伦市</td></tr>
    <tr><td><code>232321</code></td><td>海伦县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1988</td><td><code>232304</code> 海伦市</td></tr>
    <tr><td><code>232322</code></td><td>肇东县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1985</td><td><code>232303</code> 肇东市</td></tr>
    <tr><td><code>232323</code></td><td>绥化县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981</td><td><code>232301</code> 绥化市</td></tr>
    <tr><td><code>232324</code></td><td>望奎县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231221</code> 望奎县</td></tr>
    <tr><td><code>232325</code></td><td>兰西县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231222</code> 兰西县</td></tr>
    <tr><td><code>232326</code></td><td>青冈县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231223</code> 青冈县</td></tr>
    <tr><td><code>232327</code></td><td>安达县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1983</td><td><code>232302</code> 安达市</td></tr>
    <tr><td><code>232328</code></td><td>肇源县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1991</td><td><code>230622</code> 肇源县</td></tr>
    <tr><td><code>232329</code></td><td>肇州县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1991</td><td><code>230621</code> 肇州县</td></tr>
    <tr><td><code>232330</code></td><td>庆安县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231224</code> 庆安县</td></tr>
    <tr><td><code>232331</code></td><td>明水县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231225</code> 明水县</td></tr>
    <tr><td><code>232332</code></td><td>绥棱县</td><td>停用</td><td>黑龙江省 · 绥化地区</td><td>1981–1998</td><td><code>231226</code> 绥棱县</td></tr>
    <tr><td><code>232400</code></td><td>合江地区</td><td>停用</td><td>黑龙江省</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232401</code></td><td>佳木斯市</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1982</td><td><code>230802</code> 永红区；<code>230803</code> 向阳区；<code>230804</code> 前进区；<code>230805</code> 东风区；<code>230811</code> 郊区</td></tr>
    <tr><td><code>232402</code></td><td>七台河市</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1982</td><td><code>230900</code> 七台河市</td></tr>
    <tr><td><code>232421</code></td><td>富锦县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230821</code> 富锦县</td></tr>
    <tr><td><code>232422</code></td><td>桦南县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>232401</code> 佳木斯市；<code>230822</code> 桦南县</td></tr>
    <tr><td><code>232423</code></td><td>依兰县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>232401</code> 佳木斯市；<code>230823</code> 依兰县</td></tr>
    <tr><td><code>232424</code></td><td>勃利县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1982</td><td><code>230921</code> 勃利县</td></tr>
    <tr><td><code>232425</code></td><td>集贤县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230825</code> 集贤县；<code>230834</code> 友谊县</td></tr>
    <tr><td><code>232426</code></td><td>桦川县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>232401</code> 佳木斯市；<code>230826</code> 桦川县</td></tr>
    <tr><td><code>232427</code></td><td>宝清县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230900</code> 七台河市；<code>230827</code> 宝清县</td></tr>
    <tr><td><code>232428</code></td><td>汤原县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230828</code> 汤原县</td></tr>
    <tr><td><code>232429</code></td><td>绥滨县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230829</code> 绥滨县</td></tr>
    <tr><td><code>232430</code></td><td>萝北县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230830</code> 萝北县</td></tr>
    <tr><td><code>232431</code></td><td>同江县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230831</code> 同江县</td></tr>
    <tr><td><code>232432</code></td><td>饶河县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230832</code> 饶河县</td></tr>
    <tr><td><code>232433</code></td><td>抚远县</td><td>停用</td><td>黑龙江省 · 合江地区</td><td>1981–1983</td><td><code>230833</code> 抚远县</td></tr>
    <tr><td><code>232500</code></td><td>牡丹江地区</td><td>停用</td><td>黑龙江省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232501</code></td><td>牡丹江市</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231002</code> 东安区；<code>231003</code> 阳明区；<code>231004</code> 爱民区；<code>231005</code> 西安区；<code>231011</code> 郊区</td></tr>
    <tr><td><code>232502</code></td><td>绥芬河市</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231020</code> 绥芬河市</td></tr>
    <tr><td><code>232521</code></td><td>宁安县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231021</code> 宁安县</td></tr>
    <tr><td><code>232522</code></td><td>海林县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231022</code> 海林县</td></tr>
    <tr><td><code>232523</code></td><td>穆棱县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231023</code> 穆棱县</td></tr>
    <tr><td><code>232524</code></td><td>东宁县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231024</code> 东宁县</td></tr>
    <tr><td><code>232525</code></td><td>林口县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231025</code> 林口县</td></tr>
    <tr><td><code>232526</code></td><td>鸡东县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>230321</code> 鸡东县</td></tr>
    <tr><td><code>232527</code></td><td>密山县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231026</code> 密山县</td></tr>
    <tr><td><code>232528</code></td><td>虎林县</td><td>停用</td><td>黑龙江省 · 牡丹江地区</td><td>1981–1982</td><td><code>231027</code> 虎林县</td></tr>
    <tr><td><code>232600</code></td><td>黑河地区</td><td>停用</td><td>黑龙江省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>232601</code></td><td>黑河市</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1992</td><td><code>231102</code> 爱辉区</td></tr>
    <tr><td><code>232602</code></td><td>北安市</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1982–1992</td><td><code>231181</code> 北安市</td></tr>
    <tr><td><code>232603</code></td><td>五大连池市</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1983–1992</td><td><code>231182</code> 五大连池市</td></tr>
    <tr><td><code>232621</code></td><td>北安县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981</td><td><code>232602</code> 北安市；<code>232627</code> 通北县</td></tr>
    <tr><td><code>232622</code></td><td>嫩江县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1992</td><td><code>231121</code> 嫩江县</td></tr>
    <tr><td><code>232623</code></td><td>德都县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1992</td><td><code>232603</code> 五大连池市；<code>231122</code> 德都县</td></tr>
    <tr><td><code>232624</code></td><td>爱辉县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1982</td><td><code>232601</code> 黑河市</td></tr>
    <tr><td><code>232625</code></td><td>逊克县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1992</td><td><code>231123</code> 逊克县</td></tr>
    <tr><td><code>232626</code></td><td>孙吴县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1981–1992</td><td><code>231124</code> 孙吴县</td></tr>
    <tr><td><code>232627</code></td><td>通北县</td><td>停用</td><td>黑龙江省 · 黑河地区</td><td>1982</td><td><code>232602</code> 北安市</td></tr>
    <tr><td><code>232723</code></td><td>漠河县</td><td>停用</td><td>黑龙江省 · 大兴安岭地区</td><td>1981–2017</td><td><code>232701</code> 漠河市</td></tr>
    <tr><td><code>239001</code></td><td>绥芬河市</td><td>停用</td><td>黑龙江省</td><td>1986–1989</td><td><code>231081</code> 绥芬河市</td></tr>
    <tr><td><code>239002</code></td><td>阿城市</td><td>停用</td><td>黑龙江省</td><td>1987–1989</td><td><code>230181</code> 阿城市</td></tr>
    <tr><td><code>239003</code></td><td>同江市</td><td>停用</td><td>黑龙江省</td><td>1987–1989</td><td><code>230881</code> 同江市</td></tr>
    <tr><td><code>239004</code></td><td>富锦市</td><td>停用</td><td>黑龙江省</td><td>1988–1989</td><td><code>230882</code> 富锦市</td></tr>
    <tr><td><code>239005</code></td><td>铁力市</td><td>停用</td><td>黑龙江省</td><td>1988–1989</td><td><code>230781</code> 铁力市</td></tr>
    <tr><td><code>239006</code></td><td>密山市</td><td>停用</td><td>黑龙江省</td><td>1988–1989</td><td><code>231082</code> 密山市</td></tr>
    <tr><td><code>310102</code></td><td>南市区</td><td>停用</td><td>上海市</td><td>1981–1999</td><td><code>310115</code> 浦东新区；<code>310101</code> 黄浦区</td></tr>
    <tr><td><code>310103</code></td><td>卢湾区</td><td>停用</td><td>上海市</td><td>1981–2010</td><td><code>310101</code> 黄浦区</td></tr>
    <tr><td><code>310108</code></td><td>闸北区</td><td>停用</td><td>上海市</td><td>1981–2014</td><td><code>310106</code> 静安区</td></tr>
    <tr><td><code>310111</code></td><td>吴淞区</td><td>停用</td><td>上海市</td><td>1981–1987</td><td><code>310113</code> 宝山区</td></tr>
    <tr><td><code>310119</code></td><td>南汇区</td><td>停用</td><td>上海市</td><td>2001–2008</td><td><code>310115</code> 浦东新区</td></tr>
    <tr><td><code>310221</code></td><td>上海县</td><td>停用</td><td>上海市</td><td>1981–1991</td><td><code>310104</code> 徐汇区；<code>310105</code> 长宁区；<code>310112</code> 闵行区；<code>310115</code> 浦东新区</td></tr>
    <tr><td><code>310222</code></td><td>嘉定县</td><td>停用</td><td>上海市</td><td>1981–1991</td><td><code>310107</code> 普陀区；<code>310114</code> 嘉定区</td></tr>
    <tr><td><code>310223</code></td><td>宝山县</td><td>停用</td><td>上海市</td><td>1981–1987</td><td><code>310109</code> 虹口区；<code>310110</code> 杨浦区；<code>310113</code> 宝山区</td></tr>
    <tr><td><code>310224</code></td><td>川沙县</td><td>停用</td><td>上海市</td><td>1981–1991</td><td><code>310101</code> 黄浦区；<code>310115</code> 浦东新区</td></tr>
    <tr><td><code>310225</code></td><td>南汇县</td><td>停用</td><td>上海市</td><td>1981–2000</td><td><code>310119</code> 南汇区</td></tr>
    <tr><td><code>310226</code></td><td>奉贤县</td><td>停用</td><td>上海市</td><td>1981–2000</td><td><code>310120</code> 奉贤区</td></tr>
    <tr><td><code>310227</code></td><td>松江县</td><td>停用</td><td>上海市</td><td>1981–1997</td><td><code>310117</code> 松江区</td></tr>
    <tr><td><code>310228</code></td><td>金山县</td><td>停用</td><td>上海市</td><td>1981–1996</td><td><code>310116</code> 金山区</td></tr>
    <tr><td><code>310229</code></td><td>青浦县</td><td>停用</td><td>上海市</td><td>1981–1998</td><td><code>310118</code> 青浦区</td></tr>
    <tr><td><code>310230</code></td><td>崇明县</td><td>停用</td><td>上海市</td><td>1981–2015</td><td><code>310151</code> 崇明区</td></tr>
    <tr><td><code>320103</code></td><td>白下区</td><td>停用</td><td>江苏省 · 南京市</td><td>1983–2012</td><td><code>320104</code> 秦淮区</td></tr>
    <tr><td><code>320107</code></td><td>下关区</td><td>停用</td><td>江苏省 · 南京市</td><td>1983–2012</td><td><code>320106</code> 鼓楼区</td></tr>
    <tr><td><code>320112</code></td><td>大厂区</td><td>停用</td><td>江苏省 · 南京市</td><td>1983–2001</td><td><code>320116</code> 六合区</td></tr>
    <tr><td><code>320121</code></td><td>江宁县</td><td>停用</td><td>江苏省 · 南京市</td><td>1981–1999</td><td><code>320115</code> 江宁区</td></tr>
    <tr><td><code>320122</code></td><td>江浦县</td><td>停用</td><td>江苏省 · 南京市</td><td>1981–2001</td><td><code>320111</code> 浦口区</td></tr>
    <tr><td><code>320123</code></td><td>六合县</td><td>停用</td><td>江苏省 · 南京市</td><td>1981–2001</td><td><code>320116</code> 六合区</td></tr>
    <tr><td><code>320124</code></td><td>溧水县</td><td>停用</td><td>江苏省 · 南京市</td><td>1983–2012</td><td><code>320117</code> 溧水区</td></tr>
    <tr><td><code>320125</code></td><td>高淳县</td><td>停用</td><td>江苏省 · 南京市</td><td>1983–2012</td><td><code>320118</code> 高淳区</td></tr>
    <tr><td><code>320202</code></td><td>崇安区</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–2014</td><td><code>320213</code> 梁溪区</td></tr>
    <tr><td><code>320203</code></td><td>南长区</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–2014</td><td><code>320213</code> 梁溪区</td></tr>
    <tr><td><code>320204</code></td><td>北塘区</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–2014</td><td><code>320213</code> 梁溪区</td></tr>
    <tr><td><code>320211</code></td><td>郊区</td><td>更名</td><td>江苏省 · 无锡市</td><td>1983–1999</td><td>代码未变，现名 滨湖区</td></tr>
    <tr><td><code>320212</code></td><td>马山区</td><td>停用</td><td>江苏省 · 无锡市</td><td>1987–1999</td><td><code>320211</code> 滨湖区</td></tr>
    <tr><td><code>320221</code></td><td>江阴县</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–1986</td><td><code>329005</code> 江阴市</td></tr>
    <tr><td><code>320222</code></td><td>无锡县</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–1994</td><td><code>320283</code> 锡山市</td></tr>
    <tr><td><code>320223</code></td><td>宜兴县</td><td>停用</td><td>江苏省 · 无锡市</td><td>1983–1987</td><td><code>329011</code> 宜兴市</td></tr>
    <tr><td><code>320283</code></td><td>锡山市</td><td>停用</td><td>江苏省 · 无锡市</td><td>1995–1999</td><td><code>320205</code> 锡山区；<code>320206</code> 惠山区；<code>320211</code> 滨湖区</td></tr>
    <tr><td><code>320304</code></td><td>矿区</td><td>更名</td><td>江苏省 · 徐州市</td><td>1983–1994</td><td>代码未变，现名 矿区</td></tr>
    <tr><td><code>320304</code></td><td>九里区</td><td>停用</td><td>江苏省 · 徐州市</td><td>1995–2009</td><td><code>320302</code> 鼓楼区；<code>320311</code> 泉山区；<code>320312</code> 铜山区</td></tr>
    <tr><td><code>320311</code></td><td>郊区</td><td>更名</td><td>江苏省 · 徐州市</td><td>1983–1992</td><td>代码未变，现名 泉山区</td></tr>
    <tr><td><code>320323</code></td><td>铜山县</td><td>停用</td><td>江苏省 · 徐州市</td><td>1983–2009</td><td><code>320302</code> 鼓楼区；<code>320312</code> 铜山区</td></tr>
    <tr><td><code>320325</code></td><td>邳县</td><td>停用</td><td>江苏省 · 徐州市</td><td>1983–1991</td><td><code>320382</code> 邳州市</td></tr>
    <tr><td><code>320326</code></td><td>新沂县</td><td>停用</td><td>江苏省 · 徐州市</td><td>1983–1989</td><td><code>320381</code> 新沂市</td></tr>
    <tr><td><code>320403</code></td><td>广化区</td><td>停用</td><td>江苏省 · 常州市</td><td>1983–1985</td><td><code>320402</code> 天宁区；<code>320404</code> 钟楼区</td></tr>
    <tr><td><code>320405</code></td><td>戚墅堰区</td><td>停用</td><td>江苏省 · 常州市</td><td>1983–2014</td><td><code>320412</code> 武进区</td></tr>
    <tr><td><code>320411</code></td><td>郊区</td><td>更名</td><td>江苏省 · 常州市</td><td>1983–2001</td><td>代码未变，现名 新北区</td></tr>
    <tr><td><code>320421</code></td><td>武进县</td><td>停用</td><td>江苏省 · 常州市</td><td>1983–1994</td><td><code>320483</code> 武进市</td></tr>
    <tr><td><code>320422</code></td><td>金坛县</td><td>停用</td><td>江苏省 · 常州市</td><td>1983–1992</td><td><code>320482</code> 金坛市</td></tr>
    <tr><td><code>320423</code></td><td>溧阳县</td><td>停用</td><td>江苏省 · 常州市</td><td>1983–1989</td><td><code>320481</code> 溧阳市</td></tr>
    <tr><td><code>320482</code></td><td>金坛市</td><td>停用</td><td>江苏省 · 常州市</td><td>1993–2014</td><td><code>320413</code> 金坛区</td></tr>
    <tr><td><code>320483</code></td><td>武进市</td><td>停用</td><td>江苏省 · 常州市</td><td>1995–2001</td><td><code>320411</code> 新北区；<code>320412</code> 武进区</td></tr>
    <tr><td><code>320502</code></td><td>沧浪区</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–2011</td><td><code>320508</code> 姑苏区</td></tr>
    <tr><td><code>320503</code></td><td>平江区</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–2011</td><td><code>320508</code> 姑苏区</td></tr>
    <tr><td><code>320504</code></td><td>金阊区</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–2011</td><td><code>320508</code> 姑苏区</td></tr>
    <tr><td><code>320511</code></td><td>郊区</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1999</td><td><code>320505</code> 虎丘区</td></tr>
    <tr><td><code>320520</code></td><td>常熟市</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1985</td><td><code>329003</code> 常熟市</td></tr>
    <tr><td><code>320521</code></td><td>沙洲县</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1985</td><td><code>329004</code> 张家港市</td></tr>
    <tr><td><code>320522</code></td><td>太仓县</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1992</td><td><code>320585</code> 太仓市</td></tr>
    <tr><td><code>320523</code></td><td>昆山县</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1988</td><td><code>329012</code> 昆山市</td></tr>
    <tr><td><code>320524</code></td><td>吴县</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1994</td><td><code>320586</code> 吴县市</td></tr>
    <tr><td><code>320525</code></td><td>吴江县</td><td>停用</td><td>江苏省 · 苏州市</td><td>1983–1991</td><td><code>320584</code> 吴江市</td></tr>
    <tr><td><code>320584</code></td><td>吴江市</td><td>停用</td><td>江苏省 · 苏州市</td><td>1992–2011</td><td><code>320509</code> 吴江区</td></tr>
    <tr><td><code>320586</code></td><td>吴县市</td><td>停用</td><td>江苏省 · 苏州市</td><td>1995–1999</td><td><code>320506</code> 吴中区；<code>320507</code> 相城区</td></tr>
    <tr><td><code>320602</code></td><td>城区</td><td>更名</td><td>江苏省 · 南通市</td><td>1983–1990</td><td>代码未变，现名 城区</td></tr>
    <tr><td><code>320602</code></td><td>崇川区</td><td>停用</td><td>江苏省 · 南通市</td><td>1991–2019</td><td><code>320613</code> 崇川区</td></tr>
    <tr><td><code>320611</code></td><td>郊区</td><td>更名</td><td>江苏省 · 南通市</td><td>1983–1990</td><td>代码未变，现名 郊区</td></tr>
    <tr><td><code>320611</code></td><td>港闸区</td><td>停用</td><td>江苏省 · 南通市</td><td>1991–2019</td><td><code>320613</code> 崇川区</td></tr>
    <tr><td><code>320621</code></td><td>海安县</td><td>停用</td><td>江苏省 · 南通市</td><td>1983–2017</td><td><code>320685</code> 海安市</td></tr>
    <tr><td><code>320622</code></td><td>如皋县</td><td>停用</td><td>江苏省 · 南通市</td><td>1983–1990</td><td><code>320682</code> 如皋市</td></tr>
    <tr><td><code>320624</code></td><td>南通县</td><td>停用</td><td>江苏省 · 南通市</td><td>1983–1992</td><td><code>320683</code> 通州市</td></tr>
    <tr><td><code>320625</code></td><td>海门县</td><td>停用</td><td>江苏省 · 南通市</td><td>1983–1993</td><td><code>320684</code> 海门市</td></tr>
    <tr><td><code>320626</code></td><td>启东县</td><td>停用</td><td>江苏省 · 南通市</td><td>1983–1988</td><td><code>329013</code> 启东市</td></tr>
    <tr><td><code>320683</code></td><td>通州市</td><td>停用</td><td>江苏省 · 南通市</td><td>1993–2008</td><td><code>320612</code> 通州区</td></tr>
    <tr><td><code>320684</code></td><td>海门市</td><td>停用</td><td>江苏省 · 南通市</td><td>1994–2019</td><td><code>320614</code> 海门区</td></tr>
    <tr><td><code>320702</code></td><td>新海区</td><td>停用</td><td>江苏省 · 连云港市</td><td>1983–1985</td><td><code>320705</code> 新浦区；<code>320706</code> 海州区</td></tr>
    <tr><td><code>320704</code></td><td>云台区</td><td>停用</td><td>江苏省 · 连云港市</td><td>1983–2000</td><td><code>320703</code> 连云区；<code>320705</code> 新浦区</td></tr>
    <tr><td><code>320705</code></td><td>新浦区</td><td>停用</td><td>江苏省 · 连云港市</td><td>1986–2013</td><td><code>320703</code> 连云区；<code>320706</code> 海州区</td></tr>
    <tr><td><code>320721</code></td><td>赣榆县</td><td>停用</td><td>江苏省 · 连云港市</td><td>1983–2013</td><td><code>320707</code> 赣榆区</td></tr>
    <tr><td><code>320800</code></td><td>淮阴市</td><td>更名</td><td>江苏省</td><td>1983–1999</td><td>代码未变，现名 淮安市</td></tr>
    <tr><td><code>320802</code></td><td>清河区</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 清河区</td></tr>
    <tr><td><code>320802</code></td><td>清河区</td><td>停用</td><td>江苏省 · 淮安市</td><td>2000–2015</td><td><code>320812</code> 清江浦区</td></tr>
    <tr><td><code>320803</code></td><td>楚州区</td><td>更名</td><td>江苏省 · 淮安市</td><td>2000–2010</td><td>代码未变，现名 淮安区</td></tr>
    <tr><td><code>320811</code></td><td>清浦区</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 清浦区</td></tr>
    <tr><td><code>320811</code></td><td>清浦区</td><td>停用</td><td>江苏省 · 淮安市</td><td>2000–2015</td><td><code>320812</code> 清江浦区</td></tr>
    <tr><td><code>320821</code></td><td>淮阴县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td><code>320804</code> 淮阴区</td></tr>
    <tr><td><code>320822</code></td><td>灌南县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1995</td><td><code>320724</code> 灌南县</td></tr>
    <tr><td><code>320823</code></td><td>沭阳县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1995</td><td><code>321322</code> 沭阳县</td></tr>
    <tr><td><code>320824</code></td><td>宿迁县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1986</td><td><code>329006</code> 宿迁市</td></tr>
    <tr><td><code>320825</code></td><td>泗阳县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1995</td><td><code>321323</code> 泗阳县</td></tr>
    <tr><td><code>320826</code></td><td>涟水县</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 涟水县</td></tr>
    <tr><td><code>320827</code></td><td>泗洪县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1995</td><td><code>321324</code> 泗洪县</td></tr>
    <tr><td><code>320828</code></td><td>淮安县</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1983–1986</td><td><code>329010</code> 淮安市</td></tr>
    <tr><td><code>320829</code></td><td>洪泽县</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 洪泽县</td></tr>
    <tr><td><code>320829</code></td><td>洪泽县</td><td>停用</td><td>江苏省 · 淮安市</td><td>2000–2015</td><td><code>320813</code> 洪泽区</td></tr>
    <tr><td><code>320830</code></td><td>盱眙县</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 盱眙县</td></tr>
    <tr><td><code>320831</code></td><td>金湖县</td><td>更名</td><td>江苏省 · 淮阴市</td><td>1983–1999</td><td>代码未变，现名 金湖县</td></tr>
    <tr><td><code>320881</code></td><td>宿迁市</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1990–1995</td><td><code>321302</code> 宿城区；<code>321321</code> 宿豫县</td></tr>
    <tr><td><code>320882</code></td><td>淮安市</td><td>停用</td><td>江苏省 · 淮阴市</td><td>1990–1999</td><td><code>320803</code> 淮安区</td></tr>
    <tr><td><code>320902</code></td><td>城区</td><td>更名</td><td>江苏省 · 盐城市</td><td>1983–2002</td><td>代码未变，现名 亭湖区</td></tr>
    <tr><td><code>320911</code></td><td>郊区</td><td>停用</td><td>江苏省 · 盐城市</td><td>1983–1995</td><td><code>320902</code> 亭湖区；<code>320928</code> 盐都县</td></tr>
    <tr><td><code>320926</code></td><td>大丰县</td><td>停用</td><td>江苏省 · 盐城市</td><td>1983–1995</td><td><code>320982</code> 大丰市</td></tr>
    <tr><td><code>320927</code></td><td>东台县</td><td>停用</td><td>江苏省 · 盐城市</td><td>1983–1986</td><td><code>329008</code> 东台市</td></tr>
    <tr><td><code>320928</code></td><td>盐都县</td><td>停用</td><td>江苏省 · 盐城市</td><td>1996–2002</td><td><code>320902</code> 亭湖区；<code>320903</code> 盐都区</td></tr>
    <tr><td><code>320982</code></td><td>大丰市</td><td>停用</td><td>江苏省 · 盐城市</td><td>1996–2014</td><td><code>320904</code> 大丰区</td></tr>
    <tr><td><code>321011</code></td><td>郊区</td><td>更名</td><td>江苏省 · 扬州市</td><td>1983–2001</td><td>代码未变，现名 郊区</td></tr>
    <tr><td><code>321011</code></td><td>维扬区</td><td>停用</td><td>江苏省 · 扬州市</td><td>2002–2010</td><td><code>321003</code> 邗江区</td></tr>
    <tr><td><code>321020</code></td><td>泰州市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1985</td><td><code>329001</code> 泰州市</td></tr>
    <tr><td><code>321021</code></td><td>兴化县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1986</td><td><code>329009</code> 兴化市</td></tr>
    <tr><td><code>321022</code></td><td>高邮县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1990</td><td><code>321084</code> 高邮市</td></tr>
    <tr><td><code>321024</code></td><td>靖江县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1992</td><td><code>321086</code> 靖江市</td></tr>
    <tr><td><code>321025</code></td><td>泰兴县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1991</td><td><code>321085</code> 泰兴市</td></tr>
    <tr><td><code>321026</code></td><td>江都县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1993</td><td><code>321088</code> 江都市</td></tr>
    <tr><td><code>321027</code></td><td>邗江县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1999</td><td><code>321003</code> 邗江区</td></tr>
    <tr><td><code>321028</code></td><td>泰县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1993</td><td><code>321020</code> 泰州市；<code>321087</code> 姜堰市</td></tr>
    <tr><td><code>321029</code></td><td>仪征县</td><td>停用</td><td>江苏省 · 扬州市</td><td>1983–1985</td><td><code>329002</code> 仪征市</td></tr>
    <tr><td><code>321082</code></td><td>泰州市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1990–1995</td><td><code>321202</code> 海陵区</td></tr>
    <tr><td><code>321083</code></td><td>兴化市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1990–1995</td><td><code>321281</code> 兴化市</td></tr>
    <tr><td><code>321085</code></td><td>泰兴市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1992–1995</td><td><code>321283</code> 泰兴市</td></tr>
    <tr><td><code>321086</code></td><td>靖江市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1993–1995</td><td><code>321282</code> 靖江市</td></tr>
    <tr><td><code>321087</code></td><td>姜堰市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1994–1995</td><td><code>321284</code> 姜堰市</td></tr>
    <tr><td><code>321088</code></td><td>江都市</td><td>停用</td><td>江苏省 · 扬州市</td><td>1994–2010</td><td><code>321012</code> 江都区</td></tr>
    <tr><td><code>321102</code></td><td>城区</td><td>更名</td><td>江苏省 · 镇江市</td><td>1983</td><td>代码未变，现名 京口区</td></tr>
    <tr><td><code>321111</code></td><td>郊区</td><td>更名</td><td>江苏省 · 镇江市</td><td>1983</td><td>代码未变，现名 润州区</td></tr>
    <tr><td><code>321121</code></td><td>丹徒县</td><td>停用</td><td>江苏省 · 镇江市</td><td>1983–2001</td><td><code>321112</code> 丹徒区</td></tr>
    <tr><td><code>321122</code></td><td>丹阳县</td><td>停用</td><td>江苏省 · 镇江市</td><td>1983–1986</td><td><code>329007</code> 丹阳市</td></tr>
    <tr><td><code>321123</code></td><td>句容县</td><td>停用</td><td>江苏省 · 镇江市</td><td>1983–1994</td><td><code>321183</code> 句容市</td></tr>
    <tr><td><code>321124</code></td><td>扬中县</td><td>停用</td><td>江苏省 · 镇江市</td><td>1983–1993</td><td><code>321182</code> 扬中市</td></tr>
    <tr><td><code>321284</code></td><td>姜堰市</td><td>停用</td><td>江苏省 · 泰州市</td><td>1996–2011</td><td><code>321204</code> 姜堰区</td></tr>
    <tr><td><code>321321</code></td><td>宿豫县</td><td>停用</td><td>江苏省 · 宿迁市</td><td>1996–2003</td><td><code>321302</code> 宿城区；<code>321311</code> 宿豫区</td></tr>
    <tr><td><code>322100</code></td><td>徐州地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322121</code></td><td>丰县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320321</code> 丰县</td></tr>
    <tr><td><code>322122</code></td><td>沛县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320322</code> 沛县</td></tr>
    <tr><td><code>322123</code></td><td>铜山县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320323</code> 铜山县</td></tr>
    <tr><td><code>322124</code></td><td>睢宁县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320324</code> 睢宁县</td></tr>
    <tr><td><code>322125</code></td><td>邳县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320325</code> 邳县</td></tr>
    <tr><td><code>322126</code></td><td>新沂县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320326</code> 新沂县</td></tr>
    <tr><td><code>322127</code></td><td>东海县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320722</code> 东海县</td></tr>
    <tr><td><code>322128</code></td><td>赣榆县</td><td>停用</td><td>江苏省 · 徐州地区</td><td>1981–1982</td><td><code>320721</code> 赣榆县</td></tr>
    <tr><td><code>322200</code></td><td>淮阴地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322201</code></td><td>清江市</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320802</code> 清河区；<code>320811</code> 清浦区</td></tr>
    <tr><td><code>322221</code></td><td>淮阴县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320811</code> 清浦区；<code>320821</code> 淮阴县</td></tr>
    <tr><td><code>322222</code></td><td>灌云县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320704</code> 云台区；<code>320723</code> 灌云县</td></tr>
    <tr><td><code>322223</code></td><td>灌南县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320822</code> 灌南县</td></tr>
    <tr><td><code>322224</code></td><td>沭阳县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320823</code> 沭阳县</td></tr>
    <tr><td><code>322225</code></td><td>宿迁县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320824</code> 宿迁县</td></tr>
    <tr><td><code>322226</code></td><td>泗阳县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320825</code> 泗阳县</td></tr>
    <tr><td><code>322227</code></td><td>涟水县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320826</code> 涟水县</td></tr>
    <tr><td><code>322228</code></td><td>泗洪县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320827</code> 泗洪县</td></tr>
    <tr><td><code>322229</code></td><td>淮安县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320811</code> 清浦区；<code>320828</code> 淮安县</td></tr>
    <tr><td><code>322230</code></td><td>洪泽县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320829</code> 洪泽县</td></tr>
    <tr><td><code>322231</code></td><td>盱眙县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320830</code> 盱眙县</td></tr>
    <tr><td><code>322232</code></td><td>金湖县</td><td>停用</td><td>江苏省 · 淮阴地区</td><td>1981–1982</td><td><code>320831</code> 金湖县</td></tr>
    <tr><td><code>322300</code></td><td>盐城地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322321</code></td><td>响水县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320921</code> 响水县</td></tr>
    <tr><td><code>322322</code></td><td>滨海县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320922</code> 滨海县</td></tr>
    <tr><td><code>322323</code></td><td>阜宁县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320923</code> 阜宁县</td></tr>
    <tr><td><code>322324</code></td><td>射阳县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320924</code> 射阳县</td></tr>
    <tr><td><code>322325</code></td><td>建湖县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320925</code> 建湖县</td></tr>
    <tr><td><code>322326</code></td><td>盐城县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320902</code> 亭湖区；<code>320911</code> 郊区</td></tr>
    <tr><td><code>322327</code></td><td>大丰县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320926</code> 大丰县</td></tr>
    <tr><td><code>322328</code></td><td>东台县</td><td>停用</td><td>江苏省 · 盐城地区</td><td>1981–1982</td><td><code>320927</code> 东台县</td></tr>
    <tr><td><code>322400</code></td><td>扬州地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322401</code></td><td>扬州市</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321002</code> 广陵区；<code>321011</code> 郊区</td></tr>
    <tr><td><code>322402</code></td><td>泰州市</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321020</code> 泰州市</td></tr>
    <tr><td><code>322421</code></td><td>兴化县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321021</code> 兴化县</td></tr>
    <tr><td><code>322422</code></td><td>高邮县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321022</code> 高邮县</td></tr>
    <tr><td><code>322423</code></td><td>宝应县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321023</code> 宝应县</td></tr>
    <tr><td><code>322424</code></td><td>靖江县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321024</code> 靖江县</td></tr>
    <tr><td><code>322425</code></td><td>泰兴县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321025</code> 泰兴县</td></tr>
    <tr><td><code>322426</code></td><td>江都县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321026</code> 江都县</td></tr>
    <tr><td><code>322427</code></td><td>邗江县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321011</code> 郊区；<code>321027</code> 邗江县</td></tr>
    <tr><td><code>322428</code></td><td>泰县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321028</code> 泰县</td></tr>
    <tr><td><code>322429</code></td><td>仪征县</td><td>停用</td><td>江苏省 · 扬州地区</td><td>1981–1982</td><td><code>321029</code> 仪征县</td></tr>
    <tr><td><code>322500</code></td><td>南通地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322521</code></td><td>海安县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320621</code> 海安县</td></tr>
    <tr><td><code>322522</code></td><td>如皋县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320622</code> 如皋县</td></tr>
    <tr><td><code>322523</code></td><td>如东县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320623</code> 如东县</td></tr>
    <tr><td><code>322524</code></td><td>南通县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320624</code> 南通县</td></tr>
    <tr><td><code>322525</code></td><td>海门县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320625</code> 海门县</td></tr>
    <tr><td><code>322526</code></td><td>启东县</td><td>停用</td><td>江苏省 · 南通地区</td><td>1981–1982</td><td><code>320626</code> 启东县</td></tr>
    <tr><td><code>322600</code></td><td>镇江地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322601</code></td><td>镇江市</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>321102</code> 京口区；<code>321111</code> 润州区</td></tr>
    <tr><td><code>322621</code></td><td>丹徒县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>321111</code> 润州区；<code>321121</code> 丹徒县</td></tr>
    <tr><td><code>322622</code></td><td>武进县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320421</code> 武进县</td></tr>
    <tr><td><code>322623</code></td><td>丹阳县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>321122</code> 丹阳县</td></tr>
    <tr><td><code>322624</code></td><td>句容县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>321123</code> 句容县</td></tr>
    <tr><td><code>322625</code></td><td>金坛县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320422</code> 金坛县</td></tr>
    <tr><td><code>322626</code></td><td>溧水县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320124</code> 溧水县</td></tr>
    <tr><td><code>322627</code></td><td>高淳县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320125</code> 高淳县</td></tr>
    <tr><td><code>322628</code></td><td>溧阳县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320423</code> 溧阳县</td></tr>
    <tr><td><code>322629</code></td><td>宜兴县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>320223</code> 宜兴县</td></tr>
    <tr><td><code>322630</code></td><td>扬中县</td><td>停用</td><td>江苏省 · 镇江地区</td><td>1981–1982</td><td><code>321124</code> 扬中县</td></tr>
    <tr><td><code>322700</code></td><td>苏州地区</td><td>停用</td><td>江苏省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>322721</code></td><td>江阴县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320221</code> 江阴县</td></tr>
    <tr><td><code>322722</code></td><td>无锡县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320222</code> 无锡县</td></tr>
    <tr><td><code>322723</code></td><td>沙洲县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320521</code> 沙洲县</td></tr>
    <tr><td><code>322724</code></td><td>常熟县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320520</code> 常熟市</td></tr>
    <tr><td><code>322725</code></td><td>太仓县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320522</code> 太仓县</td></tr>
    <tr><td><code>322726</code></td><td>昆山县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320523</code> 昆山县</td></tr>
    <tr><td><code>322727</code></td><td>吴县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320524</code> 吴县</td></tr>
    <tr><td><code>322728</code></td><td>吴江县</td><td>停用</td><td>江苏省 · 苏州地区</td><td>1981–1982</td><td><code>320525</code> 吴江县</td></tr>
    <tr><td><code>329001</code></td><td>泰州市</td><td>停用</td><td>江苏省</td><td>1986–1989</td><td><code>321082</code> 泰州市</td></tr>
    <tr><td><code>329002</code></td><td>仪征市</td><td>停用</td><td>江苏省</td><td>1986–1989</td><td><code>321081</code> 仪征市</td></tr>
    <tr><td><code>329003</code></td><td>常熟市</td><td>停用</td><td>江苏省</td><td>1986–1989</td><td><code>320581</code> 常熟市</td></tr>
    <tr><td><code>329004</code></td><td>张家港市</td><td>停用</td><td>江苏省</td><td>1986–1989</td><td><code>320582</code> 张家港市</td></tr>
    <tr><td><code>329005</code></td><td>江阴市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>320281</code> 江阴市</td></tr>
    <tr><td><code>329006</code></td><td>宿迁市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>320881</code> 宿迁市</td></tr>
    <tr><td><code>329007</code></td><td>丹阳市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>321181</code> 丹阳市</td></tr>
    <tr><td><code>329008</code></td><td>东台市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>320981</code> 东台市</td></tr>
    <tr><td><code>329009</code></td><td>兴化市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>321083</code> 兴化市</td></tr>
    <tr><td><code>329010</code></td><td>淮安市</td><td>停用</td><td>江苏省</td><td>1987–1989</td><td><code>320882</code> 淮安市</td></tr>
    <tr><td><code>329011</code></td><td>宜兴市</td><td>停用</td><td>江苏省</td><td>1988–1989</td><td><code>320282</code> 宜兴市</td></tr>
    <tr><td><code>329012</code></td><td>昆山市</td><td>停用</td><td>江苏省</td><td>1989</td><td><code>320583</code> 昆山市</td></tr>
    <tr><td><code>329013</code></td><td>启东市</td><td>停用</td><td>江苏省</td><td>1989</td><td><code>320681</code> 启东市</td></tr>
    <tr><td><code>330103</code></td><td>下城区</td><td>停用</td><td>浙江省 · 杭州市</td><td>1983–2020</td><td><code>330105</code> 拱墅区</td></tr>
    <tr><td><code>330104</code></td><td>江干区</td><td>停用</td><td>浙江省 · 杭州市</td><td>1983–2020</td><td><code>330102</code> 上城区；<code>330102</code> 上城区；<code>330114</code> 钱塘区</td></tr>
    <tr><td><code>330107</code></td><td>半山区</td><td>停用</td><td>浙江省 · 杭州市</td><td>1983–1989</td><td><code>330105</code> 拱墅区</td></tr>
    <tr><td><code>330121</code></td><td>萧山县</td><td>停用</td><td>浙江省 · 杭州市</td><td>1981–1986</td><td><code>339005</code> 萧山市</td></tr>
    <tr><td><code>330123</code></td><td>富阳县</td><td>停用</td><td>浙江省 · 杭州市</td><td>1981–1993</td><td><code>330183</code> 富阳市</td></tr>
    <tr><td><code>330124</code></td><td>临安县</td><td>停用</td><td>浙江省 · 杭州市</td><td>1981–1995</td><td><code>330185</code> 临安市</td></tr>
    <tr><td><code>330125</code></td><td>余杭县</td><td>停用</td><td>浙江省 · 杭州市</td><td>1981–1993</td><td><code>330184</code> 余杭市</td></tr>
    <tr><td><code>330126</code></td><td>建德县</td><td>停用</td><td>浙江省 · 杭州市</td><td>1981–1991</td><td><code>330182</code> 建德市</td></tr>
    <tr><td><code>330181</code></td><td>萧山市</td><td>停用</td><td>浙江省 · 杭州市</td><td>1990–2000</td><td><code>330109</code> 萧山区</td></tr>
    <tr><td><code>330183</code></td><td>富阳市</td><td>停用</td><td>浙江省 · 杭州市</td><td>1994–2013</td><td><code>330111</code> 富阳区</td></tr>
    <tr><td><code>330184</code></td><td>余杭市</td><td>停用</td><td>浙江省 · 杭州市</td><td>1994–2000</td><td><code>330110</code> 余杭区</td></tr>
    <tr><td><code>330185</code></td><td>临安市</td><td>停用</td><td>浙江省 · 杭州市</td><td>1996–2016</td><td><code>330112</code> 临安区</td></tr>
    <tr><td><code>330202</code></td><td>镇明区</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–1984</td><td><code>330203</code> 海曙区</td></tr>
    <tr><td><code>330204</code></td><td>江东区</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–2015</td><td><code>330212</code> 鄞州区</td></tr>
    <tr><td><code>330206</code></td><td>滨海区</td><td>更名</td><td>浙江省 · 宁波市</td><td>1985–1986</td><td>代码未变，现名 北仑区</td></tr>
    <tr><td><code>330219</code></td><td>余姚市</td><td>停用</td><td>浙江省 · 宁波市</td><td>1985</td><td><code>339001</code> 余姚市</td></tr>
    <tr><td><code>330221</code></td><td>镇海县</td><td>停用</td><td>浙江省 · 宁波市</td><td>1982–1984</td><td><code>330206</code> 北仑区；<code>330211</code> 镇海区</td></tr>
    <tr><td><code>330222</code></td><td>慈溪县</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–1987</td><td><code>339009</code> 慈溪市</td></tr>
    <tr><td><code>330223</code></td><td>余姚县</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–1984</td><td><code>330219</code> 余姚市</td></tr>
    <tr><td><code>330224</code></td><td>奉化县</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–1987</td><td><code>339010</code> 奉化市</td></tr>
    <tr><td><code>330227</code></td><td>鄞县</td><td>停用</td><td>浙江省 · 宁波市</td><td>1983–2001</td><td><code>330212</code> 鄞州区</td></tr>
    <tr><td><code>330283</code></td><td>奉化市</td><td>停用</td><td>浙江省 · 宁波市</td><td>1990–2015</td><td><code>330213</code> 奉化区</td></tr>
    <tr><td><code>330302</code></td><td>城区</td><td>更名</td><td>浙江省 · 温州市</td><td>1983</td><td>代码未变，现名 鹿城区</td></tr>
    <tr><td><code>330321</code></td><td>瓯海县</td><td>停用</td><td>浙江省 · 温州市</td><td>1981–1991</td><td><code>330303</code> 龙湾区；<code>330304</code> 瓯海区</td></tr>
    <tr><td><code>330322</code></td><td>洞头县</td><td>停用</td><td>浙江省 · 温州市</td><td>1981–2014</td><td><code>330305</code> 洞头区</td></tr>
    <tr><td><code>330323</code></td><td>乐清县</td><td>停用</td><td>浙江省 · 温州市</td><td>1981–1992</td><td><code>330382</code> 乐清市</td></tr>
    <tr><td><code>330325</code></td><td>瑞安县</td><td>停用</td><td>浙江省 · 温州市</td><td>1981–1986</td><td><code>339004</code> 瑞安市</td></tr>
    <tr><td><code>330402</code></td><td>城区</td><td>更名</td><td>浙江省 · 嘉兴市</td><td>1983–1992</td><td>代码未变，现名 南湖区</td></tr>
    <tr><td><code>330402</code></td><td>秀城区</td><td>更名</td><td>浙江省 · 嘉兴市</td><td>1993–2004</td><td>代码未变，现名 南湖区</td></tr>
    <tr><td><code>330411</code></td><td>郊区</td><td>更名</td><td>浙江省 · 嘉兴市</td><td>1983–1998</td><td>代码未变，现名 秀洲区</td></tr>
    <tr><td><code>330422</code></td><td>平湖县</td><td>停用</td><td>浙江省 · 嘉兴市</td><td>1983–1990</td><td><code>330482</code> 平湖市</td></tr>
    <tr><td><code>330423</code></td><td>海宁县</td><td>停用</td><td>浙江省 · 嘉兴市</td><td>1983–1985</td><td><code>339002</code> 海宁市</td></tr>
    <tr><td><code>330425</code></td><td>桐乡县</td><td>停用</td><td>浙江省 · 嘉兴市</td><td>1983–1992</td><td><code>330483</code> 桐乡市</td></tr>
    <tr><td><code>330502</code></td><td>城区</td><td>更名</td><td>浙江省 · 湖州市</td><td>1983–1987</td><td>代码未变，现名 吴兴区</td></tr>
    <tr><td><code>330511</code></td><td>郊区</td><td>停用</td><td>浙江省 · 湖州市</td><td>1983–1987</td><td><code>330500</code> 湖州市</td></tr>
    <tr><td><code>330621</code></td><td>绍兴县</td><td>停用</td><td>浙江省 · 绍兴市</td><td>1983–2012</td><td><code>330602</code> 越城区；<code>330602</code> 越城区；<code>330603</code> 柯桥区</td></tr>
    <tr><td><code>330622</code></td><td>上虞县</td><td>停用</td><td>浙江省 · 绍兴市</td><td>1983–1991</td><td><code>330682</code> 上虞市</td></tr>
    <tr><td><code>330623</code></td><td>嵊县</td><td>停用</td><td>浙江省 · 绍兴市</td><td>1983–1994</td><td><code>330683</code> 嵊州市</td></tr>
    <tr><td><code>330625</code></td><td>诸暨县</td><td>停用</td><td>浙江省 · 绍兴市</td><td>1983–1988</td><td><code>339011</code> 诸暨市</td></tr>
    <tr><td><code>330682</code></td><td>上虞市</td><td>停用</td><td>浙江省 · 绍兴市</td><td>1992–2012</td><td><code>330604</code> 上虞区</td></tr>
    <tr><td><code>330719</code></td><td>兰溪市</td><td>停用</td><td>浙江省 · 金华市</td><td>1985</td><td><code>339003</code> 兰溪市</td></tr>
    <tr><td><code>330721</code></td><td>金华县</td><td>停用</td><td>浙江省 · 金华市</td><td>1985–1999</td><td><code>330702</code> 婺城区；<code>330703</code> 金东区</td></tr>
    <tr><td><code>330722</code></td><td>永康县</td><td>停用</td><td>浙江省 · 金华市</td><td>1985–1991</td><td><code>330784</code> 永康市</td></tr>
    <tr><td><code>330724</code></td><td>东阳县</td><td>停用</td><td>浙江省 · 金华市</td><td>1985–1987</td><td><code>339008</code> 东阳市</td></tr>
    <tr><td><code>330725</code></td><td>义乌县</td><td>停用</td><td>浙江省 · 金华市</td><td>1985–1987</td><td><code>339007</code> 义乌市</td></tr>
    <tr><td><code>330821</code></td><td>衢县</td><td>停用</td><td>浙江省 · 衢州市</td><td>1985–2000</td><td><code>330802</code> 柯城区；<code>330803</code> 衢江区</td></tr>
    <tr><td><code>330823</code></td><td>江山县</td><td>停用</td><td>浙江省 · 衢州市</td><td>1985–1986</td><td><code>339006</code> 江山市</td></tr>
    <tr><td><code>331021</code></td><td>玉环县</td><td>停用</td><td>浙江省 · 台州市</td><td>1994–2016</td><td><code>331083</code> 玉环市</td></tr>
    <tr><td><code>332100</code></td><td>嘉兴地区</td><td>停用</td><td>浙江省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332101</code></td><td>湖州市</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330502</code> 吴兴区；<code>330511</code> 郊区</td></tr>
    <tr><td><code>332102</code></td><td>嘉兴市</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330402</code> 南湖区；<code>330411</code> 秀洲区</td></tr>
    <tr><td><code>332121</code></td><td>嘉善县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330421</code> 嘉善县</td></tr>
    <tr><td><code>332122</code></td><td>平湖县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330422</code> 平湖县</td></tr>
    <tr><td><code>332123</code></td><td>海宁县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330423</code> 海宁县</td></tr>
    <tr><td><code>332124</code></td><td>海盐县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330424</code> 海盐县</td></tr>
    <tr><td><code>332125</code></td><td>桐乡县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330425</code> 桐乡县</td></tr>
    <tr><td><code>332126</code></td><td>德清县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330521</code> 德清县</td></tr>
    <tr><td><code>332127</code></td><td>长兴县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330522</code> 长兴县</td></tr>
    <tr><td><code>332128</code></td><td>安吉县</td><td>停用</td><td>浙江省 · 嘉兴地区</td><td>1981–1982</td><td><code>330523</code> 安吉县</td></tr>
    <tr><td><code>332200</code></td><td>宁波地区</td><td>停用</td><td>浙江省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332221</code></td><td>慈溪县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330222</code> 慈溪县</td></tr>
    <tr><td><code>332222</code></td><td>余姚县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330223</code> 余姚县</td></tr>
    <tr><td><code>332223</code></td><td>奉化县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330224</code> 奉化县</td></tr>
    <tr><td><code>332224</code></td><td>象山县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330225</code> 象山县</td></tr>
    <tr><td><code>332225</code></td><td>宁海县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330226</code> 宁海县</td></tr>
    <tr><td><code>332226</code></td><td>鄞县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981–1982</td><td><code>330203</code> 海曙区；<code>330204</code> 江东区；<code>330227</code> 鄞县</td></tr>
    <tr><td><code>332227</code></td><td>镇海县</td><td>停用</td><td>浙江省 · 宁波地区</td><td>1981</td><td><code>330221</code> 镇海县</td></tr>
    <tr><td><code>332300</code></td><td>绍兴地区</td><td>停用</td><td>浙江省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332301</code></td><td>绍兴市</td><td>停用</td><td>浙江省 · 绍兴地区</td><td>1981–1982</td><td><code>330602</code> 越城区；<code>330621</code> 绍兴县</td></tr>
    <tr><td><code>332321</code></td><td>上虞县</td><td>停用</td><td>浙江省 · 绍兴地区</td><td>1981–1982</td><td><code>330622</code> 上虞县</td></tr>
    <tr><td><code>332322</code></td><td>嵊县</td><td>停用</td><td>浙江省 · 绍兴地区</td><td>1981–1982</td><td><code>330623</code> 嵊县</td></tr>
    <tr><td><code>332323</code></td><td>新昌县</td><td>停用</td><td>浙江省 · 绍兴地区</td><td>1981–1982</td><td><code>330624</code> 新昌县</td></tr>
    <tr><td><code>332324</code></td><td>诸暨县</td><td>停用</td><td>浙江省 · 绍兴地区</td><td>1981–1982</td><td><code>330625</code> 诸暨县</td></tr>
    <tr><td><code>332400</code></td><td>金华地区</td><td>停用</td><td>浙江省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332401</code></td><td>金华市</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>332430</code> 龙游县；<code>330702</code> 婺城区；<code>330721</code> 金华县</td></tr>
    <tr><td><code>332402</code></td><td>衢州市</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>332430</code> 龙游县；<code>330802</code> 柯城区；<code>330821</code> 衢县</td></tr>
    <tr><td><code>332421</code></td><td>兰溪县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330719</code> 兰溪市</td></tr>
    <tr><td><code>332422</code></td><td>永康县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330722</code> 永康县</td></tr>
    <tr><td><code>332423</code></td><td>武义县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330723</code> 武义县</td></tr>
    <tr><td><code>332424</code></td><td>东阳县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>332431</code> 磐安县；<code>330724</code> 东阳县</td></tr>
    <tr><td><code>332425</code></td><td>义乌县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330725</code> 义乌县</td></tr>
    <tr><td><code>332426</code></td><td>浦江县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330726</code> 浦江县</td></tr>
    <tr><td><code>332427</code></td><td>常山县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330822</code> 常山县</td></tr>
    <tr><td><code>332428</code></td><td>江山县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330823</code> 江山县</td></tr>
    <tr><td><code>332429</code></td><td>开化县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1981–1984</td><td><code>330824</code> 开化县</td></tr>
    <tr><td><code>332430</code></td><td>龙游县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1983–1984</td><td><code>330825</code> 龙游县</td></tr>
    <tr><td><code>332431</code></td><td>磐安县</td><td>停用</td><td>浙江省 · 金华地区</td><td>1983–1984</td><td><code>330727</code> 磐安县</td></tr>
    <tr><td><code>332500</code></td><td>丽水地区</td><td>停用</td><td>浙江省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332501</code></td><td>丽水市</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1986–1999</td><td><code>331102</code> 莲都区</td></tr>
    <tr><td><code>332502</code></td><td>龙泉市</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1990–1999</td><td><code>331181</code> 龙泉市</td></tr>
    <tr><td><code>332521</code></td><td>丽水县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1985</td><td><code>332501</code> 丽水市</td></tr>
    <tr><td><code>332522</code></td><td>青田县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1999</td><td><code>331121</code> 青田县</td></tr>
    <tr><td><code>332523</code></td><td>云和县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1999</td><td><code>332529</code> 景宁畲族自治县；<code>331125</code> 云和县</td></tr>
    <tr><td><code>332524</code></td><td>龙泉县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1989</td><td><code>332502</code> 龙泉市</td></tr>
    <tr><td><code>332525</code></td><td>庆元县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1999</td><td><code>331126</code> 庆元县</td></tr>
    <tr><td><code>332526</code></td><td>缙云县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1999</td><td><code>331122</code> 缙云县</td></tr>
    <tr><td><code>332527</code></td><td>遂昌县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1981–1999</td><td><code>332528</code> 松阳县；<code>331123</code> 遂昌县</td></tr>
    <tr><td><code>332528</code></td><td>松阳县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1982–1999</td><td><code>331124</code> 松阳县</td></tr>
    <tr><td><code>332529</code></td><td>景宁畲族自治县</td><td>停用</td><td>浙江省 · 丽水地区</td><td>1984–1999</td><td><code>331127</code> 景宁畲族自治县</td></tr>
    <tr><td><code>332600</code></td><td>台州地区</td><td>停用</td><td>浙江省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332601</code></td><td>椒江市</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331002</code> 椒江区</td></tr>
    <tr><td><code>332602</code></td><td>临海市</td><td>停用</td><td>浙江省 · 台州地区</td><td>1986–1993</td><td><code>331082</code> 临海市</td></tr>
    <tr><td><code>332603</code></td><td>黄岩市</td><td>停用</td><td>浙江省 · 台州地区</td><td>1989–1993</td><td><code>331003</code> 黄岩区；<code>331004</code> 路桥区</td></tr>
    <tr><td><code>332621</code></td><td>临海县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1985</td><td><code>332602</code> 临海市</td></tr>
    <tr><td><code>332622</code></td><td>黄岩县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1988</td><td><code>332603</code> 黄岩市</td></tr>
    <tr><td><code>332623</code></td><td>温岭县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331081</code> 温岭市</td></tr>
    <tr><td><code>332624</code></td><td>仙居县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331024</code> 仙居县</td></tr>
    <tr><td><code>332625</code></td><td>天台县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331023</code> 天台县</td></tr>
    <tr><td><code>332626</code></td><td>三门县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331022</code> 三门县</td></tr>
    <tr><td><code>332627</code></td><td>玉环县</td><td>停用</td><td>浙江省 · 台州地区</td><td>1981–1993</td><td><code>331021</code> 玉环县</td></tr>
    <tr><td><code>332700</code></td><td>舟山地区</td><td>停用</td><td>浙江省</td><td>1981–1986</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>332721</code></td><td>定海县</td><td>停用</td><td>浙江省 · 舟山地区</td><td>1981–1986</td><td><code>330902</code> 定海区</td></tr>
    <tr><td><code>332722</code></td><td>普陀县</td><td>停用</td><td>浙江省 · 舟山地区</td><td>1981–1986</td><td><code>330903</code> 普陀区</td></tr>
    <tr><td><code>332723</code></td><td>岱山县</td><td>停用</td><td>浙江省 · 舟山地区</td><td>1981–1986</td><td><code>330921</code> 岱山县</td></tr>
    <tr><td><code>332724</code></td><td>嵊泗县</td><td>停用</td><td>浙江省 · 舟山地区</td><td>1981–1986</td><td><code>330922</code> 嵊泗县</td></tr>
    <tr><td><code>339001</code></td><td>余姚市</td><td>停用</td><td>浙江省</td><td>1986–1989</td><td><code>330281</code> 余姚市</td></tr>
    <tr><td><code>339002</code></td><td>海宁市</td><td>停用</td><td>浙江省</td><td>1986–1989</td><td><code>330481</code> 海宁市</td></tr>
    <tr><td><code>339003</code></td><td>兰溪市</td><td>停用</td><td>浙江省</td><td>1986–1989</td><td><code>330781</code> 兰溪市</td></tr>
    <tr><td><code>339004</code></td><td>瑞安市</td><td>停用</td><td>浙江省</td><td>1987–1989</td><td><code>330381</code> 瑞安市</td></tr>
    <tr><td><code>339005</code></td><td>萧山市</td><td>停用</td><td>浙江省</td><td>1987–1989</td><td><code>330181</code> 萧山市</td></tr>
    <tr><td><code>339006</code></td><td>江山市</td><td>停用</td><td>浙江省</td><td>1987–1989</td><td><code>330881</code> 江山市</td></tr>
    <tr><td><code>339007</code></td><td>义乌市</td><td>停用</td><td>浙江省</td><td>1988–1989</td><td><code>330782</code> 义乌市</td></tr>
    <tr><td><code>339008</code></td><td>东阳市</td><td>停用</td><td>浙江省</td><td>1988–1989</td><td><code>330783</code> 东阳市</td></tr>
    <tr><td><code>339009</code></td><td>慈溪市</td><td>停用</td><td>浙江省</td><td>1988–1989</td><td><code>330282</code> 慈溪市</td></tr>
    <tr><td><code>339010</code></td><td>奉化市</td><td>停用</td><td>浙江省</td><td>1988–1989</td><td><code>330283</code> 奉化市</td></tr>
    <tr><td><code>339011</code></td><td>诸暨市</td><td>停用</td><td>浙江省</td><td>1989</td><td><code>330681</code> 诸暨市</td></tr>
    <tr><td><code>340102</code></td><td>东市区</td><td>更名</td><td>安徽省 · 合肥市</td><td>1983–2001</td><td>代码未变，现名 瑶海区</td></tr>
    <tr><td><code>340103</code></td><td>中市区</td><td>更名</td><td>安徽省 · 合肥市</td><td>1983–2001</td><td>代码未变，现名 庐阳区</td></tr>
    <tr><td><code>340104</code></td><td>西市区</td><td>更名</td><td>安徽省 · 合肥市</td><td>1983–2001</td><td>代码未变，现名 蜀山区</td></tr>
    <tr><td><code>340111</code></td><td>郊区</td><td>更名</td><td>安徽省 · 合肥市</td><td>1983–2001</td><td>代码未变，现名 包河区</td></tr>
    <tr><td><code>340203</code></td><td>马塘区</td><td>更名</td><td>安徽省 · 芜湖市</td><td>1983–2004</td><td>代码未变，现名 马塘区</td></tr>
    <tr><td><code>340203</code></td><td>弋江区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>2005–2019</td><td><code>340209</code> 弋江区</td></tr>
    <tr><td><code>340204</code></td><td>新芜区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–2004</td><td><code>340202</code> 镜湖区</td></tr>
    <tr><td><code>340205</code></td><td>裕溪口区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–1989</td><td><code>340207</code> 鸠江区</td></tr>
    <tr><td><code>340206</code></td><td>四褐山区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–1989</td><td><code>340207</code> 鸠江区</td></tr>
    <tr><td><code>340208</code></td><td>三山区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>2005–2019</td><td><code>340209</code> 弋江区</td></tr>
    <tr><td><code>340211</code></td><td>郊区</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–1989</td><td><code>340202</code> 镜湖区；<code>340203</code> 马塘区；<code>340204</code> 新芜区；<code>340207</code> 鸠江区</td></tr>
    <tr><td><code>340221</code></td><td>芜湖县</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1981–2019</td><td><code>340203</code> 马塘区；<code>340210</code> 湾沚区</td></tr>
    <tr><td><code>340222</code></td><td>繁昌县</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–2019</td><td><code>340208</code> 三山区；<code>340212</code> 繁昌区</td></tr>
    <tr><td><code>340224</code></td><td>青阳县</td><td>停用</td><td>安徽省 · 芜湖市</td><td>1983–1987</td><td><code>342923</code> 青阳县</td></tr>
    <tr><td><code>340225</code></td><td>无为县</td><td>停用</td><td>安徽省 · 芜湖市</td><td>2011–2018</td><td><code>340207</code> 鸠江区；<code>340281</code> 无为市</td></tr>
    <tr><td><code>340302</code></td><td>东市区</td><td>更名</td><td>安徽省 · 蚌埠市</td><td>1983–2003</td><td>代码未变，现名 龙子湖区</td></tr>
    <tr><td><code>340303</code></td><td>中市区</td><td>更名</td><td>安徽省 · 蚌埠市</td><td>1983–2003</td><td>代码未变，现名 蚌山区</td></tr>
    <tr><td><code>340304</code></td><td>西市区</td><td>更名</td><td>安徽省 · 蚌埠市</td><td>1983–2003</td><td>代码未变，现名 禹会区</td></tr>
    <tr><td><code>340311</code></td><td>郊区</td><td>更名</td><td>安徽省 · 蚌埠市</td><td>1983–2003</td><td>代码未变，现名 淮上区</td></tr>
    <tr><td><code>340502</code></td><td>金家庄区</td><td>停用</td><td>安徽省 · 马鞍山市</td><td>1983–2011</td><td><code>340503</code> 花山区</td></tr>
    <tr><td><code>340505</code></td><td>向山区</td><td>停用</td><td>安徽省 · 马鞍山市</td><td>1983–2000</td><td><code>340502</code> 金家庄区；<code>340503</code> 花山区；<code>340504</code> 雨山区</td></tr>
    <tr><td><code>340511</code></td><td>郊区</td><td>停用</td><td>安徽省 · 马鞍山市</td><td>1983</td><td><code>340505</code> 向山区</td></tr>
    <tr><td><code>340611</code></td><td>郊区</td><td>停用</td><td>安徽省 · 淮北市</td><td>1983</td><td><code>340602</code> 杜集区；<code>340603</code> 相山区；<code>340604</code> 烈山区</td></tr>
    <tr><td><code>340702</code></td><td>铜官山区</td><td>停用</td><td>安徽省 · 铜陵市</td><td>1983–2014</td><td><code>340705</code> 铜官区</td></tr>
    <tr><td><code>340703</code></td><td>狮子山区</td><td>停用</td><td>安徽省 · 铜陵市</td><td>1983–2014</td><td><code>340705</code> 铜官区</td></tr>
    <tr><td><code>340704</code></td><td>铜山区</td><td>停用</td><td>安徽省 · 铜陵市</td><td>1983–1986</td><td><code>340711</code> 郊区</td></tr>
    <tr><td><code>340721</code></td><td>铜陵县</td><td>停用</td><td>安徽省 · 铜陵市</td><td>1981–2014</td><td><code>340706</code> 义安区</td></tr>
    <tr><td><code>340811</code></td><td>郊区</td><td>更名</td><td>安徽省 · 安庆市</td><td>1983–2004</td><td>代码未变，现名 宜秀区</td></tr>
    <tr><td><code>340821</code></td><td>桐城县</td><td>停用</td><td>安徽省 · 安庆市</td><td>1988–1995</td><td><code>340881</code> 桐城市</td></tr>
    <tr><td><code>340823</code></td><td>枞阳县</td><td>停用</td><td>安徽省 · 安庆市</td><td>1988–2014</td><td><code>340722</code> 枞阳县</td></tr>
    <tr><td><code>340824</code></td><td>潜山县</td><td>停用</td><td>安徽省 · 安庆市</td><td>1988–2017</td><td><code>340882</code> 潜山市</td></tr>
    <tr><td><code>340901</code></td><td>黄山市</td><td>停用</td><td>安徽省</td><td>1983–1986</td><td><code>341003</code> 黄山区</td></tr>
    <tr><td><code>341121</code></td><td>天长县</td><td>停用</td><td>安徽省 · 滁州市</td><td>1992</td><td><code>341181</code> 天长市</td></tr>
    <tr><td><code>341127</code></td><td>嘉山县</td><td>停用</td><td>安徽省 · 滁州市</td><td>1992–1993</td><td><code>341182</code> 明光市</td></tr>
    <tr><td><code>341223</code></td><td>涡阳县</td><td>停用</td><td>安徽省 · 阜阳市</td><td>1996–1999</td><td><code>341621</code> 涡阳县</td></tr>
    <tr><td><code>341224</code></td><td>蒙城县</td><td>停用</td><td>安徽省 · 阜阳市</td><td>1996–1999</td><td><code>341622</code> 蒙城县</td></tr>
    <tr><td><code>341227</code></td><td>利辛县</td><td>停用</td><td>安徽省 · 阜阳市</td><td>1996–1999</td><td><code>341623</code> 利辛县</td></tr>
    <tr><td><code>341281</code></td><td>亳州市</td><td>停用</td><td>安徽省 · 阜阳市</td><td>1996–1999</td><td><code>341602</code> 谯城区</td></tr>
    <tr><td><code>341400</code></td><td>巢湖市</td><td>停用</td><td>安徽省</td><td>1999–2010</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>341402</code></td><td>居巢区</td><td>停用</td><td>安徽省 · 巢湖市</td><td>1999–2010</td><td><code>340181</code> 巢湖市</td></tr>
    <tr><td><code>341421</code></td><td>庐江县</td><td>停用</td><td>安徽省 · 巢湖市</td><td>1999–2010</td><td><code>340124</code> 庐江县</td></tr>
    <tr><td><code>341422</code></td><td>无为县</td><td>停用</td><td>安徽省 · 巢湖市</td><td>1999–2010</td><td><code>340225</code> 无为县</td></tr>
    <tr><td><code>341423</code></td><td>含山县</td><td>停用</td><td>安徽省 · 巢湖市</td><td>1999–2010</td><td><code>341402</code> 居巢区；<code>340522</code> 含山县</td></tr>
    <tr><td><code>341424</code></td><td>和县</td><td>停用</td><td>安徽省 · 巢湖市</td><td>1999–2010</td><td><code>340207</code> 鸠江区；<code>340523</code> 和县</td></tr>
    <tr><td><code>341521</code></td><td>寿县</td><td>停用</td><td>安徽省 · 六安市</td><td>1999–2014</td><td><code>340422</code> 寿县</td></tr>
    <tr><td><code>341822</code></td><td>广德县</td><td>停用</td><td>安徽省 · 宣城市</td><td>2000–2018</td><td><code>341882</code> 广德市</td></tr>
    <tr><td><code>342100</code></td><td>阜阳地区</td><td>停用</td><td>安徽省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342101</code></td><td>阜阳市</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341202</code> 颍州区；<code>341203</code> 颍东区；<code>341204</code> 颍泉区</td></tr>
    <tr><td><code>342102</code></td><td>亳州市</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1986–1995</td><td><code>341281</code> 亳州市</td></tr>
    <tr><td><code>342103</code></td><td>界首市</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1989–1995</td><td><code>341282</code> 界首市</td></tr>
    <tr><td><code>342121</code></td><td>阜阳县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1991</td><td><code>342101</code> 阜阳市</td></tr>
    <tr><td><code>342122</code></td><td>临泉县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341221</code> 临泉县</td></tr>
    <tr><td><code>342123</code></td><td>太和县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341222</code> 太和县</td></tr>
    <tr><td><code>342124</code></td><td>涡阳县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341223</code> 涡阳县</td></tr>
    <tr><td><code>342125</code></td><td>蒙城县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341224</code> 蒙城县</td></tr>
    <tr><td><code>342126</code></td><td>亳县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1985</td><td><code>342102</code> 亳州市</td></tr>
    <tr><td><code>342127</code></td><td>阜南县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341225</code> 阜南县</td></tr>
    <tr><td><code>342128</code></td><td>颍上县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341226</code> 颍上县</td></tr>
    <tr><td><code>342129</code></td><td>界首县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1988</td><td><code>342103</code> 界首市</td></tr>
    <tr><td><code>342130</code></td><td>利辛县</td><td>停用</td><td>安徽省 · 阜阳地区</td><td>1981–1995</td><td><code>341227</code> 利辛县</td></tr>
    <tr><td><code>342200</code></td><td>宿县地区</td><td>停用</td><td>安徽省</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342201</code></td><td>宿州市</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1997</td><td><code>341302</code> 埇桥区</td></tr>
    <tr><td><code>342221</code></td><td>砀山县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1997</td><td><code>341321</code> 砀山县</td></tr>
    <tr><td><code>342222</code></td><td>萧县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1997</td><td><code>341322</code> 萧县</td></tr>
    <tr><td><code>342223</code></td><td>宿县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1991</td><td><code>342201</code> 宿州市</td></tr>
    <tr><td><code>342224</code></td><td>灵璧县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1997</td><td><code>341323</code> 灵璧县</td></tr>
    <tr><td><code>342225</code></td><td>泗县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1997</td><td><code>341324</code> 泗县</td></tr>
    <tr><td><code>342226</code></td><td>怀远县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1982</td><td><code>340321</code> 怀远县</td></tr>
    <tr><td><code>342227</code></td><td>五河县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1982</td><td><code>340322</code> 五河县</td></tr>
    <tr><td><code>342228</code></td><td>固镇县</td><td>停用</td><td>安徽省 · 宿县地区</td><td>1981–1982</td><td><code>340323</code> 固镇县</td></tr>
    <tr><td><code>342300</code></td><td>滁县地区</td><td>停用</td><td>安徽省</td><td>1981–1991</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342301</code></td><td>滁州市</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1982–1991</td><td><code>341102</code> 琅琊区；<code>341103</code> 南谯区</td></tr>
    <tr><td><code>342321</code></td><td>天长县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341121</code> 天长县</td></tr>
    <tr><td><code>342322</code></td><td>来安县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341122</code> 来安县</td></tr>
    <tr><td><code>342323</code></td><td>滁县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981</td><td><code>342301</code> 滁州市</td></tr>
    <tr><td><code>342324</code></td><td>全椒县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341124</code> 全椒县</td></tr>
    <tr><td><code>342325</code></td><td>定远县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341125</code> 定远县</td></tr>
    <tr><td><code>342326</code></td><td>凤阳县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341126</code> 凤阳县</td></tr>
    <tr><td><code>342327</code></td><td>嘉山县</td><td>停用</td><td>安徽省 · 滁县地区</td><td>1981–1991</td><td><code>341127</code> 嘉山县</td></tr>
    <tr><td><code>342400</code></td><td>六安地区</td><td>停用</td><td>安徽省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342401</code></td><td>六安市</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341502</code> 金安区；<code>341503</code> 裕安区</td></tr>
    <tr><td><code>342421</code></td><td>六安县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1991</td><td><code>342401</code> 六安市</td></tr>
    <tr><td><code>342422</code></td><td>寿县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341521</code> 寿县</td></tr>
    <tr><td><code>342423</code></td><td>霍邱县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341522</code> 霍邱县</td></tr>
    <tr><td><code>342424</code></td><td>肥西县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1982</td><td><code>340123</code> 肥西县</td></tr>
    <tr><td><code>342425</code></td><td>舒城县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341523</code> 舒城县</td></tr>
    <tr><td><code>342426</code></td><td>金寨县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341524</code> 金寨县</td></tr>
    <tr><td><code>342427</code></td><td>霍山县</td><td>停用</td><td>安徽省 · 六安地区</td><td>1981–1998</td><td><code>341525</code> 霍山县</td></tr>
    <tr><td><code>342500</code></td><td>宣城地区</td><td>停用</td><td>安徽省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342501</code></td><td>宣州市</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1987–1999</td><td><code>341802</code> 宣州区</td></tr>
    <tr><td><code>342502</code></td><td>宁国市</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1997–1999</td><td><code>341881</code> 宁国市</td></tr>
    <tr><td><code>342521</code></td><td>宣城县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1986</td><td><code>342501</code> 宣州市</td></tr>
    <tr><td><code>342522</code></td><td>郎溪县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1999</td><td><code>341821</code> 郎溪县</td></tr>
    <tr><td><code>342523</code></td><td>广德县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1999</td><td><code>341822</code> 广德县</td></tr>
    <tr><td><code>342524</code></td><td>宁国县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1996</td><td><code>342502</code> 宁国市</td></tr>
    <tr><td><code>342525</code></td><td>当涂县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1982</td><td><code>340211</code> 郊区；<code>340521</code> 当涂县</td></tr>
    <tr><td><code>342526</code></td><td>繁昌县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1982</td><td><code>340222</code> 繁昌县</td></tr>
    <tr><td><code>342527</code></td><td>南陵县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1982</td><td><code>340223</code> 南陵县</td></tr>
    <tr><td><code>342528</code></td><td>青阳县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1982</td><td><code>340224</code> 青阳县</td></tr>
    <tr><td><code>342529</code></td><td>泾县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1981–1999</td><td><code>341823</code> 泾县</td></tr>
    <tr><td><code>342530</code></td><td>旌德县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1987–1999</td><td><code>341825</code> 旌德县</td></tr>
    <tr><td><code>342531</code></td><td>绩溪县</td><td>停用</td><td>安徽省 · 宣城地区</td><td>1987–1999</td><td><code>341824</code> 绩溪县</td></tr>
    <tr><td><code>342600</code></td><td>巢湖地区</td><td>停用</td><td>安徽省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342601</code></td><td>巢湖市</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1982–1998</td><td><code>341402</code> 居巢区</td></tr>
    <tr><td><code>342621</code></td><td>肥东县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1982</td><td><code>340122</code> 肥东县</td></tr>
    <tr><td><code>342622</code></td><td>庐江县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1998</td><td><code>341421</code> 庐江县</td></tr>
    <tr><td><code>342623</code></td><td>无为县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1998</td><td><code>341422</code> 无为县</td></tr>
    <tr><td><code>342624</code></td><td>巢县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1982</td><td><code>342601</code> 巢湖市；<code>342601</code> 巢湖市</td></tr>
    <tr><td><code>342625</code></td><td>含山县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1998</td><td><code>341423</code> 含山县</td></tr>
    <tr><td><code>342626</code></td><td>和县</td><td>停用</td><td>安徽省 · 巢湖地区</td><td>1981–1998</td><td><code>341424</code> 和县</td></tr>
    <tr><td><code>342700</code></td><td>徽州地区</td><td>停用</td><td>安徽省</td><td>1981–1986</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342701</code></td><td>屯溪市</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>341002</code> 屯溪区</td></tr>
    <tr><td><code>342721</code></td><td>绩溪县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>342531</code> 绩溪县</td></tr>
    <tr><td><code>342722</code></td><td>旌德县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>342530</code> 旌德县</td></tr>
    <tr><td><code>342723</code></td><td>歙县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>340901</code> 黄山市；<code>341002</code> 屯溪区；<code>341004</code> 徽州区；<code>341021</code> 歙县</td></tr>
    <tr><td><code>342724</code></td><td>休宁县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>341002</code> 屯溪区；<code>341022</code> 休宁县</td></tr>
    <tr><td><code>342725</code></td><td>黟县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>341023</code> 黟县</td></tr>
    <tr><td><code>342726</code></td><td>祁门县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>341024</code> 祁门县</td></tr>
    <tr><td><code>342727</code></td><td>太平县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1982</td><td><code>340901</code> 黄山市</td></tr>
    <tr><td><code>342728</code></td><td>石台县</td><td>停用</td><td>安徽省 · 徽州地区</td><td>1981–1986</td><td><code>340901</code> 黄山市；<code>342831</code> 石台县</td></tr>
    <tr><td><code>342800</code></td><td>安庆地区</td><td>停用</td><td>安徽省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342821</code></td><td>怀宁县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340822</code> 怀宁县</td></tr>
    <tr><td><code>342822</code></td><td>桐城县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340821</code> 桐城县</td></tr>
    <tr><td><code>342823</code></td><td>枞阳县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340823</code> 枞阳县</td></tr>
    <tr><td><code>342824</code></td><td>潜山县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340824</code> 潜山县</td></tr>
    <tr><td><code>342825</code></td><td>太湖县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340825</code> 太湖县</td></tr>
    <tr><td><code>342826</code></td><td>宿松县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340826</code> 宿松县</td></tr>
    <tr><td><code>342827</code></td><td>望江县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340827</code> 望江县</td></tr>
    <tr><td><code>342828</code></td><td>岳西县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>340828</code> 岳西县</td></tr>
    <tr><td><code>342829</code></td><td>东至县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>342921</code> 东至县</td></tr>
    <tr><td><code>342830</code></td><td>贵池县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1981–1987</td><td><code>342901</code> 贵池市</td></tr>
    <tr><td><code>342831</code></td><td>石台县</td><td>停用</td><td>安徽省 · 安庆地区</td><td>1987</td><td><code>342922</code> 石台县</td></tr>
    <tr><td><code>342900</code></td><td>池州地区</td><td>停用</td><td>安徽省</td><td>1988–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>342901</code></td><td>贵池市</td><td>停用</td><td>安徽省 · 池州地区</td><td>1988–1999</td><td><code>341702</code> 贵池区</td></tr>
    <tr><td><code>342921</code></td><td>东至县</td><td>停用</td><td>安徽省 · 池州地区</td><td>1988–1999</td><td><code>341721</code> 东至县</td></tr>
    <tr><td><code>342922</code></td><td>石台县</td><td>停用</td><td>安徽省 · 池州地区</td><td>1988–1999</td><td><code>341722</code> 石台县</td></tr>
    <tr><td><code>342923</code></td><td>青阳县</td><td>停用</td><td>安徽省 · 池州地区</td><td>1988–1999</td><td><code>341723</code> 青阳县</td></tr>
    <tr><td><code>350111</code></td><td>郊区</td><td>更名</td><td>福建省 · 福州市</td><td>1983–1994</td><td>代码未变，现名 晋安区</td></tr>
    <tr><td><code>350126</code></td><td>长乐县</td><td>停用</td><td>福建省 · 福州市</td><td>1983–1993</td><td><code>350182</code> 长乐市</td></tr>
    <tr><td><code>350127</code></td><td>福清县</td><td>停用</td><td>福建省 · 福州市</td><td>1983–1989</td><td><code>350181</code> 福清市</td></tr>
    <tr><td><code>350182</code></td><td>长乐市</td><td>停用</td><td>福建省 · 福州市</td><td>1994–2016</td><td><code>350112</code> 长乐区</td></tr>
    <tr><td><code>350202</code></td><td>鼓浪屿区</td><td>停用</td><td>福建省 · 厦门市</td><td>1983–2002</td><td><code>350203</code> 思明区</td></tr>
    <tr><td><code>350204</code></td><td>开元区</td><td>停用</td><td>福建省 · 厦门市</td><td>1983–2002</td><td><code>350206</code> 湖里区；<code>350203</code> 思明区</td></tr>
    <tr><td><code>350205</code></td><td>杏林区</td><td>更名</td><td>福建省 · 厦门市</td><td>1983–2002</td><td>代码未变，现名 海沧区</td></tr>
    <tr><td><code>350211</code></td><td>郊区</td><td>更名</td><td>福建省 · 厦门市</td><td>1983–1986</td><td>代码未变，现名 集美区</td></tr>
    <tr><td><code>350221</code></td><td>同安县</td><td>停用</td><td>福建省 · 厦门市</td><td>1981–1995</td><td><code>350212</code> 同安区</td></tr>
    <tr><td><code>350321</code></td><td>莆田县</td><td>停用</td><td>福建省 · 莆田市</td><td>1983–2001</td><td><code>350302</code> 城厢区；<code>350303</code> 涵江区；<code>350304</code> 荔城区；<code>350305</code> 秀屿区</td></tr>
    <tr><td><code>350402</code></td><td>梅列区</td><td>停用</td><td>福建省 · 三明市</td><td>1983–2020</td><td><code>350404</code> 三元区</td></tr>
    <tr><td><code>350403</code></td><td>三元区</td><td>停用</td><td>福建省 · 三明市</td><td>1983–2020</td><td><code>350404</code> 三元区</td></tr>
    <tr><td><code>350420</code></td><td>永安市</td><td>停用</td><td>福建省 · 三明市</td><td>1984–1985</td><td><code>359001</code> 永安市</td></tr>
    <tr><td><code>350422</code></td><td>永安县</td><td>停用</td><td>福建省 · 三明市</td><td>1983</td><td><code>350420</code> 永安市</td></tr>
    <tr><td><code>350427</code></td><td>沙县</td><td>停用</td><td>福建省 · 三明市</td><td>1983–2020</td><td><code>350405</code> 沙县区</td></tr>
    <tr><td><code>350522</code></td><td>晋江县</td><td>停用</td><td>福建省 · 泉州市</td><td>1985–1991</td><td><code>359002</code> 石狮市；<code>350582</code> 晋江市</td></tr>
    <tr><td><code>350523</code></td><td>南安县</td><td>停用</td><td>福建省 · 泉州市</td><td>1985–1992</td><td><code>350583</code> 南安市</td></tr>
    <tr><td><code>350621</code></td><td>龙海县</td><td>停用</td><td>福建省 · 漳州市</td><td>1985–1992</td><td><code>350681</code> 龙海市</td></tr>
    <tr><td><code>350625</code></td><td>长泰县</td><td>停用</td><td>福建省 · 漳州市</td><td>1985–2020</td><td><code>350605</code> 长泰区</td></tr>
    <tr><td><code>350681</code></td><td>龙海市</td><td>停用</td><td>福建省 · 漳州市</td><td>1993–2020</td><td><code>350603</code> 龙文区；<code>350604</code> 龙海区</td></tr>
    <tr><td><code>350784</code></td><td>建阳市</td><td>停用</td><td>福建省 · 南平市</td><td>1994–2013</td><td><code>350703</code> 建阳区</td></tr>
    <tr><td><code>350822</code></td><td>永定县</td><td>停用</td><td>福建省 · 龙岩市</td><td>1996–2013</td><td><code>350803</code> 永定区</td></tr>
    <tr><td><code>352100</code></td><td>建阳地区</td><td>更名</td><td>福建省</td><td>1981–1987</td><td>代码未变，现名 建阳地区</td></tr>
    <tr><td><code>352100</code></td><td>南平地区</td><td>停用</td><td>福建省</td><td>1988–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352101</code></td><td>南平市</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 南平市</td></tr>
    <tr><td><code>352101</code></td><td>南平市</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350702</code> 延平区</td></tr>
    <tr><td><code>352102</code></td><td>邵武市</td><td>更名</td><td>福建省 · 建阳地区</td><td>1983–1987</td><td>代码未变，现名 邵武市</td></tr>
    <tr><td><code>352102</code></td><td>邵武市</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350781</code> 邵武市</td></tr>
    <tr><td><code>352103</code></td><td>武夷山市</td><td>停用</td><td>福建省 · 南平地区</td><td>1989–1993</td><td><code>350782</code> 武夷山市</td></tr>
    <tr><td><code>352104</code></td><td>建瓯市</td><td>停用</td><td>福建省 · 南平地区</td><td>1992–1993</td><td><code>350783</code> 建瓯市</td></tr>
    <tr><td><code>352121</code></td><td>顺昌县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 顺昌县</td></tr>
    <tr><td><code>352121</code></td><td>顺昌县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350721</code> 顺昌县</td></tr>
    <tr><td><code>352122</code></td><td>建阳县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 建阳县</td></tr>
    <tr><td><code>352122</code></td><td>建阳县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350784</code> 建阳市</td></tr>
    <tr><td><code>352123</code></td><td>建瓯县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 建瓯县</td></tr>
    <tr><td><code>352123</code></td><td>建瓯县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1991</td><td><code>352104</code> 建瓯市</td></tr>
    <tr><td><code>352124</code></td><td>浦城县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 浦城县</td></tr>
    <tr><td><code>352124</code></td><td>浦城县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350722</code> 浦城县</td></tr>
    <tr><td><code>352125</code></td><td>邵武县</td><td>停用</td><td>福建省 · 建阳地区</td><td>1981–1982</td><td><code>352102</code> 邵武市</td></tr>
    <tr><td><code>352126</code></td><td>崇安县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 崇安县</td></tr>
    <tr><td><code>352126</code></td><td>崇安县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988</td><td><code>352103</code> 武夷山市</td></tr>
    <tr><td><code>352127</code></td><td>光泽县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 光泽县</td></tr>
    <tr><td><code>352127</code></td><td>光泽县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350723</code> 光泽县</td></tr>
    <tr><td><code>352128</code></td><td>松溪县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 松溪县</td></tr>
    <tr><td><code>352128</code></td><td>松溪县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350724</code> 松溪县</td></tr>
    <tr><td><code>352129</code></td><td>政和县</td><td>更名</td><td>福建省 · 建阳地区</td><td>1981–1987</td><td>代码未变，现名 政和县</td></tr>
    <tr><td><code>352129</code></td><td>政和县</td><td>停用</td><td>福建省 · 南平地区</td><td>1988–1993</td><td><code>350725</code> 政和县</td></tr>
    <tr><td><code>352200</code></td><td>宁德地区</td><td>停用</td><td>福建省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352201</code></td><td>宁德市</td><td>停用</td><td>福建省 · 宁德地区</td><td>1988–1998</td><td><code>350902</code> 蕉城区</td></tr>
    <tr><td><code>352202</code></td><td>福安市</td><td>停用</td><td>福建省 · 宁德地区</td><td>1989–1998</td><td><code>350981</code> 福安市</td></tr>
    <tr><td><code>352203</code></td><td>福鼎市</td><td>停用</td><td>福建省 · 宁德地区</td><td>1995–1998</td><td><code>350982</code> 福鼎市</td></tr>
    <tr><td><code>352221</code></td><td>宁德县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1987</td><td><code>352201</code> 宁德市</td></tr>
    <tr><td><code>352222</code></td><td>连江县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1982</td><td><code>350122</code> 连江县</td></tr>
    <tr><td><code>352223</code></td><td>罗源县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1982</td><td><code>350123</code> 罗源县</td></tr>
    <tr><td><code>352224</code></td><td>福鼎县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1994</td><td><code>352203</code> 福鼎市</td></tr>
    <tr><td><code>352225</code></td><td>霞浦县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350921</code> 霞浦县</td></tr>
    <tr><td><code>352226</code></td><td>福安县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1988</td><td><code>352202</code> 福安市</td></tr>
    <tr><td><code>352227</code></td><td>古田县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350922</code> 古田县</td></tr>
    <tr><td><code>352228</code></td><td>屏南县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350923</code> 屏南县</td></tr>
    <tr><td><code>352229</code></td><td>寿宁县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350924</code> 寿宁县</td></tr>
    <tr><td><code>352230</code></td><td>周宁县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350925</code> 周宁县</td></tr>
    <tr><td><code>352231</code></td><td>柘荣县</td><td>停用</td><td>福建省 · 宁德地区</td><td>1981–1998</td><td><code>350926</code> 柘荣县</td></tr>
    <tr><td><code>352300</code></td><td>莆田地区</td><td>停用</td><td>福建省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352321</code></td><td>闽清县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350124</code> 闽清县</td></tr>
    <tr><td><code>352322</code></td><td>永泰县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350125</code> 永泰县</td></tr>
    <tr><td><code>352323</code></td><td>长乐县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350126</code> 长乐县</td></tr>
    <tr><td><code>352324</code></td><td>福清县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350127</code> 福清县</td></tr>
    <tr><td><code>352325</code></td><td>平潭县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350128</code> 平潭县</td></tr>
    <tr><td><code>352326</code></td><td>莆田县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350302</code> 城厢区；<code>350303</code> 涵江区；<code>350321</code> 莆田县</td></tr>
    <tr><td><code>352327</code></td><td>仙游县</td><td>停用</td><td>福建省 · 莆田地区</td><td>1981–1982</td><td><code>350322</code> 仙游县</td></tr>
    <tr><td><code>352400</code></td><td>晋江地区</td><td>停用</td><td>福建省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352401</code></td><td>泉州市</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350502</code> 鲤城区</td></tr>
    <tr><td><code>352421</code></td><td>惠安县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350521</code> 惠安县</td></tr>
    <tr><td><code>352422</code></td><td>晋江县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350522</code> 晋江县</td></tr>
    <tr><td><code>352423</code></td><td>南安县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350523</code> 南安县</td></tr>
    <tr><td><code>352424</code></td><td>安溪县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350524</code> 安溪县</td></tr>
    <tr><td><code>352425</code></td><td>永春县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350525</code> 永春县</td></tr>
    <tr><td><code>352426</code></td><td>德化县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350526</code> 德化县</td></tr>
    <tr><td><code>352427</code></td><td>金门县</td><td>停用</td><td>福建省 · 晋江地区</td><td>1981–1984</td><td><code>350527</code> 金门县</td></tr>
    <tr><td><code>352500</code></td><td>龙溪地区</td><td>停用</td><td>福建省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352501</code></td><td>漳州市</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350602</code> 芗城区</td></tr>
    <tr><td><code>352521</code></td><td>龙海县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350621</code> 龙海县</td></tr>
    <tr><td><code>352522</code></td><td>云霄县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350622</code> 云霄县</td></tr>
    <tr><td><code>352523</code></td><td>漳浦县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350623</code> 漳浦县</td></tr>
    <tr><td><code>352524</code></td><td>诏安县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350624</code> 诏安县</td></tr>
    <tr><td><code>352525</code></td><td>长泰县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350625</code> 长泰县</td></tr>
    <tr><td><code>352526</code></td><td>东山县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350626</code> 东山县</td></tr>
    <tr><td><code>352527</code></td><td>南靖县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350627</code> 南靖县</td></tr>
    <tr><td><code>352528</code></td><td>平和县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350628</code> 平和县</td></tr>
    <tr><td><code>352529</code></td><td>华安县</td><td>停用</td><td>福建省 · 龙溪地区</td><td>1981–1984</td><td><code>350629</code> 华安县</td></tr>
    <tr><td><code>352600</code></td><td>龙岩地区</td><td>停用</td><td>福建省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352601</code></td><td>龙岩市</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350802</code> 新罗区</td></tr>
    <tr><td><code>352602</code></td><td>漳平市</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1990–1995</td><td><code>350881</code> 漳平市</td></tr>
    <tr><td><code>352622</code></td><td>长汀县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350821</code> 长汀县</td></tr>
    <tr><td><code>352623</code></td><td>永定县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350822</code> 永定县</td></tr>
    <tr><td><code>352624</code></td><td>上杭县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350823</code> 上杭县</td></tr>
    <tr><td><code>352625</code></td><td>武平县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350824</code> 武平县</td></tr>
    <tr><td><code>352626</code></td><td>漳平县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1989</td><td><code>352602</code> 漳平市</td></tr>
    <tr><td><code>352627</code></td><td>连城县</td><td>停用</td><td>福建省 · 龙岩地区</td><td>1981–1995</td><td><code>350825</code> 连城县</td></tr>
    <tr><td><code>352700</code></td><td>三明地区</td><td>停用</td><td>福建省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>352701</code></td><td>三明市</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350402</code> 梅列区；<code>350403</code> 三元区</td></tr>
    <tr><td><code>352721</code></td><td>明溪县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350421</code> 明溪县</td></tr>
    <tr><td><code>352722</code></td><td>永安县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350422</code> 永安县</td></tr>
    <tr><td><code>352723</code></td><td>清流县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350423</code> 清流县</td></tr>
    <tr><td><code>352724</code></td><td>宁化县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350424</code> 宁化县</td></tr>
    <tr><td><code>352725</code></td><td>大田县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350425</code> 大田县</td></tr>
    <tr><td><code>352726</code></td><td>尤溪县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350426</code> 尤溪县</td></tr>
    <tr><td><code>352727</code></td><td>沙县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350402</code> 梅列区；<code>350427</code> 沙县</td></tr>
    <tr><td><code>352728</code></td><td>将乐县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350428</code> 将乐县</td></tr>
    <tr><td><code>352729</code></td><td>泰宁县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350429</code> 泰宁县</td></tr>
    <tr><td><code>352730</code></td><td>建宁县</td><td>停用</td><td>福建省 · 三明地区</td><td>1981–1982</td><td><code>350430</code> 建宁县</td></tr>
    <tr><td><code>359001</code></td><td>永安市</td><td>停用</td><td>福建省</td><td>1986–1989</td><td><code>350481</code> 永安市</td></tr>
    <tr><td><code>359002</code></td><td>石狮市</td><td>停用</td><td>福建省</td><td>1987–1989</td><td><code>350581</code> 石狮市</td></tr>
    <tr><td><code>360105</code></td><td>湾里区</td><td>停用</td><td>江西省 · 南昌市</td><td>1983–2018</td><td><code>360112</code> 新建区</td></tr>
    <tr><td><code>360111</code></td><td>郊区</td><td>更名</td><td>江西省 · 南昌市</td><td>1983–2001</td><td>代码未变，现名 青山湖区</td></tr>
    <tr><td><code>360122</code></td><td>新建县</td><td>停用</td><td>江西省 · 南昌市</td><td>1981–2014</td><td><code>360112</code> 新建区</td></tr>
    <tr><td><code>360211</code></td><td>鹅湖区</td><td>停用</td><td>江西省 · 景德镇市</td><td>1983–1987</td><td><code>360222</code> 浮梁县</td></tr>
    <tr><td><code>360212</code></td><td>蛟潭区</td><td>停用</td><td>江西省 · 景德镇市</td><td>1983–1987</td><td><code>360222</code> 浮梁县</td></tr>
    <tr><td><code>360221</code></td><td>乐平县</td><td>停用</td><td>江西省 · 景德镇市</td><td>1983–1991</td><td><code>360281</code> 乐平市</td></tr>
    <tr><td><code>360302</code></td><td>城关区</td><td>更名</td><td>江西省 · 萍乡市</td><td>1983–1992</td><td>代码未变，现名 安源区</td></tr>
    <tr><td><code>360311</code></td><td>上栗区</td><td>停用</td><td>江西省 · 萍乡市</td><td>1983–1996</td><td><code>360322</code> 上栗县</td></tr>
    <tr><td><code>360312</code></td><td>芦溪区</td><td>停用</td><td>江西省 · 萍乡市</td><td>1983–1996</td><td><code>360323</code> 芦溪县</td></tr>
    <tr><td><code>360402</code></td><td>庐山区</td><td>更名</td><td>江西省 · 九江市</td><td>1983–2015</td><td>代码未变，现名 濂溪区</td></tr>
    <tr><td><code>360411</code></td><td>郊区</td><td>停用</td><td>江西省 · 九江市</td><td>1983</td><td><code>360402</code> 濂溪区</td></tr>
    <tr><td><code>360421</code></td><td>九江县</td><td>停用</td><td>江西省 · 九江市</td><td>1983–2016</td><td><code>360404</code> 柴桑区</td></tr>
    <tr><td><code>360422</code></td><td>瑞昌县</td><td>停用</td><td>江西省 · 九江市</td><td>1983–1988</td><td><code>369001</code> 瑞昌市</td></tr>
    <tr><td><code>360427</code></td><td>星子县</td><td>停用</td><td>江西省 · 九江市</td><td>1983–2015</td><td><code>360482</code> 共青城市；<code>360483</code> 庐山市</td></tr>
    <tr><td><code>360621</code></td><td>贵溪县</td><td>停用</td><td>江西省 · 鹰潭市</td><td>1983–1995</td><td><code>360681</code> 贵溪市</td></tr>
    <tr><td><code>360622</code></td><td>余江县</td><td>停用</td><td>江西省 · 鹰潭市</td><td>1983–2017</td><td><code>360603</code> 余江区</td></tr>
    <tr><td><code>360721</code></td><td>赣县</td><td>停用</td><td>江西省 · 赣州市</td><td>1998–2015</td><td><code>360704</code> 赣县区</td></tr>
    <tr><td><code>360727</code></td><td>龙南县</td><td>停用</td><td>江西省 · 赣州市</td><td>1998–2019</td><td><code>360783</code> 龙南市</td></tr>
    <tr><td><code>360782</code></td><td>南康市</td><td>停用</td><td>江西省 · 赣州市</td><td>1998–2012</td><td><code>360702</code> 章贡区；<code>360703</code> 南康区</td></tr>
    <tr><td><code>361029</code></td><td>东乡县</td><td>停用</td><td>江西省 · 抚州市</td><td>2000–2015</td><td><code>361003</code> 东乡区</td></tr>
    <tr><td><code>361121</code></td><td>上饶县</td><td>停用</td><td>江西省 · 上饶市</td><td>2000–2018</td><td><code>361104</code> 广信区</td></tr>
    <tr><td><code>361122</code></td><td>广丰县</td><td>停用</td><td>江西省 · 上饶市</td><td>2000–2014</td><td><code>361103</code> 广丰区</td></tr>
    <tr><td><code>361128</code></td><td>波阳县</td><td>更名</td><td>江西省 · 上饶市</td><td>2000–2002</td><td>代码未变，现名 鄱阳县</td></tr>
    <tr><td><code>362100</code></td><td>赣州地区</td><td>停用</td><td>江西省</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362101</code></td><td>赣州市</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360702</code> 章贡区</td></tr>
    <tr><td><code>362102</code></td><td>瑞金市</td><td>停用</td><td>江西省 · 赣州地区</td><td>1994–1997</td><td><code>360781</code> 瑞金市</td></tr>
    <tr><td><code>362103</code></td><td>南康市</td><td>停用</td><td>江西省 · 赣州地区</td><td>1995–1997</td><td><code>360782</code> 南康市</td></tr>
    <tr><td><code>362121</code></td><td>赣县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360721</code> 赣县</td></tr>
    <tr><td><code>362122</code></td><td>南康县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1994</td><td><code>362103</code> 南康市</td></tr>
    <tr><td><code>362123</code></td><td>信丰县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360722</code> 信丰县</td></tr>
    <tr><td><code>362124</code></td><td>大余县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360723</code> 大余县</td></tr>
    <tr><td><code>362125</code></td><td>上犹县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360724</code> 上犹县</td></tr>
    <tr><td><code>362126</code></td><td>崇义县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360725</code> 崇义县</td></tr>
    <tr><td><code>362127</code></td><td>安远县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360726</code> 安远县</td></tr>
    <tr><td><code>362128</code></td><td>龙南县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360727</code> 龙南县</td></tr>
    <tr><td><code>362129</code></td><td>定南县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360728</code> 定南县</td></tr>
    <tr><td><code>362130</code></td><td>全南县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360729</code> 全南县</td></tr>
    <tr><td><code>362131</code></td><td>宁都县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360730</code> 宁都县</td></tr>
    <tr><td><code>362132</code></td><td>于都县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360731</code> 于都县</td></tr>
    <tr><td><code>362133</code></td><td>兴国县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360732</code> 兴国县</td></tr>
    <tr><td><code>362134</code></td><td>瑞金县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1993</td><td><code>362102</code> 瑞金市</td></tr>
    <tr><td><code>362135</code></td><td>会昌县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360733</code> 会昌县</td></tr>
    <tr><td><code>362136</code></td><td>寻乌县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360734</code> 寻乌县</td></tr>
    <tr><td><code>362137</code></td><td>石城县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1997</td><td><code>360735</code> 石城县</td></tr>
    <tr><td><code>362138</code></td><td>广昌县</td><td>停用</td><td>江西省 · 赣州地区</td><td>1981–1982</td><td><code>362532</code> 广昌县</td></tr>
    <tr><td><code>362200</code></td><td>宜春地区</td><td>停用</td><td>江西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362201</code></td><td>宜春市</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360902</code> 袁州区</td></tr>
    <tr><td><code>362202</code></td><td>丰城市</td><td>停用</td><td>江西省 · 宜春地区</td><td>1988–1999</td><td><code>360981</code> 丰城市</td></tr>
    <tr><td><code>362203</code></td><td>樟树市</td><td>停用</td><td>江西省 · 宜春地区</td><td>1988–1999</td><td><code>360982</code> 樟树市</td></tr>
    <tr><td><code>362204</code></td><td>高安市</td><td>停用</td><td>江西省 · 宜春地区</td><td>1993–1999</td><td><code>360983</code> 高安市</td></tr>
    <tr><td><code>362221</code></td><td>丰城县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1987</td><td><code>362202</code> 丰城市</td></tr>
    <tr><td><code>362222</code></td><td>高安县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1992</td><td><code>362204</code> 高安市</td></tr>
    <tr><td><code>362223</code></td><td>清江县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1987</td><td><code>362203</code> 樟树市</td></tr>
    <tr><td><code>362224</code></td><td>新余县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1982</td><td><code>360502</code> 渝水区</td></tr>
    <tr><td><code>362225</code></td><td>宜春县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1984</td><td><code>362201</code> 宜春市</td></tr>
    <tr><td><code>362226</code></td><td>奉新县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360921</code> 奉新县</td></tr>
    <tr><td><code>362227</code></td><td>万载县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360922</code> 万载县</td></tr>
    <tr><td><code>362228</code></td><td>上高县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360923</code> 上高县</td></tr>
    <tr><td><code>362229</code></td><td>宜丰县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360924</code> 宜丰县</td></tr>
    <tr><td><code>362230</code></td><td>分宜县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1982</td><td><code>360521</code> 分宜县</td></tr>
    <tr><td><code>362231</code></td><td>安义县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1982</td><td><code>360123</code> 安义县</td></tr>
    <tr><td><code>362232</code></td><td>靖安县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360925</code> 靖安县</td></tr>
    <tr><td><code>362233</code></td><td>铜鼓县</td><td>停用</td><td>江西省 · 宜春地区</td><td>1981–1999</td><td><code>360926</code> 铜鼓县</td></tr>
    <tr><td><code>362300</code></td><td>上饶地区</td><td>停用</td><td>江西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362301</code></td><td>上饶市</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361102</code> 信州区</td></tr>
    <tr><td><code>362302</code></td><td>鹰潭市</td><td>更名</td><td>江西省 · 上饶地区</td><td>1981–1982</td><td>代码未变，现名 鹰潭市</td></tr>
    <tr><td><code>362302</code></td><td>德兴市</td><td>停用</td><td>江西省 · 上饶地区</td><td>1990–1999</td><td><code>361181</code> 德兴市</td></tr>
    <tr><td><code>362321</code></td><td>上饶县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361121</code> 上饶县</td></tr>
    <tr><td><code>362322</code></td><td>广丰县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361122</code> 广丰县</td></tr>
    <tr><td><code>362323</code></td><td>玉山县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361123</code> 玉山县</td></tr>
    <tr><td><code>362324</code></td><td>铅山县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361124</code> 铅山县</td></tr>
    <tr><td><code>362325</code></td><td>横峰县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361125</code> 横峰县</td></tr>
    <tr><td><code>362326</code></td><td>弋阳县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361126</code> 弋阳县</td></tr>
    <tr><td><code>362327</code></td><td>贵溪县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1982</td><td><code>360621</code> 贵溪县</td></tr>
    <tr><td><code>362328</code></td><td>余江县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1982</td><td><code>360622</code> 余江县</td></tr>
    <tr><td><code>362329</code></td><td>余干县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361127</code> 余干县</td></tr>
    <tr><td><code>362330</code></td><td>波阳县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>360202</code> 昌江区；<code>361128</code> 鄱阳县</td></tr>
    <tr><td><code>362331</code></td><td>万年县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361129</code> 万年县</td></tr>
    <tr><td><code>362332</code></td><td>乐平县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1982</td><td><code>360221</code> 乐平县</td></tr>
    <tr><td><code>362333</code></td><td>德兴县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1989</td><td><code>362302</code> 鹰潭市</td></tr>
    <tr><td><code>362334</code></td><td>婺源县</td><td>停用</td><td>江西省 · 上饶地区</td><td>1981–1999</td><td><code>361130</code> 婺源县</td></tr>
    <tr><td><code>362400</code></td><td>吉安地区</td><td>停用</td><td>江西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362401</code></td><td>吉安市</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360802</code> 吉州区；<code>360803</code> 青原区</td></tr>
    <tr><td><code>362402</code></td><td>井冈山市</td><td>停用</td><td>江西省 · 吉安地区</td><td>1984–1999</td><td><code>360881</code> 井冈山市</td></tr>
    <tr><td><code>362421</code></td><td>吉安县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360802</code> 吉州区；<code>360803</code> 青原区；<code>360821</code> 吉安县</td></tr>
    <tr><td><code>362422</code></td><td>吉水县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360803</code> 青原区；<code>360822</code> 吉水县</td></tr>
    <tr><td><code>362423</code></td><td>峡江县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360823</code> 峡江县</td></tr>
    <tr><td><code>362424</code></td><td>新干县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360824</code> 新干县</td></tr>
    <tr><td><code>362425</code></td><td>永丰县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360825</code> 永丰县</td></tr>
    <tr><td><code>362426</code></td><td>泰和县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360826</code> 泰和县</td></tr>
    <tr><td><code>362427</code></td><td>遂川县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360827</code> 遂川县</td></tr>
    <tr><td><code>362428</code></td><td>万安县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360828</code> 万安县</td></tr>
    <tr><td><code>362429</code></td><td>安福县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360829</code> 安福县</td></tr>
    <tr><td><code>362430</code></td><td>永新县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360830</code> 永新县</td></tr>
    <tr><td><code>362431</code></td><td>莲花县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1991</td><td><code>360321</code> 莲花县</td></tr>
    <tr><td><code>362432</code></td><td>宁冈县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1999</td><td><code>360881</code> 井冈山市</td></tr>
    <tr><td><code>362433</code></td><td>井冈山县</td><td>停用</td><td>江西省 · 吉安地区</td><td>1981–1983</td><td><code>362402</code> 井冈山市</td></tr>
    <tr><td><code>362500</code></td><td>抚州地区</td><td>停用</td><td>江西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362501</code></td><td>抚州市</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1986</td><td><code>362502</code> 临川市</td></tr>
    <tr><td><code>362502</code></td><td>临川市</td><td>停用</td><td>江西省 · 抚州地区</td><td>1987–1999</td><td><code>361002</code> 临川区</td></tr>
    <tr><td><code>362521</code></td><td>临川县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1986</td><td><code>362502</code> 临川市</td></tr>
    <tr><td><code>362522</code></td><td>南城县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361021</code> 南城县</td></tr>
    <tr><td><code>362523</code></td><td>黎川县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361022</code> 黎川县</td></tr>
    <tr><td><code>362524</code></td><td>南丰县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361023</code> 南丰县</td></tr>
    <tr><td><code>362525</code></td><td>崇仁县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361024</code> 崇仁县</td></tr>
    <tr><td><code>362526</code></td><td>乐安县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361025</code> 乐安县</td></tr>
    <tr><td><code>362527</code></td><td>宜黄县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361026</code> 宜黄县</td></tr>
    <tr><td><code>362528</code></td><td>金溪县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361027</code> 金溪县</td></tr>
    <tr><td><code>362529</code></td><td>资溪县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361028</code> 资溪县</td></tr>
    <tr><td><code>362530</code></td><td>进贤县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1982</td><td><code>360124</code> 进贤县</td></tr>
    <tr><td><code>362531</code></td><td>东乡县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1981–1999</td><td><code>361029</code> 东乡县</td></tr>
    <tr><td><code>362532</code></td><td>广昌县</td><td>停用</td><td>江西省 · 抚州地区</td><td>1983–1999</td><td><code>361030</code> 广昌县</td></tr>
    <tr><td><code>362600</code></td><td>九江地区</td><td>停用</td><td>江西省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>362621</code></td><td>九江县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360421</code> 九江县</td></tr>
    <tr><td><code>362622</code></td><td>瑞昌县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360422</code> 瑞昌县</td></tr>
    <tr><td><code>362623</code></td><td>武宁县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360423</code> 武宁县</td></tr>
    <tr><td><code>362624</code></td><td>修水县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360424</code> 修水县</td></tr>
    <tr><td><code>362625</code></td><td>永修县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360425</code> 永修县</td></tr>
    <tr><td><code>362626</code></td><td>德安县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360426</code> 德安县</td></tr>
    <tr><td><code>362627</code></td><td>星子县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360427</code> 星子县</td></tr>
    <tr><td><code>362628</code></td><td>都昌县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360428</code> 都昌县</td></tr>
    <tr><td><code>362629</code></td><td>湖口县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360429</code> 湖口县</td></tr>
    <tr><td><code>362630</code></td><td>彭泽县</td><td>停用</td><td>江西省 · 九江地区</td><td>1981–1982</td><td><code>360430</code> 彭泽县</td></tr>
    <tr><td><code>369001</code></td><td>瑞昌市</td><td>停用</td><td>江西省</td><td>1989</td><td><code>360481</code> 瑞昌市</td></tr>
    <tr><td><code>370111</code></td><td>郊区</td><td>停用</td><td>山东省 · 济南市</td><td>1983–1986</td><td><code>370102</code> 历下区；<code>370103</code> 市中区；<code>370104</code> 槐荫区；<code>370105</code> 天桥区；<code>370112</code> 历城区</td></tr>
    <tr><td><code>370121</code></td><td>历城县</td><td>停用</td><td>山东省 · 济南市</td><td>1981–1986</td><td><code>370112</code> 历城区</td></tr>
    <tr><td><code>370122</code></td><td>章丘县</td><td>停用</td><td>山东省 · 济南市</td><td>1981–1991</td><td><code>370181</code> 章丘市</td></tr>
    <tr><td><code>370123</code></td><td>长清县</td><td>停用</td><td>山东省 · 济南市</td><td>1981–2000</td><td><code>370113</code> 长清区</td></tr>
    <tr><td><code>370125</code></td><td>济阳县</td><td>停用</td><td>山东省 · 济南市</td><td>1989–2017</td><td><code>370115</code> 济阳区</td></tr>
    <tr><td><code>370181</code></td><td>章丘市</td><td>停用</td><td>山东省 · 济南市</td><td>1992–2015</td><td><code>370114</code> 章丘区</td></tr>
    <tr><td><code>370204</code></td><td>台东区</td><td>停用</td><td>山东省 · 青岛市</td><td>1983–1993</td><td><code>370203</code> 市北区</td></tr>
    <tr><td><code>370205</code></td><td>四方区</td><td>停用</td><td>山东省 · 青岛市</td><td>1983–2011</td><td><code>370203</code> 市北区；<code>370203</code> 市北区</td></tr>
    <tr><td><code>370206</code></td><td>沧口区</td><td>停用</td><td>山东省 · 青岛市</td><td>1983–1993</td><td><code>370205</code> 四方区；<code>370213</code> 李沧区</td></tr>
    <tr><td><code>370221</code></td><td>崂山县</td><td>停用</td><td>山东省 · 青岛市</td><td>1981–1987</td><td><code>370212</code> 崂山区</td></tr>
    <tr><td><code>370222</code></td><td>即墨县</td><td>停用</td><td>山东省 · 青岛市</td><td>1981–1988</td><td><code>379013</code> 即墨市</td></tr>
    <tr><td><code>370223</code></td><td>胶南县</td><td>停用</td><td>山东省 · 青岛市</td><td>1981–1989</td><td><code>370284</code> 胶南市</td></tr>
    <tr><td><code>370224</code></td><td>胶县</td><td>停用</td><td>山东省 · 青岛市</td><td>1981–1986</td><td><code>379006</code> 胶州市</td></tr>
    <tr><td><code>370225</code></td><td>莱西县</td><td>停用</td><td>山东省 · 青岛市</td><td>1983–1989</td><td><code>370285</code> 莱西市</td></tr>
    <tr><td><code>370226</code></td><td>平度县</td><td>停用</td><td>山东省 · 青岛市</td><td>1983–1988</td><td><code>379014</code> 平度市</td></tr>
    <tr><td><code>370282</code></td><td>即墨市</td><td>停用</td><td>山东省 · 青岛市</td><td>1990–2016</td><td><code>370215</code> 即墨区</td></tr>
    <tr><td><code>370284</code></td><td>胶南市</td><td>停用</td><td>山东省 · 青岛市</td><td>1990–2011</td><td><code>370211</code> 黄岛区；<code>370211</code> 黄岛区；<code>370211</code> 黄岛区</td></tr>
    <tr><td><code>370421</code></td><td>滕县</td><td>停用</td><td>山东省 · 枣庄市</td><td>1981–1987</td><td><code>379010</code> 滕州市</td></tr>
    <tr><td><code>370504</code></td><td>牛庄区</td><td>停用</td><td>山东省 · 东营市</td><td>1983–1986</td><td><code>370502</code> 东营区</td></tr>
    <tr><td><code>370521</code></td><td>垦利县</td><td>停用</td><td>山东省 · 东营市</td><td>1982–2015</td><td><code>370505</code> 垦利区</td></tr>
    <tr><td><code>370620</code></td><td>威海市</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1986</td><td><code>371002</code> 环翠区</td></tr>
    <tr><td><code>370622</code></td><td>蓬莱县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1990</td><td><code>370684</code> 蓬莱市</td></tr>
    <tr><td><code>370623</code></td><td>黄县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1985</td><td><code>379002</code> 龙口市</td></tr>
    <tr><td><code>370624</code></td><td>招远县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1990</td><td><code>370685</code> 招远市</td></tr>
    <tr><td><code>370625</code></td><td>掖县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1987</td><td><code>379009</code> 莱州市</td></tr>
    <tr><td><code>370627</code></td><td>莱阳县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1986</td><td><code>379008</code> 莱阳市</td></tr>
    <tr><td><code>370628</code></td><td>栖霞县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1994</td><td><code>370686</code> 栖霞市</td></tr>
    <tr><td><code>370629</code></td><td>海阳县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1995</td><td><code>370687</code> 海阳市</td></tr>
    <tr><td><code>370630</code></td><td>乳山县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1986</td><td><code>371021</code> 乳山县</td></tr>
    <tr><td><code>370631</code></td><td>牟平县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1993</td><td><code>370612</code> 牟平区；<code>370613</code> 莱山区</td></tr>
    <tr><td><code>370632</code></td><td>文登县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1986</td><td><code>371022</code> 文登县</td></tr>
    <tr><td><code>370633</code></td><td>荣成县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–1986</td><td><code>371023</code> 荣成县</td></tr>
    <tr><td><code>370634</code></td><td>长岛县</td><td>停用</td><td>山东省 · 烟台市</td><td>1983–2019</td><td><code>370614</code> 蓬莱区</td></tr>
    <tr><td><code>370684</code></td><td>蓬莱市</td><td>停用</td><td>山东省 · 烟台市</td><td>1991–2019</td><td><code>370614</code> 蓬莱区</td></tr>
    <tr><td><code>370719</code></td><td>青州市</td><td>停用</td><td>山东省 · 潍坊市</td><td>1986</td><td><code>379001</code> 青州市</td></tr>
    <tr><td><code>370721</code></td><td>益都县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1985</td><td><code>370719</code> 青州市</td></tr>
    <tr><td><code>370722</code></td><td>安丘县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1993</td><td><code>370784</code> 安丘市</td></tr>
    <tr><td><code>370723</code></td><td>寿光县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1992</td><td><code>370783</code> 寿光市</td></tr>
    <tr><td><code>370726</code></td><td>昌邑县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1993</td><td><code>370786</code> 昌邑市</td></tr>
    <tr><td><code>370727</code></td><td>高密县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1993</td><td><code>370785</code> 高密市</td></tr>
    <tr><td><code>370728</code></td><td>诸城县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1986</td><td><code>379007</code> 诸城市</td></tr>
    <tr><td><code>370729</code></td><td>五莲县</td><td>停用</td><td>山东省 · 潍坊市</td><td>1983–1991</td><td><code>371121</code> 五莲县</td></tr>
    <tr><td><code>370802</code></td><td>市中区</td><td>停用</td><td>山东省 · 济宁市</td><td>1983–2012</td><td><code>370811</code> 任城区</td></tr>
    <tr><td><code>370811</code></td><td>市郊区</td><td>更名</td><td>山东省 · 济宁市</td><td>1983–1992</td><td>代码未变，现名 任城区</td></tr>
    <tr><td><code>370819</code></td><td>曲阜市</td><td>停用</td><td>山东省 · 济宁市</td><td>1986</td><td><code>379003</code> 曲阜市</td></tr>
    <tr><td><code>370822</code></td><td>兖州县</td><td>停用</td><td>山东省 · 济宁市</td><td>1983–1991</td><td><code>370882</code> 兖州市</td></tr>
    <tr><td><code>370823</code></td><td>曲阜县</td><td>停用</td><td>山东省 · 济宁市</td><td>1983–1985</td><td><code>370819</code> 曲阜市</td></tr>
    <tr><td><code>370825</code></td><td>邹县</td><td>停用</td><td>山东省 · 济宁市</td><td>1983–1991</td><td><code>370883</code> 邹城市</td></tr>
    <tr><td><code>370882</code></td><td>兖州市</td><td>停用</td><td>山东省 · 济宁市</td><td>1992–2012</td><td><code>370812</code> 兖州区</td></tr>
    <tr><td><code>370911</code></td><td>郊区</td><td>更名</td><td>山东省 · 泰安市</td><td>1985–1999</td><td>代码未变，现名 岱岳区</td></tr>
    <tr><td><code>370919</code></td><td>莱芜市</td><td>停用</td><td>山东省 · 泰安市</td><td>1985</td><td><code>379004</code> 莱芜市</td></tr>
    <tr><td><code>370920</code></td><td>新泰市</td><td>停用</td><td>山东省 · 泰安市</td><td>1985</td><td><code>379005</code> 新泰市</td></tr>
    <tr><td><code>370922</code></td><td>肥城县</td><td>停用</td><td>山东省 · 泰安市</td><td>1985–1991</td><td><code>370983</code> 肥城市</td></tr>
    <tr><td><code>370981</code></td><td>莱芜市</td><td>停用</td><td>山东省 · 泰安市</td><td>1990–1991</td><td><code>371202</code> 莱城区；<code>371203</code> 钢城区</td></tr>
    <tr><td><code>371021</code></td><td>乳山县</td><td>停用</td><td>山东省 · 威海市</td><td>1987–1992</td><td><code>371083</code> 乳山市</td></tr>
    <tr><td><code>371022</code></td><td>文登县</td><td>停用</td><td>山东省 · 威海市</td><td>1987</td><td><code>379011</code> 文登市</td></tr>
    <tr><td><code>371023</code></td><td>荣成县</td><td>停用</td><td>山东省 · 威海市</td><td>1987</td><td><code>379012</code> 荣成市</td></tr>
    <tr><td><code>371081</code></td><td>文登市</td><td>停用</td><td>山东省 · 威海市</td><td>1990–2013</td><td><code>371002</code> 环翠区；<code>371003</code> 文登区</td></tr>
    <tr><td><code>371200</code></td><td>莱芜市</td><td>停用</td><td>山东省</td><td>1992–2017</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>371202</code></td><td>莱城区</td><td>停用</td><td>山东省 · 莱芜市</td><td>1992–2017</td><td><code>371203</code> 钢城区；<code>370116</code> 莱芜区</td></tr>
    <tr><td><code>371203</code></td><td>钢城区</td><td>停用</td><td>山东省 · 莱芜市</td><td>1992–2017</td><td><code>370117</code> 钢城区</td></tr>
    <tr><td><code>371324</code></td><td>苍山县</td><td>更名</td><td>山东省 · 临沂市</td><td>1994–2013</td><td>代码未变，现名 兰陵县</td></tr>
    <tr><td><code>371421</code></td><td>陵县</td><td>停用</td><td>山东省 · 德州市</td><td>1994–2013</td><td><code>371403</code> 陵城区</td></tr>
    <tr><td><code>371523</code></td><td>茌平县</td><td>停用</td><td>山东省 · 聊城市</td><td>1997–2018</td><td><code>371503</code> 茌平区</td></tr>
    <tr><td><code>371624</code></td><td>沾化县</td><td>停用</td><td>山东省 · 滨州市</td><td>2000–2013</td><td><code>371603</code> 沾化区</td></tr>
    <tr><td><code>371626</code></td><td>邹平县</td><td>停用</td><td>山东省 · 滨州市</td><td>2000–2017</td><td><code>371681</code> 邹平市</td></tr>
    <tr><td><code>371727</code></td><td>定陶县</td><td>停用</td><td>山东省 · 菏泽市</td><td>2000–2015</td><td><code>371703</code> 定陶区</td></tr>
    <tr><td><code>372100</code></td><td>烟台地区</td><td>停用</td><td>山东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372101</code></td><td>烟台市</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370602</code> 芝罘区</td></tr>
    <tr><td><code>372102</code></td><td>威海市</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370620</code> 威海市</td></tr>
    <tr><td><code>372121</code></td><td>福山县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370611</code> 福山区</td></tr>
    <tr><td><code>372122</code></td><td>蓬莱县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370622</code> 蓬莱县</td></tr>
    <tr><td><code>372123</code></td><td>黄县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370623</code> 黄县</td></tr>
    <tr><td><code>372124</code></td><td>招远县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370624</code> 招远县</td></tr>
    <tr><td><code>372125</code></td><td>掖县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370625</code> 掖县</td></tr>
    <tr><td><code>372126</code></td><td>莱西县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370225</code> 莱西县</td></tr>
    <tr><td><code>372127</code></td><td>莱阳县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370627</code> 莱阳县</td></tr>
    <tr><td><code>372128</code></td><td>栖霞县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370628</code> 栖霞县</td></tr>
    <tr><td><code>372129</code></td><td>海阳县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370629</code> 海阳县</td></tr>
    <tr><td><code>372130</code></td><td>乳山县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370630</code> 乳山县</td></tr>
    <tr><td><code>372131</code></td><td>牟平县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370631</code> 牟平县</td></tr>
    <tr><td><code>372132</code></td><td>文登县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370632</code> 文登县</td></tr>
    <tr><td><code>372133</code></td><td>荣成县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370633</code> 荣成县</td></tr>
    <tr><td><code>372134</code></td><td>长岛县</td><td>停用</td><td>山东省 · 烟台地区</td><td>1981–1982</td><td><code>370634</code> 长岛县</td></tr>
    <tr><td><code>372200</code></td><td>潍坊地区</td><td>停用</td><td>山东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372201</code></td><td>潍坊市</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370702</code> 潍城区；<code>370704</code> 坊子区</td></tr>
    <tr><td><code>372221</code></td><td>益都县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370721</code> 益都县</td></tr>
    <tr><td><code>372222</code></td><td>安丘县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370704</code> 坊子区；<code>370722</code> 安丘县</td></tr>
    <tr><td><code>372223</code></td><td>寿光县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370723</code> 寿光县</td></tr>
    <tr><td><code>372224</code></td><td>临朐县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370724</code> 临朐县</td></tr>
    <tr><td><code>372225</code></td><td>昌乐县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370704</code> 坊子区；<code>370725</code> 昌乐县</td></tr>
    <tr><td><code>372226</code></td><td>昌邑县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370726</code> 昌邑县</td></tr>
    <tr><td><code>372227</code></td><td>高密县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370727</code> 高密县</td></tr>
    <tr><td><code>372228</code></td><td>诸城县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370728</code> 诸城县</td></tr>
    <tr><td><code>372229</code></td><td>五莲县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370729</code> 五莲县</td></tr>
    <tr><td><code>372230</code></td><td>平度县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370226</code> 平度县</td></tr>
    <tr><td><code>372231</code></td><td>潍县</td><td>停用</td><td>山东省 · 潍坊地区</td><td>1981–1982</td><td><code>370703</code> 寒亭区；<code>370704</code> 坊子区</td></tr>
    <tr><td><code>372300</code></td><td>惠民地区</td><td>更名</td><td>山东省</td><td>1981–1991</td><td>代码未变，现名 惠民地区</td></tr>
    <tr><td><code>372300</code></td><td>滨州地区</td><td>停用</td><td>山东省</td><td>1992–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372301</code></td><td>滨州市</td><td>更名</td><td>山东省 · 惠民地区</td><td>1982–1991</td><td>代码未变，现名 滨州市</td></tr>
    <tr><td><code>372301</code></td><td>滨州市</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371602</code> 滨城区</td></tr>
    <tr><td><code>372321</code></td><td>惠民县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 惠民县</td></tr>
    <tr><td><code>372321</code></td><td>惠民县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371621</code> 惠民县</td></tr>
    <tr><td><code>372322</code></td><td>滨县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981–1986</td><td><code>372301</code> 滨州市；<code>372301</code> 滨州市</td></tr>
    <tr><td><code>372323</code></td><td>阳信县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 阳信县</td></tr>
    <tr><td><code>372323</code></td><td>阳信县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371622</code> 阳信县</td></tr>
    <tr><td><code>372324</code></td><td>无棣县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 无棣县</td></tr>
    <tr><td><code>372324</code></td><td>无棣县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371623</code> 无棣县</td></tr>
    <tr><td><code>372325</code></td><td>沾化县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 沾化县</td></tr>
    <tr><td><code>372325</code></td><td>沾化县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371624</code> 沾化县</td></tr>
    <tr><td><code>372326</code></td><td>利津县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981</td><td><code>370500</code> 东营市；<code>370522</code> 利津县</td></tr>
    <tr><td><code>372327</code></td><td>广饶县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981–1982</td><td><code>370500</code> 东营市；<code>370523</code> 广饶县</td></tr>
    <tr><td><code>372328</code></td><td>博兴县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 博兴县</td></tr>
    <tr><td><code>372328</code></td><td>博兴县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371625</code> 博兴县</td></tr>
    <tr><td><code>372329</code></td><td>桓台县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981–1982</td><td><code>370321</code> 桓台县</td></tr>
    <tr><td><code>372330</code></td><td>邹平县</td><td>更名</td><td>山东省 · 惠民地区</td><td>1981–1991</td><td>代码未变，现名 邹平县</td></tr>
    <tr><td><code>372330</code></td><td>邹平县</td><td>停用</td><td>山东省 · 滨州地区</td><td>1992–1999</td><td><code>371626</code> 邹平县</td></tr>
    <tr><td><code>372331</code></td><td>高青县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981–1988</td><td><code>370322</code> 高青县</td></tr>
    <tr><td><code>372332</code></td><td>垦利县</td><td>停用</td><td>山东省 · 惠民地区</td><td>1981</td><td><code>370500</code> 东营市；<code>370521</code> 垦利县</td></tr>
    <tr><td><code>372400</code></td><td>德州地区</td><td>停用</td><td>山东省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372401</code></td><td>德州市</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371402</code> 德城区</td></tr>
    <tr><td><code>372402</code></td><td>乐陵市</td><td>停用</td><td>山东省 · 德州地区</td><td>1988–1993</td><td><code>371481</code> 乐陵市</td></tr>
    <tr><td><code>372403</code></td><td>禹城市</td><td>停用</td><td>山东省 · 德州地区</td><td>1993</td><td><code>371482</code> 禹城市</td></tr>
    <tr><td><code>372421</code></td><td>陵县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>372401</code> 德州市；<code>371421</code> 陵县</td></tr>
    <tr><td><code>372422</code></td><td>平原县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>372401</code> 德州市；<code>371426</code> 平原县</td></tr>
    <tr><td><code>372423</code></td><td>夏津县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371427</code> 夏津县</td></tr>
    <tr><td><code>372424</code></td><td>武城县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371428</code> 武城县</td></tr>
    <tr><td><code>372425</code></td><td>齐河县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>370112</code> 历城区；<code>371425</code> 齐河县</td></tr>
    <tr><td><code>372426</code></td><td>禹城县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1992</td><td><code>372403</code> 禹城市</td></tr>
    <tr><td><code>372427</code></td><td>乐陵县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1987</td><td><code>372402</code> 乐陵市</td></tr>
    <tr><td><code>372428</code></td><td>临邑县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371424</code> 临邑县</td></tr>
    <tr><td><code>372429</code></td><td>商河县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1988</td><td><code>370126</code> 商河县</td></tr>
    <tr><td><code>372430</code></td><td>济阳县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1988</td><td><code>370125</code> 济阳县</td></tr>
    <tr><td><code>372431</code></td><td>宁津县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371422</code> 宁津县</td></tr>
    <tr><td><code>372432</code></td><td>庆云县</td><td>停用</td><td>山东省 · 德州地区</td><td>1981–1993</td><td><code>371423</code> 庆云县</td></tr>
    <tr><td><code>372500</code></td><td>聊城地区</td><td>停用</td><td>山东省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372501</code></td><td>聊城市</td><td>停用</td><td>山东省 · 聊城地区</td><td>1983–1996</td><td><code>371502</code> 东昌府区</td></tr>
    <tr><td><code>372502</code></td><td>临清市</td><td>停用</td><td>山东省 · 聊城地区</td><td>1983–1996</td><td><code>371581</code> 临清市</td></tr>
    <tr><td><code>372521</code></td><td>聊城县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1982</td><td><code>372501</code> 聊城市</td></tr>
    <tr><td><code>372522</code></td><td>阳谷县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371521</code> 阳谷县</td></tr>
    <tr><td><code>372523</code></td><td>莘县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371522</code> 莘县</td></tr>
    <tr><td><code>372524</code></td><td>茌平县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371523</code> 茌平县</td></tr>
    <tr><td><code>372525</code></td><td>东阿县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371524</code> 东阿县</td></tr>
    <tr><td><code>372526</code></td><td>冠县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371525</code> 冠县</td></tr>
    <tr><td><code>372527</code></td><td>高唐县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1996</td><td><code>371526</code> 高唐县</td></tr>
    <tr><td><code>372528</code></td><td>临清县</td><td>停用</td><td>山东省 · 聊城地区</td><td>1981–1982</td><td><code>372502</code> 临清市</td></tr>
    <tr><td><code>372600</code></td><td>泰安地区</td><td>停用</td><td>山东省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372601</code></td><td>泰安市</td><td>停用</td><td>山东省 · 泰安地区</td><td>1982–1984</td><td><code>370902</code> 泰山区；<code>370911</code> 岱岳区</td></tr>
    <tr><td><code>372602</code></td><td>莱芜市</td><td>停用</td><td>山东省 · 泰安地区</td><td>1983–1984</td><td><code>370919</code> 莱芜市</td></tr>
    <tr><td><code>372603</code></td><td>新汶市</td><td>更名</td><td>山东省 · 泰安地区</td><td>1982</td><td>代码未变，现名 新汶市</td></tr>
    <tr><td><code>372603</code></td><td>新泰市</td><td>停用</td><td>山东省 · 泰安地区</td><td>1983–1984</td><td><code>370920</code> 新泰市</td></tr>
    <tr><td><code>372621</code></td><td>泰安县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981</td><td><code>372601</code> 泰安市</td></tr>
    <tr><td><code>372622</code></td><td>莱芜县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1982</td><td><code>372602</code> 莱芜市</td></tr>
    <tr><td><code>372623</code></td><td>新泰县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1982</td><td><code>372603</code> 新汶市</td></tr>
    <tr><td><code>372624</code></td><td>宁阳县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1984</td><td><code>370921</code> 宁阳县</td></tr>
    <tr><td><code>372625</code></td><td>肥城县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1984</td><td><code>370922</code> 肥城县</td></tr>
    <tr><td><code>372626</code></td><td>东平县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1984</td><td><code>370923</code> 东平县</td></tr>
    <tr><td><code>372627</code></td><td>平阴县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981–1984</td><td><code>370124</code> 平阴县</td></tr>
    <tr><td><code>372628</code></td><td>新汶县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1981</td><td><code>372603</code> 新汶市</td></tr>
    <tr><td><code>372629</code></td><td>汶上县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1983–1984</td><td><code>370830</code> 汶上县</td></tr>
    <tr><td><code>372630</code></td><td>泗水县</td><td>停用</td><td>山东省 · 泰安地区</td><td>1983–1984</td><td><code>370831</code> 泗水县</td></tr>
    <tr><td><code>372700</code></td><td>济宁地区</td><td>停用</td><td>山东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372701</code></td><td>济宁市</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370802</code> 市中区</td></tr>
    <tr><td><code>372721</code></td><td>济宁县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370811</code> 任城区</td></tr>
    <tr><td><code>372722</code></td><td>兖州县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370822</code> 兖州县</td></tr>
    <tr><td><code>372723</code></td><td>曲阜县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370823</code> 曲阜县</td></tr>
    <tr><td><code>372724</code></td><td>泗水县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>372630</code> 泗水县</td></tr>
    <tr><td><code>372725</code></td><td>邹县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370825</code> 邹县</td></tr>
    <tr><td><code>372726</code></td><td>微山县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370826</code> 微山县</td></tr>
    <tr><td><code>372727</code></td><td>鱼台县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370827</code> 鱼台县</td></tr>
    <tr><td><code>372728</code></td><td>金乡县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370828</code> 金乡县</td></tr>
    <tr><td><code>372729</code></td><td>嘉祥县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>370829</code> 嘉祥县</td></tr>
    <tr><td><code>372730</code></td><td>汶上县</td><td>停用</td><td>山东省 · 济宁地区</td><td>1981–1982</td><td><code>372629</code> 汶上县</td></tr>
    <tr><td><code>372800</code></td><td>临沂地区</td><td>停用</td><td>山东省</td><td>1981–1993</td><td><code>372802</code> 日照市</td></tr>
    <tr><td><code>372801</code></td><td>临沂市</td><td>停用</td><td>山东省 · 临沂地区</td><td>1983–1993</td><td><code>371302</code> 兰山区；<code>371311</code> 罗庄区；<code>371312</code> 河东区</td></tr>
    <tr><td><code>372802</code></td><td>日照市</td><td>停用</td><td>山东省 · 临沂地区</td><td>1985–1988</td><td><code>371100</code> 日照市</td></tr>
    <tr><td><code>372821</code></td><td>临沂县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1982</td><td><code>372801</code> 临沂市</td></tr>
    <tr><td><code>372822</code></td><td>郯城县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371322</code> 郯城县</td></tr>
    <tr><td><code>372823</code></td><td>苍山县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371324</code> 兰陵县</td></tr>
    <tr><td><code>372824</code></td><td>莒南县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371327</code> 莒南县</td></tr>
    <tr><td><code>372825</code></td><td>日照县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1984</td><td><code>372802</code> 日照市</td></tr>
    <tr><td><code>372826</code></td><td>莒县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1991</td><td><code>371122</code> 莒县</td></tr>
    <tr><td><code>372827</code></td><td>沂水县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371323</code> 沂水县</td></tr>
    <tr><td><code>372828</code></td><td>沂源县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1988</td><td><code>370323</code> 沂源县</td></tr>
    <tr><td><code>372829</code></td><td>蒙阴县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371328</code> 蒙阴县</td></tr>
    <tr><td><code>372830</code></td><td>平邑县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371326</code> 平邑县</td></tr>
    <tr><td><code>372831</code></td><td>费县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371325</code> 费县</td></tr>
    <tr><td><code>372832</code></td><td>沂南县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>372829</code> 蒙阴县；<code>371321</code> 沂南县</td></tr>
    <tr><td><code>372833</code></td><td>临沭县</td><td>停用</td><td>山东省 · 临沂地区</td><td>1981–1993</td><td><code>371329</code> 临沭县</td></tr>
    <tr><td><code>372900</code></td><td>菏泽地区</td><td>停用</td><td>山东省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>372901</code></td><td>菏泽市</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1983–1999</td><td><code>371702</code> 牡丹区</td></tr>
    <tr><td><code>372921</code></td><td>菏泽县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1982</td><td><code>372901</code> 菏泽市</td></tr>
    <tr><td><code>372922</code></td><td>曹县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371721</code> 曹县</td></tr>
    <tr><td><code>372923</code></td><td>定陶县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371727</code> 定陶县</td></tr>
    <tr><td><code>372924</code></td><td>成武县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371723</code> 成武县</td></tr>
    <tr><td><code>372925</code></td><td>单县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371722</code> 单县</td></tr>
    <tr><td><code>372926</code></td><td>巨野县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371724</code> 巨野县</td></tr>
    <tr><td><code>372927</code></td><td>梁山县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1988</td><td><code>370923</code> 东平县；<code>370832</code> 梁山县</td></tr>
    <tr><td><code>372928</code></td><td>郓城县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371725</code> 郓城县</td></tr>
    <tr><td><code>372929</code></td><td>鄄城县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371726</code> 鄄城县</td></tr>
    <tr><td><code>372930</code></td><td>东明县</td><td>停用</td><td>山东省 · 菏泽地区</td><td>1981–1999</td><td><code>371728</code> 东明县</td></tr>
    <tr><td><code>379001</code></td><td>青州市</td><td>停用</td><td>山东省</td><td>1987–1989</td><td><code>370781</code> 青州市</td></tr>
    <tr><td><code>379002</code></td><td>龙口市</td><td>停用</td><td>山东省</td><td>1986–1989</td><td><code>370681</code> 龙口市</td></tr>
    <tr><td><code>379003</code></td><td>曲阜市</td><td>停用</td><td>山东省</td><td>1987–1989</td><td><code>370881</code> 曲阜市</td></tr>
    <tr><td><code>379004</code></td><td>莱芜市</td><td>停用</td><td>山东省</td><td>1986–1989</td><td><code>370981</code> 莱芜市</td></tr>
    <tr><td><code>379005</code></td><td>新泰市</td><td>停用</td><td>山东省</td><td>1986–1989</td><td><code>370982</code> 新泰市</td></tr>
    <tr><td><code>379006</code></td><td>胶州市</td><td>停用</td><td>山东省</td><td>1987–1989</td><td><code>370281</code> 胶州市</td></tr>
    <tr><td><code>379007</code></td><td>诸城市</td><td>停用</td><td>山东省</td><td>1987–1989</td><td><code>370782</code> 诸城市</td></tr>
    <tr><td><code>379008</code></td><td>莱阳市</td><td>停用</td><td>山东省</td><td>1987–1989</td><td><code>370682</code> 莱阳市</td></tr>
    <tr><td><code>379009</code></td><td>莱州市</td><td>停用</td><td>山东省</td><td>1988–1989</td><td><code>370683</code> 莱州市</td></tr>
    <tr><td><code>379010</code></td><td>滕州市</td><td>停用</td><td>山东省</td><td>1988–1989</td><td><code>370481</code> 滕州市</td></tr>
    <tr><td><code>379011</code></td><td>文登市</td><td>停用</td><td>山东省</td><td>1988–1989</td><td><code>371081</code> 文登市</td></tr>
    <tr><td><code>379012</code></td><td>荣成市</td><td>停用</td><td>山东省</td><td>1988–1989</td><td><code>371082</code> 荣成市</td></tr>
    <tr><td><code>379013</code></td><td>即墨市</td><td>停用</td><td>山东省</td><td>1989</td><td><code>370282</code> 即墨市</td></tr>
    <tr><td><code>379014</code></td><td>平度市</td><td>停用</td><td>山东省</td><td>1989</td><td><code>370283</code> 平度市</td></tr>
    <tr><td><code>410107</code></td><td>新密区</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1986</td><td><code>410126</code> 密县</td></tr>
    <tr><td><code>410108</code></td><td>邙山区</td><td>更名</td><td>河南省 · 郑州市</td><td>1987–2002</td><td>代码未变，现名 惠济区</td></tr>
    <tr><td><code>410111</code></td><td>金海区</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1986</td><td><code>410108</code> 惠济区</td></tr>
    <tr><td><code>410112</code></td><td>郊区</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1986</td><td><code>410108</code> 惠济区</td></tr>
    <tr><td><code>410121</code></td><td>荥阳县</td><td>停用</td><td>河南省 · 郑州市</td><td>1981–1993</td><td><code>410182</code> 荥阳市</td></tr>
    <tr><td><code>410123</code></td><td>新郑县</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1993</td><td><code>410184</code> 新郑市</td></tr>
    <tr><td><code>410124</code></td><td>巩县</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1990</td><td><code>410181</code> 巩义市</td></tr>
    <tr><td><code>410125</code></td><td>登封县</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1993</td><td><code>410185</code> 登封市</td></tr>
    <tr><td><code>410126</code></td><td>密县</td><td>停用</td><td>河南省 · 郑州市</td><td>1983–1993</td><td><code>410183</code> 新密市</td></tr>
    <tr><td><code>410205</code></td><td>南关区</td><td>更名</td><td>河南省 · 开封市</td><td>1983–2004</td><td>代码未变，现名 禹王台区</td></tr>
    <tr><td><code>410211</code></td><td>郊区</td><td>更名</td><td>河南省 · 开封市</td><td>1983–2004</td><td>代码未变，现名 郊区</td></tr>
    <tr><td><code>410211</code></td><td>金明区</td><td>停用</td><td>河南省 · 开封市</td><td>2005–2013</td><td><code>410202</code> 龙亭区</td></tr>
    <tr><td><code>410224</code></td><td>开封县</td><td>停用</td><td>河南省 · 开封市</td><td>1983–2013</td><td><code>410204</code> 鼓楼区；<code>410211</code> 郊区；<code>410212</code> 祥符区</td></tr>
    <tr><td><code>410306</code></td><td>吉利区</td><td>停用</td><td>河南省 · 洛阳市</td><td>1983–2020</td><td><code>410308</code> 孟津区</td></tr>
    <tr><td><code>410311</code></td><td>郊区</td><td>更名</td><td>河南省 · 洛阳市</td><td>1983–1999</td><td>代码未变，现名 洛龙区</td></tr>
    <tr><td><code>410321</code></td><td>偃师县</td><td>停用</td><td>河南省 · 洛阳市</td><td>1983–1992</td><td><code>410381</code> 偃师市</td></tr>
    <tr><td><code>410322</code></td><td>孟津县</td><td>停用</td><td>河南省 · 洛阳市</td><td>1983–2020</td><td><code>410308</code> 孟津区</td></tr>
    <tr><td><code>410381</code></td><td>偃师市</td><td>停用</td><td>河南省 · 洛阳市</td><td>1993–2020</td><td><code>410307</code> 偃师区</td></tr>
    <tr><td><code>410411</code></td><td>郊区</td><td>更名</td><td>河南省 · 平顶山市</td><td>1983–1993</td><td>代码未变，现名 湛河区</td></tr>
    <tr><td><code>410412</code></td><td>舞钢区</td><td>停用</td><td>河南省 · 平顶山市</td><td>1983–1989</td><td><code>410481</code> 舞钢市</td></tr>
    <tr><td><code>410424</code></td><td>临汝县</td><td>停用</td><td>河南省 · 平顶山市</td><td>1986–1987</td><td><code>419002</code> 汝州市</td></tr>
    <tr><td><code>410426</code></td><td>襄城县</td><td>停用</td><td>河南省 · 平顶山市</td><td>1986–1996</td><td><code>411025</code> 襄城县</td></tr>
    <tr><td><code>410504</code></td><td>铁西区</td><td>停用</td><td>河南省 · 安阳市</td><td>1983–2001</td><td><code>410505</code> 殷都区</td></tr>
    <tr><td><code>410511</code></td><td>郊区</td><td>停用</td><td>河南省 · 安阳市</td><td>1983–2001</td><td><code>410502</code> 文峰区；<code>410503</code> 北关区；<code>410505</code> 殷都区；<code>410506</code> 龙安区</td></tr>
    <tr><td><code>410521</code></td><td>林县</td><td>停用</td><td>河南省 · 安阳市</td><td>1983–1993</td><td><code>410581</code> 林州市</td></tr>
    <tr><td><code>410524</code></td><td>淇县</td><td>停用</td><td>河南省 · 安阳市</td><td>1983–1985</td><td><code>410622</code> 淇县</td></tr>
    <tr><td><code>410525</code></td><td>浚县</td><td>停用</td><td>河南省 · 安阳市</td><td>1983–1985</td><td><code>410621</code> 浚县</td></tr>
    <tr><td><code>410611</code></td><td>郊区</td><td>更名</td><td>河南省 · 鹤壁市</td><td>1983–2000</td><td>代码未变，现名 淇滨区</td></tr>
    <tr><td><code>410703</code></td><td>新华区</td><td>更名</td><td>河南省 · 新乡市</td><td>1983–2002</td><td>代码未变，现名 卫滨区</td></tr>
    <tr><td><code>410704</code></td><td>北站区</td><td>更名</td><td>河南省 · 新乡市</td><td>1983–2002</td><td>代码未变，现名 凤泉区</td></tr>
    <tr><td><code>410711</code></td><td>郊区</td><td>更名</td><td>河南省 · 新乡市</td><td>1983–2002</td><td>代码未变，现名 牧野区</td></tr>
    <tr><td><code>410722</code></td><td>汲县</td><td>停用</td><td>河南省 · 新乡市</td><td>1983–1987</td><td><code>419005</code> 卫辉市</td></tr>
    <tr><td><code>410723</code></td><td>辉县</td><td>停用</td><td>河南省 · 新乡市</td><td>1986–1987</td><td><code>419006</code> 辉县市</td></tr>
    <tr><td><code>410728</code></td><td>长垣县</td><td>停用</td><td>河南省 · 新乡市</td><td>1986–2018</td><td><code>410783</code> 长垣市</td></tr>
    <tr><td><code>410811</code></td><td>郊区</td><td>更名</td><td>河南省 · 焦作市</td><td>1983–1989</td><td>代码未变，现名 山阳区</td></tr>
    <tr><td><code>410824</code></td><td>沁阳县</td><td>停用</td><td>河南省 · 焦作市</td><td>1986–1988</td><td><code>419007</code> 沁阳市</td></tr>
    <tr><td><code>410826</code></td><td>孟县</td><td>停用</td><td>河南省 · 焦作市</td><td>1986–1995</td><td><code>410883</code> 孟州市</td></tr>
    <tr><td><code>410827</code></td><td>济源县</td><td>停用</td><td>河南省 · 焦作市</td><td>1986–1987</td><td><code>419003</code> 济源市</td></tr>
    <tr><td><code>410881</code></td><td>济源市</td><td>停用</td><td>河南省 · 焦作市</td><td>1990–1995</td><td><code>419001</code> 济源市</td></tr>
    <tr><td><code>410902</code></td><td>市区</td><td>更名</td><td>河南省 · 濮阳市</td><td>1985–2001</td><td>代码未变，现名 华龙区</td></tr>
    <tr><td><code>410911</code></td><td>郊区</td><td>停用</td><td>河南省 · 濮阳市</td><td>1983–1986</td><td><code>410902</code> 华龙区；<code>410928</code> 濮阳县</td></tr>
    <tr><td><code>410921</code></td><td>滑县</td><td>停用</td><td>河南省 · 濮阳市</td><td>1983–1985</td><td><code>410526</code> 滑县</td></tr>
    <tr><td><code>410924</code></td><td>内黄县</td><td>停用</td><td>河南省 · 濮阳市</td><td>1983–1985</td><td><code>410527</code> 内黄县</td></tr>
    <tr><td><code>410925</code></td><td>长垣县</td><td>停用</td><td>河南省 · 濮阳市</td><td>1983–1985</td><td><code>410728</code> 长垣县</td></tr>
    <tr><td><code>411021</code></td><td>禹县</td><td>停用</td><td>河南省 · 许昌市</td><td>1986–1987</td><td><code>419004</code> 禹州市</td></tr>
    <tr><td><code>411022</code></td><td>长葛县</td><td>停用</td><td>河南省 · 许昌市</td><td>1986–1992</td><td><code>411082</code> 长葛市</td></tr>
    <tr><td><code>411023</code></td><td>许昌县</td><td>停用</td><td>河南省 · 许昌市</td><td>1986–2015</td><td><code>411003</code> 建安区</td></tr>
    <tr><td><code>411123</code></td><td>郾城县</td><td>停用</td><td>河南省 · 漯河市</td><td>1986–2003</td><td><code>411102</code> 源汇区；<code>411103</code> 郾城区；<code>411104</code> 召陵区</td></tr>
    <tr><td><code>411219</code></td><td>义马市</td><td>停用</td><td>河南省 · 三门峡市</td><td>1986</td><td><code>419001</code> 济源市</td></tr>
    <tr><td><code>411222</code></td><td>陕县</td><td>停用</td><td>河南省 · 三门峡市</td><td>1986–2014</td><td><code>411203</code> 陕州区</td></tr>
    <tr><td><code>411223</code></td><td>灵宝县</td><td>停用</td><td>河南省 · 三门峡市</td><td>1986–1992</td><td><code>411282</code> 灵宝市</td></tr>
    <tr><td><code>411626</code></td><td>淮阳县</td><td>停用</td><td>河南省 · 周口市</td><td>2000–2018</td><td><code>411602</code> 川汇区；<code>411603</code> 淮阳区</td></tr>
    <tr><td><code>412100</code></td><td>安阳地区</td><td>停用</td><td>河南省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412121</code></td><td>林县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410521</code> 林县</td></tr>
    <tr><td><code>412122</code></td><td>安阳县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410522</code> 安阳县</td></tr>
    <tr><td><code>412123</code></td><td>汤阴县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410523</code> 汤阴县</td></tr>
    <tr><td><code>412124</code></td><td>淇县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410524</code> 淇县</td></tr>
    <tr><td><code>412125</code></td><td>浚县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410525</code> 浚县</td></tr>
    <tr><td><code>412126</code></td><td>濮阳县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410911</code> 郊区</td></tr>
    <tr><td><code>412127</code></td><td>滑县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410921</code> 滑县</td></tr>
    <tr><td><code>412128</code></td><td>清丰县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410922</code> 清丰县</td></tr>
    <tr><td><code>412129</code></td><td>南乐县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410923</code> 南乐县</td></tr>
    <tr><td><code>412130</code></td><td>内黄县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410924</code> 内黄县</td></tr>
    <tr><td><code>412131</code></td><td>长垣县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410925</code> 长垣县</td></tr>
    <tr><td><code>412132</code></td><td>范县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410926</code> 范县</td></tr>
    <tr><td><code>412133</code></td><td>台前县</td><td>停用</td><td>河南省 · 安阳地区</td><td>1981–1982</td><td><code>410927</code> 台前县</td></tr>
    <tr><td><code>412200</code></td><td>新乡地区</td><td>停用</td><td>河南省</td><td>1981–1985</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412221</code></td><td>沁阳县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410824</code> 沁阳县</td></tr>
    <tr><td><code>412222</code></td><td>博爱县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1982</td><td><code>410822</code> 博爱县</td></tr>
    <tr><td><code>412223</code></td><td>济源县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410300</code> 洛阳市；<code>410827</code> 济源县</td></tr>
    <tr><td><code>412224</code></td><td>孟县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410300</code> 洛阳市；<code>410826</code> 孟县</td></tr>
    <tr><td><code>412225</code></td><td>温县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410825</code> 温县</td></tr>
    <tr><td><code>412226</code></td><td>武陟县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410823</code> 武陟县</td></tr>
    <tr><td><code>412227</code></td><td>修武县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1982</td><td><code>410821</code> 修武县</td></tr>
    <tr><td><code>412228</code></td><td>获嘉县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410724</code> 获嘉县</td></tr>
    <tr><td><code>412229</code></td><td>新乡县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1982</td><td><code>410721</code> 新乡县</td></tr>
    <tr><td><code>412230</code></td><td>辉县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410723</code> 辉县</td></tr>
    <tr><td><code>412231</code></td><td>汲县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1982</td><td><code>410722</code> 汲县</td></tr>
    <tr><td><code>412232</code></td><td>原阳县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410725</code> 原阳县</td></tr>
    <tr><td><code>412233</code></td><td>延津县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410726</code> 延津县</td></tr>
    <tr><td><code>412234</code></td><td>封丘县</td><td>停用</td><td>河南省 · 新乡地区</td><td>1981–1985</td><td><code>410727</code> 封丘县</td></tr>
    <tr><td><code>412300</code></td><td>商丘地区</td><td>停用</td><td>河南省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412301</code></td><td>商丘市</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411402</code> 梁园区</td></tr>
    <tr><td><code>412302</code></td><td>永城市</td><td>停用</td><td>河南省 · 商丘地区</td><td>1996</td><td><code>411481</code> 永城市</td></tr>
    <tr><td><code>412321</code></td><td>虞城县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411425</code> 虞城县</td></tr>
    <tr><td><code>412322</code></td><td>商丘县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411402</code> 梁园区；<code>411403</code> 睢阳区</td></tr>
    <tr><td><code>412323</code></td><td>民权县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411421</code> 民权县</td></tr>
    <tr><td><code>412324</code></td><td>宁陵县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411423</code> 宁陵县</td></tr>
    <tr><td><code>412325</code></td><td>睢县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411422</code> 睢县</td></tr>
    <tr><td><code>412326</code></td><td>夏邑县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411426</code> 夏邑县</td></tr>
    <tr><td><code>412327</code></td><td>柘城县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1996</td><td><code>411424</code> 柘城县</td></tr>
    <tr><td><code>412328</code></td><td>永城县</td><td>停用</td><td>河南省 · 商丘地区</td><td>1981–1995</td><td><code>412302</code> 永城市</td></tr>
    <tr><td><code>412400</code></td><td>开封地区</td><td>停用</td><td>河南省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412421</code></td><td>杞县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410221</code> 杞县</td></tr>
    <tr><td><code>412422</code></td><td>通许县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410222</code> 通许县</td></tr>
    <tr><td><code>412423</code></td><td>尉氏县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410223</code> 尉氏县</td></tr>
    <tr><td><code>412424</code></td><td>开封县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410224</code> 开封县</td></tr>
    <tr><td><code>412425</code></td><td>中牟县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410122</code> 中牟县</td></tr>
    <tr><td><code>412426</code></td><td>新郑县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410123</code> 新郑县</td></tr>
    <tr><td><code>412427</code></td><td>巩县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410124</code> 巩县</td></tr>
    <tr><td><code>412428</code></td><td>登封县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410125</code> 登封县</td></tr>
    <tr><td><code>412429</code></td><td>密县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410100</code> 郑州市；<code>410126</code> 密县</td></tr>
    <tr><td><code>412430</code></td><td>兰考县</td><td>停用</td><td>河南省 · 开封地区</td><td>1981–1982</td><td><code>410225</code> 兰考县</td></tr>
    <tr><td><code>412500</code></td><td>洛阳地区</td><td>停用</td><td>河南省</td><td>1981–1985</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412501</code></td><td>三门峡市</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411202</code> 湖滨区</td></tr>
    <tr><td><code>412502</code></td><td>义马市</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411219</code> 义马市</td></tr>
    <tr><td><code>412521</code></td><td>偃师县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1982</td><td><code>410321</code> 偃师县</td></tr>
    <tr><td><code>412522</code></td><td>孟津县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1982</td><td><code>410322</code> 孟津县</td></tr>
    <tr><td><code>412523</code></td><td>新安县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1982</td><td><code>410323</code> 新安县</td></tr>
    <tr><td><code>412524</code></td><td>渑池县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411221</code> 渑池县</td></tr>
    <tr><td><code>412525</code></td><td>陕县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411222</code> 陕县</td></tr>
    <tr><td><code>412526</code></td><td>灵宝县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411223</code> 灵宝县</td></tr>
    <tr><td><code>412527</code></td><td>伊川县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410329</code> 伊川县</td></tr>
    <tr><td><code>412528</code></td><td>汝阳县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410326</code> 汝阳县</td></tr>
    <tr><td><code>412529</code></td><td>嵩县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410325</code> 嵩县</td></tr>
    <tr><td><code>412530</code></td><td>洛宁县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410328</code> 洛宁县</td></tr>
    <tr><td><code>412531</code></td><td>卢氏县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>411224</code> 卢氏县</td></tr>
    <tr><td><code>412532</code></td><td>栾川县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410324</code> 栾川县</td></tr>
    <tr><td><code>412533</code></td><td>临汝县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410424</code> 临汝县</td></tr>
    <tr><td><code>412534</code></td><td>宜阳县</td><td>停用</td><td>河南省 · 洛阳地区</td><td>1981–1985</td><td><code>410327</code> 宜阳县</td></tr>
    <tr><td><code>412600</code></td><td>许昌地区</td><td>停用</td><td>河南省</td><td>1981–1985</td><td><code>410400</code> 平顶山市</td></tr>
    <tr><td><code>412601</code></td><td>许昌市</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411002</code> 魏都区</td></tr>
    <tr><td><code>412602</code></td><td>漯河市</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411102</code> 源汇区</td></tr>
    <tr><td><code>412621</code></td><td>长葛县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411022</code> 长葛县</td></tr>
    <tr><td><code>412622</code></td><td>禹县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411021</code> 禹县</td></tr>
    <tr><td><code>412623</code></td><td>鄢陵县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411024</code> 鄢陵县</td></tr>
    <tr><td><code>412624</code></td><td>许昌县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411023</code> 许昌县</td></tr>
    <tr><td><code>412625</code></td><td>郏县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>410425</code> 郏县</td></tr>
    <tr><td><code>412626</code></td><td>临颍县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411122</code> 临颍县</td></tr>
    <tr><td><code>412627</code></td><td>襄城县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>410426</code> 襄城县</td></tr>
    <tr><td><code>412628</code></td><td>宝丰县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1982</td><td><code>410421</code> 宝丰县</td></tr>
    <tr><td><code>412629</code></td><td>郾城县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411123</code> 郾城县</td></tr>
    <tr><td><code>412630</code></td><td>叶县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1982</td><td><code>410422</code> 叶县</td></tr>
    <tr><td><code>412631</code></td><td>鲁山县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1982</td><td><code>410423</code> 鲁山县</td></tr>
    <tr><td><code>412632</code></td><td>舞阳县</td><td>停用</td><td>河南省 · 许昌地区</td><td>1981–1985</td><td><code>411121</code> 舞阳县</td></tr>
    <tr><td><code>412700</code></td><td>周口地区</td><td>停用</td><td>河南省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412701</code></td><td>周口市</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411602</code> 川汇区</td></tr>
    <tr><td><code>412702</code></td><td>项城市</td><td>停用</td><td>河南省 · 周口地区</td><td>1993–1999</td><td><code>411681</code> 项城市</td></tr>
    <tr><td><code>412721</code></td><td>扶沟县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411621</code> 扶沟县</td></tr>
    <tr><td><code>412722</code></td><td>西华县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>412701</code> 周口市；<code>411622</code> 西华县</td></tr>
    <tr><td><code>412723</code></td><td>商水县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>412701</code> 周口市；<code>411623</code> 商水县</td></tr>
    <tr><td><code>412724</code></td><td>太康县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411627</code> 太康县</td></tr>
    <tr><td><code>412725</code></td><td>鹿邑县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411628</code> 鹿邑县</td></tr>
    <tr><td><code>412726</code></td><td>郸城县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411625</code> 郸城县</td></tr>
    <tr><td><code>412727</code></td><td>淮阳县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>412701</code> 周口市；<code>411626</code> 淮阳县</td></tr>
    <tr><td><code>412728</code></td><td>沈丘县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1999</td><td><code>411624</code> 沈丘县</td></tr>
    <tr><td><code>412729</code></td><td>项城县</td><td>停用</td><td>河南省 · 周口地区</td><td>1981–1992</td><td><code>412702</code> 项城市</td></tr>
    <tr><td><code>412800</code></td><td>驻马店地区</td><td>停用</td><td>河南省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412801</code></td><td>驻马店市</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411702</code> 驿城区</td></tr>
    <tr><td><code>412821</code></td><td>确山县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411725</code> 确山县</td></tr>
    <tr><td><code>412822</code></td><td>泌阳县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411726</code> 泌阳县</td></tr>
    <tr><td><code>412823</code></td><td>遂平县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411728</code> 遂平县</td></tr>
    <tr><td><code>412824</code></td><td>西平县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411721</code> 西平县</td></tr>
    <tr><td><code>412825</code></td><td>上蔡县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411722</code> 上蔡县</td></tr>
    <tr><td><code>412826</code></td><td>汝南县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411727</code> 汝南县</td></tr>
    <tr><td><code>412827</code></td><td>平舆县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411723</code> 平舆县</td></tr>
    <tr><td><code>412828</code></td><td>新蔡县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411729</code> 新蔡县</td></tr>
    <tr><td><code>412829</code></td><td>正阳县</td><td>停用</td><td>河南省 · 驻马店地区</td><td>1981–1999</td><td><code>411724</code> 正阳县</td></tr>
    <tr><td><code>412900</code></td><td>南阳地区</td><td>停用</td><td>河南省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>412901</code></td><td>南阳市</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411302</code> 宛城区；<code>411303</code> 卧龙区</td></tr>
    <tr><td><code>412902</code></td><td>邓州市</td><td>停用</td><td>河南省 · 南阳地区</td><td>1988–1993</td><td><code>411381</code> 邓州市</td></tr>
    <tr><td><code>412921</code></td><td>南召县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411321</code> 南召县</td></tr>
    <tr><td><code>412922</code></td><td>方城县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411322</code> 方城县</td></tr>
    <tr><td><code>412923</code></td><td>西峡县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411323</code> 西峡县</td></tr>
    <tr><td><code>412924</code></td><td>南阳县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>412901</code> 南阳市；<code>411302</code> 宛城区；<code>411303</code> 卧龙区</td></tr>
    <tr><td><code>412925</code></td><td>镇平县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411324</code> 镇平县</td></tr>
    <tr><td><code>412926</code></td><td>内乡县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411325</code> 内乡县</td></tr>
    <tr><td><code>412927</code></td><td>淅川县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411326</code> 淅川县</td></tr>
    <tr><td><code>412928</code></td><td>社旗县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411327</code> 社旗县</td></tr>
    <tr><td><code>412929</code></td><td>唐河县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411328</code> 唐河县</td></tr>
    <tr><td><code>412930</code></td><td>邓县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1987</td><td><code>412902</code> 邓州市</td></tr>
    <tr><td><code>412931</code></td><td>新野县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411329</code> 新野县</td></tr>
    <tr><td><code>412932</code></td><td>桐柏县</td><td>停用</td><td>河南省 · 南阳地区</td><td>1981–1993</td><td><code>411330</code> 桐柏县</td></tr>
    <tr><td><code>413000</code></td><td>信阳地区</td><td>停用</td><td>河南省</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>413001</code></td><td>信阳市</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411502</code> 浉河区；<code>411503</code> 平桥区</td></tr>
    <tr><td><code>413021</code></td><td>息县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411528</code> 息县</td></tr>
    <tr><td><code>413022</code></td><td>淮滨县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411527</code> 淮滨县</td></tr>
    <tr><td><code>413023</code></td><td>信阳县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411502</code> 浉河区；<code>411503</code> 平桥区</td></tr>
    <tr><td><code>413024</code></td><td>潢川县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411526</code> 潢川县</td></tr>
    <tr><td><code>413025</code></td><td>光山县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411522</code> 光山县</td></tr>
    <tr><td><code>413026</code></td><td>固始县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411525</code> 固始县</td></tr>
    <tr><td><code>413027</code></td><td>商城县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411524</code> 商城县</td></tr>
    <tr><td><code>413028</code></td><td>罗山县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411521</code> 罗山县</td></tr>
    <tr><td><code>413029</code></td><td>新县</td><td>停用</td><td>河南省 · 信阳地区</td><td>1981–1997</td><td><code>411523</code> 新县</td></tr>
    <tr><td><code>419001</code></td><td>义马市</td><td>更名</td><td>河南省</td><td>1987–1989</td><td>代码未变，现名 济源市</td></tr>
    <tr><td><code>419002</code></td><td>汝州市</td><td>停用</td><td>河南省</td><td>1988–1989</td><td><code>410482</code> 汝州市</td></tr>
    <tr><td><code>419003</code></td><td>济源市</td><td>停用</td><td>河南省</td><td>1988–1989</td><td><code>410881</code> 济源市</td></tr>
    <tr><td><code>419004</code></td><td>禹州市</td><td>停用</td><td>河南省</td><td>1988–1989</td><td><code>411081</code> 禹州市</td></tr>
    <tr><td><code>419005</code></td><td>卫辉市</td><td>停用</td><td>河南省</td><td>1988–1989</td><td><code>410781</code> 卫辉市</td></tr>
    <tr><td><code>419006</code></td><td>辉县市</td><td>停用</td><td>河南省</td><td>1988–1989</td><td><code>410782</code> 辉县市</td></tr>
    <tr><td><code>419007</code></td><td>沁阳市</td><td>停用</td><td>河南省</td><td>1989</td><td><code>410882</code> 沁阳市</td></tr>
    <tr><td><code>420121</code></td><td>汉阳县</td><td>停用</td><td>湖北省 · 武汉市</td><td>1981–1991</td><td><code>420114</code> 蔡甸区</td></tr>
    <tr><td><code>420122</code></td><td>武昌县</td><td>停用</td><td>湖北省 · 武汉市</td><td>1981–1994</td><td><code>420115</code> 江夏区</td></tr>
    <tr><td><code>420123</code></td><td>黄陂县</td><td>停用</td><td>湖北省 · 武汉市</td><td>1983–1997</td><td><code>420116</code> 黄陂区</td></tr>
    <tr><td><code>420124</code></td><td>新洲县</td><td>停用</td><td>湖北省 · 武汉市</td><td>1983–1997</td><td><code>420117</code> 新洲区</td></tr>
    <tr><td><code>420203</code></td><td>石灰窑区</td><td>更名</td><td>湖北省 · 黄石市</td><td>1983–2000</td><td>代码未变，现名 西塞山区</td></tr>
    <tr><td><code>420221</code></td><td>大冶县</td><td>停用</td><td>湖北省 · 黄石市</td><td>1981–1993</td><td><code>420281</code> 大冶市</td></tr>
    <tr><td><code>420321</code></td><td>郧县</td><td>停用</td><td>湖北省 · 十堰市</td><td>1994–2013</td><td><code>420304</code> 郧阳区</td></tr>
    <tr><td><code>420400</code></td><td>沙市市</td><td>停用</td><td>湖北省</td><td>1981–1993</td><td><code>421002</code> 沙市区</td></tr>
    <tr><td><code>420521</code></td><td>宜昌县</td><td>停用</td><td>湖北省 · 宜昌市</td><td>1992–2000</td><td><code>420504</code> 点军区；<code>420506</code> 夷陵区</td></tr>
    <tr><td><code>420523</code></td><td>枝江县</td><td>停用</td><td>湖北省 · 宜昌市</td><td>1992–1995</td><td><code>420505</code> 猇亭区；<code>420583</code> 枝江市</td></tr>
    <tr><td><code>420581</code></td><td>枝城市</td><td>更名</td><td>湖北省 · 宜昌市</td><td>1992–1997</td><td>代码未变，现名 宜都市</td></tr>
    <tr><td><code>420600</code></td><td>襄樊市</td><td>更名</td><td>湖北省</td><td>1981–2009</td><td>代码未变，现名 襄阳市</td></tr>
    <tr><td><code>420602</code></td><td>襄城区</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1984–2009</td><td>代码未变，现名 襄城区</td></tr>
    <tr><td><code>420603</code></td><td>樊东区</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1984–1994</td><td><code>420606</code> 樊城区</td></tr>
    <tr><td><code>420604</code></td><td>樊西区</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1984–1994</td><td><code>420606</code> 樊城区</td></tr>
    <tr><td><code>420605</code></td><td>郊区</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1984–1994</td><td><code>420602</code> 襄城区；<code>420606</code> 樊城区</td></tr>
    <tr><td><code>420606</code></td><td>樊城区</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1995–2009</td><td>代码未变，现名 樊城区</td></tr>
    <tr><td><code>420607</code></td><td>襄阳区</td><td>更名</td><td>湖北省 · 襄樊市</td><td>2001–2009</td><td>代码未变，现名 襄州区</td></tr>
    <tr><td><code>420619</code></td><td>随州市</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1983–1985</td><td><code>429001</code> 随州市</td></tr>
    <tr><td><code>420620</code></td><td>老河口市</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1983–1985</td><td><code>429002</code> 老河口市</td></tr>
    <tr><td><code>420621</code></td><td>襄阳县</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1983–2000</td><td><code>420605</code> 郊区；<code>420602</code> 襄城区；<code>420606</code> 樊城区；<code>420607</code> 襄州区</td></tr>
    <tr><td><code>420622</code></td><td>枣阳县</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1983–1987</td><td><code>429003</code> 枣阳市</td></tr>
    <tr><td><code>420623</code></td><td>宜城县</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1983–1993</td><td><code>420684</code> 宜城市</td></tr>
    <tr><td><code>420624</code></td><td>南漳县</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1983–2009</td><td>代码未变，现名 南漳县</td></tr>
    <tr><td><code>420625</code></td><td>谷城县</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1983–2009</td><td>代码未变，现名 谷城县</td></tr>
    <tr><td><code>420626</code></td><td>保康县</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1983–2009</td><td>代码未变，现名 保康县</td></tr>
    <tr><td><code>420681</code></td><td>随州市</td><td>停用</td><td>湖北省 · 襄樊市</td><td>1990–1993</td><td><code>429001</code> 随州市</td></tr>
    <tr><td><code>420682</code></td><td>老河口市</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1990–2009</td><td>代码未变，现名 老河口市</td></tr>
    <tr><td><code>420683</code></td><td>枣阳市</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1990–2009</td><td>代码未变，现名 枣阳市</td></tr>
    <tr><td><code>420684</code></td><td>宜城市</td><td>更名</td><td>湖北省 · 襄樊市</td><td>1994–2009</td><td>代码未变，现名 宜城市</td></tr>
    <tr><td><code>420703</code></td><td>黄州区</td><td>更名</td><td>湖北省 · 鄂州市</td><td>1984–1986</td><td>代码未变，现名 华容区</td></tr>
    <tr><td><code>420803</code></td><td>沙洋区</td><td>停用</td><td>湖北省 · 荆门市</td><td>1985–1997</td><td><code>420822</code> 沙洋县</td></tr>
    <tr><td><code>420821</code></td><td>京山县</td><td>停用</td><td>湖北省 · 荆门市</td><td>1996–2017</td><td><code>420882</code> 京山市</td></tr>
    <tr><td><code>420924</code></td><td>汉川县</td><td>停用</td><td>湖北省 · 孝感市</td><td>1993–1996</td><td><code>420984</code> 汉川市</td></tr>
    <tr><td><code>420983</code></td><td>广水市</td><td>停用</td><td>湖北省 · 孝感市</td><td>1993–1999</td><td><code>421381</code> 广水市</td></tr>
    <tr><td><code>421000</code></td><td>荆沙市</td><td>更名</td><td>湖北省</td><td>1994–1995</td><td>代码未变，现名 荆州市</td></tr>
    <tr><td><code>421002</code></td><td>沙市区</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 沙市区</td></tr>
    <tr><td><code>421003</code></td><td>荆州区</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 荆州区</td></tr>
    <tr><td><code>421004</code></td><td>江陵区</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 江陵区</td></tr>
    <tr><td><code>421004</code></td><td>江陵区</td><td>停用</td><td>湖北省 · 荆州市</td><td>1996–1997</td><td><code>421024</code> 江陵县</td></tr>
    <tr><td><code>421022</code></td><td>公安县</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 公安县</td></tr>
    <tr><td><code>421023</code></td><td>监利县</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 监利县</td></tr>
    <tr><td><code>421023</code></td><td>监利县</td><td>停用</td><td>湖北省 · 荆州市</td><td>1996–2019</td><td><code>421088</code> 监利市</td></tr>
    <tr><td><code>421024</code></td><td>松滋县</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994</td><td>代码未变，现名 江陵县</td></tr>
    <tr><td><code>421025</code></td><td>京山县</td><td>停用</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td><code>420821</code> 京山县</td></tr>
    <tr><td><code>421081</code></td><td>石首市</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 石首市</td></tr>
    <tr><td><code>421082</code></td><td>钟祥市</td><td>停用</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td><code>420881</code> 钟祥市</td></tr>
    <tr><td><code>421083</code></td><td>洪湖市</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1994–1995</td><td>代码未变，现名 洪湖市</td></tr>
    <tr><td><code>421087</code></td><td>松滋市</td><td>更名</td><td>湖北省 · 荆沙市</td><td>1995</td><td>代码未变，现名 松滋市</td></tr>
    <tr><td><code>421302</code></td><td>曾都区</td><td>停用</td><td>湖北省 · 随州市</td><td>2000–2008</td><td><code>421303</code> 曾都区；<code>421321</code> 随县</td></tr>
    <tr><td><code>422100</code></td><td>黄冈地区</td><td>停用</td><td>湖北省</td><td>1981–1994</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422101</code></td><td>鄂城市</td><td>更名</td><td>湖北省 · 黄冈地区</td><td>1981–1982</td><td>代码未变，现名 鄂城市</td></tr>
    <tr><td><code>422101</code></td><td>麻城市</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1986–1994</td><td><code>421181</code> 麻城市</td></tr>
    <tr><td><code>422102</code></td><td>武穴市</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1987–1994</td><td><code>421182</code> 武穴市</td></tr>
    <tr><td><code>422103</code></td><td>黄州市</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1990–1994</td><td><code>421102</code> 黄州区；<code>421121</code> 团风县</td></tr>
    <tr><td><code>422121</code></td><td>黄冈县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1989</td><td><code>420700</code> 鄂州市；<code>422103</code> 黄州市</td></tr>
    <tr><td><code>422122</code></td><td>新洲县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1982</td><td><code>420124</code> 新洲县</td></tr>
    <tr><td><code>422123</code></td><td>红安县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421122</code> 红安县</td></tr>
    <tr><td><code>422124</code></td><td>麻城县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1985</td><td><code>422101</code> 鄂城市</td></tr>
    <tr><td><code>422125</code></td><td>罗田县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421123</code> 罗田县</td></tr>
    <tr><td><code>422126</code></td><td>英山县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421124</code> 英山县</td></tr>
    <tr><td><code>422127</code></td><td>浠水县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421125</code> 浠水县</td></tr>
    <tr><td><code>422128</code></td><td>蕲春县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421126</code> 蕲春县</td></tr>
    <tr><td><code>422129</code></td><td>广济县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1986</td><td><code>422102</code> 武穴市</td></tr>
    <tr><td><code>422130</code></td><td>黄梅县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1994</td><td><code>421127</code> 黄梅县</td></tr>
    <tr><td><code>422131</code></td><td>鄂城县</td><td>停用</td><td>湖北省 · 黄冈地区</td><td>1981–1982</td><td><code>420700</code> 鄂州市</td></tr>
    <tr><td><code>422200</code></td><td>孝感地区</td><td>停用</td><td>湖北省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422201</code></td><td>孝感市</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1983–1992</td><td><code>420902</code> 孝南区；<code>420921</code> 孝昌县</td></tr>
    <tr><td><code>422202</code></td><td>应城市</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1986–1992</td><td><code>420981</code> 应城市</td></tr>
    <tr><td><code>422203</code></td><td>安陆市</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1987–1992</td><td><code>420982</code> 安陆市</td></tr>
    <tr><td><code>422204</code></td><td>广水市</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1988–1992</td><td><code>420983</code> 广水市</td></tr>
    <tr><td><code>422221</code></td><td>孝感县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1982</td><td><code>422201</code> 孝感市</td></tr>
    <tr><td><code>422222</code></td><td>黄陂县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1982</td><td><code>420123</code> 黄陂县</td></tr>
    <tr><td><code>422223</code></td><td>大悟县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1992</td><td><code>420922</code> 大悟县</td></tr>
    <tr><td><code>422224</code></td><td>应山县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1987</td><td><code>422204</code> 广水市</td></tr>
    <tr><td><code>422225</code></td><td>安陆县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1986</td><td><code>422203</code> 安陆市</td></tr>
    <tr><td><code>422226</code></td><td>云梦县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1992</td><td><code>420923</code> 云梦县</td></tr>
    <tr><td><code>422227</code></td><td>应城县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1985</td><td><code>422202</code> 应城市</td></tr>
    <tr><td><code>422228</code></td><td>汉川县</td><td>停用</td><td>湖北省 · 孝感地区</td><td>1981–1992</td><td><code>420924</code> 汉川县</td></tr>
    <tr><td><code>422300</code></td><td>咸宁地区</td><td>停用</td><td>湖北省</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422301</code></td><td>咸宁市</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1983–1997</td><td><code>421202</code> 咸安区</td></tr>
    <tr><td><code>422302</code></td><td>蒲圻市</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1986–1997</td><td><code>421281</code> 赤壁市</td></tr>
    <tr><td><code>422321</code></td><td>咸宁县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1982</td><td><code>422301</code> 咸宁市</td></tr>
    <tr><td><code>422322</code></td><td>嘉鱼县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1997</td><td><code>421221</code> 嘉鱼县</td></tr>
    <tr><td><code>422323</code></td><td>蒲圻县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1985</td><td><code>422302</code> 蒲圻市</td></tr>
    <tr><td><code>422324</code></td><td>通城县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1997</td><td><code>421222</code> 通城县</td></tr>
    <tr><td><code>422325</code></td><td>崇阳县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1997</td><td><code>421223</code> 崇阳县</td></tr>
    <tr><td><code>422326</code></td><td>通山县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1997</td><td><code>421224</code> 通山县</td></tr>
    <tr><td><code>422327</code></td><td>阳新县</td><td>停用</td><td>湖北省 · 咸宁地区</td><td>1981–1995</td><td><code>420222</code> 阳新县</td></tr>
    <tr><td><code>422400</code></td><td>荆州地区</td><td>停用</td><td>湖北省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422401</code></td><td>荆门市</td><td>更名</td><td>湖北省 · 荆州地区</td><td>1981–1982</td><td>代码未变，现名 荆门市</td></tr>
    <tr><td><code>422401</code></td><td>仙桃市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1986–1993</td><td><code>429004</code> 仙桃市</td></tr>
    <tr><td><code>422402</code></td><td>石首市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1986–1993</td><td><code>421081</code> 石首市</td></tr>
    <tr><td><code>422403</code></td><td>洪湖市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1987–1993</td><td><code>421083</code> 洪湖市</td></tr>
    <tr><td><code>422404</code></td><td>天门市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1987–1993</td><td><code>429006</code> 天门市</td></tr>
    <tr><td><code>422405</code></td><td>潜江市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1988–1993</td><td><code>429005</code> 潜江市</td></tr>
    <tr><td><code>422406</code></td><td>钟祥市</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1992–1993</td><td><code>421082</code> 钟祥市</td></tr>
    <tr><td><code>422421</code></td><td>江陵县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1993</td><td><code>420400</code> 沙市市；<code>421003</code> 荆州区；<code>421004</code> 江陵区</td></tr>
    <tr><td><code>422422</code></td><td>松滋县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1993</td><td><code>421024</code> 江陵县</td></tr>
    <tr><td><code>422423</code></td><td>公安县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1993</td><td><code>421022</code> 公安县</td></tr>
    <tr><td><code>422424</code></td><td>石首县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1985</td><td><code>422402</code> 石首市</td></tr>
    <tr><td><code>422425</code></td><td>监利县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1993</td><td><code>421023</code> 监利县</td></tr>
    <tr><td><code>422426</code></td><td>洪湖县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1986</td><td><code>422403</code> 洪湖市</td></tr>
    <tr><td><code>422427</code></td><td>沔阳县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1985</td><td><code>422401</code> 荆门市</td></tr>
    <tr><td><code>422428</code></td><td>天门县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1986</td><td><code>422404</code> 天门市</td></tr>
    <tr><td><code>422429</code></td><td>潜江县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1987</td><td><code>422405</code> 潜江市</td></tr>
    <tr><td><code>422430</code></td><td>荆门县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1982</td><td><code>420800</code> 荆门市</td></tr>
    <tr><td><code>422431</code></td><td>钟祥县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1991</td><td><code>422406</code> 钟祥市</td></tr>
    <tr><td><code>422432</code></td><td>京山县</td><td>停用</td><td>湖北省 · 荆州地区</td><td>1981–1993</td><td><code>421025</code> 京山县</td></tr>
    <tr><td><code>422500</code></td><td>襄阳地区</td><td>停用</td><td>湖北省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422501</code></td><td>随州市</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420619</code> 随州市</td></tr>
    <tr><td><code>422502</code></td><td>老河口市</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420620</code> 老河口市</td></tr>
    <tr><td><code>422521</code></td><td>襄阳县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420621</code> 襄阳县</td></tr>
    <tr><td><code>422522</code></td><td>枣阳县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420622</code> 枣阳县</td></tr>
    <tr><td><code>422523</code></td><td>随县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420619</code> 随州市</td></tr>
    <tr><td><code>422524</code></td><td>宜城县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420623</code> 宜城县</td></tr>
    <tr><td><code>422525</code></td><td>南漳县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420624</code> 南漳县</td></tr>
    <tr><td><code>422526</code></td><td>光化县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420620</code> 老河口市</td></tr>
    <tr><td><code>422527</code></td><td>谷城县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420625</code> 谷城县</td></tr>
    <tr><td><code>422528</code></td><td>保康县</td><td>停用</td><td>湖北省 · 襄阳地区</td><td>1981–1982</td><td><code>420626</code> 保康县</td></tr>
    <tr><td><code>422600</code></td><td>郧阳地区</td><td>停用</td><td>湖北省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422601</code></td><td>丹江口市</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1983–1993</td><td><code>420381</code> 丹江口市</td></tr>
    <tr><td><code>422621</code></td><td>均县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1982</td><td><code>422601</code> 丹江口市</td></tr>
    <tr><td><code>422622</code></td><td>郧县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1993</td><td><code>420321</code> 郧县</td></tr>
    <tr><td><code>422623</code></td><td>郧西县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1993</td><td><code>420322</code> 郧西县</td></tr>
    <tr><td><code>422624</code></td><td>竹山县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1993</td><td><code>420323</code> 竹山县</td></tr>
    <tr><td><code>422625</code></td><td>竹溪县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1993</td><td><code>420324</code> 竹溪县</td></tr>
    <tr><td><code>422626</code></td><td>房县</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1993</td><td><code>420325</code> 房县</td></tr>
    <tr><td><code>422627</code></td><td>神农架林区</td><td>停用</td><td>湖北省 · 郧阳地区</td><td>1981–1982</td><td><code>422921</code> 神农架林区</td></tr>
    <tr><td><code>422700</code></td><td>宜昌地区</td><td>停用</td><td>湖北省</td><td>1981–1991</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>422701</code></td><td>枝城市</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1987–1991</td><td><code>420581</code> 宜都市</td></tr>
    <tr><td><code>422702</code></td><td>当阳市</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1988–1991</td><td><code>420582</code> 当阳市</td></tr>
    <tr><td><code>422721</code></td><td>宜昌县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1991</td><td><code>420500</code> 宜昌市；<code>420521</code> 宜昌县</td></tr>
    <tr><td><code>422722</code></td><td>宜都县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1986</td><td><code>422701</code> 枝城市</td></tr>
    <tr><td><code>422723</code></td><td>枝江县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1991</td><td><code>420523</code> 枝江县</td></tr>
    <tr><td><code>422724</code></td><td>当阳县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1987</td><td><code>422702</code> 当阳市</td></tr>
    <tr><td><code>422725</code></td><td>远安县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1991</td><td><code>420525</code> 远安县</td></tr>
    <tr><td><code>422726</code></td><td>兴山县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1991</td><td><code>420526</code> 兴山县</td></tr>
    <tr><td><code>422727</code></td><td>秭归县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1981–1991</td><td><code>420527</code> 秭归县</td></tr>
    <tr><td><code>422728</code></td><td>长阳县</td><td>更名</td><td>湖北省 · 宜昌地区</td><td>1981–1983</td><td>代码未变，现名 长阳县</td></tr>
    <tr><td><code>422728</code></td><td>长阳土家族自治县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1984–1991</td><td><code>420528</code> 长阳土家族自治县</td></tr>
    <tr><td><code>422729</code></td><td>五峰县</td><td>更名</td><td>湖北省 · 宜昌地区</td><td>1981–1983</td><td>代码未变，现名 五峰县</td></tr>
    <tr><td><code>422729</code></td><td>五峰土家族自治县</td><td>停用</td><td>湖北省 · 宜昌地区</td><td>1984–1991</td><td><code>420529</code> 五峰土家族自治县</td></tr>
    <tr><td><code>422800</code></td><td>恩施地区</td><td>更名</td><td>湖北省</td><td>1981–1982</td><td>代码未变，现名 恩施土家族苗族自治州</td></tr>
    <tr><td><code>422800</code></td><td>鄂西土家族苗族自治州</td><td>更名</td><td>湖北省</td><td>1983–1992</td><td>代码未变，现名 恩施土家族苗族自治州</td></tr>
    <tr><td><code>422801</code></td><td>恩施市</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 恩施市</td></tr>
    <tr><td><code>422801</code></td><td>恩施市</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 恩施市</td></tr>
    <tr><td><code>422802</code></td><td>利川市</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1986–1992</td><td>代码未变，现名 利川市</td></tr>
    <tr><td><code>422821</code></td><td>恩施县</td><td>停用</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td><code>422801</code> 恩施市</td></tr>
    <tr><td><code>422822</code></td><td>建始县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 建始县</td></tr>
    <tr><td><code>422822</code></td><td>建始县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 建始县</td></tr>
    <tr><td><code>422823</code></td><td>巴东县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 巴东县</td></tr>
    <tr><td><code>422823</code></td><td>巴东县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 巴东县</td></tr>
    <tr><td><code>422824</code></td><td>利川县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 利川县</td></tr>
    <tr><td><code>422824</code></td><td>利川县</td><td>停用</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1985</td><td><code>422802</code> 利川市</td></tr>
    <tr><td><code>422825</code></td><td>宣恩县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 宣恩县</td></tr>
    <tr><td><code>422825</code></td><td>宣恩县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 宣恩县</td></tr>
    <tr><td><code>422826</code></td><td>咸丰县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 咸丰县</td></tr>
    <tr><td><code>422826</code></td><td>咸丰县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 咸丰县</td></tr>
    <tr><td><code>422827</code></td><td>来凤土家族自治县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 来凤县</td></tr>
    <tr><td><code>422827</code></td><td>来凤县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 来凤县</td></tr>
    <tr><td><code>422828</code></td><td>鹤峰土家族自治县</td><td>更名</td><td>湖北省 · 恩施地区</td><td>1981–1982</td><td>代码未变，现名 鹤峰县</td></tr>
    <tr><td><code>422828</code></td><td>鹤峰县</td><td>更名</td><td>湖北省 · 鄂西土家族苗族自治州</td><td>1983–1992</td><td>代码未变，现名 鹤峰县</td></tr>
    <tr><td><code>422921</code></td><td>神农架林区</td><td>更名</td><td>湖北省</td><td>1983–1985</td><td>代码未变，现名 神农架林区</td></tr>
    <tr><td><code>422921</code></td><td>神农架林区</td><td>停用</td><td>湖北省</td><td>1990–1993</td><td><code>429021</code> 神农架林区</td></tr>
    <tr><td><code>429001</code></td><td>随州市</td><td>更名</td><td>湖北省</td><td>1986–1989</td><td>代码未变，现名 随州市</td></tr>
    <tr><td><code>429001</code></td><td>随州市</td><td>停用</td><td>湖北省</td><td>1994–1999</td><td><code>421302</code> 曾都区</td></tr>
    <tr><td><code>429002</code></td><td>老河口市</td><td>停用</td><td>湖北省</td><td>1986–1989</td><td><code>420682</code> 老河口市</td></tr>
    <tr><td><code>429003</code></td><td>枣阳市</td><td>停用</td><td>湖北省</td><td>1988–1989</td><td><code>420683</code> 枣阳市</td></tr>
    <tr><td><code>429021</code></td><td>神农架林区</td><td>更名</td><td>湖北省</td><td>1986–1989</td><td>代码未变，现名 神农架林区</td></tr>
    <tr><td><code>430102</code></td><td>东区</td><td>更名</td><td>湖南省 · 长沙市</td><td>1983–1995</td><td>代码未变，现名 芙蓉区</td></tr>
    <tr><td><code>430103</code></td><td>南区</td><td>更名</td><td>湖南省 · 长沙市</td><td>1983–1995</td><td>代码未变，现名 天心区</td></tr>
    <tr><td><code>430104</code></td><td>西区</td><td>更名</td><td>湖南省 · 长沙市</td><td>1983–1995</td><td>代码未变，现名 岳麓区</td></tr>
    <tr><td><code>430105</code></td><td>北区</td><td>更名</td><td>湖南省 · 长沙市</td><td>1983–1995</td><td>代码未变，现名 开福区</td></tr>
    <tr><td><code>430111</code></td><td>郊区</td><td>更名</td><td>湖南省 · 长沙市</td><td>1983–1995</td><td>代码未变，现名 雨花区</td></tr>
    <tr><td><code>430122</code></td><td>望城县</td><td>停用</td><td>湖南省 · 长沙市</td><td>1981–2010</td><td><code>430104</code> 岳麓区；<code>430105</code> 开福区；<code>430112</code> 望城区</td></tr>
    <tr><td><code>430123</code></td><td>浏阳县</td><td>停用</td><td>湖南省 · 长沙市</td><td>1983–1992</td><td><code>430181</code> 浏阳市</td></tr>
    <tr><td><code>430124</code></td><td>宁乡县</td><td>停用</td><td>湖南省 · 长沙市</td><td>1983–2016</td><td><code>430182</code> 宁乡市</td></tr>
    <tr><td><code>430202</code></td><td>东区</td><td>更名</td><td>湖南省 · 株洲市</td><td>1983–1996</td><td>代码未变，现名 荷塘区</td></tr>
    <tr><td><code>430203</code></td><td>北区</td><td>更名</td><td>湖南省 · 株洲市</td><td>1983–1996</td><td>代码未变，现名 芦淞区</td></tr>
    <tr><td><code>430204</code></td><td>南区</td><td>更名</td><td>湖南省 · 株洲市</td><td>1983–1996</td><td>代码未变，现名 石峰区</td></tr>
    <tr><td><code>430211</code></td><td>郊区</td><td>更名</td><td>湖南省 · 株洲市</td><td>1983–1996</td><td>代码未变，现名 天元区</td></tr>
    <tr><td><code>430219</code></td><td>醴陵市</td><td>停用</td><td>湖南省 · 株洲市</td><td>1985</td><td><code>439001</code> 醴陵市</td></tr>
    <tr><td><code>430221</code></td><td>株洲县</td><td>停用</td><td>湖南省 · 株洲市</td><td>1981–2017</td><td><code>430211</code> 天元区；<code>430211</code> 天元区；<code>430212</code> 渌口区</td></tr>
    <tr><td><code>430222</code></td><td>醴陵县</td><td>停用</td><td>湖南省 · 株洲市</td><td>1983–1984</td><td><code>430219</code> 醴陵市</td></tr>
    <tr><td><code>430225</code></td><td>酃县</td><td>更名</td><td>湖南省 · 株洲市</td><td>1983–1993</td><td>代码未变，现名 炎陵县</td></tr>
    <tr><td><code>430303</code></td><td>湘江区</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1983–1991</td><td><code>430302</code> 雨湖区</td></tr>
    <tr><td><code>430305</code></td><td>板塘区</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1983–1991</td><td><code>430304</code> 岳塘区</td></tr>
    <tr><td><code>430306</code></td><td>韶山区</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1988–1989</td><td><code>430382</code> 韶山市</td></tr>
    <tr><td><code>430311</code></td><td>郊区</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1983–1991</td><td><code>430302</code> 雨湖区；<code>430304</code> 岳塘区</td></tr>
    <tr><td><code>430312</code></td><td>韶山区</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1984–1987</td><td><code>430306</code> 韶山区</td></tr>
    <tr><td><code>430322</code></td><td>湘乡县</td><td>停用</td><td>湖南省 · 湘潭市</td><td>1983–1985</td><td><code>439002</code> 湘乡市</td></tr>
    <tr><td><code>430402</code></td><td>江东区</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–2000</td><td><code>430405</code> 珠晖区</td></tr>
    <tr><td><code>430403</code></td><td>城南区</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–2000</td><td><code>430406</code> 雁峰区；<code>430408</code> 蒸湘区</td></tr>
    <tr><td><code>430404</code></td><td>城北区</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–2000</td><td><code>430407</code> 石鼓区；<code>430408</code> 蒸湘区</td></tr>
    <tr><td><code>430411</code></td><td>郊区</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–2000</td><td><code>430405</code> 珠晖区；<code>430406</code> 雁峰区；<code>430407</code> 石鼓区；<code>430408</code> 蒸湘区</td></tr>
    <tr><td><code>430425</code></td><td>常宁县</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–1995</td><td><code>430482</code> 常宁市</td></tr>
    <tr><td><code>430427</code></td><td>耒阳县</td><td>停用</td><td>湖南省 · 衡阳市</td><td>1983–1985</td><td><code>439003</code> 耒阳市</td></tr>
    <tr><td><code>430502</code></td><td>东区</td><td>更名</td><td>湖南省 · 邵阳市</td><td>1983–1996</td><td>代码未变，现名 双清区</td></tr>
    <tr><td><code>430503</code></td><td>西区</td><td>更名</td><td>湖南省 · 邵阳市</td><td>1983–1996</td><td>代码未变，现名 大祥区</td></tr>
    <tr><td><code>430504</code></td><td>桥头区</td><td>停用</td><td>湖南省 · 邵阳市</td><td>1983–1986</td><td><code>430502</code> 双清区</td></tr>
    <tr><td><code>430511</code></td><td>郊区</td><td>更名</td><td>湖南省 · 邵阳市</td><td>1983–1996</td><td>代码未变，现名 北塔区</td></tr>
    <tr><td><code>430521</code></td><td>邵东县</td><td>停用</td><td>湖南省 · 邵阳市</td><td>1983–2018</td><td><code>430582</code> 邵东市</td></tr>
    <tr><td><code>430526</code></td><td>武冈县</td><td>停用</td><td>湖南省 · 邵阳市</td><td>1986–1993</td><td><code>430581</code> 武冈市</td></tr>
    <tr><td><code>430602</code></td><td>南区</td><td>更名</td><td>湖南省 · 岳阳市</td><td>1984–1995</td><td>代码未变，现名 岳阳楼区</td></tr>
    <tr><td><code>430603</code></td><td>北区</td><td>更名</td><td>湖南省 · 岳阳市</td><td>1984–1995</td><td>代码未变，现名 云溪区</td></tr>
    <tr><td><code>430611</code></td><td>郊区</td><td>更名</td><td>湖南省 · 岳阳市</td><td>1984–1995</td><td>代码未变，现名 君山区</td></tr>
    <tr><td><code>430622</code></td><td>临湘县</td><td>停用</td><td>湖南省 · 岳阳市</td><td>1986–1991</td><td><code>430682</code> 临湘市</td></tr>
    <tr><td><code>430625</code></td><td>汨罗县</td><td>停用</td><td>湖南省 · 岳阳市</td><td>1986</td><td><code>439004</code> 汨罗市</td></tr>
    <tr><td><code>430800</code></td><td>大庸市</td><td>更名</td><td>湖南省</td><td>1988–1993</td><td>代码未变，现名 张家界市</td></tr>
    <tr><td><code>430802</code></td><td>永定区</td><td>更名</td><td>湖南省 · 大庸市</td><td>1988–1993</td><td>代码未变，现名 永定区</td></tr>
    <tr><td><code>430811</code></td><td>武陵源区</td><td>更名</td><td>湖南省 · 大庸市</td><td>1988–1993</td><td>代码未变，现名 武陵源区</td></tr>
    <tr><td><code>430821</code></td><td>慈利县</td><td>更名</td><td>湖南省 · 大庸市</td><td>1988–1993</td><td>代码未变，现名 慈利县</td></tr>
    <tr><td><code>430822</code></td><td>桑植县</td><td>更名</td><td>湖南省 · 大庸市</td><td>1988–1993</td><td>代码未变，现名 桑植县</td></tr>
    <tr><td><code>431102</code></td><td>芝山区</td><td>更名</td><td>湖南省 · 永州市</td><td>1995–2004</td><td>代码未变，现名 零陵区</td></tr>
    <tr><td><code>431121</code></td><td>祁阳县</td><td>停用</td><td>湖南省 · 永州市</td><td>1995–2020</td><td><code>431181</code> 祁阳市</td></tr>
    <tr><td><code>432100</code></td><td>湘潭地区</td><td>停用</td><td>湖南省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432121</code></td><td>湘潭县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430321</code> 湘潭县</td></tr>
    <tr><td><code>432122</code></td><td>湘乡县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430322</code> 湘乡县</td></tr>
    <tr><td><code>432123</code></td><td>醴陵县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430222</code> 醴陵县</td></tr>
    <tr><td><code>432124</code></td><td>浏阳县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430123</code> 浏阳县</td></tr>
    <tr><td><code>432125</code></td><td>攸县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430223</code> 攸县</td></tr>
    <tr><td><code>432126</code></td><td>茶陵县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430224</code> 茶陵县</td></tr>
    <tr><td><code>432127</code></td><td>酃县</td><td>停用</td><td>湖南省 · 湘潭地区</td><td>1981–1982</td><td><code>430225</code> 炎陵县</td></tr>
    <tr><td><code>432200</code></td><td>岳阳地区</td><td>停用</td><td>湖南省</td><td>1981–1985</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432201</code></td><td>岳阳市</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1982</td><td><code>430600</code> 岳阳市；<code>430621</code> 岳阳县</td></tr>
    <tr><td><code>432222</code></td><td>平江县</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1985</td><td><code>430626</code> 平江县</td></tr>
    <tr><td><code>432223</code></td><td>湘阴县</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1985</td><td><code>430624</code> 湘阴县</td></tr>
    <tr><td><code>432224</code></td><td>汨罗县</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1985</td><td><code>430625</code> 汨罗县</td></tr>
    <tr><td><code>432225</code></td><td>临湘县</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1985</td><td><code>430603</code> 云溪区；<code>430622</code> 临湘县</td></tr>
    <tr><td><code>432226</code></td><td>华容县</td><td>停用</td><td>湖南省 · 岳阳地区</td><td>1981–1985</td><td><code>430623</code> 华容县</td></tr>
    <tr><td><code>432300</code></td><td>益阳地区</td><td>停用</td><td>湖南省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432301</code></td><td>益阳市</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1993</td><td><code>430902</code> 资阳区；<code>430903</code> 赫山区</td></tr>
    <tr><td><code>432302</code></td><td>沅江市</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1988–1993</td><td><code>430981</code> 沅江市</td></tr>
    <tr><td><code>432321</code></td><td>益阳县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1993</td><td><code>432301</code> 益阳市；<code>430902</code> 资阳区；<code>430903</code> 赫山区</td></tr>
    <tr><td><code>432322</code></td><td>南县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1993</td><td><code>430921</code> 南县</td></tr>
    <tr><td><code>432323</code></td><td>沅江县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1987</td><td><code>432302</code> 沅江市</td></tr>
    <tr><td><code>432324</code></td><td>宁乡县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1982</td><td><code>430124</code> 宁乡县</td></tr>
    <tr><td><code>432325</code></td><td>桃江县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1993</td><td><code>430922</code> 桃江县</td></tr>
    <tr><td><code>432326</code></td><td>安化县</td><td>停用</td><td>湖南省 · 益阳地区</td><td>1981–1993</td><td><code>430923</code> 安化县</td></tr>
    <tr><td><code>432400</code></td><td>常德地区</td><td>停用</td><td>湖南省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432401</code></td><td>常德市</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430702</code> 武陵区</td></tr>
    <tr><td><code>432402</code></td><td>津市市</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>439005</code> 津市市</td></tr>
    <tr><td><code>432421</code></td><td>常德县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430702</code> 武陵区；<code>430703</code> 鼎城区</td></tr>
    <tr><td><code>432422</code></td><td>安乡县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430721</code> 安乡县</td></tr>
    <tr><td><code>432423</code></td><td>汉寿县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430722</code> 汉寿县</td></tr>
    <tr><td><code>432424</code></td><td>澧县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430723</code> 澧县</td></tr>
    <tr><td><code>432425</code></td><td>临澧县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430724</code> 临澧县</td></tr>
    <tr><td><code>432426</code></td><td>桃源县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430725</code> 桃源县</td></tr>
    <tr><td><code>432427</code></td><td>石门县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430726</code> 石门县</td></tr>
    <tr><td><code>432428</code></td><td>慈利县</td><td>停用</td><td>湖南省 · 常德地区</td><td>1981–1987</td><td><code>430811</code> 武陵源区；<code>430821</code> 慈利县</td></tr>
    <tr><td><code>432500</code></td><td>涟源地区</td><td>更名</td><td>湖南省</td><td>1981</td><td>代码未变，现名 涟源地区</td></tr>
    <tr><td><code>432500</code></td><td>娄底地区</td><td>停用</td><td>湖南省</td><td>1982–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432501</code></td><td>娄底市</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 娄底市</td></tr>
    <tr><td><code>432501</code></td><td>娄底市</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982–1998</td><td><code>431302</code> 娄星区</td></tr>
    <tr><td><code>432502</code></td><td>冷水江市</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 冷水江市</td></tr>
    <tr><td><code>432502</code></td><td>冷水江市</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982–1998</td><td><code>431381</code> 冷水江市</td></tr>
    <tr><td><code>432503</code></td><td>涟源市</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1987–1998</td><td><code>431382</code> 涟源市</td></tr>
    <tr><td><code>432521</code></td><td>涟源县</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 涟源县</td></tr>
    <tr><td><code>432521</code></td><td>涟源县</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982–1986</td><td><code>432501</code> 娄底市；<code>432503</code> 涟源市</td></tr>
    <tr><td><code>432522</code></td><td>双峰县</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 双峰县</td></tr>
    <tr><td><code>432522</code></td><td>双峰县</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982–1998</td><td><code>431321</code> 双峰县</td></tr>
    <tr><td><code>432523</code></td><td>邵东县</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 邵东县</td></tr>
    <tr><td><code>432523</code></td><td>邵东县</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982</td><td><code>430521</code> 邵东县</td></tr>
    <tr><td><code>432524</code></td><td>新化县</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 新化县</td></tr>
    <tr><td><code>432524</code></td><td>新化县</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982–1998</td><td><code>431322</code> 新化县</td></tr>
    <tr><td><code>432525</code></td><td>新邵县</td><td>更名</td><td>湖南省 · 涟源地区</td><td>1981</td><td>代码未变，现名 新邵县</td></tr>
    <tr><td><code>432525</code></td><td>新邵县</td><td>停用</td><td>湖南省 · 娄底地区</td><td>1982</td><td><code>430522</code> 新邵县</td></tr>
    <tr><td><code>432600</code></td><td>邵阳地区</td><td>停用</td><td>湖南省</td><td>1981–1985</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432621</code></td><td>邵阳县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430523</code> 邵阳县</td></tr>
    <tr><td><code>432622</code></td><td>隆回县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430524</code> 隆回县</td></tr>
    <tr><td><code>432623</code></td><td>武冈县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430526</code> 武冈县</td></tr>
    <tr><td><code>432624</code></td><td>洞口县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430525</code> 洞口县</td></tr>
    <tr><td><code>432625</code></td><td>新宁县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430528</code> 新宁县</td></tr>
    <tr><td><code>432626</code></td><td>绥宁县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430527</code> 绥宁县</td></tr>
    <tr><td><code>432627</code></td><td>城步苗族自治县</td><td>停用</td><td>湖南省 · 邵阳地区</td><td>1981–1985</td><td><code>430529</code> 城步苗族自治县</td></tr>
    <tr><td><code>432700</code></td><td>衡阳地区</td><td>停用</td><td>湖南省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432721</code></td><td>衡阳县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430421</code> 衡阳县</td></tr>
    <tr><td><code>432722</code></td><td>衡南县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430422</code> 衡南县</td></tr>
    <tr><td><code>432723</code></td><td>衡山县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430423</code> 衡山县</td></tr>
    <tr><td><code>432724</code></td><td>衡东县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430424</code> 衡东县</td></tr>
    <tr><td><code>432725</code></td><td>常宁县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430425</code> 常宁县</td></tr>
    <tr><td><code>432726</code></td><td>祁东县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>430426</code> 祁东县</td></tr>
    <tr><td><code>432727</code></td><td>祁阳县</td><td>停用</td><td>湖南省 · 衡阳地区</td><td>1981–1982</td><td><code>432930</code> 祁阳县</td></tr>
    <tr><td><code>432800</code></td><td>郴州地区</td><td>停用</td><td>湖南省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>432801</code></td><td>郴州市</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431002</code> 北湖区；<code>431003</code> 苏仙区</td></tr>
    <tr><td><code>432802</code></td><td>资兴市</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1984–1993</td><td><code>431081</code> 资兴市</td></tr>
    <tr><td><code>432821</code></td><td>郴县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>432801</code> 郴州市；<code>432802</code> 资兴市；<code>431002</code> 北湖区；<code>431003</code> 苏仙区</td></tr>
    <tr><td><code>432822</code></td><td>桂阳县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431021</code> 桂阳县</td></tr>
    <tr><td><code>432823</code></td><td>永兴县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431023</code> 永兴县</td></tr>
    <tr><td><code>432824</code></td><td>宜章县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431022</code> 宜章县</td></tr>
    <tr><td><code>432825</code></td><td>资兴县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1983</td><td><code>432802</code> 资兴市</td></tr>
    <tr><td><code>432826</code></td><td>嘉禾县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431024</code> 嘉禾县</td></tr>
    <tr><td><code>432827</code></td><td>临武县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431025</code> 临武县</td></tr>
    <tr><td><code>432828</code></td><td>汝城县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431026</code> 汝城县</td></tr>
    <tr><td><code>432829</code></td><td>桂东县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431027</code> 桂东县</td></tr>
    <tr><td><code>432830</code></td><td>耒阳县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1982</td><td><code>430427</code> 耒阳县</td></tr>
    <tr><td><code>432831</code></td><td>安仁县</td><td>停用</td><td>湖南省 · 郴州地区</td><td>1981–1993</td><td><code>431028</code> 安仁县</td></tr>
    <tr><td><code>432900</code></td><td>零陵地区</td><td>停用</td><td>湖南省</td><td>1981–1994</td><td><code>432901</code> 永州市</td></tr>
    <tr><td><code>432901</code></td><td>永州市</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1982–1994</td><td><code>431102</code> 零陵区</td></tr>
    <tr><td><code>432902</code></td><td>冷水滩市</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1984–1994</td><td><code>431103</code> 冷水滩区</td></tr>
    <tr><td><code>432921</code></td><td>零陵县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1983</td><td><code>432901</code> 永州市；<code>432901</code> 永州市；<code>432902</code> 冷水滩市</td></tr>
    <tr><td><code>432922</code></td><td>东安县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431122</code> 东安县</td></tr>
    <tr><td><code>432923</code></td><td>道县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431124</code> 道县</td></tr>
    <tr><td><code>432924</code></td><td>宁远县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431126</code> 宁远县</td></tr>
    <tr><td><code>432925</code></td><td>江永县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>432926</code> 江华瑶族自治县；<code>431125</code> 江永县</td></tr>
    <tr><td><code>432926</code></td><td>江华瑶族自治县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431129</code> 江华瑶族自治县</td></tr>
    <tr><td><code>432927</code></td><td>蓝山县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431127</code> 蓝山县</td></tr>
    <tr><td><code>432928</code></td><td>新田县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431128</code> 新田县</td></tr>
    <tr><td><code>432929</code></td><td>双牌县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1981–1994</td><td><code>431123</code> 双牌县</td></tr>
    <tr><td><code>432930</code></td><td>祁阳县</td><td>停用</td><td>湖南省 · 零陵地区</td><td>1983–1994</td><td><code>431121</code> 祁阳县</td></tr>
    <tr><td><code>433000</code></td><td>怀化地区</td><td>停用</td><td>湖南省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>433001</code></td><td>怀化市</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431202</code> 鹤城区；<code>431221</code> 中方县</td></tr>
    <tr><td><code>433002</code></td><td>洪江市</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431281</code> 洪江市</td></tr>
    <tr><td><code>433021</code></td><td>黔阳县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431281</code> 洪江市</td></tr>
    <tr><td><code>433022</code></td><td>沅陵县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431222</code> 沅陵县</td></tr>
    <tr><td><code>433023</code></td><td>辰溪县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431223</code> 辰溪县</td></tr>
    <tr><td><code>433024</code></td><td>溆浦县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431224</code> 溆浦县</td></tr>
    <tr><td><code>433025</code></td><td>麻阳县</td><td>更名</td><td>湖南省 · 怀化地区</td><td>1981–1987</td><td>代码未变，现名 麻阳县</td></tr>
    <tr><td><code>433025</code></td><td>麻阳苗族自治县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1988–1996</td><td><code>431226</code> 麻阳苗族自治县</td></tr>
    <tr><td><code>433026</code></td><td>新晃侗族自治县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431227</code> 新晃侗族自治县</td></tr>
    <tr><td><code>433027</code></td><td>芷江县</td><td>更名</td><td>湖南省 · 怀化地区</td><td>1981–1985</td><td>代码未变，现名 芷江县</td></tr>
    <tr><td><code>433027</code></td><td>芷江侗族自治县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1986–1996</td><td><code>431228</code> 芷江侗族自治县</td></tr>
    <tr><td><code>433028</code></td><td>怀化县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981</td><td><code>433001</code> 怀化市</td></tr>
    <tr><td><code>433029</code></td><td>会同县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431225</code> 会同县</td></tr>
    <tr><td><code>433030</code></td><td>靖县</td><td>更名</td><td>湖南省 · 怀化地区</td><td>1981–1986</td><td>代码未变，现名 靖县</td></tr>
    <tr><td><code>433030</code></td><td>靖州苗族侗族自治县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1987–1996</td><td><code>431229</code> 靖州苗族侗族自治县</td></tr>
    <tr><td><code>433031</code></td><td>通道侗族自治县</td><td>停用</td><td>湖南省 · 怀化地区</td><td>1981–1996</td><td><code>431230</code> 通道侗族自治县</td></tr>
    <tr><td><code>433102</code></td><td>大庸市</td><td>停用</td><td>湖南省 · 湘西土家族苗族自治州</td><td>1985–1987</td><td><code>430802</code> 永定区；<code>430811</code> 武陵源区</td></tr>
    <tr><td><code>433121</code></td><td>吉首县</td><td>停用</td><td>湖南省 · 湘西土家族苗族自治州</td><td>1981</td><td><code>433101</code> 吉首市</td></tr>
    <tr><td><code>433128</code></td><td>大庸县</td><td>停用</td><td>湖南省 · 湘西土家族苗族自治州</td><td>1981–1984</td><td><code>433102</code> 大庸市</td></tr>
    <tr><td><code>433129</code></td><td>桑植县</td><td>停用</td><td>湖南省 · 湘西土家族苗族自治州</td><td>1981–1987</td><td><code>430811</code> 武陵源区；<code>430822</code> 桑植县</td></tr>
    <tr><td><code>439001</code></td><td>醴陵市</td><td>停用</td><td>湖南省</td><td>1986–1989</td><td><code>430281</code> 醴陵市</td></tr>
    <tr><td><code>439002</code></td><td>湘乡市</td><td>停用</td><td>湖南省</td><td>1986–1989</td><td><code>430381</code> 湘乡市</td></tr>
    <tr><td><code>439003</code></td><td>耒阳市</td><td>停用</td><td>湖南省</td><td>1986–1989</td><td><code>430481</code> 耒阳市</td></tr>
    <tr><td><code>439004</code></td><td>汨罗市</td><td>停用</td><td>湖南省</td><td>1987–1989</td><td><code>430681</code> 汨罗市</td></tr>
    <tr><td><code>439005</code></td><td>津市市</td><td>停用</td><td>湖南省</td><td>1988–1989</td><td><code>430781</code> 津市市</td></tr>
    <tr><td><code>440102</code></td><td>东山区</td><td>停用</td><td>广东省 · 广州市</td><td>1983–2004</td><td><code>440104</code> 越秀区</td></tr>
    <tr><td><code>440107</code></td><td>芳村区</td><td>停用</td><td>广东省 · 广州市</td><td>1985–2004</td><td><code>440103</code> 荔湾区</td></tr>
    <tr><td><code>440111</code></td><td>郊区</td><td>更名</td><td>广东省 · 广州市</td><td>1983–1986</td><td>代码未变，现名 白云区</td></tr>
    <tr><td><code>440116</code></td><td>萝岗区</td><td>停用</td><td>广东省 · 广州市</td><td>2005–2013</td><td><code>440112</code> 黄埔区</td></tr>
    <tr><td><code>440121</code></td><td>花县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1992</td><td><code>440182</code> 花都市</td></tr>
    <tr><td><code>440122</code></td><td>从化县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1993</td><td><code>440184</code> 从化市</td></tr>
    <tr><td><code>440123</code></td><td>新丰县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1987</td><td><code>440233</code> 新丰县</td></tr>
    <tr><td><code>440124</code></td><td>龙门县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1987</td><td><code>441324</code> 龙门县</td></tr>
    <tr><td><code>440125</code></td><td>增城县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1992</td><td><code>440183</code> 增城市</td></tr>
    <tr><td><code>440126</code></td><td>番禺县</td><td>停用</td><td>广东省 · 广州市</td><td>1981–1991</td><td><code>440181</code> 番禺市</td></tr>
    <tr><td><code>440127</code></td><td>清远县</td><td>停用</td><td>广东省 · 广州市</td><td>1983–1987</td><td><code>441802</code> 清城区；<code>441811</code> 清郊区</td></tr>
    <tr><td><code>440128</code></td><td>佛冈县</td><td>停用</td><td>广东省 · 广州市</td><td>1983–1987</td><td><code>441821</code> 佛冈县</td></tr>
    <tr><td><code>440181</code></td><td>番禺市</td><td>停用</td><td>广东省 · 广州市</td><td>1992–1999</td><td><code>440113</code> 番禺区</td></tr>
    <tr><td><code>440182</code></td><td>花都市</td><td>停用</td><td>广东省 · 广州市</td><td>1993–1999</td><td><code>440114</code> 花都区</td></tr>
    <tr><td><code>440183</code></td><td>增城市</td><td>停用</td><td>广东省 · 广州市</td><td>1993–2013</td><td><code>440116</code> 萝岗区；<code>440118</code> 增城区</td></tr>
    <tr><td><code>440184</code></td><td>从化市</td><td>停用</td><td>广东省 · 广州市</td><td>1994–2013</td><td><code>440117</code> 从化区</td></tr>
    <tr><td><code>440202</code></td><td>北江区</td><td>停用</td><td>广东省 · 韶关市</td><td>1984–2003</td><td><code>440204</code> 浈江区</td></tr>
    <tr><td><code>440221</code></td><td>曲江县</td><td>停用</td><td>广东省 · 韶关市</td><td>1981–2003</td><td><code>440203</code> 武江区；<code>440204</code> 浈江区；<code>440205</code> 曲江区；<code>440224</code> 仁化县</td></tr>
    <tr><td><code>440223</code></td><td>南雄县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1995</td><td><code>440282</code> 南雄市</td></tr>
    <tr><td><code>440225</code></td><td>乐昌县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1993</td><td><code>440281</code> 乐昌市</td></tr>
    <tr><td><code>440226</code></td><td>连县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1987</td><td><code>441824</code> 连县</td></tr>
    <tr><td><code>440227</code></td><td>阳山县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1987</td><td><code>441823</code> 阳山县</td></tr>
    <tr><td><code>440228</code></td><td>英德县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1987</td><td><code>441822</code> 英德县</td></tr>
    <tr><td><code>440230</code></td><td>连山壮族瑶族自治县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1987</td><td><code>441825</code> 连山壮族瑶族自治县</td></tr>
    <tr><td><code>440231</code></td><td>连南瑶族自治县</td><td>停用</td><td>广东省 · 韶关市</td><td>1983–1987</td><td><code>441826</code> 连南瑶族自治县</td></tr>
    <tr><td><code>440321</code></td><td>宝安县</td><td>停用</td><td>广东省 · 深圳市</td><td>1982–1991</td><td><code>440306</code> 宝安区；<code>440307</code> 龙岗区</td></tr>
    <tr><td><code>440421</code></td><td>斗门县</td><td>停用</td><td>广东省 · 珠海市</td><td>1983–2000</td><td><code>440403</code> 斗门区；<code>440404</code> 金湾区</td></tr>
    <tr><td><code>440502</code></td><td>同平区</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>440509</code> 升平区</td></tr>
    <tr><td><code>440503</code></td><td>安平区</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>440509</code> 升平区</td></tr>
    <tr><td><code>440504</code></td><td>公园区</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>440508</code> 金园区；<code>440509</code> 升平区</td></tr>
    <tr><td><code>440505</code></td><td>金砂区</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>440507</code> 龙湖区；<code>440508</code> 金园区；<code>440509</code> 升平区</td></tr>
    <tr><td><code>440506</code></td><td>达濠区</td><td>停用</td><td>广东省 · 汕头市</td><td>1984–2002</td><td><code>440511</code> 金平区；<code>440512</code> 濠江区</td></tr>
    <tr><td><code>440508</code></td><td>金园区</td><td>停用</td><td>广东省 · 汕头市</td><td>1991–2002</td><td><code>440507</code> 龙湖区；<code>440511</code> 金平区</td></tr>
    <tr><td><code>440509</code></td><td>升平区</td><td>停用</td><td>广东省 · 汕头市</td><td>1991–2002</td><td><code>440511</code> 金平区</td></tr>
    <tr><td><code>440510</code></td><td>河浦区</td><td>停用</td><td>广东省 · 汕头市</td><td>1994–2002</td><td><code>440512</code> 濠江区</td></tr>
    <tr><td><code>440511</code></td><td>郊区</td><td>更名</td><td>广东省 · 汕头市</td><td>1983–1990</td><td>代码未变，现名 金平区</td></tr>
    <tr><td><code>440520</code></td><td>潮州市</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1985</td><td><code>449001</code> 潮州市</td></tr>
    <tr><td><code>440521</code></td><td>澄海县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1993</td><td><code>440583</code> 澄海市</td></tr>
    <tr><td><code>440522</code></td><td>饶平县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>445122</code> 饶平县</td></tr>
    <tr><td><code>440524</code></td><td>潮阳县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1992</td><td><code>440582</code> 潮阳市</td></tr>
    <tr><td><code>440525</code></td><td>揭阳县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>445202</code> 榕城区；<code>445221</code> 揭东县</td></tr>
    <tr><td><code>440526</code></td><td>揭西县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>445222</code> 揭西县</td></tr>
    <tr><td><code>440527</code></td><td>普宁县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>445223</code> 普宁县</td></tr>
    <tr><td><code>440528</code></td><td>惠来县</td><td>停用</td><td>广东省 · 汕头市</td><td>1983–1990</td><td><code>445224</code> 惠来县</td></tr>
    <tr><td><code>440581</code></td><td>潮州市</td><td>停用</td><td>广东省 · 汕头市</td><td>1990</td><td><code>445102</code> 湘桥区；<code>445121</code> 潮安县</td></tr>
    <tr><td><code>440582</code></td><td>潮阳市</td><td>停用</td><td>广东省 · 汕头市</td><td>1993–2002</td><td><code>440510</code> 河浦区；<code>440513</code> 潮阳区；<code>440514</code> 潮南区</td></tr>
    <tr><td><code>440583</code></td><td>澄海市</td><td>停用</td><td>广东省 · 汕头市</td><td>1994–2002</td><td><code>440507</code> 龙湖区；<code>440515</code> 澄海区</td></tr>
    <tr><td><code>440602</code></td><td>汾江区</td><td>更名</td><td>广东省 · 佛山市</td><td>1984–1986</td><td>代码未变，现名 汾江区</td></tr>
    <tr><td><code>440602</code></td><td>城区</td><td>停用</td><td>广东省 · 佛山市</td><td>1987–2001</td><td><code>440604</code> 禅城区</td></tr>
    <tr><td><code>440603</code></td><td>石湾区</td><td>停用</td><td>广东省 · 佛山市</td><td>1984–2001</td><td><code>440604</code> 禅城区</td></tr>
    <tr><td><code>440620</code></td><td>中山市</td><td>停用</td><td>广东省 · 佛山市</td><td>1983–1987</td><td><code>442000</code> 中山市</td></tr>
    <tr><td><code>440621</code></td><td>三水县</td><td>停用</td><td>广东省 · 佛山市</td><td>1983–1992</td><td><code>440683</code> 三水市</td></tr>
    <tr><td><code>440622</code></td><td>南海县</td><td>停用</td><td>广东省 · 佛山市</td><td>1983–1991</td><td><code>440682</code> 南海市</td></tr>
    <tr><td><code>440623</code></td><td>顺德县</td><td>停用</td><td>广东省 · 佛山市</td><td>1983–1991</td><td><code>440681</code> 顺德市</td></tr>
    <tr><td><code>440624</code></td><td>高明县</td><td>停用</td><td>广东省 · 佛山市</td><td>1983–1993</td><td><code>440684</code> 高明市</td></tr>
    <tr><td><code>440681</code></td><td>顺德市</td><td>停用</td><td>广东省 · 佛山市</td><td>1992–2001</td><td><code>440606</code> 顺德区</td></tr>
    <tr><td><code>440682</code></td><td>南海市</td><td>停用</td><td>广东省 · 佛山市</td><td>1992–2001</td><td><code>440604</code> 禅城区；<code>440605</code> 南海区</td></tr>
    <tr><td><code>440683</code></td><td>三水市</td><td>停用</td><td>广东省 · 佛山市</td><td>1993–2001</td><td><code>440607</code> 三水区</td></tr>
    <tr><td><code>440684</code></td><td>高明市</td><td>停用</td><td>广东省 · 佛山市</td><td>1994–2001</td><td><code>440608</code> 高明区</td></tr>
    <tr><td><code>440702</code></td><td>城区</td><td>停用</td><td>广东省 · 江门市</td><td>1984–1993</td><td><code>440704</code> 江海区</td></tr>
    <tr><td><code>440711</code></td><td>郊区</td><td>停用</td><td>广东省 · 江门市</td><td>1984–1993</td><td><code>440703</code> 蓬江区</td></tr>
    <tr><td><code>440721</code></td><td>新会县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1991</td><td><code>440782</code> 新会市</td></tr>
    <tr><td><code>440722</code></td><td>台山县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1991</td><td><code>440781</code> 台山市</td></tr>
    <tr><td><code>440723</code></td><td>恩平县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1993</td><td><code>440785</code> 恩平市</td></tr>
    <tr><td><code>440724</code></td><td>开平县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1992</td><td><code>440783</code> 开平市</td></tr>
    <tr><td><code>440725</code></td><td>鹤山县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1992</td><td><code>440784</code> 鹤山市</td></tr>
    <tr><td><code>440726</code></td><td>阳江县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1987</td><td><code>441702</code> 江城区；<code>441703</code> 阳东区；<code>441721</code> 阳西县</td></tr>
    <tr><td><code>440727</code></td><td>阳春县</td><td>停用</td><td>广东省 · 江门市</td><td>1983–1987</td><td><code>441722</code> 阳春县</td></tr>
    <tr><td><code>440782</code></td><td>新会市</td><td>停用</td><td>广东省 · 江门市</td><td>1992–2001</td><td><code>440703</code> 蓬江区；<code>440705</code> 新会区</td></tr>
    <tr><td><code>440811</code></td><td>郊区</td><td>更名</td><td>广东省 · 湛江市</td><td>1983–1993</td><td>代码未变，现名 麻章区</td></tr>
    <tr><td><code>440821</code></td><td>吴川县</td><td>停用</td><td>广东省 · 湛江市</td><td>1983–1993</td><td><code>440883</code> 吴川市</td></tr>
    <tr><td><code>440822</code></td><td>廉江县</td><td>停用</td><td>广东省 · 湛江市</td><td>1983–1992</td><td><code>440881</code> 廉江市</td></tr>
    <tr><td><code>440824</code></td><td>海康县</td><td>停用</td><td>广东省 · 湛江市</td><td>1983–1993</td><td><code>440882</code> 雷州市</td></tr>
    <tr><td><code>440903</code></td><td>茂港区</td><td>停用</td><td>广东省 · 茂名市</td><td>2001–2013</td><td><code>440904</code> 电白区</td></tr>
    <tr><td><code>440921</code></td><td>信宜县</td><td>停用</td><td>广东省 · 茂名市</td><td>1983–1994</td><td><code>440983</code> 信宜市</td></tr>
    <tr><td><code>440922</code></td><td>高州县</td><td>停用</td><td>广东省 · 茂名市</td><td>1983–1992</td><td><code>440981</code> 高州市</td></tr>
    <tr><td><code>440923</code></td><td>电白县</td><td>停用</td><td>广东省 · 茂名市</td><td>1983–2013</td><td><code>440903</code> 茂港区；<code>440904</code> 电白区</td></tr>
    <tr><td><code>440924</code></td><td>化州县</td><td>停用</td><td>广东省 · 茂名市</td><td>1983–1993</td><td><code>440982</code> 化州市</td></tr>
    <tr><td><code>441000</code></td><td>海口市</td><td>停用</td><td>广东省</td><td>1987</td><td><code>460100</code> 海口市</td></tr>
    <tr><td><code>441100</code></td><td>三亚市</td><td>停用</td><td>广东省</td><td>1987</td><td><code>460200</code> 三亚市</td></tr>
    <tr><td><code>441221</code></td><td>高要县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1992</td><td><code>441283</code> 高要市</td></tr>
    <tr><td><code>441222</code></td><td>四会县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1992</td><td><code>441284</code> 四会市</td></tr>
    <tr><td><code>441227</code></td><td>云浮县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1991</td><td><code>441281</code> 云浮市</td></tr>
    <tr><td><code>441228</code></td><td>新兴县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1993</td><td><code>445321</code> 新兴县</td></tr>
    <tr><td><code>441229</code></td><td>郁南县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1993</td><td><code>445322</code> 郁南县</td></tr>
    <tr><td><code>441230</code></td><td>罗定县</td><td>停用</td><td>广东省 · 肇庆市</td><td>1988–1992</td><td><code>441282</code> 罗定市</td></tr>
    <tr><td><code>441281</code></td><td>云浮市</td><td>停用</td><td>广东省 · 肇庆市</td><td>1992–1993</td><td><code>445302</code> 云城区</td></tr>
    <tr><td><code>441282</code></td><td>罗定市</td><td>停用</td><td>广东省 · 肇庆市</td><td>1993</td><td><code>445381</code> 罗定市</td></tr>
    <tr><td><code>441283</code></td><td>高要市</td><td>停用</td><td>广东省 · 肇庆市</td><td>1993–2014</td><td><code>441204</code> 高要区</td></tr>
    <tr><td><code>441321</code></td><td>惠阳县</td><td>停用</td><td>广东省 · 惠州市</td><td>1988–1993</td><td><code>441381</code> 惠阳市</td></tr>
    <tr><td><code>441381</code></td><td>惠阳市</td><td>停用</td><td>广东省 · 惠州市</td><td>1994–2002</td><td><code>441302</code> 惠城区；<code>441303</code> 惠阳区</td></tr>
    <tr><td><code>441421</code></td><td>梅县</td><td>停用</td><td>广东省 · 梅州市</td><td>1988–2012</td><td><code>441403</code> 梅县区</td></tr>
    <tr><td><code>441425</code></td><td>兴宁县</td><td>停用</td><td>广东省 · 梅州市</td><td>1988–1993</td><td><code>441481</code> 兴宁市</td></tr>
    <tr><td><code>441522</code></td><td>陆丰县</td><td>停用</td><td>广东省 · 汕尾市</td><td>1988–1994</td><td><code>441581</code> 陆丰市</td></tr>
    <tr><td><code>441611</code></td><td>郊区</td><td>停用</td><td>广东省 · 河源市</td><td>1988–1992</td><td><code>441625</code> 东源县</td></tr>
    <tr><td><code>441703</code></td><td>阳东区</td><td>停用</td><td>广东省 · 阳江市</td><td>1988–1990</td><td><code>441723</code> 阳东县</td></tr>
    <tr><td><code>441722</code></td><td>阳春县</td><td>停用</td><td>广东省 · 阳江市</td><td>1988–1993</td><td><code>441781</code> 阳春市</td></tr>
    <tr><td><code>441723</code></td><td>阳东县</td><td>停用</td><td>广东省 · 阳江市</td><td>1991–2013</td><td><code>441704</code> 阳东区</td></tr>
    <tr><td><code>441811</code></td><td>清郊区</td><td>停用</td><td>广东省 · 清远市</td><td>1988–1991</td><td><code>441827</code> 清新县</td></tr>
    <tr><td><code>441822</code></td><td>英德县</td><td>停用</td><td>广东省 · 清远市</td><td>1988–1993</td><td><code>441881</code> 英德市</td></tr>
    <tr><td><code>441824</code></td><td>连县</td><td>停用</td><td>广东省 · 清远市</td><td>1988–1993</td><td><code>441882</code> 连州市</td></tr>
    <tr><td><code>441827</code></td><td>清新县</td><td>停用</td><td>广东省 · 清远市</td><td>1992–2011</td><td><code>441803</code> 清新区</td></tr>
    <tr><td><code>442100</code></td><td>海南行政区</td><td>停用</td><td>广东省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442101</code></td><td>海口市</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1986</td><td><code>441000</code> 海口市</td></tr>
    <tr><td><code>442102</code></td><td>通什市</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460001</code> 通什市</td></tr>
    <tr><td><code>442121</code></td><td>琼山县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460021</code> 琼山县</td></tr>
    <tr><td><code>442122</code></td><td>文昌县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460022</code> 文昌县</td></tr>
    <tr><td><code>442123</code></td><td>琼海县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460023</code> 琼海县</td></tr>
    <tr><td><code>442124</code></td><td>万宁县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460024</code> 万宁县</td></tr>
    <tr><td><code>442125</code></td><td>定安县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460025</code> 定安县</td></tr>
    <tr><td><code>442126</code></td><td>屯昌县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460026</code> 屯昌县</td></tr>
    <tr><td><code>442127</code></td><td>澄迈县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460027</code> 澄迈县</td></tr>
    <tr><td><code>442128</code></td><td>临高县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460028</code> 临高县</td></tr>
    <tr><td><code>442129</code></td><td>儋县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1981–1987</td><td><code>460029</code> 儋县</td></tr>
    <tr><td><code>442130</code></td><td>东方黎族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460032</code> 东方黎族自治县</td></tr>
    <tr><td><code>442131</code></td><td>乐东黎族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460033</code> 乐东黎族自治县</td></tr>
    <tr><td><code>442132</code></td><td>琼中黎族苗族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460036</code> 琼中黎族苗族自治县</td></tr>
    <tr><td><code>442133</code></td><td>保亭黎族苗族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460035</code> 保亭黎族苗族自治县</td></tr>
    <tr><td><code>442134</code></td><td>陵水黎族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460034</code> 陵水黎族自治县</td></tr>
    <tr><td><code>442135</code></td><td>白沙黎族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460030</code> 白沙黎族自治县</td></tr>
    <tr><td><code>442136</code></td><td>昌江黎族自治县</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460031</code> 昌江黎族自治县</td></tr>
    <tr><td><code>442137</code></td><td>西沙、南沙、中沙群岛</td><td>停用</td><td>广东省 · 海南行政区</td><td>1987</td><td><code>460037</code> 西沙群岛；<code>460038</code> 南沙群岛；<code>460039</code> 中沙群岛的岛礁及其海域</td></tr>
    <tr><td><code>442200</code></td><td>海南黎族苗族自治州</td><td>停用</td><td>广东省</td><td>1981–1986</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442201</code></td><td>三亚市</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1984–1986</td><td><code>441100</code> 三亚市</td></tr>
    <tr><td><code>442202</code></td><td>通什市</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1986</td><td><code>442102</code> 通什市</td></tr>
    <tr><td><code>442221</code></td><td>崖县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1983</td><td><code>442201</code> 三亚市</td></tr>
    <tr><td><code>442222</code></td><td>东方县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442130</code> 东方黎族自治县</td></tr>
    <tr><td><code>442223</code></td><td>乐东县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442202</code> 通什市；<code>442131</code> 乐东黎族自治县</td></tr>
    <tr><td><code>442224</code></td><td>琼中县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442202</code> 通什市；<code>442132</code> 琼中黎族苗族自治县</td></tr>
    <tr><td><code>442225</code></td><td>保亭县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442202</code> 通什市；<code>442133</code> 保亭黎族苗族自治县</td></tr>
    <tr><td><code>442226</code></td><td>陵水县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442134</code> 陵水黎族自治县</td></tr>
    <tr><td><code>442227</code></td><td>白沙县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442135</code> 白沙黎族自治县</td></tr>
    <tr><td><code>442228</code></td><td>昌江县</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442136</code> 昌江黎族自治县</td></tr>
    <tr><td><code>442229</code></td><td>西沙、南沙、中沙群岛</td><td>停用</td><td>广东省 · 海南黎族苗族自治州</td><td>1981–1986</td><td><code>442137</code> 西沙、南沙、中沙群岛</td></tr>
    <tr><td><code>442300</code></td><td>汕头地区</td><td>停用</td><td>广东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442301</code></td><td>汕头市</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440502</code> 同平区；<code>440503</code> 安平区；<code>440504</code> 公园区；<code>440505</code> 金砂区；<code>440511</code> 金平区</td></tr>
    <tr><td><code>442302</code></td><td>潮州市</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440520</code> 潮州市</td></tr>
    <tr><td><code>442321</code></td><td>潮安县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440520</code> 潮州市</td></tr>
    <tr><td><code>442322</code></td><td>澄海县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440521</code> 澄海县</td></tr>
    <tr><td><code>442323</code></td><td>饶平县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440522</code> 饶平县</td></tr>
    <tr><td><code>442324</code></td><td>南澳县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440523</code> 南澳县</td></tr>
    <tr><td><code>442325</code></td><td>潮阳县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440524</code> 潮阳县</td></tr>
    <tr><td><code>442326</code></td><td>揭阳县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440525</code> 揭阳县</td></tr>
    <tr><td><code>442327</code></td><td>揭西县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440526</code> 揭西县</td></tr>
    <tr><td><code>442328</code></td><td>普宁县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440527</code> 普宁县</td></tr>
    <tr><td><code>442329</code></td><td>惠来县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>440528</code> 惠来县</td></tr>
    <tr><td><code>442330</code></td><td>陆丰县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>442530</code> 陆丰县</td></tr>
    <tr><td><code>442331</code></td><td>海丰县</td><td>停用</td><td>广东省 · 汕头地区</td><td>1981–1982</td><td><code>442531</code> 海丰县</td></tr>
    <tr><td><code>442400</code></td><td>梅县地区</td><td>停用</td><td>广东省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442401</code></td><td>梅州市</td><td>更名</td><td>广东省 · 梅县地区</td><td>1981–1982</td><td>代码未变，现名 梅州市</td></tr>
    <tr><td><code>442401</code></td><td>梅县市</td><td>停用</td><td>广东省 · 梅县地区</td><td>1983–1987</td><td><code>441402</code> 梅江区；<code>441421</code> 梅县</td></tr>
    <tr><td><code>442421</code></td><td>梅县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1982</td><td><code>442401</code> 梅州市；<code>442401</code> 梅州市</td></tr>
    <tr><td><code>442422</code></td><td>大埔县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441422</code> 大埔县</td></tr>
    <tr><td><code>442423</code></td><td>丰顺县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441423</code> 丰顺县</td></tr>
    <tr><td><code>442424</code></td><td>五华县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441424</code> 五华县</td></tr>
    <tr><td><code>442425</code></td><td>兴宁县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441425</code> 兴宁县</td></tr>
    <tr><td><code>442426</code></td><td>平远县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441426</code> 平远县</td></tr>
    <tr><td><code>442427</code></td><td>蕉岭县</td><td>停用</td><td>广东省 · 梅县地区</td><td>1981–1987</td><td><code>441427</code> 蕉岭县</td></tr>
    <tr><td><code>442500</code></td><td>惠阳地区</td><td>停用</td><td>广东省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442501</code></td><td>惠州市</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441302</code> 惠城区</td></tr>
    <tr><td><code>442502</code></td><td>东莞市</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1985–1987</td><td><code>441900</code> 东莞市</td></tr>
    <tr><td><code>442521</code></td><td>惠阳县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441321</code> 惠阳县</td></tr>
    <tr><td><code>442522</code></td><td>紫金县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441621</code> 紫金县</td></tr>
    <tr><td><code>442523</code></td><td>和平县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441624</code> 和平县</td></tr>
    <tr><td><code>442524</code></td><td>连平县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441623</code> 连平县</td></tr>
    <tr><td><code>442525</code></td><td>河源县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441602</code> 源城区；<code>441611</code> 郊区</td></tr>
    <tr><td><code>442526</code></td><td>博罗县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441322</code> 博罗县</td></tr>
    <tr><td><code>442527</code></td><td>东莞县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1984</td><td><code>442502</code> 东莞市</td></tr>
    <tr><td><code>442528</code></td><td>惠东县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441323</code> 惠东县</td></tr>
    <tr><td><code>442529</code></td><td>龙川县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1981–1987</td><td><code>441622</code> 龙川县</td></tr>
    <tr><td><code>442530</code></td><td>陆丰县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1983–1987</td><td><code>441522</code> 陆丰县；<code>441523</code> 陆河县</td></tr>
    <tr><td><code>442531</code></td><td>海丰县</td><td>停用</td><td>广东省 · 惠阳地区</td><td>1983–1987</td><td><code>441502</code> 城区；<code>441521</code> 海丰县</td></tr>
    <tr><td><code>442600</code></td><td>韶关地区</td><td>停用</td><td>广东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442621</code></td><td>始兴县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440222</code> 始兴县</td></tr>
    <tr><td><code>442622</code></td><td>南雄县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440223</code> 南雄县</td></tr>
    <tr><td><code>442623</code></td><td>仁化县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440224</code> 仁化县</td></tr>
    <tr><td><code>442624</code></td><td>乐昌县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440225</code> 乐昌县</td></tr>
    <tr><td><code>442625</code></td><td>连县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440226</code> 连县</td></tr>
    <tr><td><code>442626</code></td><td>阳山县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440227</code> 阳山县</td></tr>
    <tr><td><code>442627</code></td><td>英德县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440228</code> 英德县</td></tr>
    <tr><td><code>442628</code></td><td>清远县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440127</code> 清远县</td></tr>
    <tr><td><code>442629</code></td><td>佛冈县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440128</code> 佛冈县</td></tr>
    <tr><td><code>442630</code></td><td>翁源县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440229</code> 翁源县</td></tr>
    <tr><td><code>442631</code></td><td>连山壮族瑶族自治县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440230</code> 连山壮族瑶族自治县</td></tr>
    <tr><td><code>442632</code></td><td>连南瑶族自治县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440231</code> 连南瑶族自治县</td></tr>
    <tr><td><code>442633</code></td><td>乳源瑶族自治县</td><td>停用</td><td>广东省 · 韶关地区</td><td>1981–1982</td><td><code>440232</code> 乳源瑶族自治县</td></tr>
    <tr><td><code>442700</code></td><td>佛山地区</td><td>停用</td><td>广东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442701</code></td><td>佛山市</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440600</code> 佛山市</td></tr>
    <tr><td><code>442702</code></td><td>江门市</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440700</code> 江门市</td></tr>
    <tr><td><code>442721</code></td><td>三水县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440621</code> 三水县</td></tr>
    <tr><td><code>442722</code></td><td>南海县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440622</code> 南海县</td></tr>
    <tr><td><code>442723</code></td><td>顺德县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440623</code> 顺德县</td></tr>
    <tr><td><code>442724</code></td><td>中山县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440620</code> 中山市</td></tr>
    <tr><td><code>442725</code></td><td>斗门县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440421</code> 斗门县</td></tr>
    <tr><td><code>442726</code></td><td>新会县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440721</code> 新会县</td></tr>
    <tr><td><code>442727</code></td><td>台山县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440722</code> 台山县</td></tr>
    <tr><td><code>442728</code></td><td>恩平县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440723</code> 恩平县</td></tr>
    <tr><td><code>442729</code></td><td>开平县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440724</code> 开平县</td></tr>
    <tr><td><code>442731</code></td><td>鹤山县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440725</code> 鹤山县</td></tr>
    <tr><td><code>442732</code></td><td>高明县</td><td>停用</td><td>广东省 · 佛山地区</td><td>1981–1982</td><td><code>440624</code> 高明县</td></tr>
    <tr><td><code>442800</code></td><td>肇庆地区</td><td>停用</td><td>广东省</td><td>1981–1987</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442801</code></td><td>肇庆市</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441202</code> 端州区；<code>441203</code> 鼎湖区</td></tr>
    <tr><td><code>442821</code></td><td>高要县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441221</code> 高要县</td></tr>
    <tr><td><code>442822</code></td><td>四会县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441222</code> 四会县</td></tr>
    <tr><td><code>442823</code></td><td>广宁县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441223</code> 广宁县</td></tr>
    <tr><td><code>442824</code></td><td>怀集县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441224</code> 怀集县</td></tr>
    <tr><td><code>442825</code></td><td>封开县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441225</code> 封开县</td></tr>
    <tr><td><code>442826</code></td><td>德庆县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441226</code> 德庆县</td></tr>
    <tr><td><code>442827</code></td><td>云浮县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441227</code> 云浮县</td></tr>
    <tr><td><code>442828</code></td><td>新兴县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441228</code> 新兴县</td></tr>
    <tr><td><code>442829</code></td><td>郁南县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441229</code> 郁南县</td></tr>
    <tr><td><code>442830</code></td><td>罗定县</td><td>停用</td><td>广东省 · 肇庆地区</td><td>1981–1987</td><td><code>441230</code> 罗定县</td></tr>
    <tr><td><code>442900</code></td><td>湛江地区</td><td>停用</td><td>广东省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>442901</code></td><td>湛江市</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440802</code> 赤坎区；<code>440803</code> 霞山区；<code>440811</code> 麻章区</td></tr>
    <tr><td><code>442902</code></td><td>茂名市</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440900</code> 茂名市</td></tr>
    <tr><td><code>442921</code></td><td>阳江县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440726</code> 阳江县</td></tr>
    <tr><td><code>442922</code></td><td>阳春县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440727</code> 阳春县</td></tr>
    <tr><td><code>442923</code></td><td>信宜县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440921</code> 信宜县</td></tr>
    <tr><td><code>442924</code></td><td>高州县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440922</code> 高州县</td></tr>
    <tr><td><code>442925</code></td><td>电白县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440923</code> 电白县</td></tr>
    <tr><td><code>442926</code></td><td>吴川县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440821</code> 吴川县</td></tr>
    <tr><td><code>442927</code></td><td>化州县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440924</code> 化州县</td></tr>
    <tr><td><code>442928</code></td><td>廉江县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440822</code> 廉江县</td></tr>
    <tr><td><code>442929</code></td><td>遂溪县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440823</code> 遂溪县</td></tr>
    <tr><td><code>442930</code></td><td>海康县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440824</code> 海康县</td></tr>
    <tr><td><code>442931</code></td><td>徐闻县</td><td>停用</td><td>广东省 · 湛江地区</td><td>1981–1982</td><td><code>440825</code> 徐闻县</td></tr>
    <tr><td><code>445121</code></td><td>潮安县</td><td>停用</td><td>广东省 · 潮州市</td><td>1991–2012</td><td><code>445102</code> 湘桥区；<code>445103</code> 潮安区</td></tr>
    <tr><td><code>445221</code></td><td>揭东县</td><td>停用</td><td>广东省 · 揭阳市</td><td>1991–2011</td><td><code>445202</code> 榕城区；<code>445203</code> 揭东区</td></tr>
    <tr><td><code>445223</code></td><td>普宁县</td><td>停用</td><td>广东省 · 揭阳市</td><td>1991–1992</td><td><code>445281</code> 普宁市</td></tr>
    <tr><td><code>445323</code></td><td>云安县</td><td>停用</td><td>广东省 · 云浮市</td><td>1996–2013</td><td><code>445302</code> 云城区；<code>445303</code> 云安区</td></tr>
    <tr><td><code>449001</code></td><td>潮州市</td><td>停用</td><td>广东省</td><td>1986–1989</td><td><code>440581</code> 潮州市</td></tr>
    <tr><td><code>450103</code></td><td>新城区</td><td>更名</td><td>广西壮族自治区 · 南宁市</td><td>1983–2003</td><td>代码未变，现名 青秀区</td></tr>
    <tr><td><code>450104</code></td><td>城北区</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>1983–2003</td><td><code>450107</code> 西乡塘区</td></tr>
    <tr><td><code>450106</code></td><td>永新区</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>1983–2003</td><td><code>450105</code> 江南区；<code>450107</code> 西乡塘区</td></tr>
    <tr><td><code>450111</code></td><td>市郊区</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>1984–2000</td><td><code>450102</code> 兴宁区；<code>450103</code> 青秀区；<code>450104</code> 城北区；<code>450105</code> 江南区；<code>450106</code> 永新区</td></tr>
    <tr><td><code>450121</code></td><td>邕宁县</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>1983–2003</td><td><code>450102</code> 兴宁区；<code>450103</code> 青秀区；<code>450105</code> 江南区；<code>450108</code> 良庆区；<code>450109</code> 邕宁区</td></tr>
    <tr><td><code>450122</code></td><td>武鸣县</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>1983–2014</td><td><code>450110</code> 武鸣区</td></tr>
    <tr><td><code>450127</code></td><td>横县</td><td>停用</td><td>广西壮族自治区 · 南宁市</td><td>2002–2020</td><td><code>450181</code> 横州市</td></tr>
    <tr><td><code>450211</code></td><td>市郊区</td><td>停用</td><td>广西壮族自治区 · 柳州市</td><td>1984–2001</td><td><code>450202</code> 城中区；<code>450203</code> 鱼峰区；<code>450204</code> 柳南区；<code>450205</code> 柳北区</td></tr>
    <tr><td><code>450221</code></td><td>柳江县</td><td>停用</td><td>广西壮族自治区 · 柳州市</td><td>1983–2015</td><td><code>450206</code> 柳江区</td></tr>
    <tr><td><code>450311</code></td><td>市郊区</td><td>更名</td><td>广西壮族自治区 · 桂林市</td><td>1984–1995</td><td>代码未变，现名 雁山区</td></tr>
    <tr><td><code>450322</code></td><td>临桂县</td><td>停用</td><td>广西壮族自治区 · 桂林市</td><td>1983–2012</td><td><code>450312</code> 临桂区</td></tr>
    <tr><td><code>450331</code></td><td>荔浦县</td><td>停用</td><td>广西壮族自治区 · 桂林市</td><td>1998–2017</td><td><code>450381</code> 荔浦市</td></tr>
    <tr><td><code>450402</code></td><td>白云区</td><td>停用</td><td>广西壮族自治区 · 梧州市</td><td>1983</td><td><code>450403</code> 万秀区</td></tr>
    <tr><td><code>450404</code></td><td>蝶山区</td><td>停用</td><td>广西壮族自治区 · 梧州市</td><td>1983–2012</td><td><code>450405</code> 长洲区；<code>450403</code> 万秀区</td></tr>
    <tr><td><code>450405</code></td><td>鸳江区</td><td>更名</td><td>广西壮族自治区 · 梧州市</td><td>1983</td><td>代码未变，现名 长洲区</td></tr>
    <tr><td><code>450411</code></td><td>市郊区</td><td>停用</td><td>广西壮族自治区 · 梧州市</td><td>1984–2002</td><td><code>450403</code> 万秀区；<code>450404</code> 蝶山区；<code>450405</code> 长洲区</td></tr>
    <tr><td><code>450511</code></td><td>市郊区</td><td>停用</td><td>广西壮族自治区 · 北海市</td><td>1984–1993</td><td><code>450502</code> 海城区；<code>450503</code> 银海区</td></tr>
    <tr><td><code>451021</code></td><td>田阳县</td><td>停用</td><td>广西壮族自治区 · 百色市</td><td>2002–2018</td><td><code>451003</code> 田阳区</td></tr>
    <tr><td><code>451023</code></td><td>平果县</td><td>停用</td><td>广西壮族自治区 · 百色市</td><td>2002–2018</td><td><code>451082</code> 平果市</td></tr>
    <tr><td><code>451025</code></td><td>靖西县</td><td>停用</td><td>广西壮族自治区 · 百色市</td><td>2002–2014</td><td><code>451081</code> 靖西市</td></tr>
    <tr><td><code>451281</code></td><td>宜州市</td><td>停用</td><td>广西壮族自治区 · 河池市</td><td>2002–2015</td><td><code>451203</code> 宜州区</td></tr>
    <tr><td><code>452100</code></td><td>南宁地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452101</code></td><td>凭祥市</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451481</code> 凭祥市</td></tr>
    <tr><td><code>452121</code></td><td>邕宁县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–1982</td><td><code>450100</code> 南宁市；<code>450121</code> 邕宁县</td></tr>
    <tr><td><code>452122</code></td><td>横县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>450127</code> 横县</td></tr>
    <tr><td><code>452123</code></td><td>宾阳县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>450126</code> 宾阳县</td></tr>
    <tr><td><code>452124</code></td><td>上林县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>450125</code> 上林县</td></tr>
    <tr><td><code>452125</code></td><td>武鸣县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–1982</td><td><code>450122</code> 武鸣县</td></tr>
    <tr><td><code>452126</code></td><td>隆安县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>450123</code> 隆安县</td></tr>
    <tr><td><code>452127</code></td><td>马山县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>452731</code> 大化瑶族自治县；<code>450124</code> 马山县</td></tr>
    <tr><td><code>452128</code></td><td>扶绥县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451421</code> 扶绥县</td></tr>
    <tr><td><code>452129</code></td><td>崇左县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451402</code> 江州区</td></tr>
    <tr><td><code>452130</code></td><td>大新县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451424</code> 大新县</td></tr>
    <tr><td><code>452131</code></td><td>天等县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451425</code> 天等县</td></tr>
    <tr><td><code>452132</code></td><td>宁明县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451422</code> 宁明县</td></tr>
    <tr><td><code>452133</code></td><td>龙州县</td><td>停用</td><td>广西壮族自治区 · 南宁地区</td><td>1981–2001</td><td><code>451423</code> 龙州县</td></tr>
    <tr><td><code>452200</code></td><td>柳州地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452201</code></td><td>合山市</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>451381</code> 合山市</td></tr>
    <tr><td><code>452221</code></td><td>柳江县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–1982</td><td><code>450221</code> 柳江县</td></tr>
    <tr><td><code>452222</code></td><td>柳城县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–1982</td><td><code>450200</code> 柳州市；<code>450222</code> 柳城县</td></tr>
    <tr><td><code>452223</code></td><td>鹿寨县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>450200</code> 柳州市；<code>452230</code> 金秀瑶族自治县；<code>450223</code> 鹿寨县</td></tr>
    <tr><td><code>452224</code></td><td>象州县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>452230</code> 金秀瑶族自治县；<code>451322</code> 象州县</td></tr>
    <tr><td><code>452225</code></td><td>武宣县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>451323</code> 武宣县</td></tr>
    <tr><td><code>452226</code></td><td>来宾县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>451302</code> 兴宾区</td></tr>
    <tr><td><code>452227</code></td><td>融安县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>450224</code> 融安县</td></tr>
    <tr><td><code>452228</code></td><td>三江侗族自治县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>450226</code> 三江侗族自治县</td></tr>
    <tr><td><code>452229</code></td><td>融水苗族自治县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>450225</code> 融水苗族自治县</td></tr>
    <tr><td><code>452230</code></td><td>金秀瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>451324</code> 金秀瑶族自治县</td></tr>
    <tr><td><code>452231</code></td><td>忻城县</td><td>停用</td><td>广西壮族自治区 · 柳州地区</td><td>1981–2001</td><td><code>451321</code> 忻城县</td></tr>
    <tr><td><code>452300</code></td><td>桂林地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452321</code></td><td>临桂县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1982</td><td><code>450322</code> 临桂县</td></tr>
    <tr><td><code>452322</code></td><td>灵川县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450323</code> 灵川县</td></tr>
    <tr><td><code>452323</code></td><td>全州县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450324</code> 全州县</td></tr>
    <tr><td><code>452324</code></td><td>兴安县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450325</code> 兴安县</td></tr>
    <tr><td><code>452325</code></td><td>永福县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450326</code> 永福县</td></tr>
    <tr><td><code>452327</code></td><td>灌阳县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450327</code> 灌阳县</td></tr>
    <tr><td><code>452328</code></td><td>龙胜各族自治县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450328</code> 龙胜各族自治县</td></tr>
    <tr><td><code>452329</code></td><td>资源县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450329</code> 资源县</td></tr>
    <tr><td><code>452330</code></td><td>平乐县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450330</code> 平乐县</td></tr>
    <tr><td><code>452331</code></td><td>荔浦县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1997</td><td><code>450331</code> 荔浦县</td></tr>
    <tr><td><code>452332</code></td><td>恭城县</td><td>更名</td><td>广西壮族自治区 · 桂林地区</td><td>1981–1989</td><td>代码未变，现名 恭城县</td></tr>
    <tr><td><code>452332</code></td><td>恭城瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 桂林地区</td><td>1990–1997</td><td><code>450332</code> 恭城瑶族自治县</td></tr>
    <tr><td><code>452400</code></td><td>梧州地区</td><td>更名</td><td>广西壮族自治区</td><td>1981–1996</td><td>代码未变，现名 梧州地区</td></tr>
    <tr><td><code>452400</code></td><td>贺州地区</td><td>停用</td><td>广西壮族自治区</td><td>1997–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452401</code></td><td>岑溪市</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1995–1996</td><td><code>450481</code> 岑溪市</td></tr>
    <tr><td><code>452402</code></td><td>贺州市</td><td>停用</td><td>广西壮族自治区 · 贺州地区</td><td>1997–2001</td><td><code>451102</code> 八步区</td></tr>
    <tr><td><code>452421</code></td><td>岑溪县</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1994</td><td><code>452401</code> 岑溪市</td></tr>
    <tr><td><code>452422</code></td><td>苍梧县</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1982</td><td><code>450421</code> 苍梧县</td></tr>
    <tr><td><code>452423</code></td><td>藤县</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1996</td><td><code>450422</code> 藤县</td></tr>
    <tr><td><code>452424</code></td><td>昭平县</td><td>更名</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1996</td><td>代码未变，现名 昭平县</td></tr>
    <tr><td><code>452424</code></td><td>昭平县</td><td>停用</td><td>广西壮族自治区 · 贺州地区</td><td>1997–2001</td><td><code>451121</code> 昭平县</td></tr>
    <tr><td><code>452425</code></td><td>蒙山县</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1996</td><td><code>450423</code> 蒙山县</td></tr>
    <tr><td><code>452426</code></td><td>贺县</td><td>停用</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1996</td><td><code>452402</code> 贺州市</td></tr>
    <tr><td><code>452427</code></td><td>钟山县</td><td>更名</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1996</td><td>代码未变，现名 钟山县</td></tr>
    <tr><td><code>452427</code></td><td>钟山县</td><td>停用</td><td>广西壮族自治区 · 贺州地区</td><td>1997–2001</td><td><code>451102</code> 八步区；<code>451122</code> 钟山县</td></tr>
    <tr><td><code>452428</code></td><td>富川县</td><td>更名</td><td>广西壮族自治区 · 梧州地区</td><td>1981–1982</td><td>代码未变，现名 富川县</td></tr>
    <tr><td><code>452428</code></td><td>富川瑶族自治县</td><td>更名</td><td>广西壮族自治区 · 梧州地区</td><td>1983–1996</td><td>代码未变，现名 富川县</td></tr>
    <tr><td><code>452428</code></td><td>富川瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 贺州地区</td><td>1997–2001</td><td><code>451123</code> 富川瑶族自治县</td></tr>
    <tr><td><code>452500</code></td><td>玉林地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452501</code></td><td>玉林市</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1983–1996</td><td><code>450902</code> 玉州区；<code>450924</code> 兴业县</td></tr>
    <tr><td><code>452502</code></td><td>贵港市</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1988–1994</td><td><code>450802</code> 港北区；<code>450803</code> 港南区</td></tr>
    <tr><td><code>452503</code></td><td>桂平市</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1994</td><td><code>450881</code> 桂平市</td></tr>
    <tr><td><code>452504</code></td><td>北流市</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1994–1996</td><td><code>450981</code> 北流市</td></tr>
    <tr><td><code>452521</code></td><td>玉林县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1982</td><td><code>452501</code> 玉林市</td></tr>
    <tr><td><code>452522</code></td><td>贵县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1987</td><td><code>452502</code> 贵港市</td></tr>
    <tr><td><code>452523</code></td><td>桂平县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1993</td><td><code>452503</code> 桂平市</td></tr>
    <tr><td><code>452524</code></td><td>平南县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1994</td><td><code>450821</code> 平南县</td></tr>
    <tr><td><code>452525</code></td><td>容县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1996</td><td><code>450921</code> 容县</td></tr>
    <tr><td><code>452526</code></td><td>北流县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1993</td><td><code>452504</code> 北流市</td></tr>
    <tr><td><code>452527</code></td><td>陆川县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1996</td><td><code>450922</code> 陆川县</td></tr>
    <tr><td><code>452528</code></td><td>博白县</td><td>停用</td><td>广西壮族自治区 · 玉林地区</td><td>1981–1996</td><td><code>450923</code> 博白县</td></tr>
    <tr><td><code>452600</code></td><td>百色地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452601</code></td><td>百色市</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1983–2001</td><td><code>451002</code> 右江区</td></tr>
    <tr><td><code>452621</code></td><td>百色县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–1982</td><td><code>452601</code> 百色市</td></tr>
    <tr><td><code>452622</code></td><td>田阳县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451021</code> 田阳县</td></tr>
    <tr><td><code>452623</code></td><td>田东县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451022</code> 田东县</td></tr>
    <tr><td><code>452624</code></td><td>平果县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451023</code> 平果县</td></tr>
    <tr><td><code>452625</code></td><td>德保县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451024</code> 德保县</td></tr>
    <tr><td><code>452626</code></td><td>靖西县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451025</code> 靖西县</td></tr>
    <tr><td><code>452627</code></td><td>那坡县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451026</code> 那坡县</td></tr>
    <tr><td><code>452628</code></td><td>凌云县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451027</code> 凌云县</td></tr>
    <tr><td><code>452629</code></td><td>乐业县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451028</code> 乐业县</td></tr>
    <tr><td><code>452630</code></td><td>田林县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451029</code> 田林县</td></tr>
    <tr><td><code>452631</code></td><td>隆林各族自治县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451031</code> 隆林各族自治县</td></tr>
    <tr><td><code>452632</code></td><td>西林县</td><td>停用</td><td>广西壮族自治区 · 百色地区</td><td>1981–2001</td><td><code>451030</code> 西林县</td></tr>
    <tr><td><code>452700</code></td><td>河池地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452701</code></td><td>河池市</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1983–2001</td><td><code>451202</code> 金城江区</td></tr>
    <tr><td><code>452702</code></td><td>宜州市</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1993–2001</td><td><code>451281</code> 宜州市</td></tr>
    <tr><td><code>452721</code></td><td>河池县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–1982</td><td><code>452701</code> 河池市</td></tr>
    <tr><td><code>452722</code></td><td>宜山县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–1992</td><td><code>452702</code> 宜州市</td></tr>
    <tr><td><code>452723</code></td><td>罗城县</td><td>更名</td><td>广西壮族自治区 · 河池地区</td><td>1981–1982</td><td>代码未变，现名 罗城县</td></tr>
    <tr><td><code>452723</code></td><td>罗城仫佬族自治县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1983–2001</td><td><code>451225</code> 罗城仫佬族自治县</td></tr>
    <tr><td><code>452724</code></td><td>环江县</td><td>更名</td><td>广西壮族自治区 · 河池地区</td><td>1981–1985</td><td>代码未变，现名 环江县</td></tr>
    <tr><td><code>452724</code></td><td>环江毛南族自治县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1986–2001</td><td><code>451226</code> 环江毛南族自治县</td></tr>
    <tr><td><code>452725</code></td><td>南丹县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>451221</code> 南丹县</td></tr>
    <tr><td><code>452726</code></td><td>天峨县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>451222</code> 天峨县</td></tr>
    <tr><td><code>452727</code></td><td>凤山县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>451223</code> 凤山县</td></tr>
    <tr><td><code>452728</code></td><td>东兰县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>451224</code> 东兰县</td></tr>
    <tr><td><code>452729</code></td><td>巴马瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>452731</code> 大化瑶族自治县；<code>451227</code> 巴马瑶族自治县</td></tr>
    <tr><td><code>452730</code></td><td>都安瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1981–2001</td><td><code>452722</code> 宜山县；<code>452731</code> 大化瑶族自治县；<code>451228</code> 都安瑶族自治县</td></tr>
    <tr><td><code>452731</code></td><td>大化瑶族自治县</td><td>停用</td><td>广西壮族自治区 · 河池地区</td><td>1987–2001</td><td><code>451229</code> 大化瑶族自治县</td></tr>
    <tr><td><code>452800</code></td><td>钦州地区</td><td>停用</td><td>广西壮族自治区</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>452801</code></td><td>北海市</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1982</td><td><code>450500</code> 北海市</td></tr>
    <tr><td><code>452802</code></td><td>钦州市</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1983–1993</td><td><code>450702</code> 钦南区；<code>450703</code> 钦北区</td></tr>
    <tr><td><code>452821</code></td><td>上思县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1992</td><td><code>450621</code> 上思县</td></tr>
    <tr><td><code>452822</code></td><td>防城各族自治县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1992</td><td><code>450602</code> 港口区；<code>450603</code> 防城区</td></tr>
    <tr><td><code>452823</code></td><td>钦州县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1982</td><td><code>452802</code> 钦州市</td></tr>
    <tr><td><code>452824</code></td><td>灵山县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1993</td><td><code>450721</code> 灵山县</td></tr>
    <tr><td><code>452825</code></td><td>合浦县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1986</td><td><code>450521</code> 合浦县</td></tr>
    <tr><td><code>452826</code></td><td>浦北县</td><td>停用</td><td>广西壮族自治区 · 钦州地区</td><td>1981–1993</td><td><code>450722</code> 浦北县</td></tr>
    <tr><td><code>460001</code></td><td>通什市</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469001</code> 五指山市</td></tr>
    <tr><td><code>460002</code></td><td>琼海市</td><td>停用</td><td>海南省</td><td>1992–2000</td><td><code>469002</code> 琼海市</td></tr>
    <tr><td><code>460003</code></td><td>儋州市</td><td>停用</td><td>海南省</td><td>1993–2000</td><td><code>469003</code> 儋州市</td></tr>
    <tr><td><code>460004</code></td><td>琼山市</td><td>停用</td><td>海南省</td><td>1994–2000</td><td><code>469004</code> 琼山市</td></tr>
    <tr><td><code>460005</code></td><td>文昌市</td><td>停用</td><td>海南省</td><td>1995–2000</td><td><code>469005</code> 文昌市</td></tr>
    <tr><td><code>460006</code></td><td>万宁市</td><td>停用</td><td>海南省</td><td>1996–2000</td><td><code>469006</code> 万宁市</td></tr>
    <tr><td><code>460007</code></td><td>东方市</td><td>停用</td><td>海南省</td><td>1997–2000</td><td><code>469007</code> 东方市</td></tr>
    <tr><td><code>460021</code></td><td>琼山县</td><td>停用</td><td>海南省</td><td>1988–1993</td><td><code>460004</code> 琼山市</td></tr>
    <tr><td><code>460022</code></td><td>文昌县</td><td>停用</td><td>海南省</td><td>1988–1994</td><td><code>460005</code> 文昌市</td></tr>
    <tr><td><code>460023</code></td><td>琼海县</td><td>停用</td><td>海南省</td><td>1988–1991</td><td><code>460002</code> 琼海市</td></tr>
    <tr><td><code>460024</code></td><td>万宁县</td><td>停用</td><td>海南省</td><td>1988–1995</td><td><code>460006</code> 万宁市</td></tr>
    <tr><td><code>460025</code></td><td>定安县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469021</code> 定安县</td></tr>
    <tr><td><code>460026</code></td><td>屯昌县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469022</code> 屯昌县</td></tr>
    <tr><td><code>460027</code></td><td>澄迈县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469023</code> 澄迈县</td></tr>
    <tr><td><code>460028</code></td><td>临高县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469024</code> 临高县</td></tr>
    <tr><td><code>460029</code></td><td>儋县</td><td>停用</td><td>海南省</td><td>1988–1992</td><td><code>460003</code> 儋州市</td></tr>
    <tr><td><code>460030</code></td><td>白沙黎族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469025</code> 白沙黎族自治县</td></tr>
    <tr><td><code>460031</code></td><td>昌江黎族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469026</code> 昌江黎族自治县</td></tr>
    <tr><td><code>460032</code></td><td>东方黎族自治县</td><td>停用</td><td>海南省</td><td>1988–1996</td><td><code>460007</code> 东方市</td></tr>
    <tr><td><code>460033</code></td><td>乐东黎族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469027</code> 乐东黎族自治县</td></tr>
    <tr><td><code>460034</code></td><td>陵水黎族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469028</code> 陵水黎族自治县</td></tr>
    <tr><td><code>460035</code></td><td>保亭黎族苗族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469029</code> 保亭黎族苗族自治县</td></tr>
    <tr><td><code>460036</code></td><td>琼中黎族苗族自治县</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469030</code> 琼中黎族苗族自治县</td></tr>
    <tr><td><code>460037</code></td><td>西沙群岛</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469031</code> 西沙群岛</td></tr>
    <tr><td><code>460038</code></td><td>南沙群岛</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469032</code> 南沙群岛</td></tr>
    <tr><td><code>460039</code></td><td>中沙群岛的岛礁及其海域</td><td>停用</td><td>海南省</td><td>1988–2000</td><td><code>469033</code> 中沙群岛的岛礁及其海域</td></tr>
    <tr><td><code>460102</code></td><td>振东区</td><td>停用</td><td>海南省 · 海口市</td><td>1990–2001</td><td><code>460107</code> 琼山区；<code>460108</code> 美兰区</td></tr>
    <tr><td><code>460103</code></td><td>新华区</td><td>停用</td><td>海南省 · 海口市</td><td>1990–2001</td><td><code>460106</code> 龙华区</td></tr>
    <tr><td><code>460104</code></td><td>秀英区</td><td>停用</td><td>海南省 · 海口市</td><td>1990–2001</td><td><code>460105</code> 秀英区</td></tr>
    <tr><td><code>469003</code></td><td>儋州市</td><td>停用</td><td>海南省</td><td>2001–2014</td><td><code>460400</code> 儋州市</td></tr>
    <tr><td><code>469004</code></td><td>琼山市</td><td>停用</td><td>海南省</td><td>2001</td><td><code>460105</code> 秀英区；<code>460106</code> 龙华区；<code>460107</code> 琼山区；<code>460108</code> 美兰区</td></tr>
    <tr><td><code>469031</code></td><td>西沙群岛</td><td>停用</td><td>海南省</td><td>2001–2011</td><td><code>460300</code> 三沙市</td></tr>
    <tr><td><code>469032</code></td><td>南沙群岛</td><td>停用</td><td>海南省</td><td>2001–2011</td><td><code>460300</code> 三沙市</td></tr>
    <tr><td><code>469033</code></td><td>中沙群岛的岛礁及其海域</td><td>停用</td><td>海南省</td><td>2001–2011</td><td><code>460300</code> 三沙市</td></tr>
    <tr><td><code>500101</code></td><td>万县区</td><td>更名</td><td>重庆市</td><td>1997</td><td>代码未变，现名 万州区</td></tr>
    <tr><td><code>500105</code></td><td>江北区</td><td>停用</td><td>重庆市</td><td>1997–2024</td><td><code>500157</code> 两江新区</td></tr>
    <tr><td><code>500110</code></td><td>万盛区</td><td>更名</td><td>重庆市</td><td>1997–2010</td><td>代码未变，现名 綦江区</td></tr>
    <tr><td><code>500111</code></td><td>双桥区</td><td>更名</td><td>重庆市</td><td>1997–2010</td><td>代码未变，现名 大足区</td></tr>
    <tr><td><code>500112</code></td><td>渝北区</td><td>停用</td><td>重庆市</td><td>1997–2024</td><td><code>500109</code> 北碚区；<code>500157</code> 两江新区</td></tr>
    <tr><td><code>500221</code></td><td>长寿县</td><td>停用</td><td>重庆市</td><td>1997–2000</td><td><code>500115</code> 长寿区</td></tr>
    <tr><td><code>500222</code></td><td>綦江县</td><td>停用</td><td>重庆市</td><td>1997–2010</td><td><code>500110</code> 綦江区</td></tr>
    <tr><td><code>500223</code></td><td>潼南县</td><td>停用</td><td>重庆市</td><td>1997–2014</td><td><code>500152</code> 潼南区</td></tr>
    <tr><td><code>500224</code></td><td>铜梁县</td><td>停用</td><td>重庆市</td><td>1997–2013</td><td><code>500151</code> 铜梁区</td></tr>
    <tr><td><code>500225</code></td><td>大足县</td><td>停用</td><td>重庆市</td><td>1997–2010</td><td><code>500111</code> 大足区</td></tr>
    <tr><td><code>500226</code></td><td>荣昌县</td><td>停用</td><td>重庆市</td><td>1997–2014</td><td><code>500153</code> 荣昌区</td></tr>
    <tr><td><code>500227</code></td><td>璧山县</td><td>停用</td><td>重庆市</td><td>1997–2013</td><td><code>500120</code> 璧山区</td></tr>
    <tr><td><code>500228</code></td><td>梁平县</td><td>停用</td><td>重庆市</td><td>1997–2015</td><td><code>500155</code> 梁平区</td></tr>
    <tr><td><code>500232</code></td><td>武隆县</td><td>停用</td><td>重庆市</td><td>1997–2015</td><td><code>500156</code> 武隆区</td></tr>
    <tr><td><code>500234</code></td><td>开县</td><td>停用</td><td>重庆市</td><td>1997–2015</td><td><code>500154</code> 开州区</td></tr>
    <tr><td><code>500239</code></td><td>黔江土家族苗族自治县</td><td>停用</td><td>重庆市</td><td>1997–1999</td><td><code>500114</code> 黔江区</td></tr>
    <tr><td><code>500381</code></td><td>江津市</td><td>停用</td><td>重庆市</td><td>1997–2005</td><td><code>500116</code> 江津区</td></tr>
    <tr><td><code>500382</code></td><td>合川市</td><td>停用</td><td>重庆市</td><td>1997–2005</td><td><code>500117</code> 合川区</td></tr>
    <tr><td><code>500383</code></td><td>永川市</td><td>停用</td><td>重庆市</td><td>1997–2005</td><td><code>500118</code> 永川区</td></tr>
    <tr><td><code>500384</code></td><td>南川市</td><td>停用</td><td>重庆市</td><td>1997–2005</td><td><code>500119</code> 南川区</td></tr>
    <tr><td><code>510102</code></td><td>东城区</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1989</td><td><code>510104</code> 锦江区；<code>510107</code> 武侯区；<code>510108</code> 成华区</td></tr>
    <tr><td><code>510103</code></td><td>西城区</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1989</td><td><code>510105</code> 青羊区；<code>510106</code> 金牛区；<code>510107</code> 武侯区</td></tr>
    <tr><td><code>510111</code></td><td>金牛区</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1989</td><td><code>510104</code> 锦江区；<code>510105</code> 青羊区；<code>510106</code> 金牛区；<code>510107</code> 武侯区；<code>510108</code> 成华区</td></tr>
    <tr><td><code>510122</code></td><td>双流县</td><td>停用</td><td>四川省 · 成都市</td><td>1981–2014</td><td><code>510116</code> 双流区</td></tr>
    <tr><td><code>510123</code></td><td>温江县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–2001</td><td><code>510115</code> 温江区</td></tr>
    <tr><td><code>510124</code></td><td>郫县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–2015</td><td><code>510117</code> 郫都区</td></tr>
    <tr><td><code>510125</code></td><td>新都县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–2000</td><td><code>510114</code> 新都区</td></tr>
    <tr><td><code>510126</code></td><td>彭县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1992</td><td><code>510182</code> 彭州市</td></tr>
    <tr><td><code>510127</code></td><td>灌县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1987</td><td><code>519003</code> 都江堰市</td></tr>
    <tr><td><code>510128</code></td><td>崇庆县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1993</td><td><code>510184</code> 崇州市</td></tr>
    <tr><td><code>510130</code></td><td>邛崃县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–1993</td><td><code>510183</code> 邛崃市</td></tr>
    <tr><td><code>510132</code></td><td>新津县</td><td>停用</td><td>四川省 · 成都市</td><td>1983–2019</td><td><code>510118</code> 新津区</td></tr>
    <tr><td><code>510200</code></td><td>重庆市</td><td>停用</td><td>四川省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>510202</code></td><td>市中区</td><td>更名</td><td>四川省 · 重庆市</td><td>1983–1993</td><td>代码未变，现名 市中区</td></tr>
    <tr><td><code>510202</code></td><td>渝中区</td><td>停用</td><td>四川省 · 重庆市</td><td>1994–1996</td><td><code>500103</code> 渝中区</td></tr>
    <tr><td><code>510203</code></td><td>大渡口区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500104</code> 大渡口区</td></tr>
    <tr><td><code>510211</code></td><td>江北区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500105</code> 江北区</td></tr>
    <tr><td><code>510212</code></td><td>沙坪坝区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>510202</code> 市中区；<code>510213</code> 九龙坡区；<code>500106</code> 沙坪坝区</td></tr>
    <tr><td><code>510213</code></td><td>九龙坡区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>510203</code> 大渡口区；<code>510219</code> 巴南区；<code>500107</code> 九龙坡区</td></tr>
    <tr><td><code>510214</code></td><td>南岸区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>510211</code> 江北区；<code>500108</code> 南岸区</td></tr>
    <tr><td><code>510215</code></td><td>北碚区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500109</code> 北碚区</td></tr>
    <tr><td><code>510216</code></td><td>南桐矿区</td><td>更名</td><td>四川省 · 重庆市</td><td>1983–1992</td><td>代码未变，现名 南桐矿区</td></tr>
    <tr><td><code>510216</code></td><td>万盛区</td><td>停用</td><td>四川省 · 重庆市</td><td>1993–1996</td><td><code>500110</code> 綦江区</td></tr>
    <tr><td><code>510217</code></td><td>双桥区</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500111</code> 大足区</td></tr>
    <tr><td><code>510218</code></td><td>渝北区</td><td>停用</td><td>四川省 · 重庆市</td><td>1994–1996</td><td><code>500112</code> 渝北区</td></tr>
    <tr><td><code>510219</code></td><td>巴南区</td><td>停用</td><td>四川省 · 重庆市</td><td>1994–1996</td><td><code>500113</code> 巴南区</td></tr>
    <tr><td><code>510221</code></td><td>长寿县</td><td>停用</td><td>四川省 · 重庆市</td><td>1981–1996</td><td><code>500221</code> 长寿县</td></tr>
    <tr><td><code>510222</code></td><td>巴县</td><td>停用</td><td>四川省 · 重庆市</td><td>1981–1993</td><td><code>510203</code> 大渡口区；<code>510212</code> 沙坪坝区；<code>510213</code> 九龙坡区；<code>510214</code> 南岸区；<code>510219</code> 巴南区</td></tr>
    <tr><td><code>510223</code></td><td>綦江县</td><td>停用</td><td>四川省 · 重庆市</td><td>1981–1996</td><td><code>500222</code> 綦江县</td></tr>
    <tr><td><code>510224</code></td><td>江北县</td><td>停用</td><td>四川省 · 重庆市</td><td>1981–1993</td><td><code>510211</code> 江北区；<code>510215</code> 北碚区；<code>510218</code> 渝北区</td></tr>
    <tr><td><code>510225</code></td><td>江津县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1991</td><td><code>510282</code> 江津市</td></tr>
    <tr><td><code>510226</code></td><td>合川县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1991</td><td><code>510283</code> 合川市</td></tr>
    <tr><td><code>510227</code></td><td>潼南县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500223</code> 潼南县</td></tr>
    <tr><td><code>510228</code></td><td>铜梁县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500224</code> 铜梁县</td></tr>
    <tr><td><code>510229</code></td><td>永川县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1991</td><td><code>510281</code> 永川市</td></tr>
    <tr><td><code>510230</code></td><td>大足县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500225</code> 大足县</td></tr>
    <tr><td><code>510231</code></td><td>荣昌县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500226</code> 荣昌县</td></tr>
    <tr><td><code>510232</code></td><td>璧山县</td><td>停用</td><td>四川省 · 重庆市</td><td>1983–1996</td><td><code>500227</code> 璧山县</td></tr>
    <tr><td><code>510281</code></td><td>永川市</td><td>停用</td><td>四川省 · 重庆市</td><td>1992–1996</td><td><code>500383</code> 永川市</td></tr>
    <tr><td><code>510282</code></td><td>江津市</td><td>停用</td><td>四川省 · 重庆市</td><td>1992–1996</td><td><code>500381</code> 江津市</td></tr>
    <tr><td><code>510283</code></td><td>合川市</td><td>停用</td><td>四川省 · 重庆市</td><td>1992–1996</td><td><code>500382</code> 合川市</td></tr>
    <tr><td><code>510400</code></td><td>渡口市</td><td>更名</td><td>四川省</td><td>1981–1986</td><td>代码未变，现名 攀枝花市</td></tr>
    <tr><td><code>510402</code></td><td>东区</td><td>更名</td><td>四川省 · 渡口市</td><td>1983–1986</td><td>代码未变，现名 东区</td></tr>
    <tr><td><code>510403</code></td><td>西区</td><td>更名</td><td>四川省 · 渡口市</td><td>1983–1986</td><td>代码未变，现名 西区</td></tr>
    <tr><td><code>510411</code></td><td>仁和区</td><td>更名</td><td>四川省 · 渡口市</td><td>1983–1986</td><td>代码未变，现名 仁和区</td></tr>
    <tr><td><code>510421</code></td><td>米易县</td><td>更名</td><td>四川省 · 渡口市</td><td>1981–1986</td><td>代码未变，现名 米易县</td></tr>
    <tr><td><code>510422</code></td><td>盐边县</td><td>更名</td><td>四川省 · 渡口市</td><td>1981–1986</td><td>代码未变，现名 盐边县</td></tr>
    <tr><td><code>510502</code></td><td>市中区</td><td>更名</td><td>四川省 · 泸州市</td><td>1984–1994</td><td>代码未变，现名 江阳区</td></tr>
    <tr><td><code>510523</code></td><td>纳溪县</td><td>停用</td><td>四川省 · 泸州市</td><td>1983–1994</td><td><code>510502</code> 江阳区；<code>510502</code> 江阳区；<code>510503</code> 纳溪区</td></tr>
    <tr><td><code>510602</code></td><td>市中区</td><td>停用</td><td>四川省 · 德阳市</td><td>1984–1995</td><td><code>510603</code> 旌阳区；<code>510626</code> 罗江县</td></tr>
    <tr><td><code>510621</code></td><td>德阳县</td><td>停用</td><td>四川省 · 德阳市</td><td>1983</td><td><code>510602</code> 市中区</td></tr>
    <tr><td><code>510622</code></td><td>绵竹县</td><td>停用</td><td>四川省 · 德阳市</td><td>1983–1995</td><td><code>510683</code> 绵竹市</td></tr>
    <tr><td><code>510624</code></td><td>广汉县</td><td>停用</td><td>四川省 · 德阳市</td><td>1983–1987</td><td><code>519001</code> 广汉市</td></tr>
    <tr><td><code>510625</code></td><td>什邡县</td><td>停用</td><td>四川省 · 德阳市</td><td>1983–1994</td><td><code>510682</code> 什邡市</td></tr>
    <tr><td><code>510626</code></td><td>罗江县</td><td>停用</td><td>四川省 · 德阳市</td><td>1996–2016</td><td><code>510604</code> 罗江区</td></tr>
    <tr><td><code>510702</code></td><td>市中区</td><td>停用</td><td>四川省 · 绵阳市</td><td>1985–1991</td><td><code>510703</code> 涪城区；<code>510704</code> 游仙区</td></tr>
    <tr><td><code>510721</code></td><td>江油县</td><td>停用</td><td>四川省 · 绵阳市</td><td>1985–1987</td><td><code>519002</code> 江油市</td></tr>
    <tr><td><code>510724</code></td><td>安县</td><td>停用</td><td>四川省 · 绵阳市</td><td>1985–2015</td><td><code>510726</code> 北川羌族自治县；<code>510705</code> 安州区</td></tr>
    <tr><td><code>510726</code></td><td>北川县</td><td>更名</td><td>四川省 · 绵阳市</td><td>1985–2002</td><td>代码未变，现名 北川羌族自治县</td></tr>
    <tr><td><code>510802</code></td><td>市中区</td><td>更名</td><td>四川省 · 广元市</td><td>1985–2006</td><td>代码未变，现名 利州区</td></tr>
    <tr><td><code>510811</code></td><td>元坝区</td><td>更名</td><td>四川省 · 广元市</td><td>1989–2012</td><td>代码未变，现名 昭化区</td></tr>
    <tr><td><code>510902</code></td><td>市中区</td><td>停用</td><td>四川省 · 遂宁市</td><td>1985–2002</td><td><code>510903</code> 船山区；<code>510904</code> 安居区</td></tr>
    <tr><td><code>510922</code></td><td>射洪县</td><td>停用</td><td>四川省 · 遂宁市</td><td>1985–2018</td><td><code>510981</code> 射洪市</td></tr>
    <tr><td><code>511021</code></td><td>内江县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–1988</td><td><code>511002</code> 市中区；<code>511011</code> 东兴区</td></tr>
    <tr><td><code>511022</code></td><td>乐至县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–1997</td><td><code>513922</code> 乐至县</td></tr>
    <tr><td><code>511023</code></td><td>安岳县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–1997</td><td><code>513921</code> 安岳县</td></tr>
    <tr><td><code>511026</code></td><td>资阳县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–1992</td><td><code>511081</code> 资阳市</td></tr>
    <tr><td><code>511027</code></td><td>简阳县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–1993</td><td><code>511082</code> 简阳市</td></tr>
    <tr><td><code>511028</code></td><td>隆昌县</td><td>停用</td><td>四川省 · 内江市</td><td>1985–2016</td><td><code>511083</code> 隆昌市</td></tr>
    <tr><td><code>511081</code></td><td>资阳市</td><td>停用</td><td>四川省 · 内江市</td><td>1993–1997</td><td><code>513901</code> 资阳市</td></tr>
    <tr><td><code>511082</code></td><td>简阳市</td><td>停用</td><td>四川省 · 内江市</td><td>1994–1997</td><td><code>513902</code> 简阳市</td></tr>
    <tr><td><code>511121</code></td><td>仁寿县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513822</code> 仁寿县</td></tr>
    <tr><td><code>511122</code></td><td>眉山县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513821</code> 眉山县</td></tr>
    <tr><td><code>511125</code></td><td>峨眉县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1987</td><td><code>519004</code> 峨眉山市</td></tr>
    <tr><td><code>511127</code></td><td>洪雅县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513824</code> 洪雅县</td></tr>
    <tr><td><code>511128</code></td><td>彭山县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513823</code> 彭山县</td></tr>
    <tr><td><code>511130</code></td><td>青神县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513826</code> 青神县</td></tr>
    <tr><td><code>511131</code></td><td>丹棱县</td><td>停用</td><td>四川省 · 乐山市</td><td>1985–1996</td><td><code>513825</code> 丹棱县</td></tr>
    <tr><td><code>511200</code></td><td>万县市</td><td>停用</td><td>四川省</td><td>1992–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>511202</code></td><td>龙宝区</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500101</code> 万州区</td></tr>
    <tr><td><code>511203</code></td><td>天城区</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500101</code> 万州区</td></tr>
    <tr><td><code>511204</code></td><td>五桥区</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500101</code> 万州区</td></tr>
    <tr><td><code>511221</code></td><td>开县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500234</code> 开县</td></tr>
    <tr><td><code>511222</code></td><td>忠县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500233</code> 忠县</td></tr>
    <tr><td><code>511223</code></td><td>梁平县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500228</code> 梁平县</td></tr>
    <tr><td><code>511224</code></td><td>云阳县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500235</code> 云阳县</td></tr>
    <tr><td><code>511225</code></td><td>奉节县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500236</code> 奉节县</td></tr>
    <tr><td><code>511226</code></td><td>巫山县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500237</code> 巫山县</td></tr>
    <tr><td><code>511227</code></td><td>巫溪县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500238</code> 巫溪县</td></tr>
    <tr><td><code>511228</code></td><td>城口县</td><td>停用</td><td>四川省 · 万县市</td><td>1992–1996</td><td><code>500229</code> 城口县</td></tr>
    <tr><td><code>511400</code></td><td>涪陵市</td><td>更名</td><td>四川省</td><td>1995–1996</td><td>代码未变，现名 眉山市</td></tr>
    <tr><td><code>511402</code></td><td>枳城区</td><td>更名</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td>代码未变，现名 东坡区</td></tr>
    <tr><td><code>511403</code></td><td>李渡区</td><td>更名</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td>代码未变，现名 彭山区</td></tr>
    <tr><td><code>511421</code></td><td>垫江县</td><td>更名</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td>代码未变，现名 仁寿县</td></tr>
    <tr><td><code>511422</code></td><td>丰都县</td><td>更名</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td>代码未变，现名 丰都县</td></tr>
    <tr><td><code>511422</code></td><td>彭山县</td><td>停用</td><td>四川省 · 眉山市</td><td>2000–2013</td><td><code>511403</code> 彭山区</td></tr>
    <tr><td><code>511423</code></td><td>武隆县</td><td>更名</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td>代码未变，现名 洪雅县</td></tr>
    <tr><td><code>511481</code></td><td>南川市</td><td>停用</td><td>四川省 · 涪陵市</td><td>1995–1996</td><td><code>500384</code> 南川市</td></tr>
    <tr><td><code>511521</code></td><td>宜宾县</td><td>停用</td><td>四川省 · 宜宾市</td><td>1996–2017</td><td><code>511502</code> 翠屏区；<code>511504</code> 叙州区</td></tr>
    <tr><td><code>511522</code></td><td>南溪县</td><td>停用</td><td>四川省 · 宜宾市</td><td>1996–2010</td><td><code>511503</code> 南溪区</td></tr>
    <tr><td><code>511721</code></td><td>达县</td><td>停用</td><td>四川省 · 达州市</td><td>1999–2012</td><td><code>511702</code> 通川区；<code>511703</code> 达川区</td></tr>
    <tr><td><code>511821</code></td><td>名山县</td><td>停用</td><td>四川省 · 雅安市</td><td>2000–2011</td><td><code>511803</code> 名山区</td></tr>
    <tr><td><code>512081</code></td><td>简阳市</td><td>停用</td><td>四川省 · 资阳市</td><td>2000–2015</td><td><code>510185</code> 简阳市</td></tr>
    <tr><td><code>512100</code></td><td>永川地区</td><td>停用</td><td>四川省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512121</code></td><td>江津县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510225</code> 江津县</td></tr>
    <tr><td><code>512122</code></td><td>合川县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510226</code> 合川县</td></tr>
    <tr><td><code>512123</code></td><td>潼南县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510227</code> 潼南县</td></tr>
    <tr><td><code>512124</code></td><td>铜梁县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510228</code> 铜梁县</td></tr>
    <tr><td><code>512125</code></td><td>永川县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510229</code> 永川县</td></tr>
    <tr><td><code>512126</code></td><td>大足县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510230</code> 大足县</td></tr>
    <tr><td><code>512127</code></td><td>荣昌县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510231</code> 荣昌县</td></tr>
    <tr><td><code>512128</code></td><td>璧山县</td><td>停用</td><td>四川省 · 永川地区</td><td>1981–1982</td><td><code>510232</code> 璧山县</td></tr>
    <tr><td><code>512200</code></td><td>万县地区</td><td>停用</td><td>四川省</td><td>1981–1991</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512201</code></td><td>万县市</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511202</code> 龙宝区；<code>511203</code> 天城区；<code>511204</code> 五桥区</td></tr>
    <tr><td><code>512221</code></td><td>万县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511202</code> 龙宝区；<code>511203</code> 天城区；<code>511204</code> 五桥区</td></tr>
    <tr><td><code>512222</code></td><td>开县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511221</code> 开县</td></tr>
    <tr><td><code>512223</code></td><td>忠县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511222</code> 忠县</td></tr>
    <tr><td><code>512224</code></td><td>梁平县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511223</code> 梁平县</td></tr>
    <tr><td><code>512225</code></td><td>云阳县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511224</code> 云阳县</td></tr>
    <tr><td><code>512226</code></td><td>奉节县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511225</code> 奉节县</td></tr>
    <tr><td><code>512227</code></td><td>巫山县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511226</code> 巫山县</td></tr>
    <tr><td><code>512228</code></td><td>巫溪县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511227</code> 巫溪县</td></tr>
    <tr><td><code>512229</code></td><td>城口县</td><td>停用</td><td>四川省 · 万县地区</td><td>1981–1991</td><td><code>511228</code> 城口县</td></tr>
    <tr><td><code>512300</code></td><td>涪陵地区</td><td>停用</td><td>四川省</td><td>1981–1994</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512301</code></td><td>涪陵市</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1994</td><td><code>511402</code> 东坡区；<code>511403</code> 彭山区</td></tr>
    <tr><td><code>512302</code></td><td>南川市</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1994</td><td><code>511481</code> 南川市</td></tr>
    <tr><td><code>512321</code></td><td>涪陵县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td><code>512301</code> 涪陵市</td></tr>
    <tr><td><code>512322</code></td><td>垫江县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1981–1994</td><td><code>511421</code> 仁寿县</td></tr>
    <tr><td><code>512323</code></td><td>南川县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1981–1993</td><td><code>512302</code> 南川市</td></tr>
    <tr><td><code>512324</code></td><td>丰都县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1981–1994</td><td><code>511422</code> 丰都县</td></tr>
    <tr><td><code>512325</code></td><td>石柱县</td><td>更名</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td>代码未变，现名 石柱县</td></tr>
    <tr><td><code>512325</code></td><td>石柱土家族自治县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1987</td><td><code>513521</code> 石柱土家族自治县</td></tr>
    <tr><td><code>512326</code></td><td>武隆县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1981–1994</td><td><code>511423</code> 洪雅县</td></tr>
    <tr><td><code>512327</code></td><td>彭水县</td><td>更名</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td>代码未变，现名 彭水县</td></tr>
    <tr><td><code>512327</code></td><td>彭水苗族土家族自治县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1987</td><td><code>513525</code> 彭水苗族土家族自治县</td></tr>
    <tr><td><code>512328</code></td><td>黔江县</td><td>更名</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td>代码未变，现名 黔江县</td></tr>
    <tr><td><code>512328</code></td><td>黔江土家族苗族自治县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1987</td><td><code>513523</code> 黔江土家族苗族自治县</td></tr>
    <tr><td><code>512329</code></td><td>酉阳县</td><td>更名</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td>代码未变，现名 酉阳县</td></tr>
    <tr><td><code>512329</code></td><td>酉阳土家族苗族自治县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1987</td><td><code>513524</code> 酉阳土家族苗族自治县</td></tr>
    <tr><td><code>512330</code></td><td>秀山县</td><td>更名</td><td>四川省 · 涪陵地区</td><td>1981–1982</td><td>代码未变，现名 秀山县</td></tr>
    <tr><td><code>512330</code></td><td>秀山土家族苗族自治县</td><td>停用</td><td>四川省 · 涪陵地区</td><td>1983–1987</td><td><code>513522</code> 秀山土家族苗族自治县</td></tr>
    <tr><td><code>512400</code></td><td>内江地区</td><td>停用</td><td>四川省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512401</code></td><td>内江市</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511002</code> 市中区</td></tr>
    <tr><td><code>512421</code></td><td>内江县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511021</code> 内江县</td></tr>
    <tr><td><code>512422</code></td><td>资中县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511025</code> 资中县</td></tr>
    <tr><td><code>512423</code></td><td>资阳县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511026</code> 资阳县</td></tr>
    <tr><td><code>512424</code></td><td>简阳县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511027</code> 简阳县</td></tr>
    <tr><td><code>512425</code></td><td>威远县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511024</code> 威远县</td></tr>
    <tr><td><code>512426</code></td><td>隆昌县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511028</code> 隆昌县</td></tr>
    <tr><td><code>512427</code></td><td>安岳县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511023</code> 安岳县</td></tr>
    <tr><td><code>512428</code></td><td>乐至县</td><td>停用</td><td>四川省 · 内江地区</td><td>1981–1984</td><td><code>511022</code> 乐至县</td></tr>
    <tr><td><code>512500</code></td><td>宜宾地区</td><td>停用</td><td>四川省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512501</code></td><td>宜宾市</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511502</code> 翠屏区</td></tr>
    <tr><td><code>512502</code></td><td>泸州市</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1982</td><td><code>510500</code> 泸州市</td></tr>
    <tr><td><code>512521</code></td><td>泸县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1982</td><td><code>510521</code> 泸县</td></tr>
    <tr><td><code>512522</code></td><td>富顺县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1982</td><td><code>510322</code> 富顺县</td></tr>
    <tr><td><code>512523</code></td><td>合江县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1982</td><td><code>510522</code> 合江县</td></tr>
    <tr><td><code>512524</code></td><td>纳溪县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1982</td><td><code>510523</code> 纳溪县</td></tr>
    <tr><td><code>512525</code></td><td>叙永县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1984</td><td><code>510524</code> 叙永县</td></tr>
    <tr><td><code>512526</code></td><td>古蔺县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1984</td><td><code>510525</code> 古蔺县</td></tr>
    <tr><td><code>512527</code></td><td>宜宾县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>512501</code> 宜宾市；<code>511521</code> 宜宾县</td></tr>
    <tr><td><code>512528</code></td><td>南溪县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>512501</code> 宜宾市；<code>511522</code> 南溪县</td></tr>
    <tr><td><code>512529</code></td><td>江安县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511523</code> 江安县</td></tr>
    <tr><td><code>512530</code></td><td>长宁县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511524</code> 长宁县</td></tr>
    <tr><td><code>512531</code></td><td>高县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>512501</code> 宜宾市；<code>511525</code> 高县</td></tr>
    <tr><td><code>512532</code></td><td>筠连县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511527</code> 筠连县</td></tr>
    <tr><td><code>512533</code></td><td>珙县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511526</code> 珙县</td></tr>
    <tr><td><code>512534</code></td><td>兴文县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511528</code> 兴文县</td></tr>
    <tr><td><code>512535</code></td><td>屏山县</td><td>停用</td><td>四川省 · 宜宾地区</td><td>1981–1995</td><td><code>511529</code> 屏山县</td></tr>
    <tr><td><code>512600</code></td><td>乐山地区</td><td>停用</td><td>四川省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512601</code></td><td>乐山市</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>512625</code> 峨眉县；<code>511102</code> 市中区；<code>511111</code> 沙湾区；<code>511112</code> 五通桥区</td></tr>
    <tr><td><code>512621</code></td><td>仁寿县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511121</code> 仁寿县</td></tr>
    <tr><td><code>512622</code></td><td>眉山县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511122</code> 眉山县</td></tr>
    <tr><td><code>512623</code></td><td>犍为县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511123</code> 犍为县</td></tr>
    <tr><td><code>512624</code></td><td>井研县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511124</code> 井研县</td></tr>
    <tr><td><code>512625</code></td><td>峨眉县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511125</code> 峨眉县</td></tr>
    <tr><td><code>512626</code></td><td>夹江县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511126</code> 夹江县</td></tr>
    <tr><td><code>512627</code></td><td>洪雅县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511127</code> 洪雅县</td></tr>
    <tr><td><code>512628</code></td><td>彭山县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511128</code> 彭山县</td></tr>
    <tr><td><code>512629</code></td><td>沐川县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511129</code> 沐川县</td></tr>
    <tr><td><code>512630</code></td><td>青神县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511130</code> 青神县</td></tr>
    <tr><td><code>512631</code></td><td>丹棱县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511131</code> 丹棱县</td></tr>
    <tr><td><code>512632</code></td><td>峨边县</td><td>更名</td><td>四川省 · 乐山地区</td><td>1981–1983</td><td>代码未变，现名 峨边县</td></tr>
    <tr><td><code>512632</code></td><td>峨边彝族自治县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1984</td><td><code>511132</code> 峨边彝族自治县</td></tr>
    <tr><td><code>512633</code></td><td>马边县</td><td>更名</td><td>四川省 · 乐山地区</td><td>1981–1983</td><td>代码未变，现名 马边县</td></tr>
    <tr><td><code>512633</code></td><td>马边彝族自治县</td><td>停用</td><td>四川省 · 乐山地区</td><td>1984</td><td><code>511133</code> 马边彝族自治县</td></tr>
    <tr><td><code>512634</code></td><td>金口河工农区</td><td>停用</td><td>四川省 · 乐山地区</td><td>1981–1984</td><td><code>511113</code> 金口河区</td></tr>
    <tr><td><code>512700</code></td><td>温江地区</td><td>停用</td><td>四川省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512721</code></td><td>温江县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510123</code> 温江县</td></tr>
    <tr><td><code>512722</code></td><td>郫县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510124</code> 郫县</td></tr>
    <tr><td><code>512723</code></td><td>新都县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510125</code> 新都县</td></tr>
    <tr><td><code>512724</code></td><td>广汉县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510624</code> 广汉县</td></tr>
    <tr><td><code>512725</code></td><td>什邡县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510625</code> 什邡县</td></tr>
    <tr><td><code>512726</code></td><td>彭县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510126</code> 彭县</td></tr>
    <tr><td><code>512727</code></td><td>灌县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510127</code> 灌县</td></tr>
    <tr><td><code>512728</code></td><td>崇庆县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510128</code> 崇庆县</td></tr>
    <tr><td><code>512729</code></td><td>大邑县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510129</code> 大邑县</td></tr>
    <tr><td><code>512730</code></td><td>邛崃县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510130</code> 邛崃县</td></tr>
    <tr><td><code>512731</code></td><td>蒲江县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510131</code> 蒲江县</td></tr>
    <tr><td><code>512732</code></td><td>新津县</td><td>停用</td><td>四川省 · 温江地区</td><td>1981–1982</td><td><code>510132</code> 新津县</td></tr>
    <tr><td><code>512800</code></td><td>绵阳地区</td><td>停用</td><td>四川省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512801</code></td><td>绵阳市</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510702</code> 市中区</td></tr>
    <tr><td><code>512821</code></td><td>德阳县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1982</td><td><code>510621</code> 德阳县</td></tr>
    <tr><td><code>512822</code></td><td>绵竹县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1982</td><td><code>510622</code> 绵竹县</td></tr>
    <tr><td><code>512823</code></td><td>安县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510724</code> 安县</td></tr>
    <tr><td><code>512824</code></td><td>江油县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510721</code> 江油县</td></tr>
    <tr><td><code>512825</code></td><td>梓潼县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510725</code> 梓潼县</td></tr>
    <tr><td><code>512826</code></td><td>剑阁县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510823</code> 剑阁县</td></tr>
    <tr><td><code>512827</code></td><td>广元县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510802</code> 利州区</td></tr>
    <tr><td><code>512828</code></td><td>旺苍县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510821</code> 旺苍县</td></tr>
    <tr><td><code>512829</code></td><td>青川县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510822</code> 青川县</td></tr>
    <tr><td><code>512830</code></td><td>平武县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510727</code> 平武县</td></tr>
    <tr><td><code>512831</code></td><td>北川县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510726</code> 北川羌族自治县</td></tr>
    <tr><td><code>512832</code></td><td>遂宁县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510902</code> 市中区</td></tr>
    <tr><td><code>512833</code></td><td>三台县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510722</code> 三台县</td></tr>
    <tr><td><code>512834</code></td><td>中江县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1982</td><td><code>510623</code> 中江县</td></tr>
    <tr><td><code>512835</code></td><td>蓬溪县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510921</code> 蓬溪县</td></tr>
    <tr><td><code>512836</code></td><td>射洪县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510922</code> 射洪县</td></tr>
    <tr><td><code>512837</code></td><td>盐亭县</td><td>停用</td><td>四川省 · 绵阳地区</td><td>1981–1984</td><td><code>510723</code> 盐亭县</td></tr>
    <tr><td><code>512900</code></td><td>南充地区</td><td>停用</td><td>四川省</td><td>1981–1992</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>512901</code></td><td>南充市</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511302</code> 顺庆区；<code>511304</code> 嘉陵区</td></tr>
    <tr><td><code>512902</code></td><td>华蓥市</td><td>停用</td><td>四川省 · 南充地区</td><td>1985–1992</td><td><code>513601</code> 华蓥市</td></tr>
    <tr><td><code>512903</code></td><td>阆中市</td><td>停用</td><td>四川省 · 南充地区</td><td>1991–1992</td><td><code>511381</code> 阆中市</td></tr>
    <tr><td><code>512921</code></td><td>南充县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511302</code> 顺庆区；<code>511303</code> 高坪区；<code>511304</code> 嘉陵区</td></tr>
    <tr><td><code>512922</code></td><td>南部县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511321</code> 南部县</td></tr>
    <tr><td><code>512923</code></td><td>岳池县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>513621</code> 岳池县</td></tr>
    <tr><td><code>512924</code></td><td>营山县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511322</code> 营山县</td></tr>
    <tr><td><code>512925</code></td><td>广安县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>513622</code> 广安县</td></tr>
    <tr><td><code>512926</code></td><td>蓬安县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511323</code> 蓬安县</td></tr>
    <tr><td><code>512927</code></td><td>仪陇县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511324</code> 仪陇县</td></tr>
    <tr><td><code>512928</code></td><td>武胜县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>513623</code> 武胜县</td></tr>
    <tr><td><code>512929</code></td><td>西充县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1992</td><td><code>511325</code> 西充县</td></tr>
    <tr><td><code>512930</code></td><td>阆中县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1990</td><td><code>512903</code> 阆中市</td></tr>
    <tr><td><code>512931</code></td><td>苍溪县</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1984</td><td><code>510824</code> 苍溪县</td></tr>
    <tr><td><code>512932</code></td><td>华云工农区</td><td>停用</td><td>四川省 · 南充地区</td><td>1981–1984</td><td><code>512902</code> 华蓥市</td></tr>
    <tr><td><code>513000</code></td><td>达县地区</td><td>更名</td><td>四川省</td><td>1981–1992</td><td>代码未变，现名 达县地区</td></tr>
    <tr><td><code>513000</code></td><td>达川地区</td><td>停用</td><td>四川省</td><td>1993–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513001</code></td><td>达县市</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 达县市</td></tr>
    <tr><td><code>513001</code></td><td>达川市</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511702</code> 通川区</td></tr>
    <tr><td><code>513002</code></td><td>万源市</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511781</code> 万源市</td></tr>
    <tr><td><code>513021</code></td><td>达县</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 达县</td></tr>
    <tr><td><code>513021</code></td><td>达县</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511702</code> 通川区；<code>511721</code> 达县</td></tr>
    <tr><td><code>513022</code></td><td>宣汉县</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 宣汉县</td></tr>
    <tr><td><code>513022</code></td><td>宣汉县</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511722</code> 宣汉县</td></tr>
    <tr><td><code>513023</code></td><td>开江县</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 开江县</td></tr>
    <tr><td><code>513023</code></td><td>开江县</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511723</code> 开江县</td></tr>
    <tr><td><code>513024</code></td><td>万源县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513002</code> 万源市</td></tr>
    <tr><td><code>513025</code></td><td>通江县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513721</code> 通江县</td></tr>
    <tr><td><code>513026</code></td><td>南江县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513722</code> 南江县</td></tr>
    <tr><td><code>513027</code></td><td>巴中县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513701</code> 巴中市</td></tr>
    <tr><td><code>513028</code></td><td>平昌县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513723</code> 平昌县</td></tr>
    <tr><td><code>513029</code></td><td>大竹县</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 大竹县</td></tr>
    <tr><td><code>513029</code></td><td>大竹县</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511724</code> 大竹县</td></tr>
    <tr><td><code>513030</code></td><td>渠县</td><td>更名</td><td>四川省 · 达县地区</td><td>1981–1992</td><td>代码未变，现名 渠县</td></tr>
    <tr><td><code>513030</code></td><td>渠县</td><td>停用</td><td>四川省 · 达川地区</td><td>1993–1998</td><td><code>511725</code> 渠县</td></tr>
    <tr><td><code>513031</code></td><td>邻水县</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513624</code> 邻水县</td></tr>
    <tr><td><code>513032</code></td><td>白沙工农区</td><td>停用</td><td>四川省 · 达县地区</td><td>1981–1992</td><td><code>513002</code> 万源市</td></tr>
    <tr><td><code>513100</code></td><td>雅安地区</td><td>停用</td><td>四川省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513101</code></td><td>雅安市</td><td>停用</td><td>四川省 · 雅安地区</td><td>1983–1999</td><td><code>511802</code> 雨城区</td></tr>
    <tr><td><code>513121</code></td><td>雅安县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1982</td><td><code>513101</code> 雅安市</td></tr>
    <tr><td><code>513122</code></td><td>名山县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511821</code> 名山县</td></tr>
    <tr><td><code>513123</code></td><td>荥经县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511822</code> 荥经县</td></tr>
    <tr><td><code>513124</code></td><td>汉源县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511823</code> 汉源县</td></tr>
    <tr><td><code>513125</code></td><td>石棉县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511824</code> 石棉县</td></tr>
    <tr><td><code>513126</code></td><td>天全县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511825</code> 天全县</td></tr>
    <tr><td><code>513127</code></td><td>芦山县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511826</code> 芦山县</td></tr>
    <tr><td><code>513128</code></td><td>宝兴县</td><td>停用</td><td>四川省 · 雅安地区</td><td>1981–1999</td><td><code>511827</code> 宝兴县</td></tr>
    <tr><td><code>513200</code></td><td>阿坝藏族自治州</td><td>更名</td><td>四川省</td><td>1981–1986</td><td>代码未变，现名 阿坝藏族羌族自治州</td></tr>
    <tr><td><code>513221</code></td><td>汶川县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 汶川县</td></tr>
    <tr><td><code>513222</code></td><td>理县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 理县</td></tr>
    <tr><td><code>513223</code></td><td>茂汶羌族自治县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 茂县</td></tr>
    <tr><td><code>513224</code></td><td>松潘县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 松潘县</td></tr>
    <tr><td><code>513225</code></td><td>南坪县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 九寨沟县</td></tr>
    <tr><td><code>513225</code></td><td>南坪县</td><td>更名</td><td>四川省 · 阿坝藏族羌族自治州</td><td>1987–1996</td><td>代码未变，现名 九寨沟县</td></tr>
    <tr><td><code>513226</code></td><td>金川县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 金川县</td></tr>
    <tr><td><code>513227</code></td><td>小金县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 小金县</td></tr>
    <tr><td><code>513228</code></td><td>黑水县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 黑水县</td></tr>
    <tr><td><code>513229</code></td><td>马尔康县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 马尔康县</td></tr>
    <tr><td><code>513229</code></td><td>马尔康县</td><td>停用</td><td>四川省 · 阿坝藏族羌族自治州</td><td>1987–2014</td><td><code>513201</code> 马尔康市</td></tr>
    <tr><td><code>513230</code></td><td>壤塘县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 壤塘县</td></tr>
    <tr><td><code>513231</code></td><td>阿坝县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 阿坝县</td></tr>
    <tr><td><code>513232</code></td><td>若尔盖县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 若尔盖县</td></tr>
    <tr><td><code>513233</code></td><td>红原县</td><td>更名</td><td>四川省 · 阿坝藏族自治州</td><td>1981–1986</td><td>代码未变，现名 红原县</td></tr>
    <tr><td><code>513321</code></td><td>康定县</td><td>停用</td><td>四川省 · 甘孜藏族自治州</td><td>1981–2014</td><td><code>513301</code> 康定市</td></tr>
    <tr><td><code>513421</code></td><td>西昌县</td><td>停用</td><td>四川省 · 凉山彝族自治州</td><td>1981–1985</td><td><code>513401</code> 西昌市</td></tr>
    <tr><td><code>513425</code></td><td>会理县</td><td>停用</td><td>四川省 · 凉山彝族自治州</td><td>1981–2020</td><td><code>513402</code> 会理市</td></tr>
    <tr><td><code>513500</code></td><td>黔江地区</td><td>停用</td><td>四川省</td><td>1988–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513521</code></td><td>石柱土家族自治县</td><td>停用</td><td>四川省 · 黔江地区</td><td>1988–1996</td><td><code>500240</code> 石柱土家族自治县</td></tr>
    <tr><td><code>513522</code></td><td>秀山土家族苗族自治县</td><td>停用</td><td>四川省 · 黔江地区</td><td>1988–1996</td><td><code>500241</code> 秀山土家族苗族自治县</td></tr>
    <tr><td><code>513523</code></td><td>黔江土家族苗族自治县</td><td>停用</td><td>四川省 · 黔江地区</td><td>1988–1996</td><td><code>500239</code> 黔江土家族苗族自治县</td></tr>
    <tr><td><code>513524</code></td><td>酉阳土家族苗族自治县</td><td>停用</td><td>四川省 · 黔江地区</td><td>1988–1996</td><td><code>500242</code> 酉阳土家族苗族自治县</td></tr>
    <tr><td><code>513525</code></td><td>彭水苗族土家族自治县</td><td>停用</td><td>四川省 · 黔江地区</td><td>1988–1996</td><td><code>500243</code> 彭水苗族土家族自治县</td></tr>
    <tr><td><code>513600</code></td><td>广安地区</td><td>停用</td><td>四川省</td><td>1993–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513601</code></td><td>华蓥市</td><td>停用</td><td>四川省 · 广安地区</td><td>1993–1997</td><td><code>511681</code> 华蓥市</td></tr>
    <tr><td><code>513621</code></td><td>岳池县</td><td>停用</td><td>四川省 · 广安地区</td><td>1993–1997</td><td><code>511621</code> 岳池县</td></tr>
    <tr><td><code>513622</code></td><td>广安县</td><td>停用</td><td>四川省 · 广安地区</td><td>1993–1997</td><td><code>511602</code> 广安区</td></tr>
    <tr><td><code>513623</code></td><td>武胜县</td><td>停用</td><td>四川省 · 广安地区</td><td>1993–1997</td><td><code>511622</code> 武胜县</td></tr>
    <tr><td><code>513624</code></td><td>邻水县</td><td>停用</td><td>四川省 · 广安地区</td><td>1993–1997</td><td><code>511623</code> 邻水县</td></tr>
    <tr><td><code>513700</code></td><td>巴中地区</td><td>停用</td><td>四川省</td><td>1993–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513701</code></td><td>巴中市</td><td>停用</td><td>四川省 · 巴中地区</td><td>1993–1999</td><td><code>511902</code> 巴州区</td></tr>
    <tr><td><code>513721</code></td><td>通江县</td><td>停用</td><td>四川省 · 巴中地区</td><td>1993–1999</td><td><code>511921</code> 通江县</td></tr>
    <tr><td><code>513722</code></td><td>南江县</td><td>停用</td><td>四川省 · 巴中地区</td><td>1993–1999</td><td><code>511922</code> 南江县</td></tr>
    <tr><td><code>513723</code></td><td>平昌县</td><td>停用</td><td>四川省 · 巴中地区</td><td>1993–1999</td><td><code>511923</code> 平昌县</td></tr>
    <tr><td><code>513800</code></td><td>眉山地区</td><td>停用</td><td>四川省</td><td>1997–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513821</code></td><td>眉山县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511402</code> 东坡区</td></tr>
    <tr><td><code>513822</code></td><td>仁寿县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511421</code> 仁寿县</td></tr>
    <tr><td><code>513823</code></td><td>彭山县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511422</code> 丰都县</td></tr>
    <tr><td><code>513824</code></td><td>洪雅县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511423</code> 洪雅县</td></tr>
    <tr><td><code>513825</code></td><td>丹棱县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511424</code> 丹棱县</td></tr>
    <tr><td><code>513826</code></td><td>青神县</td><td>停用</td><td>四川省 · 眉山地区</td><td>1997–1999</td><td><code>511425</code> 青神县</td></tr>
    <tr><td><code>513900</code></td><td>资阳地区</td><td>停用</td><td>四川省</td><td>1998–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>513901</code></td><td>资阳市</td><td>停用</td><td>四川省 · 资阳地区</td><td>1998–1999</td><td><code>512002</code> 雁江区</td></tr>
    <tr><td><code>513902</code></td><td>简阳市</td><td>停用</td><td>四川省 · 资阳地区</td><td>1998–1999</td><td><code>512081</code> 简阳市</td></tr>
    <tr><td><code>513921</code></td><td>安岳县</td><td>停用</td><td>四川省 · 资阳地区</td><td>1998–1999</td><td><code>512021</code> 安岳县</td></tr>
    <tr><td><code>513922</code></td><td>乐至县</td><td>停用</td><td>四川省 · 资阳地区</td><td>1998–1999</td><td><code>512022</code> 乐至县</td></tr>
    <tr><td><code>519001</code></td><td>广汉市</td><td>停用</td><td>四川省</td><td>1988–1989</td><td><code>510681</code> 广汉市</td></tr>
    <tr><td><code>519002</code></td><td>江油市</td><td>停用</td><td>四川省</td><td>1988–1989</td><td><code>510781</code> 江油市</td></tr>
    <tr><td><code>519003</code></td><td>都江堰市</td><td>停用</td><td>四川省</td><td>1988–1989</td><td><code>510181</code> 都江堰市</td></tr>
    <tr><td><code>519004</code></td><td>峨眉山市</td><td>停用</td><td>四川省</td><td>1988–1989</td><td><code>511181</code> 峨眉山市</td></tr>
    <tr><td><code>520114</code></td><td>小河区</td><td>停用</td><td>贵州省 · 贵阳市</td><td>2000–2011</td><td><code>520111</code> 花溪区</td></tr>
    <tr><td><code>520201</code></td><td>水城特区</td><td>更名</td><td>贵州省 · 六盘水市</td><td>1981–1986</td><td>代码未变，现名 钟山区</td></tr>
    <tr><td><code>520202</code></td><td>盘县特区</td><td>停用</td><td>贵州省 · 六盘水市</td><td>1981–1998</td><td><code>520222</code> 盘县</td></tr>
    <tr><td><code>520221</code></td><td>水城县</td><td>停用</td><td>贵州省 · 六盘水市</td><td>1987–2019</td><td><code>520201</code> 钟山区；<code>520204</code> 水城区</td></tr>
    <tr><td><code>520222</code></td><td>盘县</td><td>停用</td><td>贵州省 · 六盘水市</td><td>1999–2016</td><td><code>520281</code> 盘州市</td></tr>
    <tr><td><code>520321</code></td><td>遵义县</td><td>停用</td><td>贵州省 · 遵义市</td><td>1997–2015</td><td><code>520303</code> 汇川区；<code>520302</code> 红花岗区；<code>520303</code> 汇川区；<code>520304</code> 播州区</td></tr>
    <tr><td><code>520421</code></td><td>平坝县</td><td>停用</td><td>贵州省 · 安顺市</td><td>2000–2013</td><td><code>520403</code> 平坝区</td></tr>
    <tr><td><code>520522</code></td><td>黔西县</td><td>停用</td><td>贵州省 · 毕节市</td><td>2011–2020</td><td><code>520581</code> 黔西市</td></tr>
    <tr><td><code>522100</code></td><td>遵义地区</td><td>停用</td><td>贵州省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>522101</code></td><td>遵义市</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520302</code> 红花岗区</td></tr>
    <tr><td><code>522102</code></td><td>赤水市</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1990–1996</td><td><code>520381</code> 赤水市</td></tr>
    <tr><td><code>522103</code></td><td>仁怀市</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1995–1996</td><td><code>520382</code> 仁怀市</td></tr>
    <tr><td><code>522121</code></td><td>遵义县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520321</code> 遵义县</td></tr>
    <tr><td><code>522122</code></td><td>桐梓县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520322</code> 桐梓县</td></tr>
    <tr><td><code>522123</code></td><td>绥阳县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520323</code> 绥阳县</td></tr>
    <tr><td><code>522124</code></td><td>正安县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520324</code> 正安县</td></tr>
    <tr><td><code>522125</code></td><td>道真县</td><td>更名</td><td>贵州省 · 遵义地区</td><td>1981–1985</td><td>代码未变，现名 道真县</td></tr>
    <tr><td><code>522125</code></td><td>道真仡佬族苗族自治县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1986–1996</td><td><code>520325</code> 道真仡佬族苗族自治县</td></tr>
    <tr><td><code>522126</code></td><td>务川县</td><td>更名</td><td>贵州省 · 遵义地区</td><td>1981–1985</td><td>代码未变，现名 务川县</td></tr>
    <tr><td><code>522126</code></td><td>务川仡佬族苗族自治县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1986–1996</td><td><code>520326</code> 务川仡佬族苗族自治县</td></tr>
    <tr><td><code>522127</code></td><td>凤冈县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520327</code> 凤冈县</td></tr>
    <tr><td><code>522128</code></td><td>湄潭县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520328</code> 湄潭县</td></tr>
    <tr><td><code>522129</code></td><td>余庆县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520329</code> 余庆县</td></tr>
    <tr><td><code>522130</code></td><td>仁怀县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1994</td><td><code>522103</code> 仁怀市</td></tr>
    <tr><td><code>522131</code></td><td>赤水县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1989</td><td><code>522102</code> 赤水市</td></tr>
    <tr><td><code>522132</code></td><td>习水县</td><td>停用</td><td>贵州省 · 遵义地区</td><td>1981–1996</td><td><code>520330</code> 习水县</td></tr>
    <tr><td><code>522200</code></td><td>铜仁地区</td><td>停用</td><td>贵州省</td><td>1981–2010</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>522201</code></td><td>铜仁市</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1987–2010</td><td><code>520602</code> 碧江区；<code>520603</code> 万山区</td></tr>
    <tr><td><code>522221</code></td><td>铜仁县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–1986</td><td><code>522201</code> 铜仁市</td></tr>
    <tr><td><code>522222</code></td><td>江口县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520621</code> 江口县</td></tr>
    <tr><td><code>522223</code></td><td>玉屏县</td><td>更名</td><td>贵州省 · 铜仁地区</td><td>1981–1982</td><td>代码未变，现名 玉屏县</td></tr>
    <tr><td><code>522223</code></td><td>玉屏侗族自治县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1983–2010</td><td><code>520622</code> 玉屏侗族自治县</td></tr>
    <tr><td><code>522224</code></td><td>石阡县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520623</code> 石阡县</td></tr>
    <tr><td><code>522225</code></td><td>思南县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520624</code> 思南县</td></tr>
    <tr><td><code>522226</code></td><td>印江县</td><td>更名</td><td>贵州省 · 铜仁地区</td><td>1981–1985</td><td>代码未变，现名 印江县</td></tr>
    <tr><td><code>522226</code></td><td>印江土家族苗族自治县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1986–2010</td><td><code>520625</code> 印江土家族苗族自治县</td></tr>
    <tr><td><code>522227</code></td><td>德江县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520626</code> 德江县</td></tr>
    <tr><td><code>522228</code></td><td>沿河县</td><td>更名</td><td>贵州省 · 铜仁地区</td><td>1981–1985</td><td>代码未变，现名 沿河县</td></tr>
    <tr><td><code>522228</code></td><td>沿河土家族自治县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1986–2010</td><td><code>520627</code> 沿河土家族自治县</td></tr>
    <tr><td><code>522229</code></td><td>松桃苗族自治县</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520628</code> 松桃苗族自治县</td></tr>
    <tr><td><code>522230</code></td><td>万山特区</td><td>停用</td><td>贵州省 · 铜仁地区</td><td>1981–2010</td><td><code>520603</code> 万山区</td></tr>
    <tr><td><code>522321</code></td><td>兴义县</td><td>停用</td><td>贵州省 · 黔西南布依族苗族自治州</td><td>1981–1986</td><td><code>522301</code> 兴义市</td></tr>
    <tr><td><code>522322</code></td><td>兴仁县</td><td>停用</td><td>贵州省 · 黔西南布依族苗族自治州</td><td>1981–2017</td><td><code>522302</code> 兴仁市</td></tr>
    <tr><td><code>522400</code></td><td>毕节地区</td><td>停用</td><td>贵州省</td><td>1981–2010</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>522401</code></td><td>毕节市</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1993–2010</td><td><code>520502</code> 七星关区</td></tr>
    <tr><td><code>522421</code></td><td>毕节县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–1992</td><td><code>522401</code> 毕节市</td></tr>
    <tr><td><code>522422</code></td><td>大方县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520521</code> 大方县</td></tr>
    <tr><td><code>522423</code></td><td>黔西县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520522</code> 黔西县</td></tr>
    <tr><td><code>522424</code></td><td>金沙县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520523</code> 金沙县</td></tr>
    <tr><td><code>522425</code></td><td>织金县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520524</code> 织金县</td></tr>
    <tr><td><code>522426</code></td><td>纳雍县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520525</code> 纳雍县</td></tr>
    <tr><td><code>522427</code></td><td>威宁彝族回族苗族自治县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520526</code> 威宁彝族回族苗族自治县</td></tr>
    <tr><td><code>522428</code></td><td>赫章县</td><td>停用</td><td>贵州省 · 毕节地区</td><td>1981–2010</td><td><code>520527</code> 赫章县</td></tr>
    <tr><td><code>522500</code></td><td>安顺地区</td><td>停用</td><td>贵州省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>522501</code></td><td>安顺市</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520402</code> 西秀区</td></tr>
    <tr><td><code>522502</code></td><td>清镇市</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1992–1994</td><td><code>520181</code> 清镇市</td></tr>
    <tr><td><code>522521</code></td><td>安顺县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1989</td><td><code>522501</code> 安顺市</td></tr>
    <tr><td><code>522522</code></td><td>开阳县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1994</td><td><code>520121</code> 开阳县</td></tr>
    <tr><td><code>522523</code></td><td>息烽县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1994</td><td><code>520122</code> 息烽县</td></tr>
    <tr><td><code>522524</code></td><td>修文县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1994</td><td><code>520123</code> 修文县</td></tr>
    <tr><td><code>522525</code></td><td>清镇县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1991</td><td><code>522502</code> 清镇市</td></tr>
    <tr><td><code>522526</code></td><td>平坝县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520421</code> 平坝县</td></tr>
    <tr><td><code>522527</code></td><td>普定县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520422</code> 普定县</td></tr>
    <tr><td><code>522528</code></td><td>关岭布依族苗族自治县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520424</code> 关岭布依族苗族自治县</td></tr>
    <tr><td><code>522529</code></td><td>镇宁布依族苗族自治县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520423</code> 镇宁布依族苗族自治县</td></tr>
    <tr><td><code>522530</code></td><td>紫云苗族布依族自治县</td><td>停用</td><td>贵州省 · 安顺地区</td><td>1981–1999</td><td><code>520425</code> 紫云苗族布依族自治县</td></tr>
    <tr><td><code>522621</code></td><td>凯里县</td><td>停用</td><td>贵州省 · 黔东南苗族侗族自治州</td><td>1981–1982</td><td><code>522601</code> 凯里市</td></tr>
    <tr><td><code>522721</code></td><td>都匀县</td><td>停用</td><td>贵州省 · 黔南布依族苗族自治州</td><td>1981–1982</td><td><code>522701</code> 都匀市</td></tr>
    <tr><td><code>522724</code></td><td>福泉县</td><td>停用</td><td>贵州省 · 黔南布依族苗族自治州</td><td>1981–1995</td><td><code>522702</code> 福泉市</td></tr>
    <tr><td><code>530121</code></td><td>呈贡县</td><td>停用</td><td>云南省 · 昆明市</td><td>1981–2010</td><td><code>530114</code> 呈贡区</td></tr>
    <tr><td><code>530122</code></td><td>晋宁县</td><td>停用</td><td>云南省 · 昆明市</td><td>1981–2015</td><td><code>530115</code> 晋宁区</td></tr>
    <tr><td><code>530123</code></td><td>安宁县</td><td>停用</td><td>云南省 · 昆明市</td><td>1981–1994</td><td><code>530181</code> 安宁市</td></tr>
    <tr><td><code>530126</code></td><td>路南彝族自治县</td><td>更名</td><td>云南省 · 昆明市</td><td>1983–1997</td><td>代码未变，现名 石林彝族自治县</td></tr>
    <tr><td><code>530128</code></td><td>禄劝县</td><td>更名</td><td>云南省 · 昆明市</td><td>1983–1984</td><td>代码未变，现名 禄劝彝族苗族自治县</td></tr>
    <tr><td><code>530200</code></td><td>东川市</td><td>停用</td><td>云南省</td><td>1981–1997</td><td><code>530113</code> 东川区</td></tr>
    <tr><td><code>530321</code></td><td>马龙县</td><td>停用</td><td>云南省 · 曲靖市</td><td>1997–2017</td><td><code>530304</code> 马龙区</td></tr>
    <tr><td><code>530327</code></td><td>寻甸回族彝族自治县</td><td>停用</td><td>云南省 · 曲靖市</td><td>1997</td><td><code>530129</code> 寻甸回族彝族自治县</td></tr>
    <tr><td><code>530328</code></td><td>沾益县</td><td>停用</td><td>云南省 · 曲靖市</td><td>1997–2015</td><td><code>530303</code> 沾益区</td></tr>
    <tr><td><code>530421</code></td><td>江川县</td><td>停用</td><td>云南省 · 玉溪市</td><td>1997–2014</td><td><code>530403</code> 江川区</td></tr>
    <tr><td><code>530422</code></td><td>澄江县</td><td>停用</td><td>云南省 · 玉溪市</td><td>1997–2018</td><td><code>530481</code> 澄江市</td></tr>
    <tr><td><code>530522</code></td><td>腾冲县</td><td>停用</td><td>云南省 · 保山市</td><td>2000–2014</td><td><code>530581</code> 腾冲市</td></tr>
    <tr><td><code>530630</code></td><td>水富县</td><td>停用</td><td>云南省 · 昭通市</td><td>2001–2017</td><td><code>530681</code> 水富市</td></tr>
    <tr><td><code>530800</code></td><td>思茅市</td><td>更名</td><td>云南省</td><td>2003–2006</td><td>代码未变，现名 普洱市</td></tr>
    <tr><td><code>530802</code></td><td>翠云区</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 思茅区</td></tr>
    <tr><td><code>530821</code></td><td>普洱哈尼族彝族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 宁洱哈尼族彝族自治县</td></tr>
    <tr><td><code>530822</code></td><td>墨江哈尼族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 墨江哈尼族自治县</td></tr>
    <tr><td><code>530823</code></td><td>景东彝族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 景东彝族自治县</td></tr>
    <tr><td><code>530824</code></td><td>景谷傣族彝族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 景谷傣族彝族自治县</td></tr>
    <tr><td><code>530825</code></td><td>镇沅彝族哈尼族拉祜族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 镇沅彝族哈尼族拉祜族自治县</td></tr>
    <tr><td><code>530826</code></td><td>江城哈尼族彝族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 江城哈尼族彝族自治县</td></tr>
    <tr><td><code>530827</code></td><td>孟连傣族拉祜族佤族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 孟连傣族拉祜族佤族自治县</td></tr>
    <tr><td><code>530828</code></td><td>澜沧拉祜族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 澜沧拉祜族自治县</td></tr>
    <tr><td><code>530829</code></td><td>西盟佤族自治县</td><td>更名</td><td>云南省 · 思茅市</td><td>2003–2006</td><td>代码未变，现名 西盟佤族自治县</td></tr>
    <tr><td><code>532100</code></td><td>昭通地区</td><td>停用</td><td>云南省</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>532101</code></td><td>昭通市</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530602</code> 昭阳区</td></tr>
    <tr><td><code>532121</code></td><td>昭通县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–1982</td><td><code>532101</code> 昭通市</td></tr>
    <tr><td><code>532122</code></td><td>鲁甸县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530621</code> 鲁甸县</td></tr>
    <tr><td><code>532123</code></td><td>巧家县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530622</code> 巧家县</td></tr>
    <tr><td><code>532124</code></td><td>盐津县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530623</code> 盐津县</td></tr>
    <tr><td><code>532125</code></td><td>大关县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530624</code> 大关县</td></tr>
    <tr><td><code>532126</code></td><td>永善县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530625</code> 永善县</td></tr>
    <tr><td><code>532127</code></td><td>绥江县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530626</code> 绥江县</td></tr>
    <tr><td><code>532128</code></td><td>镇雄县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530627</code> 镇雄县</td></tr>
    <tr><td><code>532129</code></td><td>彝良县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530628</code> 彝良县</td></tr>
    <tr><td><code>532130</code></td><td>威信县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530629</code> 威信县</td></tr>
    <tr><td><code>532131</code></td><td>水富县</td><td>停用</td><td>云南省 · 昭通地区</td><td>1981–2000</td><td><code>530630</code> 水富县</td></tr>
    <tr><td><code>532200</code></td><td>曲靖地区</td><td>停用</td><td>云南省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>532201</code></td><td>曲靖市</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1983–1996</td><td><code>530302</code> 麒麟区；<code>530328</code> 沾益县</td></tr>
    <tr><td><code>532202</code></td><td>宣威市</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1994–1996</td><td><code>530381</code> 宣威市</td></tr>
    <tr><td><code>532221</code></td><td>曲靖县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1982</td><td><code>532201</code> 曲靖市</td></tr>
    <tr><td><code>532222</code></td><td>沾益县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1982</td><td><code>532201</code> 曲靖市</td></tr>
    <tr><td><code>532223</code></td><td>马龙县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530321</code> 马龙县</td></tr>
    <tr><td><code>532224</code></td><td>宣威县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1993</td><td><code>532202</code> 宣威市</td></tr>
    <tr><td><code>532225</code></td><td>富源县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530325</code> 富源县</td></tr>
    <tr><td><code>532226</code></td><td>罗平县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530324</code> 罗平县</td></tr>
    <tr><td><code>532227</code></td><td>师宗县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530323</code> 师宗县</td></tr>
    <tr><td><code>532228</code></td><td>陆良县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530322</code> 陆良县</td></tr>
    <tr><td><code>532229</code></td><td>宜良县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1982</td><td><code>530125</code> 宜良县</td></tr>
    <tr><td><code>532230</code></td><td>路南彝族自治县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1982</td><td><code>530126</code> 石林彝族自治县</td></tr>
    <tr><td><code>532231</code></td><td>寻甸回族彝族自治县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530200</code> 东川市；<code>530327</code> 寻甸回族彝族自治县</td></tr>
    <tr><td><code>532232</code></td><td>嵩明县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1982</td><td><code>530127</code> 嵩明县</td></tr>
    <tr><td><code>532233</code></td><td>会泽县</td><td>停用</td><td>云南省 · 曲靖地区</td><td>1981–1996</td><td><code>530326</code> 会泽县</td></tr>
    <tr><td><code>532321</code></td><td>楚雄县</td><td>停用</td><td>云南省 · 楚雄彝族自治州</td><td>1981–1982</td><td><code>532301</code> 楚雄市</td></tr>
    <tr><td><code>532330</code></td><td>禄劝县</td><td>停用</td><td>云南省 · 楚雄彝族自治州</td><td>1981–1982</td><td><code>530128</code> 禄劝彝族苗族自治县</td></tr>
    <tr><td><code>532331</code></td><td>禄丰县</td><td>停用</td><td>云南省 · 楚雄彝族自治州</td><td>1981–2020</td><td><code>532302</code> 禄丰市</td></tr>
    <tr><td><code>532400</code></td><td>玉溪地区</td><td>停用</td><td>云南省</td><td>1981–1996</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>532401</code></td><td>玉溪市</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1983–1996</td><td><code>530402</code> 红塔区</td></tr>
    <tr><td><code>532421</code></td><td>玉溪县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1982</td><td><code>532401</code> 玉溪市</td></tr>
    <tr><td><code>532422</code></td><td>江川县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530421</code> 江川县</td></tr>
    <tr><td><code>532423</code></td><td>澄江县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530422</code> 澄江县</td></tr>
    <tr><td><code>532424</code></td><td>通海县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530423</code> 通海县</td></tr>
    <tr><td><code>532425</code></td><td>华宁县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530424</code> 华宁县</td></tr>
    <tr><td><code>532426</code></td><td>易门县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530425</code> 易门县</td></tr>
    <tr><td><code>532427</code></td><td>峨山彝族自治县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530426</code> 峨山彝族自治县</td></tr>
    <tr><td><code>532428</code></td><td>新平彝族傣族自治县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530427</code> 新平彝族傣族自治县</td></tr>
    <tr><td><code>532429</code></td><td>元江哈尼族彝族傣族自治县</td><td>停用</td><td>云南省 · 玉溪地区</td><td>1981–1996</td><td><code>530428</code> 元江哈尼族彝族傣族自治县</td></tr>
    <tr><td><code>532522</code></td><td>蒙自县</td><td>停用</td><td>云南省 · 红河哈尼族彝族自治州</td><td>1981–2009</td><td><code>532503</code> 蒙自市</td></tr>
    <tr><td><code>532526</code></td><td>弥勒县</td><td>停用</td><td>云南省 · 红河哈尼族彝族自治州</td><td>1981–2012</td><td><code>532504</code> 弥勒市</td></tr>
    <tr><td><code>532530</code></td><td>金平县</td><td>更名</td><td>云南省 · 红河哈尼族彝族自治州</td><td>1981–1984</td><td>代码未变，现名 金平苗族瑶族傣族自治县</td></tr>
    <tr><td><code>532621</code></td><td>文山县</td><td>停用</td><td>云南省 · 文山壮族苗族自治州</td><td>1981–2009</td><td><code>532601</code> 文山市</td></tr>
    <tr><td><code>532700</code></td><td>思茅地区</td><td>停用</td><td>云南省</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>532701</code></td><td>思茅市</td><td>停用</td><td>云南省 · 思茅地区</td><td>1993–2002</td><td><code>530802</code> 思茅区</td></tr>
    <tr><td><code>532721</code></td><td>思茅县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–1992</td><td><code>532701</code> 思茅市</td></tr>
    <tr><td><code>532722</code></td><td>普洱县</td><td>更名</td><td>云南省 · 思茅地区</td><td>1981–1984</td><td>代码未变，现名 普洱县</td></tr>
    <tr><td><code>532722</code></td><td>普洱哈尼族彝族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1985–2002</td><td><code>530821</code> 宁洱哈尼族彝族自治县</td></tr>
    <tr><td><code>532723</code></td><td>墨江哈尼族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–2002</td><td><code>530822</code> 墨江哈尼族自治县</td></tr>
    <tr><td><code>532724</code></td><td>景东县</td><td>更名</td><td>云南省 · 思茅地区</td><td>1981–1984</td><td>代码未变，现名 景东县</td></tr>
    <tr><td><code>532724</code></td><td>景东彝族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1985–2002</td><td><code>530823</code> 景东彝族自治县</td></tr>
    <tr><td><code>532725</code></td><td>景谷县</td><td>更名</td><td>云南省 · 思茅地区</td><td>1981–1984</td><td>代码未变，现名 景谷县</td></tr>
    <tr><td><code>532725</code></td><td>景谷傣族彝族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1985–2002</td><td><code>530824</code> 景谷傣族彝族自治县</td></tr>
    <tr><td><code>532726</code></td><td>镇沅县</td><td>更名</td><td>云南省 · 思茅地区</td><td>1981–1989</td><td>代码未变，现名 镇沅县</td></tr>
    <tr><td><code>532726</code></td><td>镇沅彝族哈尼族拉祜族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1990–2002</td><td><code>530825</code> 镇沅彝族哈尼族拉祜族自治县</td></tr>
    <tr><td><code>532727</code></td><td>江城哈尼族彝族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–2002</td><td><code>530826</code> 江城哈尼族彝族自治县</td></tr>
    <tr><td><code>532728</code></td><td>孟连傣族拉祜族佤族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–2002</td><td><code>530827</code> 孟连傣族拉祜族佤族自治县</td></tr>
    <tr><td><code>532729</code></td><td>澜沧拉祜族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–2002</td><td><code>530828</code> 澜沧拉祜族自治县</td></tr>
    <tr><td><code>532730</code></td><td>西盟佤族自治县</td><td>停用</td><td>云南省 · 思茅地区</td><td>1981–2002</td><td><code>530829</code> 西盟佤族自治县</td></tr>
    <tr><td><code>532821</code></td><td>景洪县</td><td>停用</td><td>云南省 · 西双版纳傣族自治州</td><td>1981–1992</td><td><code>532801</code> 景洪市</td></tr>
    <tr><td><code>532901</code></td><td>下关市</td><td>更名</td><td>云南省 · 大理白族自治州</td><td>1981–1982</td><td>代码未变，现名 大理市</td></tr>
    <tr><td><code>532921</code></td><td>大理县</td><td>停用</td><td>云南省 · 大理白族自治州</td><td>1981–1982</td><td><code>532901</code> 大理市</td></tr>
    <tr><td><code>532922</code></td><td>漾濞县</td><td>更名</td><td>云南省 · 大理白族自治州</td><td>1981–1984</td><td>代码未变，现名 漾濞彝族自治县</td></tr>
    <tr><td><code>533000</code></td><td>保山地区</td><td>停用</td><td>云南省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>533001</code></td><td>保山市</td><td>停用</td><td>云南省 · 保山地区</td><td>1983–1999</td><td><code>530502</code> 隆阳区</td></tr>
    <tr><td><code>533021</code></td><td>保山县</td><td>停用</td><td>云南省 · 保山地区</td><td>1981–1982</td><td><code>533001</code> 保山市</td></tr>
    <tr><td><code>533022</code></td><td>施甸县</td><td>停用</td><td>云南省 · 保山地区</td><td>1981–1999</td><td><code>530521</code> 施甸县</td></tr>
    <tr><td><code>533023</code></td><td>腾冲县</td><td>停用</td><td>云南省 · 保山地区</td><td>1981–1999</td><td><code>530522</code> 腾冲县</td></tr>
    <tr><td><code>533024</code></td><td>龙陵县</td><td>停用</td><td>云南省 · 保山地区</td><td>1981–1999</td><td><code>530523</code> 龙陵县</td></tr>
    <tr><td><code>533025</code></td><td>昌宁县</td><td>停用</td><td>云南省 · 保山地区</td><td>1981–1999</td><td><code>530524</code> 昌宁县</td></tr>
    <tr><td><code>533101</code></td><td>畹町市</td><td>停用</td><td>云南省 · 德宏傣族景颇族自治州</td><td>1985–1998</td><td><code>533102</code> 瑞丽市</td></tr>
    <tr><td><code>533103</code></td><td>潞西市</td><td>更名</td><td>云南省 · 德宏傣族景颇族自治州</td><td>1996–2009</td><td>代码未变，现名 芒市</td></tr>
    <tr><td><code>533121</code></td><td>潞西县</td><td>停用</td><td>云南省 · 德宏傣族景颇族自治州</td><td>1981–1995</td><td><code>533103</code> 芒市</td></tr>
    <tr><td><code>533125</code></td><td>瑞丽县</td><td>停用</td><td>云南省 · 德宏傣族景颇族自治州</td><td>1981–1991</td><td><code>533102</code> 瑞丽市</td></tr>
    <tr><td><code>533126</code></td><td>畹町镇</td><td>停用</td><td>云南省 · 德宏傣族景颇族自治州</td><td>1981–1984</td><td><code>533101</code> 畹町市</td></tr>
    <tr><td><code>533200</code></td><td>丽江地区</td><td>停用</td><td>云南省</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>533221</code></td><td>丽江纳西族自治县</td><td>停用</td><td>云南省 · 丽江地区</td><td>1981–2001</td><td><code>530702</code> 古城区；<code>530721</code> 玉龙纳西族自治县</td></tr>
    <tr><td><code>533222</code></td><td>永胜县</td><td>停用</td><td>云南省 · 丽江地区</td><td>1981–2001</td><td><code>530722</code> 永胜县</td></tr>
    <tr><td><code>533223</code></td><td>华坪县</td><td>停用</td><td>云南省 · 丽江地区</td><td>1981–2001</td><td><code>530723</code> 华坪县</td></tr>
    <tr><td><code>533224</code></td><td>宁蒗彝族自治县</td><td>停用</td><td>云南省 · 丽江地区</td><td>1981–2001</td><td><code>530724</code> 宁蒗彝族自治县</td></tr>
    <tr><td><code>533321</code></td><td>泸水县</td><td>停用</td><td>云南省 · 怒江傈僳族自治州</td><td>1981–2015</td><td><code>533301</code> 泸水市</td></tr>
    <tr><td><code>533322</code></td><td>碧江县</td><td>停用</td><td>云南省 · 怒江傈僳族自治州</td><td>1981–1985</td><td><code>533321</code> 泸水县；<code>533323</code> 福贡县</td></tr>
    <tr><td><code>533325</code></td><td>兰坪县</td><td>更名</td><td>云南省 · 怒江傈僳族自治州</td><td>1981–1986</td><td>代码未变，现名 兰坪白族普米族自治县</td></tr>
    <tr><td><code>533421</code></td><td>中甸县</td><td>更名</td><td>云南省 · 迪庆藏族自治州</td><td>1981–2000</td><td>代码未变，现名 中甸县</td></tr>
    <tr><td><code>533421</code></td><td>香格里拉县</td><td>停用</td><td>云南省 · 迪庆藏族自治州</td><td>2001–2013</td><td><code>533401</code> 香格里拉市</td></tr>
    <tr><td><code>533423</code></td><td>维西县</td><td>更名</td><td>云南省 · 迪庆藏族自治州</td><td>1981–1984</td><td>代码未变，现名 维西傈僳族自治县</td></tr>
    <tr><td><code>533500</code></td><td>临沧地区</td><td>停用</td><td>云南省</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>533521</code></td><td>临沧县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530902</code> 临翔区</td></tr>
    <tr><td><code>533522</code></td><td>凤庆县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530921</code> 凤庆县</td></tr>
    <tr><td><code>533523</code></td><td>云县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530922</code> 云县</td></tr>
    <tr><td><code>533524</code></td><td>永德县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530923</code> 永德县</td></tr>
    <tr><td><code>533525</code></td><td>镇康县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530924</code> 镇康县</td></tr>
    <tr><td><code>533526</code></td><td>双江县</td><td>更名</td><td>云南省 · 临沧地区</td><td>1981–1984</td><td>代码未变，现名 双江县</td></tr>
    <tr><td><code>533526</code></td><td>双江拉祜族佤族布朗族傣族自治县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1985–2002</td><td><code>530925</code> 双江拉祜族佤族布朗族傣族自治县</td></tr>
    <tr><td><code>533527</code></td><td>耿马傣族佤族自治县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530926</code> 耿马傣族佤族自治县</td></tr>
    <tr><td><code>533528</code></td><td>沧源佤族自治县</td><td>停用</td><td>云南省 · 临沧地区</td><td>1981–2002</td><td><code>530927</code> 沧源佤族自治县</td></tr>
    <tr><td><code>540125</code></td><td>堆龙德庆县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–2014</td><td><code>540103</code> 堆龙德庆区</td></tr>
    <tr><td><code>540126</code></td><td>达孜县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–2016</td><td><code>540104</code> 达孜区</td></tr>
    <tr><td><code>540128</code></td><td>工布江达县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–1982</td><td><code>542622</code> 工布江达县</td></tr>
    <tr><td><code>540129</code></td><td>林芝县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–1982</td><td><code>542621</code> 林芝县</td></tr>
    <tr><td><code>540130</code></td><td>米林县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–1982</td><td><code>542623</code> 米林县</td></tr>
    <tr><td><code>540131</code></td><td>墨脱县</td><td>停用</td><td>西藏自治区 · 拉萨市</td><td>1981–1982</td><td><code>542624</code> 墨脱县</td></tr>
    <tr><td><code>540422</code></td><td>米林县</td><td>停用</td><td>西藏自治区 · 林芝市</td><td>2015–2022</td><td><code>540481</code> 米林市</td></tr>
    <tr><td><code>540530</code></td><td>错那县</td><td>停用</td><td>西藏自治区 · 山南市</td><td>2016–2022</td><td><code>540581</code> 错那市</td></tr>
    <tr><td><code>542100</code></td><td>昌都地区</td><td>停用</td><td>西藏自治区</td><td>1981–2013</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542121</code></td><td>昌都县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542136</code> 妥坝县；<code>542137</code> 生达县；<code>540302</code> 卡若区</td></tr>
    <tr><td><code>542122</code></td><td>江达县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542136</code> 妥坝县；<code>542137</code> 生达县；<code>540321</code> 江达县</td></tr>
    <tr><td><code>542123</code></td><td>贡觉县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>540322</code> 贡觉县</td></tr>
    <tr><td><code>542124</code></td><td>类乌齐县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>540323</code> 类乌齐县</td></tr>
    <tr><td><code>542125</code></td><td>丁青县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>540324</code> 丁青县</td></tr>
    <tr><td><code>542126</code></td><td>察雅县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542136</code> 妥坝县；<code>540325</code> 察雅县</td></tr>
    <tr><td><code>542127</code></td><td>八宿县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542625</code> 波密县；<code>540326</code> 八宿县</td></tr>
    <tr><td><code>542128</code></td><td>左贡县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542135</code> 碧土县；<code>540327</code> 左贡县</td></tr>
    <tr><td><code>542129</code></td><td>芒康县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>542134</code> 盐井县；<code>540328</code> 芒康县</td></tr>
    <tr><td><code>542130</code></td><td>波密县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–1982</td><td><code>542625</code> 波密县</td></tr>
    <tr><td><code>542131</code></td><td>察隅县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–1982</td><td><code>542135</code> 碧土县；<code>542626</code> 察隅县</td></tr>
    <tr><td><code>542132</code></td><td>洛隆县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>540329</code> 洛隆县</td></tr>
    <tr><td><code>542133</code></td><td>边坝县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1981–2013</td><td><code>540330</code> 边坝县</td></tr>
    <tr><td><code>542134</code></td><td>盐井县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1983–1998</td><td><code>542129</code> 芒康县</td></tr>
    <tr><td><code>542135</code></td><td>碧土县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1983–1998</td><td><code>542128</code> 左贡县；<code>542626</code> 察隅县</td></tr>
    <tr><td><code>542136</code></td><td>妥坝县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1983–1998</td><td><code>542121</code> 昌都县；<code>542122</code> 江达县；<code>542126</code> 察雅县</td></tr>
    <tr><td><code>542137</code></td><td>生达县</td><td>停用</td><td>西藏自治区 · 昌都地区</td><td>1983–1998</td><td><code>542121</code> 昌都县；<code>542122</code> 江达县</td></tr>
    <tr><td><code>542200</code></td><td>山南地区</td><td>停用</td><td>西藏自治区</td><td>1981–2015</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542221</code></td><td>乃东县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540502</code> 乃东区</td></tr>
    <tr><td><code>542222</code></td><td>扎囊县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540521</code> 扎囊县</td></tr>
    <tr><td><code>542223</code></td><td>贡嘎县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540522</code> 贡嘎县</td></tr>
    <tr><td><code>542224</code></td><td>桑日县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540523</code> 桑日县</td></tr>
    <tr><td><code>542225</code></td><td>穷结县</td><td>更名</td><td>西藏自治区 · 山南地区</td><td>1981–1985</td><td>代码未变，现名 穷结县</td></tr>
    <tr><td><code>542225</code></td><td>琼结县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1986–2015</td><td><code>540524</code> 琼结县</td></tr>
    <tr><td><code>542226</code></td><td>曲松县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540525</code> 曲松县</td></tr>
    <tr><td><code>542227</code></td><td>措美县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540526</code> 措美县</td></tr>
    <tr><td><code>542228</code></td><td>洛扎县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540527</code> 洛扎县</td></tr>
    <tr><td><code>542229</code></td><td>加查县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540528</code> 加查县</td></tr>
    <tr><td><code>542230</code></td><td>朗县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–1982</td><td><code>542627</code> 朗县</td></tr>
    <tr><td><code>542231</code></td><td>隆子县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540529</code> 隆子县</td></tr>
    <tr><td><code>542232</code></td><td>错那县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1981–2015</td><td><code>540530</code> 错那县</td></tr>
    <tr><td><code>542233</code></td><td>浪卡子县</td><td>更名</td><td>西藏自治区 · 山南地区</td><td>1981–1982</td><td>代码未变，现名 浪卡子县</td></tr>
    <tr><td><code>542233</code></td><td>浪卡子县</td><td>停用</td><td>西藏自治区 · 山南地区</td><td>1986–2015</td><td><code>540531</code> 浪卡子县</td></tr>
    <tr><td><code>542300</code></td><td>日喀则地区</td><td>停用</td><td>西藏自治区</td><td>1981–2013</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542301</code></td><td>日喀则市</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540202</code> 桑珠孜区</td></tr>
    <tr><td><code>542321</code></td><td>日喀则县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–1985</td><td><code>542301</code> 日喀则市</td></tr>
    <tr><td><code>542322</code></td><td>南木林县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540221</code> 南木林县</td></tr>
    <tr><td><code>542323</code></td><td>江孜县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 江孜县</td></tr>
    <tr><td><code>542323</code></td><td>江孜县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540222</code> 江孜县</td></tr>
    <tr><td><code>542324</code></td><td>定日县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540223</code> 定日县</td></tr>
    <tr><td><code>542325</code></td><td>萨迦县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540224</code> 萨迦县</td></tr>
    <tr><td><code>542326</code></td><td>拉孜县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540225</code> 拉孜县</td></tr>
    <tr><td><code>542327</code></td><td>昂仁县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540226</code> 昂仁县</td></tr>
    <tr><td><code>542328</code></td><td>谢通门县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540227</code> 谢通门县</td></tr>
    <tr><td><code>542329</code></td><td>白朗县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 白朗县</td></tr>
    <tr><td><code>542329</code></td><td>白朗县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540228</code> 白朗县</td></tr>
    <tr><td><code>542330</code></td><td>仁布县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 仁布县</td></tr>
    <tr><td><code>542330</code></td><td>仁布县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540229</code> 仁布县</td></tr>
    <tr><td><code>542331</code></td><td>康马县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 康马县</td></tr>
    <tr><td><code>542331</code></td><td>康马县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540230</code> 康马县</td></tr>
    <tr><td><code>542332</code></td><td>定结县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540231</code> 定结县</td></tr>
    <tr><td><code>542333</code></td><td>仲巴县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>542528</code> 隆格尔县；<code>540232</code> 仲巴县</td></tr>
    <tr><td><code>542334</code></td><td>亚东县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 亚东县</td></tr>
    <tr><td><code>542334</code></td><td>亚东县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540233</code> 亚东县</td></tr>
    <tr><td><code>542335</code></td><td>吉隆县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>542336</code> 聂拉木县；<code>540234</code> 吉隆县</td></tr>
    <tr><td><code>542336</code></td><td>聂拉木县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540235</code> 聂拉木县</td></tr>
    <tr><td><code>542337</code></td><td>萨嘎县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1981–2013</td><td><code>540236</code> 萨嘎县</td></tr>
    <tr><td><code>542338</code></td><td>岗巴县</td><td>更名</td><td>西藏自治区 · 日喀则地区</td><td>1981–1982</td><td>代码未变，现名 岗巴县</td></tr>
    <tr><td><code>542338</code></td><td>岗巴县</td><td>停用</td><td>西藏自治区 · 日喀则地区</td><td>1986–2013</td><td><code>540237</code> 岗巴县</td></tr>
    <tr><td><code>542400</code></td><td>那曲地区</td><td>停用</td><td>西藏自治区</td><td>1981–2016</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542421</code></td><td>那曲县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540602</code> 色尼区</td></tr>
    <tr><td><code>542422</code></td><td>嘉黎县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540621</code> 嘉黎县</td></tr>
    <tr><td><code>542423</code></td><td>比如县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540622</code> 比如县</td></tr>
    <tr><td><code>542424</code></td><td>聂荣县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540623</code> 聂荣县</td></tr>
    <tr><td><code>542425</code></td><td>安多县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540624</code> 安多县</td></tr>
    <tr><td><code>542426</code></td><td>申扎县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>542430</code> 尼玛县；<code>540625</code> 申扎县</td></tr>
    <tr><td><code>542427</code></td><td>索县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540626</code> 索县</td></tr>
    <tr><td><code>542428</code></td><td>班戈县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>542430</code> 尼玛县；<code>542426</code> 申扎县；<code>540627</code> 班戈县</td></tr>
    <tr><td><code>542429</code></td><td>巴青县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1981–2016</td><td><code>540628</code> 巴青县</td></tr>
    <tr><td><code>542430</code></td><td>尼玛县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>1983–2016</td><td><code>542431</code> 双湖县；<code>540629</code> 尼玛县</td></tr>
    <tr><td><code>542431</code></td><td>双湖县</td><td>停用</td><td>西藏自治区 · 那曲地区</td><td>2012–2016</td><td><code>540630</code> 双湖县</td></tr>
    <tr><td><code>542528</code></td><td>隆格尔县</td><td>停用</td><td>西藏自治区 · 阿里地区</td><td>1983–1998</td><td><code>542333</code> 仲巴县</td></tr>
    <tr><td><code>542600</code></td><td>林芝地区</td><td>停用</td><td>西藏自治区</td><td>1983–2014</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542621</code></td><td>林芝县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540402</code> 巴宜区</td></tr>
    <tr><td><code>542622</code></td><td>工布江达县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540421</code> 工布江达县</td></tr>
    <tr><td><code>542623</code></td><td>米林县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540422</code> 米林县</td></tr>
    <tr><td><code>542624</code></td><td>墨脱县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540423</code> 墨脱县</td></tr>
    <tr><td><code>542625</code></td><td>波密县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540424</code> 波密县</td></tr>
    <tr><td><code>542626</code></td><td>察隅县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540425</code> 察隅县</td></tr>
    <tr><td><code>542627</code></td><td>朗县</td><td>停用</td><td>西藏自治区 · 林芝地区</td><td>1983–2014</td><td><code>540426</code> 朗县</td></tr>
    <tr><td><code>542700</code></td><td>江孜地区</td><td>停用</td><td>西藏自治区</td><td>1983–1985</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>542721</code></td><td>江孜县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542323</code> 江孜县</td></tr>
    <tr><td><code>542722</code></td><td>浪卡子县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542233</code> 浪卡子县</td></tr>
    <tr><td><code>542723</code></td><td>白朗县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542329</code> 白朗县</td></tr>
    <tr><td><code>542724</code></td><td>仁布县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542330</code> 仁布县</td></tr>
    <tr><td><code>542725</code></td><td>康马县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542331</code> 康马县</td></tr>
    <tr><td><code>542726</code></td><td>亚东县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542334</code> 亚东县</td></tr>
    <tr><td><code>542727</code></td><td>岗巴县</td><td>停用</td><td>西藏自治区 · 江孜地区</td><td>1983–1985</td><td><code>542338</code> 岗巴县</td></tr>
    <tr><td><code>610121</code></td><td>长安县</td><td>停用</td><td>陕西省 · 西安市</td><td>1981–2001</td><td><code>610116</code> 长安区</td></tr>
    <tr><td><code>610123</code></td><td>临潼县</td><td>停用</td><td>陕西省 · 西安市</td><td>1983–1996</td><td><code>610115</code> 临潼区</td></tr>
    <tr><td><code>610125</code></td><td>户县</td><td>停用</td><td>陕西省 · 西安市</td><td>1983–2015</td><td><code>610118</code> 鄠邑区</td></tr>
    <tr><td><code>610126</code></td><td>高陵县</td><td>停用</td><td>陕西省 · 西安市</td><td>1983–2013</td><td><code>610117</code> 高陵区</td></tr>
    <tr><td><code>610202</code></td><td>城区</td><td>更名</td><td>陕西省 · 铜川市</td><td>1983–1999</td><td>代码未变，现名 王益区</td></tr>
    <tr><td><code>610203</code></td><td>郊区</td><td>更名</td><td>陕西省 · 铜川市</td><td>1983–1999</td><td>代码未变，现名 印台区</td></tr>
    <tr><td><code>610221</code></td><td>耀县</td><td>停用</td><td>陕西省 · 铜川市</td><td>1981–2001</td><td><code>610204</code> 耀州区</td></tr>
    <tr><td><code>610321</code></td><td>宝鸡县</td><td>停用</td><td>陕西省 · 宝鸡市</td><td>1981–2002</td><td><code>610302</code> 渭滨区；<code>610303</code> 金台区；<code>610304</code> 陈仓区</td></tr>
    <tr><td><code>610322</code></td><td>凤翔县</td><td>停用</td><td>陕西省 · 宝鸡市</td><td>1981–2020</td><td><code>610305</code> 凤翔区</td></tr>
    <tr><td><code>610325</code></td><td>武功县</td><td>停用</td><td>陕西省 · 宝鸡市</td><td>1981–1982</td><td><code>610300</code> 宝鸡市；<code>610431</code> 武功县</td></tr>
    <tr><td><code>610421</code></td><td>兴平县</td><td>停用</td><td>陕西省 · 咸阳市</td><td>1983–1992</td><td><code>610481</code> 兴平市</td></tr>
    <tr><td><code>610427</code></td><td>彬县</td><td>停用</td><td>陕西省 · 咸阳市</td><td>1983–2017</td><td><code>610482</code> 彬州市</td></tr>
    <tr><td><code>610521</code></td><td>华县</td><td>停用</td><td>陕西省 · 渭南市</td><td>1994–2014</td><td><code>610503</code> 华州区</td></tr>
    <tr><td><code>610623</code></td><td>子长县</td><td>停用</td><td>陕西省 · 延安市</td><td>1996–2018</td><td><code>610681</code> 子长市</td></tr>
    <tr><td><code>610624</code></td><td>安塞县</td><td>停用</td><td>陕西省 · 延安市</td><td>1996–2015</td><td><code>610603</code> 安塞区</td></tr>
    <tr><td><code>610626</code></td><td>吴旗县</td><td>更名</td><td>陕西省 · 延安市</td><td>1996–2004</td><td>代码未变，现名 吴起县</td></tr>
    <tr><td><code>610721</code></td><td>南郑县</td><td>停用</td><td>陕西省 · 汉中市</td><td>1996–2016</td><td><code>610703</code> 南郑区</td></tr>
    <tr><td><code>610821</code></td><td>神木县</td><td>停用</td><td>陕西省 · 榆林市</td><td>1999–2016</td><td><code>610881</code> 神木市</td></tr>
    <tr><td><code>610823</code></td><td>横山县</td><td>停用</td><td>陕西省 · 榆林市</td><td>1999–2014</td><td><code>610803</code> 横山区</td></tr>
    <tr><td><code>610928</code></td><td>旬阳县</td><td>停用</td><td>陕西省 · 安康市</td><td>2000–2020</td><td><code>610981</code> 旬阳市</td></tr>
    <tr><td><code>612100</code></td><td>渭南地区</td><td>停用</td><td>陕西省</td><td>1981–1993</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612101</code></td><td>渭南市</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1983–1993</td><td><code>610502</code> 临渭区</td></tr>
    <tr><td><code>612102</code></td><td>韩城市</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1983–1993</td><td><code>610581</code> 韩城市</td></tr>
    <tr><td><code>612103</code></td><td>华阴市</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1990–1993</td><td><code>610582</code> 华阴市</td></tr>
    <tr><td><code>612121</code></td><td>蓝田县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1982</td><td><code>610122</code> 蓝田县</td></tr>
    <tr><td><code>612122</code></td><td>临潼县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1982</td><td><code>610123</code> 临潼县</td></tr>
    <tr><td><code>612123</code></td><td>渭南县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1982</td><td><code>612101</code> 渭南市</td></tr>
    <tr><td><code>612124</code></td><td>华县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610521</code> 华县</td></tr>
    <tr><td><code>612125</code></td><td>华阴县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1989</td><td><code>612103</code> 华阴市</td></tr>
    <tr><td><code>612126</code></td><td>潼关县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610522</code> 潼关县</td></tr>
    <tr><td><code>612127</code></td><td>大荔县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610523</code> 大荔县</td></tr>
    <tr><td><code>612128</code></td><td>蒲城县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610526</code> 蒲城县</td></tr>
    <tr><td><code>612129</code></td><td>澄城县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610525</code> 澄城县</td></tr>
    <tr><td><code>612130</code></td><td>白水县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610527</code> 白水县</td></tr>
    <tr><td><code>612131</code></td><td>韩城县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1982</td><td><code>612102</code> 韩城市</td></tr>
    <tr><td><code>612132</code></td><td>合阳县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610524</code> 合阳县</td></tr>
    <tr><td><code>612133</code></td><td>富平县</td><td>停用</td><td>陕西省 · 渭南地区</td><td>1981–1993</td><td><code>610528</code> 富平县</td></tr>
    <tr><td><code>612200</code></td><td>咸阳地区</td><td>停用</td><td>陕西省</td><td>1981–1982</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612201</code></td><td>咸阳市</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610402</code> 秦都区</td></tr>
    <tr><td><code>612221</code></td><td>兴平县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610421</code> 兴平县</td></tr>
    <tr><td><code>612222</code></td><td>周至县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610124</code> 周至县</td></tr>
    <tr><td><code>612223</code></td><td>户县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610125</code> 户县</td></tr>
    <tr><td><code>612224</code></td><td>三原县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610422</code> 三原县</td></tr>
    <tr><td><code>612225</code></td><td>泾阳县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610423</code> 泾阳县</td></tr>
    <tr><td><code>612226</code></td><td>高陵县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610126</code> 高陵县</td></tr>
    <tr><td><code>612227</code></td><td>乾县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610424</code> 乾县</td></tr>
    <tr><td><code>612228</code></td><td>礼泉县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610425</code> 礼泉县</td></tr>
    <tr><td><code>612229</code></td><td>永寿县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610426</code> 永寿县</td></tr>
    <tr><td><code>612230</code></td><td>彬县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610427</code> 彬县</td></tr>
    <tr><td><code>612231</code></td><td>长武县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610428</code> 长武县</td></tr>
    <tr><td><code>612232</code></td><td>旬邑县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610429</code> 旬邑县</td></tr>
    <tr><td><code>612233</code></td><td>淳化县</td><td>停用</td><td>陕西省 · 咸阳地区</td><td>1981–1982</td><td><code>610430</code> 淳化县</td></tr>
    <tr><td><code>612300</code></td><td>汉中地区</td><td>停用</td><td>陕西省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612301</code></td><td>汉中市</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610702</code> 汉台区</td></tr>
    <tr><td><code>612321</code></td><td>南郑县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610721</code> 南郑县</td></tr>
    <tr><td><code>612322</code></td><td>城固县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610722</code> 城固县</td></tr>
    <tr><td><code>612323</code></td><td>洋县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610723</code> 洋县</td></tr>
    <tr><td><code>612324</code></td><td>西乡县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610724</code> 西乡县</td></tr>
    <tr><td><code>612325</code></td><td>勉县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610725</code> 勉县</td></tr>
    <tr><td><code>612326</code></td><td>宁强县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610726</code> 宁强县</td></tr>
    <tr><td><code>612327</code></td><td>略阳县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610727</code> 略阳县</td></tr>
    <tr><td><code>612328</code></td><td>镇巴县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610728</code> 镇巴县</td></tr>
    <tr><td><code>612329</code></td><td>留坝县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610729</code> 留坝县</td></tr>
    <tr><td><code>612330</code></td><td>佛坪县</td><td>停用</td><td>陕西省 · 汉中地区</td><td>1981–1995</td><td><code>610730</code> 佛坪县</td></tr>
    <tr><td><code>612400</code></td><td>安康地区</td><td>停用</td><td>陕西省</td><td>1981–1999</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612401</code></td><td>安康市</td><td>停用</td><td>陕西省 · 安康地区</td><td>1988–1999</td><td><code>610902</code> 汉滨区</td></tr>
    <tr><td><code>612421</code></td><td>安康县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1987</td><td><code>612401</code> 安康市</td></tr>
    <tr><td><code>612422</code></td><td>汉阴县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610921</code> 汉阴县</td></tr>
    <tr><td><code>612423</code></td><td>石泉县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610922</code> 石泉县</td></tr>
    <tr><td><code>612424</code></td><td>宁陕县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610923</code> 宁陕县</td></tr>
    <tr><td><code>612425</code></td><td>紫阳县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610924</code> 紫阳县</td></tr>
    <tr><td><code>612426</code></td><td>岚皋县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610925</code> 岚皋县</td></tr>
    <tr><td><code>612427</code></td><td>平利县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610926</code> 平利县</td></tr>
    <tr><td><code>612428</code></td><td>镇坪县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610927</code> 镇坪县</td></tr>
    <tr><td><code>612429</code></td><td>旬阳县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610928</code> 旬阳县</td></tr>
    <tr><td><code>612430</code></td><td>白河县</td><td>停用</td><td>陕西省 · 安康地区</td><td>1981–1999</td><td><code>610929</code> 白河县</td></tr>
    <tr><td><code>612500</code></td><td>商洛地区</td><td>停用</td><td>陕西省</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612501</code></td><td>商州市</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1988–2000</td><td><code>611002</code> 商州区</td></tr>
    <tr><td><code>612521</code></td><td>商县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–1987</td><td><code>612501</code> 商州市</td></tr>
    <tr><td><code>612522</code></td><td>洛南县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611021</code> 洛南县</td></tr>
    <tr><td><code>612523</code></td><td>丹凤县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611022</code> 丹凤县</td></tr>
    <tr><td><code>612524</code></td><td>商南县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611023</code> 商南县</td></tr>
    <tr><td><code>612525</code></td><td>山阳县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611024</code> 山阳县</td></tr>
    <tr><td><code>612526</code></td><td>镇安县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611025</code> 镇安县</td></tr>
    <tr><td><code>612527</code></td><td>柞水县</td><td>停用</td><td>陕西省 · 商洛地区</td><td>1981–2000</td><td><code>611026</code> 柞水县</td></tr>
    <tr><td><code>612600</code></td><td>延安地区</td><td>停用</td><td>陕西省</td><td>1981–1995</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612601</code></td><td>延安市</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610602</code> 宝塔区</td></tr>
    <tr><td><code>612621</code></td><td>延长县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610621</code> 延长县</td></tr>
    <tr><td><code>612622</code></td><td>延川县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610622</code> 延川县</td></tr>
    <tr><td><code>612623</code></td><td>子长县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610623</code> 子长县</td></tr>
    <tr><td><code>612624</code></td><td>安塞县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610624</code> 安塞县</td></tr>
    <tr><td><code>612625</code></td><td>志丹县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610625</code> 志丹县</td></tr>
    <tr><td><code>612626</code></td><td>吴旗县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610626</code> 吴起县</td></tr>
    <tr><td><code>612627</code></td><td>甘泉县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610627</code> 甘泉县</td></tr>
    <tr><td><code>612628</code></td><td>富县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610628</code> 富县</td></tr>
    <tr><td><code>612629</code></td><td>洛川县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610629</code> 洛川县</td></tr>
    <tr><td><code>612630</code></td><td>宜川县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610630</code> 宜川县</td></tr>
    <tr><td><code>612631</code></td><td>黄龙县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610631</code> 黄龙县</td></tr>
    <tr><td><code>612632</code></td><td>黄陵县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1995</td><td><code>610632</code> 黄陵县</td></tr>
    <tr><td><code>612633</code></td><td>宜君县</td><td>停用</td><td>陕西省 · 延安地区</td><td>1981–1982</td><td><code>610222</code> 宜君县</td></tr>
    <tr><td><code>612700</code></td><td>榆林地区</td><td>停用</td><td>陕西省</td><td>1981–1998</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>612701</code></td><td>榆林市</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1988–1998</td><td><code>610802</code> 榆阳区</td></tr>
    <tr><td><code>612721</code></td><td>榆林县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1987</td><td><code>612701</code> 榆林市</td></tr>
    <tr><td><code>612722</code></td><td>神木县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610821</code> 神木县</td></tr>
    <tr><td><code>612723</code></td><td>府谷县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610822</code> 府谷县</td></tr>
    <tr><td><code>612724</code></td><td>横山县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610823</code> 横山县</td></tr>
    <tr><td><code>612725</code></td><td>靖边县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610824</code> 靖边县</td></tr>
    <tr><td><code>612726</code></td><td>定边县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610825</code> 定边县</td></tr>
    <tr><td><code>612727</code></td><td>绥德县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610826</code> 绥德县</td></tr>
    <tr><td><code>612728</code></td><td>米脂县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610827</code> 米脂县</td></tr>
    <tr><td><code>612729</code></td><td>佳县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610828</code> 佳县</td></tr>
    <tr><td><code>612730</code></td><td>吴堡县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610829</code> 吴堡县</td></tr>
    <tr><td><code>612731</code></td><td>清涧县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610830</code> 清涧县</td></tr>
    <tr><td><code>612732</code></td><td>子洲县</td><td>停用</td><td>陕西省 · 榆林地区</td><td>1981–1998</td><td><code>610831</code> 子洲县</td></tr>
    <tr><td><code>620112</code></td><td>白银区</td><td>停用</td><td>甘肃省 · 兰州市</td><td>1983–1984</td><td><code>620402</code> 白银区</td></tr>
    <tr><td><code>620502</code></td><td>秦城区</td><td>更名</td><td>甘肃省 · 天水市</td><td>1985–2003</td><td>代码未变，现名 秦州区</td></tr>
    <tr><td><code>620503</code></td><td>北道区</td><td>更名</td><td>甘肃省 · 天水市</td><td>1985–2003</td><td>代码未变，现名 麦积区</td></tr>
    <tr><td><code>620824</code></td><td>华亭县</td><td>停用</td><td>甘肃省 · 平凉市</td><td>2002–2017</td><td><code>620881</code> 华亭市</td></tr>
    <tr><td><code>620925</code></td><td>安西县</td><td>停用</td><td>甘肃省 · 酒泉市</td><td>2002–2005</td><td><code>620922</code> 瓜州县</td></tr>
    <tr><td><code>622100</code></td><td>酒泉地区</td><td>停用</td><td>甘肃省</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622101</code></td><td>玉门市</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–2001</td><td><code>620981</code> 玉门市</td></tr>
    <tr><td><code>622102</code></td><td>酒泉市</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1985–2001</td><td><code>620902</code> 肃州区</td></tr>
    <tr><td><code>622103</code></td><td>敦煌市</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1987–2001</td><td><code>620982</code> 敦煌市</td></tr>
    <tr><td><code>622121</code></td><td>酒泉县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–1984</td><td><code>622102</code> 酒泉市</td></tr>
    <tr><td><code>622122</code></td><td>敦煌县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–1986</td><td><code>622103</code> 敦煌市</td></tr>
    <tr><td><code>622123</code></td><td>金塔县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–2001</td><td><code>620921</code> 金塔县</td></tr>
    <tr><td><code>622124</code></td><td>肃北蒙古族自治县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–2001</td><td><code>620923</code> 肃北蒙古族自治县</td></tr>
    <tr><td><code>622125</code></td><td>阿克塞哈萨克族自治县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–2001</td><td><code>620924</code> 阿克塞哈萨克族自治县</td></tr>
    <tr><td><code>622126</code></td><td>安西县</td><td>停用</td><td>甘肃省 · 酒泉地区</td><td>1981–2001</td><td><code>620925</code> 安西县</td></tr>
    <tr><td><code>622200</code></td><td>张掖地区</td><td>停用</td><td>甘肃省</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622201</code></td><td>张掖市</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1985–2001</td><td><code>620702</code> 甘州区</td></tr>
    <tr><td><code>622221</code></td><td>张掖县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–1984</td><td><code>622201</code> 张掖市</td></tr>
    <tr><td><code>622222</code></td><td>肃南裕固族自治县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–2001</td><td><code>620721</code> 肃南裕固族自治县</td></tr>
    <tr><td><code>622223</code></td><td>民乐县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–2001</td><td><code>620722</code> 民乐县</td></tr>
    <tr><td><code>622224</code></td><td>临泽县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–2001</td><td><code>620723</code> 临泽县</td></tr>
    <tr><td><code>622225</code></td><td>高台县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–2001</td><td><code>620724</code> 高台县</td></tr>
    <tr><td><code>622226</code></td><td>山丹县</td><td>停用</td><td>甘肃省 · 张掖地区</td><td>1981–2001</td><td><code>620725</code> 山丹县</td></tr>
    <tr><td><code>622300</code></td><td>武威地区</td><td>停用</td><td>甘肃省</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622301</code></td><td>武威市</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1985–2000</td><td><code>620602</code> 凉州区</td></tr>
    <tr><td><code>622321</code></td><td>武威县</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1981–1984</td><td><code>622301</code> 武威市</td></tr>
    <tr><td><code>622322</code></td><td>民勤县</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1981–2000</td><td><code>620621</code> 民勤县</td></tr>
    <tr><td><code>622323</code></td><td>古浪县</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1981–2000</td><td><code>620622</code> 古浪县</td></tr>
    <tr><td><code>622324</code></td><td>景泰县</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1981–1984</td><td><code>620423</code> 景泰县</td></tr>
    <tr><td><code>622326</code></td><td>天祝藏族自治县</td><td>停用</td><td>甘肃省 · 武威地区</td><td>1981–2000</td><td><code>620623</code> 天祝藏族自治县</td></tr>
    <tr><td><code>622400</code></td><td>定西地区</td><td>停用</td><td>甘肃省</td><td>1981–2002</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622421</code></td><td>定西县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–2002</td><td><code>621102</code> 安定区</td></tr>
    <tr><td><code>622422</code></td><td>靖远县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–1984</td><td><code>620403</code> 平川区；<code>620421</code> 靖远县</td></tr>
    <tr><td><code>622423</code></td><td>会宁县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–1984</td><td><code>620422</code> 会宁县</td></tr>
    <tr><td><code>622424</code></td><td>通渭县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–2002</td><td><code>621121</code> 通渭县</td></tr>
    <tr><td><code>622425</code></td><td>陇西县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–2002</td><td><code>621122</code> 陇西县</td></tr>
    <tr><td><code>622426</code></td><td>渭源县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–2002</td><td><code>621123</code> 渭源县</td></tr>
    <tr><td><code>622427</code></td><td>临洮县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1981–2002</td><td><code>621124</code> 临洮县</td></tr>
    <tr><td><code>622428</code></td><td>漳县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1985–2002</td><td><code>621125</code> 漳县</td></tr>
    <tr><td><code>622429</code></td><td>岷县</td><td>停用</td><td>甘肃省 · 定西地区</td><td>1985–2002</td><td><code>621126</code> 岷县</td></tr>
    <tr><td><code>622500</code></td><td>天水地区</td><td>停用</td><td>甘肃省</td><td>1981–1984</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622501</code></td><td>天水市</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620502</code> 秦州区</td></tr>
    <tr><td><code>622521</code></td><td>张家川回族自治县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620525</code> 张家川回族自治县</td></tr>
    <tr><td><code>622522</code></td><td>天水县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620502</code> 秦州区；<code>620503</code> 麦积区</td></tr>
    <tr><td><code>622523</code></td><td>清水县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620521</code> 清水县</td></tr>
    <tr><td><code>622524</code></td><td>徽县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>622630</code> 徽县</td></tr>
    <tr><td><code>622525</code></td><td>两当县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>622629</code> 两当县</td></tr>
    <tr><td><code>622526</code></td><td>礼县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>622628</code> 礼县</td></tr>
    <tr><td><code>622527</code></td><td>西和县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>622627</code> 西和县</td></tr>
    <tr><td><code>622528</code></td><td>武山县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620524</code> 武山县</td></tr>
    <tr><td><code>622529</code></td><td>甘谷县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620523</code> 甘谷县</td></tr>
    <tr><td><code>622530</code></td><td>秦安县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>620522</code> 秦安县</td></tr>
    <tr><td><code>622531</code></td><td>漳县</td><td>停用</td><td>甘肃省 · 天水地区</td><td>1981–1984</td><td><code>622428</code> 漳县</td></tr>
    <tr><td><code>622600</code></td><td>武都地区</td><td>更名</td><td>甘肃省</td><td>1981–1984</td><td>代码未变，现名 武都地区</td></tr>
    <tr><td><code>622600</code></td><td>陇南地区</td><td>停用</td><td>甘肃省</td><td>1985–2003</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622621</code></td><td>武都县</td><td>更名</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td>代码未变，现名 武都县</td></tr>
    <tr><td><code>622621</code></td><td>武都县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621202</code> 武都区</td></tr>
    <tr><td><code>622622</code></td><td>岷县</td><td>停用</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td><code>622429</code> 岷县</td></tr>
    <tr><td><code>622623</code></td><td>宕昌县</td><td>更名</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td>代码未变，现名 宕昌县</td></tr>
    <tr><td><code>622623</code></td><td>宕昌县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621223</code> 宕昌县</td></tr>
    <tr><td><code>622624</code></td><td>成县</td><td>更名</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td>代码未变，现名 成县</td></tr>
    <tr><td><code>622624</code></td><td>成县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621221</code> 成县</td></tr>
    <tr><td><code>622625</code></td><td>康县</td><td>更名</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td>代码未变，现名 康县</td></tr>
    <tr><td><code>622625</code></td><td>康县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621224</code> 康县</td></tr>
    <tr><td><code>622626</code></td><td>文县</td><td>更名</td><td>甘肃省 · 武都地区</td><td>1981–1984</td><td>代码未变，现名 文县</td></tr>
    <tr><td><code>622626</code></td><td>文县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621222</code> 文县</td></tr>
    <tr><td><code>622627</code></td><td>西和县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621225</code> 西和县</td></tr>
    <tr><td><code>622628</code></td><td>礼县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621226</code> 礼县</td></tr>
    <tr><td><code>622629</code></td><td>两当县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621228</code> 两当县</td></tr>
    <tr><td><code>622630</code></td><td>徽县</td><td>停用</td><td>甘肃省 · 陇南地区</td><td>1985–2003</td><td><code>621227</code> 徽县</td></tr>
    <tr><td><code>622700</code></td><td>平凉地区</td><td>停用</td><td>甘肃省</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622701</code></td><td>平凉市</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1983–2001</td><td><code>620802</code> 崆峒区</td></tr>
    <tr><td><code>622721</code></td><td>平凉县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–1982</td><td><code>622701</code> 平凉市</td></tr>
    <tr><td><code>622722</code></td><td>泾川县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620821</code> 泾川县</td></tr>
    <tr><td><code>622723</code></td><td>灵台县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620822</code> 灵台县</td></tr>
    <tr><td><code>622724</code></td><td>崇信县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620823</code> 崇信县</td></tr>
    <tr><td><code>622725</code></td><td>华亭县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620824</code> 华亭县</td></tr>
    <tr><td><code>622726</code></td><td>庄浪县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620825</code> 庄浪县</td></tr>
    <tr><td><code>622727</code></td><td>静宁县</td><td>停用</td><td>甘肃省 · 平凉地区</td><td>1981–2001</td><td><code>620826</code> 静宁县</td></tr>
    <tr><td><code>622800</code></td><td>庆阳地区</td><td>停用</td><td>甘肃省</td><td>1981–2001</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>622801</code></td><td>西峰市</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1985–2001</td><td><code>621002</code> 西峰区</td></tr>
    <tr><td><code>622821</code></td><td>庆阳县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>622801</code> 西峰市；<code>621021</code> 庆城县</td></tr>
    <tr><td><code>622822</code></td><td>环县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621022</code> 环县</td></tr>
    <tr><td><code>622823</code></td><td>华池县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621023</code> 华池县</td></tr>
    <tr><td><code>622824</code></td><td>合水县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621024</code> 合水县</td></tr>
    <tr><td><code>622825</code></td><td>正宁县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621025</code> 正宁县</td></tr>
    <tr><td><code>622826</code></td><td>宁县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621026</code> 宁县</td></tr>
    <tr><td><code>622827</code></td><td>镇原县</td><td>停用</td><td>甘肃省 · 庆阳地区</td><td>1981–2001</td><td><code>621027</code> 镇原县</td></tr>
    <tr><td><code>630111</code></td><td>郊区</td><td>停用</td><td>青海省 · 西宁市</td><td>1983–1985</td><td><code>630102</code> 城东区；<code>630103</code> 城中区；<code>630104</code> 城西区；<code>630105</code> 城北区</td></tr>
    <tr><td><code>630121</code></td><td>大通县</td><td>更名</td><td>青海省 · 西宁市</td><td>1981–1984</td><td>代码未变，现名 大通回族土族自治县</td></tr>
    <tr><td><code>630122</code></td><td>湟中县</td><td>停用</td><td>青海省 · 西宁市</td><td>1999–2018</td><td><code>630106</code> 湟中区</td></tr>
    <tr><td><code>630221</code></td><td>平安县</td><td>停用</td><td>青海省 · 海东市</td><td>2013–2014</td><td><code>630203</code> 平安区</td></tr>
    <tr><td><code>632100</code></td><td>海东地区</td><td>停用</td><td>青海省</td><td>1981–2012</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>632121</code></td><td>平安县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–2012</td><td><code>630221</code> 平安县</td></tr>
    <tr><td><code>632122</code></td><td>民和县</td><td>更名</td><td>青海省 · 海东地区</td><td>1981–1984</td><td>代码未变，现名 民和县</td></tr>
    <tr><td><code>632122</code></td><td>民和回族土族自治县</td><td>停用</td><td>青海省 · 海东地区</td><td>1985–2012</td><td><code>630222</code> 民和回族土族自治县</td></tr>
    <tr><td><code>632123</code></td><td>乐都县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–2012</td><td><code>630202</code> 乐都区</td></tr>
    <tr><td><code>632124</code></td><td>湟中县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–1998</td><td><code>630122</code> 湟中县</td></tr>
    <tr><td><code>632125</code></td><td>湟源县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–1998</td><td><code>630123</code> 湟源县</td></tr>
    <tr><td><code>632126</code></td><td>互助土族自治县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–2012</td><td><code>630223</code> 互助土族自治县</td></tr>
    <tr><td><code>632127</code></td><td>化隆回族自治县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–2012</td><td><code>630224</code> 化隆回族自治县</td></tr>
    <tr><td><code>632128</code></td><td>循化撒拉族自治县</td><td>停用</td><td>青海省 · 海东地区</td><td>1981–2012</td><td><code>630225</code> 循化撒拉族自治县</td></tr>
    <tr><td><code>632321</code></td><td>同仁县</td><td>停用</td><td>青海省 · 黄南藏族自治州</td><td>1981–2019</td><td><code>632301</code> 同仁市</td></tr>
    <tr><td><code>632421</code></td><td>河南蒙古族自治县</td><td>停用</td><td>青海省</td><td>1981–1983</td><td><code>632324</code> 河南蒙古族自治县</td></tr>
    <tr><td><code>632721</code></td><td>玉树县</td><td>停用</td><td>青海省 · 玉树藏族自治州</td><td>1981–2012</td><td><code>632701</code> 玉树市</td></tr>
    <tr><td><code>632800</code></td><td>海西蒙古族藏族哈萨克族自治州</td><td>更名</td><td>青海省</td><td>1981–1984</td><td>代码未变，现名 海西蒙古族藏族自治州</td></tr>
    <tr><td><code>632801</code></td><td>格尔木市</td><td>更名</td><td>青海省 · 海西蒙古族藏族哈萨克族自治州</td><td>1981–1984</td><td>代码未变，现名 格尔木市</td></tr>
    <tr><td><code>632821</code></td><td>乌兰县</td><td>更名</td><td>青海省 · 海西蒙古族藏族哈萨克族自治州</td><td>1981–1984</td><td>代码未变，现名 乌兰县</td></tr>
    <tr><td><code>632822</code></td><td>都兰县</td><td>更名</td><td>青海省 · 海西蒙古族藏族哈萨克族自治州</td><td>1981–1984</td><td>代码未变，现名 都兰县</td></tr>
    <tr><td><code>632823</code></td><td>天峻县</td><td>更名</td><td>青海省 · 海西蒙古族藏族哈萨克族自治州</td><td>1981–1984</td><td>代码未变，现名 天峻县</td></tr>
    <tr><td><code>640102</code></td><td>城区</td><td>停用</td><td>宁夏回族自治区 · 银川市</td><td>1983–2001</td><td><code>640104</code> 兴庆区</td></tr>
    <tr><td><code>640103</code></td><td>新城区</td><td>停用</td><td>宁夏回族自治区 · 银川市</td><td>1983–2001</td><td><code>640105</code> 西夏区；<code>640106</code> 金凤区</td></tr>
    <tr><td><code>640111</code></td><td>郊区</td><td>停用</td><td>宁夏回族自治区 · 银川市</td><td>1983–2001</td><td><code>640104</code> 兴庆区；<code>640105</code> 西夏区；<code>640106</code> 金凤区</td></tr>
    <tr><td><code>640203</code></td><td>石嘴山区</td><td>停用</td><td>宁夏回族自治区 · 石嘴山市</td><td>1983–2002</td><td><code>640205</code> 惠农区</td></tr>
    <tr><td><code>640204</code></td><td>石炭井区</td><td>停用</td><td>宁夏回族自治区 · 石嘴山市</td><td>1983–2001</td><td><code>640202</code> 大武口区</td></tr>
    <tr><td><code>640211</code></td><td>郊区</td><td>停用</td><td>宁夏回族自治区 · 石嘴山市</td><td>1983–1986</td><td><code>640202</code> 大武口区；<code>640203</code> 石嘴山区；<code>640223</code> 惠农县</td></tr>
    <tr><td><code>640222</code></td><td>陶乐县</td><td>停用</td><td>宁夏回族自治区 · 石嘴山市</td><td>1981–2002</td><td><code>640104</code> 兴庆区；<code>640221</code> 平罗县</td></tr>
    <tr><td><code>640223</code></td><td>惠农县</td><td>停用</td><td>宁夏回族自治区 · 石嘴山市</td><td>1987–2002</td><td><code>640205</code> 惠农区</td></tr>
    <tr><td><code>640321</code></td><td>中卫县</td><td>停用</td><td>宁夏回族自治区 · 吴忠市</td><td>1998–2002</td><td><code>640502</code> 沙坡头区</td></tr>
    <tr><td><code>640322</code></td><td>中宁县</td><td>停用</td><td>宁夏回族自治区 · 吴忠市</td><td>1998–2002</td><td><code>640521</code> 中宁县</td></tr>
    <tr><td><code>640382</code></td><td>灵武市</td><td>停用</td><td>宁夏回族自治区 · 吴忠市</td><td>1998–2001</td><td><code>640181</code> 灵武市</td></tr>
    <tr><td><code>640421</code></td><td>海原县</td><td>停用</td><td>宁夏回族自治区 · 固原市</td><td>2001–2002</td><td><code>640522</code> 海原县</td></tr>
    <tr><td><code>642100</code></td><td>银南地区</td><td>停用</td><td>宁夏回族自治区</td><td>1981–1997</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>642101</code></td><td>吴忠市</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1983–1997</td><td><code>640302</code> 利通区</td></tr>
    <tr><td><code>642102</code></td><td>青铜峡市</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1984–1997</td><td><code>640381</code> 青铜峡市</td></tr>
    <tr><td><code>642103</code></td><td>灵武市</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1996–1997</td><td><code>640382</code> 灵武市</td></tr>
    <tr><td><code>642121</code></td><td>吴忠县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1982</td><td><code>642101</code> 吴忠市</td></tr>
    <tr><td><code>642122</code></td><td>青铜峡县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1983</td><td><code>642102</code> 青铜峡市</td></tr>
    <tr><td><code>642123</code></td><td>中卫县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1997</td><td><code>640321</code> 中卫县</td></tr>
    <tr><td><code>642124</code></td><td>中宁县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1997</td><td><code>640322</code> 中宁县</td></tr>
    <tr><td><code>642125</code></td><td>灵武县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1995</td><td><code>642103</code> 灵武市</td></tr>
    <tr><td><code>642126</code></td><td>盐池县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1997</td><td><code>640323</code> 盐池县</td></tr>
    <tr><td><code>642127</code></td><td>同心县</td><td>停用</td><td>宁夏回族自治区 · 银南地区</td><td>1981–1997</td><td><code>640324</code> 同心县</td></tr>
    <tr><td><code>642200</code></td><td>固原地区</td><td>停用</td><td>宁夏回族自治区</td><td>1981–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>642221</code></td><td>固原县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1981–2000</td><td><code>642226</code> 彭阳县；<code>640402</code> 原州区</td></tr>
    <tr><td><code>642222</code></td><td>海原县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1981–2000</td><td><code>640421</code> 海原县</td></tr>
    <tr><td><code>642223</code></td><td>西吉县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1981–2000</td><td><code>640422</code> 西吉县</td></tr>
    <tr><td><code>642224</code></td><td>隆德县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1981–2000</td><td><code>640423</code> 隆德县</td></tr>
    <tr><td><code>642225</code></td><td>泾源县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1981–2000</td><td><code>640424</code> 泾源县</td></tr>
    <tr><td><code>642226</code></td><td>彭阳县</td><td>停用</td><td>宁夏回族自治区 · 固原地区</td><td>1983–2000</td><td><code>640425</code> 彭阳县</td></tr>
    <tr><td><code>650107</code></td><td>南山矿区</td><td>更名</td><td>新疆维吾尔自治区 · 乌鲁木齐市</td><td>1983–1998</td><td>代码未变，现名 达坂城区</td></tr>
    <tr><td><code>650107</code></td><td>南泉区</td><td>更名</td><td>新疆维吾尔自治区 · 乌鲁木齐市</td><td>1999–2001</td><td>代码未变，现名 达坂城区</td></tr>
    <tr><td><code>650108</code></td><td>东山区</td><td>停用</td><td>新疆维吾尔自治区 · 乌鲁木齐市</td><td>1987–2006</td><td><code>650105</code> 水磨沟区；<code>650109</code> 米东区</td></tr>
    <tr><td><code>650300</code></td><td>石河子市</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–1984</td><td><code>659001</code> 石河子市</td></tr>
    <tr><td><code>652100</code></td><td>吐鲁番地区</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–2014</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>652101</code></td><td>吐鲁番市</td><td>停用</td><td>新疆维吾尔自治区 · 吐鲁番地区</td><td>1984–2014</td><td><code>650402</code> 高昌区</td></tr>
    <tr><td><code>652121</code></td><td>吐鲁番县</td><td>停用</td><td>新疆维吾尔自治区 · 吐鲁番地区</td><td>1981–1983</td><td><code>652101</code> 吐鲁番市</td></tr>
    <tr><td><code>652122</code></td><td>鄯善县</td><td>停用</td><td>新疆维吾尔自治区 · 吐鲁番地区</td><td>1981–2014</td><td><code>650421</code> 鄯善县</td></tr>
    <tr><td><code>652123</code></td><td>托克逊县</td><td>停用</td><td>新疆维吾尔自治区 · 吐鲁番地区</td><td>1981–2014</td><td><code>650422</code> 托克逊县</td></tr>
    <tr><td><code>652200</code></td><td>哈密地区</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–2015</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>652201</code></td><td>哈密市</td><td>停用</td><td>新疆维吾尔自治区 · 哈密地区</td><td>1981–2015</td><td><code>650502</code> 伊州区</td></tr>
    <tr><td><code>652221</code></td><td>哈密县</td><td>停用</td><td>新疆维吾尔自治区 · 哈密地区</td><td>1981–1982</td><td><code>652201</code> 哈密市</td></tr>
    <tr><td><code>652222</code></td><td>巴里坤哈萨克自治县</td><td>停用</td><td>新疆维吾尔自治区 · 哈密地区</td><td>1981–2015</td><td><code>650521</code> 巴里坤哈萨克自治县</td></tr>
    <tr><td><code>652223</code></td><td>伊吾县</td><td>停用</td><td>新疆维吾尔自治区 · 哈密地区</td><td>1981–2015</td><td><code>650522</code> 伊吾县</td></tr>
    <tr><td><code>652303</code></td><td>米泉市</td><td>停用</td><td>新疆维吾尔自治区 · 昌吉回族自治州</td><td>1996–2006</td><td><code>650109</code> 米东区</td></tr>
    <tr><td><code>652321</code></td><td>昌吉县</td><td>停用</td><td>新疆维吾尔自治区 · 昌吉回族自治州</td><td>1981–1982</td><td><code>652301</code> 昌吉市</td></tr>
    <tr><td><code>652322</code></td><td>米泉县</td><td>停用</td><td>新疆维吾尔自治区 · 昌吉回族自治州</td><td>1981–1995</td><td><code>652303</code> 米泉市</td></tr>
    <tr><td><code>652326</code></td><td>阜康县</td><td>停用</td><td>新疆维吾尔自治区 · 昌吉回族自治州</td><td>1981–1991</td><td><code>652302</code> 阜康市</td></tr>
    <tr><td><code>652400</code></td><td>伊犁哈萨克自治州</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>652401</code></td><td>伊宁市</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654101</code> 伊宁市</td></tr>
    <tr><td><code>652402</code></td><td>奎屯市</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654001</code> 奎屯市</td></tr>
    <tr><td><code>652421</code></td><td>伊宁县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654121</code> 伊宁县</td></tr>
    <tr><td><code>652422</code></td><td>察布查尔锡伯自治县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654122</code> 察布查尔锡伯自治县</td></tr>
    <tr><td><code>652423</code></td><td>霍城县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654123</code> 霍城县</td></tr>
    <tr><td><code>652424</code></td><td>巩留县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654124</code> 巩留县</td></tr>
    <tr><td><code>652425</code></td><td>新源县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654125</code> 新源县</td></tr>
    <tr><td><code>652426</code></td><td>昭苏县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654126</code> 昭苏县</td></tr>
    <tr><td><code>652427</code></td><td>特克斯县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654127</code> 特克斯县</td></tr>
    <tr><td><code>652428</code></td><td>尼勒克县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1981–1983</td><td><code>654128</code> 尼勒克县</td></tr>
    <tr><td><code>652500</code></td><td>塔城地区</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>652521</code></td><td>塔城县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654201</code> 塔城市</td></tr>
    <tr><td><code>652522</code></td><td>额敏县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654221</code> 额敏县</td></tr>
    <tr><td><code>652523</code></td><td>乌苏县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654222</code> 乌苏县</td></tr>
    <tr><td><code>652524</code></td><td>沙湾县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654223</code> 沙湾县</td></tr>
    <tr><td><code>652525</code></td><td>托里县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654224</code> 托里县</td></tr>
    <tr><td><code>652526</code></td><td>裕民县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654225</code> 裕民县</td></tr>
    <tr><td><code>652527</code></td><td>和布克赛尔蒙古自治县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1981–1983</td><td><code>654226</code> 和布克赛尔蒙古自治县</td></tr>
    <tr><td><code>652600</code></td><td>阿勒泰地区</td><td>停用</td><td>新疆维吾尔自治区</td><td>1981–1983</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>652621</code></td><td>阿勒泰县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654301</code> 阿勒泰市</td></tr>
    <tr><td><code>652622</code></td><td>布尔津县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654321</code> 布尔津县</td></tr>
    <tr><td><code>652623</code></td><td>富蕴县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654322</code> 富蕴县</td></tr>
    <tr><td><code>652624</code></td><td>福海县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654323</code> 福海县</td></tr>
    <tr><td><code>652625</code></td><td>哈巴河县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654324</code> 哈巴河县</td></tr>
    <tr><td><code>652626</code></td><td>青河县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654325</code> 青河县</td></tr>
    <tr><td><code>652627</code></td><td>吉木乃县</td><td>停用</td><td>新疆维吾尔自治区 · 阿勒泰地区</td><td>1981–1983</td><td><code>654326</code> 吉木乃县</td></tr>
    <tr><td><code>652721</code></td><td>博乐县</td><td>停用</td><td>新疆维吾尔自治区 · 博尔塔拉蒙古自治州</td><td>1981–1984</td><td><code>652701</code> 博乐市</td></tr>
    <tr><td><code>652821</code></td><td>库尔勒县</td><td>停用</td><td>新疆维吾尔自治区 · 巴音郭楞蒙古自治州</td><td>1981–1982</td><td><code>652801</code> 库尔勒市</td></tr>
    <tr><td><code>652921</code></td><td>阿克苏县</td><td>停用</td><td>新疆维吾尔自治区 · 阿克苏地区</td><td>1981–1982</td><td><code>652901</code> 阿克苏市</td></tr>
    <tr><td><code>652923</code></td><td>库车县</td><td>停用</td><td>新疆维吾尔自治区 · 阿克苏地区</td><td>1981–2018</td><td><code>652902</code> 库车市</td></tr>
    <tr><td><code>653021</code></td><td>阿图什县</td><td>停用</td><td>新疆维吾尔自治区 · 克孜勒苏柯尔克孜自治州</td><td>1981–1985</td><td><code>653001</code> 阿图什市</td></tr>
    <tr><td><code>654001</code></td><td>奎屯市</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁哈萨克自治州</td><td>1984–2000</td><td><code>654003</code> 奎屯市</td></tr>
    <tr><td><code>654100</code></td><td>伊犁地区</td><td>停用</td><td>新疆维吾尔自治区</td><td>1984–2000</td><td>—（地级建制撤销，原辖区县见各自对应行）</td></tr>
    <tr><td><code>654101</code></td><td>伊宁市</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654002</code> 伊宁市</td></tr>
    <tr><td><code>654121</code></td><td>伊宁县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654021</code> 伊宁县</td></tr>
    <tr><td><code>654122</code></td><td>察布查尔锡伯自治县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654022</code> 察布查尔锡伯自治县</td></tr>
    <tr><td><code>654123</code></td><td>霍城县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654023</code> 霍城县</td></tr>
    <tr><td><code>654124</code></td><td>巩留县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654024</code> 巩留县</td></tr>
    <tr><td><code>654125</code></td><td>新源县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654025</code> 新源县</td></tr>
    <tr><td><code>654126</code></td><td>昭苏县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654026</code> 昭苏县</td></tr>
    <tr><td><code>654127</code></td><td>特克斯县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654027</code> 特克斯县</td></tr>
    <tr><td><code>654128</code></td><td>尼勒克县</td><td>停用</td><td>新疆维吾尔自治区 · 伊犁地区</td><td>1984–2000</td><td><code>654028</code> 尼勒克县</td></tr>
    <tr><td><code>654222</code></td><td>乌苏县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1984–1995</td><td><code>654202</code> 乌苏市</td></tr>
    <tr><td><code>654223</code></td><td>沙湾县</td><td>停用</td><td>新疆维吾尔自治区 · 塔城地区</td><td>1984–2020</td><td><code>654203</code> 沙湾市</td></tr>
  </tbody>
</table>
</div>

## 常见问题 FAQ

<details>
<summary>Q: 身份证前六位代表出生地吗？</summary>

不完全是。地址码是**首次申领身份证时**常住户口所在地的代码，多数人在出生地落户，所以经常和出生地一致；但如果办证前已经迁过户口，就是迁入地的代码。

</details>

<details>
<summary>Q: 户口迁移后，身份证号码会变吗？</summary>

不会。公民身份号码终身不变，户口迁移、区划调整都不会改号。所以身份证前 6 位反映的是首次办证时的户籍地，而不是现在的户籍地。

</details>

<details>
<summary>Q: 前六位在现行代码表里查不到，说明身份证是假的吗？</summary>

不能这么判断。大量老身份证使用的是已经停用的历史代码，这是正常现象。请先在本页的历史代码表里查找。

</details>

<details>
<summary>Q: 第 18 位是 X 是什么意思？</summary>

X 是罗马数字 10。校验码按 MOD 11-2 计算，余数为 2 时对应的校验值是 10，为了保持 18 位长度就用 X 表示，不是字母 x 的意思。

</details>

<details>
<summary>Q: 本页能查到具体某个人的信息吗？</summary>

不能，也不应该。本页只介绍国家标准公开的编码规则和公开发布的行政区划代码，不涉及任何个人信息；请勿将他人身份证号用于非法用途。

</details>

## 六、数据来源

- 历史代码：民政部 1981–2025 年历年县级以上行政区划代码、县级以上行政区划变更情况及国务院公报，整理自开源数据集 [yescallop/areacodes](https://github.com/yescallop/areacodes)（CC0），其中「现对应代码」为该数据集整理的新旧代码对应关系。
- 编码规则：GB 11643《公民身份号码》、GB/T 2260《中华人民共和国行政区划代码》。
- 1981 年以前（GB/T 2260 首版之前）的代码未收录。

## 地理编码速查系列

- [行政区划代码全表](/learn/china-admin-division-codes)
- [34 个省级行政区一览](/learn/china-provinces-overview)
- [全国车牌代码对照表](/learn/china-license-plate-codes)
- [全国车牌代码互动地图](/maps/china-license-plate-codes)
- [全国电话区号表](/learn/china-telephone-area-codes)
- [全国邮政编码表](/learn/china-postal-codes)
- [全国机场三字码 / 四字码](/learn/china-airport-codes)
- [世界国家和地区代码（ISO 3166）](/learn/iso-3166-country-codes)
- [中国常用坐标系 EPSG 代码](/learn/china-epsg-codes)
- [高斯-克吕格分带带号对照](/learn/gauss-kruger-zone-table)
- [用地用海分类代码表](/learn/land-sea-use-classification-codes)
- [河流国标码](/learn/china-river-codes)
