import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: false,
    // 产出 dist/.vite/manifest.json：记录「源码文件 -> 产物 chunk 文件名」。
    // prerender 靠它查出每个详情页对应的正文 chunk，往 HTML 里写
    // <link rel="modulepreload">，让正文 chunk 与 main bundle 并行下载
    //（否则要等 main bundle 执行后才知道下载谁，多一个网络往返）。
    manifest: true,
  },
});
