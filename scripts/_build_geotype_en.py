#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 scripts/i18n-games-src/geotype_en.py 生成 public/games/geotype/data/content.en.js

设计要点：
  · 文本来自 geotype_en.py（唯一手写来源）。
  · dim（维度）**以中文版 data/content.js 为唯一真相源**——脚本按题目 id 与选项
    顺序对齐后强制写入，避免两版维度漂移导致算分结果不同。
  · 生成后自动做结构自检（题数/选项数/dim 对齐/无中文残留）。
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts', 'i18n-games-src'))

import geotype_en as G  # noqa: E402

ZH = os.path.join(ROOT, 'public', 'games', 'geotype', 'data', 'content.js')
OUT = os.path.join(ROOT, 'public', 'games', 'geotype', 'data', 'content.en.js')


def zh_dims():
    """从中文版解析 {qid: [dim, ...]}"""
    t = io.open(ZH, encoding='utf-8').read()
    i = t.find('window.QUESTIONS = [')
    j = t.find('\n];', i)
    seg = t[i:j]
    out = {}
    for m in re.finditer(r'\{\s*id:\s*"([^"]+)",\s*type:\s*"[^"]+",\s*q:\s*"[^"]*"(.*?)\n    \]\s*\}', seg, re.S):
        out[m.group(1)] = re.findall(r'dim:\s*"([^"]+)"', m.group(2))
    return out


def q(s):
    """JS 字符串字面量（双引号 + 转义）"""
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def build():
    dims = zh_dims()
    L = []
    L.append('// 英文内容集（Geo Personality 测试）——由 scripts/_build_geotype_en.py 生成，请勿手改。')
    L.append('// 结构与 data/content.js 一一对应；app.js 在 ?lang=en 时切换到本文件。')
    L.append('// dim 以中文版为唯一真相源（算分依赖维度，改动请先改 data/content.js）。')
    L.append('')
    L.append('window.QUESTIONS_EN = [')
    for qid, qtype, qtext, opts in G.QUESTIONS:
        zh_dim = dims.get(qid)
        if not zh_dim or len(zh_dim) != len(opts):
            raise SystemExit('dim 对齐失败: ' + qid)
        L.append('  { id: %s, type: %s, q: %s,' % (q(qid), q(qtype), q(qtext)))
        L.append('    options: [')
        for (otext, _odim), zd in zip(opts, zh_dim):
            L.append('      { text: %s, dim: %s },' % (q(otext), q(zd)))
        L.append('    ] },')
    L.append('];')
    L.append('')
    L.append('// 人格定义（8 型）')
    L.append('window.PERSONAS_EN = {')
    for k in G.DIMS:
        name, en, icon, color, kw, desc, career, life, base = G.PERSONAS[k]
        L.append('  %s: { key:%s, name:%s, en:%s, icon:%s, color:%s,' % (k, q(k), q(name), q(en), q(icon), q(color)))
        L.append('            keywords:%s,' % q(kw))
        L.append('            desc:%s,' % q(desc))
        L.append('            career:[%s],' % ', '.join(q(c) for c in career))
        L.append('            life:%s,' % q(life))
        L.append('            base:{explore:%d, connect:%d, stable:%d, nature:%d} },' % (
            base['explore'], base['connect'], base['stable'], base['nature']))
    L.append('};')
    L.append('')
    L.append('// 反差洞察模板：key = 向往维度 pref，value = 骨子里主型 main')
    L.append('window.INSIGHTS_EN = {')
    for pref in G.DIMS:
        L.append('  %s: {' % pref)
        for main in G.DIMS:
            L.append('    %s: %s,' % (main, q(G.INSIGHTS[pref][main])))
        L.append('  },')
    L.append('};')
    L.append('')
    L.append('// 推荐城市（英文）')
    L.append('window.RECOMMEND_EN = {')
    for k in G.DIMS:
        r = G.RECOMMEND[k]
        L.append('  %s: { similar:[%s],' % (k, ', '.join(q(c) for c in r['similar'])))
        L.append('              complement:[%s], travel:[%s] },' % (
            ', '.join(q(c) for c in r['complement']), ', '.join(q(c) for c in r['travel'])))
    L.append('};')
    L.append('')
    L.append('// 配对兼容矩阵（英文）')
    L.append('window.COMPAT_EN = function (a, b) {')
    L.append('  var P = window.PERSONAS_EN;')
    L.append('  if (a === b) return { score: 88, text: "Kindred spirits: you share the same geographic soul. You are in tune, but you still need room to breathe." };')
    L.append('  var opp = { ocean:"desert", desert:"ocean", mountain:"forest", forest:"mountain",')
    L.append('              volcano:"polar", polar:"volcano", river:"cosmic", cosmic:"river" };')
    L.append('  if (opp[a] === b) return { score: 96, text: "Opposites attract: you are " + P[a].name + ", they are " + P[b].name +')
    L.append('    " — opposed geographies that together make a whole world." };')
    L.append('  return { score: 72, text: "You are two different geographic personalities. The difference brings freshness, and is worth learning to live with." };')
    L.append('};')
    L.append('')
    L.append('// 气候英文映射')
    L.append('window.CLIMATE_EN = {')
    L.append('  ' + ', '.join('%s:%s' % (k, q(v)) for k, v in G.CLIMATE.items()))
    L.append('};')
    L.append('')
    L.append('// 结构性 UI 文案（app.js 拼字符串用）')
    L.append('window.UI_EN = {')
    L.append('  ' + ', '.join('%s:%s' % (k, q(v)) for k, v in G.UI.items()))
    L.append('};')
    L.append('')
    return '\n'.join(L)


def selfcheck(text):
    errs = []
    # 只扫字符串字面量里的中文（注释里的中文不影响运行）
    for line in text.split('\n'):
        code = line.split('//')[0] if not line.strip().startswith('//') else ''
        lits = re.findall(r'"((?:[^"\\]|\\.)*)"', code)
        for s in lits:
            if re.search(r'[\u4e00-\u9fff]', s):
                errs.append('字符串中文残留: ' + s[:70])
    if text.count('{ id: ') != 20:
        errs.append('题目数不是 20: %d' % text.count('{ id: '))
    return errs


out = build()
errs = selfcheck(out)
io.open(OUT, 'w', encoding='utf-8').write(out)
print('content.en.js written: %d bytes' % len(out.encode('utf-8')))
if errs:
    for e in errs:
        print('  ERROR', e)
    sys.exit(1)
print('  self-check OK (no CJK, 20 questions)')
