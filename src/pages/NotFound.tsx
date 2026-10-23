import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Globe, Compass, Box } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { useI18n } from "@/i18n/LocaleContext";

export default function NotFound() {
  const { t } = useI18n();
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
          className="mx-auto w-full max-w-[472px] text-center"
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
          <p className="mb-8 text-muted-foreground">
            {t('notfound.p')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              {t('notfound.backHome')}
            </Link>
          </div>

          {/* Quick nav suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { icon: Globe, label: t('notfound.nav.blog'), href: "https://blog.planetgis.cn", external: true },
              { icon: Compass, label: t('notfound.nav.tools'), href: "https://xyz.planetgis.cn", external: true },
              { icon: Box, label: t('notfound.nav.works'), href: "/#works", external: false },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.external ? "/" : item.href}
                onClick={item.external ? (e) => { e.preventDefault(); window.open(item.href, '_blank'); } : undefined}
                className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 text-sm font-medium text-muted-foreground hover:text-primary transition-all"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
