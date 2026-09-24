// 可视化互动地图 · 数据资产登记册读取层。
//
// 设计取舍：主站是纯静态站点（Cloudflare Pages，无后端），浏览器不可能直连
// PostGIS 之类的运行时数据库。所以这里用一份 JSON 当「数据资产表」——
// 只登记每张地图的技术信息（入口、数据源、坐标系、数据文件清单、要素数），
// 供页面展示与日常审计：想知道某张地图塞了什么数据、多大，看这个文件
// 和 public/maps/ 就够了。
//
// ⚠️ 内容（标题 / 封面 / 摘要 / 介绍页）的唯一来源是 content/works/<slug>.md，
// 本文件刻意不存这些字段，避免两处维护不同步。
//
// 新增一张地图的三步：
//   1. public/maps/<slug>/      放地图源码（index.html + css/ + js/ + data/）
//   2. src/data/vizmaps.json    加一条登记（slug / entry / data 清单）
//   3. content/works/<slug>.md  写介绍页（series: map，category: 互动地图）

import registry from '@/data/vizmaps.json';

export interface VizMapDataFile {
  /** public/ 下的相对路径 */
  file: string;
  /** 要素条数，用于体积审计 */
  features: number;
  desc: string;
}

export interface VizMap {
  slug: string;
  /** 静态页面入口（iframe src） */
  entry: string;
  /** [minx, miny, maxx, maxy] */
  bbox: [number, number, number, number];
  crs: string;
  basemap: string;
  source: string;
  updated: string;
  data: VizMapDataFile[];
}

// JSON 里 bbox 是 number[]，接口上是四元组，断言需先过 unknown。
export const getVizMaps = (): VizMap[] => (registry as unknown as { maps: VizMap[] }).maps;

export const getVizMap = (slug?: string): VizMap | undefined =>
  getVizMaps().find((m) => m.slug === slug);

/** 预渲染 / 路由用：/maps/<slug> */
export const getVizMapPaths = (): string[] => getVizMaps().map((m) => `/maps/${m.slug}`);
