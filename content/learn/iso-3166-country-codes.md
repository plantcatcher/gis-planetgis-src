---
slug: iso-3166-country-codes
title: 世界国家和地区代码表（ISO 3166-1）：二字母、三字母、数字代码中英文对照
summary: ISO 3166-1 全部 249 个国家和地区代码的中英文对照表，含二字母（CN）、三字母（CHN）、数字（156）三种代码与联合国 M49 地理分区，按大洲分组并可即时检索；说明三种代码的用途、与奥运会和国际足联代码的区别，以及在 GIS 数据挂接、GADM 文件命名中的用法。
date: 2026-11-15
category: 地理基础
subject: 人文地理
tags: ISO 3166, 国家代码, 国家和地区代码, GB/T 2659, 三字母代码, GADM, GIS数据
tableSearch: true
tableSearchPlaceholder: 输入二 / 三字母码、数字码或国家名，如 JPN / 392 / 日本
---

> 本页收录 ISO 3166-1 全部 **249 个**国家和地区代码（二字母、三字母、数字三种），配中英文名称和联合国 M49 地理分区，按大洲分组。顶部搜索框可直接输入 `JPN`、`392`、`日本` 或 `Japan` 查询。

## 一、ISO 3166-1 是什么

ISO 3166-1 是国际标准化组织（ISO）发布的**国家和地区代码标准**，我国的等同标准是 **GB/T 2659.1《世界各国和地区及其行政区划名称代码 第 1 部分：国家和地区代码》**。它为每个国家和地区规定了三种代码：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>形式</th><th>常见用途</th></tr>
  </thead>
  <tbody>
    <tr><td>alpha-2 二字母</td><td><code>CN</code></td><td>国家顶级域名（.cn）、语言区域标识（zh-CN）、IP 地理库、银行 SWIFT 代码第 5–6 位</td></tr>
    <tr><td>alpha-3 三字母</td><td><code>CHN</code></td><td>护照机读区、联合国统计、GIS 数据（GADM、Natural Earth 的 ISO_A3 字段）</td></tr>
    <tr><td>numeric 数字</td><td><code>156</code></td><td>与联合国 M49 统计代码一致，不依赖拉丁字母，适合跨语言系统</td></tr>
  </tbody>
</table>
</div>

## 二、几个容易搞混的例子

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>国家</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>CN</code></td><td><code>CHN</code></td><td><code>156</code></td><td>中国</td><td>域名 .cn、护照国籍 CHN、GADM 文件名 gadm41_CHN</td></tr>
    <tr><td><code>US</code></td><td><code>USA</code></td><td><code>840</code></td><td>美国</td><td>域名 .us，IP 地理库国家字段 US</td></tr>
    <tr><td><code>JP</code></td><td><code>JPN</code></td><td><code>392</code></td><td>日本</td><td>奥运会代码也是 JPN，但不总是和 ISO 一致</td></tr>
    <tr><td><code>GB</code></td><td><code>GBR</code></td><td><code>826</code></td><td>英国</td><td>注意域名用 .uk，不是 .gb</td></tr>
    <tr><td><code>DE</code></td><td><code>DEU</code></td><td><code>276</code></td><td>德国</td><td>奥运会 / 国际足联代码是 GER，不是 DEU</td></tr>
  </tbody>
</table>
</div>

奥运会代码（IOC）、国际足联代码（FIFA）、国际车辆识别代码（如德国车尾的 D）**都不是 ISO 3166**，做数据匹配时不要混用。

## 三、在 GIS 里怎么用

- **挂接统计数据**：世界银行、联合国等机构的国别数据几乎都带 ISO alpha-3 字段，用它挂接世界行政区划矢量，比用国家名称匹配可靠得多（名称有简称、旧称、各种拼写）。
- **GADM 数据**：GADM 的文件按 alpha-3 命名（如 `gadm41_JPN_1.shp`）。下表里带「GADM 数据」链接的国家，本站已整理了可直接下载的行政区划矢量。
- **Natural Earth**：注意部分要素的 `ISO_A3` 字段为 `-99`（如争议地区），此时可改用 `ADM0_A3` 字段。

## 四、国家和地区代码全表（按大洲）

