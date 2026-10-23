#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成 geoshape 应用作用域词典 -> scripts/i18n-maps-src/apps/geoshape.json

数据来源：public/games/geoshape/assets/index-x0NFrfXw.js（自带 name / name_zh / name_en）
策略：
  · 国名 / 省名 / 城市名 / 邻国名：直接从 bundle 提取 name_zh -> name 配对（240+64 条）
  · 界面文案：scripts/i18n-games-src/geoshape_ui.py（唯一手写来源）
  · 模板串与结果页文案：本文件 MANUAL 表
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts', 'i18n-games-src'))
from geoshape_ui import UI as GEOSHAPE_UI  # noqa: E402

BUNDLE = os.path.join(ROOT, 'public', 'games', 'geoshape', 'assets', 'index-x0NFrfXw.js')
OUT = os.path.join(ROOT, 'scripts', 'i18n-maps-src', 'apps', 'geoshape.json')

t = open(BUNDLE, encoding='utf-8').read()

exact = {}
sub = {}


def put(k, v):
    if k and k not in exact:
        exact[k] = v


# ── 1. 国家：{id:"AF",name:"Afghanistan",name_zh:"阿富汗",...} ──
# 对象里 name 在 name_zh 之前；但也可能有 name_en。用「整块对象」匹配最稳。
country_objs = re.findall(r'\{id:"[A-Z]{2,3}",name:"[^"]*",name_zh:"[^"]*"[^}]*?\}', t)
zh2en = {}
for o in country_objs:
    n = re.search(r'\bname:"([^"]+)"', o)
    z = re.search(r'name_zh:"([^"]+)"', o)
    if n and z:
        zh2en[z.group(1)] = n.group(1)

# ── 2. 省份 / 城市：{id:"310000",name:"Shanghai",name_zh:"上海市",name_en:"Shanghai",...} ──
pc_objs = re.findall(r'\{id:"\d+",name:"[^"]*",name_zh:"[^"]*",name_en:"[^"]*"[^}]*?\}', t)
zh2en_pc = {}
for o in pc_objs:
    n = re.search(r'name_en:"([^"]+)"', o)
    z = re.search(r'name_zh:"([^"]+)"', o)
    if n and z:
        zh2en_pc[z.group(1)] = n.group(1)

# ── 3. 大洲：const I9=[{id:"Asia",zh:"亚洲"},{id:"Europe",zh:"欧洲"},...] ──
cont_objs = re.findall(r'\{id:"([^"]+)",zh:"([^"]+)"\}', t)
for cid, czh in cont_objs:
    if cid in ('Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'):
        put(czh, cid)

# ── 4. 邻国：{name:"Tajikistan",name_zh:"塔吉克斯坦"} ──
nb_objs = re.findall(r'\{name:"[^"]+",name_zh:"[^"]+"\}', t)
zh2en_nb = {}
for o in nb_objs:
    n = re.search(r'name:"([^"]+)"', o)
    z = re.search(r'name_zh:"([^"]+)"', o)
    if n and z:
        zh2en_nb[z.group(1)] = n.group(1)

for k, v in zh2en.items():
    put(k, v)
for k, v in zh2en_pc.items():
    put(k, v)
for k, v in zh2en_nb.items():
    put(k, v)

# 简称（省名短名，如「云南」「广东」）→ 从省名全称派生
for full, en in zh2en_pc.items():
    short = re.sub(r'(省|市|自治区|特别行政区|壮族|回族|维吾尔|)$', '', full)
    # 「内蒙古自治区」-> 「内蒙古」；「广西壮族自治区」-> 「广西」
    for suf in ('壮族自治区', '回族自治区', '维吾尔自治区', '自治区', '特别行政区', '省', '市'):
        if short.endswith(suf):
            short = short[: -len(suf)]
            break
    if short and short != full:
        put(short, en)

