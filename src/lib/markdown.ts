// 零依赖的轻量 Markdown -> HTML 渲染器。
// 支持本项目内容用到的子集：标题、段落、粗体/斜体/行内代码、链接、图片、
// 无序/有序列表、引用、分隔线、围栏代码块，以及原生 <details>/<summary> 块
// （用于 AdSense 友好的可折叠 FAQ）。
//
// 设计目标：可控、可预测。内容由我们自己撰写，只用到上述语法即可。

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 标题 -> 锚点 id（中文安全，URL 片段可直接用）。带去重计数。
function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '');
  return base || 'section';
}

function createIdMaker() {
  const used: Record<string, number> = {};
  return (text: string) => {
    const base = slugify(text);
    if (used[base] != null) {
      used[base] += 1;
      return `${base}-${used[base]}`;
    }
    used[base] = 0;
    return base;
  };
}

function inline(text: string): string {
  // 图片 ![alt](url)
  text = text.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt, url) => `<img alt="${alt}" src="${url}" />`
  );
  // 链接 [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, t, url) => `<a href="${url}" target="_blank" rel="noreferrer">${t}</a>`
  );
  // 粗体 **x**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 斜体 *x*
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // 行内代码 `x`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  return text;
}

/**
 * 原生 HTML 块（`<details>` / `<div>`）只做粗体转换。
 *
 * 这些块整体原样输出、不走 inline()，是为了不破坏作者手写的 HTML 结构
 * （链接、图片、属性）。但站内 FAQ 统一写成 `<details>` + markdown 正文，
 * 其中的 `**强调**` 若一并跳过，页面上会漏出字面星号——全站 82 篇、253 处。
 * 故只单独处理粗体：details 内既无代码块也无单星号斜体（已核查），
 * 不会误伤。
 */
function strongOnly(text: string): string {
  return text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  const makeId = createIdMaker();
  let i = 0;
  let listType: 'ul' | 'ol' | null = null;
  let inCode = false;
  let codeBuf: string[] = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // 围栏代码块
    if (/^```/.test(line)) {
      if (!inCode) {
        inCode = true;
        codeBuf = [];
        i++;
        continue;
      }
      inCode = false;
      html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    // 原生 <details> 块：整段原样输出（含内部 markdown 不二次解析，内容由作者控制）
    if (/^\s*<details>/.test(line)) {
      closeList();
      const buf: string[] = [];
      while (i < lines.length && !/^<\/details>/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) buf.push(lines[i]); // 包含闭合标签
      i++;
      html.push(strongOnly(buf.join('\n')));
      continue;
    }

    // 原生 <div> 块：用于截图网格等需要自定义 HTML 结构的场景。
    // 内容原样输出，不做二次 markdown 解析。
    if (/^\s*<div\b/.test(line)) {
      closeList();
      const buf: string[] = [line];
      i++; // 起始 <div> 行已计入 buf，先前进指针，否则会在循环里被重复计 depth
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const cur = lines[i];
        if (/^\s*<div\b/.test(cur)) depth++;
        if (/^\s*<\/div>\s*$/.test(cur)) depth--;
        buf.push(cur);
        i++;
      }
      html.push(buf.join('\n'));
      continue;
    }

    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      const text = h[2].trim();
      html.push(`<h${lvl} id="${makeId(text)}">${inline(text)}</h${lvl}>`);
      i++;
      continue;
    }

    // 分隔线
    if (/^\s*---+\s*$/.test(line)) {
      closeList();
      html.push('<hr />');
      i++;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      closeList();
      html.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`);
      i++;
      continue;
    }

    // 无序列表
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul>');
        listType = 'ul';
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    // 有序列表
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        html.push('<ol>');
        listType = 'ol';
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    // 空行
    if (line.trim() === '') {
      closeList();
      i++;
      continue;
    }

    // 段落：合并连续普通行
    closeList();
    let para = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|```|\s*---+\s*$)/.test(lines[i])
    ) {
      para += '\n' + lines[i];
      i++;
    }
    html.push(`<p>${inline(para)}</p>`);
  }
  closeList();
  return html.join('\n');
}

// 抽取 h2/h3 标题作为目录（TOC）。id 生成逻辑与 renderMarkdown 一致，
// 保证锚点跳转命中。跳过 h1（页面标题本身）与 h4 以下。
export function extractHeadings(md: string): { level: number; text: string; id: string }[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const makeId = createIdMaker();
  const out: { level: number; text: string; id: string }[] = [];
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      if (lvl < 2 || lvl > 3) continue;
      const text = h[2].trim();
      out.push({ level: lvl, text, id: makeId(text) });
    }
  }
  return out;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * 从正文中抽取「常见问题」章节里的问答对，供 FAQPage 结构化数据使用（GEO）。
 *
 * 站内约定：FAQ 章节用 `## 常见问题 FAQ` 作标题，每问答写成原生
 * `<details><summary>Q: 问题</summary>` + 正文 + `</details>`。
 * 目前 58 篇 works/tools 页按此格式撰写，共 180+ 组问答。
 *
 * @param md     文章正文（不含 frontmatter）
 * @param maxLen 单条答案的最大字符数，超出截断。结构化数据里的答案过长无益，
 *               搜索引擎与 AI 引擎更偏好精炼的 1~3 句；超长会被截断并加省略号。
 */