### 亚洲（51 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AE</code></td><td><code>ARE</code> · <a href="/downloads/gadm41-are-shp">GADM 数据</a></td><td><code>784</code></td><td>阿拉伯联合酋长国</td><td>United Arab Emirates</td><td>西亚</td></tr>
    <tr><td><code>AF</code></td><td><code>AFG</code></td><td><code>004</code></td><td>阿富汗</td><td>Afghanistan</td><td>南亚</td></tr>
    <tr><td><code>AM</code></td><td><code>ARM</code></td><td><code>051</code></td><td>亚美尼亚</td><td>Armenia</td><td>西亚</td></tr>
    <tr><td><code>AZ</code></td><td><code>AZE</code></td><td><code>031</code></td><td>阿塞拜疆</td><td>Azerbaijan</td><td>西亚</td></tr>
    <tr><td><code>BD</code></td><td><code>BGD</code></td><td><code>050</code></td><td>孟加拉国</td><td>Bangladesh</td><td>南亚</td></tr>
    <tr><td><code>BH</code></td><td><code>BHR</code></td><td><code>048</code></td><td>巴林</td><td>Bahrain</td><td>西亚</td></tr>
    <tr><td><code>BN</code></td><td><code>BRN</code></td><td><code>096</code></td><td>文莱</td><td>Brunei Darussalam</td><td>东南亚</td></tr>
    <tr><td><code>BT</code></td><td><code>BTN</code></td><td><code>064</code></td><td>不丹</td><td>Bhutan</td><td>南亚</td></tr>
    <tr><td><code>CN</code></td><td><code>CHN</code></td><td><code>156</code></td><td>中国</td><td>China</td><td>东亚</td></tr>
    <tr><td><code>CY</code></td><td><code>CYP</code></td><td><code>196</code></td><td>塞浦路斯</td><td>Cyprus</td><td>西亚</td></tr>
    <tr><td><code>GE</code></td><td><code>GEO</code></td><td><code>268</code></td><td>格鲁吉亚</td><td>Georgia</td><td>西亚</td></tr>
    <tr><td><code>HK</code></td><td><code>HKG</code></td><td><code>344</code></td><td>中国香港</td><td>Hong Kong</td><td>东亚</td></tr>
    <tr><td><code>ID</code></td><td><code>IDN</code> · <a href="/downloads/gadm41-idn-shp">GADM 数据</a></td><td><code>360</code></td><td>印度尼西亚</td><td>Indonesia</td><td>东南亚</td></tr>
    <tr><td><code>IL</code></td><td><code>ISR</code> · <a href="/downloads/gadm41-isr-shp">GADM 数据</a></td><td><code>376</code></td><td>以色列</td><td>Israel</td><td>西亚</td></tr>
    <tr><td><code>IN</code></td><td><code>IND</code> · <a href="/downloads/gadm41-ind-shp">GADM 数据</a></td><td><code>356</code></td><td>印度</td><td>India</td><td>南亚</td></tr>
    <tr><td><code>IQ</code></td><td><code>IRQ</code> · <a href="/downloads/gadm41-irq-shp">GADM 数据</a></td><td><code>368</code></td><td>伊拉克</td><td>Iraq</td><td>西亚</td></tr>
    <tr><td><code>IR</code></td><td><code>IRN</code> · <a href="/downloads/gadm41-irn-shp">GADM 数据</a></td><td><code>364</code></td><td>伊朗</td><td>Iran, Islamic Republic of</td><td>南亚</td></tr>
    <tr><td><code>JO</code></td><td><code>JOR</code> · <a href="/downloads/gadm41-jor-shp">GADM 数据</a></td><td><code>400</code></td><td>约旦</td><td>Jordan</td><td>西亚</td></tr>
    <tr><td><code>JP</code></td><td><code>JPN</code> · <a href="/downloads/gadm41-jpn-shp">GADM 数据</a></td><td><code>392</code></td><td>日本</td><td>Japan</td><td>东亚</td></tr>
    <tr><td><code>KG</code></td><td><code>KGZ</code></td><td><code>417</code></td><td>吉尔吉斯斯坦</td><td>Kyrgyzstan</td><td>中亚</td></tr>
    <tr><td><code>KH</code></td><td><code>KHM</code> · <a href="/downloads/gadm41-khm-shp">GADM 数据</a></td><td><code>116</code></td><td>柬埔寨</td><td>Cambodia</td><td>东南亚</td></tr>
    <tr><td><code>KP</code></td><td><code>PRK</code> · <a href="/downloads/gadm41-prk-shp">GADM 数据</a></td><td><code>408</code></td><td>朝鲜</td><td>Korea, Democratic People's Republic of</td><td>东亚</td></tr>
    <tr><td><code>KR</code></td><td><code>KOR</code> · <a href="/downloads/gadm41-kor-shp">GADM 数据</a></td><td><code>410</code></td><td>韩国</td><td>Korea, Republic of</td><td>东亚</td></tr>
    <tr><td><code>KW</code></td><td><code>KWT</code></td><td><code>414</code></td><td>科威特</td><td>Kuwait</td><td>西亚</td></tr>
    <tr><td><code>KZ</code></td><td><code>KAZ</code> · <a href="/downloads/gadm41-kaz-shp">GADM 数据</a></td><td><code>398</code></td><td>哈萨克斯坦</td><td>Kazakhstan</td><td>中亚</td></tr>
    <tr><td><code>LA</code></td><td><code>LAO</code> · <a href="/downloads/gadm41-lao-shp">GADM 数据</a></td><td><code>418</code></td><td>老挝</td><td>Lao People's Democratic Republic</td><td>东南亚</td></tr>
    <tr><td><code>LB</code></td><td><code>LBN</code></td><td><code>422</code></td><td>黎巴嫩</td><td>Lebanon</td><td>西亚</td></tr>
    <tr><td><code>LK</code></td><td><code>LKA</code></td><td><code>144</code></td><td>斯里兰卡</td><td>Sri Lanka</td><td>南亚</td></tr>
    <tr><td><code>MM</code></td><td><code>MMR</code> · <a href="/downloads/gadm41-mmr-shp">GADM 数据</a></td><td><code>104</code></td><td>缅甸</td><td>Myanmar</td><td>东南亚</td></tr>
    <tr><td><code>MN</code></td><td><code>MNG</code> · <a href="/downloads/gadm41-mng-shp">GADM 数据</a></td><td><code>496</code></td><td>蒙古</td><td>Mongolia</td><td>东亚</td></tr>
    <tr><td><code>MO</code></td><td><code>MAC</code></td><td><code>446</code></td><td>中国澳门</td><td>Macao</td><td>东亚</td></tr>
    <tr><td><code>MV</code></td><td><code>MDV</code></td><td><code>462</code></td><td>马尔代夫</td><td>Maldives</td><td>南亚</td></tr>
    <tr><td><code>MY</code></td><td><code>MYS</code> · <a href="/downloads/gadm41-mys-shp">GADM 数据</a></td><td><code>458</code></td><td>马来西亚</td><td>Malaysia</td><td>东南亚</td></tr>
    <tr><td><code>NP</code></td><td><code>NPL</code> · <a href="/downloads/gadm41-npl-shp">GADM 数据</a></td><td><code>524</code></td><td>尼泊尔</td><td>Nepal</td><td>南亚</td></tr>
    <tr><td><code>OM</code></td><td><code>OMN</code></td><td><code>512</code></td><td>阿曼</td><td>Oman</td><td>西亚</td></tr>
    <tr><td><code>PH</code></td><td><code>PHL</code> · <a href="/downloads/gadm41-phl-shp">GADM 数据</a></td><td><code>608</code></td><td>菲律宾</td><td>Philippines</td><td>东南亚</td></tr>
    <tr><td><code>PK</code></td><td><code>PAK</code> · <a href="/downloads/gadm41-pak-shp">GADM 数据</a></td><td><code>586</code></td><td>巴基斯坦</td><td>Pakistan</td><td>南亚</td></tr>
    <tr><td><code>PS</code></td><td><code>PSE</code></td><td><code>275</code></td><td>巴勒斯坦</td><td>Palestine, State of</td><td>西亚</td></tr>
    <tr><td><code>QA</code></td><td><code>QAT</code></td><td><code>634</code></td><td>卡塔尔</td><td>Qatar</td><td>西亚</td></tr>
    <tr><td><code>SA</code></td><td><code>SAU</code> · <a href="/downloads/gadm41-sau-shp">GADM 数据</a></td><td><code>682</code></td><td>沙特阿拉伯</td><td>Saudi Arabia</td><td>西亚</td></tr>
    <tr><td><code>SG</code></td><td><code>SGP</code> · <a href="/downloads/gadm41-sgp-shp">GADM 数据</a></td><td><code>702</code></td><td>新加坡</td><td>Singapore</td><td>东南亚</td></tr>
    <tr><td><code>SY</code></td><td><code>SYR</code></td><td><code>760</code></td><td>叙利亚</td><td>Syrian Arab Republic</td><td>西亚</td></tr>
    <tr><td><code>TH</code></td><td><code>THA</code> · <a href="/downloads/gadm41-tha-shp">GADM 数据</a></td><td><code>764</code></td><td>泰国</td><td>Thailand</td><td>东南亚</td></tr>
    <tr><td><code>TJ</code></td><td><code>TJK</code></td><td><code>762</code></td><td>塔吉克斯坦</td><td>Tajikistan</td><td>中亚</td></tr>
    <tr><td><code>TL</code></td><td><code>TLS</code></td><td><code>626</code></td><td>东帝汶</td><td>Timor-Leste</td><td>东南亚</td></tr>
    <tr><td><code>TM</code></td><td><code>TKM</code></td><td><code>795</code></td><td>土库曼斯坦</td><td>Turkmenistan</td><td>中亚</td></tr>
    <tr><td><code>TR</code></td><td><code>TUR</code> · <a href="/downloads/gadm41-tur-shp">GADM 数据</a></td><td><code>792</code></td><td>土耳其</td><td>Türkiye</td><td>西亚</td></tr>
    <tr><td><code>TW</code></td><td><code>TWN</code></td><td><code>158</code></td><td>中国台湾</td><td>Taiwan, Province of China</td><td>东亚</td></tr>
    <tr><td><code>UZ</code></td><td><code>UZB</code> · <a href="/downloads/gadm41-uzb-shp">GADM 数据</a></td><td><code>860</code></td><td>乌兹别克斯坦</td><td>Uzbekistan</td><td>中亚</td></tr>
    <tr><td><code>VN</code></td><td><code>VNM</code> · <a href="/downloads/gadm41-vnm-shp">GADM 数据</a></td><td><code>704</code></td><td>越南</td><td>Viet Nam</td><td>东南亚</td></tr>
    <tr><td><code>YE</code></td><td><code>YEM</code></td><td><code>887</code></td><td>也门</td><td>Yemen</td><td>西亚</td></tr>
  </tbody>
