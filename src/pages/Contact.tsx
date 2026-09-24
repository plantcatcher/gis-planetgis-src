import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Share2, Youtube, Instagram, Globe, ArrowRight, Newspaper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';

const Contact = () => {
  const [wechatOpen, setWechatOpen] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);
  const socialLinks = [
    { platform: '微信公众号', handle: '星球小捕手', desc: '搜索关注，获取最新地理科普推送', icon: MessageCircle, url: '#' },
    { platform: '公众号', handle: '那山那海那座城', desc: '扫码关注，获取最新地理科普文章', icon: Newspaper, url: '#' },
    { platform: '微博', handle: '@星球小捕手', desc: '关注我们，参与地理话题讨论', icon: Share2, url: 'https://weibo.com/u/5860040514' },
    { platform: 'B站', handle: '星球小捕手', desc: '观看地理科普视频和可视化作品', icon: Youtube, url: 'https://space.bilibili.com/31959835' },
    { platform: '小红书', handle: '星球小捕手', desc: '查看地理知识卡片和图文内容', icon: Instagram, url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da' },
    { platform: 'YouTube', handle: '@ZaynHuang', desc: 'Subscribe for geography content in English', icon: Youtube, url: 'https://www.youtube.com/@ZaynHuang' },
    { platform: '博客', handle: 'blog.planetgis.cn', desc: '阅读深度地理科普文章', icon: Globe, url: 'https://blog.planetgis.cn' },
  ];

  return (
    <>
      <PageMeta
        title="联系我们 - 星球小捕手 | PlanetGIS"
        description="联系星球小捕手——通过微信、微博、B站、小红书、YouTube等渠道与我们取得联系。商业合作、内容建议、技术咨询均欢迎。"
      />
      <Breadcrumb />
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">联系我们</h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            有地理科普合作、内容建议或技术咨询需求？欢迎通过以下渠道与我们取得联系。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              if (link.platform === '微信公众号') {
                return (
                  <motion.button
                    key={link.platform}
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
                      <h3 className="font-bold text-lg mb-1">{link.platform}</h3>
                      <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </div>
                </motion.button>
              );
            }
            if (link.platform === '公众号') {
              return (
                <motion.button
                  key={link.platform}
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
                    <h3 className="font-bold text-lg mb-1">{link.platform}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                    <p className="text-sm text-muted-foreground">{link.desc}</p>
                  </div>
                </motion.button>
              );
            }
            return (
                <motion.a
                  key={link.platform}
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
                    <h3 className="font-bold text-lg mb-1">{link.platform}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{link.handle}</p>
                    <p className="text-sm text-muted-foreground">{link.desc}</p>
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
                <DialogTitle className="text-center">扫码关注微信</DialogTitle>
                <DialogDescription className="text-center">
                  打开微信「扫一扫」，关注「星球小捕手」获取最新地理科普与可视化作品。
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-2">
                <img
                  src="/wechat-qr.png"
                  alt="微信二维码：星球小捕手"
                  className="w-60 h-60 rounded-lg border border-border object-cover"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={officialOpen} onOpenChange={setOfficialOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-center">扫码关注公众号</DialogTitle>
                <DialogDescription className="text-center">
                  打开微信「扫一扫」，关注「那山那海那座城」，获取最新地理科普文章。
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-2">
                <img
                  src="/wechat-official-qr.jpg"
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
              我们会尽快回复您的消息。对于商业合作，请在社交媒体上私信并注明"商业合作"。
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Contact;
