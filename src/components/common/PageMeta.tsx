// PageMeta / useJsonLd 等 SEO 能力现已统一实现于 src/lib/seo.tsx（零依赖，CSR/SSR 通用）。
// 这里做再导出，保持历史引用路径 '@/components/common/PageMeta' 不变。
import { PageMeta as PageMetaImpl } from '@/lib/seo';
import { TooltipProvider } from '@/components/ui/tooltip';

export { PageMeta, useJsonLd, resetSsrHead, getSsrHead, getSsrJsonLd } from '@/lib/seo';
export type { HeadData } from '@/lib/seo';

// 默认导出：多数页面用 `import PageMeta from '...'` 默认导入。
export default PageMetaImpl;

// 仅保留 TooltipProvider 包裹（HelmetProvider 已移除，head 由 seo 模块自行管理）。
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);