</table>
</div>

### 欧洲（51 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AD</code></td><td><code>AND</code></td><td><code>020</code></td><td>安道尔</td><td>Andorra</td><td>南欧</td></tr>
    <tr><td><code>AL</code></td><td><code>ALB</code></td><td><code>008</code></td><td>阿尔巴尼亚</td><td>Albania</td><td>南欧</td></tr>
    <tr><td><code>AT</code></td><td><code>AUT</code></td><td><code>040</code></td><td>奥地利</td><td>Austria</td><td>西欧</td></tr>
    <tr><td><code>AX</code></td><td><code>ALA</code></td><td><code>248</code></td><td>奥兰群岛</td><td>Åland Islands</td><td>北欧</td></tr>
    <tr><td><code>BA</code></td><td><code>BIH</code></td><td><code>070</code></td><td>波斯尼亚和黑塞哥维那</td><td>Bosnia and Herzegovina</td><td>南欧</td></tr>
    <tr><td><code>BE</code></td><td><code>BEL</code></td><td><code>056</code></td><td>比利时</td><td>Belgium</td><td>西欧</td></tr>
    <tr><td><code>BG</code></td><td><code>BGR</code></td><td><code>100</code></td><td>保加利亚</td><td>Bulgaria</td><td>东欧</td></tr>
    <tr><td><code>BY</code></td><td><code>BLR</code></td><td><code>112</code></td><td>白俄罗斯</td><td>Belarus</td><td>东欧</td></tr>
    <tr><td><code>CH</code></td><td><code>CHE</code> · <a href="/downloads/gadm41-che-shp">GADM 数据</a></td><td><code>756</code></td><td>瑞士</td><td>Switzerland</td><td>西欧</td></tr>
    <tr><td><code>CZ</code></td><td><code>CZE</code></td><td><code>203</code></td><td>捷克</td><td>Czechia</td><td>东欧</td></tr>
    <tr><td><code>DE</code></td><td><code>DEU</code> · <a href="/downloads/gadm41-deu-shp">GADM 数据</a></td><td><code>276</code></td><td>德国</td><td>Germany</td><td>西欧</td></tr>
    <tr><td><code>DK</code></td><td><code>DNK</code></td><td><code>208</code></td><td>丹麦</td><td>Denmark</td><td>北欧</td></tr>
    <tr><td><code>EE</code></td><td><code>EST</code></td><td><code>233</code></td><td>爱沙尼亚</td><td>Estonia</td><td>北欧</td></tr>
    <tr><td><code>ES</code></td><td><code>ESP</code> · <a href="/downloads/gadm41-esp-shp">GADM 数据</a></td><td><code>724</code></td><td>西班牙</td><td>Spain</td><td>南欧</td></tr>
    <tr><td><code>FI</code></td><td><code>FIN</code> · <a href="/downloads/gadm41-fin-shp">GADM 数据</a></td><td><code>246</code></td><td>芬兰</td><td>Finland</td><td>北欧</td></tr>
    <tr><td><code>FO</code></td><td><code>FRO</code></td><td><code>234</code></td><td>法罗群岛</td><td>Faroe Islands</td><td>北欧</td></tr>
    <tr><td><code>FR</code></td><td><code>FRA</code> · <a href="/downloads/gadm41-fra-shp">GADM 数据</a></td><td><code>250</code></td><td>法国</td><td>France</td><td>西欧</td></tr>
    <tr><td><code>GB</code></td><td><code>GBR</code> · <a href="/downloads/gadm41-gbr-shp">GADM 数据</a></td><td><code>826</code></td><td>英国</td><td>United Kingdom of Great Britain and Northern Ireland</td><td>北欧</td></tr>
    <tr><td><code>GG</code></td><td><code>GGY</code></td><td><code>831</code></td><td>根西岛</td><td>Guernsey</td><td>北欧</td></tr>
    <tr><td><code>GI</code></td><td><code>GIB</code></td><td><code>292</code></td><td>直布罗陀</td><td>Gibraltar</td><td>南欧</td></tr>
    <tr><td><code>GR</code></td><td><code>GRC</code> · <a href="/downloads/gadm41-grc-shp">GADM 数据</a></td><td><code>300</code></td><td>希腊</td><td>Greece</td><td>南欧</td></tr>
    <tr><td><code>HR</code></td><td><code>HRV</code></td><td><code>191</code></td><td>克罗地亚</td><td>Croatia</td><td>南欧</td></tr>
    <tr><td><code>HU</code></td><td><code>HUN</code></td><td><code>348</code></td><td>匈牙利</td><td>Hungary</td><td>东欧</td></tr>
    <tr><td><code>IE</code></td><td><code>IRL</code></td><td><code>372</code></td><td>爱尔兰</td><td>Ireland</td><td>北欧</td></tr>
    <tr><td><code>IM</code></td><td><code>IMN</code></td><td><code>833</code></td><td>马恩岛</td><td>Isle of Man</td><td>北欧</td></tr>
    <tr><td><code>IS</code></td><td><code>ISL</code></td><td><code>352</code></td><td>冰岛</td><td>Iceland</td><td>北欧</td></tr>
    <tr><td><code>IT</code></td><td><code>ITA</code> · <a href="/downloads/gadm41-ita-shp">GADM 数据</a></td><td><code>380</code></td><td>意大利</td><td>Italy</td><td>南欧</td></tr>
    <tr><td><code>JE</code></td><td><code>JEY</code></td><td><code>832</code></td><td>泽西岛</td><td>Jersey</td><td>北欧</td></tr>
    <tr><td><code>LI</code></td><td><code>LIE</code></td><td><code>438</code></td><td>列支敦士登</td><td>Liechtenstein</td><td>西欧</td></tr>
    <tr><td><code>LT</code></td><td><code>LTU</code></td><td><code>440</code></td><td>立陶宛</td><td>Lithuania</td><td>北欧</td></tr>
    <tr><td><code>LU</code></td><td><code>LUX</code></td><td><code>442</code></td><td>卢森堡</td><td>Luxembourg</td><td>西欧</td></tr>
    <tr><td><code>LV</code></td><td><code>LVA</code></td><td><code>428</code></td><td>拉脱维亚</td><td>Latvia</td><td>北欧</td></tr>
    <tr><td><code>MC</code></td><td><code>MCO</code></td><td><code>492</code></td><td>摩纳哥</td><td>Monaco</td><td>西欧</td></tr>
    <tr><td><code>MD</code></td><td><code>MDA</code></td><td><code>498</code></td><td>摩尔多瓦</td><td>Moldova, Republic of</td><td>东欧</td></tr>
    <tr><td><code>ME</code></td><td><code>MNE</code></td><td><code>499</code></td><td>黑山</td><td>Montenegro</td><td>南欧</td></tr>
    <tr><td><code>MK</code></td><td><code>MKD</code></td><td><code>807</code></td><td>北马其顿</td><td>North Macedonia</td><td>南欧</td></tr>
    <tr><td><code>MT</code></td><td><code>MLT</code></td><td><code>470</code></td><td>马耳他</td><td>Malta</td><td>南欧</td></tr>
    <tr><td><code>NL</code></td><td><code>NLD</code> · <a href="/downloads/gadm41-nld-shp">GADM 数据</a></td><td><code>528</code></td><td>荷兰</td><td>Netherlands, Kingdom of the</td><td>西欧</td></tr>
    <tr><td><code>NO</code></td><td><code>NOR</code></td><td><code>578</code></td><td>挪威</td><td>Norway</td><td>北欧</td></tr>
    <tr><td><code>PL</code></td><td><code>POL</code></td><td><code>616</code></td><td>波兰</td><td>Poland</td><td>东欧</td></tr>
    <tr><td><code>PT</code></td><td><code>PRT</code> · <a href="/downloads/gadm41-prt-shp">GADM 数据</a></td><td><code>620</code></td><td>葡萄牙</td><td>Portugal</td><td>南欧</td></tr>
    <tr><td><code>RO</code></td><td><code>ROU</code></td><td><code>642</code></td><td>罗马尼亚</td><td>Romania</td><td>东欧</td></tr>
    <tr><td><code>RS</code></td><td><code>SRB</code></td><td><code>688</code></td><td>塞尔维亚</td><td>Serbia</td><td>南欧</td></tr>
    <tr><td><code>RU</code></td><td><code>RUS</code> · <a href="/downloads/gadm41-rus-shp">GADM 数据</a></td><td><code>643</code></td><td>俄罗斯</td><td>Russian Federation</td><td>东欧</td></tr>
    <tr><td><code>SE</code></td><td><code>SWE</code> · <a href="/downloads/gadm41-swe-shp">GADM 数据</a></td><td><code>752</code></td><td>瑞典</td><td>Sweden</td><td>北欧</td></tr>
    <tr><td><code>SI</code></td><td><code>SVN</code></td><td><code>705</code></td><td>斯洛文尼亚</td><td>Slovenia</td><td>南欧</td></tr>
    <tr><td><code>SJ</code></td><td><code>SJM</code></td><td><code>744</code></td><td>斯瓦尔巴和扬马延</td><td>Svalbard and Jan Mayen</td><td>北欧</td></tr>
    <tr><td><code>SK</code></td><td><code>SVK</code></td><td><code>703</code></td><td>斯洛伐克</td><td>Slovakia</td><td>东欧</td></tr>
    <tr><td><code>SM</code></td><td><code>SMR</code></td><td><code>674</code></td><td>圣马力诺</td><td>San Marino</td><td>南欧</td></tr>
    <tr><td><code>UA</code></td><td><code>UKR</code> · <a href="/downloads/gadm41-ukr-shp">GADM 数据</a></td><td><code>804</code></td><td>乌克兰</td><td>Ukraine</td><td>东欧</td></tr>
    <tr><td><code>VA</code></td><td><code>VAT</code></td><td><code>336</code></td><td>梵蒂冈</td><td>Holy See</td><td>南欧</td></tr>
  </tbody>
