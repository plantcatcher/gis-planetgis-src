---
slug: java-shishi-biancheng
title: Java实时编程（Real-Time Java Programming: With Java RTS）
summary: 面向开发者和架构师的 Java RTS 权威指南，原书由 Eric J. Bruno 与 Greg Bollella 合著（Sun 公司 Java 标准过程前组长和华尔街实时系统顶级开发者），机械工业出版社 2010 年 1 月简体中文版（田思源 译）。本书分三大部分介绍 Java RTS 的概念、高级 API 与案例研究，并讨论实时垃圾回收器内部机制、证券交易系统等典型应用。
date: 2026-09-04
cover: /shots/java-shishi-biancheng/cover.jpg
category: 计算机与编程
tags: Java实时编程, Java RTS, Eric Bruno, Greg Bollella, 机械工业出版社, Sun公司, 实时系统, RTSJ, 实时垃圾回收, 证券交易系统
access: gated
trigger: java-shishi-biancheng
keywordAliases: Java实时编程, JavaRTS
code: NSH-C-002
download: https://downloads.planetgis.cn/book/java-shishi-biancheng.pdf
format: PDF
size: 33.8 MB
author: [美] Eric J. Bruno、Greg Bollella 著；田思源 译
publisher: 机械工业出版社
pubYear: 2010
isbn: 9787111292821
---

> 《Java 实时编程》（原书名 *Real-Time Java Programming: With Java RTS*）由**〔美〕Eric J. Bruno** 与 **Greg Bollella** 合著、**田思源** 译，**机械工业出版社 2010 年 1 月第 1 版第 1 次印刷**（ISBN **978-7-111-29282-1**，186mm×240mm，**18 印张**，定价 **49.00 元**），列入"**Sun 公司核心技术丛书**"。原书由 Pearson Education 于 2009 年出版，英文原版 ISBN 978-0-13-714298-9；作者之一 Greg Bollella 是实时 Java 标准（RTSJ）的提出者之一，曾任 Sun 公司 Java 标准过程前组长。

本书适合 Java 程序开发人员、实时软件开发人员，以及使用 Java RTS 编程的人员阅读，也可供高等院校老师和学生参考。书中从概念入手，对比高性能系统和高吞吐系统，逐步深入 Java RTS 的 API、线程/调度/新内存模型、异步事件与控制转移、实时垃圾回收器内部机制、证券交易系统等真实案例研究。

## 全书目录

**第一部分 实时计算概念**

- **第 1 章** 实时入门：实时系统的全面定义，与高性能系统和高吞吐量系统的比较；可预测性、抖动、延迟和确定性；实时调度的高层次讨论。
- **第 2 章** 实时与 Java SE：在实时环境中使用标准 Java 的问题（垃圾回收器执行、即时编译器等）；Java SE 6/7 中的垃圾回收算法。
- **第 3 章** Java 实时规范（RTSJ）：Greg Bollella 领导制订的 Java 在实时空间的行为规范，是第一个 Java 规范请求（JSR）。
- **第 4 章** Sun Java 实时系统：Sun 公司对实时 Java 的实现产品 Java RTS，本章帮助读者在 Solaris 或 Linux 上建立并运行一个可工作的 Java RTS 系统。

**第二部分 高级 Java RTS**

- **第 5 章** 线程、调度和新内存模型：作为第一个深入 Java RTS API 的一章，重点介绍线程模型和 RTSJ 引入的不同内存模型。
- **第 6 章** 同步：探讨 Java RTS 中的线程如何同步，及 Java 虚拟机为减少内部同步多线程访问共享资源延迟所做的改进。
- **第 7 章** 实时时钟 API：Java RTS 提供对高精度定时器和确定性定时器对象的支持，研究实时时钟 API 与确定性操作。
- **第 8 章** 异步事件：探讨可用来在实时应用中控制事件处理的类。
- **第 9 章** 异步控制转移和线程终止：探讨 Java RTS 为可调度对象从一个方法到另一个方法转移控制、终止任务提供的细粒度控制。
- **第 10 章** 实时垃圾回收器内部机制：介绍实时垃圾回收器的内部工作原理与 RTGC 的影响。

**第三部分 使用 Java RTS**

- **第 11 章** 证券交易系统：Java RTS 在交易商、投资银行和金融世界的应用案例。
- **第 12 章** 高级案例研究与开发/测试工具：进一步的案例研究与开发、测试 Java RTS 应用程序的工具。

## 本书的突出特点

- **作者权威**：由 RTSJ 规范制订核心成员与 Sun 公司前 Java 标准过程组长合著，技术深度与权威性并重。
- **案例驱动**：通过证券交易系统等真实案例展示 Java RTS 在金融、工业控制等低延迟领域的落地。
- **API 与原理并重**：从 RTSJ 规范到 Sun Java RTS 实现，再到线程/调度/内存模型的深层解读。
- **Sun 技术丛书**：列入机械工业出版社"Sun 公司核心技术丛书"，是中文世界少有的 Java 实时系统专著。

## 适用读者

本书适合**Java 开发者、实时系统架构师、金融与工业控制领域的低延迟系统工程师、高等院校计算机与软件工程专业师生**，也是准备从事嵌入式、机器人、自动驾驶、智能制造等对实时性有严苛要求的开发者参考书。

## 内页速览

<div class="shot-grid">
<img alt="封面" src="/shots/java-shishi-biancheng/cover.jpg" />
<img alt="内页 1" src="/shots/java-shishi-biancheng/p1.jpg" />
<img alt="内页 2" src="/shots/java-shishi-biancheng/p2.jpg" />
<img alt="内页 3" src="/shots/java-shishi-biancheng/p3.jpg" />
<img alt="内页 4" src="/shots/java-shishi-biancheng/p4.jpg" />
<img alt="内页 5" src="/shots/java-shishi-biancheng/p5.jpg" />
<img alt="内页 6" src="/shots/java-shishi-biancheng/p6.jpg" />
</div>