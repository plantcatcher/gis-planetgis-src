import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// 思源宋体（Noto Serif SC）自托管：仅引入简体中文子集 600/700 两个字重，字体随本站资源打包，不依赖任何外部字体源
import "@fontsource/noto-serif-sc/chinese-simplified-600.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { preloadRoute } from "./lib/content";

// 记录初始进入路径，供不蒜子 SPA 浏览量统计判断是否需要补计
// （直接以某详情页 URL 进入时，全局脚本已自动统计过，hook 应跳过首屏那一次，避免重复 +1）。
(window as any).__BSZ_INITIAL_PATH__ = window.location.pathname;

const container = document.getElementById("root")!;

const tree = (
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);

// 本站是 SSG：dist/*.html 里的 #root 已经带有预渲染好的正文 DOM。
// 必须用 hydrateRoot「接管」这份 DOM，而不是 createRoot().render() —— 后者会
// 先清空 #root 再整棵重建，导致会执行 JS 的爬虫（百度渲染器等）看到整页 DOM
// 被替换掉。只有在 #root 为空（例如 dev server 直出 index.html）时才走 createRoot。
//
// 正文按篇懒加载（见 src/lib/content.ts 的 loadBody）：当前路由的正文不在主 bundle 里，
// 必须在 hydrateRoot 之前先 preloadRoute() 取回来，否则首次渲染正文为空、与服务端预渲染
// 的 HTML 不一致，会造成 hydration mismatch。预载只加载「当前这一篇」，其余按需再取。
async function bootstrap() {
  try {
    await preloadRoute(window.location.pathname);
  } catch {
    // 预载失败（网络异常等）不阻塞启动：正文留空，页面其余部分照常可交互。
  }
  if (container.firstElementChild) {
    hydrateRoot(container, tree);
  } else {
    createRoot(container).render(tree);
  }
}

void bootstrap();