export function extractFaq(md: string, maxLen = 320): FaqEntry[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: FaqEntry[] = [];
  let inFaqSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 进入/离开 FAQ 章节：遇到下一个同级或更高级标题即结束
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      if (lvl <= 2 && /(FAQ|常见问题|问答)/i.test(h[2])) {
        inFaqSection = true;
        continue;
      }
      if (inFaqSection && lvl <= 2) {
        inFaqSection = false;
      }
      continue;
    }
    if (!inFaqSection) continue;

    // 匹配 <summary>Q: 问题</summary>
    const sm = line.match(/<summary>\s*(?:Q|问)\s*[:：]\s*(.*?)\s*<\/summary>/i);
    if (!sm) continue;

    const question = sm[1].replace(/\s+/g, ' ').trim();
    if (!question) continue;

    // 收集该 <details> 内 summary 之后、</details> 之前的正文作为答案
    const buf: string[] = [];
    let j = i + 1;
    while (j < lines.length && !/^\s*<\/details>/.test(lines[j])) {
      buf.push(lines[j]);
      j++;
    }

    // 答案做纯文本化处理：去掉 markdown 标记与内联 HTML，压成一段
    let answer = buf
      .join('\n')
      .replace(/```[\s\S]*?```/g, ' ') // 代码块
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
      .replace(/<[^>]+>/g, ' ') // 其余内联标签
      .replace(/^\s*[-*+]\s+/gm, '') // 列表符号
      .replace(/^\s*>\s?/gm, '') // 引用符号
      .replace(/[*_`#]/g, '') // 强调/代码标记
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!answer) continue;
    if (answer.length > maxLen) answer = answer.slice(0, maxLen - 1).trimEnd() + '…';

    out.push({ question, answer });
    i = j;
  }

  return out;
}

/**
 * 从正文中抽取「使用教程 / 操作步骤」章节的有序列表，供 HowTo 结构化数据使用（GEO）。
 *
 * 站内约定：工具页用 `## 使用教程` 作标题，正文为 `1. …` `2. …` 的有序列表。
 * 生成式引擎在回答「怎么把 X 转成 Y」这类问题时，会优先引用带 Step 列表的页面；
 * HowTo 正是为此设计的 schema。
 *
 * 只认有序列表（`1.` `2.` 或 `1、`），忽略无序列表与段落——避免把正文里
 * 顺带提到的要点误当成操作步骤。
 *
 * @param md        文章正文（不含 frontmatter）
 * @param sectionRe 匹配教程章节标题的正则，默认「使用教程 / 操作步骤 / 使用步骤 / 使用方法」
 */
export function extractSteps(
  md: string,
  sectionRe: RegExp = /(使用教程|操作步骤|使用步骤|使用说明|使用方法|如何操作)/,
): string[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 章节进出：h1~h3 标题
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      if (lvl <= 3 && sectionRe.test(h[2])) {
        inSection = true;
        continue;
      }
      if (inSection && lvl <= 2) {
        // 遇到下一个二级标题（如「常见问题 FAQ」）即结束
        inSection = false;
      }
      if (inSection) continue; // 章节内的三级小标题不作为步骤，跳过
      continue;
    }
    if (!inSection) continue;

    // 有序列表项：1.  1、  1）
    const m = line.match(/^\s*\d+\s*[.、)]\s+(.*)$/);
    if (!m) continue;

    const step = m[1]
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*_`]/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (step) out.push(step);
  }

  // 少于 2 步的「教程」不具备 HowTo 语义（HowTo 至少需要 2 个 step），不输出
  return out.length >= 2 ? out : [];
}
