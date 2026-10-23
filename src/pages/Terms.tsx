import { motion } from 'framer-motion';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useI18n } from '@/i18n/LocaleContext';

const Terms = () => {
  const { t } = useI18n();
  return (
    <>
      <PageMeta
        title={t('terms.title')}
        description={t('terms.metaDesc')}
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold mb-2">{t('terms.h1')}</h1>
          <p className="text-sm text-muted-foreground mb-12">{t('terms.updated')}</p>

          {/* 页面容器统一 7xl（与其它页面对齐），正文保留 3xl 阅读栏避免一行过长 */}
          <div className="prose prose-lg dark:prose-invert max-w-3xl space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s1.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.s1.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s2.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('terms.s2.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('terms.s2.li1')}</li>
                <li>{t('terms.s2.li2')}</li>
                <li>{t('terms.s2.li3')}</li>
                <li>{t('terms.s2.li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s3.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('terms.s3.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('terms.s3.li1')}</li>
                <li>{t('terms.s3.li2')}</li>
                <li>{t('terms.s3.li3')}</li>
                <li>{t('terms.s3.li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s4.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.s4.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s5.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('terms.s5.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('terms.s5.li1')}</li>
                <li>{t('terms.s5.li2')}</li>
                <li>{t('terms.s5.li3')}</li>
                <li>{t('terms.s5.li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s6.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.s6.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s7.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.s7.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('terms.s8.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.s8.p')}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Terms;
