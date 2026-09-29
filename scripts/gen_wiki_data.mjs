// 把 D:/MyWebs/wiki 的 GIS 资源导航数据，轻量化搬进主站。
// 只保留站内展示所需的「中文字段」，丢弃 lucide 图标名、simple-icons CDN logo 等无用字段。
// 源文件是「纯数据 + TS interface + 少量类型化函数」：仅用括号平衡抽取两个数据数组，new Function 求值，
// 不依赖任何打包器（主站用 rolldown-vite，无 esbuild）。
// 重新生成：node scripts/gen_wiki_data.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'D:/MyWebs/wiki/src/data/resources.ts';

let raw = readFileSync(SRC, 'utf8');
// 删除 interface 声明块（interface 内不含 '}'，[^}]* 足够）
raw = raw.replace(/export\s+interface\s+\w+\s*\{[^}]*\}\s*/g, '');
// 删除 export const 上的类型注解（`: Category[]` / `: Resource[]` 里的 [] 会干扰括号平衡）
raw = raw.replace(/export const categories:\s*Category\[\]\s*=/, 'export const categories =');
raw = raw.replace(/export const resources:\s*Resource\[\]\s*=/, 'export const resources =');

// 括号平衡截取 export const <name> = [ ... ]; 的数组内部文本
function extractArray(src, varName) {
  const marker = `export const ${varName}`;
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`未找到 ${varName}`);
  const open = src.indexOf('[', start);
  let depth = 0;
  let started = false;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '[') {
      depth++;
      started = true;
    } else if (ch === ']') {
      depth--;
      if (started && depth === 0) return src.slice(open + 1, i);
    }
  }
  throw new Error(`未闭合 ${varName}`);
}

const catText = extractArray(raw, 'categories');
const resText = extractArray(raw, 'resources');
const categories = new Function(`return [${catText}]`)();
const resources = new Function(`return [${resText}]`)();

// 精简：分类只留 id / 中文名 / 描述；资源只留 中文名 / 中文描述 / url / 分类 / 子类。
const wikiCategories = categories.map((c) => ({
  id: c.id,
  nameZh: c.nameZh,
  description: c.description,
}));

const catIds = new Set(wikiCategories.map((c) => c.id));
const orphan = resources.filter((r) => !catIds.has(r.categoryId));
if (orphan.length) {
  console.warn(`⚠️ 跳过 ${orphan.length} 条孤儿资源(分类缺失):`, orphan.map((r) => r.id).join(', '));
}

const wikiResources = resources
  .filter((r) => catIds.has(r.categoryId))
  .map((r) => ({
    id: r.id,
    nameZh: r.nameZh,
    descriptionZh: r.descriptionZh,
    url: r.url,
    categoryId: r.categoryId,
    ...(r.subcategory ? { subcategory: r.subcategory } : {}),
  }));

const out = `// 自动生成自 D:/MyWebs/wiki/src/data/resources.ts（GIS 资源导航聚合站）
// 仅保留站内展示所需中文字段，去掉 lucide 图标名与 simple-icons CDN logoUrl。
// 重新生成：node scripts/gen_wiki_data.mjs

export interface WikiCategory {
  id: string;
  nameZh: string;
  description: string;
}

export interface WikiResource {
  id: string;
  nameZh: string;
  descriptionZh: string;
  url: string;
  categoryId: string;
  subcategory?: string;
}

export const wikiCategories: WikiCategory[] = ${JSON.stringify(wikiCategories, null, 2)};

export const wikiResources: WikiResource[] = ${JSON.stringify(wikiResources, null, 2)};
`;

writeFileSync('src/data/wiki.ts', out);
console.log(`✅ 已生成 src/data/wiki.ts — 分类 ${wikiCategories.length} 个，资源 ${wikiResources.length} 条`);
