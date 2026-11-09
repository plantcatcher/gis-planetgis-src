import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, Map as MapIcon, Download, Wrench, ExternalLink, Search } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { useI18n } from "@/i18n/LocaleContext";
import { trackNotFound } from "@/lib/analytics";

/**
 * 404 页。
 *
 * 不只是「告诉你走错了」——GA4 里这个页面有 100+ 真实用户，说明确实有人在找东西。
 * 所以这里做三件事：
 * 1. 把「用户想访问的地址 + 来源」记进 GA4（page_not_found 事件），
 *    以后按 URL 排序就知道该补哪些 301，而不是凭猜。
 * 2. 给一个能直接用的站内搜索（跳到 /learn?q=…），让用户当场找到想看的文章。
 * 3. 给出四个主要板块的入口，而不是只留一个「回首页」。
 */
export default function NotFound() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // 每次落到 404 都记一条；pathname 变化时重记（站内跳到另一个不存在的地址）
  useEffect(() => {
    trackNotFound(pathname, document.referrer);
  }, [pathname]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/learn?q=${encodeURIComponent(q)}`);
  };

  const sections = [
    { icon: BookOpen, label: t('notfound.nav.learn'), href: "/learn" },
    { icon: MapIcon, label: t('notfound.nav.maps'), href: "/maps" },
    { icon: Download, label: t('notfound.nav.downloads'), href: "/downloads" },
    { icon: Wrench, label: t('notfound.nav.tools'), href: "/tools" },
  ];

  return (
    <>
      <PageMeta
        title={t('notfound.title')}
        description={t('notfound.metaDesc')}
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-[560px] text-center"
        >
          <img src="/images/error/404.svg" alt="404" className="dark:hidden mx-auto" />
          <img
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block mx-auto"
          />

          <h1 className="mt-8 mb-3 text-2xl font-bold text-foreground">
            {t('notfound.h1')}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t('notfound.p')}
          </p>

          {/* 站内搜索：直接带着关键词进地理知识库，比让用户重新回首页找更短 */}
          <form onSubmit={onSearch} className="flex items-center gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('notfound.searchPlaceholder')}
                aria-label={t('notfound.searchPlaceholder')}
                className="w-full rounded-full border border-border/60 bg-muted/40 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
            >
              {t('notfound.searchButton')}
            </button>
          </form>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            {t('notfound.backHome')}
          </Link>

          {/* 主要板块入口 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {sections.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 text-sm font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>

          <a
            href="https://blog.planetgis.cn"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('notfound.nav.blog')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </>
  );
}
