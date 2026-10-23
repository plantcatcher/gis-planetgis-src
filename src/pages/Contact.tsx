import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Youtube, Instagram, Globe, ArrowRight, Newspaper, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useI18n } from '@/i18n/LocaleContext';

type SocialId = 'wechat' | 'official' | 'weibo' | 'bilibili' | 'xiaohongshu' | 'youtube' | 'blog' | 'email';

const Contact = () => {
  const { t } = useI18n();
  const [wechatOpen, setWechatOpen] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);
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
        title={t('contact.title')}
        description={t('contact.metaDesc')}
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.h1')}</h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            {t('contact.intro')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              if (link.id === 'wechat') {
                return (
                  <motion.button
                    key={link.id}
                    type="button"
                    onClick={() => setWechatOpen(true)}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{t(`channel.${link.id}` as const)}</h3>
                      <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                      <p className="text-sm text-muted-foreground">{t(`channel.${link.id}.desc` as const)}</p>
                    </div>
                  </motion.button>
                );
              }
            if (link.id === 'official') {
              return (
                <motion.button
                  key={link.id}
                  type="button"
                  onClick={() => setOfficialOpen(true)}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{t(`channel.${link.id}` as const)}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                    <p className="text-sm text-muted-foreground">{t(`channel.${link.id}.desc` as const)}</p>
                  </div>
                </motion.button>
              );
            }
            return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target={link.url !== '#' ? '_blank' : undefined}
                  rel="noreferrer"
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{t(`channel.${link.id}` as const)}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                    <p className="text-sm text-muted-foreground">{t(`channel.${link.id}.desc` as const)}</p>
                  </div>
                  {link.url !== '#' && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                  )}
                </motion.a>
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

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 text-center"
          >
            <p className="text-muted-foreground leading-relaxed">
              {t('contact.replyNote')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Contact;
