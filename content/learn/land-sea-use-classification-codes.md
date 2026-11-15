---
slug: land-sea-use-classification-codes
title: 用地用海分类代码表（2023 正式版）：24 个一级类、113 个二级类全表与含义
summary: 依据自然资源部《国土空间调查、规划、用途管制用地用海分类指南》（自然资发〔2023〕234号）整理的用地用海分类代码全表，收录一、二、三级类代码、名称与官方含义，可按代码或名称检索；并说明代码规则、使用层级、城镇村及工矿用地、地下空间 UG 代码，以及与土地管理法三大类、湿地保护法的对应关系。
date: 2026-11-15
category: 地理基础
subject: 地理信息技术
tags: 用地用海分类, 国土空间规划, 国土调查, 地类代码, 自然资发〔2023〕234号, 土地利用分类, 三调
tableSearch: true
---

> 本页依据自然资源部 **《国土空间调查、规划、用途管制用地用海分类指南》（自然资发〔2023〕234 号，2023 年 11 月 22 日印发）** 正式文本整理，收录表 2.1 全部 175 个代码及附录 A 的含义说明。顶部搜索框可按代码或名称筛选，如输入 `0701` 或 `停车`。

## 一、这套分类是干什么的

做国土空间规划、国土变更调查、用地审批的人，每天都要跟这套代码打交道。它把原来土地利用现状分类（GB/T 21010）、城乡用地分类（GB 50137）和海域使用分类「三套标准」统一成一套，**调查、规划、用途管制共用同一套地类代码**，做到「一张底图」。

2020 年 11 月先发布了试行版，试行三年后，自然资源部在 2023 年 11 月修订并正式施行，也就是本页的版本。

## 二、三级分类体系与代码规则

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>级别</th><th>代码位数</th><th>数量（官方口径）</th><th>示例</th></tr>
  </thead>
  <tbody>
    <tr><td>一级类</td><td>2 位</td><td>24 个</td><td><code>07</code> 居住用地</td></tr>
    <tr><td>二级类</td><td>4 位</td><td>113 个</td><td><code>0701</code> 城镇住宅用地</td></tr>
    <tr><td>三级类</td><td>6 位</td><td>140 个</td><td><code>070101</code> 一类城镇住宅用地</td></tr>
  </tbody>
</table>
</div>

为什么数代码只有 111 个二级、40 个三级，官方却说 113 个、140 个？因为官方计数时，**没有再往下细分的类别也算作下一级的一个类**：`16 留白用地` 和 `24 其他海域` 没有二级类，各自也算 1 个二级类（111 + 2 = 113）；同理，没有再细分三级类的 98 个二级类，加上留白用地、其他海域，各自也算 1 个三级类（40 + 100 = 140）。

使用规则（指南 1.5 节）：
- **二级类是国土调查、国土空间规划的主干分类**；
- 全国国土调查以一级类和二级类为基础分类，三级类用于专项调查和补充调查；
- 国土空间总体规划原则上以一级类为主，可细分至二级类；详细规划和市县相关专项规划原则上用二级类和三级类。

## 三、24 个一级类一览

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>一级类</th><th>二级类数</th><th>三级类数</th><th>用地 / 用海</th></tr>
  </thead>
  <tbody>
    <tr><td><code>01</code></td><td>耕地</td><td>3</td><td>—</td><td>用地</td></tr>
    <tr><td><code>02</code></td><td>园地</td><td>5</td><td>—</td><td>用地</td></tr>
    <tr><td><code>03</code></td><td>林地</td><td>4</td><td>—</td><td>用地</td></tr>
    <tr><td><code>04</code></td><td>草地</td><td>3</td><td>—</td><td>用地</td></tr>
    <tr><td><code>05</code></td><td>湿地</td><td>7</td><td>—</td><td>用地</td></tr>
    <tr><td><code>06</code></td><td>农业设施建设用地</td><td>2</td><td>5</td><td>用地</td></tr>
    <tr><td><code>07</code></td><td>居住用地</td><td>4</td><td>5</td><td>用地</td></tr>
    <tr><td><code>08</code></td><td>公共管理与公共服务用地</td><td>7</td><td>16</td><td>用地</td></tr>
    <tr><td><code>09</code></td><td>商业服务业用地</td><td>4</td><td>5</td><td>用地</td></tr>
    <tr><td><code>10</code></td><td>工矿用地</td><td>3</td><td>3</td><td>用地</td></tr>
    <tr><td><code>11</code></td><td>仓储用地</td><td>2</td><td>3</td><td>用地</td></tr>
    <tr><td><code>12</code></td><td>交通运输用地</td><td>9</td><td>3</td><td>用地</td></tr>
    <tr><td><code>13</code></td><td>公用设施用地</td><td>12</td><td>—</td><td>用地</td></tr>
    <tr><td><code>14</code></td><td>绿地与开敞空间用地</td><td>3</td><td>—</td><td>用地</td></tr>
    <tr><td><code>15</code></td><td>特殊用地</td><td>7</td><td>—</td><td>用地</td></tr>
    <tr><td><code>16</code></td><td>留白用地</td><td>—（不再细分）</td><td>—</td><td>用地</td></tr>
    <tr><td><code>17</code></td><td>陆地水域</td><td>6</td><td>—</td><td>用地</td></tr>
    <tr><td><code>18</code></td><td>渔业用海</td><td>4</td><td>—</td><td>用海</td></tr>
    <tr><td><code>19</code></td><td>工矿通信用海</td><td>6</td><td>—</td><td>用海</td></tr>
    <tr><td><code>20</code></td><td>交通运输用海</td><td>5</td><td>—</td><td>用海</td></tr>
    <tr><td><code>21</code></td><td>游憩用海</td><td>2</td><td>—</td><td>用海</td></tr>
    <tr><td><code>22</code></td><td>特殊用海</td><td>6</td><td>—</td><td>用海</td></tr>
    <tr><td><code>23</code></td><td>其他土地</td><td>7</td><td>—</td><td>用地</td></tr>
    <tr><td><code>24</code></td><td>其他海域</td><td>—（不再细分）</td><td>—</td><td>用海</td></tr>
  </tbody>
</table>
</div>

## 四、用地用海分类全表（含义说明）