</table>
</div>

### 非洲（60 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AO</code></td><td><code>AGO</code></td><td><code>024</code></td><td>安哥拉</td><td>Angola</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>BF</code></td><td><code>BFA</code></td><td><code>854</code></td><td>布基纳法索</td><td>Burkina Faso</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>BI</code></td><td><code>BDI</code></td><td><code>108</code></td><td>布隆迪</td><td>Burundi</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>BJ</code></td><td><code>BEN</code></td><td><code>204</code></td><td>贝宁</td><td>Benin</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>BW</code></td><td><code>BWA</code></td><td><code>072</code></td><td>博茨瓦纳</td><td>Botswana</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CD</code></td><td><code>COD</code> · <a href="/downloads/gadm41-cod-shp">GADM 数据</a></td><td><code>180</code></td><td>刚果（金）</td><td>Congo, Democratic Republic of the</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CF</code></td><td><code>CAF</code></td><td><code>140</code></td><td>中非共和国</td><td>Central African Republic</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CG</code></td><td><code>COG</code></td><td><code>178</code></td><td>刚果（布）</td><td>Congo</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CI</code></td><td><code>CIV</code></td><td><code>384</code></td><td>科特迪瓦</td><td>Côte d'Ivoire</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CM</code></td><td><code>CMR</code></td><td><code>120</code></td><td>喀麦隆</td><td>Cameroon</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>CV</code></td><td><code>CPV</code></td><td><code>132</code></td><td>佛得角</td><td>Cabo Verde</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>DJ</code></td><td><code>DJI</code></td><td><code>262</code></td><td>吉布提</td><td>Djibouti</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>DZ</code></td><td><code>DZA</code></td><td><code>012</code></td><td>阿尔及利亚</td><td>Algeria</td><td>北非</td></tr>
    <tr><td><code>EG</code></td><td><code>EGY</code> · <a href="/downloads/gadm41-egy-shp">GADM 数据</a></td><td><code>818</code></td><td>埃及</td><td>Egypt</td><td>北非</td></tr>
    <tr><td><code>EH</code></td><td><code>ESH</code></td><td><code>732</code></td><td>西撒哈拉</td><td>Western Sahara</td><td>北非</td></tr>
    <tr><td><code>ER</code></td><td><code>ERI</code></td><td><code>232</code></td><td>厄立特里亚</td><td>Eritrea</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ET</code></td><td><code>ETH</code> · <a href="/downloads/gadm41-eth-shp">GADM 数据</a></td><td><code>231</code></td><td>埃塞俄比亚</td><td>Ethiopia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GA</code></td><td><code>GAB</code></td><td><code>266</code></td><td>加蓬</td><td>Gabon</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GH</code></td><td><code>GHA</code> · <a href="/downloads/gadm41-gha-shp">GADM 数据</a></td><td><code>288</code></td><td>加纳</td><td>Ghana</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GM</code></td><td><code>GMB</code></td><td><code>270</code></td><td>冈比亚</td><td>Gambia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GN</code></td><td><code>GIN</code></td><td><code>324</code></td><td>几内亚</td><td>Guinea</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GQ</code></td><td><code>GNQ</code></td><td><code>226</code></td><td>赤道几内亚</td><td>Equatorial Guinea</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>GW</code></td><td><code>GNB</code></td><td><code>624</code></td><td>几内亚比绍</td><td>Guinea-Bissau</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>IO</code></td><td><code>IOT</code></td><td><code>086</code></td><td>英属印度洋领地</td><td>British Indian Ocean Territory</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>KE</code></td><td><code>KEN</code> · <a href="/downloads/gadm41-ken-shp">GADM 数据</a></td><td><code>404</code></td><td>肯尼亚</td><td>Kenya</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>KM</code></td><td><code>COM</code></td><td><code>174</code></td><td>科摩罗</td><td>Comoros</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>LR</code></td><td><code>LBR</code></td><td><code>430</code></td><td>利比里亚</td><td>Liberia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>LS</code></td><td><code>LSO</code></td><td><code>426</code></td><td>莱索托</td><td>Lesotho</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>LY</code></td><td><code>LBY</code></td><td><code>434</code></td><td>利比亚</td><td>Libya</td><td>北非</td></tr>
    <tr><td><code>MA</code></td><td><code>MAR</code> · <a href="/downloads/gadm41-mar-shp">GADM 数据</a></td><td><code>504</code></td><td>摩洛哥</td><td>Morocco</td><td>北非</td></tr>
    <tr><td><code>MG</code></td><td><code>MDG</code></td><td><code>450</code></td><td>马达加斯加</td><td>Madagascar</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ML</code></td><td><code>MLI</code></td><td><code>466</code></td><td>马里</td><td>Mali</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>MR</code></td><td><code>MRT</code></td><td><code>478</code></td><td>毛里塔尼亚</td><td>Mauritania</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>MU</code></td><td><code>MUS</code></td><td><code>480</code></td><td>毛里求斯</td><td>Mauritius</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>MW</code></td><td><code>MWI</code></td><td><code>454</code></td><td>马拉维</td><td>Malawi</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>MZ</code></td><td><code>MOZ</code></td><td><code>508</code></td><td>莫桑比克</td><td>Mozambique</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>NA</code></td><td><code>NAM</code></td><td><code>516</code></td><td>纳米比亚</td><td>Namibia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>NE</code></td><td><code>NER</code></td><td><code>562</code></td><td>尼日尔</td><td>Niger</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>NG</code></td><td><code>NGA</code> · <a href="/downloads/gadm41-nga-shp">GADM 数据</a></td><td><code>566</code></td><td>尼日利亚</td><td>Nigeria</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>RE</code></td><td><code>REU</code></td><td><code>638</code></td><td>留尼汪</td><td>Réunion</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>RW</code></td><td><code>RWA</code></td><td><code>646</code></td><td>卢旺达</td><td>Rwanda</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SC</code></td><td><code>SYC</code></td><td><code>690</code></td><td>塞舌尔</td><td>Seychelles</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SD</code></td><td><code>SDN</code></td><td><code>729</code></td><td>苏丹</td><td>Sudan</td><td>北非</td></tr>
    <tr><td><code>SH</code></td><td><code>SHN</code></td><td><code>654</code></td><td>圣赫勒拿</td><td>Saint Helena, Ascension and Tristan da Cunha</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SL</code></td><td><code>SLE</code></td><td><code>694</code></td><td>塞拉利昂</td><td>Sierra Leone</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SN</code></td><td><code>SEN</code></td><td><code>686</code></td><td>塞内加尔</td><td>Senegal</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SO</code></td><td><code>SOM</code></td><td><code>706</code></td><td>索马里</td><td>Somalia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SS</code></td><td><code>SSD</code></td><td><code>728</code></td><td>南苏丹</td><td>South Sudan</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ST</code></td><td><code>STP</code></td><td><code>678</code></td><td>圣多美和普林西比</td><td>Sao Tome and Principe</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>SZ</code></td><td><code>SWZ</code></td><td><code>748</code></td><td>斯威士兰</td><td>Eswatini</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>TD</code></td><td><code>TCD</code></td><td><code>148</code></td><td>乍得</td><td>Chad</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>TF</code></td><td><code>ATF</code></td><td><code>260</code></td><td>法属南部领地</td><td>French Southern Territories</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>TG</code></td><td><code>TGO</code></td><td><code>768</code></td><td>多哥</td><td>Togo</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>TN</code></td><td><code>TUN</code></td><td><code>788</code></td><td>突尼斯</td><td>Tunisia</td><td>北非</td></tr>
    <tr><td><code>TZ</code></td><td><code>TZA</code> · <a href="/downloads/gadm41-tza-shp">GADM 数据</a></td><td><code>834</code></td><td>坦桑尼亚</td><td>Tanzania, United Republic of</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>UG</code></td><td><code>UGA</code></td><td><code>800</code></td><td>乌干达</td><td>Uganda</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>YT</code></td><td><code>MYT</code></td><td><code>175</code></td><td>马约特</td><td>Mayotte</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ZA</code></td><td><code>ZAF</code> · <a href="/downloads/gadm41-zaf-shp">GADM 数据</a></td><td><code>710</code></td><td>南非</td><td>South Africa</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ZM</code></td><td><code>ZMB</code></td><td><code>894</code></td><td>赞比亚</td><td>Zambia</td><td>撒哈拉以南非洲</td></tr>
    <tr><td><code>ZW</code></td><td><code>ZWE</code></td><td><code>716</code></td><td>津巴布韦</td><td>Zimbabwe</td><td>撒哈拉以南非洲</td></tr>
  </tbody>
