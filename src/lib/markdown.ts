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