### 01 耕地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>01</code></td><td>一级</td><td>耕地</td><td>指利用地表耕作层种植粮、棉、油、糖、蔬菜、饲草饲料等农作物为主，每年可以种植一季及以上（含以一年一季以上的耕种方式种植多年生作物）的土地，包括熟地，新开发、复垦、整理地，休闲地（含轮歇地、休耕地）；以及间有零星果树、桑树或其他树木的耕地；包括南方宽度＜1.0米，北方宽度＜2.0米固定的沟、渠、路和地坎（埂）；包括直接利用地表耕作层种植的温室、大棚、地膜等保温、保湿设施用地</td></tr>
    <tr class="level-city"><td><code>0101</code></td><td>二级</td><td>水田</td><td>指用于种植水稻、莲藕等水生农作物的耕地，包括实行水生、旱生农作物轮种的耕地</td></tr>
    <tr class="level-city"><td><code>0102</code></td><td>二级</td><td>水浇地</td><td>指有水源保证和灌溉设施，在一般年景能正常灌溉，种植旱生农作物（含蔬菜）的耕地</td></tr>
    <tr class="level-city"><td><code>0103</code></td><td>二级</td><td>旱地</td><td>指无灌溉设施,主要靠天然降水种植旱生农作物的耕地，包括没有灌溉设施，仅靠引洪淤灌的耕地</td></tr>
  </tbody>
</table>
</div>

### 02 园地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>02</code></td><td>一级</td><td>园地</td><td>指种植以采集果、叶、根、茎、汁等为主的集约经营的多年生作物，覆盖度大于50%或每亩株数大于合理株数70%的土地，包括用于育苗的土地</td></tr>
    <tr class="level-city"><td><code>0201</code></td><td>二级</td><td>果园</td><td>指种植果树的园地</td></tr>
    <tr class="level-city"><td><code>0202</code></td><td>二级</td><td>茶园</td><td>指种植茶树的园地</td></tr>
    <tr class="level-city"><td><code>0203</code></td><td>二级</td><td>橡胶园地</td><td>指种植橡胶树的园地</td></tr>
    <tr class="level-city"><td><code>0204</code></td><td>二级</td><td>油料园地</td><td>指种植油茶、油棕、橄榄和文冠果等木本油料作物的园地</td></tr>
    <tr class="level-city"><td><code>0205</code></td><td>二级</td><td>其他园地</td><td>指种植桑树、可可、咖啡、花椒、胡椒、药材等其他多年生作物的园地，包括用于育苗的土地</td></tr>
  </tbody>
</table>
</div>

### 03 林地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>03</code></td><td>一级</td><td>林地</td><td>指生长乔木、竹类、灌木的土地。包括自然生长干果等林木的土地。不包括生长林木的湿地，城镇、村庄范围内的绿化林木用地，铁路、公路征地范围内的林木，以及河流、沟渠的护堤林用地</td></tr>
    <tr class="level-city"><td><code>0301</code></td><td>二级</td><td>乔木林地</td><td>指乔木郁闭度≥0.2的林地，不包括森林沼泽</td></tr>
    <tr class="level-city"><td><code>0302</code></td><td>二级</td><td>竹林地</td><td>指生长竹类植物，郁闭度≥0.2的林地</td></tr>
    <tr class="level-city"><td><code>0303</code></td><td>二级</td><td>灌木林地</td><td>指灌木覆盖度≥40%的林地，不包括灌丛沼泽</td></tr>
    <tr class="level-city"><td><code>0304</code></td><td>二级</td><td>其他林地</td><td>指疏林地（树木郁闭度≥0.1、＜0.2的林地）、未成林地，以及迹地、苗圃和符合国家规定标准的用于培育、贮存种子苗木等直接为林业生产经营服务的设施用地等</td></tr>
  </tbody>
</table>
</div>

### 04 草地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>04</code></td><td>一级</td><td>草地</td><td>指生长草本植物为主的土地，包括乔木郁闭度＜0.1的疏林草地、灌木覆盖度＜40％的灌丛草地，不包括生长草本植物的湿地</td></tr>
    <tr class="level-city"><td><code>0401</code></td><td>二级</td><td>天然牧草地</td><td>指以天然草本植物为主，用于放牧或割草的草地，包括实施禁牧措施的草地</td></tr>
    <tr class="level-city"><td><code>0402</code></td><td>二级</td><td>人工牧草地</td><td>指人工种植牧草的草地，不包括种植饲草饲料的耕地</td></tr>
    <tr class="level-city"><td><code>0403</code></td><td>二级</td><td>其他草地</td><td>指天然牧草地、人工牧草地以外的草地，不包括可用于开发补充耕地的土地</td></tr>
  </tbody>
</table>
</div>

### 05 湿地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>05</code></td><td>一级</td><td>湿地</td><td>指陆地和水域的交汇处，水位接近或处于地表面，或有浅层积水，且处于自然状态的土地</td></tr>
    <tr class="level-city"><td><code>0501</code></td><td>二级</td><td>森林沼泽</td><td>指以乔木植物为优势群落、郁闭度≥0.2的淡水沼泽</td></tr>
    <tr class="level-city"><td><code>0502</code></td><td>二级</td><td>灌丛沼泽</td><td>指以灌木植物为优势群落、覆盖度≥40%的淡水沼泽</td></tr>
    <tr class="level-city"><td><code>0503</code></td><td>二级</td><td>沼泽草地</td><td>指以天然草本植物为主的沼泽化的低地草甸、高寒草甸</td></tr>
    <tr class="level-city"><td><code>0504</code></td><td>二级</td><td>其他沼泽地</td><td>指除森林沼泽、灌丛沼泽和沼泽草地外、地表经常过湿或有薄层积水，生长沼生或部分沼生和部分湿生、水生或盐生植物的土地，包括草本沼泽、苔藓沼泽、内陆盐沼等</td></tr>
    <tr class="level-city"><td><code>0505</code></td><td>二级</td><td>沿海滩涂</td><td>指沿海大潮高潮位与低潮位之间的潮浸地带，包括海岛的滩涂，不包括已利用的滩涂</td></tr>
    <tr class="level-city"><td><code>0506</code></td><td>二级</td><td>内陆滩涂</td><td>指河流、湖泊常水位至洪水位间的滩地，时令河、湖洪水位以下的滩地，水库正常蓄水位与洪水位间的滩地，包括海岛的内陆滩地，不包括已利用的滩地</td></tr>
    <tr class="level-city"><td><code>0507</code></td><td>二级</td><td>红树林地</td><td>指沿海生长红树植物的土地，包括红树林苗圃</td></tr>
  </tbody>
</table>
</div>