</table>
</div>

### 美洲（57 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AG</code></td><td><code>ATG</code></td><td><code>028</code></td><td>安提瓜和巴布达</td><td>Antigua and Barbuda</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>AI</code></td><td><code>AIA</code></td><td><code>660</code></td><td>安圭拉</td><td>Anguilla</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>AR</code></td><td><code>ARG</code> · <a href="/downloads/gadm41-arg-shp">GADM 数据</a></td><td><code>032</code></td><td>阿根廷</td><td>Argentina</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>AW</code></td><td><code>ABW</code></td><td><code>533</code></td><td>阿鲁巴</td><td>Aruba</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BB</code></td><td><code>BRB</code></td><td><code>052</code></td><td>巴巴多斯</td><td>Barbados</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BL</code></td><td><code>BLM</code></td><td><code>652</code></td><td>圣巴泰勒米</td><td>Saint Barthélemy</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BM</code></td><td><code>BMU</code></td><td><code>060</code></td><td>百慕大</td><td>Bermuda</td><td>北美</td></tr>
    <tr><td><code>BO</code></td><td><code>BOL</code></td><td><code>068</code></td><td>玻利维亚</td><td>Bolivia, Plurinational State of</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BQ</code></td><td><code>BES</code></td><td><code>535</code></td><td>荷属加勒比区</td><td>Bonaire, Sint Eustatius and Saba</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BR</code></td><td><code>BRA</code> · <a href="/downloads/gadm41-bra-shp">GADM 数据</a></td><td><code>076</code></td><td>巴西</td><td>Brazil</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BS</code></td><td><code>BHS</code></td><td><code>044</code></td><td>巴哈马</td><td>Bahamas</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BV</code></td><td><code>BVT</code></td><td><code>074</code></td><td>布韦岛</td><td>Bouvet Island</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>BZ</code></td><td><code>BLZ</code></td><td><code>084</code></td><td>伯利兹</td><td>Belize</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>CA</code></td><td><code>CAN</code> · <a href="/downloads/gadm41-can-shp">GADM 数据</a></td><td><code>124</code></td><td>加拿大</td><td>Canada</td><td>北美</td></tr>
    <tr><td><code>CL</code></td><td><code>CHL</code> · <a href="/downloads/gadm41-chl-shp">GADM 数据</a></td><td><code>152</code></td><td>智利</td><td>Chile</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>CO</code></td><td><code>COL</code> · <a href="/downloads/gadm41-col-shp">GADM 数据</a></td><td><code>170</code></td><td>哥伦比亚</td><td>Colombia</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>CR</code></td><td><code>CRI</code></td><td><code>188</code></td><td>哥斯达黎加</td><td>Costa Rica</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>CU</code></td><td><code>CUB</code></td><td><code>192</code></td><td>古巴</td><td>Cuba</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>CW</code></td><td><code>CUW</code></td><td><code>531</code></td><td>库拉索</td><td>Curaçao</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>DM</code></td><td><code>DMA</code></td><td><code>212</code></td><td>多米尼克</td><td>Dominica</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>DO</code></td><td><code>DOM</code></td><td><code>214</code></td><td>多米尼加共和国</td><td>Dominican Republic</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>EC</code></td><td><code>ECU</code></td><td><code>218</code></td><td>厄瓜多尔</td><td>Ecuador</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>FK</code></td><td><code>FLK</code></td><td><code>238</code></td><td>福克兰群岛（马尔维纳斯群岛）</td><td>Falkland Islands (Malvinas)</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GD</code></td><td><code>GRD</code></td><td><code>308</code></td><td>格林纳达</td><td>Grenada</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GF</code></td><td><code>GUF</code></td><td><code>254</code></td><td>法属圭亚那</td><td>French Guiana</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GL</code></td><td><code>GRL</code></td><td><code>304</code></td><td>格陵兰</td><td>Greenland</td><td>北美</td></tr>
    <tr><td><code>GP</code></td><td><code>GLP</code></td><td><code>312</code></td><td>瓜德罗普</td><td>Guadeloupe</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GS</code></td><td><code>SGS</code></td><td><code>239</code></td><td>南乔治亚和南桑威奇群岛</td><td>South Georgia and the South Sandwich Islands</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GT</code></td><td><code>GTM</code></td><td><code>320</code></td><td>危地马拉</td><td>Guatemala</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>GY</code></td><td><code>GUY</code></td><td><code>328</code></td><td>圭亚那</td><td>Guyana</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>HN</code></td><td><code>HND</code></td><td><code>340</code></td><td>洪都拉斯</td><td>Honduras</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>HT</code></td><td><code>HTI</code></td><td><code>332</code></td><td>海地</td><td>Haiti</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>JM</code></td><td><code>JAM</code></td><td><code>388</code></td><td>牙买加</td><td>Jamaica</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>KN</code></td><td><code>KNA</code></td><td><code>659</code></td><td>圣基茨和尼维斯</td><td>Saint Kitts and Nevis</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>KY</code></td><td><code>CYM</code></td><td><code>136</code></td><td>开曼群岛</td><td>Cayman Islands</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>LC</code></td><td><code>LCA</code></td><td><code>662</code></td><td>圣卢西亚</td><td>Saint Lucia</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>MF</code></td><td><code>MAF</code></td><td><code>663</code></td><td>法属圣马丁</td><td>Saint Martin (French part)</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>MQ</code></td><td><code>MTQ</code></td><td><code>474</code></td><td>马提尼克</td><td>Martinique</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>MS</code></td><td><code>MSR</code></td><td><code>500</code></td><td>蒙特塞拉特</td><td>Montserrat</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>MX</code></td><td><code>MEX</code> · <a href="/downloads/gadm41-mex-shp">GADM 数据</a></td><td><code>484</code></td><td>墨西哥</td><td>Mexico</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>NI</code></td><td><code>NIC</code></td><td><code>558</code></td><td>尼加拉瓜</td><td>Nicaragua</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>PA</code></td><td><code>PAN</code></td><td><code>591</code></td><td>巴拿马</td><td>Panama</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>PE</code></td><td><code>PER</code></td><td><code>604</code></td><td>秘鲁</td><td>Peru</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>PM</code></td><td><code>SPM</code></td><td><code>666</code></td><td>圣皮埃尔和密克隆群岛</td><td>Saint Pierre and Miquelon</td><td>北美</td></tr>
    <tr><td><code>PR</code></td><td><code>PRI</code></td><td><code>630</code></td><td>波多黎各</td><td>Puerto Rico</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>PY</code></td><td><code>PRY</code></td><td><code>600</code></td><td>巴拉圭</td><td>Paraguay</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>SR</code></td><td><code>SUR</code></td><td><code>740</code></td><td>苏里南</td><td>Suriname</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>SV</code></td><td><code>SLV</code></td><td><code>222</code></td><td>萨尔瓦多</td><td>El Salvador</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>SX</code></td><td><code>SXM</code></td><td><code>534</code></td><td>荷属圣马丁</td><td>Sint Maarten (Dutch part)</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>TC</code></td><td><code>TCA</code></td><td><code>796</code></td><td>特克斯和凯科斯群岛</td><td>Turks and Caicos Islands</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>TT</code></td><td><code>TTO</code></td><td><code>780</code></td><td>特立尼达和多巴哥</td><td>Trinidad and Tobago</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>US</code></td><td><code>USA</code> · <a href="/downloads/gadm41-usa-shp">GADM 数据</a></td><td><code>840</code></td><td>美国</td><td>United States of America</td><td>北美</td></tr>
    <tr><td><code>UY</code></td><td><code>URY</code></td><td><code>858</code></td><td>乌拉圭</td><td>Uruguay</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>VC</code></td><td><code>VCT</code></td><td><code>670</code></td><td>圣文森特和格林纳丁斯</td><td>Saint Vincent and the Grenadines</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>VE</code></td><td><code>VEN</code></td><td><code>862</code></td><td>委内瑞拉</td><td>Venezuela, Bolivarian Republic of</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>VG</code></td><td><code>VGB</code></td><td><code>092</code></td><td>英属维尔京群岛</td><td>Virgin Islands (British)</td><td>拉丁美洲和加勒比</td></tr>
    <tr><td><code>VI</code></td><td><code>VIR</code></td><td><code>850</code></td><td>美属维尔京群岛</td><td>Virgin Islands (U.S.)</td><td>拉丁美洲和加勒比</td></tr>
  </tbody>