# ── 4. 模板串与 UI 文案（手写）──
MANUAL = {
    # 题干（模板拼接后的完整形态）
    '选出正确的国家': 'Select the correct country',
    '选出正确的省份': 'Select the correct province',
    '选出正确的城市': 'Select the correct city',
    # footer / 设置弹窗
    'GeoShape · 看国家轮廓猜国家': 'GeoShape · Guess Countries by Outline',
    '看国家轮廓，猜出它的名字': 'Guess the country from its outline',
    '星球小捕手 出品': 'by Planet Catcher',
    '🔊 音效': '🔊 Sound Effects',
    '🎵 背景音乐': '🎵 Background Music',
    '音效': 'Sound Effects',
    '背景音乐': 'Background Music',
    '显示名称': 'Show Names',
    # 题干前缀的子串形态（用于元素内拼接时下沉）
    '中国省份 · ': 'Chinese Provinces · ',
    '中国城市 · ': 'Chinese Cities · ',
    # 结果页 / 分享文案
    '来挑战你的最高分 👉': 'Come and beat your high score 👉',
    '答题记录': 'Quiz History',
    '答对 · 正确率': ' correct · accuracy ',
    '得分': 'Score',
    '天连胜': '-day streak',
    # 百科页
    'GeoShape 国家百科': 'GeoShape Country Encyclopedia',
    '· 首都': ' · Capital',
    '邻国': 'Neighbors',
    '位于': 'Located in the ',
    '的': ' ',
    # 模式
    '经典模式': 'Classic Mode',
    '每日挑战': 'Daily Challenge',
    '按大洲挑战': 'Challenge by Continent',
    '中国省份': 'Chinese Provinces',
    '中国城市': 'Chinese Cities',
    '随机挑战': 'Random Challenge',
    # 其他
    '个国家': ' countries',
    '个省份': ' provinces',
    '个城市': ' cities',
    '首都': 'Capital',
    '面积': 'Area',
    '人口': 'Population',
    '邻国': 'Neighbors',
    '所属大洲': 'Continent',
    '简介': 'Overview',
    '收起': 'Collapse',
    '展开': 'Expand',
    '返回': 'Back',
    '继续': 'Continue',
    '再玩一次': 'Play Again',
    '查看答案': 'Show Answer',
    '正确答案': 'Correct Answer',
    '答错': 'Wrong',
    '答对': 'Correct',
    '本局': 'This round',
    '历史最佳': 'Personal Best',
    '分钟': ' min',
    '小时': ' h',
    '分': ' min',
    '秒': ' s',
    '查看全部国家': 'View All Countries',
    '搜索国家': 'Search countries',
    '搜索': 'Search',
    '没有找到': 'Not found',
    '加载中': 'Loading',
    '加载中…': 'Loading…',
    '拼写错误': 'Misspelled',
    '通关': 'Completed',
    '你答对了': 'You got right',
    '个': '',
    '第': 'No.',
    '题': '',
    '位置': 'Position',
    '排名': 'Rank',
    '分数': 'Score',
    '用时': 'Time',
    '提示': 'Hint',
    '查看提示': 'Show Hint',
    '已使用': 'Used',
    '次': ' times',
}
for k, v in MANUAL.items():
    put(k, v)

# ── 5. sub（运行时拼接片段，键用原文）──
SUBS = {
    '选出正确的': 'Select the correct ',   # 兜底（kind 未知时）
    '中国省级行政区': 'Chinese Provincial-Level Division',
    '中国城市': 'Chinese City',
    ' · ': ' · ',
}
for k, v in SUBS.items():
    if k not in sub:
        sub[k] = v

# ── 6. 写入：界面文案表 + 增量保留已有文件里的条目 ──
for k, v in GEOSHAPE_UI.items():
    put(k, v)

if os.path.exists(OUT):
    try:
        old = json.load(open(OUT, encoding='utf-8'))
        for k, v in (old.get('exact') or {}).items():
            put(k, v)
        for k, v in (old.get('sub') or {}).items():
            if k and k not in sub:
                sub[k] = v
    except Exception:
        pass

# ── 7. 清理：sub 键若与 exact 同名且译文一致，去重（避免无谓开销）──
for k in list(sub):
    if k in exact and exact[k] == sub[k]:
        del sub[k]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({'exact': exact, 'sub': sub}, open(OUT, 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('geoshape dict: %d exact + %d sub -> %s' % (len(exact), len(sub), OUT))
print('  countries/provinces/cities/neighbors from bundle: %d + %d + %d'
      % (len(zh2en), len(zh2en_pc), len(zh2en_nb)))