### 06 农业设施建设用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>06</code></td><td>一级</td><td>农业设施建设用地</td><td>指对地表耕作层造成破坏的，为农业生产、农村生活服务的乡村道路用地以及种植设施、畜禽养殖设施、水产养殖设施建设用地</td></tr>
    <tr class="level-city"><td><code>0601</code></td><td>二级</td><td>农村道路</td><td>指在村庄范围外，南方宽度≥1.0米、≤8.0米，北方宽度≥2.0米、≤8.0米，用于村间、田间交通运输，并在国家公路网络体系（乡道及乡道以上公路）之外，以服务于农村农业生产为主要用途的道路（含机耕道）</td></tr>
    <tr><td><code>060101</code></td><td>三级</td><td>村道用地</td><td>指用于村间、田间交通运输，服务于农村生活生产的硬化型道路（含机耕道），不包括村庄内部道路用地和田间道</td></tr>
    <tr><td><code>060102</code></td><td>三级</td><td>田间道</td><td>指用于田间交通运输，为农业生产、农村生活服务的非硬化型道路</td></tr>
    <tr class="level-city"><td><code>0602</code></td><td>二级</td><td>设施农用地</td><td>指直接用于经营性畜禽养殖生产设施及附属设施用地；直接用于作物栽培或水产养殖等农产品生产的设施及附属设施用地；直接用于设施农业项目辅助生产的设施用地；晾晒场、粮食果品烘干设施、粮食和农资临时存放场所、大型农机具临时存放场所等规模化粮食生产所必需的配套设施用地</td></tr>
    <tr><td><code>060201</code></td><td>三级</td><td>种植设施建设用地</td><td>指工厂化作物生产和为生产服务的看护房、农资农机具存放场所等，以及与生产直接关联的烘干晾晒、分拣包装、保鲜存储等设施用地，不包括直接利用地表种植的大棚、地膜等保温、保湿设施用地</td></tr>
    <tr><td><code>060202</code></td><td>三级</td><td>畜禽养殖设施建设用地</td><td>指经营性畜禽养殖生产及直接关联的圈舍、废弃物处理、检验检疫等设施用地，不包括屠宰和肉类加工场所用地等</td></tr>
    <tr><td><code>060203</code></td><td>三级</td><td>水产养殖设施建设用地</td><td>指工厂化水产养殖生产及直接关联的硬化养殖池、看护房、粪污处置、检验检疫等设施用地</td></tr>
  </tbody>
</table>
</div>

### 07 居住用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>07</code></td><td>一级</td><td>居住用地</td><td>指城乡住宅用地及其居住生活配套的社区服务设施用地</td></tr>
    <tr class="level-city"><td><code>0701</code></td><td>二级</td><td>城镇住宅用地</td><td>指用于城镇生活居住功能的各类住宅建筑用地及其附属设施用地</td></tr>
    <tr><td><code>070101</code></td><td>三级</td><td>一类城镇住宅用地</td><td>指配套设施齐全、环境良好，以三层及以下住宅为主的住宅建筑用地及其附属道路、附属绿地、停车场等用地</td></tr>
    <tr><td><code>070102</code></td><td>三级</td><td>二类城镇住宅用地</td><td>指配套设施较齐全、环境良好，以四层及以上住宅为主的住宅建筑用地及其附属道路、附属绿地、停车场等用地</td></tr>
    <tr><td><code>070103</code></td><td>三级</td><td>三类城镇住宅用地</td><td>指配套设施较欠缺、环境较差，以需要加以改造的简陋住宅为主的住宅建筑用地及其附属道路、附属绿地、停车场等用地，包括危房、棚户区、临时住宅等用地</td></tr>
    <tr class="level-city"><td><code>0702</code></td><td>二级</td><td>城镇社区服务设施用地</td><td>指为城镇居住生活配套的社区服务设施用地，包括社区服务站以及托儿所、社区卫生服务站、文化活动站、小型综合体育场地、小型超市等用地，以及老年人日间照料中心（托老所）等社区养老服务设施用地，不包括中小学、幼儿园用地</td></tr>
    <tr class="level-city"><td><code>0703</code></td><td>二级</td><td>农村宅基地</td><td>指农村村民用于建造住宅及其生活附属设施的土地，包括住房、附属用房等用地。</td></tr>
    <tr><td><code>070301</code></td><td>三级</td><td>一类农村宅基地</td><td>指农村用于建造独户住房的土地</td></tr>
    <tr><td><code>070302</code></td><td>三级</td><td>二类农村宅基地</td><td>指农村用于建造集中住房的土地</td></tr>
    <tr class="level-city"><td><code>0704</code></td><td>二级</td><td>农村社区服务设施用地</td><td>指为农村生产生活配套的社区服务设施用地，包括农村社区服务站以及村委会、供销社、兽医站、农机站、托儿所、文化活动室、小型体育活动场地、综合礼堂、农村商店及小型超市、农村卫生服务站、村邮站、宗祠等用地，不包括中小学、幼儿园用地</td></tr>
  </tbody>
</table>
</div>

