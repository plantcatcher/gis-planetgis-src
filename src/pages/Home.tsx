import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Youtube, MessageCircle, Instagram, Rss, ArrowRight, ExternalLink, Globe, Compass, Box, Share2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWorks, getTools, getArticles, getChangelogTimeline } from '@/lib/content';
import subdomainsData from '@/data/subdomains.json';
import PageMeta from '@/components/common/PageMeta';
import CoverImage from '@/components/common/CoverImage';

const iconMap: Record<string, any> = {
  Github,
  Youtube,
  MessageCircle,
  Instagram,
  Rss,
  Globe,
  Compass,
  Box,
  Share2,
};

// 注意：所有 motion 的 initial 都保持 opacity:1，确保预渲染（SSG）产出的
// 静态 HTML 中文本天生可见，利于搜索引擎与 AdSense 抓取。
const SectionWrapper = ({ children, title, id }: { children: React.ReactNode, title?: string, id: string }) => {
  const getAnimationVariants = () => {
    switch (id) {
      case 'profile':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
      case 'works':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
      case 'tools':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
      case 'subdomains':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
      case 'social':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
      case 'about':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
      default:
        return { hidden: { opacity: 1, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
    }
  };

  return (
    <section id={id} className="py-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden relative">
      {id === 'profile' && (
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20">
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 animate-spin-slow" style={{
            boxShadow: '0 0 100px rgba(59, 130, 246, 0.5)'
          }} />
        </div>
      )}
      {title && (
        <motion.div
          initial={{ opacity: 1, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary">{title}</h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="h-[2px] flex-1 bg-gradient-to-r from-primary to-transparent"
          />
        </motion.div>
      )}
      <motion.div
        variants={getAnimationVariants()}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {children}
      </motion.div>
    </section>
  );
};

interface SectionConfig {
  key: string;
}

const Home = () => {
  const profile = {
    id: '1',
    name: '星球小捕手',
    bio: '从海平面变迁到城市脉络——用技术让地理科学走出论文，走进每个人的日常。',
    avatar: 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png'
  };

  const sections = [
    { id: '1', key: 'profile', title: '关于我们', is_active: true },
    { id: '2', key: 'works', title: '精选作品', is_active: true },
    { id: '7', key: 'blog', title: '最新文章', is_active: true },
    { id: '3', key: 'tools', title: '地理小工具', is_active: true },
    { id: '4', key: 'subdomains', title: '子站导航', is_active: true },
    { id: '5', key: 'social', title: '关注我们', is_active: true },
    { id: '6', key: 'about', title: '关于星球小捕手', is_active: true },
    { id: '8', key: 'updates', title: '动态与规划', is_active: true }
  ];

  const updateLog = getChangelogTimeline(6);

  const plannedItems = [
    { title: '地形分析工具', desc: '上传高程数据即可自动生成剖面图与坡度分析，让地形特征一眼可读。' },
    { title: '星空观测指南', desc: '整理全年星座与深空天体的最佳观测时间地图，把天文放进地理框架。' },
    { title: '地理知识库', desc: '系统梳理自然地理与人文地理核心知识点，做成可检索的结构化词条。' },
  ];

  const works = getWorks();
  const tools = getTools();
  const articles = getArticles();
  const subdomains = subdomainsData as { title: string; description: string; link: string }[];

  const socialLinks = [
    { id: '1', platform: '微信', url: '那山那海那座城', icon_name: 'MessageCircle' },
    { id: '2', platform: '微博', url: 'https://weibo.com/u/5860040514', icon_name: 'Share2' },
    { id: '3', platform: 'B站', url: 'https://space.bilibili.com/31959835', icon_name: 'Youtube' },
    { id: '4', platform: '小红书', url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da', icon_name: 'Instagram' },
    { id: '5', platform: '博客', url: 'https://blog.planetgis.cn', icon_name: 'Globe' },
    { id: '6', platform: 'YouTube', url: 'https://www.youtube.com/@ZaynHuang', icon_name: 'Youtube' }
  ];

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`已复制${platform}账号: ${text}`);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  const renderSection = (section: SectionConfig) => {
    switch (section.key) {
      case 'profile':
        return (
          <SectionWrapper id="profile">
            <div className="space-y-6 max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                探索地理科普
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                <span className="gradient-text">{profile?.name || '星球小捕手'}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {profile?.bio}
              </p>
              <div className="flex justify-center">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25" onClick={() => {
                  document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  查看作品 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </SectionWrapper>
        );
      case 'works':
        return (
          <SectionWrapper id="works" title="精选作品">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work, index) => (
                <div key={work.slug} className="flex flex-col">
                  <motion.a
                    href={work.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 1, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={work.cover}
                        alt={`${work.title} - 星球小捕手地理可视化作品`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="w-full text-center text-sm font-medium text-white/90">访问作品 →</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{work.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{work.summary}</p>
                    </div>
                  </motion.a>
                  <div className="mt-3 text-center">
                    <Link
                      to={`/works/${work.slug}`}
                      className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      查看详情与解读 <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'blog':
        return (
          <SectionWrapper id="blog" title="最新文章">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article, index) => (
                <Link
                  key={article.slug}
                  to={`/articles/${article.slug}`}
                  initial={{ opacity: 1, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                    <CoverImage
                      cover={article.cover}
                      title={article.title}
                      lazy
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                    {article.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-zinc-800/90 text-primary backdrop-blur-sm">
                        {article.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {article.date && (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{article.date}</span>
                        </>
                      )}
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </span>
                    <span className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      阅读全文 <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" className="rounded-full" asChild>
                <a href="https://blog.planetgis.cn" target="_blank" rel="noreferrer">
                  查看全部文章 <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </SectionWrapper>
        );
      case 'tools':
        return (
          <SectionWrapper id="tools" title="地理小工具">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <div key={tool.slug} className="flex flex-col">
                  <motion.a
                    href={tool.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 1, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.08, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    className="group flex gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, transition: { duration: 0.3 } }}
                      className="shrink-0 w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors"
                    >
                      <Compass className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                        {tool.title} <motion.span
                          initial={{ opacity: 1, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.span>
                      </h3>
                      <p className="text-muted-foreground">{tool.summary}</p>
                    </div>
                  </motion.a>
                  <div className="mt-3 text-center">
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      查看详情与使用教程 <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'subdomains':
        return (
          <SectionWrapper id="subdomains" title="子站导航">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subdomains.map((sub, index) => (
                <motion.div
                  key={sub.link}
                  initial={{ opacity: 1, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                  viewport={{ once: true }}
                >
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col gap-2 items-start group border-primary/20 hover:border-primary transition-all w-full"
                    asChild
                  >
                    <motion.a
                      href={sub.link}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                      <span className="font-bold text-lg">{sub.title}</span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">{sub.description}</span>
                    </motion.a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'social':
        return (
          <SectionWrapper id="social" title="关注我们">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialLinks.map((link, index) => {
                const Icon = iconMap[link.icon_name || 'Globe'] || Globe;
                if (link.platform === '微信') {
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => copyToClipboard(link.url, link.platform)}
                      initial={{ opacity: 1, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                      className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
                      title={`点击复制${link.platform}账号`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, transition: { duration: 0.3 } }}
                        className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md"
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <span className="font-semibold">{link.platform}</span>
                    </motion.button>
                  );
                }
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 1, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.08, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                    className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, transition: { duration: 0.3 } }}
                      className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <span className="font-semibold">{link.platform}</span>
                  </motion.a>
                );
              })}
            </div>
          </SectionWrapper>
        );
      case 'about':
        return (
          <SectionWrapper id="about" title="关于星球小捕手">
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.img
                  src={profile.avatar}
                  alt="星球小捕手 logo"
                  className="w-28 h-28 rounded-full shadow-xl border-4 border-primary/20"
                  initial={{ opacity: 1, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
                />
                <div className="text-center md:text-left space-y-3 flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold">星球小捕手</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    一个专注于地球科学的独立创作者品牌。我们用数据讲述地球变化，用地图发现世界的温度——从南极冰盖消融到城市交通脉络，从古代文明的水利智慧到未来海平面的模拟预测，致力于让专业的地理知识变得直观、有趣、触手可及。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Globe,
                    title: '深度科普',
                    desc: '博客累计发表近 200 篇原创文章，涵盖自然地理、气候环境、人文地理、GIS 技术等方向，用通俗的语言解读专业的地理现象。',
                    link: 'https://blog.planetgis.cn',
                    label: '访问博客'
                  },
                  {
                    icon: Compass,
                    title: '交互工具',
                    desc: '自研多款在线地理小工具——经纬度查询、地形分析、GeoJSON 格式转换等，让地理数据处理不再是专业人士的专利。',
                    link: '#tools',
                    label: '查看工具'
                  },
                  {
                    icon: Box,
                    title: '可视化作品',
                    desc: '打造海平面模拟实验室、3D 数据大屏、城市路网绘制等交互可视化项目，将复杂的地理数据转化为可感知、可交互的视觉体验。',
                    link: '#works',
                    label: '浏览作品'
                  }
                ].map((pillar, index) => (
                  <motion.a
                    key={pillar.title}
                    href={pillar.link}
                    target={pillar.link.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    initial={{ opacity: 1, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1, transition: { duration: 0.3 } }}
                      className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      <pillar.icon className="w-7 h-7" />
                    </motion.div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{pillar.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{pillar.desc}</p>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pillar.label} <ArrowRight className="w-3 h-3" />
                    </span>
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/10 p-8 md:p-10"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { value: '200+', label: '科普文章' },
                    { value: '6+', label: '在线工具' },
                    { value: '4', label: '可视化作品' },
                    { value: '6+', label: '内容平台' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 1, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    >
                      <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-center text-muted-foreground mt-6 text-sm">
                  内容同步至 B 站、YouTube、小红书、微博、微信公众号（那山那海那座城）等平台
                </p>
              </motion.div>
            </div>
          </SectionWrapper>
        );
      case 'updates':
        return (
          <SectionWrapper id="updates" title="动态与规划">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> 最近更新
                </h3>
                <ol className="relative border-l border-border/60 ml-3 space-y-6">
                  {updateLog.map((item, index) => (
                    <li key={index} className="ml-6">
                      <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                      <p className="font-medium leading-snug">{item.title}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-6">
                  <Button variant="ghost" className="rounded-full" asChild>
                    <Link to="/changelog">查看完整更新日志 <ArrowRight className="ml-2 w-4 h-4" /></Link>
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-secondary" /> 规划中
                </h3>
                <div className="space-y-4">
                  {plannedItems.map((item, index) => (
                    <div key={index} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">规划中</span>
                        <h4 className="font-bold">{item.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground gradient-bg">
      <PageMeta
        title="星球小捕手 - 地理科普与可视化实验室"
        description="星球小捕手是一个专注于地球科学的独立创作者品牌。用数据讲述地球变化，用地图发现世界的温度——从海平面模拟到城市路网，致力于让专业地理知识变得直观、有趣、触手可及。"
      />
      <main className="pt-16">
        {sections.map(sec => (
          <React.Fragment key={sec.id}>
            {renderSection(sec)}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
};

export default Home;
