#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成 chinapuzzle 应用作用域词典 -> scripts/i18n-maps-src/apps/chinapuzzle.json

省名英文来源：src/i18n/labels.ts 的 PROVINCE 表（34 个省级行政区官方英文名，
西藏按中国政府官方英文译名写作 Xizang），直接解析该文件，避免两处维护。
知识卡字段：capital / gdp / feature 的**原文键从 data/chinaData.js 自动提取**，
译文在 FEATURE_EN / GDP_EN 中按原文精确对应，杜绝键值错位。
"""
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABELS = os.path.join(ROOT, 'src', 'i18n', 'labels.ts')
CHINA = os.path.join(ROOT, 'public', 'games', 'chinapuzzle', 'data', 'chinaData.js')
OUT = os.path.join(ROOT, 'scripts', 'i18n-maps-src', 'apps', 'chinapuzzle.json')

exact = {}
sub = {}


def put(k, v):
    if k and k not in exact:
        exact[k] = v


def puts(k, v):
    if k and k not in sub:
        sub[k] = v


# ── 1. 34 省英文名（解析 labels.ts 的 PROVINCE 表）──
t = io.open(LABELS, encoding='utf-8').read()
m = re.search(r'const PROVINCE[^=]*=\s*\{(.*?)\};', t, re.S)
if not m:
    raise SystemExit('FATAL: labels.ts 未找到 PROVINCE 表')
prov_en = {}
for pm in re.finditer(r'([\u4e00-\u9fff]+)\s*:\s*\'([^\']+)\'', m.group(1)):
    prov_en[pm.group(1)] = pm.group(2)
if len(prov_en) != 34:
    raise SystemExit('FATAL: PROVINCE 表应 34 条，实际 %d' % len(prov_en))
for zh, en in prov_en.items():
    put(zh, en)

# ── 2. 从 chinaData.js 提取 34 省数据原文 ──
ct = io.open(CHINA, encoding='utf-8').read()
OBJ_RE = (r'\{\s*"adcode":\s*"(\d+)",\s*"name":\s*"([^"]+)",\s*"short":\s*"([^"]+)",'
          r'\s*"abbr":\s*"([^"]+)",\s*"capital":\s*"([^"]+)",\s*"population":\s*"([^"]+)",'
          r'\s*"gdp":\s*"([^"]+)",\s*"area":\s*"([^"]+)",\s*"feature":\s*"([^"]+)"')
objs = re.findall(OBJ_RE, ct)
if len(objs) != 34:
    raise SystemExit('FATAL: chinaData.js 应 34 省，实际 %d' % len(objs))

# ── 3. 省会英文 ──
CAPITAL_EN = {
    '北京': 'Beijing', '天津': 'Tianjin', '石家庄': 'Shijiazhuang', '太原': 'Taiyuan',
    '呼和浩特': 'Hohhot', '沈阳': 'Shenyang', '长春': 'Changchun', '哈尔滨': 'Harbin',
    '上海': 'Shanghai', '南京': 'Nanjing', '杭州': 'Hangzhou', '合肥': 'Hefei',
    '福州': 'Fuzhou', '南昌': 'Nanchang', '济南': 'Jinan', '郑州': 'Zhengzhou',
    '武汉': 'Wuhan', '长沙': 'Changsha', '广州': 'Guangzhou', '南宁': 'Nanning',
    '海口': 'Haikou', '重庆': 'Chongqing', '成都': 'Chengdu', '贵阳': 'Guiyang',
    '昆明': 'Kunming', '拉萨': 'Lhasa', '西安': "Xi'an", '兰州': 'Lanzhou',
    '西宁': 'Xining', '银川': 'Yinchuan', '乌鲁木齐': 'Ürümqi', '台北': 'Taipei',
    '香港': 'Hong Kong', '澳门': 'Macao',
}

# ── 4. 经济标签英文（键 = 数据原文）──
GDP_EN = {
    '全国前列（直辖市）': "Among the Nation's Leaders (Municipality)",
    '直辖市': 'Municipality',
    '环绕京津': 'Circling Beijing and Tianjin',
    '能源大省': 'Major Energy Province',
    '能源基地': 'Energy Base',
    '老工业基地': 'Old Industrial Base',
    '汽车城': 'Motor City',
    '北大仓': 'Granary of the North',
    '经济中心': 'Economic Centre',
    '经济强省': 'Powerful Economic Province',
    '民营经济': 'Private Economy Powerhouse',
    '长三角': 'Yangtze River Delta',
    '海峡西岸': 'West Coast of the Strait',
    '红色摇篮': 'Cradle of the Revolution',
    '鱼米之乡': 'Land of Fish and Rice',
    '全国第一': 'Nationwide No. 1',
    '东盟门户': 'ASEAN Gateway',
    '自贸港': 'Free Trade Port',
    '经济大省': 'Major Economic Province',
    '中原粮仓': 'Granary of the Central Plains',
    '九省通衢': 'Crossroads of Nine Provinces',
    '天府之国': 'Land of Abundance',
    '大数据': 'Big Data Hub',
    '动植物王国': 'Kingdom of Flora and Fauna',
    '世界屋脊': 'Roof of the World',
    '古都': 'Ancient Capital',
    '丝路咽喉': 'Silk Road Chokepoint',
    '三江源': 'Headwaters of the Three Rivers',
    '塞上江南': 'Jiangnan Beyond the Great Wall',
    '西域门户': 'Gateway to the Western Regions',
    '宝岛': 'Treasure Island',
    '国际金融中心': 'International Financial Centre',
    '世界旅游中心': 'World Tourism Hub',
}

# ── 5. 省份特色英文（键 = 数据原文，逐条精确对应）──
FEATURE_EN = {
    '中华人民共和国首都，政治文化中心':
        "The capital of the People's Republic of China — its political and cultural centre",
    '北方重要港口城市，直辖市': 'A major northern port city and a municipality',
    '环抱北京、天津，地形多样': 'Surrounds Beijing and Tianjin, with varied terrain',
    '煤炭之乡，表里山河': 'A land of coal, with mountains and plains within one province',
    '横跨东北、华北、西北，草原辽阔': 'Spanning the Northeast, North and Northwest, with vast grasslands',
    '共和国工业摇篮，沿海省份': 'The cradle of Chinese industry, on the coast',
    '中国汽车城，商品粮基地': "China's motor city and a major commodity grain base",
    '祖国最东最北，大粮仓': "The easternmost and northernmost province — China's great granary",
    '国际经济、金融、贸易中心，直辖市': 'An international centre for economy, finance and trade — a municipality',
    '综合实力强，县域经济发达': 'Strong overall strength, with a developed county-level economy',
    '民营经济活跃，电商之都': 'A lively private economy and a leading e-commerce hub',
    '承东启西，科技创新崛起': 'Linking east and west, with a fast-rising tech sector',
    '著名侨乡，海峡西岸经济区': 'A famous home of overseas Chinese, on the west coast of the strait',
    '革命圣地，瓷都景德镇': 'A revolutionary holy land, and home of the porcelain capital Jingdezhen',
    '孔孟之乡，农业与工业大省': "The homeland of Confucius and Mencius, a major farming and industrial province",
    '中原腹地，人口与粮食大省': 'The heartland of the Central Plains, dense in people and grain',
    '千湖之省，九省通衢': 'A province of a thousand lakes and a crossroads of nine provinces',
    '鱼米之乡，伟人故里': 'A land of fish and rice, and the homeland of great leaders',
    '中国经济第一大省，改革开放前沿': "China's largest economy by GDP, and the forefront of reform and opening",
    '壮族自治区，山水甲天下': 'A Zhuang autonomous region of scenery that tops the nation',
    '最大经济特区，自由贸易港，热带海岛': "China's largest special economic zone — a free trade port and tropical island",
    '山城，中央直辖市': 'A mountain city, and a municipality under the central government',
    '天府之国，大熊猫故乡': 'The Land of Abundance, and the home of the giant panda',
    '山地公园省，大数据枢纽': 'A province of mountain parks and a big-data hub',
    '彩云之南，生物多样性宝库': 'Colourful Yunnan, a treasure trove of biodiversity',
    '世界屋脊，珠穆朗玛峰所在地': 'The Roof of the World, home of Mount Everest',
    '十三朝古都长安，秦岭横亘': 'Chang\'an, capital of thirteen dynasties, with the Qinling range across it',
    '丝绸之路黄金段，地形狭长': 'The golden stretch of the Silk Road, long and narrow',
    '三江源，中华水塔，青海湖': 'The source of three rivers, the Water Tower of China, and Qinghai Lake',
    '最小的省级自治区，塞上江南': 'The smallest provincial-level region — Jiangnan beyond the Great Wall',
    '陆地面积最大的省级区，多民族聚居': 'The largest region by land area, home to many ethnic groups',
    '中国不可分割的一部分，美丽宝岛': 'An inseparable part of China, a beautiful treasure island',
    '特别行政区，国际金融、航运中心': 'A Special Administrative Region and an international centre for finance and shipping',
    '特别行政区，世界旅游休闲中心': 'A Special Administrative Region and a world leisure travel centre',
}

# ── 6. 七大地理大区 ──
REGION_EN = {
    '华北地区': 'North China', '东北地区': 'Northeast China',
    '华东地区': 'East China', '中南地区': 'Central & South China',
    '西南地区': 'Southwest China', '西北地区': 'Northwest China',
    '青藏地区': 'Tibetan Plateau',
}
REGION_SHORT_EN = {
    '华北': 'North China', '东北': 'Northeast', '华东': 'East China',
    '中南': 'Central & South', '西南': 'Southwest', '西北': 'Northwest',
    '青藏': 'Tibetan Plateau',
}
# 大区里各省份名（拼接在「七大地理区」下方的省列表）
for full, en in REGION_SHORT_EN.items():
    pass

# ── 7. 写入 exact ──
for adcode, name, short, abbr, capital, pop, gdp, area, feature in objs:
    # 省名（简称 + 全称）
    en_short = prov_en.get(short)
    if en_short:
        put(short, en_short)
    # 全称 -> 英文（去掉中文后缀）
    en_full = None
    for zh, e in prov_en.items():
        if name.startswith(zh):
            en_full = e
            break
    if en_full:
        put(name, en_full)
    # 省会
    if capital in CAPITAL_EN:
        put(capital, CAPITAL_EN[capital])
    # 经济标签
    if gdp in GDP_EN:
        put(gdp, GDP_EN[gdp])
    else:
        raise SystemExit('FATAL: 缺 gdp 译文: ' + gdp)
    # 特色
    if feature in FEATURE_EN:
        put(feature, FEATURE_EN[feature])
    else:
        raise SystemExit('FATAL: 缺 feature 译文: ' + feature)

for zh, en in REGION_EN.items():
    put(zh, en)
for zh, en in REGION_SHORT_EN.items():
    put(zh, en)

# ── 7b. 知识卡标题「<省名> 完成！」整段键 ──
# 知识卡标题是 `${region.name} 完成！` 拼成的一段文本，引擎整段 exact 优先，
# 所以为每个省名生成一条组合键（34 条）。
for adcode, name, short, abbr, capital, pop, gdp, area, feature in objs:
    en_name = prov_en.get(short)
    if en_name:
        put('%s 完成！' % name, '%s done!' % en_name)
        put('%s 完成！' % short, '%s done!' % en_name)

# ── 8. UI 文案 ──
UI = {
    '中国地理大区': 'China Geographic Regions',
    '七大地理区': 'Seven Geographic Regions',
    '中国省级行政区': 'China Provincial-Level Divisions',
    '省级行政区 · ': 'Provincial-level divisions · ',
    '省内地市拼图': 'City puzzle by province',
    '已从「省内地市拼图」进入 · 请选择一个省份':
        "Entered from 'City puzzle by province' — pick a province",
    '已选：': 'Selected: ',
    '设置': 'Settings',
    '玩法说明': 'How to Play',
    '继续拼图': 'Continue Puzzle',
    '拼图完成！': 'Puzzle Complete!',
    '最近成绩': 'Recent Scores',
    '成绩卡': 'Score Card',
    '再来一局': 'Play Again',
    '选项': 'Options',
    '知识卡弹窗': 'Knowledge Card',
    '重新打乱': 'Reshuffle',
    '完成': 'Done',
    '练习模式': 'Practice Mode',
    '挑战模式': 'Challenge Mode',
    '碎片区': 'Pieces Tray',
    '按住拖动到地图 · 可滚动浏览': 'Hold and drag onto the map · scroll to browse',
    '省会': 'Capital',
    '人口': 'Population',
    '特色': 'Highlight',
    '知识卡': 'Knowledge Card',
    '下一块': 'Next piece',
    '返回首页': 'Back to home',
    '选择关卡': 'Choose a level',
    '关卡': 'Level',
    '退出': 'Exit',
    '确认': 'Confirm',
    '取消': 'Cancel',
    '音效': 'Sound Effects',
    '背景音乐': 'Background Music',
    '显示名称': 'Show Names',
    '最佳': 'Best',
    '加载中…': 'Loading…',
    '省名显示（辅助）': 'Show prov. names (aid)',
    '本关': 'Level',
    '用时': 'Time',
    '步数': 'Moves',
    '进度': 'Progress',
    '总分': 'Score',
    '拼图': 'Puzzle',
    '地图': 'Map',
    '地图加载中…': 'Loading map…',
    '点击地图选择「': 'Tap the map to choose “',
    '长按图片可保存 · 分享到朋友圈 / 小红书': 'Long-press to save · share to Moments / Xiaohongshu',
    '⬇ 下载图片': '⬇ Download Image',
    '📤 成绩卡': '📤 Score Card',
    '📚 练习': '📚 Practice',
    '📍 把碎片': '📍 Drag the pieces',
    '中心': 'to the center',
    '拖到目标轮廓附近会自动吸附归位。': 'They snap into place near the target outline.',
    '📚 练习模式显示名称、不计时；⚡ 挑战模式计时并记录成绩。':
        '📚 Practice mode shows names & is untimed; ⚡ Challenge mode is timed and records scores.',
    '🔍 用 ＋/－ 缩放地图，拖拽空白处平移。': '🔍 Use ＋/－ to zoom, drag empty space to pan.',
    '💡 每完成一块会弹出知识卡片，边玩边学地理。':
        '💡 A knowledge card appears after each piece—learn geography as you play.',
    '🧩 底部「碎片区」是当前关卡的各个区块，按住拖动到地图对应位置。':
        "🧩 The 'Pieces Tray' at the bottom holds this level's blocks; hold and drag them onto the map.",
    # ── index.html 静态 UI ──
    '中国地图拼图挑战': 'China Map Puzzle Challenge',
    '省级行政区 · 34 块': 'Provincial-level divisions · 34 pieces',
    '⚙ 设置': '⚙ Settings',
    '🏷 名称': '🏷 Names',
    '🧩 地理 + AI 小游戏': '🧩 Geography + AI Mini-Game',
    '拼图中国': 'China Puzzle',
    '把行政区拖回中国版图<br />边玩边记住每一寸山河':
        'Drag the divisions back onto the map of China<br />Play, and remember every stretch of the land',
    '把行政区拖回中国版图': 'Drag the divisions back onto the map of China',
    '边玩边记住每一寸山河': 'Play, and remember every stretch of the land',
    '开始游戏': 'Start Game',
    '点击进入 · 先选地图与模式': 'Click to enter — pick a map and a mode first',
    '我的成绩': 'My Scores',
    '选择地图与模式': 'Choose a Map and Mode',
    '选择地图': 'Choose a Map',
    '选择模式': 'Choose a Mode',
    '练习': 'Practice',
    '挑战': 'Challenge',
    '无时间限制 · 显示名称 · 适合学习': 'No time limit · names shown · good for learning',
    '开始拼图': 'Start Puzzle',
    '以后不再自动弹出知识卡': 'Do not show knowledge cards automatically again',
    '关闭': 'Close',
    '🔊 音效': '🔊 Sound Effects',
    '🎵 背景音乐': '🎵 Background Music',
    # ── 主界面动态统计 ──
    '累计拼完': 'Pieces completed',
    '已解锁': 'Unlocked',
    '关零失误': ' levels cleared with no mistakes',
    '最少失误': 'Fewest Mistakes',
    '通关次数': 'Times Cleared',
    '开始计时 · 隐藏提示 · 记录最佳成绩': 'Timed · hints hidden · best score recorded',
    # 关卡标签
    '普通': 'Standard',
    '大区': 'Regions',
    '合集': 'Collection',
    # 知识卡字段
    '简称': 'Abbr.',
    '面积': 'Area',
}
for zh, en in UI.items():
    put(zh, en)

# ── 9. sub ──
SUBS = {
    ' 省': ' prov.',
    ' 块': ' pieces',
    ' 完成！': ' done!',
    ' 局': ' rounds',
    '共 ': 'Total ',
    '七大地理区': 'Seven Geographic Regions',
    '中国地理大区': 'China Geographic Regions',
    '级行政区': '-level divisions',
}
for k, v in SUBS.items():
    puts(k, v)

for k in list(sub):
    if k in exact and exact[k] == sub[k]:
        del sub[k]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({'exact': exact, 'sub': sub}, open(OUT, 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('chinapuzzle dict: %d exact + %d sub -> %s' % (len(exact), len(sub), OUT))