### 08 公共管理与公共服务用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>08</code></td><td>一级</td><td>公共管理与公共服务用地</td><td>指机关团体、科研、文化、教育、体育、卫生、社会福利等机构和设施的用地，不包括农村社区服务设施用地和城镇社区服务设施用地</td></tr>
    <tr class="level-city"><td><code>0801</code></td><td>二级</td><td>机关团体用地</td><td>指党政机关、人民团体及其相关直属机构、派出机构和直属事业单位的办公及附属设施用地</td></tr>
    <tr class="level-city"><td><code>0802</code></td><td>二级</td><td>科研用地</td><td>指科研机构及其科研设施、企业科学研究和研发设施用地</td></tr>
    <tr class="level-city"><td><code>0803</code></td><td>二级</td><td>文化用地</td><td>指图书、展览等公共文化活动设施用地</td></tr>
    <tr><td><code>080301</code></td><td>三级</td><td>图书与展览用地</td><td>指公共图书馆、博物馆、科技馆、公共美术馆、纪念馆、规划建设展览馆等设施用地</td></tr>
    <tr><td><code>080302</code></td><td>三级</td><td>文化活动用地</td><td>指文化馆（群众艺术馆）、文化站、工人文化宫、青少年宫（青少年活动中心）、妇女儿童活动中心（儿童活动中心）、老年活动中心、综合文化活动中心、公共剧场等设施用地</td></tr>
    <tr class="level-city"><td><code>0804</code></td><td>二级</td><td>教育用地</td><td>指高等教育、中等职业教育、中小学教育、幼儿园、特殊教育设施等用地，包括为学校配建的独立地段的学生生活用地</td></tr>
    <tr><td><code>080401</code></td><td>三级</td><td>高等教育用地</td><td>指大学、学院、高等职业学校、高等专科学校、成人高校等高等学校用地，包括军事院校用地</td></tr>
    <tr><td><code>080402</code></td><td>三级</td><td>中等职业教育用地</td><td>指普通中等专业学校、成人中等专业学校、职业高中、技工学校等用地，不包括附属于普通中学内的职业高中用地</td></tr>
    <tr><td><code>080403</code></td><td>三级</td><td>中小学用地</td><td>指小学、初级中学、高级中学、九年一贯制学校、完全中学、十二年一贯制学校用地，包括职业初中、成人中小学、附属于普通中学内的职业高中用地</td></tr>
    <tr><td><code>080404</code></td><td>三级</td><td>幼儿园用地</td><td>指幼儿园用地</td></tr>
    <tr><td><code>080405</code></td><td>三级</td><td>其他教育用地</td><td>指除以上之外的教育用地，包括特殊教育学校、专门学校（工读学校）用地</td></tr>
    <tr class="level-city"><td><code>0805</code></td><td>二级</td><td>体育用地</td><td>指体育场馆、体育训练基地、溜冰场、跳伞场、摩托车场、射击场，以及水上运动的陆域部分等用地，不包括学校、企事业、军队等机构内部专用的体育设施用地</td></tr>
    <tr><td><code>080501</code></td><td>三级</td><td>体育场馆用地</td><td>指室内外体育运动用地，包括体育场馆、游泳场馆、大中型多功能运动场地、全民健身中心等用地</td></tr>
    <tr><td><code>080502</code></td><td>三级</td><td>体育训练用地</td><td>指为体育运动专设的训练基地用地</td></tr>
    <tr class="level-city"><td><code>0806</code></td><td>二级</td><td>医疗卫生用地</td><td>指医疗、预防、保健、护理、康复、急救、安宁疗护等用地</td></tr>
    <tr><td><code>080601</code></td><td>三级</td><td>医院用地</td><td>指综合医院、中医医院、中西医结合医院、民族医医院、各类专科医院、护理院等用地</td></tr>
    <tr><td><code>080602</code></td><td>三级</td><td>基层医疗卫生设施用地</td><td>指社区卫生服务中心、乡镇（街道）卫生院等用地，不包括社区卫生服务站、农村卫生服务站、村卫生室、门诊部、诊所（医务室）等用地</td></tr>
    <tr><td><code>080603</code></td><td>三级</td><td>公共卫生用地</td><td>指疾病预防控制中心、妇幼保健院、急救中心（站）、采供血设施等用地</td></tr>
    <tr class="level-city"><td><code>0807</code></td><td>二级</td><td>社会福利用地</td><td>指为老年人、儿童及残疾人等提供社会福利和慈善服务的设施用地</td></tr>
    <tr><td><code>080701</code></td><td>三级</td><td>老年人社会福利用地</td><td>指为老年人提供居住、康复、保健等服务的养老院、敬老院、养护院等机构养老设施用地</td></tr>
    <tr><td><code>080702</code></td><td>三级</td><td>儿童社会福利用地</td><td>指为孤儿、农村留守儿童、困境儿童等特殊儿童群体提供居住、抚养、照护等服务的儿童福利院、孤儿院、未成年人救助保护中心等设施用地</td></tr>
    <tr><td><code>080703</code></td><td>三级</td><td>残疾人社会福利用地</td><td>指为残疾人提供居住、康复、护养等服务的残疾人福利院、残疾人康复中心、残疾人综合服务中心等设施用地</td></tr>
    <tr><td><code>080704</code></td><td>三级</td><td>其他社会福利用地</td><td>指除以上之外的社会福利设施用地，包括救助管理站等设施用地</td></tr>
  </tbody>
</table>
</div>

### 09 商业服务业用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>09</code></td><td>一级</td><td>商业服务业用地</td><td>指商业、商务金融以及娱乐康体等设施用地，不包括农村社区服务设施用地和城镇社区服务设施用地</td></tr>
    <tr class="level-city"><td><code>0901</code></td><td>二级</td><td>商业用地</td><td>指零售商业、批发市场及餐饮、旅馆及公用设施营业网点等服务业用地</td></tr>
    <tr><td><code>090101</code></td><td>三级</td><td>零售商业用地</td><td>指商铺、商场、超市、服装及小商品市场等用地</td></tr>
    <tr><td><code>090102</code></td><td>三级</td><td>批发市场用地</td><td>指以批发功能为主的市场用地</td></tr>
    <tr><td><code>090103</code></td><td>三级</td><td>餐饮用地</td><td>指饭店、餐厅、酒吧等用地</td></tr>
    <tr><td><code>090104</code></td><td>三级</td><td>旅馆用地</td><td>指宾馆、旅馆、招待所、服务型公寓、有住宿功能的度假村等用地</td></tr>
    <tr><td><code>090105</code></td><td>三级</td><td>公用设施营业网点用地</td><td>指零售加油、加气、充换电站、电信、邮政、供水、燃气、供电、供热等公用设施营业网点用地</td></tr>
    <tr class="level-city"><td><code>0902</code></td><td>二级</td><td>商务金融用地</td><td>指金融保险、艺术传媒、设计、技术服务、物流管理中心等综合性办公用地</td></tr>
    <tr class="level-city"><td><code>0903</code></td><td>二级</td><td>娱乐用地</td><td>指剧院、音乐厅、电影院、歌舞厅、网吧以及绿地率小于65%的大型游乐等设施用地</td></tr>
    <tr class="level-city"><td><code>0904</code></td><td>二级</td><td>其他商业服务业用地</td><td>指除以上之外的商业服务业用地，包括高尔夫练习场、赛马场、以观光娱乐为目的的直升机停机坪等通用航空、汽车维修站以及宠物医院、洗车场、洗染店、照相馆、理发美容店、洗浴场所、废旧物资回收站、机动车、电子产品和日用产品修理网点、物流营业网点等用地</td></tr>
  </tbody>
</table>
</div>

### 10 工矿用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>10</code></td><td>一级</td><td>工矿用地</td><td>指用于工矿业生产的土地</td></tr>
    <tr class="level-city"><td><code>1001</code></td><td>二级</td><td>工业用地</td><td>指工矿企业的生产车间、装备修理、自用库房及其附属设施用地，包括专用铁路、码头和附属道路、停车场等用地，包括工业生产必须的研发、设计、测试、中试用地，不包括采矿用地</td></tr>
    <tr><td><code>100101</code></td><td>三级</td><td>一类工业用地</td><td>指对居住和公共环境基本无干扰、污染和安全隐患，布局无特殊控制要求的工业用地</td></tr>
    <tr><td><code>100102</code></td><td>三级</td><td>二类工业用地</td><td>指对居住和公共环境有一定干扰、污染和安全隐患，不可布局于居住区和公共设施集中区内的工业用地</td></tr>
    <tr><td><code>100103</code></td><td>三级</td><td>三类工业用地</td><td>指对居住和公共环境有严重干扰、污染和安全隐患，布局有防护、隔离要求的工业用地</td></tr>
    <tr class="level-city"><td><code>1002</code></td><td>二级</td><td>采矿用地</td><td>指采矿、采石、采砂（沙）场，砖瓦窑等地面生产用地及排土（石）、尾矿堆放用地</td></tr>
    <tr class="level-city"><td><code>1003</code></td><td>二级</td><td>盐田</td><td>指用于以自然蒸发方式进行盐业生产的用地，包括晒盐场所、盐池及附属设施用地</td></tr>
  </tbody>
</table>
</div>