</table>
</div>

### 大洋洲（29 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AS</code></td><td><code>ASM</code></td><td><code>016</code></td><td>美属萨摩亚</td><td>American Samoa</td><td>波利尼西亚</td></tr>
    <tr><td><code>AU</code></td><td><code>AUS</code> · <a href="/downloads/gadm41-aus-shp">GADM 数据</a></td><td><code>036</code></td><td>澳大利亚</td><td>Australia</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>CC</code></td><td><code>CCK</code></td><td><code>166</code></td><td>科科斯（基林）群岛</td><td>Cocos (Keeling) Islands</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>CK</code></td><td><code>COK</code></td><td><code>184</code></td><td>库克群岛</td><td>Cook Islands</td><td>波利尼西亚</td></tr>
    <tr><td><code>CX</code></td><td><code>CXR</code></td><td><code>162</code></td><td>圣诞岛</td><td>Christmas Island</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>FJ</code></td><td><code>FJI</code></td><td><code>242</code></td><td>斐济</td><td>Fiji</td><td>美拉尼西亚</td></tr>
    <tr><td><code>FM</code></td><td><code>FSM</code></td><td><code>583</code></td><td>密克罗尼西亚</td><td>Micronesia, Federated States of</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>GU</code></td><td><code>GUM</code></td><td><code>316</code></td><td>关岛</td><td>Guam</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>HM</code></td><td><code>HMD</code></td><td><code>334</code></td><td>赫德岛和麦克唐纳群岛</td><td>Heard Island and McDonald Islands</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>KI</code></td><td><code>KIR</code></td><td><code>296</code></td><td>基里巴斯</td><td>Kiribati</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>MH</code></td><td><code>MHL</code></td><td><code>584</code></td><td>马绍尔群岛</td><td>Marshall Islands</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>MP</code></td><td><code>MNP</code></td><td><code>580</code></td><td>北马里亚纳群岛</td><td>Northern Mariana Islands</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>NC</code></td><td><code>NCL</code></td><td><code>540</code></td><td>新喀里多尼亚</td><td>New Caledonia</td><td>美拉尼西亚</td></tr>
    <tr><td><code>NF</code></td><td><code>NFK</code></td><td><code>574</code></td><td>诺福克岛</td><td>Norfolk Island</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>NR</code></td><td><code>NRU</code></td><td><code>520</code></td><td>瑙鲁</td><td>Nauru</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>NU</code></td><td><code>NIU</code></td><td><code>570</code></td><td>纽埃</td><td>Niue</td><td>波利尼西亚</td></tr>
    <tr><td><code>NZ</code></td><td><code>NZL</code> · <a href="/downloads/gadm41-nzl-shp">GADM 数据</a></td><td><code>554</code></td><td>新西兰</td><td>New Zealand</td><td>澳大利亚和新西兰</td></tr>
    <tr><td><code>PF</code></td><td><code>PYF</code></td><td><code>258</code></td><td>法属波利尼西亚</td><td>French Polynesia</td><td>波利尼西亚</td></tr>
    <tr><td><code>PG</code></td><td><code>PNG</code></td><td><code>598</code></td><td>巴布亚新几内亚</td><td>Papua New Guinea</td><td>美拉尼西亚</td></tr>
    <tr><td><code>PN</code></td><td><code>PCN</code></td><td><code>612</code></td><td>皮特凯恩群岛</td><td>Pitcairn</td><td>波利尼西亚</td></tr>
    <tr><td><code>PW</code></td><td><code>PLW</code></td><td><code>585</code></td><td>帕劳</td><td>Palau</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>SB</code></td><td><code>SLB</code></td><td><code>090</code></td><td>所罗门群岛</td><td>Solomon Islands</td><td>美拉尼西亚</td></tr>
    <tr><td><code>TK</code></td><td><code>TKL</code></td><td><code>772</code></td><td>托克劳</td><td>Tokelau</td><td>波利尼西亚</td></tr>
    <tr><td><code>TO</code></td><td><code>TON</code></td><td><code>776</code></td><td>汤加</td><td>Tonga</td><td>波利尼西亚</td></tr>
    <tr><td><code>TV</code></td><td><code>TUV</code></td><td><code>798</code></td><td>图瓦卢</td><td>Tuvalu</td><td>波利尼西亚</td></tr>
    <tr><td><code>UM</code></td><td><code>UMI</code></td><td><code>581</code></td><td>美国本土外小岛屿</td><td>United States Minor Outlying Islands</td><td>密克罗尼西亚</td></tr>
    <tr><td><code>VU</code></td><td><code>VUT</code></td><td><code>548</code></td><td>瓦努阿图</td><td>Vanuatu</td><td>美拉尼西亚</td></tr>
    <tr><td><code>WF</code></td><td><code>WLF</code></td><td><code>876</code></td><td>瓦利斯和富图纳</td><td>Wallis and Futuna</td><td>波利尼西亚</td></tr>
    <tr><td><code>WS</code></td><td><code>WSM</code></td><td><code>882</code></td><td>萨摩亚</td><td>Samoa</td><td>波利尼西亚</td></tr>
  </tbody>
