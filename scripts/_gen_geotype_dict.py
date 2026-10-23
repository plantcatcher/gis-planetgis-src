#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成 geotype 应用作用域词典 -> scripts/i18n-maps-src/apps/geotype.json

geotype 的主要内容（题库 / 人格 / 洞察）走源码级英化（data/content.en.js），
本词典只补静态 HTML 里引擎能覆盖的部分：
  · footer 说明文字与「热门城市」标签
  · footer 10 个热门城市的中文名（页面本身是中文内容页，链接文本给出英文名便于识别）
城市英文名优先取 public/shared/cities.js 的 nameEn（权威来源），缺失的手写。
"""
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CITIES = os.path.join(ROOT, 'public', 'shared', 'cities.js')
OUT = os.path.join(ROOT, 'scripts', 'i18n-maps-src', 'apps', 'geotype.json')

exact = {}
sub = {}

# ── 城市英文名：从 shared/cities.js 的 geoquiz 段取 nameEn ──
t = io.open(CITIES, encoding='utf-8').read()
i = t.find('"geoquiz": [')
seg = t[i:t.find('"geotype": [')] if '"geotype": [' in t else t[i:]
pairs = re.findall(r'"name":\s*"([^"]+)"[^}]*?"nameEn":\s*"([^"]+)"', seg)
city_en = dict(pairs)
print('shared/cities.js nameEn pairs:', len(city_en))

# geotype footer 的 10 个热门城市
FOOTER_CITIES = ['北京', '上海', '深圳', '广州', '成都', '杭州', '重庆', '拉萨', '三亚', '台北']
# 缺失项手写（geoquiz 段未收录）
MANUAL_CITY = {
    '杭州': 'Hangzhou', '重庆': 'Chongqing', '拉萨': 'Lhasa', '三亚': 'Sanya',
    '台北': 'Taipei', '北京': 'Beijing', '上海': 'Shanghai', '深圳': 'Shenzhen',
    '广州': 'Guangzhou', '成都': 'Chengdu',
}

for c in FOOTER_CITIES:
    en = city_en.get(c) or MANUAL_CITY.get(c)
    if not en:
        raise SystemExit('FATAL: 缺城市英文名: ' + c)
    exact[c] = en

# ── footer 文案 ──
FOOTER = {
    '我的地球人格 Geo Personality · 通过地理环境与个人偏好，探索你属于哪一种地球居民':
        'My Geo Personality · Explore which kind of earth dweller you are, through geography and personal preference',
    '热门城市：': 'Popular cities: ',
    '热门城市': 'Popular cities',
}
for zh, en in FOOTER.items():
    exact[zh] = en

# ── 其他静态文案（index.html 里引擎可见的中文）──
EXTRA = {
    '城市居民': ' resident',
    '契合': 'Match',
    '隐藏标签': 'Hidden tag',
    '未选择': 'Not selected',
    '海洋影响强': 'Strong marine influence',
    '城市化': 'Urbanization',
    '在上一页选择生活地，即可在此查看它的地理坐标。':
        'Choose your home base on the previous page to see its coordinates here.',
    '我的属性': 'My Attributes',
    '地理人格 × 职业': 'Geo Personality × Career',
    '地理档案': 'Geographic Profile',
    '人格描述': 'Personality Description',
    '地理人格 × 生活方式': 'Geo Personality × Lifestyle',
    '推荐城市': 'Recommended Cities',
    '与你相似': 'Similar to you',
    '互补反差': 'Complementary contrast',
    '该去旅行': 'Worth a trip',
    '你的最佳拍档': 'Your Best Matches',
    '你的地理底色': 'Your Geographic Base',
    '你的生活地坐标': 'Your Home Base Coordinates',
    '生成地球人格卡': 'Generate Personality Card',
    '重新测试': 'Retake the Test',
    '发现你的地球人格': 'Discover Your Geo Personality',
    '20 个问题，找到属于你的地球身份': '20 questions to find the earth identity that is yours',
    '开始测试': 'Start the Test',
    '你生活时间最长的地方是？': 'Where have you lived the longest?',
    '生成我的地球人格': 'Generate My Geo Personality',
    '上一题': 'Previous Question',
    '偏好题': ' · Preference question',
    '本能题': ' · Instinct question',
    '地图加载中…': 'Loading map…',
    '正在识别位置…': 'Locating…',
    '地图数据 © 天地图 GS(2023)1312号 · 含完整国界与南海诸岛':
        'Map data © Tianditu GS(2023)1312 — full national boundaries and South China Sea islands included',
    '点地图或输入，如 深圳 / 东京 / 拉萨': 'Tap the map or type, e.g. Shenzhen / Tokyo / Lhasa',
    '在地图上点出 ': 'Tap ',
    '，或直接在下方输入城市': ' on the map, or type a city below',
}
for zh, en in EXTRA.items():
    exact.setdefault(zh, en)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({'exact': exact, 'sub': sub}, open(OUT, 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('geotype dict: %d exact + %d sub -> %s' % (len(exact), len(sub), OUT))