### 11 仓储用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>11</code></td><td>一级</td><td>仓储用地</td><td>指物资存放及物流仓储和战略性物资储备库用地</td></tr>
    <tr class="level-city"><td><code>1101</code></td><td>二级</td><td>物流仓储用地</td><td>指国家和省级战略性储备库以外，城镇、村庄用于物资存储、中转、配送等设施用地，包括附属设施、道路、停车场等用地</td></tr>
    <tr><td><code>110101</code></td><td>三级</td><td>一类物流仓储用地</td><td>指对居住和公共环境基本无干扰、污染和安全隐患，布局无特殊控制要求的物流仓储用地</td></tr>
    <tr><td><code>110102</code></td><td>三级</td><td>二类物流仓储用地</td><td>指对居住和公共环境有一定干扰、污染和安全隐患，不可布局于居住区和公共设施集中区内的物流仓储用地</td></tr>
    <tr><td><code>110103</code></td><td>三级</td><td>三类物流仓储用地</td><td>指用于存放易燃、易爆和剧毒等危险品，布局有防护、隔离要求的物流仓储用地</td></tr>
    <tr class="level-city"><td><code>1102</code></td><td>二级</td><td>储备库用地</td><td>指国家和省级的粮食、棉花、石油等战略性储备库用地</td></tr>
  </tbody>
</table>
</div>

### 12 交通运输用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>12</code></td><td>一级</td><td>交通运输用地</td><td>指铁路、公路、机场、港口码头、管道运输、城市轨道交通、各种道路以及交通场站等交通运输设施及其附属设施用地，不包括其他用地内的附属道路、停车场等用地</td></tr>
    <tr class="level-city"><td><code>1201</code></td><td>二级</td><td>铁路用地</td><td>指铁路编组站、轨道线路（含城际轨道）等用地，不包括铁路客货运站等交通场站用地</td></tr>
    <tr class="level-city"><td><code>1202</code></td><td>二级</td><td>公路用地</td><td>指国道、省道、县道和乡道用地及附属设施用地，不包括已纳入城镇集中连片建成区，发挥城镇内部道路功能的路段，以及公路长途客货运站等交通场站用地</td></tr>
    <tr class="level-city"><td><code>1203</code></td><td>二级</td><td>机场用地</td><td>指民用及军民合用的机场用地，包括飞行区、航站区等用地，不包括净空控制范围内的其他用地</td></tr>
    <tr class="level-city"><td><code>1204</code></td><td>二级</td><td>港口码头用地</td><td>指海港和河港的陆域部分，包括用于堆场、货运码头及其他港口设施的用地，不包括港口客运码头等交通场站用地</td></tr>
    <tr class="level-city"><td><code>1205</code></td><td>二级</td><td>管道运输用地</td><td>指运输矿石、石油和天然气等地面管道运输用地，地下管道运输规定的地面控制范围内的用地应按其地面实际用途归类</td></tr>
    <tr class="level-city"><td><code>1206</code></td><td>二级</td><td>城市轨道交通用地</td><td>指独立占地的城市轨道交通地面以上部分的线路、站点用地</td></tr>
    <tr class="level-city"><td><code>1207</code></td><td>二级</td><td>城镇村道路用地</td><td>指城镇、村庄范围内公用道路及行道树用地，包括快速路、主干路、次干路、支路、专用人行道和非机动车道等用地，包括其交叉口用地</td></tr>
    <tr class="level-city"><td><code>1208</code></td><td>二级</td><td>交通场站用地</td><td>指交通服务设施用地，不包括交通指挥中心、交通队等行政办公设施用地</td></tr>
    <tr><td><code>120801</code></td><td>三级</td><td>对外交通场站用地</td><td>指铁路客货运站、公路长途客运站、港口客运码头及其附属设施用地</td></tr>
    <tr><td><code>120802</code></td><td>三级</td><td>公共交通场站用地</td><td>指城市轨道交通车辆基地及附属设施，公共汽（电）车首末站、停车场（库）、保养场，出租汽车场站设施等用地，以及轮渡、缆车、索道等的地面部分及其附属设施用地</td></tr>
    <tr><td><code>120803</code></td><td>三级</td><td>社会停车场用地</td><td>指独立占地的公共停车场和停车库用地（含设有充电桩的社会停车场），不包括其他建设用地配建的停车场和停车库用地</td></tr>
    <tr class="level-city"><td><code>1209</code></td><td>二级</td><td>其他交通设施用地</td><td>指除以上之外的交通设施用地，包括教练场等用地</td></tr>
  </tbody>
</table>
</div>

### 13 公用设施用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>13</code></td><td>一级</td><td>公用设施用地</td><td>指用于城乡和区域基础设施的供水、排水、供电、供燃气、供热、通信、邮政、广播电视、环卫、消防、水工等设施用地</td></tr>
    <tr class="level-city"><td><code>1301</code></td><td>二级</td><td>供水用地</td><td>指取水设施、供水厂、再生水厂、加压泵站、高位水池等设施用地</td></tr>
    <tr class="level-city"><td><code>1302</code></td><td>二级</td><td>排水用地</td><td>指雨水泵站、污水泵站、污水处理、污泥处理厂等设施及其附属的构筑物用地，不包括排水河渠用地</td></tr>
    <tr class="level-city"><td><code>1303</code></td><td>二级</td><td>供电用地</td><td>指变电站、开关站、环网柜等设施用地，不包括电厂、可再生能源发电等工业用地。高压走廊下规定的控制范围内的用地应按其地面实际用途归类</td></tr>
    <tr class="level-city"><td><code>1304</code></td><td>二级</td><td>供燃气用地</td><td>指分输站、调压站、门站、供气站、储配站、气化站、灌瓶站和地面输气管廊等设施用地，不包括制气厂等工业用地</td></tr>
    <tr class="level-city"><td><code>1305</code></td><td>二级</td><td>供热用地</td><td>指集中供热厂、换热站、区域能源站、分布式能源站和地面输热管廊等设施用地</td></tr>
    <tr class="level-city"><td><code>1306</code></td><td>二级</td><td>通信用地</td><td>指通信铁塔、基站、卫星地球站、海缆登陆站、电信局、微波站、中继站等设施用地</td></tr>
    <tr class="level-city"><td><code>1307</code></td><td>二级</td><td>邮政用地</td><td>指邮政中心局、邮政支局（所）、邮件处理中心等设施用地</td></tr>
    <tr class="level-city"><td><code>1308</code></td><td>二级</td><td>广播电视设施用地</td><td>指广播电视的发射、传输和监测设施用地，包括无线电收信区、发信区以及广播电视发射台、转播台、差转台、监测站等设施用地</td></tr>
    <tr class="level-city"><td><code>1309</code></td><td>二级</td><td>环卫用地</td><td>指生活垃圾、医疗垃圾、危险废物处理和处置，以及垃圾转运、公厕、车辆清洗、环卫车辆停放修理等设施用地</td></tr>
    <tr class="level-city"><td><code>1310</code></td><td>二级</td><td>消防用地</td><td>指消防站、消防通信及指挥训练中心等设施用地</td></tr>
    <tr class="level-city"><td><code>1311</code></td><td>二级</td><td>水工设施用地</td><td>指人工修建的闸、坝、堤林路、水电厂房、扬水站等常水位岸线以上的建（构）筑物用地，包括防洪堤、防洪枢纽、排洪沟（渠）等设施用地</td></tr>
    <tr class="level-city"><td><code>1312</code></td><td>二级</td><td>其他公用设施用地</td><td>指除以上之外的公用设施用地，包括施工、养护、维修等设施用地</td></tr>
  </tbody>