</table>
</div>

### 其他（1 个）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>二字母</th><th>三字母</th><th>数字</th><th>中文名称</th><th>英文名称（ISO）</th><th>分区（UN M49）</th></tr>
  </thead>
  <tbody>
    <tr><td><code>AQ</code></td><td><code>ATA</code></td><td><code>010</code></td><td>南极洲</td><td>Antarctica</td><td>—</td></tr>
  </tbody>
</table>
</div>

## 常见问题 FAQ

<details>
<summary>Q: 中国的 ISO 代码是什么？</summary>

二字母 `CN`，三字母 `CHN`，数字 `156`。中国香港、中国澳门、中国台湾在 ISO 3166-1 中另有代码（HK / HKG / 344、MO / MAC / 446、TW / TWN / 158），本页中文名称按我国规范写法列出。

</details>

<details>
<summary>Q: ISO 3166-1 一共有多少个代码？</summary>

目前 ISO 3166-1 共有 249 个正式分配的代码，其中既包括主权国家，也包括依附领土和特殊地区（如南极洲 AQ）。所以这个数字比联合国会员国（193 个）多。

</details>

<details>
<summary>Q: ISO 3166-2 又是什么？</summary>

ISO 3166-2 是各国**一级行政区**的代码，格式为「国家二字母-区划代码」，例如 `CN-GD` 广东省、`JP-13` 东京都、`US-CA` 加利福尼亚州。

