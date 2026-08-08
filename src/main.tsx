import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 思源宋体（Noto Serif SC）自托管：仅引入简体中文子集 600/700 两个字重，字体随本站资源打包，不依赖任何外部字体源
import "@fontsource/noto-serif-sc/chinese-simplified-600.css";
import "@fontsource/noto-serif-sc/chinese-simplified-700.css";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);
