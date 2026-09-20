---
slug: china-admin-division-codes
title: 中华人民共和国行政区划代码（六位码）全表
summary: 基于 GB/T 2260 的全国行政区划六位代码全表，覆盖 34 个省级行政区及下属地市、区县，供 GIS 制图与地址标准化检索。
date: 2026-09-20
category: 高中地理
subject: 人文地理
tags: 行政区划代码, GB/T 2260, 地理编码, GIS数据, 城市代码
---


## 一、这是什么

「行政区划代码」是我国对每个省级、地市级、区县级行政区编制的**唯一数字代号**，国家标准为 **GB/T 2260**。
它在 GIS 制图、地址标准化、统计报表、邮政与身份证前六位里无处不在——身份证前六位就是户籍所在地的行政区划代码。

## 二、六位码怎么读

每一行代码固定 **6 位数字**，按层级拆成三段：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>段</th><th>位数</th><th>含义</th><th>示例（北京市）</th></tr>
  </thead>
  <tbody>
    <tr><td>第 1–2 位</td><td>省</td><td>省级行政区（省 / 直辖市 / 自治区 / 特别行政区）</td><td><code>11</code> 北京市</td></tr>
    <tr><td>第 3–4 位</td><td>市</td><td>地级市 / 地区 / 自治州 / 盟（直辖市此段为 <code>01</code> 起）</td><td><code>1101</code> 市辖区</td></tr>
    <tr><td>第 5–6 位</td><td>区</td><td>市辖区 / 县 / 县级市</td><td><code>110101</code> 东城区</td></tr>
  </tbody>
</table>
</div>

规则：省级代码以 `0000` 结尾，地市级以 `00` 结尾，区县级为完整 6 位。
例如 `440300` 深圳市 = `44` 广东 + `03` 深圳 + `00`（地级市本身）；其下 `440304` 福田区 = `44`+`03`+`04`。

## 三、全表（按省级行政区排列）

下表整理自本地数据集 `城市代码.xls`，共 **3628** 条记录，覆盖 34 个省级行政区。
表格列为：**代码 / 省 / 市（地区·自治州） / 区·县**。

> 说明：直辖市（北京、天津、上海、重庆）的「市 / 地区」列直接填入市辖区名称，「区 / 县」列为空，这是源数据的编排方式。

## 北京市（110000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>110000</code></td><td>北京市</td><td></td><td></td></tr>
    <tr><td><code>110101</code></td><td>北京市</td><td>东城区</td><td></td></tr>
    <tr><td><code>110102</code></td><td>北京市</td><td>西城区</td><td></td></tr>
    <tr><td><code>110105</code></td><td>北京市</td><td>朝阳区</td><td></td></tr>
    <tr><td><code>110106</code></td><td>北京市</td><td>丰台区</td><td></td></tr>
    <tr><td><code>110107</code></td><td>北京市</td><td>石景山区</td><td></td></tr>
    <tr><td><code>110108</code></td><td>北京市</td><td>海淀区</td><td></td></tr>
    <tr><td><code>110109</code></td><td>北京市</td><td>门头沟区</td><td></td></tr>
    <tr><td><code>110111</code></td><td>北京市</td><td>房山区</td><td></td></tr>
    <tr><td><code>110112</code></td><td>北京市</td><td>通州区</td><td></td></tr>
    <tr><td><code>110113</code></td><td>北京市</td><td>顺义区</td><td></td></tr>
    <tr><td><code>110114</code></td><td>北京市</td><td>昌平区</td><td></td></tr>
    <tr><td><code>110115</code></td><td>北京市</td><td>大兴区</td><td></td></tr>
    <tr><td><code>110116</code></td><td>北京市</td><td>怀柔区</td><td></td></tr>
    <tr><td><code>110117</code></td><td>北京市</td><td>平谷区</td><td></td></tr>
    <tr><td><code>110118</code></td><td>北京市</td><td>密云区</td><td></td></tr>
    <tr><td><code>110119</code></td><td>北京市</td><td>延庆区</td><td></td></tr>
  </tbody>
</table>
</div>


## 天津市（120000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>120000</code></td><td>天津市</td><td></td><td></td></tr>
    <tr><td><code>120101</code></td><td>天津市</td><td>和平区</td><td></td></tr>
    <tr><td><code>120102</code></td><td>天津市</td><td>河东区</td><td></td></tr>
    <tr><td><code>120103</code></td><td>天津市</td><td>河西区</td><td></td></tr>
    <tr><td><code>120104</code></td><td>天津市</td><td>南开区</td><td></td></tr>
    <tr><td><code>120105</code></td><td>天津市</td><td>河北区</td><td></td></tr>
    <tr><td><code>120106</code></td><td>天津市</td><td>红桥区</td><td></td></tr>
    <tr><td><code>120110</code></td><td>天津市</td><td>东丽区</td><td></td></tr>
    <tr><td><code>120111</code></td><td>天津市</td><td>西青区</td><td></td></tr>
    <tr><td><code>120112</code></td><td>天津市</td><td>津南区</td><td></td></tr>
    <tr><td><code>120113</code></td><td>天津市</td><td>北辰区</td><td></td></tr>
    <tr><td><code>120114</code></td><td>天津市</td><td>武清区</td><td></td></tr>
    <tr><td><code>120115</code></td><td>天津市</td><td>宝坻区</td><td></td></tr>
    <tr><td><code>120116</code></td><td>天津市</td><td>滨海新区</td><td></td></tr>
    <tr><td><code>120117</code></td><td>天津市</td><td>宁河区</td><td></td></tr>
    <tr><td><code>120118</code></td><td>天津市</td><td>静海区</td><td></td></tr>
    <tr><td><code>120119</code></td><td>天津市</td><td>蓟州区</td><td></td></tr>
  </tbody>
</table>
</div>


## 河北省（130000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>130000</code></td><td>河北省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>130100</code></td><td>河北省</td><td>石家庄市</td><td></td></tr>
    <tr><td><code>130102</code></td><td>河北省</td><td>石家庄市</td><td>长安区</td></tr>
    <tr><td><code>130104</code></td><td>河北省</td><td>石家庄市</td><td>桥西区</td></tr>
    <tr><td><code>130105</code></td><td>河北省</td><td>石家庄市</td><td>新华区</td></tr>
    <tr><td><code>130107</code></td><td>河北省</td><td>石家庄市</td><td>井陉矿区</td></tr>
    <tr><td><code>130108</code></td><td>河北省</td><td>石家庄市</td><td>裕华区</td></tr>
    <tr><td><code>130109</code></td><td>河北省</td><td>石家庄市</td><td>藁城区</td></tr>
    <tr><td><code>130110</code></td><td>河北省</td><td>石家庄市</td><td>鹿泉区</td></tr>
    <tr><td><code>130111</code></td><td>河北省</td><td>石家庄市</td><td>栾城区</td></tr>
    <tr><td><code>130121</code></td><td>河北省</td><td>石家庄市</td><td>井陉县</td></tr>
    <tr><td><code>130123</code></td><td>河北省</td><td>石家庄市</td><td>正定县</td></tr>
    <tr><td><code>130125</code></td><td>河北省</td><td>石家庄市</td><td>行唐县</td></tr>
    <tr><td><code>130126</code></td><td>河北省</td><td>石家庄市</td><td>灵寿县</td></tr>
    <tr><td><code>130127</code></td><td>河北省</td><td>石家庄市</td><td>高邑县</td></tr>
    <tr><td><code>130128</code></td><td>河北省</td><td>石家庄市</td><td>深泽县</td></tr>
    <tr><td><code>130129</code></td><td>河北省</td><td>石家庄市</td><td>赞皇县</td></tr>
    <tr><td><code>130130</code></td><td>河北省</td><td>石家庄市</td><td>无极县</td></tr>
    <tr><td><code>130131</code></td><td>河北省</td><td>石家庄市</td><td>平山县</td></tr>
    <tr><td><code>130132</code></td><td>河北省</td><td>石家庄市</td><td>元氏县</td></tr>
    <tr><td><code>130133</code></td><td>河北省</td><td>石家庄市</td><td>赵县</td></tr>
    <tr><td><code>130183</code></td><td>河北省</td><td>石家庄市</td><td>晋州市</td></tr>
    <tr><td><code>130184</code></td><td>河北省</td><td>石家庄市</td><td>新乐市</td></tr>
    <tr class="level-city"><td><code>130200</code></td><td>河北省</td><td>唐山市</td><td></td></tr>
    <tr><td><code>130202</code></td><td>河北省</td><td>唐山市</td><td>路南区</td></tr>
    <tr><td><code>130203</code></td><td>河北省</td><td>唐山市</td><td>路北区</td></tr>
    <tr><td><code>130204</code></td><td>河北省</td><td>唐山市</td><td>古冶区</td></tr>
    <tr><td><code>130205</code></td><td>河北省</td><td>唐山市</td><td>开平区</td></tr>
    <tr><td><code>130207</code></td><td>河北省</td><td>唐山市</td><td>丰南区</td></tr>
    <tr><td><code>130208</code></td><td>河北省</td><td>唐山市</td><td>丰润区</td></tr>
    <tr><td><code>130209</code></td><td>河北省</td><td>唐山市</td><td>曹妃甸区</td></tr>
    <tr><td><code>130223</code></td><td>河北省</td><td>唐山市</td><td>滦县</td></tr>
    <tr><td><code>130224</code></td><td>河北省</td><td>唐山市</td><td>滦南县</td></tr>
    <tr><td><code>130225</code></td><td>河北省</td><td>唐山市</td><td>乐亭县</td></tr>
    <tr><td><code>130227</code></td><td>河北省</td><td>唐山市</td><td>迁西县</td></tr>
    <tr><td><code>130229</code></td><td>河北省</td><td>唐山市</td><td>玉田县</td></tr>
    <tr><td><code>130281</code></td><td>河北省</td><td>唐山市</td><td>遵化市</td></tr>
    <tr><td><code>130283</code></td><td>河北省</td><td>唐山市</td><td>迁安市</td></tr>
    <tr class="level-city"><td><code>130300</code></td><td>河北省</td><td>秦皇岛市</td><td></td></tr>
    <tr><td><code>130302</code></td><td>河北省</td><td>秦皇岛市</td><td>海港区</td></tr>
    <tr><td><code>130303</code></td><td>河北省</td><td>秦皇岛市</td><td>山海关区</td></tr>
    <tr><td><code>130304</code></td><td>河北省</td><td>秦皇岛市</td><td>北戴河区</td></tr>
    <tr><td><code>130306</code></td><td>河北省</td><td>秦皇岛市</td><td>抚宁区</td></tr>
    <tr><td><code>130321</code></td><td>河北省</td><td>秦皇岛市</td><td>青龙满族自治县</td></tr>
    <tr><td><code>130322</code></td><td>河北省</td><td>秦皇岛市</td><td>昌黎县</td></tr>
    <tr><td><code>130324</code></td><td>河北省</td><td>秦皇岛市</td><td>卢龙县</td></tr>
    <tr class="level-city"><td><code>130400</code></td><td>河北省</td><td>邯郸市</td><td></td></tr>
    <tr><td><code>130402</code></td><td>河北省</td><td>邯郸市</td><td>邯山区</td></tr>
    <tr><td><code>130403</code></td><td>河北省</td><td>邯郸市</td><td>丛台区</td></tr>
    <tr><td><code>130404</code></td><td>河北省</td><td>邯郸市</td><td>复兴区</td></tr>
    <tr><td><code>130406</code></td><td>河北省</td><td>邯郸市</td><td>峰峰矿区</td></tr>
    <tr><td><code>130407</code></td><td>河北省</td><td>邯郸市</td><td>肥乡区</td></tr>
    <tr><td><code>130408</code></td><td>河北省</td><td>邯郸市</td><td>永年区</td></tr>
    <tr><td><code>130423</code></td><td>河北省</td><td>邯郸市</td><td>临漳县</td></tr>
    <tr><td><code>130424</code></td><td>河北省</td><td>邯郸市</td><td>成安县</td></tr>
    <tr><td><code>130425</code></td><td>河北省</td><td>邯郸市</td><td>大名县</td></tr>
    <tr><td><code>130426</code></td><td>河北省</td><td>邯郸市</td><td>涉县</td></tr>
    <tr><td><code>130427</code></td><td>河北省</td><td>邯郸市</td><td>磁县</td></tr>
    <tr><td><code>130430</code></td><td>河北省</td><td>邯郸市</td><td>邱县</td></tr>
    <tr><td><code>130431</code></td><td>河北省</td><td>邯郸市</td><td>鸡泽县</td></tr>
    <tr><td><code>130432</code></td><td>河北省</td><td>邯郸市</td><td>广平县</td></tr>
    <tr><td><code>130433</code></td><td>河北省</td><td>邯郸市</td><td>馆陶县</td></tr>
    <tr><td><code>130434</code></td><td>河北省</td><td>邯郸市</td><td>魏县</td></tr>
    <tr><td><code>130435</code></td><td>河北省</td><td>邯郸市</td><td>曲周县</td></tr>
    <tr><td><code>130481</code></td><td>河北省</td><td>邯郸市</td><td>武安市</td></tr>
    <tr class="level-city"><td><code>130500</code></td><td>河北省</td><td>邢台市</td><td></td></tr>
    <tr><td><code>130502</code></td><td>河北省</td><td>邢台市</td><td>桥东区</td></tr>
    <tr><td><code>130503</code></td><td>河北省</td><td>邢台市</td><td>桥西区</td></tr>
    <tr><td><code>130521</code></td><td>河北省</td><td>邢台市</td><td>邢台县</td></tr>
    <tr><td><code>130522</code></td><td>河北省</td><td>邢台市</td><td>临城县</td></tr>
    <tr><td><code>130523</code></td><td>河北省</td><td>邢台市</td><td>内丘县</td></tr>
    <tr><td><code>130524</code></td><td>河北省</td><td>邢台市</td><td>柏乡县</td></tr>
    <tr><td><code>130525</code></td><td>河北省</td><td>邢台市</td><td>隆尧县</td></tr>
    <tr><td><code>130526</code></td><td>河北省</td><td>邢台市</td><td>任县</td></tr>
    <tr><td><code>130527</code></td><td>河北省</td><td>邢台市</td><td>南和县</td></tr>
    <tr><td><code>130528</code></td><td>河北省</td><td>邢台市</td><td>宁晋县</td></tr>
    <tr><td><code>130529</code></td><td>河北省</td><td>邢台市</td><td>巨鹿县</td></tr>
    <tr><td><code>130530</code></td><td>河北省</td><td>邢台市</td><td>新河县</td></tr>
    <tr><td><code>130531</code></td><td>河北省</td><td>邢台市</td><td>广宗县</td></tr>
    <tr><td><code>130532</code></td><td>河北省</td><td>邢台市</td><td>平乡县</td></tr>
    <tr><td><code>130533</code></td><td>河北省</td><td>邢台市</td><td>威县</td></tr>
    <tr><td><code>130534</code></td><td>河北省</td><td>邢台市</td><td>清河县</td></tr>
    <tr><td><code>130535</code></td><td>河北省</td><td>邢台市</td><td>临西县</td></tr>
    <tr><td><code>130581</code></td><td>河北省</td><td>邢台市</td><td>南宫市</td></tr>
    <tr><td><code>130582</code></td><td>河北省</td><td>邢台市</td><td>沙河市</td></tr>
    <tr class="level-city"><td><code>130600</code></td><td>河北省</td><td>保定市</td><td></td></tr>
    <tr><td><code>130602</code></td><td>河北省</td><td>保定市</td><td>竞秀区</td></tr>
    <tr><td><code>130606</code></td><td>河北省</td><td>保定市</td><td>莲池区</td></tr>
    <tr><td><code>130607</code></td><td>河北省</td><td>保定市</td><td>满城区</td></tr>
    <tr><td><code>130608</code></td><td>河北省</td><td>保定市</td><td>清苑区</td></tr>
    <tr><td><code>130609</code></td><td>河北省</td><td>保定市</td><td>徐水区</td></tr>
    <tr><td><code>130623</code></td><td>河北省</td><td>保定市</td><td>涞水县</td></tr>
    <tr><td><code>130624</code></td><td>河北省</td><td>保定市</td><td>阜平县</td></tr>
    <tr><td><code>130626</code></td><td>河北省</td><td>保定市</td><td>定兴县</td></tr>
    <tr><td><code>130627</code></td><td>河北省</td><td>保定市</td><td>唐县</td></tr>
    <tr><td><code>130628</code></td><td>河北省</td><td>保定市</td><td>高阳县</td></tr>
    <tr><td><code>130629</code></td><td>河北省</td><td>保定市</td><td>容城县</td></tr>
    <tr><td><code>130630</code></td><td>河北省</td><td>保定市</td><td>涞源县</td></tr>
    <tr><td><code>130631</code></td><td>河北省</td><td>保定市</td><td>望都县</td></tr>
    <tr><td><code>130632</code></td><td>河北省</td><td>保定市</td><td>安新县</td></tr>
    <tr><td><code>130633</code></td><td>河北省</td><td>保定市</td><td>易县</td></tr>
    <tr><td><code>130634</code></td><td>河北省</td><td>保定市</td><td>曲阳县</td></tr>
    <tr><td><code>130635</code></td><td>河北省</td><td>保定市</td><td>蠡县</td></tr>
    <tr><td><code>130636</code></td><td>河北省</td><td>保定市</td><td>顺平县</td></tr>
    <tr><td><code>130637</code></td><td>河北省</td><td>保定市</td><td>博野县</td></tr>
    <tr><td><code>130638</code></td><td>河北省</td><td>保定市</td><td>雄县</td></tr>
    <tr><td><code>130681</code></td><td>河北省</td><td>保定市</td><td>涿州市</td></tr>
    <tr><td><code>130683</code></td><td>河北省</td><td>保定市</td><td>安国市</td></tr>
    <tr><td><code>130684</code></td><td>河北省</td><td>保定市</td><td>高碑店市</td></tr>
    <tr class="level-city"><td><code>130700</code></td><td>河北省</td><td>张家口市</td><td></td></tr>
    <tr><td><code>130702</code></td><td>河北省</td><td>张家口市</td><td>桥东区</td></tr>
    <tr><td><code>130703</code></td><td>河北省</td><td>张家口市</td><td>桥西区</td></tr>
    <tr><td><code>130705</code></td><td>河北省</td><td>张家口市</td><td>宣化区</td></tr>
    <tr><td><code>130706</code></td><td>河北省</td><td>张家口市</td><td>下花园区</td></tr>
    <tr><td><code>130708</code></td><td>河北省</td><td>张家口市</td><td>万全区</td></tr>
    <tr><td><code>130709</code></td><td>河北省</td><td>张家口市</td><td>崇礼区</td></tr>
    <tr><td><code>130722</code></td><td>河北省</td><td>张家口市</td><td>张北县</td></tr>
    <tr><td><code>130723</code></td><td>河北省</td><td>张家口市</td><td>康保县</td></tr>
    <tr><td><code>130724</code></td><td>河北省</td><td>张家口市</td><td>沽源县</td></tr>
    <tr><td><code>130725</code></td><td>河北省</td><td>张家口市</td><td>尚义县</td></tr>
    <tr><td><code>130726</code></td><td>河北省</td><td>张家口市</td><td>蔚县</td></tr>
    <tr><td><code>130727</code></td><td>河北省</td><td>张家口市</td><td>阳原县</td></tr>
    <tr><td><code>130728</code></td><td>河北省</td><td>张家口市</td><td>怀安县</td></tr>
    <tr><td><code>130730</code></td><td>河北省</td><td>张家口市</td><td>怀来县</td></tr>
    <tr><td><code>130731</code></td><td>河北省</td><td>张家口市</td><td>涿鹿县</td></tr>
    <tr><td><code>130732</code></td><td>河北省</td><td>张家口市</td><td>赤城县</td></tr>
    <tr class="level-city"><td><code>130800</code></td><td>河北省</td><td>承德市</td><td></td></tr>
    <tr><td><code>130802</code></td><td>河北省</td><td>承德市</td><td>双桥区</td></tr>
    <tr><td><code>130803</code></td><td>河北省</td><td>承德市</td><td>双滦区</td></tr>
    <tr><td><code>130804</code></td><td>河北省</td><td>承德市</td><td>鹰手营子矿区</td></tr>
    <tr><td><code>130821</code></td><td>河北省</td><td>承德市</td><td>承德县</td></tr>
    <tr><td><code>130822</code></td><td>河北省</td><td>承德市</td><td>兴隆县</td></tr>
    <tr><td><code>130824</code></td><td>河北省</td><td>承德市</td><td>滦平县</td></tr>
    <tr><td><code>130825</code></td><td>河北省</td><td>承德市</td><td>隆化县</td></tr>
    <tr><td><code>130826</code></td><td>河北省</td><td>承德市</td><td>丰宁满族自治县</td></tr>
    <tr><td><code>130827</code></td><td>河北省</td><td>承德市</td><td>宽城满族自治县</td></tr>
    <tr><td><code>130828</code></td><td>河北省</td><td>承德市</td><td>围场满族蒙古族自治县</td></tr>
    <tr><td><code>130881</code></td><td>河北省</td><td>承德市</td><td>平泉市</td></tr>
    <tr class="level-city"><td><code>130900</code></td><td>河北省</td><td>沧州市</td><td></td></tr>
    <tr><td><code>130902</code></td><td>河北省</td><td>沧州市</td><td>新华区</td></tr>
    <tr><td><code>130903</code></td><td>河北省</td><td>沧州市</td><td>运河区</td></tr>
    <tr><td><code>130921</code></td><td>河北省</td><td>沧州市</td><td>沧县</td></tr>
    <tr><td><code>130922</code></td><td>河北省</td><td>沧州市</td><td>青县</td></tr>
    <tr><td><code>130923</code></td><td>河北省</td><td>沧州市</td><td>东光县</td></tr>
    <tr><td><code>130924</code></td><td>河北省</td><td>沧州市</td><td>海兴县</td></tr>
    <tr><td><code>130925</code></td><td>河北省</td><td>沧州市</td><td>盐山县</td></tr>
    <tr><td><code>130926</code></td><td>河北省</td><td>沧州市</td><td>肃宁县</td></tr>
    <tr><td><code>130927</code></td><td>河北省</td><td>沧州市</td><td>南皮县</td></tr>
    <tr><td><code>130928</code></td><td>河北省</td><td>沧州市</td><td>吴桥县</td></tr>
    <tr><td><code>130929</code></td><td>河北省</td><td>沧州市</td><td>献县</td></tr>
    <tr><td><code>130930</code></td><td>河北省</td><td>沧州市</td><td>孟村回族自治县</td></tr>
    <tr><td><code>130981</code></td><td>河北省</td><td>沧州市</td><td>泊头市</td></tr>
    <tr><td><code>130982</code></td><td>河北省</td><td>沧州市</td><td>任丘市</td></tr>
    <tr><td><code>130983</code></td><td>河北省</td><td>沧州市</td><td>黄骅市</td></tr>
    <tr><td><code>130984</code></td><td>河北省</td><td>沧州市</td><td>河间市</td></tr>
    <tr class="level-city"><td><code>131000</code></td><td>河北省</td><td>廊坊市</td><td></td></tr>
    <tr><td><code>131002</code></td><td>河北省</td><td>廊坊市</td><td>安次区</td></tr>
    <tr><td><code>131003</code></td><td>河北省</td><td>廊坊市</td><td>广阳区</td></tr>
    <tr><td><code>131022</code></td><td>河北省</td><td>廊坊市</td><td>固安县</td></tr>
    <tr><td><code>131023</code></td><td>河北省</td><td>廊坊市</td><td>永清县</td></tr>
    <tr><td><code>131024</code></td><td>河北省</td><td>廊坊市</td><td>香河县</td></tr>
    <tr><td><code>131025</code></td><td>河北省</td><td>廊坊市</td><td>大城县</td></tr>
    <tr><td><code>131026</code></td><td>河北省</td><td>廊坊市</td><td>文安县</td></tr>
    <tr><td><code>131028</code></td><td>河北省</td><td>廊坊市</td><td>大厂回族自治县</td></tr>
    <tr><td><code>131081</code></td><td>河北省</td><td>廊坊市</td><td>霸州市</td></tr>
    <tr><td><code>131082</code></td><td>河北省</td><td>廊坊市</td><td>三河市</td></tr>
    <tr class="level-city"><td><code>131100</code></td><td>河北省</td><td>衡水市</td><td></td></tr>
    <tr><td><code>131102</code></td><td>河北省</td><td>衡水市</td><td>桃城区</td></tr>
    <tr><td><code>131103</code></td><td>河北省</td><td>衡水市</td><td>冀州区</td></tr>
    <tr><td><code>131121</code></td><td>河北省</td><td>衡水市</td><td>枣强县</td></tr>
    <tr><td><code>131122</code></td><td>河北省</td><td>衡水市</td><td>武邑县</td></tr>
    <tr><td><code>131123</code></td><td>河北省</td><td>衡水市</td><td>武强县</td></tr>
    <tr><td><code>131124</code></td><td>河北省</td><td>衡水市</td><td>饶阳县</td></tr>
    <tr><td><code>131125</code></td><td>河北省</td><td>衡水市</td><td>安平县</td></tr>
    <tr><td><code>131126</code></td><td>河北省</td><td>衡水市</td><td>故城县</td></tr>
    <tr><td><code>131127</code></td><td>河北省</td><td>衡水市</td><td>景县</td></tr>
    <tr><td><code>131128</code></td><td>河北省</td><td>衡水市</td><td>阜城县</td></tr>
    <tr><td><code>131182</code></td><td>河北省</td><td>衡水市</td><td>深州市</td></tr>
    <tr><td><code>139001</code></td><td>河北省</td><td>定州市</td><td>定州市</td></tr>
    <tr><td><code>139002</code></td><td>河北省</td><td>辛集市</td><td>辛集市</td></tr>
  </tbody>
</table>
</div>


## 山西省（140000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>140000</code></td><td>山西省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>140100</code></td><td>山西省</td><td>太原市</td><td></td></tr>
    <tr><td><code>140105</code></td><td>山西省</td><td>太原市</td><td>小店区</td></tr>
    <tr><td><code>140106</code></td><td>山西省</td><td>太原市</td><td>迎泽区</td></tr>
    <tr><td><code>140107</code></td><td>山西省</td><td>太原市</td><td>杏花岭区</td></tr>
    <tr><td><code>140108</code></td><td>山西省</td><td>太原市</td><td>尖草坪区</td></tr>
    <tr><td><code>140109</code></td><td>山西省</td><td>太原市</td><td>万柏林区</td></tr>
    <tr><td><code>140110</code></td><td>山西省</td><td>太原市</td><td>晋源区</td></tr>
    <tr><td><code>140121</code></td><td>山西省</td><td>太原市</td><td>清徐县</td></tr>
    <tr><td><code>140122</code></td><td>山西省</td><td>太原市</td><td>阳曲县</td></tr>
    <tr><td><code>140123</code></td><td>山西省</td><td>太原市</td><td>娄烦县</td></tr>
    <tr><td><code>140181</code></td><td>山西省</td><td>太原市</td><td>古交市</td></tr>
    <tr class="level-city"><td><code>140200</code></td><td>山西省</td><td>大同市</td><td></td></tr>
    <tr><td><code>140202</code></td><td>山西省</td><td>大同市</td><td>城区</td></tr>
    <tr><td><code>140203</code></td><td>山西省</td><td>大同市</td><td>矿区</td></tr>
    <tr><td><code>140211</code></td><td>山西省</td><td>大同市</td><td>南郊区</td></tr>
    <tr><td><code>140212</code></td><td>山西省</td><td>大同市</td><td>新荣区</td></tr>
    <tr><td><code>140221</code></td><td>山西省</td><td>大同市</td><td>阳高县</td></tr>
    <tr><td><code>140222</code></td><td>山西省</td><td>大同市</td><td>天镇县</td></tr>
    <tr><td><code>140223</code></td><td>山西省</td><td>大同市</td><td>广灵县</td></tr>
    <tr><td><code>140224</code></td><td>山西省</td><td>大同市</td><td>灵丘县</td></tr>
    <tr><td><code>140225</code></td><td>山西省</td><td>大同市</td><td>浑源县</td></tr>
    <tr><td><code>140226</code></td><td>山西省</td><td>大同市</td><td>左云县</td></tr>
    <tr><td><code>140227</code></td><td>山西省</td><td>大同市</td><td>大同县</td></tr>
    <tr class="level-city"><td><code>140300</code></td><td>山西省</td><td>阳泉市</td><td></td></tr>
    <tr><td><code>140302</code></td><td>山西省</td><td>阳泉市</td><td>城区</td></tr>
    <tr><td><code>140303</code></td><td>山西省</td><td>阳泉市</td><td>矿区</td></tr>
    <tr><td><code>140311</code></td><td>山西省</td><td>阳泉市</td><td>郊区</td></tr>
    <tr><td><code>140321</code></td><td>山西省</td><td>阳泉市</td><td>平定县</td></tr>
    <tr><td><code>140322</code></td><td>山西省</td><td>阳泉市</td><td>盂县</td></tr>
    <tr class="level-city"><td><code>140400</code></td><td>山西省</td><td>长治市</td><td></td></tr>
    <tr><td><code>140402</code></td><td>山西省</td><td>长治市</td><td>城区</td></tr>
    <tr><td><code>140411</code></td><td>山西省</td><td>长治市</td><td>郊区</td></tr>
    <tr><td><code>140421</code></td><td>山西省</td><td>长治市</td><td>长治县</td></tr>
    <tr><td><code>140423</code></td><td>山西省</td><td>长治市</td><td>襄垣县</td></tr>
    <tr><td><code>140424</code></td><td>山西省</td><td>长治市</td><td>屯留县</td></tr>
    <tr><td><code>140425</code></td><td>山西省</td><td>长治市</td><td>平顺县</td></tr>
    <tr><td><code>140426</code></td><td>山西省</td><td>长治市</td><td>黎城县</td></tr>
    <tr><td><code>140427</code></td><td>山西省</td><td>长治市</td><td>壶关县</td></tr>
    <tr><td><code>140428</code></td><td>山西省</td><td>长治市</td><td>长子县</td></tr>
    <tr><td><code>140429</code></td><td>山西省</td><td>长治市</td><td>武乡县</td></tr>
    <tr><td><code>140430</code></td><td>山西省</td><td>长治市</td><td>沁县</td></tr>
    <tr><td><code>140431</code></td><td>山西省</td><td>长治市</td><td>沁源县</td></tr>
    <tr><td><code>140481</code></td><td>山西省</td><td>长治市</td><td>潞城市</td></tr>
    <tr class="level-city"><td><code>140500</code></td><td>山西省</td><td>晋城市</td><td></td></tr>
    <tr><td><code>140502</code></td><td>山西省</td><td>晋城市</td><td>城区</td></tr>
    <tr><td><code>140521</code></td><td>山西省</td><td>晋城市</td><td>沁水县</td></tr>
    <tr><td><code>140522</code></td><td>山西省</td><td>晋城市</td><td>阳城县</td></tr>
    <tr><td><code>140524</code></td><td>山西省</td><td>晋城市</td><td>陵川县</td></tr>
    <tr><td><code>140525</code></td><td>山西省</td><td>晋城市</td><td>泽州县</td></tr>
    <tr><td><code>140581</code></td><td>山西省</td><td>晋城市</td><td>高平市</td></tr>
    <tr class="level-city"><td><code>140600</code></td><td>山西省</td><td>朔州市</td><td></td></tr>
    <tr><td><code>140602</code></td><td>山西省</td><td>朔州市</td><td>朔城区</td></tr>
    <tr><td><code>140603</code></td><td>山西省</td><td>朔州市</td><td>平鲁区</td></tr>
    <tr><td><code>140621</code></td><td>山西省</td><td>朔州市</td><td>山阴县</td></tr>
    <tr><td><code>140622</code></td><td>山西省</td><td>朔州市</td><td>应县</td></tr>
    <tr><td><code>140623</code></td><td>山西省</td><td>朔州市</td><td>右玉县</td></tr>
    <tr><td><code>140624</code></td><td>山西省</td><td>朔州市</td><td>怀仁县</td></tr>
    <tr class="level-city"><td><code>140700</code></td><td>山西省</td><td>晋中市</td><td></td></tr>
    <tr><td><code>140702</code></td><td>山西省</td><td>晋中市</td><td>榆次区</td></tr>
    <tr><td><code>140721</code></td><td>山西省</td><td>晋中市</td><td>榆社县</td></tr>
    <tr><td><code>140722</code></td><td>山西省</td><td>晋中市</td><td>左权县</td></tr>
    <tr><td><code>140723</code></td><td>山西省</td><td>晋中市</td><td>和顺县</td></tr>
    <tr><td><code>140724</code></td><td>山西省</td><td>晋中市</td><td>昔阳县</td></tr>
    <tr><td><code>140725</code></td><td>山西省</td><td>晋中市</td><td>寿阳县</td></tr>
    <tr><td><code>140726</code></td><td>山西省</td><td>晋中市</td><td>太谷县</td></tr>
    <tr><td><code>140727</code></td><td>山西省</td><td>晋中市</td><td>祁县</td></tr>
    <tr><td><code>140728</code></td><td>山西省</td><td>晋中市</td><td>平遥县</td></tr>
    <tr><td><code>140729</code></td><td>山西省</td><td>晋中市</td><td>灵石县</td></tr>
    <tr><td><code>140781</code></td><td>山西省</td><td>晋中市</td><td>介休市</td></tr>
    <tr class="level-city"><td><code>140800</code></td><td>山西省</td><td>运城市</td><td></td></tr>
    <tr><td><code>140802</code></td><td>山西省</td><td>运城市</td><td>盐湖区</td></tr>
    <tr><td><code>140821</code></td><td>山西省</td><td>运城市</td><td>临猗县</td></tr>
    <tr><td><code>140822</code></td><td>山西省</td><td>运城市</td><td>万荣县</td></tr>
    <tr><td><code>140823</code></td><td>山西省</td><td>运城市</td><td>闻喜县</td></tr>
    <tr><td><code>140824</code></td><td>山西省</td><td>运城市</td><td>稷山县</td></tr>
    <tr><td><code>140825</code></td><td>山西省</td><td>运城市</td><td>新绛县</td></tr>
    <tr><td><code>140826</code></td><td>山西省</td><td>运城市</td><td>绛县</td></tr>
    <tr><td><code>140827</code></td><td>山西省</td><td>运城市</td><td>垣曲县</td></tr>
    <tr><td><code>140828</code></td><td>山西省</td><td>运城市</td><td>夏县</td></tr>
    <tr><td><code>140829</code></td><td>山西省</td><td>运城市</td><td>平陆县</td></tr>
    <tr><td><code>140830</code></td><td>山西省</td><td>运城市</td><td>芮城县</td></tr>
    <tr><td><code>140881</code></td><td>山西省</td><td>运城市</td><td>永济市</td></tr>
    <tr><td><code>140882</code></td><td>山西省</td><td>运城市</td><td>河津市</td></tr>
    <tr class="level-city"><td><code>140900</code></td><td>山西省</td><td>忻州市</td><td></td></tr>
    <tr><td><code>140902</code></td><td>山西省</td><td>忻州市</td><td>忻府区</td></tr>
    <tr><td><code>140921</code></td><td>山西省</td><td>忻州市</td><td>定襄县</td></tr>
    <tr><td><code>140922</code></td><td>山西省</td><td>忻州市</td><td>五台县</td></tr>
    <tr><td><code>140923</code></td><td>山西省</td><td>忻州市</td><td>代县</td></tr>
    <tr><td><code>140924</code></td><td>山西省</td><td>忻州市</td><td>繁峙县</td></tr>
    <tr><td><code>140925</code></td><td>山西省</td><td>忻州市</td><td>宁武县</td></tr>
    <tr><td><code>140926</code></td><td>山西省</td><td>忻州市</td><td>静乐县</td></tr>
    <tr><td><code>140927</code></td><td>山西省</td><td>忻州市</td><td>神池县</td></tr>
    <tr><td><code>140928</code></td><td>山西省</td><td>忻州市</td><td>五寨县</td></tr>
    <tr><td><code>140929</code></td><td>山西省</td><td>忻州市</td><td>岢岚县</td></tr>
    <tr><td><code>140930</code></td><td>山西省</td><td>忻州市</td><td>河曲县</td></tr>
    <tr><td><code>140931</code></td><td>山西省</td><td>忻州市</td><td>保德县</td></tr>
    <tr><td><code>140932</code></td><td>山西省</td><td>忻州市</td><td>偏关县</td></tr>
    <tr><td><code>140981</code></td><td>山西省</td><td>忻州市</td><td>原平市</td></tr>
    <tr class="level-city"><td><code>141000</code></td><td>山西省</td><td>临汾市</td><td></td></tr>
    <tr><td><code>141002</code></td><td>山西省</td><td>临汾市</td><td>尧都区</td></tr>
    <tr><td><code>141021</code></td><td>山西省</td><td>临汾市</td><td>曲沃县</td></tr>
    <tr><td><code>141022</code></td><td>山西省</td><td>临汾市</td><td>翼城县</td></tr>
    <tr><td><code>141023</code></td><td>山西省</td><td>临汾市</td><td>襄汾县</td></tr>
    <tr><td><code>141024</code></td><td>山西省</td><td>临汾市</td><td>洪洞县</td></tr>
    <tr><td><code>141025</code></td><td>山西省</td><td>临汾市</td><td>古县</td></tr>
    <tr><td><code>141026</code></td><td>山西省</td><td>临汾市</td><td>安泽县</td></tr>
    <tr><td><code>141027</code></td><td>山西省</td><td>临汾市</td><td>浮山县</td></tr>
    <tr><td><code>141028</code></td><td>山西省</td><td>临汾市</td><td>吉县</td></tr>
    <tr><td><code>141029</code></td><td>山西省</td><td>临汾市</td><td>乡宁县</td></tr>
    <tr><td><code>141030</code></td><td>山西省</td><td>临汾市</td><td>大宁县</td></tr>
    <tr><td><code>141031</code></td><td>山西省</td><td>临汾市</td><td>隰县</td></tr>
    <tr><td><code>141032</code></td><td>山西省</td><td>临汾市</td><td>永和县</td></tr>
    <tr><td><code>141033</code></td><td>山西省</td><td>临汾市</td><td>蒲县</td></tr>
    <tr><td><code>141034</code></td><td>山西省</td><td>临汾市</td><td>汾西县</td></tr>
    <tr><td><code>141081</code></td><td>山西省</td><td>临汾市</td><td>侯马市</td></tr>
    <tr><td><code>141082</code></td><td>山西省</td><td>临汾市</td><td>霍州市</td></tr>
    <tr class="level-city"><td><code>141100</code></td><td>山西省</td><td>吕梁市</td><td></td></tr>
    <tr><td><code>141102</code></td><td>山西省</td><td>吕梁市</td><td>离石区</td></tr>
    <tr><td><code>141121</code></td><td>山西省</td><td>吕梁市</td><td>文水县</td></tr>
    <tr><td><code>141122</code></td><td>山西省</td><td>吕梁市</td><td>交城县</td></tr>
    <tr><td><code>141123</code></td><td>山西省</td><td>吕梁市</td><td>兴县</td></tr>
    <tr><td><code>141124</code></td><td>山西省</td><td>吕梁市</td><td>临县</td></tr>
    <tr><td><code>141125</code></td><td>山西省</td><td>吕梁市</td><td>柳林县</td></tr>
    <tr><td><code>141126</code></td><td>山西省</td><td>吕梁市</td><td>石楼县</td></tr>
    <tr><td><code>141127</code></td><td>山西省</td><td>吕梁市</td><td>岚县</td></tr>
    <tr><td><code>141128</code></td><td>山西省</td><td>吕梁市</td><td>方山县</td></tr>
    <tr><td><code>141129</code></td><td>山西省</td><td>吕梁市</td><td>中阳县</td></tr>
    <tr><td><code>141130</code></td><td>山西省</td><td>吕梁市</td><td>交口县</td></tr>
    <tr><td><code>141181</code></td><td>山西省</td><td>吕梁市</td><td>孝义市</td></tr>
    <tr><td><code>141182</code></td><td>山西省</td><td>吕梁市</td><td>汾阳市</td></tr>
  </tbody>
</table>
</div>


## 内蒙古自治区（150000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>150000</code></td><td>内蒙古自治区</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>150100</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td></td></tr>
    <tr><td><code>150102</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>新城区</td></tr>
    <tr><td><code>150103</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>回民区</td></tr>
    <tr><td><code>150104</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>玉泉区</td></tr>
    <tr><td><code>150105</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>赛罕区</td></tr>
    <tr><td><code>150121</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>土默特左旗</td></tr>
    <tr><td><code>150122</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>托克托县</td></tr>
    <tr><td><code>150123</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>和林格尔县</td></tr>
    <tr><td><code>150124</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>清水河县</td></tr>
    <tr><td><code>150125</code></td><td>内蒙古自治区</td><td>呼和浩特市</td><td>武川县</td></tr>
    <tr class="level-city"><td><code>150200</code></td><td>内蒙古自治区</td><td>包头市</td><td></td></tr>
    <tr><td><code>150202</code></td><td>内蒙古自治区</td><td>包头市</td><td>东河区</td></tr>
    <tr><td><code>150203</code></td><td>内蒙古自治区</td><td>包头市</td><td>昆都仑区</td></tr>
    <tr><td><code>150204</code></td><td>内蒙古自治区</td><td>包头市</td><td>青山区</td></tr>
    <tr><td><code>150205</code></td><td>内蒙古自治区</td><td>包头市</td><td>石拐区</td></tr>
    <tr><td><code>150206</code></td><td>内蒙古自治区</td><td>包头市</td><td>白云鄂博矿区</td></tr>
    <tr><td><code>150207</code></td><td>内蒙古自治区</td><td>包头市</td><td>九原区</td></tr>
    <tr><td><code>150221</code></td><td>内蒙古自治区</td><td>包头市</td><td>土默特右旗</td></tr>
    <tr><td><code>150222</code></td><td>内蒙古自治区</td><td>包头市</td><td>固阳县</td></tr>
    <tr><td><code>150223</code></td><td>内蒙古自治区</td><td>包头市</td><td>达尔罕茂明安联合旗</td></tr>
    <tr class="level-city"><td><code>150300</code></td><td>内蒙古自治区</td><td>乌海市</td><td></td></tr>
    <tr><td><code>150302</code></td><td>内蒙古自治区</td><td>乌海市</td><td>海勃湾区</td></tr>
    <tr><td><code>150303</code></td><td>内蒙古自治区</td><td>乌海市</td><td>海南区</td></tr>
    <tr><td><code>150304</code></td><td>内蒙古自治区</td><td>乌海市</td><td>乌达区</td></tr>
    <tr class="level-city"><td><code>150400</code></td><td>内蒙古自治区</td><td>赤峰市</td><td></td></tr>
    <tr><td><code>150402</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>红山区</td></tr>
    <tr><td><code>150403</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>元宝山区</td></tr>
    <tr><td><code>150404</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>松山区</td></tr>
    <tr><td><code>150421</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>阿鲁科尔沁旗</td></tr>
    <tr><td><code>150422</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>巴林左旗</td></tr>
    <tr><td><code>150423</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>巴林右旗</td></tr>
    <tr><td><code>150424</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>林西县</td></tr>
    <tr><td><code>150425</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>克什克腾旗</td></tr>
    <tr><td><code>150426</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>翁牛特旗</td></tr>
    <tr><td><code>150428</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>喀喇沁旗</td></tr>
    <tr><td><code>150429</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>宁城县</td></tr>
    <tr><td><code>150430</code></td><td>内蒙古自治区</td><td>赤峰市</td><td>敖汉旗</td></tr>
    <tr class="level-city"><td><code>150500</code></td><td>内蒙古自治区</td><td>通辽市</td><td></td></tr>
    <tr><td><code>150502</code></td><td>内蒙古自治区</td><td>通辽市</td><td>科尔沁区</td></tr>
    <tr><td><code>150521</code></td><td>内蒙古自治区</td><td>通辽市</td><td>科尔沁左翼中旗</td></tr>
    <tr><td><code>150522</code></td><td>内蒙古自治区</td><td>通辽市</td><td>科尔沁左翼后旗</td></tr>
    <tr><td><code>150523</code></td><td>内蒙古自治区</td><td>通辽市</td><td>开鲁县</td></tr>
    <tr><td><code>150524</code></td><td>内蒙古自治区</td><td>通辽市</td><td>库伦旗</td></tr>
    <tr><td><code>150525</code></td><td>内蒙古自治区</td><td>通辽市</td><td>奈曼旗</td></tr>
    <tr><td><code>150526</code></td><td>内蒙古自治区</td><td>通辽市</td><td>扎鲁特旗</td></tr>
    <tr><td><code>150581</code></td><td>内蒙古自治区</td><td>通辽市</td><td>霍林郭勒市</td></tr>
    <tr class="level-city"><td><code>150600</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td></td></tr>
    <tr><td><code>150602</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>东胜区</td></tr>
    <tr><td><code>150603</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>康巴什区</td></tr>
    <tr><td><code>150621</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>达拉特旗</td></tr>
    <tr><td><code>150622</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>准格尔旗</td></tr>
    <tr><td><code>150623</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>鄂托克前旗</td></tr>
    <tr><td><code>150624</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>鄂托克旗</td></tr>
    <tr><td><code>150625</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>杭锦旗</td></tr>
    <tr><td><code>150626</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>乌审旗</td></tr>
    <tr><td><code>150627</code></td><td>内蒙古自治区</td><td>鄂尔多斯市</td><td>伊金霍洛旗</td></tr>
    <tr class="level-city"><td><code>150700</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td></td></tr>
    <tr><td><code>150702</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>海拉尔区</td></tr>
    <tr><td><code>150703</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>扎赉诺尔区</td></tr>
    <tr><td><code>150721</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>阿荣旗</td></tr>
    <tr><td><code>150722</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>莫力达瓦达斡尔族自治旗</td></tr>
    <tr><td><code>150723</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>鄂伦春自治旗</td></tr>
    <tr><td><code>150724</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>鄂温克族自治旗</td></tr>
    <tr><td><code>150725</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>陈巴尔虎旗</td></tr>
    <tr><td><code>150726</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>新巴尔虎左旗</td></tr>
    <tr><td><code>150727</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>新巴尔虎右旗</td></tr>
    <tr><td><code>150781</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>满洲里市</td></tr>
    <tr><td><code>150782</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>牙克石市</td></tr>
    <tr><td><code>150783</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>扎兰屯市</td></tr>
    <tr><td><code>150784</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>额尔古纳市</td></tr>
    <tr><td><code>150785</code></td><td>内蒙古自治区</td><td>呼伦贝尔市</td><td>根河市</td></tr>
    <tr class="level-city"><td><code>150800</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td></td></tr>
    <tr><td><code>150802</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>临河区</td></tr>
    <tr><td><code>150821</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>五原县</td></tr>
    <tr><td><code>150822</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>磴口县</td></tr>
    <tr><td><code>150823</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>乌拉特前旗</td></tr>
    <tr><td><code>150824</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>乌拉特中旗</td></tr>
    <tr><td><code>150825</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>乌拉特后旗</td></tr>
    <tr><td><code>150826</code></td><td>内蒙古自治区</td><td>巴彦淖尔市</td><td>杭锦后旗</td></tr>
    <tr class="level-city"><td><code>150900</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td></td></tr>
    <tr><td><code>150902</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>集宁区</td></tr>
    <tr><td><code>150921</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>卓资县</td></tr>
    <tr><td><code>150922</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>化德县</td></tr>
    <tr><td><code>150923</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>商都县</td></tr>
    <tr><td><code>150924</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>兴和县</td></tr>
    <tr><td><code>150925</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>凉城县</td></tr>
    <tr><td><code>150926</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>察哈尔右翼前旗</td></tr>
    <tr><td><code>150927</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>察哈尔右翼中旗</td></tr>
    <tr><td><code>150928</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>察哈尔右翼后旗</td></tr>
    <tr><td><code>150929</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>四子王旗</td></tr>
    <tr><td><code>150981</code></td><td>内蒙古自治区</td><td>乌兰察布市</td><td>丰镇市</td></tr>
    <tr class="level-city"><td><code>152200</code></td><td>内蒙古自治区</td><td>兴安盟</td><td></td></tr>
    <tr><td><code>152201</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>乌兰浩特市</td></tr>
    <tr><td><code>152202</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>阿尔山市</td></tr>
    <tr><td><code>152221</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>科尔沁右翼前旗</td></tr>
    <tr><td><code>152222</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>科尔沁右翼中旗</td></tr>
    <tr><td><code>152223</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>扎赉特旗</td></tr>
    <tr><td><code>152224</code></td><td>内蒙古自治区</td><td>兴安盟</td><td>突泉县</td></tr>
    <tr class="level-city"><td><code>152500</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td></td></tr>
    <tr><td><code>152501</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>二连浩特市</td></tr>
    <tr><td><code>152502</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>锡林浩特市</td></tr>
    <tr><td><code>152522</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>阿巴嘎旗</td></tr>
    <tr><td><code>152523</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>苏尼特左旗</td></tr>
    <tr><td><code>152524</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>苏尼特右旗</td></tr>
    <tr><td><code>152525</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>东乌珠穆沁旗</td></tr>
    <tr><td><code>152526</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>西乌珠穆沁旗</td></tr>
    <tr><td><code>152527</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>太仆寺旗</td></tr>
    <tr><td><code>152528</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>镶黄旗</td></tr>
    <tr><td><code>152529</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>正镶白旗</td></tr>
    <tr><td><code>152530</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>正蓝旗</td></tr>
    <tr><td><code>152531</code></td><td>内蒙古自治区</td><td>锡林郭勒盟</td><td>多伦县</td></tr>
    <tr class="level-city"><td><code>152900</code></td><td>内蒙古自治区</td><td>阿拉善盟</td><td></td></tr>
    <tr><td><code>152921</code></td><td>内蒙古自治区</td><td>阿拉善盟</td><td>阿拉善左旗</td></tr>
    <tr><td><code>152922</code></td><td>内蒙古自治区</td><td>阿拉善盟</td><td>阿拉善右旗</td></tr>
    <tr><td><code>152923</code></td><td>内蒙古自治区</td><td>阿拉善盟</td><td>额济纳旗</td></tr>
  </tbody>
</table>
</div>


## 辽宁省（210000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>210000</code></td><td>辽宁省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>210100</code></td><td>辽宁省</td><td>沈阳市</td><td></td></tr>
    <tr><td><code>210102</code></td><td>辽宁省</td><td>沈阳市</td><td>和平区</td></tr>
    <tr><td><code>210103</code></td><td>辽宁省</td><td>沈阳市</td><td>沈河区</td></tr>
    <tr><td><code>210104</code></td><td>辽宁省</td><td>沈阳市</td><td>大东区</td></tr>
    <tr><td><code>210105</code></td><td>辽宁省</td><td>沈阳市</td><td>皇姑区</td></tr>
    <tr><td><code>210106</code></td><td>辽宁省</td><td>沈阳市</td><td>铁西区</td></tr>
    <tr><td><code>210111</code></td><td>辽宁省</td><td>沈阳市</td><td>苏家屯区</td></tr>
    <tr><td><code>210112</code></td><td>辽宁省</td><td>沈阳市</td><td>浑南区</td></tr>
    <tr><td><code>210113</code></td><td>辽宁省</td><td>沈阳市</td><td>沈北新区</td></tr>
    <tr><td><code>210114</code></td><td>辽宁省</td><td>沈阳市</td><td>于洪区</td></tr>
    <tr><td><code>210115</code></td><td>辽宁省</td><td>沈阳市</td><td>辽中区</td></tr>
    <tr><td><code>210123</code></td><td>辽宁省</td><td>沈阳市</td><td>康平县</td></tr>
    <tr><td><code>210124</code></td><td>辽宁省</td><td>沈阳市</td><td>法库县</td></tr>
    <tr><td><code>210181</code></td><td>辽宁省</td><td>沈阳市</td><td>新民市</td></tr>
    <tr class="level-city"><td><code>210200</code></td><td>辽宁省</td><td>大连市</td><td></td></tr>
    <tr><td><code>210202</code></td><td>辽宁省</td><td>大连市</td><td>中山区</td></tr>
    <tr><td><code>210203</code></td><td>辽宁省</td><td>大连市</td><td>西岗区</td></tr>
    <tr><td><code>210204</code></td><td>辽宁省</td><td>大连市</td><td>沙河口区</td></tr>
    <tr><td><code>210211</code></td><td>辽宁省</td><td>大连市</td><td>甘井子区</td></tr>
    <tr><td><code>210212</code></td><td>辽宁省</td><td>大连市</td><td>旅顺口区</td></tr>
    <tr><td><code>210213</code></td><td>辽宁省</td><td>大连市</td><td>金州区</td></tr>
    <tr><td><code>210214</code></td><td>辽宁省</td><td>大连市</td><td>普兰店区</td></tr>
    <tr><td><code>210224</code></td><td>辽宁省</td><td>大连市</td><td>长海县</td></tr>
    <tr><td><code>210281</code></td><td>辽宁省</td><td>大连市</td><td>瓦房店市</td></tr>
    <tr><td><code>210283</code></td><td>辽宁省</td><td>大连市</td><td>庄河市</td></tr>
    <tr class="level-city"><td><code>210300</code></td><td>辽宁省</td><td>鞍山市</td><td></td></tr>
    <tr><td><code>210302</code></td><td>辽宁省</td><td>鞍山市</td><td>铁东区</td></tr>
    <tr><td><code>210303</code></td><td>辽宁省</td><td>鞍山市</td><td>铁西区</td></tr>
    <tr><td><code>210304</code></td><td>辽宁省</td><td>鞍山市</td><td>立山区</td></tr>
    <tr><td><code>210311</code></td><td>辽宁省</td><td>鞍山市</td><td>千山区</td></tr>
    <tr><td><code>210321</code></td><td>辽宁省</td><td>鞍山市</td><td>台安县</td></tr>
    <tr><td><code>210323</code></td><td>辽宁省</td><td>鞍山市</td><td>岫岩满族自治县</td></tr>
    <tr><td><code>210381</code></td><td>辽宁省</td><td>鞍山市</td><td>海城市</td></tr>
    <tr class="level-city"><td><code>210400</code></td><td>辽宁省</td><td>抚顺市</td><td></td></tr>
    <tr><td><code>210402</code></td><td>辽宁省</td><td>抚顺市</td><td>新抚区</td></tr>
    <tr><td><code>210403</code></td><td>辽宁省</td><td>抚顺市</td><td>东洲区</td></tr>
    <tr><td><code>210404</code></td><td>辽宁省</td><td>抚顺市</td><td>望花区</td></tr>
    <tr><td><code>210411</code></td><td>辽宁省</td><td>抚顺市</td><td>顺城区</td></tr>
    <tr><td><code>210421</code></td><td>辽宁省</td><td>抚顺市</td><td>抚顺县</td></tr>
    <tr><td><code>210422</code></td><td>辽宁省</td><td>抚顺市</td><td>新宾满族自治县</td></tr>
    <tr><td><code>210423</code></td><td>辽宁省</td><td>抚顺市</td><td>清原满族自治县</td></tr>
    <tr class="level-city"><td><code>210500</code></td><td>辽宁省</td><td>本溪市</td><td></td></tr>
    <tr><td><code>210502</code></td><td>辽宁省</td><td>本溪市</td><td>平山区</td></tr>
    <tr><td><code>210503</code></td><td>辽宁省</td><td>本溪市</td><td>溪湖区</td></tr>
    <tr><td><code>210504</code></td><td>辽宁省</td><td>本溪市</td><td>明山区</td></tr>
    <tr><td><code>210505</code></td><td>辽宁省</td><td>本溪市</td><td>南芬区</td></tr>
    <tr><td><code>210521</code></td><td>辽宁省</td><td>本溪市</td><td>本溪满族自治县</td></tr>
    <tr><td><code>210522</code></td><td>辽宁省</td><td>本溪市</td><td>桓仁满族自治县</td></tr>
    <tr class="level-city"><td><code>210600</code></td><td>辽宁省</td><td>丹东市</td><td></td></tr>
    <tr><td><code>210602</code></td><td>辽宁省</td><td>丹东市</td><td>元宝区</td></tr>
    <tr><td><code>210603</code></td><td>辽宁省</td><td>丹东市</td><td>振兴区</td></tr>
    <tr><td><code>210604</code></td><td>辽宁省</td><td>丹东市</td><td>振安区</td></tr>
    <tr><td><code>210624</code></td><td>辽宁省</td><td>丹东市</td><td>宽甸满族自治县</td></tr>
    <tr><td><code>210681</code></td><td>辽宁省</td><td>丹东市</td><td>东港市</td></tr>
    <tr><td><code>210682</code></td><td>辽宁省</td><td>丹东市</td><td>凤城市</td></tr>
    <tr class="level-city"><td><code>210700</code></td><td>辽宁省</td><td>锦州市</td><td></td></tr>
    <tr><td><code>210702</code></td><td>辽宁省</td><td>锦州市</td><td>古塔区</td></tr>
    <tr><td><code>210703</code></td><td>辽宁省</td><td>锦州市</td><td>凌河区</td></tr>
    <tr><td><code>210711</code></td><td>辽宁省</td><td>锦州市</td><td>太和区</td></tr>
    <tr><td><code>210726</code></td><td>辽宁省</td><td>锦州市</td><td>黑山县</td></tr>
    <tr><td><code>210727</code></td><td>辽宁省</td><td>锦州市</td><td>义县</td></tr>
    <tr><td><code>210781</code></td><td>辽宁省</td><td>锦州市</td><td>凌海市</td></tr>
    <tr><td><code>210782</code></td><td>辽宁省</td><td>锦州市</td><td>北镇市</td></tr>
    <tr class="level-city"><td><code>210800</code></td><td>辽宁省</td><td>营口市</td><td></td></tr>
    <tr><td><code>210802</code></td><td>辽宁省</td><td>营口市</td><td>站前区</td></tr>
    <tr><td><code>210803</code></td><td>辽宁省</td><td>营口市</td><td>西市区</td></tr>
    <tr><td><code>210804</code></td><td>辽宁省</td><td>营口市</td><td>鲅鱼圈区</td></tr>
    <tr><td><code>210811</code></td><td>辽宁省</td><td>营口市</td><td>老边区</td></tr>
    <tr><td><code>210881</code></td><td>辽宁省</td><td>营口市</td><td>盖州市</td></tr>
    <tr><td><code>210882</code></td><td>辽宁省</td><td>营口市</td><td>大石桥市</td></tr>
    <tr class="level-city"><td><code>210900</code></td><td>辽宁省</td><td>阜新市</td><td></td></tr>
    <tr><td><code>210902</code></td><td>辽宁省</td><td>阜新市</td><td>海州区</td></tr>
    <tr><td><code>210903</code></td><td>辽宁省</td><td>阜新市</td><td>新邱区</td></tr>
    <tr><td><code>210904</code></td><td>辽宁省</td><td>阜新市</td><td>太平区</td></tr>
    <tr><td><code>210905</code></td><td>辽宁省</td><td>阜新市</td><td>清河门区</td></tr>
    <tr><td><code>210911</code></td><td>辽宁省</td><td>阜新市</td><td>细河区</td></tr>
    <tr><td><code>210921</code></td><td>辽宁省</td><td>阜新市</td><td>阜新蒙古族自治县</td></tr>
    <tr><td><code>210922</code></td><td>辽宁省</td><td>阜新市</td><td>彰武县</td></tr>
    <tr class="level-city"><td><code>211000</code></td><td>辽宁省</td><td>辽阳市</td><td></td></tr>
    <tr><td><code>211002</code></td><td>辽宁省</td><td>辽阳市</td><td>白塔区</td></tr>
    <tr><td><code>211003</code></td><td>辽宁省</td><td>辽阳市</td><td>文圣区</td></tr>
    <tr><td><code>211004</code></td><td>辽宁省</td><td>辽阳市</td><td>宏伟区</td></tr>
    <tr><td><code>211005</code></td><td>辽宁省</td><td>辽阳市</td><td>弓长岭区</td></tr>
    <tr><td><code>211011</code></td><td>辽宁省</td><td>辽阳市</td><td>太子河区</td></tr>
    <tr><td><code>211021</code></td><td>辽宁省</td><td>辽阳市</td><td>辽阳县</td></tr>
    <tr><td><code>211081</code></td><td>辽宁省</td><td>辽阳市</td><td>灯塔市</td></tr>
    <tr class="level-city"><td><code>211100</code></td><td>辽宁省</td><td>盘锦市</td><td></td></tr>
    <tr><td><code>211102</code></td><td>辽宁省</td><td>盘锦市</td><td>双台子区</td></tr>
    <tr><td><code>211103</code></td><td>辽宁省</td><td>盘锦市</td><td>兴隆台区</td></tr>
    <tr><td><code>211104</code></td><td>辽宁省</td><td>盘锦市</td><td>大洼区</td></tr>
    <tr><td><code>211122</code></td><td>辽宁省</td><td>盘锦市</td><td>盘山县</td></tr>
    <tr class="level-city"><td><code>211200</code></td><td>辽宁省</td><td>铁岭市</td><td></td></tr>
    <tr><td><code>211202</code></td><td>辽宁省</td><td>铁岭市</td><td>银州区</td></tr>
    <tr><td><code>211204</code></td><td>辽宁省</td><td>铁岭市</td><td>清河区</td></tr>
    <tr><td><code>211221</code></td><td>辽宁省</td><td>铁岭市</td><td>铁岭县</td></tr>
    <tr><td><code>211223</code></td><td>辽宁省</td><td>铁岭市</td><td>西丰县</td></tr>
    <tr><td><code>211224</code></td><td>辽宁省</td><td>铁岭市</td><td>昌图县</td></tr>
    <tr><td><code>211281</code></td><td>辽宁省</td><td>铁岭市</td><td>调兵山市</td></tr>
    <tr><td><code>211282</code></td><td>辽宁省</td><td>铁岭市</td><td>开原市</td></tr>
    <tr class="level-city"><td><code>211300</code></td><td>辽宁省</td><td>朝阳市</td><td></td></tr>
    <tr><td><code>211302</code></td><td>辽宁省</td><td>朝阳市</td><td>双塔区</td></tr>
    <tr><td><code>211303</code></td><td>辽宁省</td><td>朝阳市</td><td>龙城区</td></tr>
    <tr><td><code>211321</code></td><td>辽宁省</td><td>朝阳市</td><td>朝阳县</td></tr>
    <tr><td><code>211322</code></td><td>辽宁省</td><td>朝阳市</td><td>建平县</td></tr>
    <tr><td><code>211324</code></td><td>辽宁省</td><td>朝阳市</td><td>喀喇沁左翼蒙古族自治县</td></tr>
    <tr><td><code>211381</code></td><td>辽宁省</td><td>朝阳市</td><td>北票市</td></tr>
    <tr><td><code>211382</code></td><td>辽宁省</td><td>朝阳市</td><td>凌源市</td></tr>
    <tr class="level-city"><td><code>211400</code></td><td>辽宁省</td><td>葫芦岛市</td><td></td></tr>
    <tr><td><code>211402</code></td><td>辽宁省</td><td>葫芦岛市</td><td>连山区</td></tr>
    <tr><td><code>211403</code></td><td>辽宁省</td><td>葫芦岛市</td><td>龙港区</td></tr>
    <tr><td><code>211404</code></td><td>辽宁省</td><td>葫芦岛市</td><td>南票区</td></tr>
    <tr><td><code>211421</code></td><td>辽宁省</td><td>葫芦岛市</td><td>绥中县</td></tr>
    <tr><td><code>211422</code></td><td>辽宁省</td><td>葫芦岛市</td><td>建昌县</td></tr>
    <tr><td><code>211481</code></td><td>辽宁省</td><td>葫芦岛市</td><td>兴城市</td></tr>
  </tbody>
</table>
</div>


## 吉林省（220000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>220000</code></td><td>吉林省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>220100</code></td><td>吉林省</td><td>长春市</td><td></td></tr>
    <tr><td><code>220102</code></td><td>吉林省</td><td>长春市</td><td>南关区</td></tr>
    <tr><td><code>220103</code></td><td>吉林省</td><td>长春市</td><td>宽城区</td></tr>
    <tr><td><code>220104</code></td><td>吉林省</td><td>长春市</td><td>朝阳区</td></tr>
    <tr><td><code>220105</code></td><td>吉林省</td><td>长春市</td><td>二道区</td></tr>
    <tr><td><code>220106</code></td><td>吉林省</td><td>长春市</td><td>绿园区</td></tr>
    <tr><td><code>220112</code></td><td>吉林省</td><td>长春市</td><td>双阳区</td></tr>
    <tr><td><code>220113</code></td><td>吉林省</td><td>长春市</td><td>九台区</td></tr>
    <tr><td><code>220122</code></td><td>吉林省</td><td>长春市</td><td>农安县</td></tr>
    <tr><td><code>220182</code></td><td>吉林省</td><td>长春市</td><td>榆树市</td></tr>
    <tr><td><code>220183</code></td><td>吉林省</td><td>长春市</td><td>德惠市</td></tr>
    <tr class="level-city"><td><code>220200</code></td><td>吉林省</td><td>吉林市</td><td></td></tr>
    <tr><td><code>220202</code></td><td>吉林省</td><td>吉林市</td><td>昌邑区</td></tr>
    <tr><td><code>220203</code></td><td>吉林省</td><td>吉林市</td><td>龙潭区</td></tr>
    <tr><td><code>220204</code></td><td>吉林省</td><td>吉林市</td><td>船营区</td></tr>
    <tr><td><code>220211</code></td><td>吉林省</td><td>吉林市</td><td>丰满区</td></tr>
    <tr><td><code>220221</code></td><td>吉林省</td><td>吉林市</td><td>永吉县</td></tr>
    <tr><td><code>220281</code></td><td>吉林省</td><td>吉林市</td><td>蛟河市</td></tr>
    <tr><td><code>220282</code></td><td>吉林省</td><td>吉林市</td><td>桦甸市</td></tr>
    <tr><td><code>220283</code></td><td>吉林省</td><td>吉林市</td><td>舒兰市</td></tr>
    <tr><td><code>220284</code></td><td>吉林省</td><td>吉林市</td><td>磐石市</td></tr>
    <tr class="level-city"><td><code>220300</code></td><td>吉林省</td><td>四平市</td><td></td></tr>
    <tr><td><code>220302</code></td><td>吉林省</td><td>四平市</td><td>铁西区</td></tr>
    <tr><td><code>220303</code></td><td>吉林省</td><td>四平市</td><td>铁东区</td></tr>
    <tr><td><code>220322</code></td><td>吉林省</td><td>四平市</td><td>梨树县</td></tr>
    <tr><td><code>220323</code></td><td>吉林省</td><td>四平市</td><td>伊通满族自治县</td></tr>
    <tr><td><code>220381</code></td><td>吉林省</td><td>四平市</td><td>公主岭市</td></tr>
    <tr><td><code>220382</code></td><td>吉林省</td><td>四平市</td><td>双辽市</td></tr>
    <tr class="level-city"><td><code>220400</code></td><td>吉林省</td><td>辽源市</td><td></td></tr>
    <tr><td><code>220402</code></td><td>吉林省</td><td>辽源市</td><td>龙山区</td></tr>
    <tr><td><code>220403</code></td><td>吉林省</td><td>辽源市</td><td>西安区</td></tr>
    <tr><td><code>220421</code></td><td>吉林省</td><td>辽源市</td><td>东丰县</td></tr>
    <tr><td><code>220422</code></td><td>吉林省</td><td>辽源市</td><td>东辽县</td></tr>
    <tr class="level-city"><td><code>220500</code></td><td>吉林省</td><td>通化市</td><td></td></tr>
    <tr><td><code>220502</code></td><td>吉林省</td><td>通化市</td><td>东昌区</td></tr>
    <tr><td><code>220503</code></td><td>吉林省</td><td>通化市</td><td>二道江区</td></tr>
    <tr><td><code>220521</code></td><td>吉林省</td><td>通化市</td><td>通化县</td></tr>
    <tr><td><code>220523</code></td><td>吉林省</td><td>通化市</td><td>辉南县</td></tr>
    <tr><td><code>220524</code></td><td>吉林省</td><td>通化市</td><td>柳河县</td></tr>
    <tr><td><code>220581</code></td><td>吉林省</td><td>通化市</td><td>梅河口市</td></tr>
    <tr><td><code>220582</code></td><td>吉林省</td><td>通化市</td><td>集安市</td></tr>
    <tr class="level-city"><td><code>220600</code></td><td>吉林省</td><td>白山市</td><td></td></tr>
    <tr><td><code>220602</code></td><td>吉林省</td><td>白山市</td><td>浑江区</td></tr>
    <tr><td><code>220605</code></td><td>吉林省</td><td>白山市</td><td>江源区</td></tr>
    <tr><td><code>220621</code></td><td>吉林省</td><td>白山市</td><td>抚松县</td></tr>
    <tr><td><code>220622</code></td><td>吉林省</td><td>白山市</td><td>靖宇县</td></tr>
    <tr><td><code>220623</code></td><td>吉林省</td><td>白山市</td><td>长白朝鲜族自治县</td></tr>
    <tr><td><code>220681</code></td><td>吉林省</td><td>白山市</td><td>临江市</td></tr>
    <tr class="level-city"><td><code>220700</code></td><td>吉林省</td><td>松原市</td><td></td></tr>
    <tr><td><code>220702</code></td><td>吉林省</td><td>松原市</td><td>宁江区</td></tr>
    <tr><td><code>220721</code></td><td>吉林省</td><td>松原市</td><td>前郭尔罗斯蒙古族自治县</td></tr>
    <tr><td><code>220722</code></td><td>吉林省</td><td>松原市</td><td>长岭县</td></tr>
    <tr><td><code>220723</code></td><td>吉林省</td><td>松原市</td><td>乾安县</td></tr>
    <tr><td><code>220781</code></td><td>吉林省</td><td>松原市</td><td>扶余市</td></tr>
    <tr class="level-city"><td><code>220800</code></td><td>吉林省</td><td>白城市</td><td></td></tr>
    <tr><td><code>220802</code></td><td>吉林省</td><td>白城市</td><td>洮北区</td></tr>
    <tr><td><code>220821</code></td><td>吉林省</td><td>白城市</td><td>镇赉县</td></tr>
    <tr><td><code>220822</code></td><td>吉林省</td><td>白城市</td><td>通榆县</td></tr>
    <tr><td><code>220881</code></td><td>吉林省</td><td>白城市</td><td>洮南市</td></tr>
    <tr><td><code>220882</code></td><td>吉林省</td><td>白城市</td><td>大安市</td></tr>
    <tr class="level-city"><td><code>222400</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td></td></tr>
    <tr><td><code>222401</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>延吉市</td></tr>
    <tr><td><code>222402</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>图们市</td></tr>
    <tr><td><code>222403</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>敦化市</td></tr>
    <tr><td><code>222404</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>珲春市</td></tr>
    <tr><td><code>222405</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>龙井市</td></tr>
    <tr><td><code>222406</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>和龙市</td></tr>
    <tr><td><code>222424</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>汪清县</td></tr>
    <tr><td><code>222426</code></td><td>吉林省</td><td>延边朝鲜族自治州</td><td>安图县</td></tr>
  </tbody>
</table>
</div>


## 黑龙江省（230000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>230000</code></td><td>黑龙江省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>230100</code></td><td>黑龙江省</td><td>哈尔滨市</td><td></td></tr>
    <tr><td><code>230102</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>道里区</td></tr>
    <tr><td><code>230103</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>南岗区</td></tr>
    <tr><td><code>230104</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>道外区</td></tr>
    <tr><td><code>230108</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>平房区</td></tr>
    <tr><td><code>230109</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>松北区</td></tr>
    <tr><td><code>230110</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>香坊区</td></tr>
    <tr><td><code>230111</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>呼兰区</td></tr>
    <tr><td><code>230112</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>阿城区</td></tr>
    <tr><td><code>230113</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>双城区</td></tr>
    <tr><td><code>230123</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>依兰县</td></tr>
    <tr><td><code>230124</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>方正县</td></tr>
    <tr><td><code>230125</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>宾县</td></tr>
    <tr><td><code>230126</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>巴彦县</td></tr>
    <tr><td><code>230127</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>木兰县</td></tr>
    <tr><td><code>230128</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>通河县</td></tr>
    <tr><td><code>230129</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>延寿县</td></tr>
    <tr><td><code>230183</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>尚志市</td></tr>
    <tr><td><code>230184</code></td><td>黑龙江省</td><td>哈尔滨市</td><td>五常市</td></tr>
    <tr class="level-city"><td><code>230200</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td></td></tr>
    <tr><td><code>230202</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>龙沙区</td></tr>
    <tr><td><code>230203</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>建华区</td></tr>
    <tr><td><code>230204</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>铁锋区</td></tr>
    <tr><td><code>230205</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>昂昂溪区</td></tr>
    <tr><td><code>230206</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>富拉尔基区</td></tr>
    <tr><td><code>230207</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>碾子山区</td></tr>
    <tr><td><code>230208</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>梅里斯达斡尔族区</td></tr>
    <tr><td><code>230221</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>龙江县</td></tr>
    <tr><td><code>230223</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>依安县</td></tr>
    <tr><td><code>230224</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>泰来县</td></tr>
    <tr><td><code>230225</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>甘南县</td></tr>
    <tr><td><code>230227</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>富裕县</td></tr>
    <tr><td><code>230229</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>克山县</td></tr>
    <tr><td><code>230230</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>克东县</td></tr>
    <tr><td><code>230231</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>拜泉县</td></tr>
    <tr><td><code>230281</code></td><td>黑龙江省</td><td>齐齐哈尔市</td><td>讷河市</td></tr>
    <tr class="level-city"><td><code>230300</code></td><td>黑龙江省</td><td>鸡西市</td><td></td></tr>
    <tr><td><code>230302</code></td><td>黑龙江省</td><td>鸡西市</td><td>鸡冠区</td></tr>
    <tr><td><code>230303</code></td><td>黑龙江省</td><td>鸡西市</td><td>恒山区</td></tr>
    <tr><td><code>230304</code></td><td>黑龙江省</td><td>鸡西市</td><td>滴道区</td></tr>
    <tr><td><code>230305</code></td><td>黑龙江省</td><td>鸡西市</td><td>梨树区</td></tr>
    <tr><td><code>230306</code></td><td>黑龙江省</td><td>鸡西市</td><td>城子河区</td></tr>
    <tr><td><code>230307</code></td><td>黑龙江省</td><td>鸡西市</td><td>麻山区</td></tr>
    <tr><td><code>230321</code></td><td>黑龙江省</td><td>鸡西市</td><td>鸡东县</td></tr>
    <tr><td><code>230381</code></td><td>黑龙江省</td><td>鸡西市</td><td>虎林市</td></tr>
    <tr><td><code>230382</code></td><td>黑龙江省</td><td>鸡西市</td><td>密山市</td></tr>
    <tr class="level-city"><td><code>230400</code></td><td>黑龙江省</td><td>鹤岗市</td><td></td></tr>
    <tr><td><code>230402</code></td><td>黑龙江省</td><td>鹤岗市</td><td>向阳区</td></tr>
    <tr><td><code>230403</code></td><td>黑龙江省</td><td>鹤岗市</td><td>工农区</td></tr>
    <tr><td><code>230404</code></td><td>黑龙江省</td><td>鹤岗市</td><td>南山区</td></tr>
    <tr><td><code>230405</code></td><td>黑龙江省</td><td>鹤岗市</td><td>兴安区</td></tr>
    <tr><td><code>230406</code></td><td>黑龙江省</td><td>鹤岗市</td><td>东山区</td></tr>
    <tr><td><code>230407</code></td><td>黑龙江省</td><td>鹤岗市</td><td>兴山区</td></tr>
    <tr><td><code>230421</code></td><td>黑龙江省</td><td>鹤岗市</td><td>萝北县</td></tr>
    <tr><td><code>230422</code></td><td>黑龙江省</td><td>鹤岗市</td><td>绥滨县</td></tr>
    <tr class="level-city"><td><code>230500</code></td><td>黑龙江省</td><td>双鸭山市</td><td></td></tr>
    <tr><td><code>230502</code></td><td>黑龙江省</td><td>双鸭山市</td><td>尖山区</td></tr>
    <tr><td><code>230503</code></td><td>黑龙江省</td><td>双鸭山市</td><td>岭东区</td></tr>
    <tr><td><code>230505</code></td><td>黑龙江省</td><td>双鸭山市</td><td>四方台区</td></tr>
    <tr><td><code>230506</code></td><td>黑龙江省</td><td>双鸭山市</td><td>宝山区</td></tr>
    <tr><td><code>230521</code></td><td>黑龙江省</td><td>双鸭山市</td><td>集贤县</td></tr>
    <tr><td><code>230522</code></td><td>黑龙江省</td><td>双鸭山市</td><td>友谊县</td></tr>
    <tr><td><code>230523</code></td><td>黑龙江省</td><td>双鸭山市</td><td>宝清县</td></tr>
    <tr><td><code>230524</code></td><td>黑龙江省</td><td>双鸭山市</td><td>饶河县</td></tr>
    <tr class="level-city"><td><code>230600</code></td><td>黑龙江省</td><td>大庆市</td><td></td></tr>
    <tr><td><code>230602</code></td><td>黑龙江省</td><td>大庆市</td><td>萨尔图区</td></tr>
    <tr><td><code>230603</code></td><td>黑龙江省</td><td>大庆市</td><td>龙凤区</td></tr>
    <tr><td><code>230604</code></td><td>黑龙江省</td><td>大庆市</td><td>让胡路区</td></tr>
    <tr><td><code>230605</code></td><td>黑龙江省</td><td>大庆市</td><td>红岗区</td></tr>
    <tr><td><code>230606</code></td><td>黑龙江省</td><td>大庆市</td><td>大同区</td></tr>
    <tr><td><code>230621</code></td><td>黑龙江省</td><td>大庆市</td><td>肇州县</td></tr>
    <tr><td><code>230622</code></td><td>黑龙江省</td><td>大庆市</td><td>肇源县</td></tr>
    <tr><td><code>230623</code></td><td>黑龙江省</td><td>大庆市</td><td>林甸县</td></tr>
    <tr><td><code>230624</code></td><td>黑龙江省</td><td>大庆市</td><td>杜尔伯特蒙古族自治县</td></tr>
    <tr class="level-city"><td><code>230700</code></td><td>黑龙江省</td><td>伊春市</td><td></td></tr>
    <tr><td><code>230702</code></td><td>黑龙江省</td><td>伊春市</td><td>伊春区</td></tr>
    <tr><td><code>230703</code></td><td>黑龙江省</td><td>伊春市</td><td>南岔区</td></tr>
    <tr><td><code>230704</code></td><td>黑龙江省</td><td>伊春市</td><td>友好区</td></tr>
    <tr><td><code>230705</code></td><td>黑龙江省</td><td>伊春市</td><td>西林区</td></tr>
    <tr><td><code>230706</code></td><td>黑龙江省</td><td>伊春市</td><td>翠峦区</td></tr>
    <tr><td><code>230707</code></td><td>黑龙江省</td><td>伊春市</td><td>新青区</td></tr>
    <tr><td><code>230708</code></td><td>黑龙江省</td><td>伊春市</td><td>美溪区</td></tr>
    <tr><td><code>230709</code></td><td>黑龙江省</td><td>伊春市</td><td>金山屯区</td></tr>
    <tr><td><code>230710</code></td><td>黑龙江省</td><td>伊春市</td><td>五营区</td></tr>
    <tr><td><code>230711</code></td><td>黑龙江省</td><td>伊春市</td><td>乌马河区</td></tr>
    <tr><td><code>230712</code></td><td>黑龙江省</td><td>伊春市</td><td>汤旺河区</td></tr>
    <tr><td><code>230713</code></td><td>黑龙江省</td><td>伊春市</td><td>带岭区</td></tr>
    <tr><td><code>230714</code></td><td>黑龙江省</td><td>伊春市</td><td>乌伊岭区</td></tr>
    <tr><td><code>230715</code></td><td>黑龙江省</td><td>伊春市</td><td>红星区</td></tr>
    <tr><td><code>230716</code></td><td>黑龙江省</td><td>伊春市</td><td>上甘岭区</td></tr>
    <tr><td><code>230722</code></td><td>黑龙江省</td><td>伊春市</td><td>嘉荫县</td></tr>
    <tr><td><code>230781</code></td><td>黑龙江省</td><td>伊春市</td><td>铁力市</td></tr>
    <tr class="level-city"><td><code>230800</code></td><td>黑龙江省</td><td>佳木斯市</td><td></td></tr>
    <tr><td><code>230803</code></td><td>黑龙江省</td><td>佳木斯市</td><td>向阳区</td></tr>
    <tr><td><code>230804</code></td><td>黑龙江省</td><td>佳木斯市</td><td>前进区</td></tr>
    <tr><td><code>230805</code></td><td>黑龙江省</td><td>佳木斯市</td><td>东风区</td></tr>
    <tr><td><code>230811</code></td><td>黑龙江省</td><td>佳木斯市</td><td>郊区</td></tr>
    <tr><td><code>230822</code></td><td>黑龙江省</td><td>佳木斯市</td><td>桦南县</td></tr>
    <tr><td><code>230826</code></td><td>黑龙江省</td><td>佳木斯市</td><td>桦川县</td></tr>
    <tr><td><code>230828</code></td><td>黑龙江省</td><td>佳木斯市</td><td>汤原县</td></tr>
    <tr><td><code>230881</code></td><td>黑龙江省</td><td>佳木斯市</td><td>同江市</td></tr>
    <tr><td><code>230882</code></td><td>黑龙江省</td><td>佳木斯市</td><td>富锦市</td></tr>
    <tr><td><code>230883</code></td><td>黑龙江省</td><td>佳木斯市</td><td>抚远市</td></tr>
    <tr class="level-city"><td><code>230900</code></td><td>黑龙江省</td><td>七台河市</td><td></td></tr>
    <tr><td><code>230902</code></td><td>黑龙江省</td><td>七台河市</td><td>新兴区</td></tr>
    <tr><td><code>230903</code></td><td>黑龙江省</td><td>七台河市</td><td>桃山区</td></tr>
    <tr><td><code>230904</code></td><td>黑龙江省</td><td>七台河市</td><td>茄子河区</td></tr>
    <tr><td><code>230921</code></td><td>黑龙江省</td><td>七台河市</td><td>勃利县</td></tr>
    <tr class="level-city"><td><code>231000</code></td><td>黑龙江省</td><td>牡丹江市</td><td></td></tr>
    <tr><td><code>231002</code></td><td>黑龙江省</td><td>牡丹江市</td><td>东安区</td></tr>
    <tr><td><code>231003</code></td><td>黑龙江省</td><td>牡丹江市</td><td>阳明区</td></tr>
    <tr><td><code>231004</code></td><td>黑龙江省</td><td>牡丹江市</td><td>爱民区</td></tr>
    <tr><td><code>231005</code></td><td>黑龙江省</td><td>牡丹江市</td><td>西安区</td></tr>
    <tr><td><code>231025</code></td><td>黑龙江省</td><td>牡丹江市</td><td>林口县</td></tr>
    <tr><td><code>231081</code></td><td>黑龙江省</td><td>牡丹江市</td><td>绥芬河市</td></tr>
    <tr><td><code>231083</code></td><td>黑龙江省</td><td>牡丹江市</td><td>海林市</td></tr>
    <tr><td><code>231084</code></td><td>黑龙江省</td><td>牡丹江市</td><td>宁安市</td></tr>
    <tr><td><code>231085</code></td><td>黑龙江省</td><td>牡丹江市</td><td>穆棱市</td></tr>
    <tr><td><code>231086</code></td><td>黑龙江省</td><td>牡丹江市</td><td>东宁市</td></tr>
    <tr class="level-city"><td><code>231100</code></td><td>黑龙江省</td><td>黑河市</td><td></td></tr>
    <tr><td><code>231102</code></td><td>黑龙江省</td><td>黑河市</td><td>爱辉区</td></tr>
    <tr><td><code>231121</code></td><td>黑龙江省</td><td>黑河市</td><td>嫩江县</td></tr>
    <tr><td><code>231123</code></td><td>黑龙江省</td><td>黑河市</td><td>逊克县</td></tr>
    <tr><td><code>231124</code></td><td>黑龙江省</td><td>黑河市</td><td>孙吴县</td></tr>
    <tr><td><code>231181</code></td><td>黑龙江省</td><td>黑河市</td><td>北安市</td></tr>
    <tr><td><code>231182</code></td><td>黑龙江省</td><td>黑河市</td><td>五大连池市</td></tr>
    <tr class="level-city"><td><code>231200</code></td><td>黑龙江省</td><td>绥化市</td><td></td></tr>
    <tr><td><code>231202</code></td><td>黑龙江省</td><td>绥化市</td><td>北林区</td></tr>
    <tr><td><code>231221</code></td><td>黑龙江省</td><td>绥化市</td><td>望奎县</td></tr>
    <tr><td><code>231222</code></td><td>黑龙江省</td><td>绥化市</td><td>兰西县</td></tr>
    <tr><td><code>231223</code></td><td>黑龙江省</td><td>绥化市</td><td>青冈县</td></tr>
    <tr><td><code>231224</code></td><td>黑龙江省</td><td>绥化市</td><td>庆安县</td></tr>
    <tr><td><code>231225</code></td><td>黑龙江省</td><td>绥化市</td><td>明水县</td></tr>
    <tr><td><code>231226</code></td><td>黑龙江省</td><td>绥化市</td><td>绥棱县</td></tr>
    <tr><td><code>231281</code></td><td>黑龙江省</td><td>绥化市</td><td>安达市</td></tr>
    <tr><td><code>231282</code></td><td>黑龙江省</td><td>绥化市</td><td>肇东市</td></tr>
    <tr><td><code>231283</code></td><td>黑龙江省</td><td>绥化市</td><td>海伦市</td></tr>
    <tr class="level-city"><td><code>232700</code></td><td>黑龙江省</td><td>大兴安岭地区</td><td></td></tr>
    <tr><td><code>232701</code></td><td>黑龙江省</td><td>大兴安岭地区</td><td>加格达奇区</td></tr>
    <tr><td><code>232721</code></td><td>黑龙江省</td><td>大兴安岭地区</td><td>呼玛县</td></tr>
    <tr><td><code>232722</code></td><td>黑龙江省</td><td>大兴安岭地区</td><td>塔河县</td></tr>
    <tr><td><code>232723</code></td><td>黑龙江省</td><td>大兴安岭地区</td><td>漠河县</td></tr>
  </tbody>
</table>
</div>


## 上海市（310000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>310000</code></td><td>上海市</td><td></td><td></td></tr>
    <tr><td><code>310101</code></td><td>上海市</td><td>黄浦区</td><td></td></tr>
    <tr><td><code>310104</code></td><td>上海市</td><td>徐汇区</td><td></td></tr>
    <tr><td><code>310105</code></td><td>上海市</td><td>长宁区</td><td></td></tr>
    <tr><td><code>310106</code></td><td>上海市</td><td>静安区</td><td></td></tr>
    <tr><td><code>310107</code></td><td>上海市</td><td>普陀区</td><td></td></tr>
    <tr><td><code>310109</code></td><td>上海市</td><td>虹口区</td><td></td></tr>
    <tr><td><code>310110</code></td><td>上海市</td><td>杨浦区</td><td></td></tr>
    <tr><td><code>310112</code></td><td>上海市</td><td>闵行区</td><td></td></tr>
    <tr><td><code>310113</code></td><td>上海市</td><td>宝山区</td><td></td></tr>
    <tr><td><code>310114</code></td><td>上海市</td><td>嘉定区</td><td></td></tr>
    <tr><td><code>310115</code></td><td>上海市</td><td>浦东新区</td><td></td></tr>
    <tr><td><code>310116</code></td><td>上海市</td><td>金山区</td><td></td></tr>
    <tr><td><code>310117</code></td><td>上海市</td><td>松江区</td><td></td></tr>
    <tr><td><code>310118</code></td><td>上海市</td><td>青浦区</td><td></td></tr>
    <tr><td><code>310120</code></td><td>上海市</td><td>奉贤区</td><td></td></tr>
    <tr><td><code>310151</code></td><td>上海市</td><td>崇明区</td><td></td></tr>
  </tbody>
</table>
</div>


## 江苏省（320000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>320000</code></td><td>江苏省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>320100</code></td><td>江苏省</td><td>南京市</td><td></td></tr>
    <tr><td><code>320102</code></td><td>江苏省</td><td>南京市</td><td>玄武区</td></tr>
    <tr><td><code>320104</code></td><td>江苏省</td><td>南京市</td><td>秦淮区</td></tr>
    <tr><td><code>320105</code></td><td>江苏省</td><td>南京市</td><td>建邺区</td></tr>
    <tr><td><code>320106</code></td><td>江苏省</td><td>南京市</td><td>鼓楼区</td></tr>
    <tr><td><code>320111</code></td><td>江苏省</td><td>南京市</td><td>浦口区</td></tr>
    <tr><td><code>320113</code></td><td>江苏省</td><td>南京市</td><td>栖霞区</td></tr>
    <tr><td><code>320114</code></td><td>江苏省</td><td>南京市</td><td>雨花台区</td></tr>
    <tr><td><code>320115</code></td><td>江苏省</td><td>南京市</td><td>江宁区</td></tr>
    <tr><td><code>320116</code></td><td>江苏省</td><td>南京市</td><td>六合区</td></tr>
    <tr><td><code>320117</code></td><td>江苏省</td><td>南京市</td><td>溧水区</td></tr>
    <tr><td><code>320118</code></td><td>江苏省</td><td>南京市</td><td>高淳区</td></tr>
    <tr class="level-city"><td><code>320200</code></td><td>江苏省</td><td>无锡市</td><td></td></tr>
    <tr><td><code>320205</code></td><td>江苏省</td><td>无锡市</td><td>锡山区</td></tr>
    <tr><td><code>320206</code></td><td>江苏省</td><td>无锡市</td><td>惠山区</td></tr>
    <tr><td><code>320211</code></td><td>江苏省</td><td>无锡市</td><td>滨湖区</td></tr>
    <tr><td><code>320213</code></td><td>江苏省</td><td>无锡市</td><td>梁溪区</td></tr>
    <tr><td><code>320214</code></td><td>江苏省</td><td>无锡市</td><td>新吴区</td></tr>
    <tr><td><code>320281</code></td><td>江苏省</td><td>无锡市</td><td>江阴市</td></tr>
    <tr><td><code>320282</code></td><td>江苏省</td><td>无锡市</td><td>宜兴市</td></tr>
    <tr class="level-city"><td><code>320300</code></td><td>江苏省</td><td>徐州市</td><td></td></tr>
    <tr><td><code>320302</code></td><td>江苏省</td><td>徐州市</td><td>鼓楼区</td></tr>
    <tr><td><code>320303</code></td><td>江苏省</td><td>徐州市</td><td>云龙区</td></tr>
    <tr><td><code>320305</code></td><td>江苏省</td><td>徐州市</td><td>贾汪区</td></tr>
    <tr><td><code>320311</code></td><td>江苏省</td><td>徐州市</td><td>泉山区</td></tr>
    <tr><td><code>320312</code></td><td>江苏省</td><td>徐州市</td><td>铜山区</td></tr>
    <tr><td><code>320321</code></td><td>江苏省</td><td>徐州市</td><td>丰县</td></tr>
    <tr><td><code>320322</code></td><td>江苏省</td><td>徐州市</td><td>沛县</td></tr>
    <tr><td><code>320324</code></td><td>江苏省</td><td>徐州市</td><td>睢宁县</td></tr>
    <tr><td><code>320381</code></td><td>江苏省</td><td>徐州市</td><td>新沂市</td></tr>
    <tr><td><code>320382</code></td><td>江苏省</td><td>徐州市</td><td>邳州市</td></tr>
    <tr class="level-city"><td><code>320400</code></td><td>江苏省</td><td>常州市</td><td></td></tr>
    <tr><td><code>320402</code></td><td>江苏省</td><td>常州市</td><td>天宁区</td></tr>
    <tr><td><code>320404</code></td><td>江苏省</td><td>常州市</td><td>钟楼区</td></tr>
    <tr><td><code>320411</code></td><td>江苏省</td><td>常州市</td><td>新北区</td></tr>
    <tr><td><code>320412</code></td><td>江苏省</td><td>常州市</td><td>武进区</td></tr>
    <tr><td><code>320413</code></td><td>江苏省</td><td>常州市</td><td>金坛区</td></tr>
    <tr><td><code>320481</code></td><td>江苏省</td><td>常州市</td><td>溧阳市</td></tr>
    <tr class="level-city"><td><code>320500</code></td><td>江苏省</td><td>苏州市</td><td></td></tr>
    <tr><td><code>320505</code></td><td>江苏省</td><td>苏州市</td><td>虎丘区</td></tr>
    <tr><td><code>320506</code></td><td>江苏省</td><td>苏州市</td><td>吴中区</td></tr>
    <tr><td><code>320507</code></td><td>江苏省</td><td>苏州市</td><td>相城区</td></tr>
    <tr><td><code>320508</code></td><td>江苏省</td><td>苏州市</td><td>姑苏区</td></tr>
    <tr><td><code>320509</code></td><td>江苏省</td><td>苏州市</td><td>吴江区</td></tr>
    <tr><td><code>320581</code></td><td>江苏省</td><td>苏州市</td><td>常熟市</td></tr>
    <tr><td><code>320582</code></td><td>江苏省</td><td>苏州市</td><td>张家港市</td></tr>
    <tr><td><code>320583</code></td><td>江苏省</td><td>苏州市</td><td>昆山市</td></tr>
    <tr><td><code>320585</code></td><td>江苏省</td><td>苏州市</td><td>太仓市</td></tr>
    <tr class="level-city"><td><code>320600</code></td><td>江苏省</td><td>南通市</td><td></td></tr>
    <tr><td><code>320602</code></td><td>江苏省</td><td>南通市</td><td>崇川区</td></tr>
    <tr><td><code>320611</code></td><td>江苏省</td><td>南通市</td><td>港闸区</td></tr>
    <tr><td><code>320612</code></td><td>江苏省</td><td>南通市</td><td>通州区</td></tr>
    <tr><td><code>320621</code></td><td>江苏省</td><td>南通市</td><td>海安县</td></tr>
    <tr><td><code>320623</code></td><td>江苏省</td><td>南通市</td><td>如东县</td></tr>
    <tr><td><code>320681</code></td><td>江苏省</td><td>南通市</td><td>启东市</td></tr>
    <tr><td><code>320682</code></td><td>江苏省</td><td>南通市</td><td>如皋市</td></tr>
    <tr><td><code>320684</code></td><td>江苏省</td><td>南通市</td><td>海门市</td></tr>
    <tr class="level-city"><td><code>320700</code></td><td>江苏省</td><td>连云港市</td><td></td></tr>
    <tr><td><code>320703</code></td><td>江苏省</td><td>连云港市</td><td>连云区</td></tr>
    <tr><td><code>320706</code></td><td>江苏省</td><td>连云港市</td><td>海州区</td></tr>
    <tr><td><code>320707</code></td><td>江苏省</td><td>连云港市</td><td>赣榆区</td></tr>
    <tr><td><code>320722</code></td><td>江苏省</td><td>连云港市</td><td>东海县</td></tr>
    <tr><td><code>320723</code></td><td>江苏省</td><td>连云港市</td><td>灌云县</td></tr>
    <tr><td><code>320724</code></td><td>江苏省</td><td>连云港市</td><td>灌南县</td></tr>
    <tr class="level-city"><td><code>320800</code></td><td>江苏省</td><td>淮安市</td><td></td></tr>
    <tr><td><code>320803</code></td><td>江苏省</td><td>淮安市</td><td>淮安区</td></tr>
    <tr><td><code>320804</code></td><td>江苏省</td><td>淮安市</td><td>淮阴区</td></tr>
    <tr><td><code>320812</code></td><td>江苏省</td><td>淮安市</td><td>清江浦区</td></tr>
    <tr><td><code>320813</code></td><td>江苏省</td><td>淮安市</td><td>洪泽区</td></tr>
    <tr><td><code>320826</code></td><td>江苏省</td><td>淮安市</td><td>涟水县</td></tr>
    <tr><td><code>320830</code></td><td>江苏省</td><td>淮安市</td><td>盱眙县</td></tr>
    <tr><td><code>320831</code></td><td>江苏省</td><td>淮安市</td><td>金湖县</td></tr>
    <tr class="level-city"><td><code>320900</code></td><td>江苏省</td><td>盐城市</td><td></td></tr>
    <tr><td><code>320902</code></td><td>江苏省</td><td>盐城市</td><td>亭湖区</td></tr>
    <tr><td><code>320903</code></td><td>江苏省</td><td>盐城市</td><td>盐都区</td></tr>
    <tr><td><code>320904</code></td><td>江苏省</td><td>盐城市</td><td>大丰区</td></tr>
    <tr><td><code>320921</code></td><td>江苏省</td><td>盐城市</td><td>响水县</td></tr>
    <tr><td><code>320922</code></td><td>江苏省</td><td>盐城市</td><td>滨海县</td></tr>
    <tr><td><code>320923</code></td><td>江苏省</td><td>盐城市</td><td>阜宁县</td></tr>
    <tr><td><code>320924</code></td><td>江苏省</td><td>盐城市</td><td>射阳县</td></tr>
    <tr><td><code>320925</code></td><td>江苏省</td><td>盐城市</td><td>建湖县</td></tr>
    <tr><td><code>320981</code></td><td>江苏省</td><td>盐城市</td><td>东台市</td></tr>
    <tr class="level-city"><td><code>321000</code></td><td>江苏省</td><td>扬州市</td><td></td></tr>
    <tr><td><code>321002</code></td><td>江苏省</td><td>扬州市</td><td>广陵区</td></tr>
    <tr><td><code>321003</code></td><td>江苏省</td><td>扬州市</td><td>邗江区</td></tr>
    <tr><td><code>321012</code></td><td>江苏省</td><td>扬州市</td><td>江都区</td></tr>
    <tr><td><code>321023</code></td><td>江苏省</td><td>扬州市</td><td>宝应县</td></tr>
    <tr><td><code>321081</code></td><td>江苏省</td><td>扬州市</td><td>仪征市</td></tr>
    <tr><td><code>321084</code></td><td>江苏省</td><td>扬州市</td><td>高邮市</td></tr>
    <tr class="level-city"><td><code>321100</code></td><td>江苏省</td><td>镇江市</td><td></td></tr>
    <tr><td><code>321102</code></td><td>江苏省</td><td>镇江市</td><td>京口区</td></tr>
    <tr><td><code>321111</code></td><td>江苏省</td><td>镇江市</td><td>润州区</td></tr>
    <tr><td><code>321112</code></td><td>江苏省</td><td>镇江市</td><td>丹徒区</td></tr>
    <tr><td><code>321181</code></td><td>江苏省</td><td>镇江市</td><td>丹阳市</td></tr>
    <tr><td><code>321182</code></td><td>江苏省</td><td>镇江市</td><td>扬中市</td></tr>
    <tr><td><code>321183</code></td><td>江苏省</td><td>镇江市</td><td>句容市</td></tr>
    <tr class="level-city"><td><code>321200</code></td><td>江苏省</td><td>泰州市</td><td></td></tr>
    <tr><td><code>321202</code></td><td>江苏省</td><td>泰州市</td><td>海陵区</td></tr>
    <tr><td><code>321203</code></td><td>江苏省</td><td>泰州市</td><td>高港区</td></tr>
    <tr><td><code>321204</code></td><td>江苏省</td><td>泰州市</td><td>姜堰区</td></tr>
    <tr><td><code>321281</code></td><td>江苏省</td><td>泰州市</td><td>兴化市</td></tr>
    <tr><td><code>321282</code></td><td>江苏省</td><td>泰州市</td><td>靖江市</td></tr>
    <tr><td><code>321283</code></td><td>江苏省</td><td>泰州市</td><td>泰兴市</td></tr>
    <tr class="level-city"><td><code>321300</code></td><td>江苏省</td><td>宿迁市</td><td></td></tr>
    <tr><td><code>321302</code></td><td>江苏省</td><td>宿迁市</td><td>宿城区</td></tr>
    <tr><td><code>321311</code></td><td>江苏省</td><td>宿迁市</td><td>宿豫区</td></tr>
    <tr><td><code>321322</code></td><td>江苏省</td><td>宿迁市</td><td>沭阳县</td></tr>
    <tr><td><code>321323</code></td><td>江苏省</td><td>宿迁市</td><td>泗阳县</td></tr>
    <tr><td><code>321324</code></td><td>江苏省</td><td>宿迁市</td><td>泗洪县</td></tr>
  </tbody>
</table>
</div>


## 浙江省（330000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>330000</code></td><td>浙江省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>330100</code></td><td>浙江省</td><td>杭州市</td><td></td></tr>
    <tr><td><code>330102</code></td><td>浙江省</td><td>杭州市</td><td>上城区</td></tr>
    <tr><td><code>330103</code></td><td>浙江省</td><td>杭州市</td><td>下城区</td></tr>
    <tr><td><code>330104</code></td><td>浙江省</td><td>杭州市</td><td>江干区</td></tr>
    <tr><td><code>330105</code></td><td>浙江省</td><td>杭州市</td><td>拱墅区</td></tr>
    <tr><td><code>330106</code></td><td>浙江省</td><td>杭州市</td><td>西湖区</td></tr>
    <tr><td><code>330108</code></td><td>浙江省</td><td>杭州市</td><td>滨江区</td></tr>
    <tr><td><code>330109</code></td><td>浙江省</td><td>杭州市</td><td>萧山区</td></tr>
    <tr><td><code>330110</code></td><td>浙江省</td><td>杭州市</td><td>余杭区</td></tr>
    <tr><td><code>330111</code></td><td>浙江省</td><td>杭州市</td><td>富阳区</td></tr>
    <tr><td><code>330122</code></td><td>浙江省</td><td>杭州市</td><td>桐庐县</td></tr>
    <tr><td><code>330127</code></td><td>浙江省</td><td>杭州市</td><td>淳安县</td></tr>
    <tr><td><code>330182</code></td><td>浙江省</td><td>杭州市</td><td>建德市</td></tr>
    <tr><td><code>330185</code></td><td>浙江省</td><td>杭州市</td><td>临安市</td></tr>
    <tr class="level-city"><td><code>330200</code></td><td>浙江省</td><td>宁波市</td><td></td></tr>
    <tr><td><code>330203</code></td><td>浙江省</td><td>宁波市</td><td>海曙区</td></tr>
    <tr><td><code>330205</code></td><td>浙江省</td><td>宁波市</td><td>江北区</td></tr>
    <tr><td><code>330206</code></td><td>浙江省</td><td>宁波市</td><td>北仑区</td></tr>
    <tr><td><code>330211</code></td><td>浙江省</td><td>宁波市</td><td>镇海区</td></tr>
    <tr><td><code>330212</code></td><td>浙江省</td><td>宁波市</td><td>鄞州区</td></tr>
    <tr><td><code>330213</code></td><td>浙江省</td><td>宁波市</td><td>奉化区</td></tr>
    <tr><td><code>330225</code></td><td>浙江省</td><td>宁波市</td><td>象山县</td></tr>
    <tr><td><code>330226</code></td><td>浙江省</td><td>宁波市</td><td>宁海县</td></tr>
    <tr><td><code>330281</code></td><td>浙江省</td><td>宁波市</td><td>余姚市</td></tr>
    <tr><td><code>330282</code></td><td>浙江省</td><td>宁波市</td><td>慈溪市</td></tr>
    <tr class="level-city"><td><code>330300</code></td><td>浙江省</td><td>温州市</td><td></td></tr>
    <tr><td><code>330302</code></td><td>浙江省</td><td>温州市</td><td>鹿城区</td></tr>
    <tr><td><code>330303</code></td><td>浙江省</td><td>温州市</td><td>龙湾区</td></tr>
    <tr><td><code>330304</code></td><td>浙江省</td><td>温州市</td><td>瓯海区</td></tr>
    <tr><td><code>330305</code></td><td>浙江省</td><td>温州市</td><td>洞头区</td></tr>
    <tr><td><code>330324</code></td><td>浙江省</td><td>温州市</td><td>永嘉县</td></tr>
    <tr><td><code>330326</code></td><td>浙江省</td><td>温州市</td><td>平阳县</td></tr>
    <tr><td><code>330327</code></td><td>浙江省</td><td>温州市</td><td>苍南县</td></tr>
    <tr><td><code>330328</code></td><td>浙江省</td><td>温州市</td><td>文成县</td></tr>
    <tr><td><code>330329</code></td><td>浙江省</td><td>温州市</td><td>泰顺县</td></tr>
    <tr><td><code>330381</code></td><td>浙江省</td><td>温州市</td><td>瑞安市</td></tr>
    <tr><td><code>330382</code></td><td>浙江省</td><td>温州市</td><td>乐清市</td></tr>
    <tr class="level-city"><td><code>330400</code></td><td>浙江省</td><td>嘉兴市</td><td></td></tr>
    <tr><td><code>330402</code></td><td>浙江省</td><td>嘉兴市</td><td>南湖区</td></tr>
    <tr><td><code>330411</code></td><td>浙江省</td><td>嘉兴市</td><td>秀洲区</td></tr>
    <tr><td><code>330421</code></td><td>浙江省</td><td>嘉兴市</td><td>嘉善县</td></tr>
    <tr><td><code>330424</code></td><td>浙江省</td><td>嘉兴市</td><td>海盐县</td></tr>
    <tr><td><code>330481</code></td><td>浙江省</td><td>嘉兴市</td><td>海宁市</td></tr>
    <tr><td><code>330482</code></td><td>浙江省</td><td>嘉兴市</td><td>平湖市</td></tr>
    <tr><td><code>330483</code></td><td>浙江省</td><td>嘉兴市</td><td>桐乡市</td></tr>
    <tr class="level-city"><td><code>330500</code></td><td>浙江省</td><td>湖州市</td><td></td></tr>
    <tr><td><code>330502</code></td><td>浙江省</td><td>湖州市</td><td>吴兴区</td></tr>
    <tr><td><code>330503</code></td><td>浙江省</td><td>湖州市</td><td>南浔区</td></tr>
    <tr><td><code>330521</code></td><td>浙江省</td><td>湖州市</td><td>德清县</td></tr>
    <tr><td><code>330522</code></td><td>浙江省</td><td>湖州市</td><td>长兴县</td></tr>
    <tr><td><code>330523</code></td><td>浙江省</td><td>湖州市</td><td>安吉县</td></tr>
    <tr class="level-city"><td><code>330600</code></td><td>浙江省</td><td>绍兴市</td><td></td></tr>
    <tr><td><code>330602</code></td><td>浙江省</td><td>绍兴市</td><td>越城区</td></tr>
    <tr><td><code>330603</code></td><td>浙江省</td><td>绍兴市</td><td>柯桥区</td></tr>
    <tr><td><code>330604</code></td><td>浙江省</td><td>绍兴市</td><td>上虞区</td></tr>
    <tr><td><code>330624</code></td><td>浙江省</td><td>绍兴市</td><td>新昌县</td></tr>
    <tr><td><code>330681</code></td><td>浙江省</td><td>绍兴市</td><td>诸暨市</td></tr>
    <tr><td><code>330683</code></td><td>浙江省</td><td>绍兴市</td><td>嵊州市</td></tr>
    <tr class="level-city"><td><code>330700</code></td><td>浙江省</td><td>金华市</td><td></td></tr>
    <tr><td><code>330702</code></td><td>浙江省</td><td>金华市</td><td>婺城区</td></tr>
    <tr><td><code>330703</code></td><td>浙江省</td><td>金华市</td><td>金东区</td></tr>
    <tr><td><code>330723</code></td><td>浙江省</td><td>金华市</td><td>武义县</td></tr>
    <tr><td><code>330726</code></td><td>浙江省</td><td>金华市</td><td>浦江县</td></tr>
    <tr><td><code>330727</code></td><td>浙江省</td><td>金华市</td><td>磐安县</td></tr>
    <tr><td><code>330781</code></td><td>浙江省</td><td>金华市</td><td>兰溪市</td></tr>
    <tr><td><code>330782</code></td><td>浙江省</td><td>金华市</td><td>义乌市</td></tr>
    <tr><td><code>330783</code></td><td>浙江省</td><td>金华市</td><td>东阳市</td></tr>
    <tr><td><code>330784</code></td><td>浙江省</td><td>金华市</td><td>永康市</td></tr>
    <tr class="level-city"><td><code>330800</code></td><td>浙江省</td><td>衢州市</td><td></td></tr>
    <tr><td><code>330802</code></td><td>浙江省</td><td>衢州市</td><td>柯城区</td></tr>
    <tr><td><code>330803</code></td><td>浙江省</td><td>衢州市</td><td>衢江区</td></tr>
    <tr><td><code>330822</code></td><td>浙江省</td><td>衢州市</td><td>常山县</td></tr>
    <tr><td><code>330824</code></td><td>浙江省</td><td>衢州市</td><td>开化县</td></tr>
    <tr><td><code>330825</code></td><td>浙江省</td><td>衢州市</td><td>龙游县</td></tr>
    <tr><td><code>330881</code></td><td>浙江省</td><td>衢州市</td><td>江山市</td></tr>
    <tr class="level-city"><td><code>330900</code></td><td>浙江省</td><td>舟山市</td><td></td></tr>
    <tr><td><code>330902</code></td><td>浙江省</td><td>舟山市</td><td>定海区</td></tr>
    <tr><td><code>330903</code></td><td>浙江省</td><td>舟山市</td><td>普陀区</td></tr>
    <tr><td><code>330921</code></td><td>浙江省</td><td>舟山市</td><td>岱山县</td></tr>
    <tr><td><code>330922</code></td><td>浙江省</td><td>舟山市</td><td>嵊泗县</td></tr>
    <tr class="level-city"><td><code>331000</code></td><td>浙江省</td><td>台州市</td><td></td></tr>
    <tr><td><code>331002</code></td><td>浙江省</td><td>台州市</td><td>椒江区</td></tr>
    <tr><td><code>331003</code></td><td>浙江省</td><td>台州市</td><td>黄岩区</td></tr>
    <tr><td><code>331004</code></td><td>浙江省</td><td>台州市</td><td>路桥区</td></tr>
    <tr><td><code>331022</code></td><td>浙江省</td><td>台州市</td><td>三门县</td></tr>
    <tr><td><code>331023</code></td><td>浙江省</td><td>台州市</td><td>天台县</td></tr>
    <tr><td><code>331024</code></td><td>浙江省</td><td>台州市</td><td>仙居县</td></tr>
    <tr><td><code>331081</code></td><td>浙江省</td><td>台州市</td><td>温岭市</td></tr>
    <tr><td><code>331082</code></td><td>浙江省</td><td>台州市</td><td>临海市</td></tr>
    <tr><td><code>331083</code></td><td>浙江省</td><td>台州市</td><td>玉环市</td></tr>
    <tr class="level-city"><td><code>331100</code></td><td>浙江省</td><td>丽水市</td><td></td></tr>
    <tr><td><code>331102</code></td><td>浙江省</td><td>丽水市</td><td>莲都区</td></tr>
    <tr><td><code>331121</code></td><td>浙江省</td><td>丽水市</td><td>青田县</td></tr>
    <tr><td><code>331122</code></td><td>浙江省</td><td>丽水市</td><td>缙云县</td></tr>
    <tr><td><code>331123</code></td><td>浙江省</td><td>丽水市</td><td>遂昌县</td></tr>
    <tr><td><code>331124</code></td><td>浙江省</td><td>丽水市</td><td>松阳县</td></tr>
    <tr><td><code>331125</code></td><td>浙江省</td><td>丽水市</td><td>云和县</td></tr>
    <tr><td><code>331126</code></td><td>浙江省</td><td>丽水市</td><td>庆元县</td></tr>
    <tr><td><code>331127</code></td><td>浙江省</td><td>丽水市</td><td>景宁畲族自治县</td></tr>
    <tr><td><code>331181</code></td><td>浙江省</td><td>丽水市</td><td>龙泉市</td></tr>
  </tbody>
</table>
</div>


## 安徽省（340000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>340000</code></td><td>安徽省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>340100</code></td><td>安徽省</td><td>合肥市</td><td></td></tr>
    <tr><td><code>340102</code></td><td>安徽省</td><td>合肥市</td><td>瑶海区</td></tr>
    <tr><td><code>340103</code></td><td>安徽省</td><td>合肥市</td><td>庐阳区</td></tr>
    <tr><td><code>340104</code></td><td>安徽省</td><td>合肥市</td><td>蜀山区</td></tr>
    <tr><td><code>340111</code></td><td>安徽省</td><td>合肥市</td><td>包河区</td></tr>
    <tr><td><code>340121</code></td><td>安徽省</td><td>合肥市</td><td>长丰县</td></tr>
    <tr><td><code>340122</code></td><td>安徽省</td><td>合肥市</td><td>肥东县</td></tr>
    <tr><td><code>340123</code></td><td>安徽省</td><td>合肥市</td><td>肥西县</td></tr>
    <tr><td><code>340124</code></td><td>安徽省</td><td>合肥市</td><td>庐江县</td></tr>
    <tr><td><code>340181</code></td><td>安徽省</td><td>合肥市</td><td>巢湖市</td></tr>
    <tr class="level-city"><td><code>340200</code></td><td>安徽省</td><td>芜湖市</td><td></td></tr>
    <tr><td><code>340202</code></td><td>安徽省</td><td>芜湖市</td><td>镜湖区</td></tr>
    <tr><td><code>340203</code></td><td>安徽省</td><td>芜湖市</td><td>弋江区</td></tr>
    <tr><td><code>340207</code></td><td>安徽省</td><td>芜湖市</td><td>鸠江区</td></tr>
    <tr><td><code>340208</code></td><td>安徽省</td><td>芜湖市</td><td>三山区</td></tr>
    <tr><td><code>340221</code></td><td>安徽省</td><td>芜湖市</td><td>芜湖县</td></tr>
    <tr><td><code>340222</code></td><td>安徽省</td><td>芜湖市</td><td>繁昌县</td></tr>
    <tr><td><code>340223</code></td><td>安徽省</td><td>芜湖市</td><td>南陵县</td></tr>
    <tr><td><code>340225</code></td><td>安徽省</td><td>芜湖市</td><td>无为县</td></tr>
    <tr class="level-city"><td><code>340300</code></td><td>安徽省</td><td>蚌埠市</td><td></td></tr>
    <tr><td><code>340302</code></td><td>安徽省</td><td>蚌埠市</td><td>龙子湖区</td></tr>
    <tr><td><code>340303</code></td><td>安徽省</td><td>蚌埠市</td><td>蚌山区</td></tr>
    <tr><td><code>340304</code></td><td>安徽省</td><td>蚌埠市</td><td>禹会区</td></tr>
    <tr><td><code>340311</code></td><td>安徽省</td><td>蚌埠市</td><td>淮上区</td></tr>
    <tr><td><code>340321</code></td><td>安徽省</td><td>蚌埠市</td><td>怀远县</td></tr>
    <tr><td><code>340322</code></td><td>安徽省</td><td>蚌埠市</td><td>五河县</td></tr>
    <tr><td><code>340323</code></td><td>安徽省</td><td>蚌埠市</td><td>固镇县</td></tr>
    <tr class="level-city"><td><code>340400</code></td><td>安徽省</td><td>淮南市</td><td></td></tr>
    <tr><td><code>340402</code></td><td>安徽省</td><td>淮南市</td><td>大通区</td></tr>
    <tr><td><code>340403</code></td><td>安徽省</td><td>淮南市</td><td>田家庵区</td></tr>
    <tr><td><code>340404</code></td><td>安徽省</td><td>淮南市</td><td>谢家集区</td></tr>
    <tr><td><code>340405</code></td><td>安徽省</td><td>淮南市</td><td>八公山区</td></tr>
    <tr><td><code>340406</code></td><td>安徽省</td><td>淮南市</td><td>潘集区</td></tr>
    <tr><td><code>340421</code></td><td>安徽省</td><td>淮南市</td><td>凤台县</td></tr>
    <tr><td><code>340422</code></td><td>安徽省</td><td>淮南市</td><td>寿县</td></tr>
    <tr class="level-city"><td><code>340500</code></td><td>安徽省</td><td>马鞍山市</td><td></td></tr>
    <tr><td><code>340503</code></td><td>安徽省</td><td>马鞍山市</td><td>花山区</td></tr>
    <tr><td><code>340504</code></td><td>安徽省</td><td>马鞍山市</td><td>雨山区</td></tr>
    <tr><td><code>340506</code></td><td>安徽省</td><td>马鞍山市</td><td>博望区</td></tr>
    <tr><td><code>340521</code></td><td>安徽省</td><td>马鞍山市</td><td>当涂县</td></tr>
    <tr><td><code>340522</code></td><td>安徽省</td><td>马鞍山市</td><td>含山县</td></tr>
    <tr><td><code>340523</code></td><td>安徽省</td><td>马鞍山市</td><td>和县</td></tr>
    <tr class="level-city"><td><code>340600</code></td><td>安徽省</td><td>淮北市</td><td></td></tr>
    <tr><td><code>340602</code></td><td>安徽省</td><td>淮北市</td><td>杜集区</td></tr>
    <tr><td><code>340603</code></td><td>安徽省</td><td>淮北市</td><td>相山区</td></tr>
    <tr><td><code>340604</code></td><td>安徽省</td><td>淮北市</td><td>烈山区</td></tr>
    <tr><td><code>340621</code></td><td>安徽省</td><td>淮北市</td><td>濉溪县</td></tr>
    <tr class="level-city"><td><code>340700</code></td><td>安徽省</td><td>铜陵市</td><td></td></tr>
    <tr><td><code>340705</code></td><td>安徽省</td><td>铜陵市</td><td>铜官区</td></tr>
    <tr><td><code>340706</code></td><td>安徽省</td><td>铜陵市</td><td>义安区</td></tr>
    <tr><td><code>340711</code></td><td>安徽省</td><td>铜陵市</td><td>郊区</td></tr>
    <tr><td><code>340722</code></td><td>安徽省</td><td>铜陵市</td><td>枞阳县</td></tr>
    <tr class="level-city"><td><code>340800</code></td><td>安徽省</td><td>安庆市</td><td></td></tr>
    <tr><td><code>340802</code></td><td>安徽省</td><td>安庆市</td><td>迎江区</td></tr>
    <tr><td><code>340803</code></td><td>安徽省</td><td>安庆市</td><td>大观区</td></tr>
    <tr><td><code>340811</code></td><td>安徽省</td><td>安庆市</td><td>宜秀区</td></tr>
    <tr><td><code>340822</code></td><td>安徽省</td><td>安庆市</td><td>怀宁县</td></tr>
    <tr><td><code>340824</code></td><td>安徽省</td><td>安庆市</td><td>潜山县</td></tr>
    <tr><td><code>340825</code></td><td>安徽省</td><td>安庆市</td><td>太湖县</td></tr>
    <tr><td><code>340826</code></td><td>安徽省</td><td>安庆市</td><td>宿松县</td></tr>
    <tr><td><code>340827</code></td><td>安徽省</td><td>安庆市</td><td>望江县</td></tr>
    <tr><td><code>340828</code></td><td>安徽省</td><td>安庆市</td><td>岳西县</td></tr>
    <tr><td><code>340881</code></td><td>安徽省</td><td>安庆市</td><td>桐城市</td></tr>
    <tr class="level-city"><td><code>341000</code></td><td>安徽省</td><td>黄山市</td><td></td></tr>
    <tr><td><code>341002</code></td><td>安徽省</td><td>黄山市</td><td>屯溪区</td></tr>
    <tr><td><code>341003</code></td><td>安徽省</td><td>黄山市</td><td>黄山区</td></tr>
    <tr><td><code>341004</code></td><td>安徽省</td><td>黄山市</td><td>徽州区</td></tr>
    <tr><td><code>341021</code></td><td>安徽省</td><td>黄山市</td><td>歙县</td></tr>
    <tr><td><code>341022</code></td><td>安徽省</td><td>黄山市</td><td>休宁县</td></tr>
    <tr><td><code>341023</code></td><td>安徽省</td><td>黄山市</td><td>黟县</td></tr>
    <tr><td><code>341024</code></td><td>安徽省</td><td>黄山市</td><td>祁门县</td></tr>
    <tr class="level-city"><td><code>341100</code></td><td>安徽省</td><td>滁州市</td><td></td></tr>
    <tr><td><code>341102</code></td><td>安徽省</td><td>滁州市</td><td>琅琊区</td></tr>
    <tr><td><code>341103</code></td><td>安徽省</td><td>滁州市</td><td>南谯区</td></tr>
    <tr><td><code>341122</code></td><td>安徽省</td><td>滁州市</td><td>来安县</td></tr>
    <tr><td><code>341124</code></td><td>安徽省</td><td>滁州市</td><td>全椒县</td></tr>
    <tr><td><code>341125</code></td><td>安徽省</td><td>滁州市</td><td>定远县</td></tr>
    <tr><td><code>341126</code></td><td>安徽省</td><td>滁州市</td><td>凤阳县</td></tr>
    <tr><td><code>341181</code></td><td>安徽省</td><td>滁州市</td><td>天长市</td></tr>
    <tr><td><code>341182</code></td><td>安徽省</td><td>滁州市</td><td>明光市</td></tr>
    <tr class="level-city"><td><code>341200</code></td><td>安徽省</td><td>阜阳市</td><td></td></tr>
    <tr><td><code>341202</code></td><td>安徽省</td><td>阜阳市</td><td>颍州区</td></tr>
    <tr><td><code>341203</code></td><td>安徽省</td><td>阜阳市</td><td>颍东区</td></tr>
    <tr><td><code>341204</code></td><td>安徽省</td><td>阜阳市</td><td>颍泉区</td></tr>
    <tr><td><code>341221</code></td><td>安徽省</td><td>阜阳市</td><td>临泉县</td></tr>
    <tr><td><code>341222</code></td><td>安徽省</td><td>阜阳市</td><td>太和县</td></tr>
    <tr><td><code>341225</code></td><td>安徽省</td><td>阜阳市</td><td>阜南县</td></tr>
    <tr><td><code>341226</code></td><td>安徽省</td><td>阜阳市</td><td>颍上县</td></tr>
    <tr><td><code>341282</code></td><td>安徽省</td><td>阜阳市</td><td>界首市</td></tr>
    <tr class="level-city"><td><code>341300</code></td><td>安徽省</td><td>宿州市</td><td></td></tr>
    <tr><td><code>341302</code></td><td>安徽省</td><td>宿州市</td><td>埇桥区</td></tr>
    <tr><td><code>341321</code></td><td>安徽省</td><td>宿州市</td><td>砀山县</td></tr>
    <tr><td><code>341322</code></td><td>安徽省</td><td>宿州市</td><td>萧县</td></tr>
    <tr><td><code>341323</code></td><td>安徽省</td><td>宿州市</td><td>灵璧县</td></tr>
    <tr><td><code>341324</code></td><td>安徽省</td><td>宿州市</td><td>泗县</td></tr>
    <tr class="level-city"><td><code>341500</code></td><td>安徽省</td><td>六安市</td><td></td></tr>
    <tr><td><code>341502</code></td><td>安徽省</td><td>六安市</td><td>金安区</td></tr>
    <tr><td><code>341503</code></td><td>安徽省</td><td>六安市</td><td>裕安区</td></tr>
    <tr><td><code>341504</code></td><td>安徽省</td><td>六安市</td><td>叶集区</td></tr>
    <tr><td><code>341522</code></td><td>安徽省</td><td>六安市</td><td>霍邱县</td></tr>
    <tr><td><code>341523</code></td><td>安徽省</td><td>六安市</td><td>舒城县</td></tr>
    <tr><td><code>341524</code></td><td>安徽省</td><td>六安市</td><td>金寨县</td></tr>
    <tr><td><code>341525</code></td><td>安徽省</td><td>六安市</td><td>霍山县</td></tr>
    <tr class="level-city"><td><code>341600</code></td><td>安徽省</td><td>亳州市</td><td></td></tr>
    <tr><td><code>341602</code></td><td>安徽省</td><td>亳州市</td><td>谯城区</td></tr>
    <tr><td><code>341621</code></td><td>安徽省</td><td>亳州市</td><td>涡阳县</td></tr>
    <tr><td><code>341622</code></td><td>安徽省</td><td>亳州市</td><td>蒙城县</td></tr>
    <tr><td><code>341623</code></td><td>安徽省</td><td>亳州市</td><td>利辛县</td></tr>
    <tr class="level-city"><td><code>341700</code></td><td>安徽省</td><td>池州市</td><td></td></tr>
    <tr><td><code>341702</code></td><td>安徽省</td><td>池州市</td><td>贵池区</td></tr>
    <tr><td><code>341721</code></td><td>安徽省</td><td>池州市</td><td>东至县</td></tr>
    <tr><td><code>341722</code></td><td>安徽省</td><td>池州市</td><td>石台县</td></tr>
    <tr><td><code>341723</code></td><td>安徽省</td><td>池州市</td><td>青阳县</td></tr>
    <tr class="level-city"><td><code>341800</code></td><td>安徽省</td><td>宣城市</td><td></td></tr>
    <tr><td><code>341802</code></td><td>安徽省</td><td>宣城市</td><td>宣州区</td></tr>
    <tr><td><code>341821</code></td><td>安徽省</td><td>宣城市</td><td>郎溪县</td></tr>
    <tr><td><code>341822</code></td><td>安徽省</td><td>宣城市</td><td>广德县</td></tr>
    <tr><td><code>341823</code></td><td>安徽省</td><td>宣城市</td><td>泾县</td></tr>
    <tr><td><code>341824</code></td><td>安徽省</td><td>宣城市</td><td>绩溪县</td></tr>
    <tr><td><code>341825</code></td><td>安徽省</td><td>宣城市</td><td>旌德县</td></tr>
    <tr><td><code>341881</code></td><td>安徽省</td><td>宣城市</td><td>宁国市</td></tr>
  </tbody>
</table>
</div>


## 福建省（350000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>350000</code></td><td>福建省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>350100</code></td><td>福建省</td><td>福州市</td><td></td></tr>
    <tr><td><code>350102</code></td><td>福建省</td><td>福州市</td><td>鼓楼区</td></tr>
    <tr><td><code>350103</code></td><td>福建省</td><td>福州市</td><td>台江区</td></tr>
    <tr><td><code>350104</code></td><td>福建省</td><td>福州市</td><td>仓山区</td></tr>
    <tr><td><code>350105</code></td><td>福建省</td><td>福州市</td><td>马尾区</td></tr>
    <tr><td><code>350111</code></td><td>福建省</td><td>福州市</td><td>晋安区</td></tr>
    <tr><td><code>350121</code></td><td>福建省</td><td>福州市</td><td>闽侯县</td></tr>
    <tr><td><code>350122</code></td><td>福建省</td><td>福州市</td><td>连江县</td></tr>
    <tr><td><code>350123</code></td><td>福建省</td><td>福州市</td><td>罗源县</td></tr>
    <tr><td><code>350124</code></td><td>福建省</td><td>福州市</td><td>闽清县</td></tr>
    <tr><td><code>350125</code></td><td>福建省</td><td>福州市</td><td>永泰县</td></tr>
    <tr><td><code>350128</code></td><td>福建省</td><td>福州市</td><td>平潭县</td></tr>
    <tr><td><code>350181</code></td><td>福建省</td><td>福州市</td><td>福清市</td></tr>
    <tr><td><code>350182</code></td><td>福建省</td><td>福州市</td><td>长乐市</td></tr>
    <tr class="level-city"><td><code>350200</code></td><td>福建省</td><td>厦门市</td><td></td></tr>
    <tr><td><code>350203</code></td><td>福建省</td><td>厦门市</td><td>思明区</td></tr>
    <tr><td><code>350205</code></td><td>福建省</td><td>厦门市</td><td>海沧区</td></tr>
    <tr><td><code>350206</code></td><td>福建省</td><td>厦门市</td><td>湖里区</td></tr>
    <tr><td><code>350211</code></td><td>福建省</td><td>厦门市</td><td>集美区</td></tr>
    <tr><td><code>350212</code></td><td>福建省</td><td>厦门市</td><td>同安区</td></tr>
    <tr><td><code>350213</code></td><td>福建省</td><td>厦门市</td><td>翔安区</td></tr>
    <tr class="level-city"><td><code>350300</code></td><td>福建省</td><td>莆田市</td><td></td></tr>
    <tr><td><code>350302</code></td><td>福建省</td><td>莆田市</td><td>城厢区</td></tr>
    <tr><td><code>350303</code></td><td>福建省</td><td>莆田市</td><td>涵江区</td></tr>
    <tr><td><code>350304</code></td><td>福建省</td><td>莆田市</td><td>荔城区</td></tr>
    <tr><td><code>350305</code></td><td>福建省</td><td>莆田市</td><td>秀屿区</td></tr>
    <tr><td><code>350322</code></td><td>福建省</td><td>莆田市</td><td>仙游县</td></tr>
    <tr class="level-city"><td><code>350400</code></td><td>福建省</td><td>三明市</td><td></td></tr>
    <tr><td><code>350402</code></td><td>福建省</td><td>三明市</td><td>梅列区</td></tr>
    <tr><td><code>350403</code></td><td>福建省</td><td>三明市</td><td>三元区</td></tr>
    <tr><td><code>350421</code></td><td>福建省</td><td>三明市</td><td>明溪县</td></tr>
    <tr><td><code>350423</code></td><td>福建省</td><td>三明市</td><td>清流县</td></tr>
    <tr><td><code>350424</code></td><td>福建省</td><td>三明市</td><td>宁化县</td></tr>
    <tr><td><code>350425</code></td><td>福建省</td><td>三明市</td><td>大田县</td></tr>
    <tr><td><code>350426</code></td><td>福建省</td><td>三明市</td><td>尤溪县</td></tr>
    <tr><td><code>350427</code></td><td>福建省</td><td>三明市</td><td>沙县</td></tr>
    <tr><td><code>350428</code></td><td>福建省</td><td>三明市</td><td>将乐县</td></tr>
    <tr><td><code>350429</code></td><td>福建省</td><td>三明市</td><td>泰宁县</td></tr>
    <tr><td><code>350430</code></td><td>福建省</td><td>三明市</td><td>建宁县</td></tr>
    <tr><td><code>350481</code></td><td>福建省</td><td>三明市</td><td>永安市</td></tr>
    <tr class="level-city"><td><code>350500</code></td><td>福建省</td><td>泉州市</td><td></td></tr>
    <tr><td><code>350502</code></td><td>福建省</td><td>泉州市</td><td>鲤城区</td></tr>
    <tr><td><code>350503</code></td><td>福建省</td><td>泉州市</td><td>丰泽区</td></tr>
    <tr><td><code>350504</code></td><td>福建省</td><td>泉州市</td><td>洛江区</td></tr>
    <tr><td><code>350505</code></td><td>福建省</td><td>泉州市</td><td>泉港区</td></tr>
    <tr><td><code>350521</code></td><td>福建省</td><td>泉州市</td><td>惠安县</td></tr>
    <tr><td><code>350524</code></td><td>福建省</td><td>泉州市</td><td>安溪县</td></tr>
    <tr><td><code>350525</code></td><td>福建省</td><td>泉州市</td><td>永春县</td></tr>
    <tr><td><code>350526</code></td><td>福建省</td><td>泉州市</td><td>德化县</td></tr>
    <tr><td><code>350527</code></td><td>福建省</td><td>泉州市</td><td>金门县</td></tr>
    <tr><td><code>350581</code></td><td>福建省</td><td>泉州市</td><td>石狮市</td></tr>
    <tr><td><code>350582</code></td><td>福建省</td><td>泉州市</td><td>晋江市</td></tr>
    <tr><td><code>350583</code></td><td>福建省</td><td>泉州市</td><td>南安市</td></tr>
    <tr class="level-city"><td><code>350600</code></td><td>福建省</td><td>漳州市</td><td></td></tr>
    <tr><td><code>350602</code></td><td>福建省</td><td>漳州市</td><td>芗城区</td></tr>
    <tr><td><code>350603</code></td><td>福建省</td><td>漳州市</td><td>龙文区</td></tr>
    <tr><td><code>350622</code></td><td>福建省</td><td>漳州市</td><td>云霄县</td></tr>
    <tr><td><code>350623</code></td><td>福建省</td><td>漳州市</td><td>漳浦县</td></tr>
    <tr><td><code>350624</code></td><td>福建省</td><td>漳州市</td><td>诏安县</td></tr>
    <tr><td><code>350625</code></td><td>福建省</td><td>漳州市</td><td>长泰县</td></tr>
    <tr><td><code>350626</code></td><td>福建省</td><td>漳州市</td><td>东山县</td></tr>
    <tr><td><code>350627</code></td><td>福建省</td><td>漳州市</td><td>南靖县</td></tr>
    <tr><td><code>350628</code></td><td>福建省</td><td>漳州市</td><td>平和县</td></tr>
    <tr><td><code>350629</code></td><td>福建省</td><td>漳州市</td><td>华安县</td></tr>
    <tr><td><code>350681</code></td><td>福建省</td><td>漳州市</td><td>龙海市</td></tr>
    <tr class="level-city"><td><code>350700</code></td><td>福建省</td><td>南平市</td><td></td></tr>
    <tr><td><code>350702</code></td><td>福建省</td><td>南平市</td><td>延平区</td></tr>
    <tr><td><code>350703</code></td><td>福建省</td><td>南平市</td><td>建阳区</td></tr>
    <tr><td><code>350721</code></td><td>福建省</td><td>南平市</td><td>顺昌县</td></tr>
    <tr><td><code>350722</code></td><td>福建省</td><td>南平市</td><td>浦城县</td></tr>
    <tr><td><code>350723</code></td><td>福建省</td><td>南平市</td><td>光泽县</td></tr>
    <tr><td><code>350724</code></td><td>福建省</td><td>南平市</td><td>松溪县</td></tr>
    <tr><td><code>350725</code></td><td>福建省</td><td>南平市</td><td>政和县</td></tr>
    <tr><td><code>350781</code></td><td>福建省</td><td>南平市</td><td>邵武市</td></tr>
    <tr><td><code>350782</code></td><td>福建省</td><td>南平市</td><td>武夷山市</td></tr>
    <tr><td><code>350783</code></td><td>福建省</td><td>南平市</td><td>建瓯市</td></tr>
    <tr class="level-city"><td><code>350800</code></td><td>福建省</td><td>龙岩市</td><td></td></tr>
    <tr><td><code>350802</code></td><td>福建省</td><td>龙岩市</td><td>新罗区</td></tr>
    <tr><td><code>350803</code></td><td>福建省</td><td>龙岩市</td><td>永定区</td></tr>
    <tr><td><code>350821</code></td><td>福建省</td><td>龙岩市</td><td>长汀县</td></tr>
    <tr><td><code>350823</code></td><td>福建省</td><td>龙岩市</td><td>上杭县</td></tr>
    <tr><td><code>350824</code></td><td>福建省</td><td>龙岩市</td><td>武平县</td></tr>
    <tr><td><code>350825</code></td><td>福建省</td><td>龙岩市</td><td>连城县</td></tr>
    <tr><td><code>350881</code></td><td>福建省</td><td>龙岩市</td><td>漳平市</td></tr>
    <tr class="level-city"><td><code>350900</code></td><td>福建省</td><td>宁德市</td><td></td></tr>
    <tr><td><code>350902</code></td><td>福建省</td><td>宁德市</td><td>蕉城区</td></tr>
    <tr><td><code>350921</code></td><td>福建省</td><td>宁德市</td><td>霞浦县</td></tr>
    <tr><td><code>350922</code></td><td>福建省</td><td>宁德市</td><td>古田县</td></tr>
    <tr><td><code>350923</code></td><td>福建省</td><td>宁德市</td><td>屏南县</td></tr>
    <tr><td><code>350924</code></td><td>福建省</td><td>宁德市</td><td>寿宁县</td></tr>
    <tr><td><code>350925</code></td><td>福建省</td><td>宁德市</td><td>周宁县</td></tr>
    <tr><td><code>350926</code></td><td>福建省</td><td>宁德市</td><td>柘荣县</td></tr>
    <tr><td><code>350981</code></td><td>福建省</td><td>宁德市</td><td>福安市</td></tr>
    <tr><td><code>350982</code></td><td>福建省</td><td>宁德市</td><td>福鼎市</td></tr>
  </tbody>
</table>
</div>


## 江西省（360000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>360000</code></td><td>江西省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>360100</code></td><td>江西省</td><td>南昌市</td><td></td></tr>
    <tr><td><code>360102</code></td><td>江西省</td><td>南昌市</td><td>东湖区</td></tr>
    <tr><td><code>360103</code></td><td>江西省</td><td>南昌市</td><td>西湖区</td></tr>
    <tr><td><code>360104</code></td><td>江西省</td><td>南昌市</td><td>青云谱区</td></tr>
    <tr><td><code>360105</code></td><td>江西省</td><td>南昌市</td><td>湾里区</td></tr>
    <tr><td><code>360111</code></td><td>江西省</td><td>南昌市</td><td>青山湖区</td></tr>
    <tr><td><code>360112</code></td><td>江西省</td><td>南昌市</td><td>新建区</td></tr>
    <tr><td><code>360121</code></td><td>江西省</td><td>南昌市</td><td>南昌县</td></tr>
    <tr><td><code>360123</code></td><td>江西省</td><td>南昌市</td><td>安义县</td></tr>
    <tr><td><code>360124</code></td><td>江西省</td><td>南昌市</td><td>进贤县</td></tr>
    <tr class="level-city"><td><code>360200</code></td><td>江西省</td><td>景德镇市</td><td></td></tr>
    <tr><td><code>360202</code></td><td>江西省</td><td>景德镇市</td><td>昌江区</td></tr>
    <tr><td><code>360203</code></td><td>江西省</td><td>景德镇市</td><td>珠山区</td></tr>
    <tr><td><code>360222</code></td><td>江西省</td><td>景德镇市</td><td>浮梁县</td></tr>
    <tr><td><code>360281</code></td><td>江西省</td><td>景德镇市</td><td>乐平市</td></tr>
    <tr class="level-city"><td><code>360300</code></td><td>江西省</td><td>萍乡市</td><td></td></tr>
    <tr><td><code>360302</code></td><td>江西省</td><td>萍乡市</td><td>安源区</td></tr>
    <tr><td><code>360313</code></td><td>江西省</td><td>萍乡市</td><td>湘东区</td></tr>
    <tr><td><code>360321</code></td><td>江西省</td><td>萍乡市</td><td>莲花县</td></tr>
    <tr><td><code>360322</code></td><td>江西省</td><td>萍乡市</td><td>上栗县</td></tr>
    <tr><td><code>360323</code></td><td>江西省</td><td>萍乡市</td><td>芦溪县</td></tr>
    <tr class="level-city"><td><code>360400</code></td><td>江西省</td><td>九江市</td><td></td></tr>
    <tr><td><code>360402</code></td><td>江西省</td><td>九江市</td><td>濂溪区</td></tr>
    <tr><td><code>360403</code></td><td>江西省</td><td>九江市</td><td>浔阳区</td></tr>
    <tr><td><code>360421</code></td><td>江西省</td><td>九江市</td><td>九江县</td></tr>
    <tr><td><code>360423</code></td><td>江西省</td><td>九江市</td><td>武宁县</td></tr>
    <tr><td><code>360424</code></td><td>江西省</td><td>九江市</td><td>修水县</td></tr>
    <tr><td><code>360425</code></td><td>江西省</td><td>九江市</td><td>永修县</td></tr>
    <tr><td><code>360426</code></td><td>江西省</td><td>九江市</td><td>德安县</td></tr>
    <tr><td><code>360428</code></td><td>江西省</td><td>九江市</td><td>都昌县</td></tr>
    <tr><td><code>360429</code></td><td>江西省</td><td>九江市</td><td>湖口县</td></tr>
    <tr><td><code>360430</code></td><td>江西省</td><td>九江市</td><td>彭泽县</td></tr>
    <tr><td><code>360481</code></td><td>江西省</td><td>九江市</td><td>瑞昌市</td></tr>
    <tr><td><code>360482</code></td><td>江西省</td><td>九江市</td><td>共青城市</td></tr>
    <tr><td><code>360483</code></td><td>江西省</td><td>九江市</td><td>庐山市</td></tr>
    <tr class="level-city"><td><code>360500</code></td><td>江西省</td><td>新余市</td><td></td></tr>
    <tr><td><code>360502</code></td><td>江西省</td><td>新余市</td><td>渝水区</td></tr>
    <tr><td><code>360521</code></td><td>江西省</td><td>新余市</td><td>分宜县</td></tr>
    <tr class="level-city"><td><code>360600</code></td><td>江西省</td><td>鹰潭市</td><td></td></tr>
    <tr><td><code>360602</code></td><td>江西省</td><td>鹰潭市</td><td>月湖区</td></tr>
    <tr><td><code>360622</code></td><td>江西省</td><td>鹰潭市</td><td>余江县</td></tr>
    <tr><td><code>360681</code></td><td>江西省</td><td>鹰潭市</td><td>贵溪市</td></tr>
    <tr class="level-city"><td><code>360700</code></td><td>江西省</td><td>赣州市</td><td></td></tr>
    <tr><td><code>360702</code></td><td>江西省</td><td>赣州市</td><td>章贡区</td></tr>
    <tr><td><code>360703</code></td><td>江西省</td><td>赣州市</td><td>南康区</td></tr>
    <tr><td><code>360704</code></td><td>江西省</td><td>赣州市</td><td>赣县区</td></tr>
    <tr><td><code>360722</code></td><td>江西省</td><td>赣州市</td><td>信丰县</td></tr>
    <tr><td><code>360723</code></td><td>江西省</td><td>赣州市</td><td>大余县</td></tr>
    <tr><td><code>360724</code></td><td>江西省</td><td>赣州市</td><td>上犹县</td></tr>
    <tr><td><code>360725</code></td><td>江西省</td><td>赣州市</td><td>崇义县</td></tr>
    <tr><td><code>360726</code></td><td>江西省</td><td>赣州市</td><td>安远县</td></tr>
    <tr><td><code>360727</code></td><td>江西省</td><td>赣州市</td><td>龙南县</td></tr>
    <tr><td><code>360728</code></td><td>江西省</td><td>赣州市</td><td>定南县</td></tr>
    <tr><td><code>360729</code></td><td>江西省</td><td>赣州市</td><td>全南县</td></tr>
    <tr><td><code>360730</code></td><td>江西省</td><td>赣州市</td><td>宁都县</td></tr>
    <tr><td><code>360731</code></td><td>江西省</td><td>赣州市</td><td>于都县</td></tr>
    <tr><td><code>360732</code></td><td>江西省</td><td>赣州市</td><td>兴国县</td></tr>
    <tr><td><code>360733</code></td><td>江西省</td><td>赣州市</td><td>会昌县</td></tr>
    <tr><td><code>360734</code></td><td>江西省</td><td>赣州市</td><td>寻乌县</td></tr>
    <tr><td><code>360735</code></td><td>江西省</td><td>赣州市</td><td>石城县</td></tr>
    <tr><td><code>360781</code></td><td>江西省</td><td>赣州市</td><td>瑞金市</td></tr>
    <tr class="level-city"><td><code>360800</code></td><td>江西省</td><td>吉安市</td><td></td></tr>
    <tr><td><code>360802</code></td><td>江西省</td><td>吉安市</td><td>吉州区</td></tr>
    <tr><td><code>360803</code></td><td>江西省</td><td>吉安市</td><td>青原区</td></tr>
    <tr><td><code>360821</code></td><td>江西省</td><td>吉安市</td><td>吉安县</td></tr>
    <tr><td><code>360822</code></td><td>江西省</td><td>吉安市</td><td>吉水县</td></tr>
    <tr><td><code>360823</code></td><td>江西省</td><td>吉安市</td><td>峡江县</td></tr>
    <tr><td><code>360824</code></td><td>江西省</td><td>吉安市</td><td>新干县</td></tr>
    <tr><td><code>360825</code></td><td>江西省</td><td>吉安市</td><td>永丰县</td></tr>
    <tr><td><code>360826</code></td><td>江西省</td><td>吉安市</td><td>泰和县</td></tr>
    <tr><td><code>360827</code></td><td>江西省</td><td>吉安市</td><td>遂川县</td></tr>
    <tr><td><code>360828</code></td><td>江西省</td><td>吉安市</td><td>万安县</td></tr>
    <tr><td><code>360829</code></td><td>江西省</td><td>吉安市</td><td>安福县</td></tr>
    <tr><td><code>360830</code></td><td>江西省</td><td>吉安市</td><td>永新县</td></tr>
    <tr><td><code>360881</code></td><td>江西省</td><td>吉安市</td><td>井冈山市</td></tr>
    <tr class="level-city"><td><code>360900</code></td><td>江西省</td><td>宜春市</td><td></td></tr>
    <tr><td><code>360902</code></td><td>江西省</td><td>宜春市</td><td>袁州区</td></tr>
    <tr><td><code>360921</code></td><td>江西省</td><td>宜春市</td><td>奉新县</td></tr>
    <tr><td><code>360922</code></td><td>江西省</td><td>宜春市</td><td>万载县</td></tr>
    <tr><td><code>360923</code></td><td>江西省</td><td>宜春市</td><td>上高县</td></tr>
    <tr><td><code>360924</code></td><td>江西省</td><td>宜春市</td><td>宜丰县</td></tr>
    <tr><td><code>360925</code></td><td>江西省</td><td>宜春市</td><td>靖安县</td></tr>
    <tr><td><code>360926</code></td><td>江西省</td><td>宜春市</td><td>铜鼓县</td></tr>
    <tr><td><code>360981</code></td><td>江西省</td><td>宜春市</td><td>丰城市</td></tr>
    <tr><td><code>360982</code></td><td>江西省</td><td>宜春市</td><td>樟树市</td></tr>
    <tr><td><code>360983</code></td><td>江西省</td><td>宜春市</td><td>高安市</td></tr>
    <tr class="level-city"><td><code>361000</code></td><td>江西省</td><td>抚州市</td><td></td></tr>
    <tr><td><code>361002</code></td><td>江西省</td><td>抚州市</td><td>临川区</td></tr>
    <tr><td><code>361003</code></td><td>江西省</td><td>抚州市</td><td>东乡区</td></tr>
    <tr><td><code>361021</code></td><td>江西省</td><td>抚州市</td><td>南城县</td></tr>
    <tr><td><code>361022</code></td><td>江西省</td><td>抚州市</td><td>黎川县</td></tr>
    <tr><td><code>361023</code></td><td>江西省</td><td>抚州市</td><td>南丰县</td></tr>
    <tr><td><code>361024</code></td><td>江西省</td><td>抚州市</td><td>崇仁县</td></tr>
    <tr><td><code>361025</code></td><td>江西省</td><td>抚州市</td><td>乐安县</td></tr>
    <tr><td><code>361026</code></td><td>江西省</td><td>抚州市</td><td>宜黄县</td></tr>
    <tr><td><code>361027</code></td><td>江西省</td><td>抚州市</td><td>金溪县</td></tr>
    <tr><td><code>361028</code></td><td>江西省</td><td>抚州市</td><td>资溪县</td></tr>
    <tr><td><code>361030</code></td><td>江西省</td><td>抚州市</td><td>广昌县</td></tr>
    <tr class="level-city"><td><code>361100</code></td><td>江西省</td><td>上饶市</td><td></td></tr>
    <tr><td><code>361102</code></td><td>江西省</td><td>上饶市</td><td>信州区</td></tr>
    <tr><td><code>361103</code></td><td>江西省</td><td>上饶市</td><td>广丰区</td></tr>
    <tr><td><code>361121</code></td><td>江西省</td><td>上饶市</td><td>上饶县</td></tr>
    <tr><td><code>361123</code></td><td>江西省</td><td>上饶市</td><td>玉山县</td></tr>
    <tr><td><code>361124</code></td><td>江西省</td><td>上饶市</td><td>铅山县</td></tr>
    <tr><td><code>361125</code></td><td>江西省</td><td>上饶市</td><td>横峰县</td></tr>
    <tr><td><code>361126</code></td><td>江西省</td><td>上饶市</td><td>弋阳县</td></tr>
    <tr><td><code>361127</code></td><td>江西省</td><td>上饶市</td><td>余干县</td></tr>
    <tr><td><code>361128</code></td><td>江西省</td><td>上饶市</td><td>鄱阳县</td></tr>
    <tr><td><code>361129</code></td><td>江西省</td><td>上饶市</td><td>万年县</td></tr>
    <tr><td><code>361130</code></td><td>江西省</td><td>上饶市</td><td>婺源县</td></tr>
    <tr><td><code>361181</code></td><td>江西省</td><td>上饶市</td><td>德兴市</td></tr>
  </tbody>
</table>
</div>


## 山东省（370000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>370000</code></td><td>山东省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>370100</code></td><td>山东省</td><td>济南市</td><td></td></tr>
    <tr><td><code>370102</code></td><td>山东省</td><td>济南市</td><td>历下区</td></tr>
    <tr><td><code>370103</code></td><td>山东省</td><td>济南市</td><td>市中区</td></tr>
    <tr><td><code>370104</code></td><td>山东省</td><td>济南市</td><td>槐荫区</td></tr>
    <tr><td><code>370105</code></td><td>山东省</td><td>济南市</td><td>天桥区</td></tr>
    <tr><td><code>370112</code></td><td>山东省</td><td>济南市</td><td>历城区</td></tr>
    <tr><td><code>370113</code></td><td>山东省</td><td>济南市</td><td>长清区</td></tr>
    <tr><td><code>370114</code></td><td>山东省</td><td>济南市</td><td>章丘区</td></tr>
    <tr><td><code>370124</code></td><td>山东省</td><td>济南市</td><td>平阴县</td></tr>
    <tr><td><code>370125</code></td><td>山东省</td><td>济南市</td><td>济阳县</td></tr>
    <tr><td><code>370126</code></td><td>山东省</td><td>济南市</td><td>商河县</td></tr>
    <tr class="level-city"><td><code>370200</code></td><td>山东省</td><td>青岛市</td><td></td></tr>
    <tr><td><code>370202</code></td><td>山东省</td><td>青岛市</td><td>市南区</td></tr>
    <tr><td><code>370203</code></td><td>山东省</td><td>青岛市</td><td>市北区</td></tr>
    <tr><td><code>370211</code></td><td>山东省</td><td>青岛市</td><td>黄岛区</td></tr>
    <tr><td><code>370212</code></td><td>山东省</td><td>青岛市</td><td>崂山区</td></tr>
    <tr><td><code>370213</code></td><td>山东省</td><td>青岛市</td><td>李沧区</td></tr>
    <tr><td><code>370214</code></td><td>山东省</td><td>青岛市</td><td>城阳区</td></tr>
    <tr><td><code>370281</code></td><td>山东省</td><td>青岛市</td><td>胶州市</td></tr>
    <tr><td><code>370282</code></td><td>山东省</td><td>青岛市</td><td>即墨市</td></tr>
    <tr><td><code>370283</code></td><td>山东省</td><td>青岛市</td><td>平度市</td></tr>
    <tr><td><code>370285</code></td><td>山东省</td><td>青岛市</td><td>莱西市</td></tr>
    <tr class="level-city"><td><code>370300</code></td><td>山东省</td><td>淄博市</td><td></td></tr>
    <tr><td><code>370302</code></td><td>山东省</td><td>淄博市</td><td>淄川区</td></tr>
    <tr><td><code>370303</code></td><td>山东省</td><td>淄博市</td><td>张店区</td></tr>
    <tr><td><code>370304</code></td><td>山东省</td><td>淄博市</td><td>博山区</td></tr>
    <tr><td><code>370305</code></td><td>山东省</td><td>淄博市</td><td>临淄区</td></tr>
    <tr><td><code>370306</code></td><td>山东省</td><td>淄博市</td><td>周村区</td></tr>
    <tr><td><code>370321</code></td><td>山东省</td><td>淄博市</td><td>桓台县</td></tr>
    <tr><td><code>370322</code></td><td>山东省</td><td>淄博市</td><td>高青县</td></tr>
    <tr><td><code>370323</code></td><td>山东省</td><td>淄博市</td><td>沂源县</td></tr>
    <tr class="level-city"><td><code>370400</code></td><td>山东省</td><td>枣庄市</td><td></td></tr>
    <tr><td><code>370402</code></td><td>山东省</td><td>枣庄市</td><td>市中区</td></tr>
    <tr><td><code>370403</code></td><td>山东省</td><td>枣庄市</td><td>薛城区</td></tr>
    <tr><td><code>370404</code></td><td>山东省</td><td>枣庄市</td><td>峄城区</td></tr>
    <tr><td><code>370405</code></td><td>山东省</td><td>枣庄市</td><td>台儿庄区</td></tr>
    <tr><td><code>370406</code></td><td>山东省</td><td>枣庄市</td><td>山亭区</td></tr>
    <tr><td><code>370481</code></td><td>山东省</td><td>枣庄市</td><td>滕州市</td></tr>
    <tr class="level-city"><td><code>370500</code></td><td>山东省</td><td>东营市</td><td></td></tr>
    <tr><td><code>370502</code></td><td>山东省</td><td>东营市</td><td>东营区</td></tr>
    <tr><td><code>370503</code></td><td>山东省</td><td>东营市</td><td>河口区</td></tr>
    <tr><td><code>370505</code></td><td>山东省</td><td>东营市</td><td>垦利区</td></tr>
    <tr><td><code>370522</code></td><td>山东省</td><td>东营市</td><td>利津县</td></tr>
    <tr><td><code>370523</code></td><td>山东省</td><td>东营市</td><td>广饶县</td></tr>
    <tr class="level-city"><td><code>370600</code></td><td>山东省</td><td>烟台市</td><td></td></tr>
    <tr><td><code>370602</code></td><td>山东省</td><td>烟台市</td><td>芝罘区</td></tr>
    <tr><td><code>370611</code></td><td>山东省</td><td>烟台市</td><td>福山区</td></tr>
    <tr><td><code>370612</code></td><td>山东省</td><td>烟台市</td><td>牟平区</td></tr>
    <tr><td><code>370613</code></td><td>山东省</td><td>烟台市</td><td>莱山区</td></tr>
    <tr><td><code>370634</code></td><td>山东省</td><td>烟台市</td><td>长岛县</td></tr>
    <tr><td><code>370681</code></td><td>山东省</td><td>烟台市</td><td>龙口市</td></tr>
    <tr><td><code>370682</code></td><td>山东省</td><td>烟台市</td><td>莱阳市</td></tr>
    <tr><td><code>370683</code></td><td>山东省</td><td>烟台市</td><td>莱州市</td></tr>
    <tr><td><code>370684</code></td><td>山东省</td><td>烟台市</td><td>蓬莱市</td></tr>
    <tr><td><code>370685</code></td><td>山东省</td><td>烟台市</td><td>招远市</td></tr>
    <tr><td><code>370686</code></td><td>山东省</td><td>烟台市</td><td>栖霞市</td></tr>
    <tr><td><code>370687</code></td><td>山东省</td><td>烟台市</td><td>海阳市</td></tr>
    <tr class="level-city"><td><code>370700</code></td><td>山东省</td><td>潍坊市</td><td></td></tr>
    <tr><td><code>370702</code></td><td>山东省</td><td>潍坊市</td><td>潍城区</td></tr>
    <tr><td><code>370703</code></td><td>山东省</td><td>潍坊市</td><td>寒亭区</td></tr>
    <tr><td><code>370704</code></td><td>山东省</td><td>潍坊市</td><td>坊子区</td></tr>
    <tr><td><code>370705</code></td><td>山东省</td><td>潍坊市</td><td>奎文区</td></tr>
    <tr><td><code>370724</code></td><td>山东省</td><td>潍坊市</td><td>临朐县</td></tr>
    <tr><td><code>370725</code></td><td>山东省</td><td>潍坊市</td><td>昌乐县</td></tr>
    <tr><td><code>370781</code></td><td>山东省</td><td>潍坊市</td><td>青州市</td></tr>
    <tr><td><code>370782</code></td><td>山东省</td><td>潍坊市</td><td>诸城市</td></tr>
    <tr><td><code>370783</code></td><td>山东省</td><td>潍坊市</td><td>寿光市</td></tr>
    <tr><td><code>370784</code></td><td>山东省</td><td>潍坊市</td><td>安丘市</td></tr>
    <tr><td><code>370785</code></td><td>山东省</td><td>潍坊市</td><td>高密市</td></tr>
    <tr><td><code>370786</code></td><td>山东省</td><td>潍坊市</td><td>昌邑市</td></tr>
    <tr class="level-city"><td><code>370800</code></td><td>山东省</td><td>济宁市</td><td></td></tr>
    <tr><td><code>370811</code></td><td>山东省</td><td>济宁市</td><td>任城区</td></tr>
    <tr><td><code>370812</code></td><td>山东省</td><td>济宁市</td><td>兖州区</td></tr>
    <tr><td><code>370826</code></td><td>山东省</td><td>济宁市</td><td>微山县</td></tr>
    <tr><td><code>370827</code></td><td>山东省</td><td>济宁市</td><td>鱼台县</td></tr>
    <tr><td><code>370828</code></td><td>山东省</td><td>济宁市</td><td>金乡县</td></tr>
    <tr><td><code>370829</code></td><td>山东省</td><td>济宁市</td><td>嘉祥县</td></tr>
    <tr><td><code>370830</code></td><td>山东省</td><td>济宁市</td><td>汶上县</td></tr>
    <tr><td><code>370831</code></td><td>山东省</td><td>济宁市</td><td>泗水县</td></tr>
    <tr><td><code>370832</code></td><td>山东省</td><td>济宁市</td><td>梁山县</td></tr>
    <tr><td><code>370881</code></td><td>山东省</td><td>济宁市</td><td>曲阜市</td></tr>
    <tr><td><code>370883</code></td><td>山东省</td><td>济宁市</td><td>邹城市</td></tr>
    <tr class="level-city"><td><code>370900</code></td><td>山东省</td><td>泰安市</td><td></td></tr>
    <tr><td><code>370902</code></td><td>山东省</td><td>泰安市</td><td>泰山区</td></tr>
    <tr><td><code>370911</code></td><td>山东省</td><td>泰安市</td><td>岱岳区</td></tr>
    <tr><td><code>370921</code></td><td>山东省</td><td>泰安市</td><td>宁阳县</td></tr>
    <tr><td><code>370923</code></td><td>山东省</td><td>泰安市</td><td>东平县</td></tr>
    <tr><td><code>370982</code></td><td>山东省</td><td>泰安市</td><td>新泰市</td></tr>
    <tr><td><code>370983</code></td><td>山东省</td><td>泰安市</td><td>肥城市</td></tr>
    <tr class="level-city"><td><code>371000</code></td><td>山东省</td><td>威海市</td><td></td></tr>
    <tr><td><code>371002</code></td><td>山东省</td><td>威海市</td><td>环翠区</td></tr>
    <tr><td><code>371003</code></td><td>山东省</td><td>威海市</td><td>文登区</td></tr>
    <tr><td><code>371082</code></td><td>山东省</td><td>威海市</td><td>荣成市</td></tr>
    <tr><td><code>371083</code></td><td>山东省</td><td>威海市</td><td>乳山市</td></tr>
    <tr class="level-city"><td><code>371100</code></td><td>山东省</td><td>日照市</td><td></td></tr>
    <tr><td><code>371102</code></td><td>山东省</td><td>日照市</td><td>东港区</td></tr>
    <tr><td><code>371103</code></td><td>山东省</td><td>日照市</td><td>岚山区</td></tr>
    <tr><td><code>371121</code></td><td>山东省</td><td>日照市</td><td>五莲县</td></tr>
    <tr><td><code>371122</code></td><td>山东省</td><td>日照市</td><td>莒县</td></tr>
    <tr class="level-city"><td><code>371200</code></td><td>山东省</td><td>莱芜市</td><td></td></tr>
    <tr><td><code>371202</code></td><td>山东省</td><td>莱芜市</td><td>莱城区</td></tr>
    <tr><td><code>371203</code></td><td>山东省</td><td>莱芜市</td><td>钢城区</td></tr>
    <tr class="level-city"><td><code>371300</code></td><td>山东省</td><td>临沂市</td><td></td></tr>
    <tr><td><code>371302</code></td><td>山东省</td><td>临沂市</td><td>兰山区</td></tr>
    <tr><td><code>371311</code></td><td>山东省</td><td>临沂市</td><td>罗庄区</td></tr>
    <tr><td><code>371312</code></td><td>山东省</td><td>临沂市</td><td>河东区</td></tr>
    <tr><td><code>371321</code></td><td>山东省</td><td>临沂市</td><td>沂南县</td></tr>
    <tr><td><code>371322</code></td><td>山东省</td><td>临沂市</td><td>郯城县</td></tr>
    <tr><td><code>371323</code></td><td>山东省</td><td>临沂市</td><td>沂水县</td></tr>
    <tr><td><code>371324</code></td><td>山东省</td><td>临沂市</td><td>兰陵县</td></tr>
    <tr><td><code>371325</code></td><td>山东省</td><td>临沂市</td><td>费县</td></tr>
    <tr><td><code>371326</code></td><td>山东省</td><td>临沂市</td><td>平邑县</td></tr>
    <tr><td><code>371327</code></td><td>山东省</td><td>临沂市</td><td>莒南县</td></tr>
    <tr><td><code>371328</code></td><td>山东省</td><td>临沂市</td><td>蒙阴县</td></tr>
    <tr><td><code>371329</code></td><td>山东省</td><td>临沂市</td><td>临沭县</td></tr>
    <tr class="level-city"><td><code>371400</code></td><td>山东省</td><td>德州市</td><td></td></tr>
    <tr><td><code>371402</code></td><td>山东省</td><td>德州市</td><td>德城区</td></tr>
    <tr><td><code>371403</code></td><td>山东省</td><td>德州市</td><td>陵城区</td></tr>
    <tr><td><code>371422</code></td><td>山东省</td><td>德州市</td><td>宁津县</td></tr>
    <tr><td><code>371423</code></td><td>山东省</td><td>德州市</td><td>庆云县</td></tr>
    <tr><td><code>371424</code></td><td>山东省</td><td>德州市</td><td>临邑县</td></tr>
    <tr><td><code>371425</code></td><td>山东省</td><td>德州市</td><td>齐河县</td></tr>
    <tr><td><code>371426</code></td><td>山东省</td><td>德州市</td><td>平原县</td></tr>
    <tr><td><code>371427</code></td><td>山东省</td><td>德州市</td><td>夏津县</td></tr>
    <tr><td><code>371428</code></td><td>山东省</td><td>德州市</td><td>武城县</td></tr>
    <tr><td><code>371481</code></td><td>山东省</td><td>德州市</td><td>乐陵市</td></tr>
    <tr><td><code>371482</code></td><td>山东省</td><td>德州市</td><td>禹城市</td></tr>
    <tr class="level-city"><td><code>371500</code></td><td>山东省</td><td>聊城市</td><td></td></tr>
    <tr><td><code>371502</code></td><td>山东省</td><td>聊城市</td><td>东昌府区</td></tr>
    <tr><td><code>371521</code></td><td>山东省</td><td>聊城市</td><td>阳谷县</td></tr>
    <tr><td><code>371522</code></td><td>山东省</td><td>聊城市</td><td>莘县</td></tr>
    <tr><td><code>371523</code></td><td>山东省</td><td>聊城市</td><td>茌平县</td></tr>
    <tr><td><code>371524</code></td><td>山东省</td><td>聊城市</td><td>东阿县</td></tr>
    <tr><td><code>371525</code></td><td>山东省</td><td>聊城市</td><td>冠县</td></tr>
    <tr><td><code>371526</code></td><td>山东省</td><td>聊城市</td><td>高唐县</td></tr>
    <tr><td><code>371581</code></td><td>山东省</td><td>聊城市</td><td>临清市</td></tr>
    <tr class="level-city"><td><code>371600</code></td><td>山东省</td><td>滨州市</td><td></td></tr>
    <tr><td><code>371602</code></td><td>山东省</td><td>滨州市</td><td>滨城区</td></tr>
    <tr><td><code>371603</code></td><td>山东省</td><td>滨州市</td><td>沾化区</td></tr>
    <tr><td><code>371621</code></td><td>山东省</td><td>滨州市</td><td>惠民县</td></tr>
    <tr><td><code>371622</code></td><td>山东省</td><td>滨州市</td><td>阳信县</td></tr>
    <tr><td><code>371623</code></td><td>山东省</td><td>滨州市</td><td>无棣县</td></tr>
    <tr><td><code>371625</code></td><td>山东省</td><td>滨州市</td><td>博兴县</td></tr>
    <tr><td><code>371626</code></td><td>山东省</td><td>滨州市</td><td>邹平县</td></tr>
    <tr class="level-city"><td><code>371700</code></td><td>山东省</td><td>菏泽市</td><td></td></tr>
    <tr><td><code>371702</code></td><td>山东省</td><td>菏泽市</td><td>牡丹区</td></tr>
    <tr><td><code>371703</code></td><td>山东省</td><td>菏泽市</td><td>定陶区</td></tr>
    <tr><td><code>371721</code></td><td>山东省</td><td>菏泽市</td><td>曹县</td></tr>
    <tr><td><code>371722</code></td><td>山东省</td><td>菏泽市</td><td>单县</td></tr>
    <tr><td><code>371723</code></td><td>山东省</td><td>菏泽市</td><td>成武县</td></tr>
    <tr><td><code>371724</code></td><td>山东省</td><td>菏泽市</td><td>巨野县</td></tr>
    <tr><td><code>371725</code></td><td>山东省</td><td>菏泽市</td><td>郓城县</td></tr>
    <tr><td><code>371726</code></td><td>山东省</td><td>菏泽市</td><td>鄄城县</td></tr>
    <tr><td><code>371728</code></td><td>山东省</td><td>菏泽市</td><td>东明县</td></tr>
  </tbody>
</table>
</div>


## 河南省（410000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>410000</code></td><td>河南省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>410100</code></td><td>河南省</td><td>郑州市</td><td></td></tr>
    <tr><td><code>410102</code></td><td>河南省</td><td>郑州市</td><td>中原区</td></tr>
    <tr><td><code>410103</code></td><td>河南省</td><td>郑州市</td><td>二七区</td></tr>
    <tr><td><code>410104</code></td><td>河南省</td><td>郑州市</td><td>管城回族区</td></tr>
    <tr><td><code>410105</code></td><td>河南省</td><td>郑州市</td><td>金水区</td></tr>
    <tr><td><code>410106</code></td><td>河南省</td><td>郑州市</td><td>上街区</td></tr>
    <tr><td><code>410108</code></td><td>河南省</td><td>郑州市</td><td>惠济区</td></tr>
    <tr><td><code>410122</code></td><td>河南省</td><td>郑州市</td><td>中牟县</td></tr>
    <tr><td><code>410181</code></td><td>河南省</td><td>郑州市</td><td>巩义市</td></tr>
    <tr><td><code>410182</code></td><td>河南省</td><td>郑州市</td><td>荥阳市</td></tr>
    <tr><td><code>410183</code></td><td>河南省</td><td>郑州市</td><td>新密市</td></tr>
    <tr><td><code>410184</code></td><td>河南省</td><td>郑州市</td><td>新郑市</td></tr>
    <tr><td><code>410185</code></td><td>河南省</td><td>郑州市</td><td>登封市</td></tr>
    <tr class="level-city"><td><code>410200</code></td><td>河南省</td><td>开封市</td><td></td></tr>
    <tr><td><code>410202</code></td><td>河南省</td><td>开封市</td><td>龙亭区</td></tr>
    <tr><td><code>410203</code></td><td>河南省</td><td>开封市</td><td>顺河回族区</td></tr>
    <tr><td><code>410204</code></td><td>河南省</td><td>开封市</td><td>鼓楼区</td></tr>
    <tr><td><code>410205</code></td><td>河南省</td><td>开封市</td><td>禹王台区</td></tr>
    <tr><td><code>410212</code></td><td>河南省</td><td>开封市</td><td>祥符区</td></tr>
    <tr><td><code>410221</code></td><td>河南省</td><td>开封市</td><td>杞县</td></tr>
    <tr><td><code>410222</code></td><td>河南省</td><td>开封市</td><td>通许县</td></tr>
    <tr><td><code>410223</code></td><td>河南省</td><td>开封市</td><td>尉氏县</td></tr>
    <tr><td><code>410225</code></td><td>河南省</td><td>开封市</td><td>兰考县</td></tr>
    <tr class="level-city"><td><code>410300</code></td><td>河南省</td><td>洛阳市</td><td></td></tr>
    <tr><td><code>410302</code></td><td>河南省</td><td>洛阳市</td><td>老城区</td></tr>
    <tr><td><code>410303</code></td><td>河南省</td><td>洛阳市</td><td>西工区</td></tr>
    <tr><td><code>410304</code></td><td>河南省</td><td>洛阳市</td><td>瀍河回族区</td></tr>
    <tr><td><code>410305</code></td><td>河南省</td><td>洛阳市</td><td>涧西区</td></tr>
    <tr><td><code>410306</code></td><td>河南省</td><td>洛阳市</td><td>吉利区</td></tr>
    <tr><td><code>410311</code></td><td>河南省</td><td>洛阳市</td><td>洛龙区</td></tr>
    <tr><td><code>410322</code></td><td>河南省</td><td>洛阳市</td><td>孟津县</td></tr>
    <tr><td><code>410323</code></td><td>河南省</td><td>洛阳市</td><td>新安县</td></tr>
    <tr><td><code>410324</code></td><td>河南省</td><td>洛阳市</td><td>栾川县</td></tr>
    <tr><td><code>410325</code></td><td>河南省</td><td>洛阳市</td><td>嵩县</td></tr>
    <tr><td><code>410326</code></td><td>河南省</td><td>洛阳市</td><td>汝阳县</td></tr>
    <tr><td><code>410327</code></td><td>河南省</td><td>洛阳市</td><td>宜阳县</td></tr>
    <tr><td><code>410328</code></td><td>河南省</td><td>洛阳市</td><td>洛宁县</td></tr>
    <tr><td><code>410329</code></td><td>河南省</td><td>洛阳市</td><td>伊川县</td></tr>
    <tr><td><code>410381</code></td><td>河南省</td><td>洛阳市</td><td>偃师市</td></tr>
    <tr class="level-city"><td><code>410400</code></td><td>河南省</td><td>平顶山市</td><td></td></tr>
    <tr><td><code>410402</code></td><td>河南省</td><td>平顶山市</td><td>新华区</td></tr>
    <tr><td><code>410403</code></td><td>河南省</td><td>平顶山市</td><td>卫东区</td></tr>
    <tr><td><code>410404</code></td><td>河南省</td><td>平顶山市</td><td>石龙区</td></tr>
    <tr><td><code>410411</code></td><td>河南省</td><td>平顶山市</td><td>湛河区</td></tr>
    <tr><td><code>410421</code></td><td>河南省</td><td>平顶山市</td><td>宝丰县</td></tr>
    <tr><td><code>410422</code></td><td>河南省</td><td>平顶山市</td><td>叶县</td></tr>
    <tr><td><code>410423</code></td><td>河南省</td><td>平顶山市</td><td>鲁山县</td></tr>
    <tr><td><code>410425</code></td><td>河南省</td><td>平顶山市</td><td>郏县</td></tr>
    <tr><td><code>410481</code></td><td>河南省</td><td>平顶山市</td><td>舞钢市</td></tr>
    <tr><td><code>410482</code></td><td>河南省</td><td>平顶山市</td><td>汝州市</td></tr>
    <tr class="level-city"><td><code>410500</code></td><td>河南省</td><td>安阳市</td><td></td></tr>
    <tr><td><code>410502</code></td><td>河南省</td><td>安阳市</td><td>文峰区</td></tr>
    <tr><td><code>410503</code></td><td>河南省</td><td>安阳市</td><td>北关区</td></tr>
    <tr><td><code>410505</code></td><td>河南省</td><td>安阳市</td><td>殷都区</td></tr>
    <tr><td><code>410506</code></td><td>河南省</td><td>安阳市</td><td>龙安区</td></tr>
    <tr><td><code>410522</code></td><td>河南省</td><td>安阳市</td><td>安阳县</td></tr>
    <tr><td><code>410523</code></td><td>河南省</td><td>安阳市</td><td>汤阴县</td></tr>
    <tr><td><code>410526</code></td><td>河南省</td><td>安阳市</td><td>滑县</td></tr>
    <tr><td><code>410527</code></td><td>河南省</td><td>安阳市</td><td>内黄县</td></tr>
    <tr><td><code>410581</code></td><td>河南省</td><td>安阳市</td><td>林州市</td></tr>
    <tr class="level-city"><td><code>410600</code></td><td>河南省</td><td>鹤壁市</td><td></td></tr>
    <tr><td><code>410602</code></td><td>河南省</td><td>鹤壁市</td><td>鹤山区</td></tr>
    <tr><td><code>410603</code></td><td>河南省</td><td>鹤壁市</td><td>山城区</td></tr>
    <tr><td><code>410611</code></td><td>河南省</td><td>鹤壁市</td><td>淇滨区</td></tr>
    <tr><td><code>410621</code></td><td>河南省</td><td>鹤壁市</td><td>浚县</td></tr>
    <tr><td><code>410622</code></td><td>河南省</td><td>鹤壁市</td><td>淇县</td></tr>
    <tr class="level-city"><td><code>410700</code></td><td>河南省</td><td>新乡市</td><td></td></tr>
    <tr><td><code>410702</code></td><td>河南省</td><td>新乡市</td><td>红旗区</td></tr>
    <tr><td><code>410703</code></td><td>河南省</td><td>新乡市</td><td>卫滨区</td></tr>
    <tr><td><code>410704</code></td><td>河南省</td><td>新乡市</td><td>凤泉区</td></tr>
    <tr><td><code>410711</code></td><td>河南省</td><td>新乡市</td><td>牧野区</td></tr>
    <tr><td><code>410721</code></td><td>河南省</td><td>新乡市</td><td>新乡县</td></tr>
    <tr><td><code>410724</code></td><td>河南省</td><td>新乡市</td><td>获嘉县</td></tr>
    <tr><td><code>410725</code></td><td>河南省</td><td>新乡市</td><td>原阳县</td></tr>
    <tr><td><code>410726</code></td><td>河南省</td><td>新乡市</td><td>延津县</td></tr>
    <tr><td><code>410727</code></td><td>河南省</td><td>新乡市</td><td>封丘县</td></tr>
    <tr><td><code>410728</code></td><td>河南省</td><td>新乡市</td><td>长垣县</td></tr>
    <tr><td><code>410781</code></td><td>河南省</td><td>新乡市</td><td>卫辉市</td></tr>
    <tr><td><code>410782</code></td><td>河南省</td><td>新乡市</td><td>辉县市</td></tr>
    <tr class="level-city"><td><code>410800</code></td><td>河南省</td><td>焦作市</td><td></td></tr>
    <tr><td><code>410802</code></td><td>河南省</td><td>焦作市</td><td>解放区</td></tr>
    <tr><td><code>410803</code></td><td>河南省</td><td>焦作市</td><td>中站区</td></tr>
    <tr><td><code>410804</code></td><td>河南省</td><td>焦作市</td><td>马村区</td></tr>
    <tr><td><code>410811</code></td><td>河南省</td><td>焦作市</td><td>山阳区</td></tr>
    <tr><td><code>410821</code></td><td>河南省</td><td>焦作市</td><td>修武县</td></tr>
    <tr><td><code>410822</code></td><td>河南省</td><td>焦作市</td><td>博爱县</td></tr>
    <tr><td><code>410823</code></td><td>河南省</td><td>焦作市</td><td>武陟县</td></tr>
    <tr><td><code>410825</code></td><td>河南省</td><td>焦作市</td><td>温县</td></tr>
    <tr><td><code>410882</code></td><td>河南省</td><td>焦作市</td><td>沁阳市</td></tr>
    <tr><td><code>410883</code></td><td>河南省</td><td>焦作市</td><td>孟州市</td></tr>
    <tr class="level-city"><td><code>410900</code></td><td>河南省</td><td>濮阳市</td><td></td></tr>
    <tr><td><code>410902</code></td><td>河南省</td><td>濮阳市</td><td>华龙区</td></tr>
    <tr><td><code>410922</code></td><td>河南省</td><td>濮阳市</td><td>清丰县</td></tr>
    <tr><td><code>410923</code></td><td>河南省</td><td>濮阳市</td><td>南乐县</td></tr>
    <tr><td><code>410926</code></td><td>河南省</td><td>濮阳市</td><td>范县</td></tr>
    <tr><td><code>410927</code></td><td>河南省</td><td>濮阳市</td><td>台前县</td></tr>
    <tr><td><code>410928</code></td><td>河南省</td><td>濮阳市</td><td>濮阳县</td></tr>
    <tr class="level-city"><td><code>411000</code></td><td>河南省</td><td>许昌市</td><td></td></tr>
    <tr><td><code>411002</code></td><td>河南省</td><td>许昌市</td><td>魏都区</td></tr>
    <tr><td><code>411003</code></td><td>河南省</td><td>许昌市</td><td>建安区</td></tr>
    <tr><td><code>411024</code></td><td>河南省</td><td>许昌市</td><td>鄢陵县</td></tr>
    <tr><td><code>411025</code></td><td>河南省</td><td>许昌市</td><td>襄城县</td></tr>
    <tr><td><code>411081</code></td><td>河南省</td><td>许昌市</td><td>禹州市</td></tr>
    <tr><td><code>411082</code></td><td>河南省</td><td>许昌市</td><td>长葛市</td></tr>
    <tr class="level-city"><td><code>411100</code></td><td>河南省</td><td>漯河市</td><td></td></tr>
    <tr><td><code>411102</code></td><td>河南省</td><td>漯河市</td><td>源汇区</td></tr>
    <tr><td><code>411103</code></td><td>河南省</td><td>漯河市</td><td>郾城区</td></tr>
    <tr><td><code>411104</code></td><td>河南省</td><td>漯河市</td><td>召陵区</td></tr>
    <tr><td><code>411121</code></td><td>河南省</td><td>漯河市</td><td>舞阳县</td></tr>
    <tr><td><code>411122</code></td><td>河南省</td><td>漯河市</td><td>临颍县</td></tr>
    <tr class="level-city"><td><code>411200</code></td><td>河南省</td><td>三门峡市</td><td></td></tr>
    <tr><td><code>411202</code></td><td>河南省</td><td>三门峡市</td><td>湖滨区</td></tr>
    <tr><td><code>411203</code></td><td>河南省</td><td>三门峡市</td><td>陕州区</td></tr>
    <tr><td><code>411221</code></td><td>河南省</td><td>三门峡市</td><td>渑池县</td></tr>
    <tr><td><code>411224</code></td><td>河南省</td><td>三门峡市</td><td>卢氏县</td></tr>
    <tr><td><code>411281</code></td><td>河南省</td><td>三门峡市</td><td>义马市</td></tr>
    <tr><td><code>411282</code></td><td>河南省</td><td>三门峡市</td><td>灵宝市</td></tr>
    <tr class="level-city"><td><code>411300</code></td><td>河南省</td><td>南阳市</td><td></td></tr>
    <tr><td><code>411302</code></td><td>河南省</td><td>南阳市</td><td>宛城区</td></tr>
    <tr><td><code>411303</code></td><td>河南省</td><td>南阳市</td><td>卧龙区</td></tr>
    <tr><td><code>411321</code></td><td>河南省</td><td>南阳市</td><td>南召县</td></tr>
    <tr><td><code>411322</code></td><td>河南省</td><td>南阳市</td><td>方城县</td></tr>
    <tr><td><code>411323</code></td><td>河南省</td><td>南阳市</td><td>西峡县</td></tr>
    <tr><td><code>411324</code></td><td>河南省</td><td>南阳市</td><td>镇平县</td></tr>
    <tr><td><code>411325</code></td><td>河南省</td><td>南阳市</td><td>内乡县</td></tr>
    <tr><td><code>411326</code></td><td>河南省</td><td>南阳市</td><td>淅川县</td></tr>
    <tr><td><code>411327</code></td><td>河南省</td><td>南阳市</td><td>社旗县</td></tr>
    <tr><td><code>411328</code></td><td>河南省</td><td>南阳市</td><td>唐河县</td></tr>
    <tr><td><code>411329</code></td><td>河南省</td><td>南阳市</td><td>新野县</td></tr>
    <tr><td><code>411330</code></td><td>河南省</td><td>南阳市</td><td>桐柏县</td></tr>
    <tr><td><code>411381</code></td><td>河南省</td><td>南阳市</td><td>邓州市</td></tr>
    <tr class="level-city"><td><code>411400</code></td><td>河南省</td><td>商丘市</td><td></td></tr>
    <tr><td><code>411402</code></td><td>河南省</td><td>商丘市</td><td>梁园区</td></tr>
    <tr><td><code>411403</code></td><td>河南省</td><td>商丘市</td><td>睢阳区</td></tr>
    <tr><td><code>411421</code></td><td>河南省</td><td>商丘市</td><td>民权县</td></tr>
    <tr><td><code>411422</code></td><td>河南省</td><td>商丘市</td><td>睢县</td></tr>
    <tr><td><code>411423</code></td><td>河南省</td><td>商丘市</td><td>宁陵县</td></tr>
    <tr><td><code>411424</code></td><td>河南省</td><td>商丘市</td><td>柘城县</td></tr>
    <tr><td><code>411425</code></td><td>河南省</td><td>商丘市</td><td>虞城县</td></tr>
    <tr><td><code>411426</code></td><td>河南省</td><td>商丘市</td><td>夏邑县</td></tr>
    <tr><td><code>411481</code></td><td>河南省</td><td>商丘市</td><td>永城市</td></tr>
    <tr class="level-city"><td><code>411500</code></td><td>河南省</td><td>信阳市</td><td></td></tr>
    <tr><td><code>411502</code></td><td>河南省</td><td>信阳市</td><td>浉河区</td></tr>
    <tr><td><code>411503</code></td><td>河南省</td><td>信阳市</td><td>平桥区</td></tr>
    <tr><td><code>411521</code></td><td>河南省</td><td>信阳市</td><td>罗山县</td></tr>
    <tr><td><code>411522</code></td><td>河南省</td><td>信阳市</td><td>光山县</td></tr>
    <tr><td><code>411523</code></td><td>河南省</td><td>信阳市</td><td>新县</td></tr>
    <tr><td><code>411524</code></td><td>河南省</td><td>信阳市</td><td>商城县</td></tr>
    <tr><td><code>411525</code></td><td>河南省</td><td>信阳市</td><td>固始县</td></tr>
    <tr><td><code>411526</code></td><td>河南省</td><td>信阳市</td><td>潢川县</td></tr>
    <tr><td><code>411527</code></td><td>河南省</td><td>信阳市</td><td>淮滨县</td></tr>
    <tr><td><code>411528</code></td><td>河南省</td><td>信阳市</td><td>息县</td></tr>
    <tr class="level-city"><td><code>411600</code></td><td>河南省</td><td>周口市</td><td></td></tr>
    <tr><td><code>411602</code></td><td>河南省</td><td>周口市</td><td>川汇区</td></tr>
    <tr><td><code>411621</code></td><td>河南省</td><td>周口市</td><td>扶沟县</td></tr>
    <tr><td><code>411622</code></td><td>河南省</td><td>周口市</td><td>西华县</td></tr>
    <tr><td><code>411623</code></td><td>河南省</td><td>周口市</td><td>商水县</td></tr>
    <tr><td><code>411624</code></td><td>河南省</td><td>周口市</td><td>沈丘县</td></tr>
    <tr><td><code>411625</code></td><td>河南省</td><td>周口市</td><td>郸城县</td></tr>
    <tr><td><code>411626</code></td><td>河南省</td><td>周口市</td><td>淮阳县</td></tr>
    <tr><td><code>411627</code></td><td>河南省</td><td>周口市</td><td>太康县</td></tr>
    <tr><td><code>411628</code></td><td>河南省</td><td>周口市</td><td>鹿邑县</td></tr>
    <tr><td><code>411681</code></td><td>河南省</td><td>周口市</td><td>项城市</td></tr>
    <tr class="level-city"><td><code>411700</code></td><td>河南省</td><td>驻马店市</td><td></td></tr>
    <tr><td><code>411702</code></td><td>河南省</td><td>驻马店市</td><td>驿城区</td></tr>
    <tr><td><code>411721</code></td><td>河南省</td><td>驻马店市</td><td>西平县</td></tr>
    <tr><td><code>411722</code></td><td>河南省</td><td>驻马店市</td><td>上蔡县</td></tr>
    <tr><td><code>411723</code></td><td>河南省</td><td>驻马店市</td><td>平舆县</td></tr>
    <tr><td><code>411724</code></td><td>河南省</td><td>驻马店市</td><td>正阳县</td></tr>
    <tr><td><code>411725</code></td><td>河南省</td><td>驻马店市</td><td>确山县</td></tr>
    <tr><td><code>411726</code></td><td>河南省</td><td>驻马店市</td><td>泌阳县</td></tr>
    <tr><td><code>411727</code></td><td>河南省</td><td>驻马店市</td><td>汝南县</td></tr>
    <tr><td><code>411728</code></td><td>河南省</td><td>驻马店市</td><td>遂平县</td></tr>
    <tr><td><code>411729</code></td><td>河南省</td><td>驻马店市</td><td>新蔡县</td></tr>
    <tr><td><code>419001</code></td><td>河南省</td><td>济源市</td><td>济源市</td></tr>
  </tbody>
</table>
</div>


## 湖北省（420000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>420000</code></td><td>湖北省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>420100</code></td><td>湖北省</td><td>武汉市</td><td></td></tr>
    <tr><td><code>420102</code></td><td>湖北省</td><td>武汉市</td><td>江岸区</td></tr>
    <tr><td><code>420103</code></td><td>湖北省</td><td>武汉市</td><td>江汉区</td></tr>
    <tr><td><code>420104</code></td><td>湖北省</td><td>武汉市</td><td>硚口区</td></tr>
    <tr><td><code>420105</code></td><td>湖北省</td><td>武汉市</td><td>汉阳区</td></tr>
    <tr><td><code>420106</code></td><td>湖北省</td><td>武汉市</td><td>武昌区</td></tr>
    <tr><td><code>420107</code></td><td>湖北省</td><td>武汉市</td><td>青山区</td></tr>
    <tr><td><code>420111</code></td><td>湖北省</td><td>武汉市</td><td>洪山区</td></tr>
    <tr><td><code>420112</code></td><td>湖北省</td><td>武汉市</td><td>东西湖区</td></tr>
    <tr><td><code>420113</code></td><td>湖北省</td><td>武汉市</td><td>汉南区</td></tr>
    <tr><td><code>420114</code></td><td>湖北省</td><td>武汉市</td><td>蔡甸区</td></tr>
    <tr><td><code>420115</code></td><td>湖北省</td><td>武汉市</td><td>江夏区</td></tr>
    <tr><td><code>420116</code></td><td>湖北省</td><td>武汉市</td><td>黄陂区</td></tr>
    <tr><td><code>420117</code></td><td>湖北省</td><td>武汉市</td><td>新洲区</td></tr>
    <tr class="level-city"><td><code>420200</code></td><td>湖北省</td><td>黄石市</td><td></td></tr>
    <tr><td><code>420202</code></td><td>湖北省</td><td>黄石市</td><td>黄石港区</td></tr>
    <tr><td><code>420203</code></td><td>湖北省</td><td>黄石市</td><td>西塞山区</td></tr>
    <tr><td><code>420204</code></td><td>湖北省</td><td>黄石市</td><td>下陆区</td></tr>
    <tr><td><code>420205</code></td><td>湖北省</td><td>黄石市</td><td>铁山区</td></tr>
    <tr><td><code>420222</code></td><td>湖北省</td><td>黄石市</td><td>阳新县</td></tr>
    <tr><td><code>420281</code></td><td>湖北省</td><td>黄石市</td><td>大冶市</td></tr>
    <tr class="level-city"><td><code>420300</code></td><td>湖北省</td><td>十堰市</td><td></td></tr>
    <tr><td><code>420302</code></td><td>湖北省</td><td>十堰市</td><td>茅箭区</td></tr>
    <tr><td><code>420303</code></td><td>湖北省</td><td>十堰市</td><td>张湾区</td></tr>
    <tr><td><code>420304</code></td><td>湖北省</td><td>十堰市</td><td>郧阳区</td></tr>
    <tr><td><code>420322</code></td><td>湖北省</td><td>十堰市</td><td>郧西县</td></tr>
    <tr><td><code>420323</code></td><td>湖北省</td><td>十堰市</td><td>竹山县</td></tr>
    <tr><td><code>420324</code></td><td>湖北省</td><td>十堰市</td><td>竹溪县</td></tr>
    <tr><td><code>420325</code></td><td>湖北省</td><td>十堰市</td><td>房县</td></tr>
    <tr><td><code>420381</code></td><td>湖北省</td><td>十堰市</td><td>丹江口市</td></tr>
    <tr class="level-city"><td><code>420500</code></td><td>湖北省</td><td>宜昌市</td><td></td></tr>
    <tr><td><code>420502</code></td><td>湖北省</td><td>宜昌市</td><td>西陵区</td></tr>
    <tr><td><code>420503</code></td><td>湖北省</td><td>宜昌市</td><td>伍家岗区</td></tr>
    <tr><td><code>420504</code></td><td>湖北省</td><td>宜昌市</td><td>点军区</td></tr>
    <tr><td><code>420505</code></td><td>湖北省</td><td>宜昌市</td><td>猇亭区</td></tr>
    <tr><td><code>420506</code></td><td>湖北省</td><td>宜昌市</td><td>夷陵区</td></tr>
    <tr><td><code>420525</code></td><td>湖北省</td><td>宜昌市</td><td>远安县</td></tr>
    <tr><td><code>420526</code></td><td>湖北省</td><td>宜昌市</td><td>兴山县</td></tr>
    <tr><td><code>420527</code></td><td>湖北省</td><td>宜昌市</td><td>秭归县</td></tr>
    <tr><td><code>420528</code></td><td>湖北省</td><td>宜昌市</td><td>长阳土家族自治县</td></tr>
    <tr><td><code>420529</code></td><td>湖北省</td><td>宜昌市</td><td>五峰土家族自治县</td></tr>
    <tr><td><code>420581</code></td><td>湖北省</td><td>宜昌市</td><td>宜都市</td></tr>
    <tr><td><code>420582</code></td><td>湖北省</td><td>宜昌市</td><td>当阳市</td></tr>
    <tr><td><code>420583</code></td><td>湖北省</td><td>宜昌市</td><td>枝江市</td></tr>
    <tr class="level-city"><td><code>420600</code></td><td>湖北省</td><td>襄阳市</td><td></td></tr>
    <tr><td><code>420602</code></td><td>湖北省</td><td>襄阳市</td><td>襄城区</td></tr>
    <tr><td><code>420606</code></td><td>湖北省</td><td>襄阳市</td><td>樊城区</td></tr>
    <tr><td><code>420607</code></td><td>湖北省</td><td>襄阳市</td><td>襄州区</td></tr>
    <tr><td><code>420624</code></td><td>湖北省</td><td>襄阳市</td><td>南漳县</td></tr>
    <tr><td><code>420625</code></td><td>湖北省</td><td>襄阳市</td><td>谷城县</td></tr>
    <tr><td><code>420626</code></td><td>湖北省</td><td>襄阳市</td><td>保康县</td></tr>
    <tr><td><code>420682</code></td><td>湖北省</td><td>襄阳市</td><td>老河口市</td></tr>
    <tr><td><code>420683</code></td><td>湖北省</td><td>襄阳市</td><td>枣阳市</td></tr>
    <tr><td><code>420684</code></td><td>湖北省</td><td>襄阳市</td><td>宜城市</td></tr>
    <tr class="level-city"><td><code>420700</code></td><td>湖北省</td><td>鄂州市</td><td></td></tr>
    <tr><td><code>420702</code></td><td>湖北省</td><td>鄂州市</td><td>梁子湖区</td></tr>
    <tr><td><code>420703</code></td><td>湖北省</td><td>鄂州市</td><td>华容区</td></tr>
    <tr><td><code>420704</code></td><td>湖北省</td><td>鄂州市</td><td>鄂城区</td></tr>
    <tr class="level-city"><td><code>420800</code></td><td>湖北省</td><td>荆门市</td><td></td></tr>
    <tr><td><code>420802</code></td><td>湖北省</td><td>荆门市</td><td>东宝区</td></tr>
    <tr><td><code>420804</code></td><td>湖北省</td><td>荆门市</td><td>掇刀区</td></tr>
    <tr><td><code>420821</code></td><td>湖北省</td><td>荆门市</td><td>京山县</td></tr>
    <tr><td><code>420822</code></td><td>湖北省</td><td>荆门市</td><td>沙洋县</td></tr>
    <tr><td><code>420881</code></td><td>湖北省</td><td>荆门市</td><td>钟祥市</td></tr>
    <tr class="level-city"><td><code>420900</code></td><td>湖北省</td><td>孝感市</td><td></td></tr>
    <tr><td><code>420902</code></td><td>湖北省</td><td>孝感市</td><td>孝南区</td></tr>
    <tr><td><code>420921</code></td><td>湖北省</td><td>孝感市</td><td>孝昌县</td></tr>
    <tr><td><code>420922</code></td><td>湖北省</td><td>孝感市</td><td>大悟县</td></tr>
    <tr><td><code>420923</code></td><td>湖北省</td><td>孝感市</td><td>云梦县</td></tr>
    <tr><td><code>420981</code></td><td>湖北省</td><td>孝感市</td><td>应城市</td></tr>
    <tr><td><code>420982</code></td><td>湖北省</td><td>孝感市</td><td>安陆市</td></tr>
    <tr><td><code>420984</code></td><td>湖北省</td><td>孝感市</td><td>汉川市</td></tr>
    <tr class="level-city"><td><code>421000</code></td><td>湖北省</td><td>荆州市</td><td></td></tr>
    <tr><td><code>421002</code></td><td>湖北省</td><td>荆州市</td><td>沙市区</td></tr>
    <tr><td><code>421003</code></td><td>湖北省</td><td>荆州市</td><td>荆州区</td></tr>
    <tr><td><code>421022</code></td><td>湖北省</td><td>荆州市</td><td>公安县</td></tr>
    <tr><td><code>421023</code></td><td>湖北省</td><td>荆州市</td><td>监利县</td></tr>
    <tr><td><code>421024</code></td><td>湖北省</td><td>荆州市</td><td>江陵县</td></tr>
    <tr><td><code>421081</code></td><td>湖北省</td><td>荆州市</td><td>石首市</td></tr>
    <tr><td><code>421083</code></td><td>湖北省</td><td>荆州市</td><td>洪湖市</td></tr>
    <tr><td><code>421087</code></td><td>湖北省</td><td>荆州市</td><td>松滋市</td></tr>
    <tr class="level-city"><td><code>421100</code></td><td>湖北省</td><td>黄冈市</td><td></td></tr>
    <tr><td><code>421102</code></td><td>湖北省</td><td>黄冈市</td><td>黄州区</td></tr>
    <tr><td><code>421121</code></td><td>湖北省</td><td>黄冈市</td><td>团风县</td></tr>
    <tr><td><code>421122</code></td><td>湖北省</td><td>黄冈市</td><td>红安县</td></tr>
    <tr><td><code>421123</code></td><td>湖北省</td><td>黄冈市</td><td>罗田县</td></tr>
    <tr><td><code>421124</code></td><td>湖北省</td><td>黄冈市</td><td>英山县</td></tr>
    <tr><td><code>421125</code></td><td>湖北省</td><td>黄冈市</td><td>浠水县</td></tr>
    <tr><td><code>421126</code></td><td>湖北省</td><td>黄冈市</td><td>蕲春县</td></tr>
    <tr><td><code>421127</code></td><td>湖北省</td><td>黄冈市</td><td>黄梅县</td></tr>
    <tr><td><code>421181</code></td><td>湖北省</td><td>黄冈市</td><td>麻城市</td></tr>
    <tr><td><code>421182</code></td><td>湖北省</td><td>黄冈市</td><td>武穴市</td></tr>
    <tr class="level-city"><td><code>421200</code></td><td>湖北省</td><td>咸宁市</td><td></td></tr>
    <tr><td><code>421202</code></td><td>湖北省</td><td>咸宁市</td><td>咸安区</td></tr>
    <tr><td><code>421221</code></td><td>湖北省</td><td>咸宁市</td><td>嘉鱼县</td></tr>
    <tr><td><code>421222</code></td><td>湖北省</td><td>咸宁市</td><td>通城县</td></tr>
    <tr><td><code>421223</code></td><td>湖北省</td><td>咸宁市</td><td>崇阳县</td></tr>
    <tr><td><code>421224</code></td><td>湖北省</td><td>咸宁市</td><td>通山县</td></tr>
    <tr><td><code>421281</code></td><td>湖北省</td><td>咸宁市</td><td>赤壁市</td></tr>
    <tr class="level-city"><td><code>421300</code></td><td>湖北省</td><td>随州市</td><td></td></tr>
    <tr><td><code>421303</code></td><td>湖北省</td><td>随州市</td><td>曾都区</td></tr>
    <tr><td><code>421321</code></td><td>湖北省</td><td>随州市</td><td>随县</td></tr>
    <tr><td><code>421381</code></td><td>湖北省</td><td>随州市</td><td>广水市</td></tr>
    <tr class="level-city"><td><code>422800</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td></td></tr>
    <tr><td><code>422801</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>恩施市</td></tr>
    <tr><td><code>422802</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>利川市</td></tr>
    <tr><td><code>422822</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>建始县</td></tr>
    <tr><td><code>422823</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>巴东县</td></tr>
    <tr><td><code>422825</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>宣恩县</td></tr>
    <tr><td><code>422826</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>咸丰县</td></tr>
    <tr><td><code>422827</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>来凤县</td></tr>
    <tr><td><code>422828</code></td><td>湖北省</td><td>恩施土家族苗族自治州</td><td>鹤峰县</td></tr>
    <tr><td><code>429004</code></td><td>湖北省</td><td>仙桃市</td><td>仙桃市</td></tr>
    <tr><td><code>429005</code></td><td>湖北省</td><td>潜江市</td><td>潜江市</td></tr>
    <tr><td><code>429006</code></td><td>湖北省</td><td>天门市</td><td>天门市</td></tr>
    <tr><td><code>429021</code></td><td>湖北省</td><td>神农架林区</td><td>神农架林区</td></tr>
  </tbody>
</table>
</div>


## 湖南省（430000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>430000</code></td><td>湖南省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>430100</code></td><td>湖南省</td><td>长沙市</td><td></td></tr>
    <tr><td><code>430102</code></td><td>湖南省</td><td>长沙市</td><td>芙蓉区</td></tr>
    <tr><td><code>430103</code></td><td>湖南省</td><td>长沙市</td><td>天心区</td></tr>
    <tr><td><code>430104</code></td><td>湖南省</td><td>长沙市</td><td>岳麓区</td></tr>
    <tr><td><code>430105</code></td><td>湖南省</td><td>长沙市</td><td>开福区</td></tr>
    <tr><td><code>430111</code></td><td>湖南省</td><td>长沙市</td><td>雨花区</td></tr>
    <tr><td><code>430112</code></td><td>湖南省</td><td>长沙市</td><td>望城区</td></tr>
    <tr><td><code>430121</code></td><td>湖南省</td><td>长沙市</td><td>长沙县</td></tr>
    <tr><td><code>430181</code></td><td>湖南省</td><td>长沙市</td><td>浏阳市</td></tr>
    <tr><td><code>430182</code></td><td>湖南省</td><td>长沙市</td><td>宁乡市</td></tr>
    <tr class="level-city"><td><code>430200</code></td><td>湖南省</td><td>株洲市</td><td></td></tr>
    <tr><td><code>430202</code></td><td>湖南省</td><td>株洲市</td><td>荷塘区</td></tr>
    <tr><td><code>430203</code></td><td>湖南省</td><td>株洲市</td><td>芦淞区</td></tr>
    <tr><td><code>430204</code></td><td>湖南省</td><td>株洲市</td><td>石峰区</td></tr>
    <tr><td><code>430211</code></td><td>湖南省</td><td>株洲市</td><td>天元区</td></tr>
    <tr><td><code>430221</code></td><td>湖南省</td><td>株洲市</td><td>株洲县</td></tr>
    <tr><td><code>430223</code></td><td>湖南省</td><td>株洲市</td><td>攸县</td></tr>
    <tr><td><code>430224</code></td><td>湖南省</td><td>株洲市</td><td>茶陵县</td></tr>
    <tr><td><code>430225</code></td><td>湖南省</td><td>株洲市</td><td>炎陵县</td></tr>
    <tr><td><code>430281</code></td><td>湖南省</td><td>株洲市</td><td>醴陵市</td></tr>
    <tr class="level-city"><td><code>430300</code></td><td>湖南省</td><td>湘潭市</td><td></td></tr>
    <tr><td><code>430302</code></td><td>湖南省</td><td>湘潭市</td><td>雨湖区</td></tr>
    <tr><td><code>430304</code></td><td>湖南省</td><td>湘潭市</td><td>岳塘区</td></tr>
    <tr><td><code>430321</code></td><td>湖南省</td><td>湘潭市</td><td>湘潭县</td></tr>
    <tr><td><code>430381</code></td><td>湖南省</td><td>湘潭市</td><td>湘乡市</td></tr>
    <tr><td><code>430382</code></td><td>湖南省</td><td>湘潭市</td><td>韶山市</td></tr>
    <tr class="level-city"><td><code>430400</code></td><td>湖南省</td><td>衡阳市</td><td></td></tr>
    <tr><td><code>430405</code></td><td>湖南省</td><td>衡阳市</td><td>珠晖区</td></tr>
    <tr><td><code>430406</code></td><td>湖南省</td><td>衡阳市</td><td>雁峰区</td></tr>
    <tr><td><code>430407</code></td><td>湖南省</td><td>衡阳市</td><td>石鼓区</td></tr>
    <tr><td><code>430408</code></td><td>湖南省</td><td>衡阳市</td><td>蒸湘区</td></tr>
    <tr><td><code>430412</code></td><td>湖南省</td><td>衡阳市</td><td>南岳区</td></tr>
    <tr><td><code>430421</code></td><td>湖南省</td><td>衡阳市</td><td>衡阳县</td></tr>
    <tr><td><code>430422</code></td><td>湖南省</td><td>衡阳市</td><td>衡南县</td></tr>
    <tr><td><code>430423</code></td><td>湖南省</td><td>衡阳市</td><td>衡山县</td></tr>
    <tr><td><code>430424</code></td><td>湖南省</td><td>衡阳市</td><td>衡东县</td></tr>
    <tr><td><code>430426</code></td><td>湖南省</td><td>衡阳市</td><td>祁东县</td></tr>
    <tr><td><code>430481</code></td><td>湖南省</td><td>衡阳市</td><td>耒阳市</td></tr>
    <tr><td><code>430482</code></td><td>湖南省</td><td>衡阳市</td><td>常宁市</td></tr>
    <tr class="level-city"><td><code>430500</code></td><td>湖南省</td><td>邵阳市</td><td></td></tr>
    <tr><td><code>430502</code></td><td>湖南省</td><td>邵阳市</td><td>双清区</td></tr>
    <tr><td><code>430503</code></td><td>湖南省</td><td>邵阳市</td><td>大祥区</td></tr>
    <tr><td><code>430511</code></td><td>湖南省</td><td>邵阳市</td><td>北塔区</td></tr>
    <tr><td><code>430521</code></td><td>湖南省</td><td>邵阳市</td><td>邵东县</td></tr>
    <tr><td><code>430522</code></td><td>湖南省</td><td>邵阳市</td><td>新邵县</td></tr>
    <tr><td><code>430523</code></td><td>湖南省</td><td>邵阳市</td><td>邵阳县</td></tr>
    <tr><td><code>430524</code></td><td>湖南省</td><td>邵阳市</td><td>隆回县</td></tr>
    <tr><td><code>430525</code></td><td>湖南省</td><td>邵阳市</td><td>洞口县</td></tr>
    <tr><td><code>430527</code></td><td>湖南省</td><td>邵阳市</td><td>绥宁县</td></tr>
    <tr><td><code>430528</code></td><td>湖南省</td><td>邵阳市</td><td>新宁县</td></tr>
    <tr><td><code>430529</code></td><td>湖南省</td><td>邵阳市</td><td>城步苗族自治县</td></tr>
    <tr><td><code>430581</code></td><td>湖南省</td><td>邵阳市</td><td>武冈市</td></tr>
    <tr class="level-city"><td><code>430600</code></td><td>湖南省</td><td>岳阳市</td><td></td></tr>
    <tr><td><code>430602</code></td><td>湖南省</td><td>岳阳市</td><td>岳阳楼区</td></tr>
    <tr><td><code>430603</code></td><td>湖南省</td><td>岳阳市</td><td>云溪区</td></tr>
    <tr><td><code>430611</code></td><td>湖南省</td><td>岳阳市</td><td>君山区</td></tr>
    <tr><td><code>430621</code></td><td>湖南省</td><td>岳阳市</td><td>岳阳县</td></tr>
    <tr><td><code>430623</code></td><td>湖南省</td><td>岳阳市</td><td>华容县</td></tr>
    <tr><td><code>430624</code></td><td>湖南省</td><td>岳阳市</td><td>湘阴县</td></tr>
    <tr><td><code>430626</code></td><td>湖南省</td><td>岳阳市</td><td>平江县</td></tr>
    <tr><td><code>430681</code></td><td>湖南省</td><td>岳阳市</td><td>汨罗市</td></tr>
    <tr><td><code>430682</code></td><td>湖南省</td><td>岳阳市</td><td>临湘市</td></tr>
    <tr class="level-city"><td><code>430700</code></td><td>湖南省</td><td>常德市</td><td></td></tr>
    <tr><td><code>430702</code></td><td>湖南省</td><td>常德市</td><td>武陵区</td></tr>
    <tr><td><code>430703</code></td><td>湖南省</td><td>常德市</td><td>鼎城区</td></tr>
    <tr><td><code>430721</code></td><td>湖南省</td><td>常德市</td><td>安乡县</td></tr>
    <tr><td><code>430722</code></td><td>湖南省</td><td>常德市</td><td>汉寿县</td></tr>
    <tr><td><code>430723</code></td><td>湖南省</td><td>常德市</td><td>澧县</td></tr>
    <tr><td><code>430724</code></td><td>湖南省</td><td>常德市</td><td>临澧县</td></tr>
    <tr><td><code>430725</code></td><td>湖南省</td><td>常德市</td><td>桃源县</td></tr>
    <tr><td><code>430726</code></td><td>湖南省</td><td>常德市</td><td>石门县</td></tr>
    <tr><td><code>430781</code></td><td>湖南省</td><td>常德市</td><td>津市市</td></tr>
    <tr class="level-city"><td><code>430800</code></td><td>湖南省</td><td>张家界市</td><td></td></tr>
    <tr><td><code>430802</code></td><td>湖南省</td><td>张家界市</td><td>永定区</td></tr>
    <tr><td><code>430811</code></td><td>湖南省</td><td>张家界市</td><td>武陵源区</td></tr>
    <tr><td><code>430821</code></td><td>湖南省</td><td>张家界市</td><td>慈利县</td></tr>
    <tr><td><code>430822</code></td><td>湖南省</td><td>张家界市</td><td>桑植县</td></tr>
    <tr class="level-city"><td><code>430900</code></td><td>湖南省</td><td>益阳市</td><td></td></tr>
    <tr><td><code>430902</code></td><td>湖南省</td><td>益阳市</td><td>资阳区</td></tr>
    <tr><td><code>430903</code></td><td>湖南省</td><td>益阳市</td><td>赫山区</td></tr>
    <tr><td><code>430921</code></td><td>湖南省</td><td>益阳市</td><td>南县</td></tr>
    <tr><td><code>430922</code></td><td>湖南省</td><td>益阳市</td><td>桃江县</td></tr>
    <tr><td><code>430923</code></td><td>湖南省</td><td>益阳市</td><td>安化县</td></tr>
    <tr><td><code>430981</code></td><td>湖南省</td><td>益阳市</td><td>沅江市</td></tr>
    <tr class="level-city"><td><code>431000</code></td><td>湖南省</td><td>郴州市</td><td></td></tr>
    <tr><td><code>431002</code></td><td>湖南省</td><td>郴州市</td><td>北湖区</td></tr>
    <tr><td><code>431003</code></td><td>湖南省</td><td>郴州市</td><td>苏仙区</td></tr>
    <tr><td><code>431021</code></td><td>湖南省</td><td>郴州市</td><td>桂阳县</td></tr>
    <tr><td><code>431022</code></td><td>湖南省</td><td>郴州市</td><td>宜章县</td></tr>
    <tr><td><code>431023</code></td><td>湖南省</td><td>郴州市</td><td>永兴县</td></tr>
    <tr><td><code>431024</code></td><td>湖南省</td><td>郴州市</td><td>嘉禾县</td></tr>
    <tr><td><code>431025</code></td><td>湖南省</td><td>郴州市</td><td>临武县</td></tr>
    <tr><td><code>431026</code></td><td>湖南省</td><td>郴州市</td><td>汝城县</td></tr>
    <tr><td><code>431027</code></td><td>湖南省</td><td>郴州市</td><td>桂东县</td></tr>
    <tr><td><code>431028</code></td><td>湖南省</td><td>郴州市</td><td>安仁县</td></tr>
    <tr><td><code>431081</code></td><td>湖南省</td><td>郴州市</td><td>资兴市</td></tr>
    <tr class="level-city"><td><code>431100</code></td><td>湖南省</td><td>永州市</td><td></td></tr>
    <tr><td><code>431102</code></td><td>湖南省</td><td>永州市</td><td>零陵区</td></tr>
    <tr><td><code>431103</code></td><td>湖南省</td><td>永州市</td><td>冷水滩区</td></tr>
    <tr><td><code>431121</code></td><td>湖南省</td><td>永州市</td><td>祁阳县</td></tr>
    <tr><td><code>431122</code></td><td>湖南省</td><td>永州市</td><td>东安县</td></tr>
    <tr><td><code>431123</code></td><td>湖南省</td><td>永州市</td><td>双牌县</td></tr>
    <tr><td><code>431124</code></td><td>湖南省</td><td>永州市</td><td>道县</td></tr>
    <tr><td><code>431125</code></td><td>湖南省</td><td>永州市</td><td>江永县</td></tr>
    <tr><td><code>431126</code></td><td>湖南省</td><td>永州市</td><td>宁远县</td></tr>
    <tr><td><code>431127</code></td><td>湖南省</td><td>永州市</td><td>蓝山县</td></tr>
    <tr><td><code>431128</code></td><td>湖南省</td><td>永州市</td><td>新田县</td></tr>
    <tr><td><code>431129</code></td><td>湖南省</td><td>永州市</td><td>江华瑶族自治县</td></tr>
    <tr class="level-city"><td><code>431200</code></td><td>湖南省</td><td>怀化市</td><td></td></tr>
    <tr><td><code>431202</code></td><td>湖南省</td><td>怀化市</td><td>鹤城区</td></tr>
    <tr><td><code>431221</code></td><td>湖南省</td><td>怀化市</td><td>中方县</td></tr>
    <tr><td><code>431222</code></td><td>湖南省</td><td>怀化市</td><td>沅陵县</td></tr>
    <tr><td><code>431223</code></td><td>湖南省</td><td>怀化市</td><td>辰溪县</td></tr>
    <tr><td><code>431224</code></td><td>湖南省</td><td>怀化市</td><td>溆浦县</td></tr>
    <tr><td><code>431225</code></td><td>湖南省</td><td>怀化市</td><td>会同县</td></tr>
    <tr><td><code>431226</code></td><td>湖南省</td><td>怀化市</td><td>麻阳苗族自治县</td></tr>
    <tr><td><code>431227</code></td><td>湖南省</td><td>怀化市</td><td>新晃侗族自治县</td></tr>
    <tr><td><code>431228</code></td><td>湖南省</td><td>怀化市</td><td>芷江侗族自治县</td></tr>
    <tr><td><code>431229</code></td><td>湖南省</td><td>怀化市</td><td>靖州苗族侗族自治县</td></tr>
    <tr><td><code>431230</code></td><td>湖南省</td><td>怀化市</td><td>通道侗族自治县</td></tr>
    <tr><td><code>431281</code></td><td>湖南省</td><td>怀化市</td><td>洪江市</td></tr>
    <tr class="level-city"><td><code>431300</code></td><td>湖南省</td><td>娄底市</td><td></td></tr>
    <tr><td><code>431302</code></td><td>湖南省</td><td>娄底市</td><td>娄星区</td></tr>
    <tr><td><code>431321</code></td><td>湖南省</td><td>娄底市</td><td>双峰县</td></tr>
    <tr><td><code>431322</code></td><td>湖南省</td><td>娄底市</td><td>新化县</td></tr>
    <tr><td><code>431381</code></td><td>湖南省</td><td>娄底市</td><td>冷水江市</td></tr>
    <tr><td><code>431382</code></td><td>湖南省</td><td>娄底市</td><td>涟源市</td></tr>
    <tr class="level-city"><td><code>433100</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td></td></tr>
    <tr><td><code>433101</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>吉首市</td></tr>
    <tr><td><code>433122</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>泸溪县</td></tr>
    <tr><td><code>433123</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>凤凰县</td></tr>
    <tr><td><code>433124</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>花垣县</td></tr>
    <tr><td><code>433125</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>保靖县</td></tr>
    <tr><td><code>433126</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>古丈县</td></tr>
    <tr><td><code>433127</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>永顺县</td></tr>
    <tr><td><code>433130</code></td><td>湖南省</td><td>湘西土家族苗族自治州</td><td>龙山县</td></tr>
  </tbody>
</table>
</div>


## 广东省（440000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>440000</code></td><td>广东省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>440100</code></td><td>广东省</td><td>广州市</td><td></td></tr>
    <tr><td><code>440103</code></td><td>广东省</td><td>广州市</td><td>荔湾区</td></tr>
    <tr><td><code>440104</code></td><td>广东省</td><td>广州市</td><td>越秀区</td></tr>
    <tr><td><code>440105</code></td><td>广东省</td><td>广州市</td><td>海珠区</td></tr>
    <tr><td><code>440106</code></td><td>广东省</td><td>广州市</td><td>天河区</td></tr>
    <tr><td><code>440111</code></td><td>广东省</td><td>广州市</td><td>白云区</td></tr>
    <tr><td><code>440112</code></td><td>广东省</td><td>广州市</td><td>黄埔区</td></tr>
    <tr><td><code>440113</code></td><td>广东省</td><td>广州市</td><td>番禺区</td></tr>
    <tr><td><code>440114</code></td><td>广东省</td><td>广州市</td><td>花都区</td></tr>
    <tr><td><code>440115</code></td><td>广东省</td><td>广州市</td><td>南沙区</td></tr>
    <tr><td><code>440117</code></td><td>广东省</td><td>广州市</td><td>从化区</td></tr>
    <tr><td><code>440118</code></td><td>广东省</td><td>广州市</td><td>增城区</td></tr>
    <tr class="level-city"><td><code>440200</code></td><td>广东省</td><td>韶关市</td><td></td></tr>
    <tr><td><code>440203</code></td><td>广东省</td><td>韶关市</td><td>武江区</td></tr>
    <tr><td><code>440204</code></td><td>广东省</td><td>韶关市</td><td>浈江区</td></tr>
    <tr><td><code>440205</code></td><td>广东省</td><td>韶关市</td><td>曲江区</td></tr>
    <tr><td><code>440222</code></td><td>广东省</td><td>韶关市</td><td>始兴县</td></tr>
    <tr><td><code>440224</code></td><td>广东省</td><td>韶关市</td><td>仁化县</td></tr>
    <tr><td><code>440229</code></td><td>广东省</td><td>韶关市</td><td>翁源县</td></tr>
    <tr><td><code>440232</code></td><td>广东省</td><td>韶关市</td><td>乳源瑶族自治县</td></tr>
    <tr><td><code>440233</code></td><td>广东省</td><td>韶关市</td><td>新丰县</td></tr>
    <tr><td><code>440281</code></td><td>广东省</td><td>韶关市</td><td>乐昌市</td></tr>
    <tr><td><code>440282</code></td><td>广东省</td><td>韶关市</td><td>南雄市</td></tr>
    <tr class="level-city"><td><code>440300</code></td><td>广东省</td><td>深圳市</td><td></td></tr>
    <tr><td><code>440303</code></td><td>广东省</td><td>深圳市</td><td>罗湖区</td></tr>
    <tr><td><code>440304</code></td><td>广东省</td><td>深圳市</td><td>福田区</td></tr>
    <tr><td><code>440305</code></td><td>广东省</td><td>深圳市</td><td>南山区</td></tr>
    <tr><td><code>440306</code></td><td>广东省</td><td>深圳市</td><td>宝安区</td></tr>
    <tr><td><code>440307</code></td><td>广东省</td><td>深圳市</td><td>龙岗区</td></tr>
    <tr><td><code>440308</code></td><td>广东省</td><td>深圳市</td><td>盐田区</td></tr>
    <tr><td><code>440309</code></td><td>广东省</td><td>深圳市</td><td>龙华区</td></tr>
    <tr><td><code>440310</code></td><td>广东省</td><td>深圳市</td><td>坪山区</td></tr>
    <tr class="level-city"><td><code>440400</code></td><td>广东省</td><td>珠海市</td><td></td></tr>
    <tr><td><code>440402</code></td><td>广东省</td><td>珠海市</td><td>香洲区</td></tr>
    <tr><td><code>440403</code></td><td>广东省</td><td>珠海市</td><td>斗门区</td></tr>
    <tr><td><code>440404</code></td><td>广东省</td><td>珠海市</td><td>金湾区</td></tr>
    <tr><td><code>440499</code></td><td>广东省</td><td>珠海市</td><td>香洲区(由澳门特别行政区实施管辖)</td></tr>
    <tr class="level-city"><td><code>440500</code></td><td>广东省</td><td>汕头市</td><td></td></tr>
    <tr><td><code>440507</code></td><td>广东省</td><td>汕头市</td><td>龙湖区</td></tr>
    <tr><td><code>440511</code></td><td>广东省</td><td>汕头市</td><td>金平区</td></tr>
    <tr><td><code>440512</code></td><td>广东省</td><td>汕头市</td><td>濠江区</td></tr>
    <tr><td><code>440513</code></td><td>广东省</td><td>汕头市</td><td>潮阳区</td></tr>
    <tr><td><code>440514</code></td><td>广东省</td><td>汕头市</td><td>潮南区</td></tr>
    <tr><td><code>440515</code></td><td>广东省</td><td>汕头市</td><td>澄海区</td></tr>
    <tr><td><code>440523</code></td><td>广东省</td><td>汕头市</td><td>南澳县</td></tr>
    <tr class="level-city"><td><code>440600</code></td><td>广东省</td><td>佛山市</td><td></td></tr>
    <tr><td><code>440604</code></td><td>广东省</td><td>佛山市</td><td>禅城区</td></tr>
    <tr><td><code>440605</code></td><td>广东省</td><td>佛山市</td><td>南海区</td></tr>
    <tr><td><code>440606</code></td><td>广东省</td><td>佛山市</td><td>顺德区</td></tr>
    <tr><td><code>440607</code></td><td>广东省</td><td>佛山市</td><td>三水区</td></tr>
    <tr><td><code>440608</code></td><td>广东省</td><td>佛山市</td><td>高明区</td></tr>
    <tr class="level-city"><td><code>440700</code></td><td>广东省</td><td>江门市</td><td></td></tr>
    <tr><td><code>440703</code></td><td>广东省</td><td>江门市</td><td>蓬江区</td></tr>
    <tr><td><code>440704</code></td><td>广东省</td><td>江门市</td><td>江海区</td></tr>
    <tr><td><code>440705</code></td><td>广东省</td><td>江门市</td><td>新会区</td></tr>
    <tr><td><code>440781</code></td><td>广东省</td><td>江门市</td><td>台山市</td></tr>
    <tr><td><code>440783</code></td><td>广东省</td><td>江门市</td><td>开平市</td></tr>
    <tr><td><code>440784</code></td><td>广东省</td><td>江门市</td><td>鹤山市</td></tr>
    <tr><td><code>440785</code></td><td>广东省</td><td>江门市</td><td>恩平市</td></tr>
    <tr class="level-city"><td><code>440800</code></td><td>广东省</td><td>湛江市</td><td></td></tr>
    <tr><td><code>440802</code></td><td>广东省</td><td>湛江市</td><td>赤坎区</td></tr>
    <tr><td><code>440803</code></td><td>广东省</td><td>湛江市</td><td>霞山区</td></tr>
    <tr><td><code>440804</code></td><td>广东省</td><td>湛江市</td><td>坡头区</td></tr>
    <tr><td><code>440811</code></td><td>广东省</td><td>湛江市</td><td>麻章区</td></tr>
    <tr><td><code>440823</code></td><td>广东省</td><td>湛江市</td><td>遂溪县</td></tr>
    <tr><td><code>440825</code></td><td>广东省</td><td>湛江市</td><td>徐闻县</td></tr>
    <tr><td><code>440881</code></td><td>广东省</td><td>湛江市</td><td>廉江市</td></tr>
    <tr><td><code>440882</code></td><td>广东省</td><td>湛江市</td><td>雷州市</td></tr>
    <tr><td><code>440883</code></td><td>广东省</td><td>湛江市</td><td>吴川市</td></tr>
    <tr class="level-city"><td><code>440900</code></td><td>广东省</td><td>茂名市</td><td></td></tr>
    <tr><td><code>440902</code></td><td>广东省</td><td>茂名市</td><td>茂南区</td></tr>
    <tr><td><code>440904</code></td><td>广东省</td><td>茂名市</td><td>电白区</td></tr>
    <tr><td><code>440981</code></td><td>广东省</td><td>茂名市</td><td>高州市</td></tr>
    <tr><td><code>440982</code></td><td>广东省</td><td>茂名市</td><td>化州市</td></tr>
    <tr><td><code>440983</code></td><td>广东省</td><td>茂名市</td><td>信宜市</td></tr>
    <tr class="level-city"><td><code>441200</code></td><td>广东省</td><td>肇庆市</td><td></td></tr>
    <tr><td><code>441202</code></td><td>广东省</td><td>肇庆市</td><td>端州区</td></tr>
    <tr><td><code>441203</code></td><td>广东省</td><td>肇庆市</td><td>鼎湖区</td></tr>
    <tr><td><code>441204</code></td><td>广东省</td><td>肇庆市</td><td>高要区</td></tr>
    <tr><td><code>441223</code></td><td>广东省</td><td>肇庆市</td><td>广宁县</td></tr>
    <tr><td><code>441224</code></td><td>广东省</td><td>肇庆市</td><td>怀集县</td></tr>
    <tr><td><code>441225</code></td><td>广东省</td><td>肇庆市</td><td>封开县</td></tr>
    <tr><td><code>441226</code></td><td>广东省</td><td>肇庆市</td><td>德庆县</td></tr>
    <tr><td><code>441284</code></td><td>广东省</td><td>肇庆市</td><td>四会市</td></tr>
    <tr class="level-city"><td><code>441300</code></td><td>广东省</td><td>惠州市</td><td></td></tr>
    <tr><td><code>441302</code></td><td>广东省</td><td>惠州市</td><td>惠城区</td></tr>
    <tr><td><code>441303</code></td><td>广东省</td><td>惠州市</td><td>惠阳区</td></tr>
    <tr><td><code>441322</code></td><td>广东省</td><td>惠州市</td><td>博罗县</td></tr>
    <tr><td><code>441323</code></td><td>广东省</td><td>惠州市</td><td>惠东县</td></tr>
    <tr><td><code>441324</code></td><td>广东省</td><td>惠州市</td><td>龙门县</td></tr>
    <tr class="level-city"><td><code>441400</code></td><td>广东省</td><td>梅州市</td><td></td></tr>
    <tr><td><code>441402</code></td><td>广东省</td><td>梅州市</td><td>梅江区</td></tr>
    <tr><td><code>441403</code></td><td>广东省</td><td>梅州市</td><td>梅县区</td></tr>
    <tr><td><code>441422</code></td><td>广东省</td><td>梅州市</td><td>大埔县</td></tr>
    <tr><td><code>441423</code></td><td>广东省</td><td>梅州市</td><td>丰顺县</td></tr>
    <tr><td><code>441424</code></td><td>广东省</td><td>梅州市</td><td>五华县</td></tr>
    <tr><td><code>441426</code></td><td>广东省</td><td>梅州市</td><td>平远县</td></tr>
    <tr><td><code>441427</code></td><td>广东省</td><td>梅州市</td><td>蕉岭县</td></tr>
    <tr><td><code>441481</code></td><td>广东省</td><td>梅州市</td><td>兴宁市</td></tr>
    <tr class="level-city"><td><code>441500</code></td><td>广东省</td><td>汕尾市</td><td></td></tr>
    <tr><td><code>441502</code></td><td>广东省</td><td>汕尾市</td><td>城区</td></tr>
    <tr><td><code>441521</code></td><td>广东省</td><td>汕尾市</td><td>海丰县</td></tr>
    <tr><td><code>441523</code></td><td>广东省</td><td>汕尾市</td><td>陆河县</td></tr>
    <tr><td><code>441581</code></td><td>广东省</td><td>汕尾市</td><td>陆丰市</td></tr>
    <tr class="level-city"><td><code>441600</code></td><td>广东省</td><td>河源市</td><td></td></tr>
    <tr><td><code>441602</code></td><td>广东省</td><td>河源市</td><td>源城区</td></tr>
    <tr><td><code>441621</code></td><td>广东省</td><td>河源市</td><td>紫金县</td></tr>
    <tr><td><code>441622</code></td><td>广东省</td><td>河源市</td><td>龙川县</td></tr>
    <tr><td><code>441623</code></td><td>广东省</td><td>河源市</td><td>连平县</td></tr>
    <tr><td><code>441624</code></td><td>广东省</td><td>河源市</td><td>和平县</td></tr>
    <tr><td><code>441625</code></td><td>广东省</td><td>河源市</td><td>东源县</td></tr>
    <tr class="level-city"><td><code>441700</code></td><td>广东省</td><td>阳江市</td><td></td></tr>
    <tr><td><code>441702</code></td><td>广东省</td><td>阳江市</td><td>江城区</td></tr>
    <tr><td><code>441704</code></td><td>广东省</td><td>阳江市</td><td>阳东区</td></tr>
    <tr><td><code>441721</code></td><td>广东省</td><td>阳江市</td><td>阳西县</td></tr>
    <tr><td><code>441781</code></td><td>广东省</td><td>阳江市</td><td>阳春市</td></tr>
    <tr class="level-city"><td><code>441800</code></td><td>广东省</td><td>清远市</td><td></td></tr>
    <tr><td><code>441802</code></td><td>广东省</td><td>清远市</td><td>清城区</td></tr>
    <tr><td><code>441803</code></td><td>广东省</td><td>清远市</td><td>清新区</td></tr>
    <tr><td><code>441821</code></td><td>广东省</td><td>清远市</td><td>佛冈县</td></tr>
    <tr><td><code>441823</code></td><td>广东省</td><td>清远市</td><td>阳山县</td></tr>
    <tr><td><code>441825</code></td><td>广东省</td><td>清远市</td><td>连山壮族瑶族自治县</td></tr>
    <tr><td><code>441826</code></td><td>广东省</td><td>清远市</td><td>连南瑶族自治县</td></tr>
    <tr><td><code>441881</code></td><td>广东省</td><td>清远市</td><td>英德市</td></tr>
    <tr><td><code>441882</code></td><td>广东省</td><td>清远市</td><td>连州市</td></tr>
    <tr class="level-city"><td><code>441900</code></td><td>广东省</td><td>东莞市</td><td></td></tr>
    <tr class="level-city"><td><code>442000</code></td><td>广东省</td><td>中山市</td><td></td></tr>
    <tr class="level-city"><td><code>445100</code></td><td>广东省</td><td>潮州市</td><td></td></tr>
    <tr><td><code>445102</code></td><td>广东省</td><td>潮州市</td><td>湘桥区</td></tr>
    <tr><td><code>445103</code></td><td>广东省</td><td>潮州市</td><td>潮安区</td></tr>
    <tr><td><code>445122</code></td><td>广东省</td><td>潮州市</td><td>饶平县</td></tr>
    <tr class="level-city"><td><code>445200</code></td><td>广东省</td><td>揭阳市</td><td></td></tr>
    <tr><td><code>445202</code></td><td>广东省</td><td>揭阳市</td><td>榕城区</td></tr>
    <tr><td><code>445203</code></td><td>广东省</td><td>揭阳市</td><td>揭东区</td></tr>
    <tr><td><code>445222</code></td><td>广东省</td><td>揭阳市</td><td>揭西县</td></tr>
    <tr><td><code>445224</code></td><td>广东省</td><td>揭阳市</td><td>惠来县</td></tr>
    <tr><td><code>445281</code></td><td>广东省</td><td>揭阳市</td><td>普宁市</td></tr>
    <tr class="level-city"><td><code>445300</code></td><td>广东省</td><td>云浮市</td><td></td></tr>
    <tr><td><code>445302</code></td><td>广东省</td><td>云浮市</td><td>云城区</td></tr>
    <tr><td><code>445303</code></td><td>广东省</td><td>云浮市</td><td>云安区</td></tr>
    <tr><td><code>445321</code></td><td>广东省</td><td>云浮市</td><td>新兴县</td></tr>
    <tr><td><code>445322</code></td><td>广东省</td><td>云浮市</td><td>郁南县</td></tr>
    <tr><td><code>445381</code></td><td>广东省</td><td>云浮市</td><td>罗定市</td></tr>
  </tbody>
</table>
</div>


## 广西壮族自治区（450000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>450000</code></td><td>广西壮族自治区</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>450100</code></td><td>广西壮族自治区</td><td>南宁市</td><td></td></tr>
    <tr><td><code>450102</code></td><td>广西壮族自治区</td><td>南宁市</td><td>兴宁区</td></tr>
    <tr><td><code>450103</code></td><td>广西壮族自治区</td><td>南宁市</td><td>青秀区</td></tr>
    <tr><td><code>450105</code></td><td>广西壮族自治区</td><td>南宁市</td><td>江南区</td></tr>
    <tr><td><code>450107</code></td><td>广西壮族自治区</td><td>南宁市</td><td>西乡塘区</td></tr>
    <tr><td><code>450108</code></td><td>广西壮族自治区</td><td>南宁市</td><td>良庆区</td></tr>
    <tr><td><code>450109</code></td><td>广西壮族自治区</td><td>南宁市</td><td>邕宁区</td></tr>
    <tr><td><code>450110</code></td><td>广西壮族自治区</td><td>南宁市</td><td>武鸣区</td></tr>
    <tr><td><code>450123</code></td><td>广西壮族自治区</td><td>南宁市</td><td>隆安县</td></tr>
    <tr><td><code>450124</code></td><td>广西壮族自治区</td><td>南宁市</td><td>马山县</td></tr>
    <tr><td><code>450125</code></td><td>广西壮族自治区</td><td>南宁市</td><td>上林县</td></tr>
    <tr><td><code>450126</code></td><td>广西壮族自治区</td><td>南宁市</td><td>宾阳县</td></tr>
    <tr><td><code>450127</code></td><td>广西壮族自治区</td><td>南宁市</td><td>横县</td></tr>
    <tr class="level-city"><td><code>450200</code></td><td>广西壮族自治区</td><td>柳州市</td><td></td></tr>
    <tr><td><code>450202</code></td><td>广西壮族自治区</td><td>柳州市</td><td>城中区</td></tr>
    <tr><td><code>450203</code></td><td>广西壮族自治区</td><td>柳州市</td><td>鱼峰区</td></tr>
    <tr><td><code>450204</code></td><td>广西壮族自治区</td><td>柳州市</td><td>柳南区</td></tr>
    <tr><td><code>450205</code></td><td>广西壮族自治区</td><td>柳州市</td><td>柳北区</td></tr>
    <tr><td><code>450206</code></td><td>广西壮族自治区</td><td>柳州市</td><td>柳江区</td></tr>
    <tr><td><code>450222</code></td><td>广西壮族自治区</td><td>柳州市</td><td>柳城县</td></tr>
    <tr><td><code>450223</code></td><td>广西壮族自治区</td><td>柳州市</td><td>鹿寨县</td></tr>
    <tr><td><code>450224</code></td><td>广西壮族自治区</td><td>柳州市</td><td>融安县</td></tr>
    <tr><td><code>450225</code></td><td>广西壮族自治区</td><td>柳州市</td><td>融水苗族自治县</td></tr>
    <tr><td><code>450226</code></td><td>广西壮族自治区</td><td>柳州市</td><td>三江侗族自治县</td></tr>
    <tr class="level-city"><td><code>450300</code></td><td>广西壮族自治区</td><td>桂林市</td><td></td></tr>
    <tr><td><code>450302</code></td><td>广西壮族自治区</td><td>桂林市</td><td>秀峰区</td></tr>
    <tr><td><code>450303</code></td><td>广西壮族自治区</td><td>桂林市</td><td>叠彩区</td></tr>
    <tr><td><code>450304</code></td><td>广西壮族自治区</td><td>桂林市</td><td>象山区</td></tr>
    <tr><td><code>450305</code></td><td>广西壮族自治区</td><td>桂林市</td><td>七星区</td></tr>
    <tr><td><code>450311</code></td><td>广西壮族自治区</td><td>桂林市</td><td>雁山区</td></tr>
    <tr><td><code>450312</code></td><td>广西壮族自治区</td><td>桂林市</td><td>临桂区</td></tr>
    <tr><td><code>450321</code></td><td>广西壮族自治区</td><td>桂林市</td><td>阳朔县</td></tr>
    <tr><td><code>450323</code></td><td>广西壮族自治区</td><td>桂林市</td><td>灵川县</td></tr>
    <tr><td><code>450324</code></td><td>广西壮族自治区</td><td>桂林市</td><td>全州县</td></tr>
    <tr><td><code>450325</code></td><td>广西壮族自治区</td><td>桂林市</td><td>兴安县</td></tr>
    <tr><td><code>450326</code></td><td>广西壮族自治区</td><td>桂林市</td><td>永福县</td></tr>
    <tr><td><code>450327</code></td><td>广西壮族自治区</td><td>桂林市</td><td>灌阳县</td></tr>
    <tr><td><code>450328</code></td><td>广西壮族自治区</td><td>桂林市</td><td>龙胜各族自治县</td></tr>
    <tr><td><code>450329</code></td><td>广西壮族自治区</td><td>桂林市</td><td>资源县</td></tr>
    <tr><td><code>450330</code></td><td>广西壮族自治区</td><td>桂林市</td><td>平乐县</td></tr>
    <tr><td><code>450331</code></td><td>广西壮族自治区</td><td>桂林市</td><td>荔浦县</td></tr>
    <tr><td><code>450332</code></td><td>广西壮族自治区</td><td>桂林市</td><td>恭城瑶族自治县</td></tr>
    <tr class="level-city"><td><code>450400</code></td><td>广西壮族自治区</td><td>梧州市</td><td></td></tr>
    <tr><td><code>450403</code></td><td>广西壮族自治区</td><td>梧州市</td><td>万秀区</td></tr>
    <tr><td><code>450405</code></td><td>广西壮族自治区</td><td>梧州市</td><td>长洲区</td></tr>
    <tr><td><code>450406</code></td><td>广西壮族自治区</td><td>梧州市</td><td>龙圩区</td></tr>
    <tr><td><code>450421</code></td><td>广西壮族自治区</td><td>梧州市</td><td>苍梧县</td></tr>
    <tr><td><code>450422</code></td><td>广西壮族自治区</td><td>梧州市</td><td>藤县</td></tr>
    <tr><td><code>450423</code></td><td>广西壮族自治区</td><td>梧州市</td><td>蒙山县</td></tr>
    <tr><td><code>450481</code></td><td>广西壮族自治区</td><td>梧州市</td><td>岑溪市</td></tr>
    <tr class="level-city"><td><code>450500</code></td><td>广西壮族自治区</td><td>北海市</td><td></td></tr>
    <tr><td><code>450502</code></td><td>广西壮族自治区</td><td>北海市</td><td>海城区</td></tr>
    <tr><td><code>450503</code></td><td>广西壮族自治区</td><td>北海市</td><td>银海区</td></tr>
    <tr><td><code>450512</code></td><td>广西壮族自治区</td><td>北海市</td><td>铁山港区</td></tr>
    <tr><td><code>450521</code></td><td>广西壮族自治区</td><td>北海市</td><td>合浦县</td></tr>
    <tr class="level-city"><td><code>450600</code></td><td>广西壮族自治区</td><td>防城港市</td><td></td></tr>
    <tr><td><code>450602</code></td><td>广西壮族自治区</td><td>防城港市</td><td>港口区</td></tr>
    <tr><td><code>450603</code></td><td>广西壮族自治区</td><td>防城港市</td><td>防城区</td></tr>
    <tr><td><code>450621</code></td><td>广西壮族自治区</td><td>防城港市</td><td>上思县</td></tr>
    <tr><td><code>450681</code></td><td>广西壮族自治区</td><td>防城港市</td><td>东兴市</td></tr>
    <tr class="level-city"><td><code>450700</code></td><td>广西壮族自治区</td><td>钦州市</td><td></td></tr>
    <tr><td><code>450702</code></td><td>广西壮族自治区</td><td>钦州市</td><td>钦南区</td></tr>
    <tr><td><code>450703</code></td><td>广西壮族自治区</td><td>钦州市</td><td>钦北区</td></tr>
    <tr><td><code>450721</code></td><td>广西壮族自治区</td><td>钦州市</td><td>灵山县</td></tr>
    <tr><td><code>450722</code></td><td>广西壮族自治区</td><td>钦州市</td><td>浦北县</td></tr>
    <tr class="level-city"><td><code>450800</code></td><td>广西壮族自治区</td><td>贵港市</td><td></td></tr>
    <tr><td><code>450802</code></td><td>广西壮族自治区</td><td>贵港市</td><td>港北区</td></tr>
    <tr><td><code>450803</code></td><td>广西壮族自治区</td><td>贵港市</td><td>港南区</td></tr>
    <tr><td><code>450804</code></td><td>广西壮族自治区</td><td>贵港市</td><td>覃塘区</td></tr>
    <tr><td><code>450821</code></td><td>广西壮族自治区</td><td>贵港市</td><td>平南县</td></tr>
    <tr><td><code>450881</code></td><td>广西壮族自治区</td><td>贵港市</td><td>桂平市</td></tr>
    <tr class="level-city"><td><code>450900</code></td><td>广西壮族自治区</td><td>玉林市</td><td></td></tr>
    <tr><td><code>450902</code></td><td>广西壮族自治区</td><td>玉林市</td><td>玉州区</td></tr>
    <tr><td><code>450903</code></td><td>广西壮族自治区</td><td>玉林市</td><td>福绵区</td></tr>
    <tr><td><code>450921</code></td><td>广西壮族自治区</td><td>玉林市</td><td>容县</td></tr>
    <tr><td><code>450922</code></td><td>广西壮族自治区</td><td>玉林市</td><td>陆川县</td></tr>
    <tr><td><code>450923</code></td><td>广西壮族自治区</td><td>玉林市</td><td>博白县</td></tr>
    <tr><td><code>450924</code></td><td>广西壮族自治区</td><td>玉林市</td><td>兴业县</td></tr>
    <tr><td><code>450981</code></td><td>广西壮族自治区</td><td>玉林市</td><td>北流市</td></tr>
    <tr class="level-city"><td><code>451000</code></td><td>广西壮族自治区</td><td>百色市</td><td></td></tr>
    <tr><td><code>451002</code></td><td>广西壮族自治区</td><td>百色市</td><td>右江区</td></tr>
    <tr><td><code>451021</code></td><td>广西壮族自治区</td><td>百色市</td><td>田阳县</td></tr>
    <tr><td><code>451022</code></td><td>广西壮族自治区</td><td>百色市</td><td>田东县</td></tr>
    <tr><td><code>451023</code></td><td>广西壮族自治区</td><td>百色市</td><td>平果县</td></tr>
    <tr><td><code>451024</code></td><td>广西壮族自治区</td><td>百色市</td><td>德保县</td></tr>
    <tr><td><code>451026</code></td><td>广西壮族自治区</td><td>百色市</td><td>那坡县</td></tr>
    <tr><td><code>451027</code></td><td>广西壮族自治区</td><td>百色市</td><td>凌云县</td></tr>
    <tr><td><code>451028</code></td><td>广西壮族自治区</td><td>百色市</td><td>乐业县</td></tr>
    <tr><td><code>451029</code></td><td>广西壮族自治区</td><td>百色市</td><td>田林县</td></tr>
    <tr><td><code>451030</code></td><td>广西壮族自治区</td><td>百色市</td><td>西林县</td></tr>
    <tr><td><code>451031</code></td><td>广西壮族自治区</td><td>百色市</td><td>隆林各族自治县</td></tr>
    <tr><td><code>451081</code></td><td>广西壮族自治区</td><td>百色市</td><td>靖西市</td></tr>
    <tr class="level-city"><td><code>451100</code></td><td>广西壮族自治区</td><td>贺州市</td><td></td></tr>
    <tr><td><code>451102</code></td><td>广西壮族自治区</td><td>贺州市</td><td>八步区</td></tr>
    <tr><td><code>451103</code></td><td>广西壮族自治区</td><td>贺州市</td><td>平桂区</td></tr>
    <tr><td><code>451121</code></td><td>广西壮族自治区</td><td>贺州市</td><td>昭平县</td></tr>
    <tr><td><code>451122</code></td><td>广西壮族自治区</td><td>贺州市</td><td>钟山县</td></tr>
    <tr><td><code>451123</code></td><td>广西壮族自治区</td><td>贺州市</td><td>富川瑶族自治县</td></tr>
    <tr class="level-city"><td><code>451200</code></td><td>广西壮族自治区</td><td>河池市</td><td></td></tr>
    <tr><td><code>451202</code></td><td>广西壮族自治区</td><td>河池市</td><td>金城江区</td></tr>
    <tr><td><code>451203</code></td><td>广西壮族自治区</td><td>河池市</td><td>宜州区</td></tr>
    <tr><td><code>451221</code></td><td>广西壮族自治区</td><td>河池市</td><td>南丹县</td></tr>
    <tr><td><code>451222</code></td><td>广西壮族自治区</td><td>河池市</td><td>天峨县</td></tr>
    <tr><td><code>451223</code></td><td>广西壮族自治区</td><td>河池市</td><td>凤山县</td></tr>
    <tr><td><code>451224</code></td><td>广西壮族自治区</td><td>河池市</td><td>东兰县</td></tr>
    <tr><td><code>451225</code></td><td>广西壮族自治区</td><td>河池市</td><td>罗城仫佬族自治县</td></tr>
    <tr><td><code>451226</code></td><td>广西壮族自治区</td><td>河池市</td><td>环江毛南族自治县</td></tr>
    <tr><td><code>451227</code></td><td>广西壮族自治区</td><td>河池市</td><td>巴马瑶族自治县</td></tr>
    <tr><td><code>451228</code></td><td>广西壮族自治区</td><td>河池市</td><td>都安瑶族自治县</td></tr>
    <tr><td><code>451229</code></td><td>广西壮族自治区</td><td>河池市</td><td>大化瑶族自治县</td></tr>
    <tr class="level-city"><td><code>451300</code></td><td>广西壮族自治区</td><td>来宾市</td><td></td></tr>
    <tr><td><code>451302</code></td><td>广西壮族自治区</td><td>来宾市</td><td>兴宾区</td></tr>
    <tr><td><code>451321</code></td><td>广西壮族自治区</td><td>来宾市</td><td>忻城县</td></tr>
    <tr><td><code>451322</code></td><td>广西壮族自治区</td><td>来宾市</td><td>象州县</td></tr>
    <tr><td><code>451323</code></td><td>广西壮族自治区</td><td>来宾市</td><td>武宣县</td></tr>
    <tr><td><code>451324</code></td><td>广西壮族自治区</td><td>来宾市</td><td>金秀瑶族自治县</td></tr>
    <tr><td><code>451381</code></td><td>广西壮族自治区</td><td>来宾市</td><td>合山市</td></tr>
    <tr class="level-city"><td><code>451400</code></td><td>广西壮族自治区</td><td>崇左市</td><td></td></tr>
    <tr><td><code>451402</code></td><td>广西壮族自治区</td><td>崇左市</td><td>江州区</td></tr>
    <tr><td><code>451421</code></td><td>广西壮族自治区</td><td>崇左市</td><td>扶绥县</td></tr>
    <tr><td><code>451422</code></td><td>广西壮族自治区</td><td>崇左市</td><td>宁明县</td></tr>
    <tr><td><code>451423</code></td><td>广西壮族自治区</td><td>崇左市</td><td>龙州县</td></tr>
    <tr><td><code>451424</code></td><td>广西壮族自治区</td><td>崇左市</td><td>大新县</td></tr>
    <tr><td><code>451425</code></td><td>广西壮族自治区</td><td>崇左市</td><td>天等县</td></tr>
    <tr><td><code>451481</code></td><td>广西壮族自治区</td><td>崇左市</td><td>凭祥市</td></tr>
  </tbody>
</table>
</div>


## 海南省（460000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>460000</code></td><td>海南省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>460100</code></td><td>海南省</td><td>海口市</td><td></td></tr>
    <tr><td><code>460105</code></td><td>海南省</td><td>海口市</td><td>秀英区</td></tr>
    <tr><td><code>460106</code></td><td>海南省</td><td>海口市</td><td>龙华区</td></tr>
    <tr><td><code>460107</code></td><td>海南省</td><td>海口市</td><td>琼山区</td></tr>
    <tr><td><code>460108</code></td><td>海南省</td><td>海口市</td><td>美兰区</td></tr>
    <tr class="level-city"><td><code>460200</code></td><td>海南省</td><td>三亚市</td><td></td></tr>
    <tr><td><code>460202</code></td><td>海南省</td><td>三亚市</td><td>海棠区</td></tr>
    <tr><td><code>460203</code></td><td>海南省</td><td>三亚市</td><td>吉阳区</td></tr>
    <tr><td><code>460204</code></td><td>海南省</td><td>三亚市</td><td>天涯区</td></tr>
    <tr><td><code>460205</code></td><td>海南省</td><td>三亚市</td><td>崖州区</td></tr>
    <tr class="level-city"><td><code>460300</code></td><td>海南省</td><td>三沙市</td><td></td></tr>
    <tr><td><code>460321</code></td><td>海南省</td><td>三沙市</td><td>西沙群岛</td></tr>
    <tr><td><code>460322</code></td><td>海南省</td><td>三沙市</td><td>南沙群岛</td></tr>
    <tr><td><code>460323</code></td><td>海南省</td><td>三沙市</td><td>中沙群岛的岛礁及其海域</td></tr>
    <tr class="level-city"><td><code>460400</code></td><td>海南省</td><td>儋州市</td><td></td></tr>
    <tr><td><code>469001</code></td><td>海南省</td><td>五指山市</td><td>五指山市</td></tr>
    <tr><td><code>469002</code></td><td>海南省</td><td>琼海市</td><td>琼海市</td></tr>
    <tr><td><code>469005</code></td><td>海南省</td><td>文昌市</td><td>文昌市</td></tr>
    <tr><td><code>469006</code></td><td>海南省</td><td>万宁市</td><td>万宁市</td></tr>
    <tr><td><code>469007</code></td><td>海南省</td><td>东方市</td><td>东方市</td></tr>
    <tr><td><code>469021</code></td><td>海南省</td><td>定安县</td><td>定安县</td></tr>
    <tr><td><code>469022</code></td><td>海南省</td><td>屯昌县</td><td>屯昌县</td></tr>
    <tr><td><code>469023</code></td><td>海南省</td><td>澄迈县</td><td>澄迈县</td></tr>
    <tr><td><code>469024</code></td><td>海南省</td><td>临高县</td><td>临高县</td></tr>
    <tr><td><code>469025</code></td><td>海南省</td><td>白沙黎族自治县</td><td>白沙黎族自治县</td></tr>
    <tr><td><code>469026</code></td><td>海南省</td><td>昌江黎族自治县</td><td>昌江黎族自治县</td></tr>
    <tr><td><code>469027</code></td><td>海南省</td><td>乐东黎族自治县</td><td>乐东黎族自治县</td></tr>
    <tr><td><code>469028</code></td><td>海南省</td><td>陵水黎族自治县</td><td>陵水黎族自治县</td></tr>
    <tr><td><code>469029</code></td><td>海南省</td><td>保亭黎族苗族自治县</td><td>保亭黎族苗族自治县</td></tr>
    <tr><td><code>469030</code></td><td>海南省</td><td>琼中黎族苗族自治县</td><td>琼中黎族苗族自治县</td></tr>
  </tbody>
</table>
</div>


## 重庆市（500000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>500000</code></td><td>重庆市</td><td></td><td></td></tr>
    <tr><td><code>500101</code></td><td>重庆市</td><td>万州区</td><td></td></tr>
    <tr><td><code>500102</code></td><td>重庆市</td><td>涪陵区</td><td></td></tr>
    <tr><td><code>500103</code></td><td>重庆市</td><td>渝中区</td><td></td></tr>
    <tr><td><code>500104</code></td><td>重庆市</td><td>大渡口区</td><td></td></tr>
    <tr><td><code>500105</code></td><td>重庆市</td><td>江北区</td><td></td></tr>
    <tr><td><code>500106</code></td><td>重庆市</td><td>沙坪坝区</td><td></td></tr>
    <tr><td><code>500107</code></td><td>重庆市</td><td>九龙坡区</td><td></td></tr>
    <tr><td><code>500108</code></td><td>重庆市</td><td>南岸区</td><td></td></tr>
    <tr><td><code>500109</code></td><td>重庆市</td><td>北碚区</td><td></td></tr>
    <tr><td><code>500110</code></td><td>重庆市</td><td>綦江区</td><td></td></tr>
    <tr><td><code>500111</code></td><td>重庆市</td><td>大足区</td><td></td></tr>
    <tr><td><code>500112</code></td><td>重庆市</td><td>渝北区</td><td></td></tr>
    <tr><td><code>500113</code></td><td>重庆市</td><td>巴南区</td><td></td></tr>
    <tr><td><code>500114</code></td><td>重庆市</td><td>黔江区</td><td></td></tr>
    <tr><td><code>500115</code></td><td>重庆市</td><td>长寿区</td><td></td></tr>
    <tr><td><code>500116</code></td><td>重庆市</td><td>江津区</td><td></td></tr>
    <tr><td><code>500117</code></td><td>重庆市</td><td>合川区</td><td></td></tr>
    <tr><td><code>500118</code></td><td>重庆市</td><td>永川区</td><td></td></tr>
    <tr><td><code>500119</code></td><td>重庆市</td><td>南川区</td><td></td></tr>
    <tr><td><code>500120</code></td><td>重庆市</td><td>璧山区</td><td></td></tr>
    <tr><td><code>500151</code></td><td>重庆市</td><td>铜梁区</td><td></td></tr>
    <tr><td><code>500152</code></td><td>重庆市</td><td>潼南区</td><td></td></tr>
    <tr><td><code>500153</code></td><td>重庆市</td><td>荣昌区</td><td></td></tr>
    <tr><td><code>500154</code></td><td>重庆市</td><td>开州区</td><td></td></tr>
    <tr><td><code>500155</code></td><td>重庆市</td><td>梁平区</td><td></td></tr>
    <tr><td><code>500156</code></td><td>重庆市</td><td>武隆区</td><td></td></tr>
    <tr><td><code>500229</code></td><td>重庆市</td><td>城口县</td><td></td></tr>
    <tr><td><code>500230</code></td><td>重庆市</td><td>丰都县</td><td></td></tr>
    <tr><td><code>500231</code></td><td>重庆市</td><td>垫江县</td><td></td></tr>
    <tr><td><code>500233</code></td><td>重庆市</td><td>忠县</td><td></td></tr>
    <tr><td><code>500235</code></td><td>重庆市</td><td>云阳县</td><td></td></tr>
    <tr><td><code>500236</code></td><td>重庆市</td><td>奉节县</td><td></td></tr>
    <tr><td><code>500237</code></td><td>重庆市</td><td>巫山县</td><td></td></tr>
    <tr><td><code>500238</code></td><td>重庆市</td><td>巫溪县</td><td></td></tr>
    <tr><td><code>500240</code></td><td>重庆市</td><td>重庆市</td><td>石柱土家族自治县</td></tr>
    <tr><td><code>500241</code></td><td>重庆市</td><td>重庆市</td><td>秀山土家族苗族自治县</td></tr>
    <tr><td><code>500242</code></td><td>重庆市</td><td>重庆市</td><td>酉阳土家族苗族自治县</td></tr>
    <tr><td><code>500243</code></td><td>重庆市</td><td>重庆市</td><td>彭水苗族土家族自治县</td></tr>
  </tbody>
</table>
</div>


## 四川省（510000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>510000</code></td><td>四川省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>510100</code></td><td>四川省</td><td>成都市</td><td></td></tr>
    <tr><td><code>510104</code></td><td>四川省</td><td>成都市</td><td>锦江区</td></tr>
    <tr><td><code>510105</code></td><td>四川省</td><td>成都市</td><td>青羊区</td></tr>
    <tr><td><code>510106</code></td><td>四川省</td><td>成都市</td><td>金牛区</td></tr>
    <tr><td><code>510107</code></td><td>四川省</td><td>成都市</td><td>武侯区</td></tr>
    <tr><td><code>510108</code></td><td>四川省</td><td>成都市</td><td>成华区</td></tr>
    <tr><td><code>510112</code></td><td>四川省</td><td>成都市</td><td>龙泉驿区</td></tr>
    <tr><td><code>510113</code></td><td>四川省</td><td>成都市</td><td>青白江区</td></tr>
    <tr><td><code>510114</code></td><td>四川省</td><td>成都市</td><td>新都区</td></tr>
    <tr><td><code>510115</code></td><td>四川省</td><td>成都市</td><td>温江区</td></tr>
    <tr><td><code>510116</code></td><td>四川省</td><td>成都市</td><td>双流区</td></tr>
    <tr><td><code>510117</code></td><td>四川省</td><td>成都市</td><td>郫都区</td></tr>
    <tr><td><code>510121</code></td><td>四川省</td><td>成都市</td><td>金堂县</td></tr>
    <tr><td><code>510129</code></td><td>四川省</td><td>成都市</td><td>大邑县</td></tr>
    <tr><td><code>510131</code></td><td>四川省</td><td>成都市</td><td>蒲江县</td></tr>
    <tr><td><code>510132</code></td><td>四川省</td><td>成都市</td><td>新津县</td></tr>
    <tr><td><code>510181</code></td><td>四川省</td><td>成都市</td><td>都江堰市</td></tr>
    <tr><td><code>510182</code></td><td>四川省</td><td>成都市</td><td>彭州市</td></tr>
    <tr><td><code>510183</code></td><td>四川省</td><td>成都市</td><td>邛崃市</td></tr>
    <tr><td><code>510184</code></td><td>四川省</td><td>成都市</td><td>崇州市</td></tr>
    <tr><td><code>510185</code></td><td>四川省</td><td>成都市</td><td>简阳市</td></tr>
    <tr class="level-city"><td><code>510300</code></td><td>四川省</td><td>自贡市</td><td></td></tr>
    <tr><td><code>510302</code></td><td>四川省</td><td>自贡市</td><td>自流井区</td></tr>
    <tr><td><code>510303</code></td><td>四川省</td><td>自贡市</td><td>贡井区</td></tr>
    <tr><td><code>510304</code></td><td>四川省</td><td>自贡市</td><td>大安区</td></tr>
    <tr><td><code>510311</code></td><td>四川省</td><td>自贡市</td><td>沿滩区</td></tr>
    <tr><td><code>510321</code></td><td>四川省</td><td>自贡市</td><td>荣县</td></tr>
    <tr><td><code>510322</code></td><td>四川省</td><td>自贡市</td><td>富顺县</td></tr>
    <tr class="level-city"><td><code>510400</code></td><td>四川省</td><td>攀枝花市</td><td></td></tr>
    <tr><td><code>510402</code></td><td>四川省</td><td>攀枝花市</td><td>东区</td></tr>
    <tr><td><code>510403</code></td><td>四川省</td><td>攀枝花市</td><td>西区</td></tr>
    <tr><td><code>510411</code></td><td>四川省</td><td>攀枝花市</td><td>仁和区</td></tr>
    <tr><td><code>510421</code></td><td>四川省</td><td>攀枝花市</td><td>米易县</td></tr>
    <tr><td><code>510422</code></td><td>四川省</td><td>攀枝花市</td><td>盐边县</td></tr>
    <tr class="level-city"><td><code>510500</code></td><td>四川省</td><td>泸州市</td><td></td></tr>
    <tr><td><code>510502</code></td><td>四川省</td><td>泸州市</td><td>江阳区</td></tr>
    <tr><td><code>510503</code></td><td>四川省</td><td>泸州市</td><td>纳溪区</td></tr>
    <tr><td><code>510504</code></td><td>四川省</td><td>泸州市</td><td>龙马潭区</td></tr>
    <tr><td><code>510521</code></td><td>四川省</td><td>泸州市</td><td>泸县</td></tr>
    <tr><td><code>510522</code></td><td>四川省</td><td>泸州市</td><td>合江县</td></tr>
    <tr><td><code>510524</code></td><td>四川省</td><td>泸州市</td><td>叙永县</td></tr>
    <tr><td><code>510525</code></td><td>四川省</td><td>泸州市</td><td>古蔺县</td></tr>
    <tr class="level-city"><td><code>510600</code></td><td>四川省</td><td>德阳市</td><td></td></tr>
    <tr><td><code>510603</code></td><td>四川省</td><td>德阳市</td><td>旌阳区</td></tr>
    <tr><td><code>510623</code></td><td>四川省</td><td>德阳市</td><td>中江县</td></tr>
    <tr><td><code>510626</code></td><td>四川省</td><td>德阳市</td><td>罗江县</td></tr>
    <tr><td><code>510681</code></td><td>四川省</td><td>德阳市</td><td>广汉市</td></tr>
    <tr><td><code>510682</code></td><td>四川省</td><td>德阳市</td><td>什邡市</td></tr>
    <tr><td><code>510683</code></td><td>四川省</td><td>德阳市</td><td>绵竹市</td></tr>
    <tr class="level-city"><td><code>510700</code></td><td>四川省</td><td>绵阳市</td><td></td></tr>
    <tr><td><code>510703</code></td><td>四川省</td><td>绵阳市</td><td>涪城区</td></tr>
    <tr><td><code>510704</code></td><td>四川省</td><td>绵阳市</td><td>游仙区</td></tr>
    <tr><td><code>510705</code></td><td>四川省</td><td>绵阳市</td><td>安州区</td></tr>
    <tr><td><code>510722</code></td><td>四川省</td><td>绵阳市</td><td>三台县</td></tr>
    <tr><td><code>510723</code></td><td>四川省</td><td>绵阳市</td><td>盐亭县</td></tr>
    <tr><td><code>510725</code></td><td>四川省</td><td>绵阳市</td><td>梓潼县</td></tr>
    <tr><td><code>510726</code></td><td>四川省</td><td>绵阳市</td><td>北川羌族自治县</td></tr>
    <tr><td><code>510727</code></td><td>四川省</td><td>绵阳市</td><td>平武县</td></tr>
    <tr><td><code>510781</code></td><td>四川省</td><td>绵阳市</td><td>江油市</td></tr>
    <tr class="level-city"><td><code>510800</code></td><td>四川省</td><td>广元市</td><td></td></tr>
    <tr><td><code>510802</code></td><td>四川省</td><td>广元市</td><td>利州区</td></tr>
    <tr><td><code>510811</code></td><td>四川省</td><td>广元市</td><td>昭化区</td></tr>
    <tr><td><code>510812</code></td><td>四川省</td><td>广元市</td><td>朝天区</td></tr>
    <tr><td><code>510821</code></td><td>四川省</td><td>广元市</td><td>旺苍县</td></tr>
    <tr><td><code>510822</code></td><td>四川省</td><td>广元市</td><td>青川县</td></tr>
    <tr><td><code>510823</code></td><td>四川省</td><td>广元市</td><td>剑阁县</td></tr>
    <tr><td><code>510824</code></td><td>四川省</td><td>广元市</td><td>苍溪县</td></tr>
    <tr class="level-city"><td><code>510900</code></td><td>四川省</td><td>遂宁市</td><td></td></tr>
    <tr><td><code>510903</code></td><td>四川省</td><td>遂宁市</td><td>船山区</td></tr>
    <tr><td><code>510904</code></td><td>四川省</td><td>遂宁市</td><td>安居区</td></tr>
    <tr><td><code>510921</code></td><td>四川省</td><td>遂宁市</td><td>蓬溪县</td></tr>
    <tr><td><code>510922</code></td><td>四川省</td><td>遂宁市</td><td>射洪县</td></tr>
    <tr><td><code>510923</code></td><td>四川省</td><td>遂宁市</td><td>大英县</td></tr>
    <tr class="level-city"><td><code>511000</code></td><td>四川省</td><td>内江市</td><td></td></tr>
    <tr><td><code>511002</code></td><td>四川省</td><td>内江市</td><td>市中区</td></tr>
    <tr><td><code>511011</code></td><td>四川省</td><td>内江市</td><td>东兴区</td></tr>
    <tr><td><code>511024</code></td><td>四川省</td><td>内江市</td><td>威远县</td></tr>
    <tr><td><code>511025</code></td><td>四川省</td><td>内江市</td><td>资中县</td></tr>
    <tr><td><code>511083</code></td><td>四川省</td><td>内江市</td><td>隆昌市</td></tr>
    <tr class="level-city"><td><code>511100</code></td><td>四川省</td><td>乐山市</td><td></td></tr>
    <tr><td><code>511102</code></td><td>四川省</td><td>乐山市</td><td>市中区</td></tr>
    <tr><td><code>511111</code></td><td>四川省</td><td>乐山市</td><td>沙湾区</td></tr>
    <tr><td><code>511112</code></td><td>四川省</td><td>乐山市</td><td>五通桥区</td></tr>
    <tr><td><code>511113</code></td><td>四川省</td><td>乐山市</td><td>金口河区</td></tr>
    <tr><td><code>511123</code></td><td>四川省</td><td>乐山市</td><td>犍为县</td></tr>
    <tr><td><code>511124</code></td><td>四川省</td><td>乐山市</td><td>井研县</td></tr>
    <tr><td><code>511126</code></td><td>四川省</td><td>乐山市</td><td>夹江县</td></tr>
    <tr><td><code>511129</code></td><td>四川省</td><td>乐山市</td><td>沐川县</td></tr>
    <tr><td><code>511132</code></td><td>四川省</td><td>乐山市</td><td>峨边彝族自治县</td></tr>
    <tr><td><code>511133</code></td><td>四川省</td><td>乐山市</td><td>马边彝族自治县</td></tr>
    <tr><td><code>511181</code></td><td>四川省</td><td>乐山市</td><td>峨眉山市</td></tr>
    <tr class="level-city"><td><code>511300</code></td><td>四川省</td><td>南充市</td><td></td></tr>
    <tr><td><code>511302</code></td><td>四川省</td><td>南充市</td><td>顺庆区</td></tr>
    <tr><td><code>511303</code></td><td>四川省</td><td>南充市</td><td>高坪区</td></tr>
    <tr><td><code>511304</code></td><td>四川省</td><td>南充市</td><td>嘉陵区</td></tr>
    <tr><td><code>511321</code></td><td>四川省</td><td>南充市</td><td>南部县</td></tr>
    <tr><td><code>511322</code></td><td>四川省</td><td>南充市</td><td>营山县</td></tr>
    <tr><td><code>511323</code></td><td>四川省</td><td>南充市</td><td>蓬安县</td></tr>
    <tr><td><code>511324</code></td><td>四川省</td><td>南充市</td><td>仪陇县</td></tr>
    <tr><td><code>511325</code></td><td>四川省</td><td>南充市</td><td>西充县</td></tr>
    <tr><td><code>511381</code></td><td>四川省</td><td>南充市</td><td>阆中市</td></tr>
    <tr class="level-city"><td><code>511400</code></td><td>四川省</td><td>眉山市</td><td></td></tr>
    <tr><td><code>511402</code></td><td>四川省</td><td>眉山市</td><td>东坡区</td></tr>
    <tr><td><code>511403</code></td><td>四川省</td><td>眉山市</td><td>彭山区</td></tr>
    <tr><td><code>511421</code></td><td>四川省</td><td>眉山市</td><td>仁寿县</td></tr>
    <tr><td><code>511423</code></td><td>四川省</td><td>眉山市</td><td>洪雅县</td></tr>
    <tr><td><code>511424</code></td><td>四川省</td><td>眉山市</td><td>丹棱县</td></tr>
    <tr><td><code>511425</code></td><td>四川省</td><td>眉山市</td><td>青神县</td></tr>
    <tr class="level-city"><td><code>511500</code></td><td>四川省</td><td>宜宾市</td><td></td></tr>
    <tr><td><code>511502</code></td><td>四川省</td><td>宜宾市</td><td>翠屏区</td></tr>
    <tr><td><code>511503</code></td><td>四川省</td><td>宜宾市</td><td>南溪区</td></tr>
    <tr><td><code>511521</code></td><td>四川省</td><td>宜宾市</td><td>宜宾县</td></tr>
    <tr><td><code>511523</code></td><td>四川省</td><td>宜宾市</td><td>江安县</td></tr>
    <tr><td><code>511524</code></td><td>四川省</td><td>宜宾市</td><td>长宁县</td></tr>
    <tr><td><code>511525</code></td><td>四川省</td><td>宜宾市</td><td>高县</td></tr>
    <tr><td><code>511526</code></td><td>四川省</td><td>宜宾市</td><td>珙县</td></tr>
    <tr><td><code>511527</code></td><td>四川省</td><td>宜宾市</td><td>筠连县</td></tr>
    <tr><td><code>511528</code></td><td>四川省</td><td>宜宾市</td><td>兴文县</td></tr>
    <tr><td><code>511529</code></td><td>四川省</td><td>宜宾市</td><td>屏山县</td></tr>
    <tr class="level-city"><td><code>511600</code></td><td>四川省</td><td>广安市</td><td></td></tr>
    <tr><td><code>511602</code></td><td>四川省</td><td>广安市</td><td>广安区</td></tr>
    <tr><td><code>511603</code></td><td>四川省</td><td>广安市</td><td>前锋区</td></tr>
    <tr><td><code>511621</code></td><td>四川省</td><td>广安市</td><td>岳池县</td></tr>
    <tr><td><code>511622</code></td><td>四川省</td><td>广安市</td><td>武胜县</td></tr>
    <tr><td><code>511623</code></td><td>四川省</td><td>广安市</td><td>邻水县</td></tr>
    <tr><td><code>511681</code></td><td>四川省</td><td>广安市</td><td>华蓥市</td></tr>
    <tr class="level-city"><td><code>511700</code></td><td>四川省</td><td>达州市</td><td></td></tr>
    <tr><td><code>511702</code></td><td>四川省</td><td>达州市</td><td>通川区</td></tr>
    <tr><td><code>511703</code></td><td>四川省</td><td>达州市</td><td>达川区</td></tr>
    <tr><td><code>511722</code></td><td>四川省</td><td>达州市</td><td>宣汉县</td></tr>
    <tr><td><code>511723</code></td><td>四川省</td><td>达州市</td><td>开江县</td></tr>
    <tr><td><code>511724</code></td><td>四川省</td><td>达州市</td><td>大竹县</td></tr>
    <tr><td><code>511725</code></td><td>四川省</td><td>达州市</td><td>渠县</td></tr>
    <tr><td><code>511781</code></td><td>四川省</td><td>达州市</td><td>万源市</td></tr>
    <tr class="level-city"><td><code>511800</code></td><td>四川省</td><td>雅安市</td><td></td></tr>
    <tr><td><code>511802</code></td><td>四川省</td><td>雅安市</td><td>雨城区</td></tr>
    <tr><td><code>511803</code></td><td>四川省</td><td>雅安市</td><td>名山区</td></tr>
    <tr><td><code>511822</code></td><td>四川省</td><td>雅安市</td><td>荥经县</td></tr>
    <tr><td><code>511823</code></td><td>四川省</td><td>雅安市</td><td>汉源县</td></tr>
    <tr><td><code>511824</code></td><td>四川省</td><td>雅安市</td><td>石棉县</td></tr>
    <tr><td><code>511825</code></td><td>四川省</td><td>雅安市</td><td>天全县</td></tr>
    <tr><td><code>511826</code></td><td>四川省</td><td>雅安市</td><td>芦山县</td></tr>
    <tr><td><code>511827</code></td><td>四川省</td><td>雅安市</td><td>宝兴县</td></tr>
    <tr class="level-city"><td><code>511900</code></td><td>四川省</td><td>巴中市</td><td></td></tr>
    <tr><td><code>511902</code></td><td>四川省</td><td>巴中市</td><td>巴州区</td></tr>
    <tr><td><code>511903</code></td><td>四川省</td><td>巴中市</td><td>恩阳区</td></tr>
    <tr><td><code>511921</code></td><td>四川省</td><td>巴中市</td><td>通江县</td></tr>
    <tr><td><code>511922</code></td><td>四川省</td><td>巴中市</td><td>南江县</td></tr>
    <tr><td><code>511923</code></td><td>四川省</td><td>巴中市</td><td>平昌县</td></tr>
    <tr class="level-city"><td><code>512000</code></td><td>四川省</td><td>资阳市</td><td></td></tr>
    <tr><td><code>512002</code></td><td>四川省</td><td>资阳市</td><td>雁江区</td></tr>
    <tr><td><code>512021</code></td><td>四川省</td><td>资阳市</td><td>安岳县</td></tr>
    <tr><td><code>512022</code></td><td>四川省</td><td>资阳市</td><td>乐至县</td></tr>
    <tr class="level-city"><td><code>513200</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td></td></tr>
    <tr><td><code>513201</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>马尔康市</td></tr>
    <tr><td><code>513221</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>汶川县</td></tr>
    <tr><td><code>513222</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>理县</td></tr>
    <tr><td><code>513223</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>茂县</td></tr>
    <tr><td><code>513224</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>松潘县</td></tr>
    <tr><td><code>513225</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>九寨沟县</td></tr>
    <tr><td><code>513226</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>金川县</td></tr>
    <tr><td><code>513227</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>小金县</td></tr>
    <tr><td><code>513228</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>黑水县</td></tr>
    <tr><td><code>513230</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>壤塘县</td></tr>
    <tr><td><code>513231</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>阿坝县</td></tr>
    <tr><td><code>513232</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>若尔盖县</td></tr>
    <tr><td><code>513233</code></td><td>四川省</td><td>阿坝藏族羌族自治州</td><td>红原县</td></tr>
    <tr class="level-city"><td><code>513300</code></td><td>四川省</td><td>甘孜藏族自治州</td><td></td></tr>
    <tr><td><code>513301</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>康定市</td></tr>
    <tr><td><code>513322</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>泸定县</td></tr>
    <tr><td><code>513323</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>丹巴县</td></tr>
    <tr><td><code>513324</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>九龙县</td></tr>
    <tr><td><code>513325</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>雅江县</td></tr>
    <tr><td><code>513326</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>道孚县</td></tr>
    <tr><td><code>513327</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>炉霍县</td></tr>
    <tr><td><code>513328</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>甘孜县</td></tr>
    <tr><td><code>513329</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>新龙县</td></tr>
    <tr><td><code>513330</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>德格县</td></tr>
    <tr><td><code>513331</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>白玉县</td></tr>
    <tr><td><code>513332</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>石渠县</td></tr>
    <tr><td><code>513333</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>色达县</td></tr>
    <tr><td><code>513334</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>理塘县</td></tr>
    <tr><td><code>513335</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>巴塘县</td></tr>
    <tr><td><code>513336</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>乡城县</td></tr>
    <tr><td><code>513337</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>稻城县</td></tr>
    <tr><td><code>513338</code></td><td>四川省</td><td>甘孜藏族自治州</td><td>得荣县</td></tr>
    <tr class="level-city"><td><code>513400</code></td><td>四川省</td><td>凉山彝族自治州</td><td></td></tr>
    <tr><td><code>513401</code></td><td>四川省</td><td>凉山彝族自治州</td><td>西昌市</td></tr>
    <tr><td><code>513422</code></td><td>四川省</td><td>凉山彝族自治州</td><td>木里藏族自治县</td></tr>
    <tr><td><code>513423</code></td><td>四川省</td><td>凉山彝族自治州</td><td>盐源县</td></tr>
    <tr><td><code>513424</code></td><td>四川省</td><td>凉山彝族自治州</td><td>德昌县</td></tr>
    <tr><td><code>513425</code></td><td>四川省</td><td>凉山彝族自治州</td><td>会理县</td></tr>
    <tr><td><code>513426</code></td><td>四川省</td><td>凉山彝族自治州</td><td>会东县</td></tr>
    <tr><td><code>513427</code></td><td>四川省</td><td>凉山彝族自治州</td><td>宁南县</td></tr>
    <tr><td><code>513428</code></td><td>四川省</td><td>凉山彝族自治州</td><td>普格县</td></tr>
    <tr><td><code>513429</code></td><td>四川省</td><td>凉山彝族自治州</td><td>布拖县</td></tr>
    <tr><td><code>513430</code></td><td>四川省</td><td>凉山彝族自治州</td><td>金阳县</td></tr>
    <tr><td><code>513431</code></td><td>四川省</td><td>凉山彝族自治州</td><td>昭觉县</td></tr>
    <tr><td><code>513432</code></td><td>四川省</td><td>凉山彝族自治州</td><td>喜德县</td></tr>
    <tr><td><code>513433</code></td><td>四川省</td><td>凉山彝族自治州</td><td>冕宁县</td></tr>
    <tr><td><code>513434</code></td><td>四川省</td><td>凉山彝族自治州</td><td>越西县</td></tr>
    <tr><td><code>513435</code></td><td>四川省</td><td>凉山彝族自治州</td><td>甘洛县</td></tr>
    <tr><td><code>513436</code></td><td>四川省</td><td>凉山彝族自治州</td><td>美姑县</td></tr>
    <tr><td><code>513437</code></td><td>四川省</td><td>凉山彝族自治州</td><td>雷波县</td></tr>
  </tbody>
</table>
</div>


## 贵州省（520000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>520000</code></td><td>贵州省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>520100</code></td><td>贵州省</td><td>贵阳市</td><td></td></tr>
    <tr><td><code>520102</code></td><td>贵州省</td><td>贵阳市</td><td>南明区</td></tr>
    <tr><td><code>520103</code></td><td>贵州省</td><td>贵阳市</td><td>云岩区</td></tr>
    <tr><td><code>520111</code></td><td>贵州省</td><td>贵阳市</td><td>花溪区</td></tr>
    <tr><td><code>520112</code></td><td>贵州省</td><td>贵阳市</td><td>乌当区</td></tr>
    <tr><td><code>520113</code></td><td>贵州省</td><td>贵阳市</td><td>白云区</td></tr>
    <tr><td><code>520115</code></td><td>贵州省</td><td>贵阳市</td><td>观山湖区</td></tr>
    <tr><td><code>520121</code></td><td>贵州省</td><td>贵阳市</td><td>开阳县</td></tr>
    <tr><td><code>520122</code></td><td>贵州省</td><td>贵阳市</td><td>息烽县</td></tr>
    <tr><td><code>520123</code></td><td>贵州省</td><td>贵阳市</td><td>修文县</td></tr>
    <tr><td><code>520181</code></td><td>贵州省</td><td>贵阳市</td><td>清镇市</td></tr>
    <tr class="level-city"><td><code>520200</code></td><td>贵州省</td><td>六盘水市</td><td></td></tr>
    <tr><td><code>520201</code></td><td>贵州省</td><td>六盘水市</td><td>钟山区</td></tr>
    <tr><td><code>520203</code></td><td>贵州省</td><td>六盘水市</td><td>六枝特区</td></tr>
    <tr><td><code>520221</code></td><td>贵州省</td><td>六盘水市</td><td>水城县</td></tr>
    <tr><td><code>520281</code></td><td>贵州省</td><td>六盘水市</td><td>盘州市</td></tr>
    <tr class="level-city"><td><code>520300</code></td><td>贵州省</td><td>遵义市</td><td></td></tr>
    <tr><td><code>520302</code></td><td>贵州省</td><td>遵义市</td><td>红花岗区</td></tr>
    <tr><td><code>520303</code></td><td>贵州省</td><td>遵义市</td><td>汇川区</td></tr>
    <tr><td><code>520304</code></td><td>贵州省</td><td>遵义市</td><td>播州区</td></tr>
    <tr><td><code>520322</code></td><td>贵州省</td><td>遵义市</td><td>桐梓县</td></tr>
    <tr><td><code>520323</code></td><td>贵州省</td><td>遵义市</td><td>绥阳县</td></tr>
    <tr><td><code>520324</code></td><td>贵州省</td><td>遵义市</td><td>正安县</td></tr>
    <tr><td><code>520325</code></td><td>贵州省</td><td>遵义市</td><td>道真仡佬族苗族自治县</td></tr>
    <tr><td><code>520326</code></td><td>贵州省</td><td>遵义市</td><td>务川仡佬族苗族自治县</td></tr>
    <tr><td><code>520327</code></td><td>贵州省</td><td>遵义市</td><td>凤冈县</td></tr>
    <tr><td><code>520328</code></td><td>贵州省</td><td>遵义市</td><td>湄潭县</td></tr>
    <tr><td><code>520329</code></td><td>贵州省</td><td>遵义市</td><td>余庆县</td></tr>
    <tr><td><code>520330</code></td><td>贵州省</td><td>遵义市</td><td>习水县</td></tr>
    <tr><td><code>520381</code></td><td>贵州省</td><td>遵义市</td><td>赤水市</td></tr>
    <tr><td><code>520382</code></td><td>贵州省</td><td>遵义市</td><td>仁怀市</td></tr>
    <tr class="level-city"><td><code>520400</code></td><td>贵州省</td><td>安顺市</td><td></td></tr>
    <tr><td><code>520402</code></td><td>贵州省</td><td>安顺市</td><td>西秀区</td></tr>
    <tr><td><code>520403</code></td><td>贵州省</td><td>安顺市</td><td>平坝区</td></tr>
    <tr><td><code>520422</code></td><td>贵州省</td><td>安顺市</td><td>普定县</td></tr>
    <tr><td><code>520423</code></td><td>贵州省</td><td>安顺市</td><td>镇宁布依族苗族自治县</td></tr>
    <tr><td><code>520424</code></td><td>贵州省</td><td>安顺市</td><td>关岭布依族苗族自治县</td></tr>
    <tr><td><code>520425</code></td><td>贵州省</td><td>安顺市</td><td>紫云苗族布依族自治县</td></tr>
    <tr class="level-city"><td><code>520500</code></td><td>贵州省</td><td>毕节市</td><td></td></tr>
    <tr><td><code>520502</code></td><td>贵州省</td><td>毕节市</td><td>七星关区</td></tr>
    <tr><td><code>520521</code></td><td>贵州省</td><td>毕节市</td><td>大方县</td></tr>
    <tr><td><code>520522</code></td><td>贵州省</td><td>毕节市</td><td>黔西县</td></tr>
    <tr><td><code>520523</code></td><td>贵州省</td><td>毕节市</td><td>金沙县</td></tr>
    <tr><td><code>520524</code></td><td>贵州省</td><td>毕节市</td><td>织金县</td></tr>
    <tr><td><code>520525</code></td><td>贵州省</td><td>毕节市</td><td>纳雍县</td></tr>
    <tr><td><code>520526</code></td><td>贵州省</td><td>毕节市</td><td>威宁彝族回族苗族自治县</td></tr>
    <tr><td><code>520527</code></td><td>贵州省</td><td>毕节市</td><td>赫章县</td></tr>
    <tr class="level-city"><td><code>520600</code></td><td>贵州省</td><td>铜仁市</td><td></td></tr>
    <tr><td><code>520602</code></td><td>贵州省</td><td>铜仁市</td><td>碧江区</td></tr>
    <tr><td><code>520603</code></td><td>贵州省</td><td>铜仁市</td><td>万山区</td></tr>
    <tr><td><code>520621</code></td><td>贵州省</td><td>铜仁市</td><td>江口县</td></tr>
    <tr><td><code>520622</code></td><td>贵州省</td><td>铜仁市</td><td>玉屏侗族自治县</td></tr>
    <tr><td><code>520623</code></td><td>贵州省</td><td>铜仁市</td><td>石阡县</td></tr>
    <tr><td><code>520624</code></td><td>贵州省</td><td>铜仁市</td><td>思南县</td></tr>
    <tr><td><code>520625</code></td><td>贵州省</td><td>铜仁市</td><td>印江土家族苗族自治县</td></tr>
    <tr><td><code>520626</code></td><td>贵州省</td><td>铜仁市</td><td>德江县</td></tr>
    <tr><td><code>520627</code></td><td>贵州省</td><td>铜仁市</td><td>沿河土家族自治县</td></tr>
    <tr><td><code>520628</code></td><td>贵州省</td><td>铜仁市</td><td>松桃苗族自治县</td></tr>
    <tr class="level-city"><td><code>522300</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td></td></tr>
    <tr><td><code>522301</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>兴义市</td></tr>
    <tr><td><code>522322</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>兴仁县</td></tr>
    <tr><td><code>522323</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>普安县</td></tr>
    <tr><td><code>522324</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>晴隆县</td></tr>
    <tr><td><code>522325</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>贞丰县</td></tr>
    <tr><td><code>522326</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>望谟县</td></tr>
    <tr><td><code>522327</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>册亨县</td></tr>
    <tr><td><code>522328</code></td><td>贵州省</td><td>黔西南布依族苗族自治州</td><td>安龙县</td></tr>
    <tr class="level-city"><td><code>522600</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td></td></tr>
    <tr><td><code>522601</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>凯里市</td></tr>
    <tr><td><code>522622</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>黄平县</td></tr>
    <tr><td><code>522623</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>施秉县</td></tr>
    <tr><td><code>522624</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>三穗县</td></tr>
    <tr><td><code>522625</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>镇远县</td></tr>
    <tr><td><code>522626</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>岑巩县</td></tr>
    <tr><td><code>522627</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>天柱县</td></tr>
    <tr><td><code>522628</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>锦屏县</td></tr>
    <tr><td><code>522629</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>剑河县</td></tr>
    <tr><td><code>522630</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>台江县</td></tr>
    <tr><td><code>522631</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>黎平县</td></tr>
    <tr><td><code>522632</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>榕江县</td></tr>
    <tr><td><code>522633</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>从江县</td></tr>
    <tr><td><code>522634</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>雷山县</td></tr>
    <tr><td><code>522635</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>麻江县</td></tr>
    <tr><td><code>522636</code></td><td>贵州省</td><td>黔东南苗族侗族自治州</td><td>丹寨县</td></tr>
    <tr class="level-city"><td><code>522700</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td></td></tr>
    <tr><td><code>522701</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>都匀市</td></tr>
    <tr><td><code>522702</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>福泉市</td></tr>
    <tr><td><code>522722</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>荔波县</td></tr>
    <tr><td><code>522723</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>贵定县</td></tr>
    <tr><td><code>522725</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>瓮安县</td></tr>
    <tr><td><code>522726</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>独山县</td></tr>
    <tr><td><code>522727</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>平塘县</td></tr>
    <tr><td><code>522728</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>罗甸县</td></tr>
    <tr><td><code>522729</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>长顺县</td></tr>
    <tr><td><code>522730</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>龙里县</td></tr>
    <tr><td><code>522731</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>惠水县</td></tr>
    <tr><td><code>522732</code></td><td>贵州省</td><td>黔南布依族苗族自治州</td><td>三都水族自治县</td></tr>
  </tbody>
</table>
</div>


## 云南省（530000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>530000</code></td><td>云南省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>530100</code></td><td>云南省</td><td>昆明市</td><td></td></tr>
    <tr><td><code>530102</code></td><td>云南省</td><td>昆明市</td><td>五华区</td></tr>
    <tr><td><code>530103</code></td><td>云南省</td><td>昆明市</td><td>盘龙区</td></tr>
    <tr><td><code>530111</code></td><td>云南省</td><td>昆明市</td><td>官渡区</td></tr>
    <tr><td><code>530112</code></td><td>云南省</td><td>昆明市</td><td>西山区</td></tr>
    <tr><td><code>530113</code></td><td>云南省</td><td>昆明市</td><td>东川区</td></tr>
    <tr><td><code>530114</code></td><td>云南省</td><td>昆明市</td><td>呈贡区</td></tr>
    <tr><td><code>530115</code></td><td>云南省</td><td>昆明市</td><td>晋宁区</td></tr>
    <tr><td><code>530124</code></td><td>云南省</td><td>昆明市</td><td>富民县</td></tr>
    <tr><td><code>530125</code></td><td>云南省</td><td>昆明市</td><td>宜良县</td></tr>
    <tr><td><code>530126</code></td><td>云南省</td><td>昆明市</td><td>石林彝族自治县</td></tr>
    <tr><td><code>530127</code></td><td>云南省</td><td>昆明市</td><td>嵩明县</td></tr>
    <tr><td><code>530128</code></td><td>云南省</td><td>昆明市</td><td>禄劝彝族苗族自治县</td></tr>
    <tr><td><code>530129</code></td><td>云南省</td><td>昆明市</td><td>寻甸回族彝族自治县</td></tr>
    <tr><td><code>530181</code></td><td>云南省</td><td>昆明市</td><td>安宁市</td></tr>
    <tr class="level-city"><td><code>530300</code></td><td>云南省</td><td>曲靖市</td><td></td></tr>
    <tr><td><code>530302</code></td><td>云南省</td><td>曲靖市</td><td>麒麟区</td></tr>
    <tr><td><code>530303</code></td><td>云南省</td><td>曲靖市</td><td>沾益区</td></tr>
    <tr><td><code>530321</code></td><td>云南省</td><td>曲靖市</td><td>马龙县</td></tr>
    <tr><td><code>530322</code></td><td>云南省</td><td>曲靖市</td><td>陆良县</td></tr>
    <tr><td><code>530323</code></td><td>云南省</td><td>曲靖市</td><td>师宗县</td></tr>
    <tr><td><code>530324</code></td><td>云南省</td><td>曲靖市</td><td>罗平县</td></tr>
    <tr><td><code>530325</code></td><td>云南省</td><td>曲靖市</td><td>富源县</td></tr>
    <tr><td><code>530326</code></td><td>云南省</td><td>曲靖市</td><td>会泽县</td></tr>
    <tr><td><code>530381</code></td><td>云南省</td><td>曲靖市</td><td>宣威市</td></tr>
    <tr class="level-city"><td><code>530400</code></td><td>云南省</td><td>玉溪市</td><td></td></tr>
    <tr><td><code>530402</code></td><td>云南省</td><td>玉溪市</td><td>红塔区</td></tr>
    <tr><td><code>530403</code></td><td>云南省</td><td>玉溪市</td><td>江川区</td></tr>
    <tr><td><code>530422</code></td><td>云南省</td><td>玉溪市</td><td>澄江县</td></tr>
    <tr><td><code>530423</code></td><td>云南省</td><td>玉溪市</td><td>通海县</td></tr>
    <tr><td><code>530424</code></td><td>云南省</td><td>玉溪市</td><td>华宁县</td></tr>
    <tr><td><code>530425</code></td><td>云南省</td><td>玉溪市</td><td>易门县</td></tr>
    <tr><td><code>530426</code></td><td>云南省</td><td>玉溪市</td><td>峨山彝族自治县</td></tr>
    <tr><td><code>530427</code></td><td>云南省</td><td>玉溪市</td><td>新平彝族傣族自治县</td></tr>
    <tr><td><code>530428</code></td><td>云南省</td><td>玉溪市</td><td>元江哈尼族彝族傣族自治县</td></tr>
    <tr class="level-city"><td><code>530500</code></td><td>云南省</td><td>保山市</td><td></td></tr>
    <tr><td><code>530502</code></td><td>云南省</td><td>保山市</td><td>隆阳区</td></tr>
    <tr><td><code>530521</code></td><td>云南省</td><td>保山市</td><td>施甸县</td></tr>
    <tr><td><code>530523</code></td><td>云南省</td><td>保山市</td><td>龙陵县</td></tr>
    <tr><td><code>530524</code></td><td>云南省</td><td>保山市</td><td>昌宁县</td></tr>
    <tr><td><code>530581</code></td><td>云南省</td><td>保山市</td><td>腾冲市</td></tr>
    <tr class="level-city"><td><code>530600</code></td><td>云南省</td><td>昭通市</td><td></td></tr>
    <tr><td><code>530602</code></td><td>云南省</td><td>昭通市</td><td>昭阳区</td></tr>
    <tr><td><code>530621</code></td><td>云南省</td><td>昭通市</td><td>鲁甸县</td></tr>
    <tr><td><code>530622</code></td><td>云南省</td><td>昭通市</td><td>巧家县</td></tr>
    <tr><td><code>530623</code></td><td>云南省</td><td>昭通市</td><td>盐津县</td></tr>
    <tr><td><code>530624</code></td><td>云南省</td><td>昭通市</td><td>大关县</td></tr>
    <tr><td><code>530625</code></td><td>云南省</td><td>昭通市</td><td>永善县</td></tr>
    <tr><td><code>530626</code></td><td>云南省</td><td>昭通市</td><td>绥江县</td></tr>
    <tr><td><code>530627</code></td><td>云南省</td><td>昭通市</td><td>镇雄县</td></tr>
    <tr><td><code>530628</code></td><td>云南省</td><td>昭通市</td><td>彝良县</td></tr>
    <tr><td><code>530629</code></td><td>云南省</td><td>昭通市</td><td>威信县</td></tr>
    <tr><td><code>530630</code></td><td>云南省</td><td>昭通市</td><td>水富县</td></tr>
    <tr class="level-city"><td><code>530700</code></td><td>云南省</td><td>丽江市</td><td></td></tr>
    <tr><td><code>530702</code></td><td>云南省</td><td>丽江市</td><td>古城区</td></tr>
    <tr><td><code>530721</code></td><td>云南省</td><td>丽江市</td><td>玉龙纳西族自治县</td></tr>
    <tr><td><code>530722</code></td><td>云南省</td><td>丽江市</td><td>永胜县</td></tr>
    <tr><td><code>530723</code></td><td>云南省</td><td>丽江市</td><td>华坪县</td></tr>
    <tr><td><code>530724</code></td><td>云南省</td><td>丽江市</td><td>宁蒗彝族自治县</td></tr>
    <tr class="level-city"><td><code>530800</code></td><td>云南省</td><td>普洱市</td><td></td></tr>
    <tr><td><code>530802</code></td><td>云南省</td><td>普洱市</td><td>思茅区</td></tr>
    <tr><td><code>530821</code></td><td>云南省</td><td>普洱市</td><td>宁洱哈尼族彝族自治县</td></tr>
    <tr><td><code>530822</code></td><td>云南省</td><td>普洱市</td><td>墨江哈尼族自治县</td></tr>
    <tr><td><code>530823</code></td><td>云南省</td><td>普洱市</td><td>景东彝族自治县</td></tr>
    <tr><td><code>530824</code></td><td>云南省</td><td>普洱市</td><td>景谷傣族彝族自治县</td></tr>
    <tr><td><code>530825</code></td><td>云南省</td><td>普洱市</td><td>镇沅彝族哈尼族拉祜族自治县</td></tr>
    <tr><td><code>530826</code></td><td>云南省</td><td>普洱市</td><td>江城哈尼族彝族自治县</td></tr>
    <tr><td><code>530827</code></td><td>云南省</td><td>普洱市</td><td>孟连傣族拉祜族佤族自治县</td></tr>
    <tr><td><code>530828</code></td><td>云南省</td><td>普洱市</td><td>澜沧拉祜族自治县</td></tr>
    <tr><td><code>530829</code></td><td>云南省</td><td>普洱市</td><td>西盟佤族自治县</td></tr>
    <tr class="level-city"><td><code>530900</code></td><td>云南省</td><td>临沧市</td><td></td></tr>
    <tr><td><code>530902</code></td><td>云南省</td><td>临沧市</td><td>临翔区</td></tr>
    <tr><td><code>530921</code></td><td>云南省</td><td>临沧市</td><td>凤庆县</td></tr>
    <tr><td><code>530922</code></td><td>云南省</td><td>临沧市</td><td>云县</td></tr>
    <tr><td><code>530923</code></td><td>云南省</td><td>临沧市</td><td>永德县</td></tr>
    <tr><td><code>530924</code></td><td>云南省</td><td>临沧市</td><td>镇康县</td></tr>
    <tr><td><code>530925</code></td><td>云南省</td><td>临沧市</td><td>双江拉祜族佤族布朗族傣族自治县</td></tr>
    <tr><td><code>530926</code></td><td>云南省</td><td>临沧市</td><td>耿马傣族佤族自治县</td></tr>
    <tr><td><code>530927</code></td><td>云南省</td><td>临沧市</td><td>沧源佤族自治县</td></tr>
    <tr class="level-city"><td><code>532300</code></td><td>云南省</td><td>楚雄彝族自治州</td><td></td></tr>
    <tr><td><code>532301</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>楚雄市</td></tr>
    <tr><td><code>532322</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>双柏县</td></tr>
    <tr><td><code>532323</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>牟定县</td></tr>
    <tr><td><code>532324</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>南华县</td></tr>
    <tr><td><code>532325</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>姚安县</td></tr>
    <tr><td><code>532326</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>大姚县</td></tr>
    <tr><td><code>532327</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>永仁县</td></tr>
    <tr><td><code>532328</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>元谋县</td></tr>
    <tr><td><code>532329</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>武定县</td></tr>
    <tr><td><code>532331</code></td><td>云南省</td><td>楚雄彝族自治州</td><td>禄丰县</td></tr>
    <tr class="level-city"><td><code>532500</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td></td></tr>
    <tr><td><code>532501</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>个旧市</td></tr>
    <tr><td><code>532502</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>开远市</td></tr>
    <tr><td><code>532503</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>蒙自市</td></tr>
    <tr><td><code>532504</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>弥勒市</td></tr>
    <tr><td><code>532523</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>屏边苗族自治县</td></tr>
    <tr><td><code>532524</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>建水县</td></tr>
    <tr><td><code>532525</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>石屏县</td></tr>
    <tr><td><code>532527</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>泸西县</td></tr>
    <tr><td><code>532528</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>元阳县</td></tr>
    <tr><td><code>532529</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>红河县</td></tr>
    <tr><td><code>532530</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>金平苗族瑶族傣族自治县</td></tr>
    <tr><td><code>532531</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>绿春县</td></tr>
    <tr><td><code>532532</code></td><td>云南省</td><td>红河哈尼族彝族自治州</td><td>河口瑶族自治县</td></tr>
    <tr class="level-city"><td><code>532600</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td></td></tr>
    <tr><td><code>532601</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>文山市</td></tr>
    <tr><td><code>532622</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>砚山县</td></tr>
    <tr><td><code>532623</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>西畴县</td></tr>
    <tr><td><code>532624</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>麻栗坡县</td></tr>
    <tr><td><code>532625</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>马关县</td></tr>
    <tr><td><code>532626</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>丘北县</td></tr>
    <tr><td><code>532627</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>广南县</td></tr>
    <tr><td><code>532628</code></td><td>云南省</td><td>文山壮族苗族自治州</td><td>富宁县</td></tr>
    <tr class="level-city"><td><code>532800</code></td><td>云南省</td><td>西双版纳傣族自治州</td><td></td></tr>
    <tr><td><code>532801</code></td><td>云南省</td><td>西双版纳傣族自治州</td><td>景洪市</td></tr>
    <tr><td><code>532822</code></td><td>云南省</td><td>西双版纳傣族自治州</td><td>勐海县</td></tr>
    <tr><td><code>532823</code></td><td>云南省</td><td>西双版纳傣族自治州</td><td>勐腊县</td></tr>
    <tr class="level-city"><td><code>532900</code></td><td>云南省</td><td>大理白族自治州</td><td></td></tr>
    <tr><td><code>532901</code></td><td>云南省</td><td>大理白族自治州</td><td>大理市</td></tr>
    <tr><td><code>532922</code></td><td>云南省</td><td>大理白族自治州</td><td>漾濞彝族自治县</td></tr>
    <tr><td><code>532923</code></td><td>云南省</td><td>大理白族自治州</td><td>祥云县</td></tr>
    <tr><td><code>532924</code></td><td>云南省</td><td>大理白族自治州</td><td>宾川县</td></tr>
    <tr><td><code>532925</code></td><td>云南省</td><td>大理白族自治州</td><td>弥渡县</td></tr>
    <tr><td><code>532926</code></td><td>云南省</td><td>大理白族自治州</td><td>南涧彝族自治县</td></tr>
    <tr><td><code>532927</code></td><td>云南省</td><td>大理白族自治州</td><td>巍山彝族回族自治县</td></tr>
    <tr><td><code>532928</code></td><td>云南省</td><td>大理白族自治州</td><td>永平县</td></tr>
    <tr><td><code>532929</code></td><td>云南省</td><td>大理白族自治州</td><td>云龙县</td></tr>
    <tr><td><code>532930</code></td><td>云南省</td><td>大理白族自治州</td><td>洱源县</td></tr>
    <tr><td><code>532931</code></td><td>云南省</td><td>大理白族自治州</td><td>剑川县</td></tr>
    <tr><td><code>532932</code></td><td>云南省</td><td>大理白族自治州</td><td>鹤庆县</td></tr>
    <tr class="level-city"><td><code>533100</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td></td></tr>
    <tr><td><code>533102</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td>瑞丽市</td></tr>
    <tr><td><code>533103</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td>芒市</td></tr>
    <tr><td><code>533122</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td>梁河县</td></tr>
    <tr><td><code>533123</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td>盈江县</td></tr>
    <tr><td><code>533124</code></td><td>云南省</td><td>德宏傣族景颇族自治州</td><td>陇川县</td></tr>
    <tr class="level-city"><td><code>533300</code></td><td>云南省</td><td>怒江傈僳族自治州</td><td></td></tr>
    <tr><td><code>533301</code></td><td>云南省</td><td>怒江傈僳族自治州</td><td>泸水市</td></tr>
    <tr><td><code>533323</code></td><td>云南省</td><td>怒江傈僳族自治州</td><td>福贡县</td></tr>
    <tr><td><code>533324</code></td><td>云南省</td><td>怒江傈僳族自治州</td><td>贡山独龙族怒族自治县</td></tr>
    <tr><td><code>533325</code></td><td>云南省</td><td>怒江傈僳族自治州</td><td>兰坪白族普米族自治县</td></tr>
    <tr class="level-city"><td><code>533400</code></td><td>云南省</td><td>迪庆藏族自治州</td><td></td></tr>
    <tr><td><code>533401</code></td><td>云南省</td><td>迪庆藏族自治州</td><td>香格里拉市</td></tr>
    <tr><td><code>533422</code></td><td>云南省</td><td>迪庆藏族自治州</td><td>德钦县</td></tr>
    <tr><td><code>533423</code></td><td>云南省</td><td>迪庆藏族自治州</td><td>维西傈僳族自治县</td></tr>
  </tbody>
</table>
</div>


## 西藏自治区（540000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>540000</code></td><td>西藏自治区</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>540100</code></td><td>西藏自治区</td><td>拉萨市</td><td></td></tr>
    <tr><td><code>540102</code></td><td>西藏自治区</td><td>拉萨市</td><td>城关区</td></tr>
    <tr><td><code>540103</code></td><td>西藏自治区</td><td>拉萨市</td><td>堆龙德庆区</td></tr>
    <tr><td><code>540121</code></td><td>西藏自治区</td><td>拉萨市</td><td>林周县</td></tr>
    <tr><td><code>540122</code></td><td>西藏自治区</td><td>拉萨市</td><td>当雄县</td></tr>
    <tr><td><code>540123</code></td><td>西藏自治区</td><td>拉萨市</td><td>尼木县</td></tr>
    <tr><td><code>540124</code></td><td>西藏自治区</td><td>拉萨市</td><td>曲水县</td></tr>
    <tr><td><code>540126</code></td><td>西藏自治区</td><td>拉萨市</td><td>达孜县</td></tr>
    <tr><td><code>540127</code></td><td>西藏自治区</td><td>拉萨市</td><td>墨竹工卡县</td></tr>
    <tr class="level-city"><td><code>540200</code></td><td>西藏自治区</td><td>日喀则市</td><td></td></tr>
    <tr><td><code>540202</code></td><td>西藏自治区</td><td>日喀则市</td><td>桑珠孜区</td></tr>
    <tr><td><code>540221</code></td><td>西藏自治区</td><td>日喀则市</td><td>南木林县</td></tr>
    <tr><td><code>540222</code></td><td>西藏自治区</td><td>日喀则市</td><td>江孜县</td></tr>
    <tr><td><code>540223</code></td><td>西藏自治区</td><td>日喀则市</td><td>定日县</td></tr>
    <tr><td><code>540224</code></td><td>西藏自治区</td><td>日喀则市</td><td>萨迦县</td></tr>
    <tr><td><code>540225</code></td><td>西藏自治区</td><td>日喀则市</td><td>拉孜县</td></tr>
    <tr><td><code>540226</code></td><td>西藏自治区</td><td>日喀则市</td><td>昂仁县</td></tr>
    <tr><td><code>540227</code></td><td>西藏自治区</td><td>日喀则市</td><td>谢通门县</td></tr>
    <tr><td><code>540228</code></td><td>西藏自治区</td><td>日喀则市</td><td>白朗县</td></tr>
    <tr><td><code>540229</code></td><td>西藏自治区</td><td>日喀则市</td><td>仁布县</td></tr>
    <tr><td><code>540230</code></td><td>西藏自治区</td><td>日喀则市</td><td>康马县</td></tr>
    <tr><td><code>540231</code></td><td>西藏自治区</td><td>日喀则市</td><td>定结县</td></tr>
    <tr><td><code>540232</code></td><td>西藏自治区</td><td>日喀则市</td><td>仲巴县</td></tr>
    <tr><td><code>540233</code></td><td>西藏自治区</td><td>日喀则市</td><td>亚东县</td></tr>
    <tr><td><code>540234</code></td><td>西藏自治区</td><td>日喀则市</td><td>吉隆县</td></tr>
    <tr><td><code>540235</code></td><td>西藏自治区</td><td>日喀则市</td><td>聂拉木县</td></tr>
    <tr><td><code>540236</code></td><td>西藏自治区</td><td>日喀则市</td><td>萨嘎县</td></tr>
    <tr><td><code>540237</code></td><td>西藏自治区</td><td>日喀则市</td><td>岗巴县</td></tr>
    <tr class="level-city"><td><code>540300</code></td><td>西藏自治区</td><td>昌都市</td><td></td></tr>
    <tr><td><code>540302</code></td><td>西藏自治区</td><td>昌都市</td><td>卡若区</td></tr>
    <tr><td><code>540321</code></td><td>西藏自治区</td><td>昌都市</td><td>江达县</td></tr>
    <tr><td><code>540322</code></td><td>西藏自治区</td><td>昌都市</td><td>贡觉县</td></tr>
    <tr><td><code>540323</code></td><td>西藏自治区</td><td>昌都市</td><td>类乌齐县</td></tr>
    <tr><td><code>540324</code></td><td>西藏自治区</td><td>昌都市</td><td>丁青县</td></tr>
    <tr><td><code>540325</code></td><td>西藏自治区</td><td>昌都市</td><td>察雅县</td></tr>
    <tr><td><code>540326</code></td><td>西藏自治区</td><td>昌都市</td><td>八宿县</td></tr>
    <tr><td><code>540327</code></td><td>西藏自治区</td><td>昌都市</td><td>左贡县</td></tr>
    <tr><td><code>540328</code></td><td>西藏自治区</td><td>昌都市</td><td>芒康县</td></tr>
    <tr><td><code>540329</code></td><td>西藏自治区</td><td>昌都市</td><td>洛隆县</td></tr>
    <tr><td><code>540330</code></td><td>西藏自治区</td><td>昌都市</td><td>边坝县</td></tr>
    <tr class="level-city"><td><code>540400</code></td><td>西藏自治区</td><td>林芝市</td><td></td></tr>
    <tr><td><code>540402</code></td><td>西藏自治区</td><td>林芝市</td><td>巴宜区</td></tr>
    <tr><td><code>540421</code></td><td>西藏自治区</td><td>林芝市</td><td>工布江达县</td></tr>
    <tr><td><code>540422</code></td><td>西藏自治区</td><td>林芝市</td><td>米林县</td></tr>
    <tr><td><code>540423</code></td><td>西藏自治区</td><td>林芝市</td><td>墨脱县</td></tr>
    <tr><td><code>540424</code></td><td>西藏自治区</td><td>林芝市</td><td>波密县</td></tr>
    <tr><td><code>540425</code></td><td>西藏自治区</td><td>林芝市</td><td>察隅县</td></tr>
    <tr><td><code>540426</code></td><td>西藏自治区</td><td>林芝市</td><td>朗县</td></tr>
    <tr class="level-city"><td><code>540500</code></td><td>西藏自治区</td><td>山南市</td><td></td></tr>
    <tr><td><code>540502</code></td><td>西藏自治区</td><td>山南市</td><td>乃东区</td></tr>
    <tr><td><code>540521</code></td><td>西藏自治区</td><td>山南市</td><td>扎囊县</td></tr>
    <tr><td><code>540522</code></td><td>西藏自治区</td><td>山南市</td><td>贡嘎县</td></tr>
    <tr><td><code>540523</code></td><td>西藏自治区</td><td>山南市</td><td>桑日县</td></tr>
    <tr><td><code>540524</code></td><td>西藏自治区</td><td>山南市</td><td>琼结县</td></tr>
    <tr><td><code>540525</code></td><td>西藏自治区</td><td>山南市</td><td>曲松县</td></tr>
    <tr><td><code>540526</code></td><td>西藏自治区</td><td>山南市</td><td>措美县</td></tr>
    <tr><td><code>540527</code></td><td>西藏自治区</td><td>山南市</td><td>洛扎县</td></tr>
    <tr><td><code>540528</code></td><td>西藏自治区</td><td>山南市</td><td>加查县</td></tr>
    <tr><td><code>540529</code></td><td>西藏自治区</td><td>山南市</td><td>隆子县</td></tr>
    <tr><td><code>540530</code></td><td>西藏自治区</td><td>山南市</td><td>错那县</td></tr>
    <tr><td><code>540531</code></td><td>西藏自治区</td><td>山南市</td><td>浪卡子县</td></tr>
    <tr class="level-city"><td><code>542400</code></td><td>西藏自治区</td><td>那曲地区</td><td></td></tr>
    <tr><td><code>542421</code></td><td>西藏自治区</td><td>那曲地区</td><td>那曲县</td></tr>
    <tr><td><code>542422</code></td><td>西藏自治区</td><td>那曲地区</td><td>嘉黎县</td></tr>
    <tr><td><code>542423</code></td><td>西藏自治区</td><td>那曲地区</td><td>比如县</td></tr>
    <tr><td><code>542424</code></td><td>西藏自治区</td><td>那曲地区</td><td>聂荣县</td></tr>
    <tr><td><code>542425</code></td><td>西藏自治区</td><td>那曲地区</td><td>安多县</td></tr>
    <tr><td><code>542426</code></td><td>西藏自治区</td><td>那曲地区</td><td>申扎县</td></tr>
    <tr><td><code>542427</code></td><td>西藏自治区</td><td>那曲地区</td><td>索县</td></tr>
    <tr><td><code>542428</code></td><td>西藏自治区</td><td>那曲地区</td><td>班戈县</td></tr>
    <tr><td><code>542429</code></td><td>西藏自治区</td><td>那曲地区</td><td>巴青县</td></tr>
    <tr><td><code>542430</code></td><td>西藏自治区</td><td>那曲地区</td><td>尼玛县</td></tr>
    <tr><td><code>542431</code></td><td>西藏自治区</td><td>那曲地区</td><td>双湖县</td></tr>
    <tr class="level-city"><td><code>542500</code></td><td>西藏自治区</td><td>阿里地区</td><td></td></tr>
    <tr><td><code>542521</code></td><td>西藏自治区</td><td>阿里地区</td><td>普兰县</td></tr>
    <tr><td><code>542522</code></td><td>西藏自治区</td><td>阿里地区</td><td>札达县</td></tr>
    <tr><td><code>542523</code></td><td>西藏自治区</td><td>阿里地区</td><td>噶尔县</td></tr>
    <tr><td><code>542524</code></td><td>西藏自治区</td><td>阿里地区</td><td>日土县</td></tr>
    <tr><td><code>542525</code></td><td>西藏自治区</td><td>阿里地区</td><td>革吉县</td></tr>
    <tr><td><code>542526</code></td><td>西藏自治区</td><td>阿里地区</td><td>改则县</td></tr>
    <tr><td><code>542527</code></td><td>西藏自治区</td><td>阿里地区</td><td>措勤县</td></tr>
  </tbody>
</table>
</div>


## 陕西省（610000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>610000</code></td><td>陕西省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>610100</code></td><td>陕西省</td><td>西安市</td><td></td></tr>
    <tr><td><code>610102</code></td><td>陕西省</td><td>西安市</td><td>新城区</td></tr>
    <tr><td><code>610103</code></td><td>陕西省</td><td>西安市</td><td>碑林区</td></tr>
    <tr><td><code>610104</code></td><td>陕西省</td><td>西安市</td><td>莲湖区</td></tr>
    <tr><td><code>610111</code></td><td>陕西省</td><td>西安市</td><td>灞桥区</td></tr>
    <tr><td><code>610112</code></td><td>陕西省</td><td>西安市</td><td>未央区</td></tr>
    <tr><td><code>610113</code></td><td>陕西省</td><td>西安市</td><td>雁塔区</td></tr>
    <tr><td><code>610114</code></td><td>陕西省</td><td>西安市</td><td>阎良区</td></tr>
    <tr><td><code>610115</code></td><td>陕西省</td><td>西安市</td><td>临潼区</td></tr>
    <tr><td><code>610116</code></td><td>陕西省</td><td>西安市</td><td>长安区</td></tr>
    <tr><td><code>610117</code></td><td>陕西省</td><td>西安市</td><td>高陵区</td></tr>
    <tr><td><code>610118</code></td><td>陕西省</td><td>西安市</td><td>鄠邑区</td></tr>
    <tr><td><code>610122</code></td><td>陕西省</td><td>西安市</td><td>蓝田县</td></tr>
    <tr><td><code>610124</code></td><td>陕西省</td><td>西安市</td><td>周至县</td></tr>
    <tr class="level-city"><td><code>610200</code></td><td>陕西省</td><td>铜川市</td><td></td></tr>
    <tr><td><code>610202</code></td><td>陕西省</td><td>铜川市</td><td>王益区</td></tr>
    <tr><td><code>610203</code></td><td>陕西省</td><td>铜川市</td><td>印台区</td></tr>
    <tr><td><code>610204</code></td><td>陕西省</td><td>铜川市</td><td>耀州区</td></tr>
    <tr><td><code>610222</code></td><td>陕西省</td><td>铜川市</td><td>宜君县</td></tr>
    <tr class="level-city"><td><code>610300</code></td><td>陕西省</td><td>宝鸡市</td><td></td></tr>
    <tr><td><code>610302</code></td><td>陕西省</td><td>宝鸡市</td><td>渭滨区</td></tr>
    <tr><td><code>610303</code></td><td>陕西省</td><td>宝鸡市</td><td>金台区</td></tr>
    <tr><td><code>610304</code></td><td>陕西省</td><td>宝鸡市</td><td>陈仓区</td></tr>
    <tr><td><code>610322</code></td><td>陕西省</td><td>宝鸡市</td><td>凤翔县</td></tr>
    <tr><td><code>610323</code></td><td>陕西省</td><td>宝鸡市</td><td>岐山县</td></tr>
    <tr><td><code>610324</code></td><td>陕西省</td><td>宝鸡市</td><td>扶风县</td></tr>
    <tr><td><code>610326</code></td><td>陕西省</td><td>宝鸡市</td><td>眉县</td></tr>
    <tr><td><code>610327</code></td><td>陕西省</td><td>宝鸡市</td><td>陇县</td></tr>
    <tr><td><code>610328</code></td><td>陕西省</td><td>宝鸡市</td><td>千阳县</td></tr>
    <tr><td><code>610329</code></td><td>陕西省</td><td>宝鸡市</td><td>麟游县</td></tr>
    <tr><td><code>610330</code></td><td>陕西省</td><td>宝鸡市</td><td>凤县</td></tr>
    <tr><td><code>610331</code></td><td>陕西省</td><td>宝鸡市</td><td>太白县</td></tr>
    <tr class="level-city"><td><code>610400</code></td><td>陕西省</td><td>咸阳市</td><td></td></tr>
    <tr><td><code>610402</code></td><td>陕西省</td><td>咸阳市</td><td>秦都区</td></tr>
    <tr><td><code>610403</code></td><td>陕西省</td><td>咸阳市</td><td>杨陵区</td></tr>
    <tr><td><code>610404</code></td><td>陕西省</td><td>咸阳市</td><td>渭城区</td></tr>
    <tr><td><code>610422</code></td><td>陕西省</td><td>咸阳市</td><td>三原县</td></tr>
    <tr><td><code>610423</code></td><td>陕西省</td><td>咸阳市</td><td>泾阳县</td></tr>
    <tr><td><code>610424</code></td><td>陕西省</td><td>咸阳市</td><td>乾县</td></tr>
    <tr><td><code>610425</code></td><td>陕西省</td><td>咸阳市</td><td>礼泉县</td></tr>
    <tr><td><code>610426</code></td><td>陕西省</td><td>咸阳市</td><td>永寿县</td></tr>
    <tr><td><code>610427</code></td><td>陕西省</td><td>咸阳市</td><td>彬县</td></tr>
    <tr><td><code>610428</code></td><td>陕西省</td><td>咸阳市</td><td>长武县</td></tr>
    <tr><td><code>610429</code></td><td>陕西省</td><td>咸阳市</td><td>旬邑县</td></tr>
    <tr><td><code>610430</code></td><td>陕西省</td><td>咸阳市</td><td>淳化县</td></tr>
    <tr><td><code>610431</code></td><td>陕西省</td><td>咸阳市</td><td>武功县</td></tr>
    <tr><td><code>610481</code></td><td>陕西省</td><td>咸阳市</td><td>兴平市</td></tr>
    <tr class="level-city"><td><code>610500</code></td><td>陕西省</td><td>渭南市</td><td></td></tr>
    <tr><td><code>610502</code></td><td>陕西省</td><td>渭南市</td><td>临渭区</td></tr>
    <tr><td><code>610503</code></td><td>陕西省</td><td>渭南市</td><td>华州区</td></tr>
    <tr><td><code>610522</code></td><td>陕西省</td><td>渭南市</td><td>潼关县</td></tr>
    <tr><td><code>610523</code></td><td>陕西省</td><td>渭南市</td><td>大荔县</td></tr>
    <tr><td><code>610524</code></td><td>陕西省</td><td>渭南市</td><td>合阳县</td></tr>
    <tr><td><code>610525</code></td><td>陕西省</td><td>渭南市</td><td>澄城县</td></tr>
    <tr><td><code>610526</code></td><td>陕西省</td><td>渭南市</td><td>蒲城县</td></tr>
    <tr><td><code>610527</code></td><td>陕西省</td><td>渭南市</td><td>白水县</td></tr>
    <tr><td><code>610528</code></td><td>陕西省</td><td>渭南市</td><td>富平县</td></tr>
    <tr><td><code>610581</code></td><td>陕西省</td><td>渭南市</td><td>韩城市</td></tr>
    <tr><td><code>610582</code></td><td>陕西省</td><td>渭南市</td><td>华阴市</td></tr>
    <tr class="level-city"><td><code>610600</code></td><td>陕西省</td><td>延安市</td><td></td></tr>
    <tr><td><code>610602</code></td><td>陕西省</td><td>延安市</td><td>宝塔区</td></tr>
    <tr><td><code>610603</code></td><td>陕西省</td><td>延安市</td><td>安塞区</td></tr>
    <tr><td><code>610621</code></td><td>陕西省</td><td>延安市</td><td>延长县</td></tr>
    <tr><td><code>610622</code></td><td>陕西省</td><td>延安市</td><td>延川县</td></tr>
    <tr><td><code>610623</code></td><td>陕西省</td><td>延安市</td><td>子长县</td></tr>
    <tr><td><code>610625</code></td><td>陕西省</td><td>延安市</td><td>志丹县</td></tr>
    <tr><td><code>610626</code></td><td>陕西省</td><td>延安市</td><td>吴起县</td></tr>
    <tr><td><code>610627</code></td><td>陕西省</td><td>延安市</td><td>甘泉县</td></tr>
    <tr><td><code>610628</code></td><td>陕西省</td><td>延安市</td><td>富县</td></tr>
    <tr><td><code>610629</code></td><td>陕西省</td><td>延安市</td><td>洛川县</td></tr>
    <tr><td><code>610630</code></td><td>陕西省</td><td>延安市</td><td>宜川县</td></tr>
    <tr><td><code>610631</code></td><td>陕西省</td><td>延安市</td><td>黄龙县</td></tr>
    <tr><td><code>610632</code></td><td>陕西省</td><td>延安市</td><td>黄陵县</td></tr>
    <tr class="level-city"><td><code>610700</code></td><td>陕西省</td><td>汉中市</td><td></td></tr>
    <tr><td><code>610702</code></td><td>陕西省</td><td>汉中市</td><td>汉台区</td></tr>
    <tr><td><code>610721</code></td><td>陕西省</td><td>汉中市</td><td>南郑县</td></tr>
    <tr><td><code>610722</code></td><td>陕西省</td><td>汉中市</td><td>城固县</td></tr>
    <tr><td><code>610723</code></td><td>陕西省</td><td>汉中市</td><td>洋县</td></tr>
    <tr><td><code>610724</code></td><td>陕西省</td><td>汉中市</td><td>西乡县</td></tr>
    <tr><td><code>610725</code></td><td>陕西省</td><td>汉中市</td><td>勉县</td></tr>
    <tr><td><code>610726</code></td><td>陕西省</td><td>汉中市</td><td>宁强县</td></tr>
    <tr><td><code>610727</code></td><td>陕西省</td><td>汉中市</td><td>略阳县</td></tr>
    <tr><td><code>610728</code></td><td>陕西省</td><td>汉中市</td><td>镇巴县</td></tr>
    <tr><td><code>610729</code></td><td>陕西省</td><td>汉中市</td><td>留坝县</td></tr>
    <tr><td><code>610730</code></td><td>陕西省</td><td>汉中市</td><td>佛坪县</td></tr>
    <tr class="level-city"><td><code>610800</code></td><td>陕西省</td><td>榆林市</td><td></td></tr>
    <tr><td><code>610802</code></td><td>陕西省</td><td>榆林市</td><td>榆阳区</td></tr>
    <tr><td><code>610803</code></td><td>陕西省</td><td>榆林市</td><td>横山区</td></tr>
    <tr><td><code>610822</code></td><td>陕西省</td><td>榆林市</td><td>府谷县</td></tr>
    <tr><td><code>610824</code></td><td>陕西省</td><td>榆林市</td><td>靖边县</td></tr>
    <tr><td><code>610825</code></td><td>陕西省</td><td>榆林市</td><td>定边县</td></tr>
    <tr><td><code>610826</code></td><td>陕西省</td><td>榆林市</td><td>绥德县</td></tr>
    <tr><td><code>610827</code></td><td>陕西省</td><td>榆林市</td><td>米脂县</td></tr>
    <tr><td><code>610828</code></td><td>陕西省</td><td>榆林市</td><td>佳县</td></tr>
    <tr><td><code>610829</code></td><td>陕西省</td><td>榆林市</td><td>吴堡县</td></tr>
    <tr><td><code>610830</code></td><td>陕西省</td><td>榆林市</td><td>清涧县</td></tr>
    <tr><td><code>610831</code></td><td>陕西省</td><td>榆林市</td><td>子洲县</td></tr>
    <tr><td><code>610881</code></td><td>陕西省</td><td>榆林市</td><td>神木市</td></tr>
    <tr class="level-city"><td><code>610900</code></td><td>陕西省</td><td>安康市</td><td></td></tr>
    <tr><td><code>610902</code></td><td>陕西省</td><td>安康市</td><td>汉滨区</td></tr>
    <tr><td><code>610921</code></td><td>陕西省</td><td>安康市</td><td>汉阴县</td></tr>
    <tr><td><code>610922</code></td><td>陕西省</td><td>安康市</td><td>石泉县</td></tr>
    <tr><td><code>610923</code></td><td>陕西省</td><td>安康市</td><td>宁陕县</td></tr>
    <tr><td><code>610924</code></td><td>陕西省</td><td>安康市</td><td>紫阳县</td></tr>
    <tr><td><code>610925</code></td><td>陕西省</td><td>安康市</td><td>岚皋县</td></tr>
    <tr><td><code>610926</code></td><td>陕西省</td><td>安康市</td><td>平利县</td></tr>
    <tr><td><code>610927</code></td><td>陕西省</td><td>安康市</td><td>镇坪县</td></tr>
    <tr><td><code>610928</code></td><td>陕西省</td><td>安康市</td><td>旬阳县</td></tr>
    <tr><td><code>610929</code></td><td>陕西省</td><td>安康市</td><td>白河县</td></tr>
    <tr class="level-city"><td><code>611000</code></td><td>陕西省</td><td>商洛市</td><td></td></tr>
    <tr><td><code>611002</code></td><td>陕西省</td><td>商洛市</td><td>商州区</td></tr>
    <tr><td><code>611021</code></td><td>陕西省</td><td>商洛市</td><td>洛南县</td></tr>
    <tr><td><code>611022</code></td><td>陕西省</td><td>商洛市</td><td>丹凤县</td></tr>
    <tr><td><code>611023</code></td><td>陕西省</td><td>商洛市</td><td>商南县</td></tr>
    <tr><td><code>611024</code></td><td>陕西省</td><td>商洛市</td><td>山阳县</td></tr>
    <tr><td><code>611025</code></td><td>陕西省</td><td>商洛市</td><td>镇安县</td></tr>
    <tr><td><code>611026</code></td><td>陕西省</td><td>商洛市</td><td>柞水县</td></tr>
  </tbody>
</table>
</div>


## 甘肃省（620000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>620000</code></td><td>甘肃省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>620100</code></td><td>甘肃省</td><td>兰州市</td><td></td></tr>
    <tr><td><code>620102</code></td><td>甘肃省</td><td>兰州市</td><td>城关区</td></tr>
    <tr><td><code>620103</code></td><td>甘肃省</td><td>兰州市</td><td>七里河区</td></tr>
    <tr><td><code>620104</code></td><td>甘肃省</td><td>兰州市</td><td>西固区</td></tr>
    <tr><td><code>620105</code></td><td>甘肃省</td><td>兰州市</td><td>安宁区</td></tr>
    <tr><td><code>620111</code></td><td>甘肃省</td><td>兰州市</td><td>红古区</td></tr>
    <tr><td><code>620121</code></td><td>甘肃省</td><td>兰州市</td><td>永登县</td></tr>
    <tr><td><code>620122</code></td><td>甘肃省</td><td>兰州市</td><td>皋兰县</td></tr>
    <tr><td><code>620123</code></td><td>甘肃省</td><td>兰州市</td><td>榆中县</td></tr>
    <tr class="level-city"><td><code>620200</code></td><td>甘肃省</td><td>嘉峪关市</td><td></td></tr>
    <tr><td><code>620201</code></td><td>甘肃省</td><td>嘉峪关市</td><td>嘉峪关市</td></tr>
    <tr class="level-city"><td><code>620300</code></td><td>甘肃省</td><td>金昌市</td><td></td></tr>
    <tr><td><code>620302</code></td><td>甘肃省</td><td>金昌市</td><td>金川区</td></tr>
    <tr><td><code>620321</code></td><td>甘肃省</td><td>金昌市</td><td>永昌县</td></tr>
    <tr class="level-city"><td><code>620400</code></td><td>甘肃省</td><td>白银市</td><td></td></tr>
    <tr><td><code>620402</code></td><td>甘肃省</td><td>白银市</td><td>白银区</td></tr>
    <tr><td><code>620403</code></td><td>甘肃省</td><td>白银市</td><td>平川区</td></tr>
    <tr><td><code>620421</code></td><td>甘肃省</td><td>白银市</td><td>靖远县</td></tr>
    <tr><td><code>620422</code></td><td>甘肃省</td><td>白银市</td><td>会宁县</td></tr>
    <tr><td><code>620423</code></td><td>甘肃省</td><td>白银市</td><td>景泰县</td></tr>
    <tr class="level-city"><td><code>620500</code></td><td>甘肃省</td><td>天水市</td><td></td></tr>
    <tr><td><code>620502</code></td><td>甘肃省</td><td>天水市</td><td>秦州区</td></tr>
    <tr><td><code>620503</code></td><td>甘肃省</td><td>天水市</td><td>麦积区</td></tr>
    <tr><td><code>620521</code></td><td>甘肃省</td><td>天水市</td><td>清水县</td></tr>
    <tr><td><code>620522</code></td><td>甘肃省</td><td>天水市</td><td>秦安县</td></tr>
    <tr><td><code>620523</code></td><td>甘肃省</td><td>天水市</td><td>甘谷县</td></tr>
    <tr><td><code>620524</code></td><td>甘肃省</td><td>天水市</td><td>武山县</td></tr>
    <tr><td><code>620525</code></td><td>甘肃省</td><td>天水市</td><td>张家川回族自治县</td></tr>
    <tr class="level-city"><td><code>620600</code></td><td>甘肃省</td><td>武威市</td><td></td></tr>
    <tr><td><code>620602</code></td><td>甘肃省</td><td>武威市</td><td>凉州区</td></tr>
    <tr><td><code>620621</code></td><td>甘肃省</td><td>武威市</td><td>民勤县</td></tr>
    <tr><td><code>620622</code></td><td>甘肃省</td><td>武威市</td><td>古浪县</td></tr>
    <tr><td><code>620623</code></td><td>甘肃省</td><td>武威市</td><td>天祝藏族自治县</td></tr>
    <tr class="level-city"><td><code>620700</code></td><td>甘肃省</td><td>张掖市</td><td></td></tr>
    <tr><td><code>620702</code></td><td>甘肃省</td><td>张掖市</td><td>甘州区</td></tr>
    <tr><td><code>620721</code></td><td>甘肃省</td><td>张掖市</td><td>肃南裕固族自治县</td></tr>
    <tr><td><code>620722</code></td><td>甘肃省</td><td>张掖市</td><td>民乐县</td></tr>
    <tr><td><code>620723</code></td><td>甘肃省</td><td>张掖市</td><td>临泽县</td></tr>
    <tr><td><code>620724</code></td><td>甘肃省</td><td>张掖市</td><td>高台县</td></tr>
    <tr><td><code>620725</code></td><td>甘肃省</td><td>张掖市</td><td>山丹县</td></tr>
    <tr class="level-city"><td><code>620800</code></td><td>甘肃省</td><td>平凉市</td><td></td></tr>
    <tr><td><code>620802</code></td><td>甘肃省</td><td>平凉市</td><td>崆峒区</td></tr>
    <tr><td><code>620821</code></td><td>甘肃省</td><td>平凉市</td><td>泾川县</td></tr>
    <tr><td><code>620822</code></td><td>甘肃省</td><td>平凉市</td><td>灵台县</td></tr>
    <tr><td><code>620823</code></td><td>甘肃省</td><td>平凉市</td><td>崇信县</td></tr>
    <tr><td><code>620824</code></td><td>甘肃省</td><td>平凉市</td><td>华亭县</td></tr>
    <tr><td><code>620825</code></td><td>甘肃省</td><td>平凉市</td><td>庄浪县</td></tr>
    <tr><td><code>620826</code></td><td>甘肃省</td><td>平凉市</td><td>静宁县</td></tr>
    <tr class="level-city"><td><code>620900</code></td><td>甘肃省</td><td>酒泉市</td><td></td></tr>
    <tr><td><code>620902</code></td><td>甘肃省</td><td>酒泉市</td><td>肃州区</td></tr>
    <tr><td><code>620921</code></td><td>甘肃省</td><td>酒泉市</td><td>金塔县</td></tr>
    <tr><td><code>620922</code></td><td>甘肃省</td><td>酒泉市</td><td>瓜州县</td></tr>
    <tr><td><code>620923</code></td><td>甘肃省</td><td>酒泉市</td><td>肃北蒙古族自治县</td></tr>
    <tr><td><code>620924</code></td><td>甘肃省</td><td>酒泉市</td><td>阿克塞哈萨克族自治县</td></tr>
    <tr><td><code>620981</code></td><td>甘肃省</td><td>酒泉市</td><td>玉门市</td></tr>
    <tr><td><code>620982</code></td><td>甘肃省</td><td>酒泉市</td><td>敦煌市</td></tr>
    <tr class="level-city"><td><code>621000</code></td><td>甘肃省</td><td>庆阳市</td><td></td></tr>
    <tr><td><code>621002</code></td><td>甘肃省</td><td>庆阳市</td><td>西峰区</td></tr>
    <tr><td><code>621021</code></td><td>甘肃省</td><td>庆阳市</td><td>庆城县</td></tr>
    <tr><td><code>621022</code></td><td>甘肃省</td><td>庆阳市</td><td>环县</td></tr>
    <tr><td><code>621023</code></td><td>甘肃省</td><td>庆阳市</td><td>华池县</td></tr>
    <tr><td><code>621024</code></td><td>甘肃省</td><td>庆阳市</td><td>合水县</td></tr>
    <tr><td><code>621025</code></td><td>甘肃省</td><td>庆阳市</td><td>正宁县</td></tr>
    <tr><td><code>621026</code></td><td>甘肃省</td><td>庆阳市</td><td>宁县</td></tr>
    <tr><td><code>621027</code></td><td>甘肃省</td><td>庆阳市</td><td>镇原县</td></tr>
    <tr class="level-city"><td><code>621100</code></td><td>甘肃省</td><td>定西市</td><td></td></tr>
    <tr><td><code>621102</code></td><td>甘肃省</td><td>定西市</td><td>安定区</td></tr>
    <tr><td><code>621121</code></td><td>甘肃省</td><td>定西市</td><td>通渭县</td></tr>
    <tr><td><code>621122</code></td><td>甘肃省</td><td>定西市</td><td>陇西县</td></tr>
    <tr><td><code>621123</code></td><td>甘肃省</td><td>定西市</td><td>渭源县</td></tr>
    <tr><td><code>621124</code></td><td>甘肃省</td><td>定西市</td><td>临洮县</td></tr>
    <tr><td><code>621125</code></td><td>甘肃省</td><td>定西市</td><td>漳县</td></tr>
    <tr><td><code>621126</code></td><td>甘肃省</td><td>定西市</td><td>岷县</td></tr>
    <tr class="level-city"><td><code>621200</code></td><td>甘肃省</td><td>陇南市</td><td></td></tr>
    <tr><td><code>621202</code></td><td>甘肃省</td><td>陇南市</td><td>武都区</td></tr>
    <tr><td><code>621221</code></td><td>甘肃省</td><td>陇南市</td><td>成县</td></tr>
    <tr><td><code>621222</code></td><td>甘肃省</td><td>陇南市</td><td>文县</td></tr>
    <tr><td><code>621223</code></td><td>甘肃省</td><td>陇南市</td><td>宕昌县</td></tr>
    <tr><td><code>621224</code></td><td>甘肃省</td><td>陇南市</td><td>康县</td></tr>
    <tr><td><code>621225</code></td><td>甘肃省</td><td>陇南市</td><td>西和县</td></tr>
    <tr><td><code>621226</code></td><td>甘肃省</td><td>陇南市</td><td>礼县</td></tr>
    <tr><td><code>621227</code></td><td>甘肃省</td><td>陇南市</td><td>徽县</td></tr>
    <tr><td><code>621228</code></td><td>甘肃省</td><td>陇南市</td><td>两当县</td></tr>
    <tr class="level-city"><td><code>622900</code></td><td>甘肃省</td><td>临夏回族自治州</td><td></td></tr>
    <tr><td><code>622901</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>临夏市</td></tr>
    <tr><td><code>622921</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>临夏县</td></tr>
    <tr><td><code>622922</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>康乐县</td></tr>
    <tr><td><code>622923</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>永靖县</td></tr>
    <tr><td><code>622924</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>广河县</td></tr>
    <tr><td><code>622925</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>和政县</td></tr>
    <tr><td><code>622926</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>东乡族自治县</td></tr>
    <tr><td><code>622927</code></td><td>甘肃省</td><td>临夏回族自治州</td><td>积石山保安族东乡族撒拉族自治县</td></tr>
    <tr class="level-city"><td><code>623000</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td></td></tr>
    <tr><td><code>623001</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>合作市</td></tr>
    <tr><td><code>623021</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>临潭县</td></tr>
    <tr><td><code>623022</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>卓尼县</td></tr>
    <tr><td><code>623023</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>舟曲县</td></tr>
    <tr><td><code>623024</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>迭部县</td></tr>
    <tr><td><code>623025</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>玛曲县</td></tr>
    <tr><td><code>623026</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>碌曲县</td></tr>
    <tr><td><code>623027</code></td><td>甘肃省</td><td>甘南藏族自治州</td><td>夏河县</td></tr>
  </tbody>
</table>
</div>


## 青海省（630000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>630000</code></td><td>青海省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>630100</code></td><td>青海省</td><td>西宁市</td><td></td></tr>
    <tr><td><code>630102</code></td><td>青海省</td><td>西宁市</td><td>城东区</td></tr>
    <tr><td><code>630103</code></td><td>青海省</td><td>西宁市</td><td>城中区</td></tr>
    <tr><td><code>630104</code></td><td>青海省</td><td>西宁市</td><td>城西区</td></tr>
    <tr><td><code>630105</code></td><td>青海省</td><td>西宁市</td><td>城北区</td></tr>
    <tr><td><code>630121</code></td><td>青海省</td><td>西宁市</td><td>大通回族土族自治县</td></tr>
    <tr><td><code>630122</code></td><td>青海省</td><td>西宁市</td><td>湟中县</td></tr>
    <tr><td><code>630123</code></td><td>青海省</td><td>西宁市</td><td>湟源县</td></tr>
    <tr class="level-city"><td><code>630200</code></td><td>青海省</td><td>海东市</td><td></td></tr>
    <tr><td><code>630202</code></td><td>青海省</td><td>海东市</td><td>乐都区</td></tr>
    <tr><td><code>630203</code></td><td>青海省</td><td>海东市</td><td>平安区</td></tr>
    <tr><td><code>630222</code></td><td>青海省</td><td>海东市</td><td>民和回族土族自治县</td></tr>
    <tr><td><code>630223</code></td><td>青海省</td><td>海东市</td><td>互助土族自治县</td></tr>
    <tr><td><code>630224</code></td><td>青海省</td><td>海东市</td><td>化隆回族自治县</td></tr>
    <tr><td><code>630225</code></td><td>青海省</td><td>海东市</td><td>循化撒拉族自治县</td></tr>
    <tr class="level-city"><td><code>632200</code></td><td>青海省</td><td>海北藏族自治州</td><td></td></tr>
    <tr><td><code>632221</code></td><td>青海省</td><td>海北藏族自治州</td><td>门源回族自治县</td></tr>
    <tr><td><code>632222</code></td><td>青海省</td><td>海北藏族自治州</td><td>祁连县</td></tr>
    <tr><td><code>632223</code></td><td>青海省</td><td>海北藏族自治州</td><td>海晏县</td></tr>
    <tr><td><code>632224</code></td><td>青海省</td><td>海北藏族自治州</td><td>刚察县</td></tr>
    <tr class="level-city"><td><code>632300</code></td><td>青海省</td><td>黄南藏族自治州</td><td></td></tr>
    <tr><td><code>632321</code></td><td>青海省</td><td>黄南藏族自治州</td><td>同仁县</td></tr>
    <tr><td><code>632322</code></td><td>青海省</td><td>黄南藏族自治州</td><td>尖扎县</td></tr>
    <tr><td><code>632323</code></td><td>青海省</td><td>黄南藏族自治州</td><td>泽库县</td></tr>
    <tr><td><code>632324</code></td><td>青海省</td><td>黄南藏族自治州</td><td>河南蒙古族自治县</td></tr>
    <tr class="level-city"><td><code>632500</code></td><td>青海省</td><td>海南藏族自治州</td><td></td></tr>
    <tr><td><code>632521</code></td><td>青海省</td><td>海南藏族自治州</td><td>共和县</td></tr>
    <tr><td><code>632522</code></td><td>青海省</td><td>海南藏族自治州</td><td>同德县</td></tr>
    <tr><td><code>632523</code></td><td>青海省</td><td>海南藏族自治州</td><td>贵德县</td></tr>
    <tr><td><code>632524</code></td><td>青海省</td><td>海南藏族自治州</td><td>兴海县</td></tr>
    <tr><td><code>632525</code></td><td>青海省</td><td>海南藏族自治州</td><td>贵南县</td></tr>
    <tr class="level-city"><td><code>632600</code></td><td>青海省</td><td>果洛藏族自治州</td><td></td></tr>
    <tr><td><code>632621</code></td><td>青海省</td><td>果洛藏族自治州</td><td>玛沁县</td></tr>
    <tr><td><code>632622</code></td><td>青海省</td><td>果洛藏族自治州</td><td>班玛县</td></tr>
    <tr><td><code>632623</code></td><td>青海省</td><td>果洛藏族自治州</td><td>甘德县</td></tr>
    <tr><td><code>632624</code></td><td>青海省</td><td>果洛藏族自治州</td><td>达日县</td></tr>
    <tr><td><code>632625</code></td><td>青海省</td><td>果洛藏族自治州</td><td>久治县</td></tr>
    <tr><td><code>632626</code></td><td>青海省</td><td>果洛藏族自治州</td><td>玛多县</td></tr>
    <tr class="level-city"><td><code>632700</code></td><td>青海省</td><td>玉树藏族自治州</td><td></td></tr>
    <tr><td><code>632701</code></td><td>青海省</td><td>玉树藏族自治州</td><td>玉树市</td></tr>
    <tr><td><code>632722</code></td><td>青海省</td><td>玉树藏族自治州</td><td>杂多县</td></tr>
    <tr><td><code>632723</code></td><td>青海省</td><td>玉树藏族自治州</td><td>称多县</td></tr>
    <tr><td><code>632724</code></td><td>青海省</td><td>玉树藏族自治州</td><td>治多县</td></tr>
    <tr><td><code>632725</code></td><td>青海省</td><td>玉树藏族自治州</td><td>囊谦县</td></tr>
    <tr><td><code>632726</code></td><td>青海省</td><td>玉树藏族自治州</td><td>曲麻莱县</td></tr>
    <tr class="level-city"><td><code>632800</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td></td></tr>
    <tr><td><code>632801</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>格尔木市</td></tr>
    <tr><td><code>632802</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>德令哈市</td></tr>
    <tr><td><code>632821</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>乌兰县</td></tr>
    <tr><td><code>632822</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>都兰县</td></tr>
    <tr><td><code>632823</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>天峻县</td></tr>
    <tr><td><code>632824</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>冷湖行政区</td></tr>
    <tr><td><code>632825</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>大柴旦行政区</td></tr>
    <tr><td><code>632826</code></td><td>青海省</td><td>海西蒙古族藏族自治州</td><td>茫崖行政区</td></tr>
  </tbody>
</table>
</div>


## 宁夏回族自治区（640000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>640000</code></td><td>宁夏回族自治区</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>640100</code></td><td>宁夏回族自治区</td><td>银川市</td><td></td></tr>
    <tr><td><code>640104</code></td><td>宁夏回族自治区</td><td>银川市</td><td>兴庆区</td></tr>
    <tr><td><code>640105</code></td><td>宁夏回族自治区</td><td>银川市</td><td>西夏区</td></tr>
    <tr><td><code>640106</code></td><td>宁夏回族自治区</td><td>银川市</td><td>金凤区</td></tr>
    <tr><td><code>640121</code></td><td>宁夏回族自治区</td><td>银川市</td><td>永宁县</td></tr>
    <tr><td><code>640122</code></td><td>宁夏回族自治区</td><td>银川市</td><td>贺兰县</td></tr>
    <tr><td><code>640181</code></td><td>宁夏回族自治区</td><td>银川市</td><td>灵武市</td></tr>
    <tr class="level-city"><td><code>640200</code></td><td>宁夏回族自治区</td><td>石嘴山市</td><td></td></tr>
    <tr><td><code>640202</code></td><td>宁夏回族自治区</td><td>石嘴山市</td><td>大武口区</td></tr>
    <tr><td><code>640205</code></td><td>宁夏回族自治区</td><td>石嘴山市</td><td>惠农区</td></tr>
    <tr><td><code>640221</code></td><td>宁夏回族自治区</td><td>石嘴山市</td><td>平罗县</td></tr>
    <tr class="level-city"><td><code>640300</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td></td></tr>
    <tr><td><code>640302</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td>利通区</td></tr>
    <tr><td><code>640303</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td>红寺堡区</td></tr>
    <tr><td><code>640323</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td>盐池县</td></tr>
    <tr><td><code>640324</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td>同心县</td></tr>
    <tr><td><code>640381</code></td><td>宁夏回族自治区</td><td>吴忠市</td><td>青铜峡市</td></tr>
    <tr class="level-city"><td><code>640400</code></td><td>宁夏回族自治区</td><td>固原市</td><td></td></tr>
    <tr><td><code>640402</code></td><td>宁夏回族自治区</td><td>固原市</td><td>原州区</td></tr>
    <tr><td><code>640422</code></td><td>宁夏回族自治区</td><td>固原市</td><td>西吉县</td></tr>
    <tr><td><code>640423</code></td><td>宁夏回族自治区</td><td>固原市</td><td>隆德县</td></tr>
    <tr><td><code>640424</code></td><td>宁夏回族自治区</td><td>固原市</td><td>泾源县</td></tr>
    <tr><td><code>640425</code></td><td>宁夏回族自治区</td><td>固原市</td><td>彭阳县</td></tr>
    <tr class="level-city"><td><code>640500</code></td><td>宁夏回族自治区</td><td>中卫市</td><td></td></tr>
    <tr><td><code>640502</code></td><td>宁夏回族自治区</td><td>中卫市</td><td>沙坡头区</td></tr>
    <tr><td><code>640521</code></td><td>宁夏回族自治区</td><td>中卫市</td><td>中宁县</td></tr>
    <tr><td><code>640522</code></td><td>宁夏回族自治区</td><td>中卫市</td><td>海原县</td></tr>
  </tbody>
</table>
</div>


## 新疆维吾尔自治区（650000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>650000</code></td><td>新疆维吾尔自治区</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>650100</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td></td></tr>
    <tr><td><code>650102</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>天山区</td></tr>
    <tr><td><code>650103</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>沙依巴克区</td></tr>
    <tr><td><code>650104</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>新市区</td></tr>
    <tr><td><code>650105</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>水磨沟区</td></tr>
    <tr><td><code>650106</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>头屯河区</td></tr>
    <tr><td><code>650107</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>达坂城区</td></tr>
    <tr><td><code>650109</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>米东区</td></tr>
    <tr><td><code>650121</code></td><td>新疆维吾尔自治区</td><td>乌鲁木齐市</td><td>乌鲁木齐县</td></tr>
    <tr class="level-city"><td><code>650200</code></td><td>新疆维吾尔自治区</td><td>克拉玛依市</td><td></td></tr>
    <tr><td><code>650202</code></td><td>新疆维吾尔自治区</td><td>克拉玛依市</td><td>独山子区</td></tr>
    <tr><td><code>650203</code></td><td>新疆维吾尔自治区</td><td>克拉玛依市</td><td>克拉玛依区</td></tr>
    <tr><td><code>650204</code></td><td>新疆维吾尔自治区</td><td>克拉玛依市</td><td>白碱滩区</td></tr>
    <tr><td><code>650205</code></td><td>新疆维吾尔自治区</td><td>克拉玛依市</td><td>乌尔禾区</td></tr>
    <tr class="level-city"><td><code>650400</code></td><td>新疆维吾尔自治区</td><td>吐鲁番市</td><td></td></tr>
    <tr><td><code>650402</code></td><td>新疆维吾尔自治区</td><td>吐鲁番市</td><td>高昌区</td></tr>
    <tr><td><code>650421</code></td><td>新疆维吾尔自治区</td><td>吐鲁番市</td><td>鄯善县</td></tr>
    <tr><td><code>650422</code></td><td>新疆维吾尔自治区</td><td>吐鲁番市</td><td>托克逊县</td></tr>
    <tr class="level-city"><td><code>650500</code></td><td>新疆维吾尔自治区</td><td>哈密市</td><td></td></tr>
    <tr><td><code>650502</code></td><td>新疆维吾尔自治区</td><td>哈密市</td><td>伊州区</td></tr>
    <tr><td><code>650521</code></td><td>新疆维吾尔自治区</td><td>哈密市</td><td>巴里坤哈萨克自治县</td></tr>
    <tr><td><code>650522</code></td><td>新疆维吾尔自治区</td><td>哈密市</td><td>伊吾县</td></tr>
    <tr class="level-city"><td><code>652300</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td></td></tr>
    <tr><td><code>652301</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>昌吉市</td></tr>
    <tr><td><code>652302</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>阜康市</td></tr>
    <tr><td><code>652323</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>呼图壁县</td></tr>
    <tr><td><code>652324</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>玛纳斯县</td></tr>
    <tr><td><code>652325</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>奇台县</td></tr>
    <tr><td><code>652327</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>吉木萨尔县</td></tr>
    <tr><td><code>652328</code></td><td>新疆维吾尔自治区</td><td>昌吉回族自治州</td><td>木垒哈萨克自治县</td></tr>
    <tr class="level-city"><td><code>652700</code></td><td>新疆维吾尔自治区</td><td>博尔塔拉蒙古自治州</td><td></td></tr>
    <tr><td><code>652701</code></td><td>新疆维吾尔自治区</td><td>博尔塔拉蒙古自治州</td><td>博乐市</td></tr>
    <tr><td><code>652702</code></td><td>新疆维吾尔自治区</td><td>博尔塔拉蒙古自治州</td><td>阿拉山口市</td></tr>
    <tr><td><code>652722</code></td><td>新疆维吾尔自治区</td><td>博尔塔拉蒙古自治州</td><td>精河县</td></tr>
    <tr><td><code>652723</code></td><td>新疆维吾尔自治区</td><td>博尔塔拉蒙古自治州</td><td>温泉县</td></tr>
    <tr class="level-city"><td><code>652800</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td></td></tr>
    <tr><td><code>652801</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>库尔勒市</td></tr>
    <tr><td><code>652822</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>轮台县</td></tr>
    <tr><td><code>652823</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>尉犁县</td></tr>
    <tr><td><code>652824</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>若羌县</td></tr>
    <tr><td><code>652825</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>且末县</td></tr>
    <tr><td><code>652826</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>焉耆回族自治县</td></tr>
    <tr><td><code>652827</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>和静县</td></tr>
    <tr><td><code>652828</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>和硕县</td></tr>
    <tr><td><code>652829</code></td><td>新疆维吾尔自治区</td><td>巴音郭楞蒙古自治州</td><td>博湖县</td></tr>
    <tr class="level-city"><td><code>652900</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td></td></tr>
    <tr><td><code>652901</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>阿克苏市</td></tr>
    <tr><td><code>652922</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>温宿县</td></tr>
    <tr><td><code>652923</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>库车县</td></tr>
    <tr><td><code>652924</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>沙雅县</td></tr>
    <tr><td><code>652925</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>新和县</td></tr>
    <tr><td><code>652926</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>拜城县</td></tr>
    <tr><td><code>652927</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>乌什县</td></tr>
    <tr><td><code>652928</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>阿瓦提县</td></tr>
    <tr><td><code>652929</code></td><td>新疆维吾尔自治区</td><td>阿克苏地区</td><td>柯坪县</td></tr>
    <tr class="level-city"><td><code>653000</code></td><td>新疆维吾尔自治区</td><td>克孜勒苏柯尔克孜自治州</td><td></td></tr>
    <tr><td><code>653001</code></td><td>新疆维吾尔自治区</td><td>克孜勒苏柯尔克孜自治州</td><td>阿图什市</td></tr>
    <tr><td><code>653022</code></td><td>新疆维吾尔自治区</td><td>克孜勒苏柯尔克孜自治州</td><td>阿克陶县</td></tr>
    <tr><td><code>653023</code></td><td>新疆维吾尔自治区</td><td>克孜勒苏柯尔克孜自治州</td><td>阿合奇县</td></tr>
    <tr><td><code>653024</code></td><td>新疆维吾尔自治区</td><td>克孜勒苏柯尔克孜自治州</td><td>乌恰县</td></tr>
    <tr class="level-city"><td><code>653100</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td></td></tr>
    <tr><td><code>653101</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>喀什市</td></tr>
    <tr><td><code>653121</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>疏附县</td></tr>
    <tr><td><code>653122</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>疏勒县</td></tr>
    <tr><td><code>653123</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>英吉沙县</td></tr>
    <tr><td><code>653124</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>泽普县</td></tr>
    <tr><td><code>653125</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>莎车县</td></tr>
    <tr><td><code>653126</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>叶城县</td></tr>
    <tr><td><code>653127</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>麦盖提县</td></tr>
    <tr><td><code>653128</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>岳普湖县</td></tr>
    <tr><td><code>653129</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>伽师县</td></tr>
    <tr><td><code>653130</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>巴楚县</td></tr>
    <tr><td><code>653131</code></td><td>新疆维吾尔自治区</td><td>喀什地区</td><td>塔什库尔干塔吉克自治县</td></tr>
    <tr class="level-city"><td><code>653200</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td></td></tr>
    <tr><td><code>653201</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>和田市</td></tr>
    <tr><td><code>653221</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>和田县</td></tr>
    <tr><td><code>653222</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>墨玉县</td></tr>
    <tr><td><code>653223</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>皮山县</td></tr>
    <tr><td><code>653224</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>洛浦县</td></tr>
    <tr><td><code>653225</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>策勒县</td></tr>
    <tr><td><code>653226</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>于田县</td></tr>
    <tr><td><code>653227</code></td><td>新疆维吾尔自治区</td><td>和田地区</td><td>民丰县</td></tr>
    <tr class="level-city"><td><code>654000</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td></td></tr>
    <tr><td><code>654002</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>伊宁市</td></tr>
    <tr><td><code>654003</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>奎屯市</td></tr>
    <tr><td><code>654004</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>霍尔果斯市</td></tr>
    <tr><td><code>654021</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>伊宁县</td></tr>
    <tr><td><code>654022</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>察布查尔锡伯自治县</td></tr>
    <tr><td><code>654023</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>霍城县</td></tr>
    <tr><td><code>654024</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>巩留县</td></tr>
    <tr><td><code>654025</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>新源县</td></tr>
    <tr><td><code>654026</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>昭苏县</td></tr>
    <tr><td><code>654027</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>特克斯县</td></tr>
    <tr><td><code>654028</code></td><td>新疆维吾尔自治区</td><td>伊犁哈萨克自治州</td><td>尼勒克县</td></tr>
    <tr class="level-city"><td><code>654200</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td></td></tr>
    <tr><td><code>654201</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>塔城市</td></tr>
    <tr><td><code>654202</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>乌苏市</td></tr>
    <tr><td><code>654221</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>额敏县</td></tr>
    <tr><td><code>654223</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>沙湾县</td></tr>
    <tr><td><code>654224</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>托里县</td></tr>
    <tr><td><code>654225</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>裕民县</td></tr>
    <tr><td><code>654226</code></td><td>新疆维吾尔自治区</td><td>塔城地区</td><td>和布克赛尔蒙古自治县</td></tr>
    <tr class="level-city"><td><code>654300</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td></td></tr>
    <tr><td><code>654301</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>阿勒泰市</td></tr>
    <tr><td><code>654321</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>布尔津县</td></tr>
    <tr><td><code>654322</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>富蕴县</td></tr>
    <tr><td><code>654323</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>福海县</td></tr>
    <tr><td><code>654324</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>哈巴河县</td></tr>
    <tr><td><code>654325</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>青河县</td></tr>
    <tr><td><code>654326</code></td><td>新疆维吾尔自治区</td><td>阿勒泰地区</td><td>吉木乃县</td></tr>
    <tr><td><code>659001</code></td><td>新疆维吾尔自治区</td><td>石河子市</td><td>石河子市</td></tr>
    <tr><td><code>659002</code></td><td>新疆维吾尔自治区</td><td>阿拉尔市</td><td>阿拉尔市</td></tr>
    <tr><td><code>659003</code></td><td>新疆维吾尔自治区</td><td>图木舒克市</td><td>图木舒克市</td></tr>
    <tr><td><code>659004</code></td><td>新疆维吾尔自治区</td><td>五家渠市</td><td>五家渠市</td></tr>
    <tr><td><code>659005</code></td><td>新疆维吾尔自治区</td><td>北屯市</td><td>北屯市</td></tr>
    <tr><td><code>659006</code></td><td>新疆维吾尔自治区</td><td>铁门关市</td><td>铁门关市</td></tr>
    <tr><td><code>659007</code></td><td>新疆维吾尔自治区</td><td>双河市</td><td>双河市</td></tr>
    <tr><td><code>659008</code></td><td>新疆维吾尔自治区</td><td>可克达拉市</td><td>可克达拉市</td></tr>
    <tr><td><code>659009</code></td><td>新疆维吾尔自治区</td><td>昆玉市</td><td>昆玉市</td></tr>
  </tbody>
</table>
</div>


## 台湾省（710000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>710000</code></td><td>台湾省</td><td></td><td></td></tr>
    <tr class="level-city"><td><code>710100</code></td><td>台湾省</td><td>台北市</td><td></td></tr>
    <tr><td><code>710101</code></td><td>台湾省</td><td>台北市</td><td>中正区</td></tr>
    <tr><td><code>710102</code></td><td>台湾省</td><td>台北市</td><td>大同区</td></tr>
    <tr><td><code>710103</code></td><td>台湾省</td><td>台北市</td><td>中山区</td></tr>
    <tr><td><code>710104</code></td><td>台湾省</td><td>台北市</td><td>松山区</td></tr>
    <tr><td><code>710105</code></td><td>台湾省</td><td>台北市</td><td>大安区</td></tr>
    <tr><td><code>710106</code></td><td>台湾省</td><td>台北市</td><td>万华区</td></tr>
    <tr><td><code>710107</code></td><td>台湾省</td><td>台北市</td><td>信义区</td></tr>
    <tr><td><code>710108</code></td><td>台湾省</td><td>台北市</td><td>士林区</td></tr>
    <tr><td><code>710109</code></td><td>台湾省</td><td>台北市</td><td>北投区</td></tr>
    <tr><td><code>710110</code></td><td>台湾省</td><td>台北市</td><td>内湖区</td></tr>
    <tr><td><code>710111</code></td><td>台湾省</td><td>台北市</td><td>南港区</td></tr>
    <tr><td><code>710112</code></td><td>台湾省</td><td>台北市</td><td>文山区</td></tr>
    <tr class="level-city"><td><code>710200</code></td><td>台湾省</td><td>高雄市</td><td></td></tr>
    <tr><td><code>710201</code></td><td>台湾省</td><td>高雄市</td><td>新兴区</td></tr>
    <tr><td><code>710202</code></td><td>台湾省</td><td>高雄市</td><td>前金区</td></tr>
    <tr><td><code>710203</code></td><td>台湾省</td><td>高雄市</td><td>苓雅区</td></tr>
    <tr><td><code>710204</code></td><td>台湾省</td><td>高雄市</td><td>盐埕区</td></tr>
    <tr><td><code>710205</code></td><td>台湾省</td><td>高雄市</td><td>鼓山区</td></tr>
    <tr><td><code>710206</code></td><td>台湾省</td><td>高雄市</td><td>旗津区</td></tr>
    <tr><td><code>710207</code></td><td>台湾省</td><td>高雄市</td><td>前镇区</td></tr>
    <tr><td><code>710208</code></td><td>台湾省</td><td>高雄市</td><td>三民区</td></tr>
    <tr><td><code>710209</code></td><td>台湾省</td><td>高雄市</td><td>左营区</td></tr>
    <tr><td><code>710210</code></td><td>台湾省</td><td>高雄市</td><td>楠梓区</td></tr>
    <tr><td><code>710211</code></td><td>台湾省</td><td>高雄市</td><td>小港区</td></tr>
    <tr><td><code>710242</code></td><td>台湾省</td><td>高雄市</td><td>仁武区</td></tr>
    <tr><td><code>710243</code></td><td>台湾省</td><td>高雄市</td><td>大社区</td></tr>
    <tr><td><code>710244</code></td><td>台湾省</td><td>高雄市</td><td>冈山区</td></tr>
    <tr><td><code>710245</code></td><td>台湾省</td><td>高雄市</td><td>路竹区</td></tr>
    <tr><td><code>710246</code></td><td>台湾省</td><td>高雄市</td><td>阿莲区</td></tr>
    <tr><td><code>710247</code></td><td>台湾省</td><td>高雄市</td><td>田寮区</td></tr>
    <tr><td><code>710248</code></td><td>台湾省</td><td>高雄市</td><td>燕巢区</td></tr>
    <tr><td><code>710249</code></td><td>台湾省</td><td>高雄市</td><td>桥头区</td></tr>
    <tr><td><code>710250</code></td><td>台湾省</td><td>高雄市</td><td>梓官区</td></tr>
    <tr><td><code>710251</code></td><td>台湾省</td><td>高雄市</td><td>弥陀区</td></tr>
    <tr><td><code>710252</code></td><td>台湾省</td><td>高雄市</td><td>永安区</td></tr>
    <tr><td><code>710253</code></td><td>台湾省</td><td>高雄市</td><td>湖内区</td></tr>
    <tr><td><code>710254</code></td><td>台湾省</td><td>高雄市</td><td>凤山区</td></tr>
    <tr><td><code>710255</code></td><td>台湾省</td><td>高雄市</td><td>大寮区</td></tr>
    <tr><td><code>710256</code></td><td>台湾省</td><td>高雄市</td><td>林园区</td></tr>
    <tr><td><code>710257</code></td><td>台湾省</td><td>高雄市</td><td>鸟松区</td></tr>
    <tr><td><code>710258</code></td><td>台湾省</td><td>高雄市</td><td>大树区</td></tr>
    <tr><td><code>710259</code></td><td>台湾省</td><td>高雄市</td><td>旗山区</td></tr>
    <tr><td><code>710260</code></td><td>台湾省</td><td>高雄市</td><td>美浓区</td></tr>
    <tr><td><code>710261</code></td><td>台湾省</td><td>高雄市</td><td>六龟区</td></tr>
    <tr><td><code>710262</code></td><td>台湾省</td><td>高雄市</td><td>内门区</td></tr>
    <tr><td><code>710263</code></td><td>台湾省</td><td>高雄市</td><td>杉林区</td></tr>
    <tr><td><code>710264</code></td><td>台湾省</td><td>高雄市</td><td>甲仙区</td></tr>
    <tr><td><code>710265</code></td><td>台湾省</td><td>高雄市</td><td>桃源区</td></tr>
    <tr><td><code>710266</code></td><td>台湾省</td><td>高雄市</td><td>那玛夏区</td></tr>
    <tr><td><code>710267</code></td><td>台湾省</td><td>高雄市</td><td>茂林区</td></tr>
    <tr><td><code>710268</code></td><td>台湾省</td><td>高雄市</td><td>茄萣区</td></tr>
    <tr class="level-city"><td><code>710300</code></td><td>台湾省</td><td>台南市</td><td></td></tr>
    <tr><td><code>710301</code></td><td>台湾省</td><td>台南市</td><td>中西区</td></tr>
    <tr><td><code>710302</code></td><td>台湾省</td><td>台南市</td><td>东区</td></tr>
    <tr><td><code>710303</code></td><td>台湾省</td><td>台南市</td><td>南区</td></tr>
    <tr><td><code>710304</code></td><td>台湾省</td><td>台南市</td><td>北区</td></tr>
    <tr><td><code>710305</code></td><td>台湾省</td><td>台南市</td><td>安平区</td></tr>
    <tr><td><code>710306</code></td><td>台湾省</td><td>台南市</td><td>安南区</td></tr>
    <tr><td><code>710339</code></td><td>台湾省</td><td>台南市</td><td>永康区</td></tr>
    <tr><td><code>710340</code></td><td>台湾省</td><td>台南市</td><td>归仁区</td></tr>
    <tr><td><code>710341</code></td><td>台湾省</td><td>台南市</td><td>新化区</td></tr>
    <tr><td><code>710342</code></td><td>台湾省</td><td>台南市</td><td>左镇区</td></tr>
    <tr><td><code>710343</code></td><td>台湾省</td><td>台南市</td><td>玉井区</td></tr>
    <tr><td><code>710344</code></td><td>台湾省</td><td>台南市</td><td>楠西区</td></tr>
    <tr><td><code>710345</code></td><td>台湾省</td><td>台南市</td><td>南化区</td></tr>
    <tr><td><code>710346</code></td><td>台湾省</td><td>台南市</td><td>仁德区</td></tr>
    <tr><td><code>710347</code></td><td>台湾省</td><td>台南市</td><td>关庙区</td></tr>
    <tr><td><code>710348</code></td><td>台湾省</td><td>台南市</td><td>龙崎区</td></tr>
    <tr><td><code>710349</code></td><td>台湾省</td><td>台南市</td><td>官田区</td></tr>
    <tr><td><code>710350</code></td><td>台湾省</td><td>台南市</td><td>麻豆区</td></tr>
    <tr><td><code>710351</code></td><td>台湾省</td><td>台南市</td><td>佳里区</td></tr>
    <tr><td><code>710352</code></td><td>台湾省</td><td>台南市</td><td>西港区</td></tr>
    <tr><td><code>710353</code></td><td>台湾省</td><td>台南市</td><td>七股区</td></tr>
    <tr><td><code>710354</code></td><td>台湾省</td><td>台南市</td><td>将军区</td></tr>
    <tr><td><code>710355</code></td><td>台湾省</td><td>台南市</td><td>学甲区</td></tr>
    <tr><td><code>710356</code></td><td>台湾省</td><td>台南市</td><td>北门区</td></tr>
    <tr><td><code>710357</code></td><td>台湾省</td><td>台南市</td><td>新营区</td></tr>
    <tr><td><code>710358</code></td><td>台湾省</td><td>台南市</td><td>后壁区</td></tr>
    <tr><td><code>710359</code></td><td>台湾省</td><td>台南市</td><td>白河区</td></tr>
    <tr><td><code>710360</code></td><td>台湾省</td><td>台南市</td><td>东山区</td></tr>
    <tr><td><code>710361</code></td><td>台湾省</td><td>台南市</td><td>六甲区</td></tr>
    <tr><td><code>710362</code></td><td>台湾省</td><td>台南市</td><td>下营区</td></tr>
    <tr><td><code>710363</code></td><td>台湾省</td><td>台南市</td><td>柳营区</td></tr>
    <tr><td><code>710364</code></td><td>台湾省</td><td>台南市</td><td>盐水区</td></tr>
    <tr><td><code>710365</code></td><td>台湾省</td><td>台南市</td><td>善化区</td></tr>
    <tr><td><code>710366</code></td><td>台湾省</td><td>台南市</td><td>大内区</td></tr>
    <tr><td><code>710367</code></td><td>台湾省</td><td>台南市</td><td>山上区</td></tr>
    <tr><td><code>710368</code></td><td>台湾省</td><td>台南市</td><td>新市区</td></tr>
    <tr><td><code>710369</code></td><td>台湾省</td><td>台南市</td><td>安定区</td></tr>
    <tr class="level-city"><td><code>710400</code></td><td>台湾省</td><td>台中市</td><td></td></tr>
    <tr><td><code>710401</code></td><td>台湾省</td><td>台中市</td><td>中区</td></tr>
    <tr><td><code>710402</code></td><td>台湾省</td><td>台中市</td><td>东区</td></tr>
    <tr><td><code>710403</code></td><td>台湾省</td><td>台中市</td><td>南区</td></tr>
    <tr><td><code>710404</code></td><td>台湾省</td><td>台中市</td><td>西区</td></tr>
    <tr><td><code>710405</code></td><td>台湾省</td><td>台中市</td><td>北区</td></tr>
    <tr><td><code>710406</code></td><td>台湾省</td><td>台中市</td><td>北屯区</td></tr>
    <tr><td><code>710407</code></td><td>台湾省</td><td>台中市</td><td>西屯区</td></tr>
    <tr><td><code>710408</code></td><td>台湾省</td><td>台中市</td><td>南屯区</td></tr>
    <tr><td><code>710431</code></td><td>台湾省</td><td>台中市</td><td>太平区</td></tr>
    <tr><td><code>710432</code></td><td>台湾省</td><td>台中市</td><td>大里区</td></tr>
    <tr><td><code>710433</code></td><td>台湾省</td><td>台中市</td><td>雾峰区</td></tr>
    <tr><td><code>710434</code></td><td>台湾省</td><td>台中市</td><td>乌日区</td></tr>
    <tr><td><code>710435</code></td><td>台湾省</td><td>台中市</td><td>丰原区</td></tr>
    <tr><td><code>710436</code></td><td>台湾省</td><td>台中市</td><td>后里区</td></tr>
    <tr><td><code>710437</code></td><td>台湾省</td><td>台中市</td><td>石冈区</td></tr>
    <tr><td><code>710438</code></td><td>台湾省</td><td>台中市</td><td>东势区</td></tr>
    <tr><td><code>710439</code></td><td>台湾省</td><td>台中市</td><td>和平区</td></tr>
    <tr><td><code>710440</code></td><td>台湾省</td><td>台中市</td><td>新社区</td></tr>
    <tr><td><code>710441</code></td><td>台湾省</td><td>台中市</td><td>潭子区</td></tr>
    <tr><td><code>710442</code></td><td>台湾省</td><td>台中市</td><td>大雅区</td></tr>
    <tr><td><code>710443</code></td><td>台湾省</td><td>台中市</td><td>神冈区</td></tr>
    <tr><td><code>710444</code></td><td>台湾省</td><td>台中市</td><td>大肚区</td></tr>
    <tr><td><code>710445</code></td><td>台湾省</td><td>台中市</td><td>沙鹿区</td></tr>
    <tr><td><code>710446</code></td><td>台湾省</td><td>台中市</td><td>龙井区</td></tr>
    <tr><td><code>710447</code></td><td>台湾省</td><td>台中市</td><td>梧栖区</td></tr>
    <tr><td><code>710448</code></td><td>台湾省</td><td>台中市</td><td>清水区</td></tr>
    <tr><td><code>710449</code></td><td>台湾省</td><td>台中市</td><td>大甲区</td></tr>
    <tr><td><code>710450</code></td><td>台湾省</td><td>台中市</td><td>外埔区</td></tr>
    <tr><td><code>710451</code></td><td>台湾省</td><td>台中市</td><td>大安区</td></tr>
    <tr class="level-city"><td><code>710600</code></td><td>台湾省</td><td>南投县</td><td></td></tr>
    <tr><td><code>710614</code></td><td>台湾省</td><td>南投县</td><td>南投市</td></tr>
    <tr><td><code>710615</code></td><td>台湾省</td><td>南投县</td><td>中寮乡</td></tr>
    <tr><td><code>710616</code></td><td>台湾省</td><td>南投县</td><td>草屯镇</td></tr>
    <tr><td><code>710617</code></td><td>台湾省</td><td>南投县</td><td>国姓乡</td></tr>
    <tr><td><code>710618</code></td><td>台湾省</td><td>南投县</td><td>埔里镇</td></tr>
    <tr><td><code>710619</code></td><td>台湾省</td><td>南投县</td><td>仁爱乡</td></tr>
    <tr><td><code>710620</code></td><td>台湾省</td><td>南投县</td><td>名间乡</td></tr>
    <tr><td><code>710621</code></td><td>台湾省</td><td>南投县</td><td>集集镇</td></tr>
    <tr><td><code>710622</code></td><td>台湾省</td><td>南投县</td><td>水里乡</td></tr>
    <tr><td><code>710623</code></td><td>台湾省</td><td>南投县</td><td>鱼池乡</td></tr>
    <tr><td><code>710624</code></td><td>台湾省</td><td>南投县</td><td>信义乡</td></tr>
    <tr><td><code>710625</code></td><td>台湾省</td><td>南投县</td><td>竹山镇</td></tr>
    <tr><td><code>710626</code></td><td>台湾省</td><td>南投县</td><td>鹿谷乡</td></tr>
    <tr class="level-city"><td><code>710700</code></td><td>台湾省</td><td>基隆市</td><td></td></tr>
    <tr><td><code>710701</code></td><td>台湾省</td><td>基隆市</td><td>仁爱区</td></tr>
    <tr><td><code>710702</code></td><td>台湾省</td><td>基隆市</td><td>信义区</td></tr>
    <tr><td><code>710703</code></td><td>台湾省</td><td>基隆市</td><td>中正区</td></tr>
    <tr><td><code>710704</code></td><td>台湾省</td><td>基隆市</td><td>中山区</td></tr>
    <tr><td><code>710705</code></td><td>台湾省</td><td>基隆市</td><td>安乐区</td></tr>
    <tr><td><code>710706</code></td><td>台湾省</td><td>基隆市</td><td>暖暖区</td></tr>
    <tr><td><code>710707</code></td><td>台湾省</td><td>基隆市</td><td>七堵区</td></tr>
    <tr class="level-city"><td><code>710800</code></td><td>台湾省</td><td>新竹市</td><td></td></tr>
    <tr><td><code>710801</code></td><td>台湾省</td><td>新竹市</td><td>东区</td></tr>
    <tr><td><code>710802</code></td><td>台湾省</td><td>新竹市</td><td>北区</td></tr>
    <tr><td><code>710803</code></td><td>台湾省</td><td>新竹市</td><td>香山区</td></tr>
    <tr class="level-city"><td><code>710900</code></td><td>台湾省</td><td>嘉义市</td><td></td></tr>
    <tr><td><code>710901</code></td><td>台湾省</td><td>嘉义市</td><td>东区</td></tr>
    <tr><td><code>710902</code></td><td>台湾省</td><td>嘉义市</td><td>西区</td></tr>
    <tr class="level-city"><td><code>711100</code></td><td>台湾省</td><td>新北市</td><td></td></tr>
    <tr><td><code>711130</code></td><td>台湾省</td><td>新北市</td><td>万里区</td></tr>
    <tr><td><code>711131</code></td><td>台湾省</td><td>新北市</td><td>金山区</td></tr>
    <tr><td><code>711132</code></td><td>台湾省</td><td>新北市</td><td>板桥区</td></tr>
    <tr><td><code>711133</code></td><td>台湾省</td><td>新北市</td><td>汐止区</td></tr>
    <tr><td><code>711134</code></td><td>台湾省</td><td>新北市</td><td>深坑区</td></tr>
    <tr><td><code>711135</code></td><td>台湾省</td><td>新北市</td><td>石碇区</td></tr>
    <tr><td><code>711136</code></td><td>台湾省</td><td>新北市</td><td>瑞芳区</td></tr>
    <tr><td><code>711137</code></td><td>台湾省</td><td>新北市</td><td>平溪区</td></tr>
    <tr><td><code>711138</code></td><td>台湾省</td><td>新北市</td><td>双溪区</td></tr>
    <tr><td><code>711139</code></td><td>台湾省</td><td>新北市</td><td>贡寮区</td></tr>
    <tr><td><code>711140</code></td><td>台湾省</td><td>新北市</td><td>新店区</td></tr>
    <tr><td><code>711141</code></td><td>台湾省</td><td>新北市</td><td>坪林区</td></tr>
    <tr><td><code>711142</code></td><td>台湾省</td><td>新北市</td><td>乌来区</td></tr>
    <tr><td><code>711143</code></td><td>台湾省</td><td>新北市</td><td>永和区</td></tr>
    <tr><td><code>711144</code></td><td>台湾省</td><td>新北市</td><td>中和区</td></tr>
    <tr><td><code>711145</code></td><td>台湾省</td><td>新北市</td><td>土城区</td></tr>
    <tr><td><code>711146</code></td><td>台湾省</td><td>新北市</td><td>三峡区</td></tr>
    <tr><td><code>711147</code></td><td>台湾省</td><td>新北市</td><td>树林区</td></tr>
    <tr><td><code>711148</code></td><td>台湾省</td><td>新北市</td><td>莺歌区</td></tr>
    <tr><td><code>711149</code></td><td>台湾省</td><td>新北市</td><td>三重区</td></tr>
    <tr><td><code>711150</code></td><td>台湾省</td><td>新北市</td><td>新庄区</td></tr>
    <tr><td><code>711151</code></td><td>台湾省</td><td>新北市</td><td>泰山区</td></tr>
    <tr><td><code>711152</code></td><td>台湾省</td><td>新北市</td><td>林口区</td></tr>
    <tr><td><code>711153</code></td><td>台湾省</td><td>新北市</td><td>芦洲区</td></tr>
    <tr><td><code>711154</code></td><td>台湾省</td><td>新北市</td><td>五股区</td></tr>
    <tr><td><code>711155</code></td><td>台湾省</td><td>新北市</td><td>八里区</td></tr>
    <tr><td><code>711156</code></td><td>台湾省</td><td>新北市</td><td>淡水区</td></tr>
    <tr><td><code>711157</code></td><td>台湾省</td><td>新北市</td><td>三芝区</td></tr>
    <tr><td><code>711158</code></td><td>台湾省</td><td>新北市</td><td>石门区</td></tr>
    <tr class="level-city"><td><code>711200</code></td><td>台湾省</td><td>宜兰县</td><td></td></tr>
    <tr><td><code>711214</code></td><td>台湾省</td><td>宜兰县</td><td>宜兰市</td></tr>
    <tr><td><code>711215</code></td><td>台湾省</td><td>宜兰县</td><td>头城镇</td></tr>
    <tr><td><code>711216</code></td><td>台湾省</td><td>宜兰县</td><td>礁溪乡</td></tr>
    <tr><td><code>711217</code></td><td>台湾省</td><td>宜兰县</td><td>壮围乡</td></tr>
    <tr><td><code>711218</code></td><td>台湾省</td><td>宜兰县</td><td>员山乡</td></tr>
    <tr><td><code>711219</code></td><td>台湾省</td><td>宜兰县</td><td>罗东镇</td></tr>
    <tr><td><code>711220</code></td><td>台湾省</td><td>宜兰县</td><td>三星乡</td></tr>
    <tr><td><code>711221</code></td><td>台湾省</td><td>宜兰县</td><td>大同乡</td></tr>
    <tr><td><code>711222</code></td><td>台湾省</td><td>宜兰县</td><td>五结乡</td></tr>
    <tr><td><code>711223</code></td><td>台湾省</td><td>宜兰县</td><td>冬山乡</td></tr>
    <tr><td><code>711224</code></td><td>台湾省</td><td>宜兰县</td><td>苏澳镇</td></tr>
    <tr><td><code>711225</code></td><td>台湾省</td><td>宜兰县</td><td>南澳乡</td></tr>
    <tr class="level-city"><td><code>711300</code></td><td>台湾省</td><td>新竹县</td><td></td></tr>
    <tr><td><code>711314</code></td><td>台湾省</td><td>新竹县</td><td>竹北市</td></tr>
    <tr><td><code>711315</code></td><td>台湾省</td><td>新竹县</td><td>湖口乡</td></tr>
    <tr><td><code>711316</code></td><td>台湾省</td><td>新竹县</td><td>新丰乡</td></tr>
    <tr><td><code>711317</code></td><td>台湾省</td><td>新竹县</td><td>新埔镇</td></tr>
    <tr><td><code>711318</code></td><td>台湾省</td><td>新竹县</td><td>关西镇</td></tr>
    <tr><td><code>711319</code></td><td>台湾省</td><td>新竹县</td><td>芎林乡</td></tr>
    <tr><td><code>711320</code></td><td>台湾省</td><td>新竹县</td><td>宝山乡</td></tr>
    <tr><td><code>711321</code></td><td>台湾省</td><td>新竹县</td><td>竹东镇</td></tr>
    <tr><td><code>711322</code></td><td>台湾省</td><td>新竹县</td><td>五峰乡</td></tr>
    <tr><td><code>711323</code></td><td>台湾省</td><td>新竹县</td><td>横山乡</td></tr>
    <tr><td><code>711324</code></td><td>台湾省</td><td>新竹县</td><td>尖石乡</td></tr>
    <tr><td><code>711325</code></td><td>台湾省</td><td>新竹县</td><td>北埔乡</td></tr>
    <tr><td><code>711326</code></td><td>台湾省</td><td>新竹县</td><td>峨眉乡</td></tr>
    <tr class="level-city"><td><code>711400</code></td><td>台湾省</td><td>桃园市</td><td></td></tr>
    <tr><td><code>711414</code></td><td>台湾省</td><td>桃园市</td><td>中坜区</td></tr>
    <tr><td><code>711415</code></td><td>台湾省</td><td>桃园市</td><td>平镇区</td></tr>
    <tr><td><code>711416</code></td><td>台湾省</td><td>桃园市</td><td>龙潭区</td></tr>
    <tr><td><code>711417</code></td><td>台湾省</td><td>桃园市</td><td>杨梅区</td></tr>
    <tr><td><code>711418</code></td><td>台湾省</td><td>桃园市</td><td>新屋区</td></tr>
    <tr><td><code>711419</code></td><td>台湾省</td><td>桃园市</td><td>观音区</td></tr>
    <tr><td><code>711420</code></td><td>台湾省</td><td>桃园市</td><td>桃园区</td></tr>
    <tr><td><code>711421</code></td><td>台湾省</td><td>桃园市</td><td>龟山区</td></tr>
    <tr><td><code>711422</code></td><td>台湾省</td><td>桃园市</td><td>八德区</td></tr>
    <tr><td><code>711423</code></td><td>台湾省</td><td>桃园市</td><td>大溪区</td></tr>
    <tr><td><code>711424</code></td><td>台湾省</td><td>桃园市</td><td>复兴区</td></tr>
    <tr><td><code>711425</code></td><td>台湾省</td><td>桃园市</td><td>大园区</td></tr>
    <tr><td><code>711426</code></td><td>台湾省</td><td>桃园市</td><td>芦竹区</td></tr>
    <tr class="level-city"><td><code>711500</code></td><td>台湾省</td><td>苗栗县</td><td></td></tr>
    <tr><td><code>711519</code></td><td>台湾省</td><td>苗栗县</td><td>竹南镇</td></tr>
    <tr><td><code>711520</code></td><td>台湾省</td><td>苗栗县</td><td>头份市</td></tr>
    <tr><td><code>711521</code></td><td>台湾省</td><td>苗栗县</td><td>三湾乡</td></tr>
    <tr><td><code>711522</code></td><td>台湾省</td><td>苗栗县</td><td>南庄乡</td></tr>
    <tr><td><code>711523</code></td><td>台湾省</td><td>苗栗县</td><td>狮潭乡</td></tr>
    <tr><td><code>711524</code></td><td>台湾省</td><td>苗栗县</td><td>后龙镇</td></tr>
    <tr><td><code>711525</code></td><td>台湾省</td><td>苗栗县</td><td>通霄镇</td></tr>
    <tr><td><code>711526</code></td><td>台湾省</td><td>苗栗县</td><td>苑里镇</td></tr>
    <tr><td><code>711527</code></td><td>台湾省</td><td>苗栗县</td><td>苗栗市</td></tr>
    <tr><td><code>711528</code></td><td>台湾省</td><td>苗栗县</td><td>造桥乡</td></tr>
    <tr><td><code>711529</code></td><td>台湾省</td><td>苗栗县</td><td>头屋乡</td></tr>
    <tr><td><code>711530</code></td><td>台湾省</td><td>苗栗县</td><td>公馆乡</td></tr>
    <tr><td><code>711531</code></td><td>台湾省</td><td>苗栗县</td><td>大湖乡</td></tr>
    <tr><td><code>711532</code></td><td>台湾省</td><td>苗栗县</td><td>泰安乡</td></tr>
    <tr><td><code>711533</code></td><td>台湾省</td><td>苗栗县</td><td>铜锣乡</td></tr>
    <tr><td><code>711534</code></td><td>台湾省</td><td>苗栗县</td><td>三义乡</td></tr>
    <tr><td><code>711535</code></td><td>台湾省</td><td>苗栗县</td><td>西湖乡</td></tr>
    <tr><td><code>711536</code></td><td>台湾省</td><td>苗栗县</td><td>卓兰镇</td></tr>
    <tr class="level-city"><td><code>711700</code></td><td>台湾省</td><td>彰化县</td><td></td></tr>
    <tr><td><code>711727</code></td><td>台湾省</td><td>彰化县</td><td>彰化市</td></tr>
    <tr><td><code>711728</code></td><td>台湾省</td><td>彰化县</td><td>芬园乡</td></tr>
    <tr><td><code>711729</code></td><td>台湾省</td><td>彰化县</td><td>花坛乡</td></tr>
    <tr><td><code>711730</code></td><td>台湾省</td><td>彰化县</td><td>秀水乡</td></tr>
    <tr><td><code>711731</code></td><td>台湾省</td><td>彰化县</td><td>鹿港镇</td></tr>
    <tr><td><code>711732</code></td><td>台湾省</td><td>彰化县</td><td>福兴乡</td></tr>
    <tr><td><code>711733</code></td><td>台湾省</td><td>彰化县</td><td>线西乡</td></tr>
    <tr><td><code>711734</code></td><td>台湾省</td><td>彰化县</td><td>和美镇</td></tr>
    <tr><td><code>711735</code></td><td>台湾省</td><td>彰化县</td><td>伸港乡</td></tr>
    <tr><td><code>711736</code></td><td>台湾省</td><td>彰化县</td><td>员林市</td></tr>
    <tr><td><code>711737</code></td><td>台湾省</td><td>彰化县</td><td>社头乡</td></tr>
    <tr><td><code>711738</code></td><td>台湾省</td><td>彰化县</td><td>永靖乡</td></tr>
    <tr><td><code>711739</code></td><td>台湾省</td><td>彰化县</td><td>埔心乡</td></tr>
    <tr><td><code>711740</code></td><td>台湾省</td><td>彰化县</td><td>溪湖镇</td></tr>
    <tr><td><code>711741</code></td><td>台湾省</td><td>彰化县</td><td>大村乡</td></tr>
    <tr><td><code>711742</code></td><td>台湾省</td><td>彰化县</td><td>埔盐乡</td></tr>
    <tr><td><code>711743</code></td><td>台湾省</td><td>彰化县</td><td>田中镇</td></tr>
    <tr><td><code>711744</code></td><td>台湾省</td><td>彰化县</td><td>北斗镇</td></tr>
    <tr><td><code>711745</code></td><td>台湾省</td><td>彰化县</td><td>田尾乡</td></tr>
    <tr><td><code>711746</code></td><td>台湾省</td><td>彰化县</td><td>埤头乡</td></tr>
    <tr><td><code>711747</code></td><td>台湾省</td><td>彰化县</td><td>溪州乡</td></tr>
    <tr><td><code>711748</code></td><td>台湾省</td><td>彰化县</td><td>竹塘乡</td></tr>
    <tr><td><code>711749</code></td><td>台湾省</td><td>彰化县</td><td>二林镇</td></tr>
    <tr><td><code>711750</code></td><td>台湾省</td><td>彰化县</td><td>大城乡</td></tr>
    <tr><td><code>711751</code></td><td>台湾省</td><td>彰化县</td><td>芳苑乡</td></tr>
    <tr><td><code>711752</code></td><td>台湾省</td><td>彰化县</td><td>二水乡</td></tr>
    <tr class="level-city"><td><code>711900</code></td><td>台湾省</td><td>嘉义县</td><td></td></tr>
    <tr><td><code>711919</code></td><td>台湾省</td><td>嘉义县</td><td>番路乡</td></tr>
    <tr><td><code>711920</code></td><td>台湾省</td><td>嘉义县</td><td>梅山乡</td></tr>
    <tr><td><code>711921</code></td><td>台湾省</td><td>嘉义县</td><td>竹崎乡</td></tr>
    <tr><td><code>711922</code></td><td>台湾省</td><td>嘉义县</td><td>阿里山乡</td></tr>
    <tr><td><code>711923</code></td><td>台湾省</td><td>嘉义县</td><td>中埔乡</td></tr>
    <tr><td><code>711924</code></td><td>台湾省</td><td>嘉义县</td><td>大埔乡</td></tr>
    <tr><td><code>711925</code></td><td>台湾省</td><td>嘉义县</td><td>水上乡</td></tr>
    <tr><td><code>711926</code></td><td>台湾省</td><td>嘉义县</td><td>鹿草乡</td></tr>
    <tr><td><code>711927</code></td><td>台湾省</td><td>嘉义县</td><td>太保市</td></tr>
    <tr><td><code>711928</code></td><td>台湾省</td><td>嘉义县</td><td>朴子市</td></tr>
    <tr><td><code>711929</code></td><td>台湾省</td><td>嘉义县</td><td>东石乡</td></tr>
    <tr><td><code>711930</code></td><td>台湾省</td><td>嘉义县</td><td>六脚乡</td></tr>
    <tr><td><code>711931</code></td><td>台湾省</td><td>嘉义县</td><td>新港乡</td></tr>
    <tr><td><code>711932</code></td><td>台湾省</td><td>嘉义县</td><td>民雄乡</td></tr>
    <tr><td><code>711933</code></td><td>台湾省</td><td>嘉义县</td><td>大林镇</td></tr>
    <tr><td><code>711934</code></td><td>台湾省</td><td>嘉义县</td><td>溪口乡</td></tr>
    <tr><td><code>711935</code></td><td>台湾省</td><td>嘉义县</td><td>义竹乡</td></tr>
    <tr><td><code>711936</code></td><td>台湾省</td><td>嘉义县</td><td>布袋镇</td></tr>
    <tr class="level-city"><td><code>712100</code></td><td>台湾省</td><td>云林县</td><td></td></tr>
    <tr><td><code>712121</code></td><td>台湾省</td><td>云林县</td><td>斗南镇</td></tr>
    <tr><td><code>712122</code></td><td>台湾省</td><td>云林县</td><td>大埤乡</td></tr>
    <tr><td><code>712123</code></td><td>台湾省</td><td>云林县</td><td>虎尾镇</td></tr>
    <tr><td><code>712124</code></td><td>台湾省</td><td>云林县</td><td>土库镇</td></tr>
    <tr><td><code>712125</code></td><td>台湾省</td><td>云林县</td><td>褒忠乡</td></tr>
    <tr><td><code>712126</code></td><td>台湾省</td><td>云林县</td><td>东势乡</td></tr>
    <tr><td><code>712127</code></td><td>台湾省</td><td>云林县</td><td>台西乡</td></tr>
    <tr><td><code>712128</code></td><td>台湾省</td><td>云林县</td><td>仑背乡</td></tr>
    <tr><td><code>712129</code></td><td>台湾省</td><td>云林县</td><td>麦寮乡</td></tr>
    <tr><td><code>712130</code></td><td>台湾省</td><td>云林县</td><td>斗六市</td></tr>
    <tr><td><code>712131</code></td><td>台湾省</td><td>云林县</td><td>林内乡</td></tr>
    <tr><td><code>712132</code></td><td>台湾省</td><td>云林县</td><td>古坑乡</td></tr>
    <tr><td><code>712133</code></td><td>台湾省</td><td>云林县</td><td>莿桐乡</td></tr>
    <tr><td><code>712134</code></td><td>台湾省</td><td>云林县</td><td>西螺镇</td></tr>
    <tr><td><code>712135</code></td><td>台湾省</td><td>云林县</td><td>二仑乡</td></tr>
    <tr><td><code>712136</code></td><td>台湾省</td><td>云林县</td><td>北港镇</td></tr>
    <tr><td><code>712137</code></td><td>台湾省</td><td>云林县</td><td>水林乡</td></tr>
    <tr><td><code>712138</code></td><td>台湾省</td><td>云林县</td><td>口湖乡</td></tr>
    <tr><td><code>712139</code></td><td>台湾省</td><td>云林县</td><td>四湖乡</td></tr>
    <tr><td><code>712140</code></td><td>台湾省</td><td>云林县</td><td>元长乡</td></tr>
    <tr class="level-city"><td><code>712400</code></td><td>台湾省</td><td>屏东县</td><td></td></tr>
    <tr><td><code>712434</code></td><td>台湾省</td><td>屏东县</td><td>屏东市</td></tr>
    <tr><td><code>712435</code></td><td>台湾省</td><td>屏东县</td><td>三地门乡</td></tr>
    <tr><td><code>712436</code></td><td>台湾省</td><td>屏东县</td><td>雾台乡</td></tr>
    <tr><td><code>712437</code></td><td>台湾省</td><td>屏东县</td><td>玛家乡</td></tr>
    <tr><td><code>712438</code></td><td>台湾省</td><td>屏东县</td><td>九如乡</td></tr>
    <tr><td><code>712439</code></td><td>台湾省</td><td>屏东县</td><td>里港乡</td></tr>
    <tr><td><code>712440</code></td><td>台湾省</td><td>屏东县</td><td>高树乡</td></tr>
    <tr><td><code>712441</code></td><td>台湾省</td><td>屏东县</td><td>盐埔乡</td></tr>
    <tr><td><code>712442</code></td><td>台湾省</td><td>屏东县</td><td>长治乡</td></tr>
    <tr><td><code>712443</code></td><td>台湾省</td><td>屏东县</td><td>麟洛乡</td></tr>
    <tr><td><code>712444</code></td><td>台湾省</td><td>屏东县</td><td>竹田乡</td></tr>
    <tr><td><code>712445</code></td><td>台湾省</td><td>屏东县</td><td>内埔乡</td></tr>
    <tr><td><code>712446</code></td><td>台湾省</td><td>屏东县</td><td>万丹乡</td></tr>
    <tr><td><code>712447</code></td><td>台湾省</td><td>屏东县</td><td>潮州镇</td></tr>
    <tr><td><code>712448</code></td><td>台湾省</td><td>屏东县</td><td>泰武乡</td></tr>
    <tr><td><code>712449</code></td><td>台湾省</td><td>屏东县</td><td>来义乡</td></tr>
    <tr><td><code>712450</code></td><td>台湾省</td><td>屏东县</td><td>万峦乡</td></tr>
    <tr><td><code>712451</code></td><td>台湾省</td><td>屏东县</td><td>崁顶乡</td></tr>
    <tr><td><code>712452</code></td><td>台湾省</td><td>屏东县</td><td>新埤乡</td></tr>
    <tr><td><code>712453</code></td><td>台湾省</td><td>屏东县</td><td>南州乡</td></tr>
    <tr><td><code>712454</code></td><td>台湾省</td><td>屏东县</td><td>林边乡</td></tr>
    <tr><td><code>712455</code></td><td>台湾省</td><td>屏东县</td><td>东港镇</td></tr>
    <tr><td><code>712456</code></td><td>台湾省</td><td>屏东县</td><td>琉球乡</td></tr>
    <tr><td><code>712457</code></td><td>台湾省</td><td>屏东县</td><td>佳冬乡</td></tr>
    <tr><td><code>712458</code></td><td>台湾省</td><td>屏东县</td><td>新园乡</td></tr>
    <tr><td><code>712459</code></td><td>台湾省</td><td>屏东县</td><td>枋寮乡</td></tr>
    <tr><td><code>712460</code></td><td>台湾省</td><td>屏东县</td><td>枋山乡</td></tr>
    <tr><td><code>712461</code></td><td>台湾省</td><td>屏东县</td><td>春日乡</td></tr>
    <tr><td><code>712462</code></td><td>台湾省</td><td>屏东县</td><td>狮子乡</td></tr>
    <tr><td><code>712463</code></td><td>台湾省</td><td>屏东县</td><td>车城乡</td></tr>
    <tr><td><code>712464</code></td><td>台湾省</td><td>屏东县</td><td>牡丹乡</td></tr>
    <tr><td><code>712465</code></td><td>台湾省</td><td>屏东县</td><td>恒春镇</td></tr>
    <tr><td><code>712466</code></td><td>台湾省</td><td>屏东县</td><td>满州乡</td></tr>
    <tr class="level-city"><td><code>712500</code></td><td>台湾省</td><td>台东县</td><td></td></tr>
    <tr><td><code>712517</code></td><td>台湾省</td><td>台东县</td><td>台东市</td></tr>
    <tr><td><code>712518</code></td><td>台湾省</td><td>台东县</td><td>绿岛乡</td></tr>
    <tr><td><code>712519</code></td><td>台湾省</td><td>台东县</td><td>兰屿乡</td></tr>
    <tr><td><code>712520</code></td><td>台湾省</td><td>台东县</td><td>延平乡</td></tr>
    <tr><td><code>712521</code></td><td>台湾省</td><td>台东县</td><td>卑南乡</td></tr>
    <tr><td><code>712522</code></td><td>台湾省</td><td>台东县</td><td>鹿野乡</td></tr>
    <tr><td><code>712523</code></td><td>台湾省</td><td>台东县</td><td>关山镇</td></tr>
    <tr><td><code>712524</code></td><td>台湾省</td><td>台东县</td><td>海端乡</td></tr>
    <tr><td><code>712525</code></td><td>台湾省</td><td>台东县</td><td>池上乡</td></tr>
    <tr><td><code>712526</code></td><td>台湾省</td><td>台东县</td><td>东河乡</td></tr>
    <tr><td><code>712527</code></td><td>台湾省</td><td>台东县</td><td>成功镇</td></tr>
    <tr><td><code>712528</code></td><td>台湾省</td><td>台东县</td><td>长滨乡</td></tr>
    <tr><td><code>712529</code></td><td>台湾省</td><td>台东县</td><td>金峰乡</td></tr>
    <tr><td><code>712530</code></td><td>台湾省</td><td>台东县</td><td>大武乡</td></tr>
    <tr><td><code>712531</code></td><td>台湾省</td><td>台东县</td><td>达仁乡</td></tr>
    <tr><td><code>712532</code></td><td>台湾省</td><td>台东县</td><td>太麻里乡</td></tr>
    <tr class="level-city"><td><code>712600</code></td><td>台湾省</td><td>花莲县</td><td></td></tr>
    <tr><td><code>712615</code></td><td>台湾省</td><td>花莲县</td><td>花莲市</td></tr>
    <tr><td><code>712616</code></td><td>台湾省</td><td>花莲县</td><td>新城乡</td></tr>
    <tr><td><code>712618</code></td><td>台湾省</td><td>花莲县</td><td>秀林乡</td></tr>
    <tr><td><code>712619</code></td><td>台湾省</td><td>花莲县</td><td>吉安乡</td></tr>
    <tr><td><code>712620</code></td><td>台湾省</td><td>花莲县</td><td>寿丰乡</td></tr>
    <tr><td><code>712621</code></td><td>台湾省</td><td>花莲县</td><td>凤林镇</td></tr>
    <tr><td><code>712622</code></td><td>台湾省</td><td>花莲县</td><td>光复乡</td></tr>
    <tr><td><code>712623</code></td><td>台湾省</td><td>花莲县</td><td>丰滨乡</td></tr>
    <tr><td><code>712624</code></td><td>台湾省</td><td>花莲县</td><td>瑞穗乡</td></tr>
    <tr><td><code>712625</code></td><td>台湾省</td><td>花莲县</td><td>万荣乡</td></tr>
    <tr><td><code>712626</code></td><td>台湾省</td><td>花莲县</td><td>玉里镇</td></tr>
    <tr><td><code>712627</code></td><td>台湾省</td><td>花莲县</td><td>卓溪乡</td></tr>
    <tr><td><code>712628</code></td><td>台湾省</td><td>花莲县</td><td>富里乡</td></tr>
    <tr class="level-city"><td><code>712700</code></td><td>台湾省</td><td>澎湖县</td><td></td></tr>
    <tr><td><code>712707</code></td><td>台湾省</td><td>澎湖县</td><td>马公市</td></tr>
    <tr><td><code>712708</code></td><td>台湾省</td><td>澎湖县</td><td>西屿乡</td></tr>
    <tr><td><code>712709</code></td><td>台湾省</td><td>澎湖县</td><td>望安乡</td></tr>
    <tr><td><code>712710</code></td><td>台湾省</td><td>澎湖县</td><td>七美乡</td></tr>
    <tr><td><code>712711</code></td><td>台湾省</td><td>澎湖县</td><td>白沙乡</td></tr>
    <tr><td><code>712712</code></td><td>台湾省</td><td>澎湖县</td><td>湖西乡</td></tr>
  </tbody>
</table>
</div>


## 香港特别行政区（810000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>810000</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td></td></tr>
    <tr><td><code>810101</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>中西区</td></tr>
    <tr><td><code>810102</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>东区</td></tr>
    <tr><td><code>810103</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>九龙城区</td></tr>
    <tr><td><code>810104</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>观塘区</td></tr>
    <tr><td><code>810105</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>南区</td></tr>
    <tr><td><code>810106</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>深水埗区</td></tr>
    <tr><td><code>810107</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>湾仔区</td></tr>
    <tr><td><code>810108</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>黄大仙区</td></tr>
    <tr><td><code>810109</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>油尖旺区</td></tr>
    <tr><td><code>810110</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>离岛区</td></tr>
    <tr><td><code>810111</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>葵青区</td></tr>
    <tr><td><code>810112</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>北区</td></tr>
    <tr><td><code>810113</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>西贡区</td></tr>
    <tr><td><code>810114</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>沙田区</td></tr>
    <tr><td><code>810115</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>屯门区</td></tr>
    <tr><td><code>810116</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>大埔区</td></tr>
    <tr><td><code>810117</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>荃湾区</td></tr>
    <tr><td><code>810118</code></td><td>香港特别行政区</td><td>香港特别行政区</td><td>元朗区</td></tr>
  </tbody>
</table>
</div>


## 澳门特别行政区（820000）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>省</th><th>市 / 地区</th><th>区 / 县</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>820000</code></td><td>澳门特别行政区</td><td>澳门特别行政区</td><td></td></tr>
    <tr><td><code>820101</code></td><td>澳门特别行政区</td><td>澳门特别行政区</td><td>澳门半岛</td></tr>
    <tr><td><code>820102</code></td><td>澳门特别行政区</td><td>澳门特别行政区</td><td>凼仔</td></tr>
    <tr><td><code>820103</code></td><td>澳门特别行政区</td><td>澳门特别行政区</td><td>路凼城</td></tr>
    <tr><td><code>820104</code></td><td>澳门特别行政区</td><td>澳门特别行政区</td><td>路环</td></tr>
  </tbody>
</table>
</div>



## 四、数据说明与校验

- **结构校验**：全部 3628 条均为 6 位数字，无空码、无重复码；34 个省级前缀（11–65、71、81、82）与 GB/T 2260 完全一致，省名无一错配。
- **时效性**：该数据集为 **约 2016 年**快照（仍含「那曲地区」「莱芜市」等 2018 年前后已撤地设市 / 撤并的代码，且缺少 2016 年后新设的区县）。
  与 2024 年现行代码比对，**约 607 条已因行政区划调整而作废**（如 `130223 滦县`→`130284 滦州市`、`140202 大同市城区`已于 2018 年撤销）。这些码在其制作年份是有效的，并非录入错误，仅代表"已过时"。
- **录入瑕疵**：源表有 4 条重庆市辖自治县（石柱、秀山、酉阳、彭水）的「省」列为空，本表已按代码前缀 `50` 补全为「重庆市」。
- **当前使用建议**：用于历史数据回溯、老图斑匹配可行；若做实时地址标准化 / 新图制图，请以民政部最新年度代码为准。

> 数据来源：[中华人民共和国行政区划代码（六位码）全表-2016年快照.xls](https://downloads.planetgis.cn/Data/city_code.xls)（Sheet1，共 3628 行）。
