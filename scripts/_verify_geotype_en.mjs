// 临时：运行时校验 content.en.js 与 content.js 结构一致
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(readFileSync('public/games/geotype/data/content.js', 'utf-8'), ctx);
vm.runInContext(readFileSync('public/games/geotype/data/content.en.js', 'utf-8'), ctx);

const W = ctx.window;
const zh = {
  QUESTIONS: W.QUESTIONS, PERSONAS: W.PERSONAS, INSIGHTS: W.INSIGHTS,
  CLIMATE_CN: W.CLIMATE_CN,
};
const en = {
  QUESTIONS: W.QUESTIONS_EN, PERSONAS: W.PERSONAS_EN, INSIGHTS: W.INSIGHTS_EN,
  CLIMATE_CN: W.CLIMATE_EN,
};

let bad = 0;
const fail = (m) => { console.log('  ✗ ' + m); bad++; };

// QUESTIONS
if (zh.QUESTIONS.length !== en.QUESTIONS.length) fail(`question count ${zh.QUESTIONS.length} vs ${en.QUESTIONS.length}`);
for (let i = 0; i < Math.min(zh.QUESTIONS.length, en.QUESTIONS.length); i++) {
  const a = zh.QUESTIONS[i], b = en.QUESTIONS[i];
  if (a.id !== b.id) fail(`q[${i}] id ${a.id} vs ${b.id}`);
  if (a.type !== b.type) fail(`q[${a.id}] type ${a.type} vs ${b.type}`);
  if (!b.q || !b.q.trim()) fail(`q[${a.id}] empty q`);
  if (a.options.length !== b.options.length) { fail(`q[${a.id}] opt count`); continue; }
  for (let j = 0; j < a.options.length; j++) {
    if (a.options[j].dim !== b.options[j].dim) fail(`q[${a.id}] opt[${j}] dim ${a.options[j].dim} vs ${b.options[j].dim}`);
    if (!b.options[j].text || !b.options[j].text.trim()) fail(`q[${a.id}] opt[${j}] empty text`);
  }
}

// PERSONAS
const zg = Object.keys(zh.PERSONAS), eg = Object.keys(en.PERSONAS);
if (zg.join() !== eg.join()) fail(`persona groups ${zg} vs ${eg}`);
for (const g of zg) {
  const a = zh.PERSONAS[g], b = en.PERSONAS[g];
  if (!b) { fail(`persona ${g} missing`); continue; }
  for (const f of ['key', 'name', 'en', 'icon', 'color', 'keywords', 'desc', 'life']) {
    if (!b[f]) fail(`persona ${g}.${f} missing`);
  }
  if ((a.career || []).length !== (b.career || []).length) fail(`persona ${g}.career length`);
  for (const f of ['explore', 'connect', 'stable', 'nature']) {
    if (a.base[f] !== b.base[f]) fail(`persona ${g}.base.${f} ${a.base[f]} vs ${b.base[f]}`);
  }
}

// INSIGHTS
const izg = Object.keys(zh.INSIGHTS), ieg = Object.keys(en.INSIGHTS);
if (izg.join() !== ieg.join()) fail(`insight groups ${izg} vs ${ieg}`);
for (const g of izg) {
  const a = zh.INSIGHTS[g], b = en.INSIGHTS[g];
  if (!b) { fail(`insights ${g} missing`); continue; }
  for (const k of Object.keys(a)) {
    if (!b[k] || !b[k].trim()) fail(`insights ${g}.${k} missing/empty`);
  }
}

// CLIMATE
const cz = Object.keys(zh.CLIMATE_CN).sort(), ce = Object.keys(en.CLIMATE_CN).sort();
if (cz.join() !== ce.join()) fail(`climate keys ${cz} vs ${ce}`);

// COMPAT_EN 可调用
const c1 = W.COMPAT_EN('ocean', 'ocean');
const c2 = W.COMPAT_EN('ocean', 'desert');
const c3 = W.COMPAT_EN('ocean', 'mountain');
if (!c1.text || !c2.text || !c3.text) fail('COMPAT_EN returns empty');
if (/[\u4e00-\u9fff]/.test(c2.text)) fail('COMPAT_EN contains CJK: ' + c2.text);

// UI_EN
for (const k of ['placeTitle', 'placeHint', 'genBtn', 'prevBtn', 'bestMatch', 'cardTitle', 'questionMeta']) {
  if (!W.UI_EN[k]) fail('UI_EN.' + k + ' missing');
}
// 全文 CJK 扫描（除刻意保留的中文城市名外不应有）
const cjk = [];
for (const [g, m] of Object.entries(en.INSIGHTS)) {
  for (const [k, v] of Object.entries(m)) if (/[\u4e00-\u9fff]/.test(v)) cjk.push(`INSIGHTS.${g}.${k}`);
}
for (const [g, p] of Object.entries(en.PERSONAS)) {
  for (const f of ['keywords', 'desc', 'life']) if (/[\u4e00-\u9fff]/.test(p[f])) cjk.push(`PERSONAS.${g}.${f}`);
  p.career.forEach((x, i) => { if (/[\u4e00-\u9fff]/.test(x)) cjk.push(`PERSONAS.${g}.career[${i}]`); });
}
en.QUESTIONS.forEach((q, i) => {
  if (/[\u4e00-\u9fff]/.test(q.q)) cjk.push(`QUESTIONS[${i}].q`);
  q.options.forEach((o, j) => { if (/[\u4e00-\u9fff]/.test(o.text)) cjk.push(`QUESTIONS[${i}].opt[${j}]`); });
});
if (cjk.length) { console.log('  ✗ CJK left in EN content:'); cjk.forEach(c => console.log('      ' + c)); bad += cjk.length; }

console.log(bad === 0 ? '✓ ALL CHECKS PASSED' : `✗ ${bad} problems`);
process.exit(bad === 0 ? 0 : 1);