</table>
</div>

### 14 绿地与开敞空间用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>14</code></td><td>一级</td><td>绿地与开敞空间用地</td><td>指城镇、村庄用地范围内的公园绿地、防护绿地、广场等公共开敞空间用地，不包括其他建设用地中的附属绿地</td></tr>
    <tr class="level-city"><td><code>1401</code></td><td>二级</td><td>公园绿地</td><td>指向公众开放，以游憩为主要功能，兼具生态、景观、文教、体育和应急避险等功能，有一定服务设施的公园和绿地，包括综合公园、社区公园、专类公园和游园等</td></tr>
    <tr class="level-city"><td><code>1402</code></td><td>二级</td><td>防护绿地</td><td>指具有卫生、隔离、安全、生态防护功能，游人不宜进入的绿地</td></tr>
    <tr class="level-city"><td><code>1403</code></td><td>二级</td><td>广场用地</td><td>指以游憩、健身、纪念、集会和避险等功能为主的公共活动场地</td></tr>
  </tbody>
</table>
</div>

### 15 特殊用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>15</code></td><td>一级</td><td>特殊用地</td><td>指军事、外事、宗教、安保、殡葬，以及文物古迹等具有特殊性质的用地</td></tr>
    <tr class="level-city"><td><code>1501</code></td><td>二级</td><td>军事设施用地</td><td>指直接用于军事目的的设施用地</td></tr>
    <tr class="level-city"><td><code>1502</code></td><td>二级</td><td>使领馆用地</td><td>指外国驻华使领馆、国际机构办事处及其附属设施等用地</td></tr>
    <tr class="level-city"><td><code>1503</code></td><td>二级</td><td>宗教用地</td><td>指宗教活动场所用地</td></tr>
    <tr class="level-city"><td><code>1504</code></td><td>二级</td><td>文物古迹用地</td><td>指具有保护价值的古遗址、古建筑、古墓葬、石窟寺、近现代史迹及纪念建筑等用地，不包括已作其他用途的文物古迹用地</td></tr>
    <tr class="level-city"><td><code>1505</code></td><td>二级</td><td>监教场所用地</td><td>指监狱、看守所、劳改场、戒毒所等用地范围内的建设用地，不包括公安局等行政办公设施用地</td></tr>
    <tr class="level-city"><td><code>1506</code></td><td>二级</td><td>殡葬用地</td><td>指殡仪馆、火葬场、骨灰存放处和陵园、墓地等用地</td></tr>
    <tr class="level-city"><td><code>1507</code></td><td>二级</td><td>其他特殊用地</td><td>指除以上之外的特殊建设用地，包括边境口岸和自然保护地等的管理与服务设施用地</td></tr>
  </tbody>
</table>
</div>

### 16 留白用地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>16</code></td><td>一级</td><td>留白用地</td><td>指国土空间规划确定的城镇、村庄范围内暂未明确规划用途、规划期内不开发或特定条件下开发的用地</td></tr>
  </tbody>
</table>
</div>

### 17 陆地水域

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>17</code></td><td>一级</td><td>陆地水域</td><td>指陆域内的河流、湖泊、冰川及常年积雪等天然陆地水域，以及水库、坑塘水面、沟渠等人工陆地水域</td></tr>
    <tr class="level-city"><td><code>1701</code></td><td>二级</td><td>河流水面</td><td>指天然形成或人工开挖河流常水位岸线之间的水面，不包括被堤坝拦截后形成的水库区段水面</td></tr>
    <tr class="level-city"><td><code>1702</code></td><td>二级</td><td>湖泊水面</td><td>指天然形成的积水区常水位岸线所围成的水面</td></tr>
    <tr class="level-city"><td><code>1703</code></td><td>二级</td><td>水库水面</td><td>指人工拦截汇集而成的总设计库容≥10万立方米的水库正常蓄水位岸线所围成的水面</td></tr>
    <tr class="level-city"><td><code>1704</code></td><td>二级</td><td>坑塘水面</td><td>指人工开挖或天然形成的蓄水量＜10万立方米的坑塘常水位岸线所围成的水面，含养殖坑塘</td></tr>
    <tr class="level-city"><td><code>1705</code></td><td>二级</td><td>沟渠</td><td>指人工修建，南方宽度≥1.0米、北方宽度≥2.0米用于引、排、灌的渠道，包括渠槽、渠堤、附属护路林及小型泵站</td></tr>
    <tr class="level-city"><td><code>1706</code></td><td>二级</td><td>冰川及常年积雪</td><td>指表层被冰雪常年覆盖的土地</td></tr>
  </tbody>
</table>
</div>

### 18 渔业用海

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>18</code></td><td>一级</td><td>渔业用海</td><td>指为开发利用渔业资源、开展海洋渔业生产所使用的海域及无居民海岛（含农、林、牧业用岛）</td></tr>
    <tr class="level-city"><td><code>1801</code></td><td>二级</td><td>渔业基础设施用海</td><td>指用于渔船停靠、进行装卸作业和避风，以及用以繁殖重要苗种的海域，包括渔业码头、引桥、堤坝、养殖厂房、看护房、渔港港池（含开敞式码头前沿船舶靠泊和回旋水域）、渔港航道、取排水口及其他附属设施使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1802</code></td><td>二级</td><td>增养殖用海</td><td>指用于养殖生产或通过构筑人工鱼礁、半潜式平台、养殖工船等进行增养殖生产的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1803</code></td><td>二级</td><td>捕捞海域</td><td>指开展适度捕捞的海域</td></tr>
    <tr class="level-city"><td><code>1804</code></td><td>二级</td><td>农林牧业用岛</td><td>指用于农、林、牧业生产活动所使用的无居民海岛</td></tr>
  </tbody>
</table>
</div>

