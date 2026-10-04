/* 中国高校分布地图 · 表现层配置
   数据由 scripts/build_cn_universities.py 生成：
     - provinces.json   省级普通高校总数（教育部 2023-06-15 名单，合计 2820）+ 精英院校分档
     - universities.json 院校点位（985 / 211 / 军事院校，含城市坐标） */
window.UNIV_CONFIG = {
  view: { center: [104.5, 35.5], zoom: 4.1, minZoom: 3.2, maxZoom: 9 },
  bounds: [73.0, 17.5, 135.5, 54.5],
  extent: [72, 16, 138, 56],

  /* 省级着色分档：按「普通高校总数」高低，红 > 橙 > 绿 > 蓝
     分档口径参考 giser.cloud 高校专题（150+/100-149/50-99/1-49） */
  tiers: [
    { min: 150, color: '#f56c6c', label: '150 所及以上' },
    { min: 100, color: '#e6a23c', label: '100 – 149 所' },
    { min: 50,  color: '#67c23a', label: '50 – 99 所' },
    { min: 1,   color: '#409eff', label: '1 – 49 所' },
    { min: 0,   color: '#909399', label: '暂无数据' }
  ],

  /* 院校分类：点位配色与筛选共用 */
  cats: [
    { key: 'all',  label: '全部院校', color: '#cdd6e0', desc: '所有入选院校点位' },
    { key: '985',  label: '985 工程', color: '#f56c6c', desc: '39 所，1998 年启动' },
    { key: '211',  label: '211 工程', color: '#e6a23c', desc: '116 所，含 39 所 985' },
    { key: 'mili', label: '军事院校', color: '#409eff', desc: '军队 / 武警直属院校' }
  ],

  /* 点位按「最高层级」着色：985 > 211 > 军校 > 其他 */
  rankColor: { '3': '#f56c6c', '2': '#e6a23c', '1': '#409eff', '0': '#9aa7bd' },

  hint: '点击省份看高校总数与精英院校分布；点击院校点位看详情。右下角切换院校类别。'
};
