import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { spawn } from "node:child_process";

/**
 * dev 专用：content 目录下任意 .md 变动时自动重建内容索引。
 *
 * 为什么需要：详情页的 frontmatter（title / summary / code / download / size / cover …）
 * 不来自 md 模块本身，而来自 src/data/content-index.json —— 它由
 * scripts/gen-content-index.mjs 生成，过去只在 `npm run dev` / `npm run build` 启动时跑一次。
 * 于是「改了 md 的 frontmatter，刷新浏览器不变，只能重启 dev server」。
 * 正文（md 的 ## 以下部分）不受影响：它走 import.meta.glob('?raw')，watcher 直接生效。
 *
 * 做法：md 增/删/改 → 防抖 300ms → 重跑索引脚本 → 失效模块图 + 通知浏览器整页刷新。
 * apply: 'serve' 保证只在 dev 生效；build 仍由 `npm run build` 前置那一步负责，不重复执行。
 */
function contentIndexAutoRebuild(): Plugin {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let root = "";
  // Windows 下 chokidar 给的分隔符不统一，统一成正斜杠再比较
  const norm = (p: string) => (p || "").replace(/\\/g, "/");

  return {
    name: "planetgis:content-index-auto-rebuild",
    apply: "serve",
    configureServer(server) {
      root = server.config.root;
      const contentDir = norm(path.resolve(root, "content"));
      // 新增的 md 也要能触发（默认 watcher 未必覆盖未被引用的新文件）
      server.watcher.add(path.resolve(root, "content/**/*.md"));

      // 异步跑，不阻塞 dev server（同步 spawnSync 实测会让 Vite 卡住十几秒无响应）。
      const rebuild = () => {
        if (running) return;
        running = true;
        const t0 = Date.now();
        const child = spawn(process.execPath, ["scripts/gen-content-index.mjs"], {
          cwd: root,
          stdio: ["ignore", "pipe", "pipe"],
        });
        let out = "";
        // 形参显式标注：仓库未装 @types/node，不标注会落隐式 any
        child.stdout?.on("data", (d: unknown) => {
          out += String(d);
        });
        child.stderr?.on("data", (d: unknown) => {
          out += String(d);
        });
        child.on("close", (code: number | null) => {
          running = false;
          if (code !== 0) {
            server.config.logger.error(
              `[content-index] 重建失败（code ${code}），页面未刷新\n${out}`,
            );
            return;
          }
          // 让浏览器拿到新的 JSON：失效全部转换缓存 + 整页刷新
          server.moduleGraph.invalidateAll();
          server.ws.send({ type: "full-reload" });
          server.config.logger.info(
            `[content-index] 已重建（${Date.now() - t0}ms），页面已刷新`,
          );
        });
      };

      const schedule = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(rebuild, 300);
      };

      const onFile = (file: string) => {
        const f = norm(file);
        if (!f.startsWith(contentDir + "/") || !f.endsWith(".md")) return;
        schedule();
      };

      server.watcher.on("add", onFile);
      server.watcher.on("change", onFile);
      server.watcher.on("unlink", onFile);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    contentIndexAutoRebuild(),
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
