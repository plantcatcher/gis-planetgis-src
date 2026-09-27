---
title: 海平面上升模拟：日本全境会被淹没多少？
slug: aba8fa7f
date: 2026-03-12
category: 海平面模拟
subject: 自然地理
tags: 海平面上升, 海平面模拟, 中国, 地图, 日本
cover: https://blogphoto.planetgis.cn/PicGo/2026-03-12-78cf79b6efa8d634fc7ce35ab9238137-sz_607084.png
summary: 当我们谈论全球变暖、海平面上升，很多人只觉得是遥远的未来议题。可如果把海平面上升的数值，叠在日本真实的地形与人口分布上，画面会瞬间变得无比直观。作为一个多山、多沿海平原、人口高度集中在湾区的岛国，日本对海平面变化格外敏感。
link: https://blog.planetgis.cn/archives/aba8fa7f.html
---

当我们谈论全球变暖、海平面上升，很多人只觉得是遥远的未来议题。可如果把海平面上升的数值，叠在日本真实的地形与人口分布上，画面会瞬间变得无比直观。作为一个多山、多沿海平原、人口高度集中在湾区的岛国，日本对海平面变化格外敏感。

海水每上涨一米，都在改写海岸线；上涨几十米，足以重塑整个国家的地理轮廓。这不是灾难片桥段，而是基于真实海拔数据的推演 ——**海平面上升，日本究竟会面临什么？**

---

## **一、日本沉没？**

早在前些年，有一本科幻小说很火爆，叫**《日本沉没》**。

![日本沉没](https://blogphoto.planetgis.cn/PicGo/2026-03-12-b3379a199e64b2fedc4b1e12c2afc910-sz_91493.png)

**我国著名科幻小说家刘慈欣就曾坦言：**

>  *“日本科幻对我的影响很大。具体到《三体》，其实受了《日本沉没》巨大的影响。我看《日本沉没》后很震惊，一部科幻作品竟然能把一个民族深处最敏感、脆弱的对未来的恐惧感体现出来，我就想写一部中国的《日本沉没》。”*

但科学研究表明，日本所处板块呈上升趋势，所以所谓“日本沉没”，不太可能是板块下沉。

![亚洲板块](https://blogphoto.planetgis.cn/PicGo/2026-03-12-d519a9f90c0fa68e1ec590e0a50e2d20-sz_22856.jpeg)

还可能是什么呢？地震引发海啸，淹没沿海城市；海平面上升，淹没日本大陆。

在查阅资料过程中，收集到日本大地震（2011年3月11日 ）的震级数据，我将其制成了专题图（如下）。

![2011年日本大地震局部](https://blogphoto.planetgis.cn/PicGo/2026-03-12-69914ae6720f1a8407b7075940052ee9-sz_6142912.png)

随后，找到**“活火山”**分布数据，也做成了专题图。

![日本活火山](https://blogphoto.planetgis.cn/PicGo/2026-03-12-6e11b18003790c636ddace5dacc21c1f-sz_414549.png)

在国外GIS资料库中，我还找到了很多日本人制作的地理数据（如下），不得不说，“达摩克利斯之剑”一直困扰着日本。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-12-d44021eef64d3b4444a52c0896a84131-sz_28879.png)

为了满足好奇心，我对 日本区域 海平面上升模拟。下面就是我模拟的 成果图 与 内容分析。

## **二、海平面上升模拟**

我会先展示一幅效果图，进行分析；针对部分区域进行放大处理，并海平面效果叠加分析。

## **1.当海平面上升0米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-757852ce7f8cc468c2a3a00326c414d4-sz_7668806.png)

这是日常地图看到的效果，我将海水的透明度调低，大家应该可以隐约看到海底的地形地貌特征。

## **2.当海平面上升10米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-6f13e816cc9f64e04bc956d906b4b41d-sz_7691325.png)

当海平面上升10米，似乎没什么变化？放大几个区域看看。首先，观察关东平原。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-12-7d6b99c2421f4e21bb82836375da2768-sz_80224.jpeg)

（该图来源于网络）

关东平原，地势平坦，海水较容易漫延。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-2aa628e9e6f2af08b849d227a3b32055-sz_686133.png)

上升10米，海水从东京湾、茨城县（东南沿海） 漫延至内陆，且两股海水即将汇合。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-1fdf3a82dd360b43ff9b55a36902e08a-sz_1009828.png)

大阪区域，大阪城区被淹没，海水沿着 **淀川** 倒灌，即将进入京都盆地。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-49481b7d8882a15cd762f49f20596301-sz_856674.png)

北海道札幌区域，札幌中心城区差点被淹没，沿海的石狩市受灾严重。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-6e777653b3d5ebca70d2b0377953d5eb-sz_585933.png)

