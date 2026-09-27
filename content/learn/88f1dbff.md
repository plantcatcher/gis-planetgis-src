---
title: 水面上升模拟：假如湖北重现古代云梦泽
slug: 88f1dbff
date: 2026-03-17
category: 海平面模拟
subject: 自然地理
tags: 海平面上升, 海平面模拟, 中国, 地图, 湖北
cover: https://blogphoto.planetgis.cn/PicGo/2026-03-17-a7dc0050230bf0edade8fa68b8a65206-sz_1263845.png
summary: 本文基于 DEM 高程数据与江汉平原地形，模拟湖北水面逐步抬升，动态复原古代云梦泽的水域范围与形态。通过分阶段水位推演，直观呈现从零星湖群到连片大泽的演变过程，对照历史文献与考古研究，还原 “气蒸云梦泽” 的地理原貌，同时探讨这一设想的工程…
link: https://blog.planetgis.cn/archives/88f1dbff.html
---

本文基于 DEM 高程数据与江汉平原地形，**模拟湖北水面逐步抬升**，动态复原古代云梦泽的水域范围与形态。通过分阶段水位推演，直观呈现从零星湖群到连片大泽的演变过程，对照历史文献与考古研究，还原 “气蒸云梦泽” 的地理原貌，同时探讨这一设想的工程边界、生态意义与现实启示，带你用科技视角看见荆楚大地的沧海桑田。

---

## **一、云梦泽**

![云梦泽](https://blogphoto.planetgis.cn/PicGo/2026-03-17-25e97beb7b50ce4312250bad173aad2d-sz_910991.png)

据《左传》记载，先秦时期楚国有一块名为“云梦”的楚王狩猎区。而 **云梦泽（Yun-meng Lakes）**，则是中国湖北省江汉平原上的古代湖泊群的总称。

![云梦泽](https://blogphoto.planetgis.cn/PicGo/2026-03-17-411075dd4cc0510b3f81ef38b1df879a-sz_228847.jpeg)

先秦时这一湖群的范围周长约450公里。后因长江和汉水带来的泥沙不断沉积，云梦泽范围逐渐减小。魏晋南北朝时期已缩小一半，唐宋时解体为星罗棋布的小湖群。

**《望洞庭湖赠张丞相》**

唐·孟浩然

*八月湖水平，涵虚混太清。*

*气蒸云梦泽，波撼岳阳城。*

*欲济无舟楫，端居耻圣明。*

*坐观垂钓者，徒有羡鱼情。*

![云梦泽地形图](https://blogphoto.planetgis.cn/PicGo/2026-03-17-a7dc0050230bf0edade8fa68b8a65206-sz_1263845.png)

可惜，云梦泽古代湖泊群，已消褪为一些相互分离的湖泊。

![云梦泽地形图](https://blogphoto.planetgis.cn/PicGo/2026-03-17-c1c50fc0e33d16d7a87243d076002465-sz_2164826.png)

如今，江汉平原分布着大大小小的城市。南部的洞庭湖附近，也是多了许多城镇。

## **二、水面上升模拟**

翻阅文献，可以看到云梦泽的演化过程，泥沙堆积渐渐地将湖泊填满，“沧海”变为桑田。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-17-a2a9fcaac35fc337bb60ab23a241dfa0-sz_858334.png)

本次模拟存在不少困难。因为云梦泽之所以消失，是因为泥沙堆积，将低洼地带填平，当前该地地形正是填平后的效果。而模拟水面上升，恰是基于当下的高程地形DEM数据。

![云梦泽地形图](https://blogphoto.planetgis.cn/PicGo/2026-03-17-d9383da488694f2df8be88d64b97e58d-sz_1325804.png)

因此，我仅能模拟将长江截断，以蓄水的过程将 江汉平原 的水位抬升。*（备注：此处的“蓄水”是在海拔20米的基础上向上增加水位。例如：蓄水5米=海拔25米）。*

## **1.蓄水5米**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-2227acace315f6fed6b8c00767bdfc9f-sz_7294732.png)

蓄水5米（海拔25米），此时，河水从长江漫延至周边低洼地带。长江沿岸的五湖、沉湖、鲁湖、斧头湖，乃至梁子湖均被河水淹没。

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-ee4a6bfc1d449bdec4ed3573dccc2628-sz_542116.gif)

经查询，梁子湖附近海拔在20米左右。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-17-5d27c352a26d297785845afc30db0068-sz_704836.png)

【声明：仅作地理模拟研究，无任何不良引导】

**2.蓄水8米**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-2a3b3cac8506e800d90da033893be652-sz_7353738.png)

蓄水8米（海拔28米），淹没范围进一步扩大。汉江与长江中部平原，被河水大面积淹没，河水直逼荆州市城区。

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-762585554bd24aeff1c435fcec453177-sz_478284.gif)

## **3.蓄水10米**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-c0d22ea3899e7dd2d3d53c9ff9329d33-sz_7340101.png)

蓄水10米（海拔30米左右），荆州市、益阳市部分区域，开始被河水淹没。两地的海拔高度如下所示（均为城区随机坐标）。

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-17-bc6533f9cebc6d9ad134ee23be8d55dc-sz_492505.png)

![img](https://blogphoto.planetgis.cn/PicGo/2026-03-17-55403c5844b83d165c97dfdd67727f99-sz_642611.png)

## **4.蓄水12米**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-91a973ad4070c262053d9e340d4bbe06-sz_7344681.png)

蓄水12米（海拔32米），平原东部区域仅剩部分山峰裸露地表。如下图红色圆圈，大家都知道是什么地方吗？

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-d64ef5a64f27bf03d2b2c144873e5d9a-sz_732915.png)

## **5.蓄水15米**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-7465a9ceb087ba8d676060718c24bb1e-sz_7310975.png)

首先，观察江汉平原西部区域。河水淹没荆州，开始朝着长江、汉江上游漫延。

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-00fb70b16b52984ce0e019b6034c0c71-sz_409409.png)

而南部，洞庭湖区域。河水漫过洞庭湖，开始朝着四面八方的河流，如澧水、沅江、资水、湘江等进行倒灌。

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-3140fd2f7d03e961de8ef84f70b64ce9-sz_514245.png)

蓄水到这个高度，已经有些夸张了，其淹没范围已经超出了古代云梦泽的范围，也大大超过了洞庭湖巅峰时期的水域范围。

## **6.蓄水动态过程**

![洪水模拟](https://blogphoto.planetgis.cn/PicGo/2026-03-17-b0b95cee06840c1720e196f1e662ab46-sz_1897144.gif)

这就是本次模拟的动态效果图。至此，水面上升模拟结束。效果仅供参考，且无任何不良引导。**大家觉得蓄水多少米，比较像古云梦泽？**

## **三、总结**

本文基于高程DEM数据，利用ArcGIS等软件，对江汉平原及其附近区域，进行水面上升模拟。其目的是尝试利用电脑模拟，“复原”古代云梦泽。再次声明：效果仅供参考，且无任何不良引导。