### 19 工矿通信用海

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>19</code></td><td>一级</td><td>工矿通信用海</td><td>指开展临海工业生产、工业仓储、海底电缆管道建设和矿产能源开发所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1901</code></td><td>二级</td><td>工业用海</td><td>指开展海水综合利用、船舶制造修理、海产品加工、滨海核电、火电、石化等临海工业所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1902</code></td><td>二级</td><td>盐田用海</td><td>指用于盐业生产的海域，包括盐业码头、引桥及港池（船舶靠泊和回旋水域）、盐田取排水口、蓄水池，以及取排水管道、蒸发池、结晶池、坨台、生产道路等附属设施等所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1903</code></td><td>二级</td><td>固体矿产用海</td><td>指开采海砂及其它固体矿产资源的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1904</code></td><td>二级</td><td>油气用海</td><td>指开采油气资源的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1905</code></td><td>二级</td><td>可再生能源用海</td><td>指开展海上风能、太阳能、潮流能、波浪能等可再生能源利用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>1906</code></td><td>二级</td><td>海底电缆管道用海</td><td>指用于埋（架）设海底通讯光（电）缆、电力电缆、输水管道及输送其它物质的管状设施所使用的海域</td></tr>
  </tbody>
</table>
</div>

### 20 交通运输用海

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>20</code></td><td>一级</td><td>交通运输用海</td><td>指用于港口、航运、路桥、机场等交通建设的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2001</code></td><td>二级</td><td>港口用海</td><td>指供船舶停靠、进行装卸作业、避风和调动的海域，包括港口码头、引桥、平台、港池、堤坝及堆场（仓储场）、铁路和公路转运场站及其附属设施等所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2002</code></td><td>二级</td><td>航运用海</td><td>指供船只航行、候潮、待泊、联检、避风及进行水上过驳作业的海域</td></tr>
    <tr class="level-city"><td><code>2003</code></td><td>二级</td><td>路桥隧道用海</td><td>指用于建设连陆、连岛等路桥工程及海底隧道海域，包括跨海桥梁、跨海和顺岸道路、海底隧道等及其附属设施所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2004</code></td><td>二级</td><td>机场用海</td><td>指用于建设海上机场及其附属设施所使用的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2005</code></td><td>二级</td><td>其他交通运输用海</td><td>指用于港口、航运、路桥、海上机场以外的交通运输用海。不包括油气开采用连陆、连岛道路和栈桥等所使用的海域</td></tr>
  </tbody>
</table>
</div>

### 21 游憩用海

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>21</code></td><td>一级</td><td>游憩用海</td><td>指开发利用滨海和海上旅游资源，开展海上娱乐活动的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2101</code></td><td>二级</td><td>风景旅游用海</td><td>指开发利用滨海和海上旅游资源的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2102</code></td><td>二级</td><td>文体休闲娱乐用海</td><td>指旅游景区开发和海上文体娱乐活动场建设的海域，包括海上浴场、游乐场及游乐设施使用的海域及无居民海岛</td></tr>
  </tbody>
</table>
</div>

### 22 特殊用海

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>22</code></td><td>一级</td><td>特殊用海</td><td>指用于军事、科研教学、海洋保护修复及海岸防护工程、排污倾倒、海洋水下文化遗产等用途的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2201</code></td><td>二级</td><td>军事用海</td><td>指建设军事设施和开展军事活动的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2202</code></td><td>二级</td><td>科研教育用海</td><td>指专门用于科学研究、试验及教学活动的海域及无居民海岛</td></tr>
    <tr class="level-city"><td><code>2203</code></td><td>二级</td><td>海洋保护修复及海岸防护工程用海</td><td>指各类涉海自然保护地所使用的海域，各类海洋生态保护修复工程实施需使用的海域，以及为防范海浪、沿岸流的侵蚀及台风、气旋和寒潮大风等自然灾害的侵袭，保障沿海河口海域水利、通航安全，建造海堤（塘）、防潮闸（含通航孔）、船闸、护岸设施、人工防护林等海岸防护工程及其他附属和管理设施等所使用的海域及无居民海</td></tr>
    <tr class="level-city"><td><code>2204</code></td><td>二级</td><td>排污倾倒用海</td><td>指用来排放污水和倾倒废弃物的海域</td></tr>
    <tr class="level-city"><td><code>2205</code></td><td>二级</td><td>水下文物保护用海</td><td>指用于发掘、保护各种水下文物和文化遗产所使用的海域</td></tr>
    <tr class="level-city"><td><code>2206</code></td><td>二级</td><td>其他特殊用海</td><td>指除军事用海、科研教学、海洋保护修复及海岸防护、排污倾倒、海洋水下文化遗产保护等以外的特殊用海用岛</td></tr>
  </tbody>
</table>
</div>

### 23 其他土地

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>23</code></td><td>一级</td><td>其他土地</td><td>指上述地类以外的其他类型的土地，包括盐碱地、沙地、裸土地、裸岩石砾地等植被稀少的陆域自然荒野等土地以及空闲地、后备耕地、田坎</td></tr>
    <tr class="level-city"><td><code>2301</code></td><td>二级</td><td>空闲地</td><td>指城镇、村庄范围内尚未使用的建设用地。空闲地仅用于国土调查监测工作</td></tr>
    <tr class="level-city"><td><code>2302</code></td><td>二级</td><td>后备耕地</td><td>指现状为荒草地，可用于开发补充耕地的土地</td></tr>
    <tr class="level-city"><td><code>2303</code></td><td>二级</td><td>田坎</td><td>指梯田及梯状坡地耕地中，主要用于拦蓄水和护坡，南方宽度≥1.0米、北方宽度≥2.0米的地坎</td></tr>
    <tr class="level-city"><td><code>2304</code></td><td>二级</td><td>盐碱地</td><td>指表层盐碱聚集，生长天然耐盐碱植物、植被覆盖度≤5%的土地。不包括沼泽地和沼泽草地</td></tr>
    <tr class="level-city"><td><code>2305</code></td><td>二级</td><td>沙地</td><td>指表层为沙覆盖、植被覆盖度≤5%的土地。不包括滩涂中的沙地</td></tr>
    <tr class="level-city"><td><code>2306</code></td><td>二级</td><td>裸土地</td><td>指表层为土质，植被覆盖度≤5%的土地。不包括滩涂中的泥滩</td></tr>
    <tr class="level-city"><td><code>2307</code></td><td>二级</td><td>裸岩石砾地</td><td>指表层为岩石或石砾，其覆盖面积≥70%的土地。不包括滩涂中的石滩</td></tr>
  </tbody>
</table>
</div>

### 24 其他海域

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>级别</th><th>名称</th><th>含义（附录 A）</th></tr>
  </thead>
  <tbody>
    <tr class="level-prov"><td><code>24</code></td><td>一级</td><td>其他海域</td><td>指需要限制开发，以及从长远发展角度应当予以保留的海域及无居民海岛</td></tr>
  </tbody>
</table>
</div>

## 五、城镇村及工矿用地（表 2.2）

