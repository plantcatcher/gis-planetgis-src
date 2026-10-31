import { motion } from 'framer-motion';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useI18n } from '@/i18n/LocaleContext';

const PrivacyPolicy = () => {
  const { t } = useI18n();
  return (
    <>
      <PageMeta
        title={t('privacy.title')}
        description={t('privacy.metaDesc')}
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold mb-2">{t('privacy.h1')}</h1>
          <p className="text-sm text-muted-foreground mb-12">{t('privacy.updated')}</p>

          {/* 页面容器统一 7xl（与其它页面对齐），正文保留 3xl 阅读栏避免一行过长 */}
          <div className="prose prose-lg dark:prose-invert max-w-3xl space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s1.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s1.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s2.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.s2.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>{t('privacy.s2.li1.strong')}</strong>{t('privacy.s2.li1.text')}</li>
                <li>
                  <strong>{t('privacy.s2.li2.strong')}</strong>{t('privacy.s2.li2.text1')}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s2.li2.link1')}</a>
                  {t('privacy.s2.li2.sep')}
                  <a href="https://optout.aboutads.info" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s2.li2.link2')}</a>
                  {t('privacy.s2.li2.text2')}
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s2.li2.link3')}</a>
                  {t('privacy.s2.li2.text3')}
                </li>
                <li><strong>{t('privacy.s2.li3.strong')}</strong>{t('privacy.s2.li3.text')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s3.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.s3.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.s3.li1')}</li>
                <li>{t('privacy.s3.li2')}</li>
                <li>{t('privacy.s3.li3')}</li>
                <li>{t('privacy.s3.li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s4.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s4.p1')}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                {t('privacy.s4.p2.a')}<strong>{t('privacy.s4.p2.necessary')}</strong>{t('privacy.s4.p2.b')}<strong>{t('privacy.s4.p2.analytics')}</strong>{t('privacy.s4.p2.c')}<strong>{t('privacy.s4.p2.ads')}</strong>{t('privacy.s4.p2.d')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s5.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.s5.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>{t('privacy.s5.li1.strong')}</strong>{t('privacy.s5.li1.text')}</li>
                <li><strong>{t('privacy.s5.li2.strong')}</strong>{t('privacy.s5.li2.text')}</li>
                <li>
                  <strong>{t('privacy.s5.li3.strong')}</strong>
                  {t('privacy.s5.li3.text')}
                  <a href="https://tawk.to/privacy-policy" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s5.li3.link')}</a>{t('privacy.s5.li3.suffix')}
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                {t('privacy.s5.tail')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s6.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s6.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s7.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s7.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s8.h')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.s8.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.s8.li1')}</li>
                <li>{t('privacy.s8.li2')}</li>
                <li>{t('privacy.s8.li3')}</li>
                <li>
                  {t('privacy.s8.li4.a')}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s8.li4.link1')}</a>
                  {t('privacy.s8.li4.b')}
                  <a href="https://optout.aboutads.info" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s8.li4.link2')}</a>
                  {t('privacy.s8.li4.c')}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s9.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s9.p')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">{t('privacy.s10.h')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.s10.p')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>{t('privacy.s10.li1')}</li>
                <li>{t('privacy.s10.li2.a')}<a href="https://weibo.com/u/5860040514" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s10.li2.b')}</a></li>
                <li>{t('privacy.s10.li3.a')}<a href="https://space.bilibili.com/31959835" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('privacy.s10.li3.b')}</a></li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