九州区域，西侧受灾比东侧严重。熊本、长崎、佐贺均有不同程度受灾，其中佐贺市淹没较为严重。

## **3.当海平面上升20米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-565adde68453295283c248799eceba31-sz_7706533.png)

当海平面上升20米，被淹没区域的范围进一步扩大，下面看 京都 和 差点被遗忘的名古屋。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-9bdf2c1259bd851a1ea92da6e77ea8f6-sz_1055198.png)

当上升10米时，名古屋淹没区域已经大于大阪；当上升20米时，受限于地形外扩幅度不大。而京都方面，海水穿过 丹波高地 和 生驹山地 之间的空隙，进入京都盆地，开始往京都中心漫延。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-12-b851d7317bf0aee0ec2d03d59b3dcaa1-sz_1828471.png)

（该图来源于网络）

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-15d3170f370a7cfe3a895b587bb97c80-sz_829624.png)

札幌区域，海水从南北两侧向中部延伸，即将把北海道分成两部分。

## **4.当海平面上升50米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-c4e50ed23f576cb942c9b68f8c501abb-sz_7713744.png)

我们接着先观察 东京平原。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-5d06d31d9af7d679cf6892f0207217b7-sz_995618.png)

海水一路向北，在足尾山地分成两股，往西冲向高崎市，往东北冲向宇都宫市。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-fb57a3b85e5d2ff6c0e617578ada8d0e-sz_900893.png)

当海平面上升50米，海水从福冈和久米留市两个方向出发，在中部将 九州本土 分成两部分。

## **5.当海平面上升100米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-e06b14afefd4fc8217aab336dcb2f494-sz_7715596.png)

关东地区、关西地区、九州和北海道札幌的淹没范围扩大；此时，让我们把目光放到下地方：秋田和仙台。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-83cc52a78c068eed0c665f049d29aaf0-sz_989756.png)

当海平面上升100米，海水分别从秋田和仙台开始，往内陆漫延，但此时并没有汇合。

接下来....我国辽宁省地区？

![辽宁模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-6f653bbe92e8cc58263925819422eb83-sz_815924.png)

关于辽宁，有单独模拟，感兴趣可以跳转查看：

## **6.当海平面上升200米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-8e358886e021509f758a9560385f61c4-sz_7705412.png)

这个高度就不进行分析了，直接放 局部地图 自己查看即可。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-7641969759cf3e79dbc39572649439f3-sz_439272.png)

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-aa975eeaf0effe0f641eb0a54aa56c07-sz_696525.png)

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-d992dd466edff8b8fdc21e44126f9a1e-sz_628256.png)

另外，再放一版朝鲜半岛（上涨200米）的局部图。

![朝鲜模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-23ff9a159cdbb38e766a1fdcbd36387d-sz_546693.png)

## **7.当海平面上升500米**

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-18eab34cf0d2a92dad47a212d41c51b6-sz_7566098.png)

同样，看效果图。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-f0bb2ce76cd79e12ad4b67675b22a22a-sz_438105.png)

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-b019f204bbc9b94c556a9eb0aaa4578b-sz_467687.png)

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-78cf79b6efa8d634fc7ce35ab9238137-sz_607084.png)

接着，放朝鲜半岛。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-26b9403c1ce2d13d564aa4aba9b78201-sz_477621.png)

最后，看看富士山（海拔3777米）。

![日本模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-25bfe1717d52e527446c3403f88e6b2b-sz_850206.png)

## **8.当海平面上升500米（中国）**

大家也许会好奇，中国区域此时会如何？没错，我也进行了模拟，效果如下所示。

![中国模拟图](https://blogphoto.planetgis.cn/PicGo/2026-03-12-57ec830d7d7694fbba199d73c720b310-sz_7579224.png)

比较有意思的是，海水从长江倒灌，进入四川盆地。（另外，图中东北角数据有误，请见谅）。

想看海平面上升200米的效果，可跳转查看：[海平面上升 200 米，中国会变成什么样？淹没范围全景模拟](http://blog.planetgis.cn/archives/fcf5b7c7.html)

## **三、总结**

*“日本的国土约有四分之三为山体所覆盖。本州中部地区被称为“日本屋脊”，许多山脉的海拔超过3000米。**位于山梨县和静冈县的交界处的富士山，海拔3776米，是日本海拔最高的山。山梨县境内的北岳，海拔3193米，是日本的第二大高峰。位于长野县和岐阜县境内的奥穗高岳海拔3190米，横跨山梨县及静冈县的间之岳海拔同为3190米，并列成为第三高峰。”*

所以，日本虽为岛国，但地理条件并不差，也并非我们所想的海拔很低、容易被海啸吞没。