城乡居民点、独立居民点以及居民点以外的工矿、国防、名胜古迹等企事业单位用地，在统计时另按下表归并（城镇、村庄内部尚未建设的土地，按表 2.1 调查地类后分别纳入所在的城市、建制镇、村庄用地统计）：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>名称</th></tr>
  </thead>
  <tbody>
    <tr><td><code>20</code></td><td>城镇村及工矿用地</td></tr>
    <tr><td><code>201</code></td><td>城市用地</td></tr>
    <tr><td><code>202</code></td><td>建制镇用地</td></tr>
    <tr><td><code>203</code></td><td>村庄用地</td></tr>
    <tr><td><code>204</code></td><td>采矿及盐田用地</td></tr>
    <tr><td><code>205</code></td><td>风景名胜及特殊用地</td></tr>
  </tbody>
</table>
</div>

注意这里的 `20` 与表 2.1 的 `20 交通运输用海` 是两套表，不要混用。

## 六、地下空间用途（表 2.3）

地下空间直接在表 2.1 的代码前加 **`UG`**、去掉「用地」二字表示用途，例如地下的城市轨道交通写作 `UG1206 城市轨道交通`。表 2.1 中没有的地下用途，用下表补充：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>名称</th></tr>
  </thead>
  <tbody>
    <tr><td><code>UG12</code></td><td>地下交通运输设施</td></tr>
    <tr><td><code>UG1210</code></td><td>地下人行通道</td></tr>
    <tr><td><code>UG13</code></td><td>地下公用设施</td></tr>
    <tr><td><code>UG1314</code></td><td>地下市政管线</td></tr>
    <tr><td><code>UG1315</code></td><td>地下市政管廊</td></tr>
    <tr><td><code>UG25</code></td><td>地下人民防空设施</td></tr>
    <tr><td><code>UG26</code></td><td>其他地下设施</td></tr>
  </tbody>
</table>
</div>

## 七、和《土地管理法》「三大类」的对应（附录 C）

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>三大类</th><th>包括的用地用海分类</th></tr>
  </thead>
  <tbody>
    <tr><td>农用地</td><td>01 耕地、02 园地、03 林地、04 草地、06 农业设施建设用地（均含全部二级类）；05 湿地中的 0501 森林沼泽、0502 灌丛沼泽、0503 沼泽草地、0507 红树林地；17 陆地水域中的 1703 水库水面、1704 坑塘水面、1705 沟渠；23 其他土地中的 2302 田坎</td></tr>
    <tr><td>建设用地</td><td>城镇村及工矿用地（见第五节）；12 交通运输用地中的 1201 铁路用地、1202 公路用地、1203 机场用地、1204 港口码头用地、1205 管道运输用地、1206 城市轨道交通用地；13 公用设施用地中的 1311 水工设施用地</td></tr>
    <tr><td>未利用地</td><td>上述之外的其他陆域地类</td></tr>
  </tbody>
</table>
</div>

> 注：附录 C 原表中「23 其他土地」下列的是「2302 田坎」，而表 2.1 中田坎的代码为 `2303`、`2302` 为后备耕地。本页照录原表，实际使用请以表 2.1 的代码为准并关注主管部门的勘误说明。

## 八、和湿地保护法的对应（附录 D）

《湿地保护法》界定的湿地包括：**05 湿地的全部 7 个二级类**，17 陆地水域中的 1701 河流水面、1702 湖泊水面、1703 水库水面、1704 坑塘水面（不含养殖坑塘）、1705 沟渠，以及浅海水域（低潮时水深不超过 6 米的永久性水域）。水田以及用于养殖的人工水域和滩涂不算湿地。

## 常见问题 FAQ

<details>
<summary>Q: 用地用海分类和 GB/T 21010《土地利用现状分类》是什么关系？</summary>

用地用海分类整合了土地利用现状分类、城乡用地分类和海域使用分类，现在国土调查、国土空间规划和用途管制都以它为准。GB/T 21010—2017 仍是现行国家标准，第三次全国国土调查的工作分类就是在它基础上制定的，二者的对应关系见指南附录 F。原文可在[土地利用现状分类（GB/T 21010—2017）](/downloads/gbt-21010-2017)下载。

</details>

<details>
<summary>Q: 2023 正式版和 2020 试行版有什么区别？</summary>

正式版根据三年试行情况和调查监测、「三区三线」划定、耕地保护、用地用海审批等管理需要做了修订，对部分地类进行了增补和调整（二级类由试行版的 106 个调整为 113 个）。注意两版统计三级类的口径不同，不能直接拿数量比较；已按试行版编制的成果，请对照正式版逐类核对代码。

</details>

<details>
<summary>Q: 规划图里应该用到几级类？</summary>

国土空间总体规划原则上以一级类为主，可细分至二级类；详细规划和市县层级涉及空间利用的专项规划，原则上使用二级类和三级类。

</details>

<details>
<summary>Q: 可以自己往下细分代码吗？</summary>

可以。指南 2.4 节允许根据实际需要制定实施细则，在现有分类基础上续分，但续分的类别代码和名称要符合指南的细分规定，并不得与已有代码冲突。

</details>

<details>
<summary>Q: 「留白用地」是什么意思？</summary>

指国土空间规划确定的城镇、村庄范围内，暂未明确规划用途、规划期内不开发或特定条件下开发的用地，代码 `16`，没有下级类。

</details>

## 九、来源与延伸

- 原文：自然资源部《国土空间调查、规划、用途管制用地用海分类指南》（自然资发〔2023〕234 号），[中国政府网发布页](https://www.gov.cn/zhengce/zhengceku/202311/content_6917279.htm)。本页表格由正式文本逐条抽取整理，含义文字照录附录 A；如有出入，以原文为准。
- 相关标准：[第三次全国国土调查技术规程（TD/T 1055—2019）](/downloads/tdt-1055-2019)、[土地利用现状分类（GB/T 21010—2017）](/downloads/gbt-21010-2017)。
- 各地国土空间总体规划文本与图集，可在[资料下载](/downloads)中按城市检索。

## 地理编码速查系列

- [行政区划代码全表](/learn/china-admin-division-codes)
- [身份证前六位地区码对照](/learn/id-card-region-codes)
- [34 个省级行政区一览](/learn/china-provinces-overview)
- [全国车牌代码对照表](/learn/china-license-plate-codes)
- [全国电话区号表](/learn/china-telephone-area-codes)
- [全国机场三字码 / 四字码](/learn/china-airport-codes)
- [世界国家和地区代码（ISO 3166）](/learn/iso-3166-country-codes)
- [中国常用坐标系 EPSG 代码](/learn/china-epsg-codes)
- [高斯-克吕格分带带号对照](/learn/gauss-kruger-zone-table)
- [河流国标码](/learn/china-river-codes)
