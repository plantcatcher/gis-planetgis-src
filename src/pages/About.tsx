import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Compass, Box, ArrowRight, MessageCircle, Share2, Youtube, Instagram, Newspaper, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useI18n } from '@/i18n/LocaleContext';
import { getTools, getMaps, getWorks, getLearns, getResources } from '@/lib/content';

// 社交渠道的稳定 id：平台名与描述走词典（中英切换），id 用于二维码弹窗判定。
type SocialId = 'wechat' | 'official' | 'weibo' | 'bilibili' | 'xiaohongshu' | 'youtube' | 'blog' | 'email';

const About = () => {
  const { t, lang } = useI18n();
  const [wechatOpen, setWechatOpen] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);
  // 工具数量从 content/tools/*.md 实时统计，避免手工维护的数字过时
  const toolCount = getTools().length;
  const learnCount = getLearns().length;
  const mapCount = getMaps().length;
  const workCount = getWorks().length;
  const resourceCount = getResources().length;
  // 数据条与首页完全一致：全部由内容库实时统计
  const siteStats = [
    { value: String(learnCount), label: t('about.stat.learn') },
    { value: String(mapCount), label: t('about.stat.maps') },
    { value: String(toolCount), label: t('about.stat.tools') },
    { value: String(workCount), label: t('about.stat.works') },
    { value: String(resourceCount), label: t('about.stat.resources') },
  ];
  const socialLinks: { id: SocialId; handle: string; icon: typeof Globe; url: string }[] = [
    { id: 'wechat', handle: '星球小捕手', icon: MessageCircle, url: '#' },
    { id: 'official', handle: '那山那海那座城', icon: Newspaper, url: '#' },
    { id: 'weibo', handle: '@星球小捕手', icon: Share2, url: 'https://weibo.com/u/5860040514' },
    { id: 'bilibili', handle: '星球小捕手', icon: Youtube, url: 'https://space.bilibili.com/31959835' },
    { id: 'xiaohongshu', handle: '星球小捕手', icon: Instagram, url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da' },
    { id: 'youtube', handle: '@ZaynHuang', icon: Youtube, url: 'https://www.youtube.com/@ZaynHuang' },
    { id: 'blog', handle: 'blog.planetgis.cn', icon: Globe, url: 'https://blog.planetgis.cn' },
    { id: 'email', handle: 'planetcatcherr@gmail.com', icon: Mail, url: 'mailto:planetcatcherr@gmail.com' },
  ];

  return (
    <>
      <PageMeta
        title={t('about.title')}
        description={t('about.metaDesc')}
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('about.h1')}</h1>
          <p className="text-base text-muted-foreground mb-12 leading-relaxed">
            {t('about.intro')}
          </p>

          {/* Three content pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Globe,
                title: t('about.pillar.science'),
                desc: t('about.pillar.science.desc'),
              },
              {
                icon: Compass,
                title: t('about.pillar.tools'),
                desc: t('about.pillar.tools.desc'),
              },
              {
                icon: Box,
                title: t('about.pillar.viz'),
                desc: t('about.pillar.viz.desc'),
              }
            ].map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-muted/50 border border-border/50"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 p-8 md:p-10 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {siteStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6 text-sm">
              {t('about.statsTail')}
            </p>
          </div>

          {/* Our Mission */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{t('about.mission.h2')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.mission.p1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.mission.p2')}
            </p>
          </div>

          {/* 关于作者 */}
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-bold">{t('about.author.h2')}</h2>
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                ZH
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold">Zayn Huang</h3>
                  <p className="text-sm text-primary font-medium">{t('about.author.role')}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.author.p1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.author.p2')} <a href="mailto:planetcatcherr@gmail.com" className="text-primary hover:underline">planetcatcherr@gmail.com</a>{lang === 'zh' ? '。' : '.'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact (merged with 关于我们 in top nav) */}
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-bold">{t('about.contact.h2')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.contact.intro')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                if (link.id === 'wechat' || link.id === 'official') {
                  const setOpen = link.id === 'wechat' ? setWechatOpen : setOfficialOpen;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => setOpen(true)}
                      className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">{t(`channel.${link.id}` as const)}</h3>
                        <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                        <p className="text-sm text-muted-foreground">{t(`channel.${link.id}.desc` as const)}</p>
                      </div>
                    </button>
                  );
                }
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.url !== '#' ? '_blank' : undefined}
                    rel="noreferrer"
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1">{t(`channel.${link.id}` as const)}</h3>
                      <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                      <p className="text-sm text-muted-foreground">{t(`channel.${link.id}.desc` as const)}</p>
                    </div>
                    {link.url !== '#' && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                    )}
                  </a>
                );
              })}
            </div>

            <Dialog open={wechatOpen} onOpenChange={setWechatOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center">{t('channel.wechat.dialog.title')}</DialogTitle>
                  <DialogDescription className="text-center">
                    {t('channel.wechat.dialog.desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <img
                    src="/images/wechat-qr.png"
                    alt="微信二维码：星球小捕手"
                    className="w-60 h-60 rounded-lg border border-border object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={officialOpen} onOpenChange={setOfficialOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center">{t('channel.official.dialog.title')}</DialogTitle>
                  <DialogDescription className="text-center">
                    {t('channel.official.dialog.desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <img
                    src="/images/wechat-official-qr.jpg"
                    alt="公众号二维码：那山那海那座城"
                    className="w-60 h-60 rounded-lg border border-border object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <p className="text-center text-sm text-muted-foreground">
              {t('about.businessNote')}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            {/* 用真实 <a> 承载导航，而非 window.location 跳转：
                既保证无 JS 环境下可点击，也避免搜索引擎把页面里的
                location 赋值代码识别成「客户端跳转」。 */}
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/">
                {t('about.backHome')} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default About;