</details>

<details>
<summary>Q: 为什么英国的代码是 GB，域名却是 .uk？</summary>

英国的 ISO 代码是 GB / GBR，但互联网早期已经启用了 .uk，后来一直沿用，所以域名是唯一的例外。

</details>

<details>
<summary>Q: 国家改名后代码会变吗？</summary>

名称变化不一定改代码。例如土耳其英文名改为 Türkiye、斯威士兰改为 Eswatini，代码仍是 TR / TUR、SZ / SWZ。只有国家分立、合并等情况才会新增或撤销代码。

</details>

## 五、数据来源

- 代码与分区：ISO 3166-1 及联合国统计司 M49 标准，整理自开源数据集 [lukes/ISO-3166-Countries-with-Regional-Codes](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes)；
- 中文名称：Unicode CLDR 简体中文区域名称，并按我国规范对中国台湾、中国香港、中国澳门等名称做了调整；正式文件中的中文名称请以 GB/T 2659.1 和外交部公布的国家和地区名称为准。
- 相关资料：[GADM 世界各国行政区划矢量数据](/downloads)（在资料下载中搜索「GADM」）。

## 地理编码速查系列

- [行政区划代码全表](/learn/china-admin-division-codes)
- [身份证前六位地区码对照](/learn/id-card-region-codes)
- [34 个省级行政区一览](/learn/china-provinces-overview)
- [全国车牌代码对照表](/learn/china-license-plate-codes)
- [全国电话区号表](/learn/china-telephone-area-codes)
- [全球手机国家区号表](/learn/world-phone-country-codes)
- [全国邮政编码表](/learn/china-postal-codes)
- [全国机场三字码 / 四字码](/learn/china-airport-codes)
- [中国常用坐标系 EPSG 代码](/learn/china-epsg-codes)
- [高斯-克吕格分带带号对照](/learn/gauss-kruger-zone-table)
- [用地用海分类代码表](/learn/land-sea-use-classification-codes)
- [河流国标码](/learn/china-river-codes)
