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
      html.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
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
