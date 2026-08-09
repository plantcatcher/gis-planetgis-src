import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Github, Youtube, MessageCircle, Instagram, Rss, ArrowRight, ExternalLink, Globe, Compass, Box, Share2, Calendar, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWorks, getTools, getArticles, getLearns, getChangelogTimeline, getLearnSubjects } from '@/lib/content';
import { getSubjectStats } from '@/lib/knowledge';
import HomeSidebar, { useScrollSpy } from '@/components/home/HomeSidebar';
import subdomainsData from '@/data/subdomains.json';
import PageMeta from '@/components/common/PageMeta';
import { useJsonLd } from '@/lib/seo';
import KnowledgeMap from '@/components/knowledge/KnowledgeMap';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard';
import SectionLabel from '@/components/knowledge/SectionLabel';

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
const SectionWrapper = ({ children, title, id, className = '', kicker, lead, action }: { children: React.ReactNode, title?: string, id: string, className?: string, kicker?: string, lead?: string, action?: React.ReactNode }) => {
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
    <section id={id} className={`py-14 first:pt-8 overflow-hidden relative ${className}`}>
      {id === 'profile' && (
        <div className="absolute inset-y-0 right-0 -z-10 hidden lg:flex items-center justify-end pr-4 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 320 320"
            className="w-[360px] h-[360px] max-w-none text-primary/15 dark:text-primary/10 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="160" cy="160" r="150" />
            <ellipse cx="160" cy="160" rx="150" ry="40" />
            <ellipse cx="160" cy="160" rx="150" ry="90" />
            <ellipse cx="160" cy="160" rx="150" ry="130" />
            <ellipse cx="160" cy="160" rx="40" ry="150" />
            <ellipse cx="160" cy="160" rx="90" ry="150" />
            <ellipse cx="160" cy="160" rx="130" ry="150" />
            <line x1="10" y1="160" x2="310" y2="160" />
            <line x1="160" y1="10" x2="160" y2="310" />
          </svg>
        </div>
      )}
      {title && (
        <div className="mb-3">
          {kicker && <SectionLabel className="mb-3">{kicker}</SectionLabel>}
          <div className="mb-3">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
              {action}
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
          </div>
          {lead && <p className="text-muted-foreground mb-6 max-w-2xl">{lead}</p>}
        </div>
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

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见。
const CardAnim: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 1, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

/** 地理冷知识：首页知识门户的轻量互动态，强化"知识感" */
const GEO_FACTS = [
  { q: '地球赤道周长约 40,075 公里', a: '以高铁时速 300 公里计，绕赤道一圈约需 5.6 天。' },
  { q: '珠穆朗玛峰每年仍在缓慢长高', a: '印度洋板块持续挤压欧亚板块，珠峰年均抬升约数毫米。' },
  { q: '太平洋约占地球海洋面积的 46%', a: '它比地球上所有陆地面积加起来还要大。' },
  { q: '北半球冬季，地球离太阳更近', a: '每年 1 月初过近日点——季节由地轴倾角决定，而非日地距离。' },
  { q: '本初子午线不止穿过英国', a: '它还经过法国、西班牙、阿尔及利亚、马里、加纳等共 8 国。' },
  { q: '大气层的厚度约为地球半径的 1.5%', a: '但正是这薄薄一层，守护着地表所有的生命与天气。' },
  { q: '地球自转其实在变慢', a: '受月球引潮力制动，每过一百年，一天大约延长 1.7 毫秒。' },
  { q: '死海是地球陆地最低点', a: '湖面海拔约 -430 米，盐度约 34%，浮力大得能躺着读书。' },
  { q: '撒哈拉沙漠曾是一片绿洲', a: '约一万年前这里湖泊密布、草木繁茂，由地球轨道周期变化造成。' },
  { q: '国际日期变更线并不笔直', a: '为避免一国跨两个日期，它在白令海峡和太平洋岛屿处刻意弯折。' },
  { q: '南极比北极冷得多', a: '南极是冰雪覆盖的高原陆地，北极是海洋，海陆差异放大了温差。' },
  { q: '地球并非完美球体', a: '自转离心力使赤道略鼓，赤道半径比极半径长约 21 公里。' },
  { q: '闪电温度可达太阳表面的 5 倍', a: '一道闪电核心约 30,000℃，远超太阳表面约 5,500℃。' },
  { q: '马里亚纳海沟比珠峰还深', a: '最深约 11,034 米，把珠峰放进去仍差两千多米才能填满。' },
  { q: '格陵兰冰盖若全融，海平面约升 7 米', a: '南极冰盖若全融，则可使海平面上升约 60 米。' },
  { q: '一天并非正好 24 小时', a: '相对恒星自转一周仅约 23 时 56 分 4 秒，多出的时间来自公转。' },
  { q: '地球上最干旱处几乎无雨', a: '智利阿塔卡马沙漠部分区域，曾有数百年未见可测量的降雨。' },
  { q: '经度 1° 的距离随纬度变化', a: '赤道约 111 公里、向两极趋近 0；纬度 1° 全球则近恒定约 111 公里。' },
  { q: '喜马拉雅山曾是大海', a: '海相岩层与化石证明，这里数千万年前还是古地中海的一部分。' },
  { q: '城市热岛让城区更暖', a: '混凝土吸热、植被稀少，大城市夜间可比郊区高 3–5℃。' },
];

/** Fisher-Yates 洗牌；可选 excludeLast，保证新牌堆首张不等于即将结束的旧末张，杜绝衔接处重复 */
const shuffleDeck = (arr: number[], excludeLast?: number): number[] => {
  const next = [...arr];
  for (let k = next.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [next[k], next[j]] = [next[j], next[k]];
  }
  if (excludeLast !== undefined && next.length > 1 && next[0] === excludeLast) {
    [next[0], next[1]] = [next[1], next[0]];
  }
  return next;
};

const GeoFactCard = () => {
  // 初始顺序固定为 [0..n]，保证 SSG 预渲染首条确定、不触发水合不一致；交互后再洗牌
  const [order, setOrder] = useState<number[]>(() => GEO_FACTS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const fact = GEO_FACTS[order[pos]];

  // 推进到牌堆下一张；整副 20 张点完才重洗，故少量点击绝不重复
  const handleNext = () => {
    if (pos + 1 < order.length) {
      setPos(pos + 1);
    } else {
      setOrder(shuffleDeck(order, order[order.length - 1]));
      setPos(0);
    }
  };

  return (
    <div className="mb-10 rounded-2xl border border-primary/40 bg-background p-6 flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Lightbulb className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold tracking-widest text-primary/80 uppercase mb-1">地理冷知识</div>
        <p className="font-serif text-lg font-bold leading-snug">{fact.q}</p>
        <p className="text-sm text-muted-foreground mt-1">{fact.a}</p>
      </div>
      <button
        type="button"
        onClick={handleNext}
        className="shrink-0 text-xs text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors"
      >
        换一条
      </button>
    </div>
  );
};

const Home = () => {
  const profile = {
    id: '1',
    name: '星球小捕手',
    bio: '从海平面变迁到城市脉络——用技术让地理科学走出论文，走进每个人的日常。',
    avatar: 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png'
  };

  const sections = [
    { id: '1', key: 'profile', title: '关于我们', is_active: true },
    { id: '9', key: 'learn', title: '地理学习', is_active: true },
    { id: '2', key: 'works', title: '地理可视化作品', is_active: true },
    { id: '7', key: 'blog', title: '地理科普文章', is_active: true },
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
  const learns = getLearns();
  const subdomains = subdomainsData as { title: string; description: string; link: string }[];
  const subjects = getLearnSubjects();

  // 左栏目录（与右侧 section 一一对应，滚动高亮）
  const navItems = [
    { id: 'profile', label: '站点导览' },
    { id: 'learn', label: '地理学习', meta: String(learns.length) },
    { id: 'works', label: '精选作品', meta: String(works.length) },
    { id: 'blog', label: '最新文章', meta: String(articles.length) },
    { id: 'tools', label: '地理小工具', meta: String(tools.length) },
    { id: 'subdomains', label: '子站导航', meta: String(subdomains.length) },
    { id: 'social', label: '关注我们' },
    { id: 'about', label: '关于星球小捕手' },
    { id: 'updates', label: '动态与规划' },
  ];
  const activeSection = useScrollSpy(navItems.map((n) => n.id));

  const socialLinks = [
    { id: '1', platform: '微信', url: '星球小捕手', icon_name: 'MessageCircle' },
    { id: '2', platform: '微博', url: 'https://weibo.com/u/5860040514', icon_name: 'Share2' },
    { id: '3', platform: 'B站', url: 'https://space.bilibili.com/31959835', icon_name: 'Youtube' },
    { id: '4', platform: '小红书', url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da', icon_name: 'Instagram' },
    { id: '5', platform: '博客', url: 'https://blog.planetgis.cn', icon_name: 'Globe' },
    { id: '6', platform: 'YouTube', url: 'https://www.youtube.com/@ZaynHuang', icon_name: 'Youtube' }
  ];

  // 站点级实体结构化数据：把"星球小捕手 = 地理科普品牌"立住，并把各平台 / 子站
  // 通过 sameAs 关联起来，帮助百度 / Google 建立品牌实体与跨站权重。
  const sameAs = Array.from(
    new Set([
      ...subdomains.map((s) => s.link),
      ...socialLinks.map((s) => s.url).filter((u) => u.startsWith('http')),
    ]),
  );
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '星球小捕手',
    url: 'https://planetgis.cn',
    logo: 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png',
    description: '专注地球科学的独立创作者品牌，用数据讲述地球变化，用地图发现世界的温度——涵盖自然地理、气候、人文 GIS 与地理可视化。',
    sameAs,
  });
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '星球小捕手',
    url: 'https://planetgis.cn',
    inLanguage: 'zh-CN',
  });

  const [wechatOpen, setWechatOpen] = useState(false);

  const renderSection = (section: SectionConfig) => {
    switch (section.key) {
      case 'profile':
        return (
          <SectionWrapper id="profile">
            <div className="max-w-3xl">
              <p className="kicker mb-3">地理知识志 · PLANETGIS REVIEW</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                一个自助探索的地理知识库
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                自然、人文、区域、GIS 四大方向，按主题与学段组织成可检索的知识词条——
                课本里讲不透的知识点，这里讲透、讲活，随时来翻、随手可读。
              </p>
              <div className="byline mt-4 flex items-center gap-3">
                <span>每日更新 · 自助阅读</span>
                <span className="opacity-40">·</span>
                <span>{new Date().getFullYear()} 年刊</span>
              </div>
              <div className="flex gap-3 flex-wrap mt-6">
                <Button className="rounded-full px-6 shadow-lg shadow-primary/25" onClick={() => {
                  document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  开始探索地理 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="rounded-full px-6" onClick={() => {
                  document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  浏览作品
                </Button>
              </div>
            </div>
          </SectionWrapper>
        );
      case 'works':
        return (
          <SectionWrapper
            id="works"
            title="精选作品"
            lead="精选的地理可视化作品，用数据讲述地球的尺度与变迁——从海平面模拟到城市路网。"
            action={
              <Link to="/works" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                浏览全部作品 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
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
          <SectionWrapper
            id="blog"
            title="最新文章"
            lead="来自博客的地理科普与可视化解读，覆盖自然、人文、GIS 多个方向。"
            action={
              <a href="https://blog.planetgis.cn" target="_blank" rel="noreferrer" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                查看全部文章 <ArrowRight className="w-3.5 h-3.5" />
              </a>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((article, index) => (
                <CardAnim key={article.slug} delay={index * 0.05}>
                  <KnowledgeCard item={article} />
                </CardAnim>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'learn':
        return (
          <>
            <GeoFactCard />

            <SectionWrapper
              id="learn"
              kicker="地理知识库"
              title="按学科探索地理"
              lead="从自然地理到 GIS 技术，按学科与学段组织成可检索的自助知识库——随时来翻、随手可读。"
              action={
                <Link to="/learn" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  进入完整知识库 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
            >
            <KnowledgeMap stats={getSubjectStats()} className="mb-9" />

            <div>
              <SectionLabel className="mb-4">精选词条</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learns.slice(0, 6).map((learn, index) => (
                  <CardAnim key={learn.slug} delay={index * 0.05}>
                    <KnowledgeCard item={learn} />
                  </CardAnim>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </>
      );
      case 'tools':
        return (
          <SectionWrapper
            id="tools"
            title="地理小工具"
            lead="自研的在线地理工具，让经纬度查询、地形分析、格式转换不再有门槛。"
            action={
              <Link to="/tools" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                查看全部工具 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
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
                    className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, transition: { duration: 0.3 } }}
                      className="shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors"
                    >
                      <Compass className="w-6 h-6" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
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
          <SectionWrapper
            id="subdomains"
            title="子站导航"
            lead="星球小捕手旗下各主题子站，覆盖科普、工具与社区等不同入口。"
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
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
          <SectionWrapper
            id="social"
            title="关注我们"
            lead="在各大平台追踪星球小捕手，第一时间获取新的地理科普与可视化作品。"
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialLinks.map((link, index) => {
                const Icon = iconMap[link.icon_name || 'Globe'] || Globe;
                if (link.platform === '微信') {
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => setWechatOpen(true)}
                      initial={{ opacity: 1, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
                      title={`点击查看${link.platform}公众号二维码`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, transition: { duration: 0.3 } }}
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                      </motion.div>
                      <span className="text-sm font-medium">{link.platform}</span>
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
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
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
            <Dialog open={wechatOpen} onOpenChange={setWechatOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center">扫码关注微信公众号</DialogTitle>
                  <DialogDescription className="text-center">
                    打开微信「扫一扫」，关注「星球小捕手」获取最新地理科普与可视化作品。
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <img
                    src="/wechat-qr.png"
                    alt="微信公众号二维码：星球小捕手"
                    className="w-60 h-60 rounded-lg border border-border object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </SectionWrapper>
        );
      case 'about':
        return (
          <SectionWrapper
            id="about"
            title="关于星球小捕手"
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.img
                  src={profile.avatar}
                  alt="星球小捕手 logo"
                  className="w-20 h-20 rounded-full shadow-xl border-4 border-primary/20"
                  initial={{ opacity: 1, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
                />
                <div className="text-center md:text-left space-y-3 flex-1">
                  <h3 className="text-xl md:text-2xl font-bold">星球小捕手</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
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
                    className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1, transition: { duration: 0.3 } }}
                      className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      <pillar.icon className="w-6 h-6" />
                    </motion.div>
                    <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{pillar.title}</h4>
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
                className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/10 p-6 md:p-8"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { value: '200+', label: '科普文章' },
                    { value: '7+', label: '在线工具' },
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
                      <div className="text-2xl md:text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-center text-muted-foreground mt-6 text-sm">
                  内容同步至 B 站、YouTube、小红书、微博、微信公众号（星球小捕手）等平台
                </p>
              </motion.div>
            </div>
          </SectionWrapper>
        );
      case 'updates':
        return (
          <SectionWrapper
            id="updates"
            title="动态与规划"
            lead="站点近期更新与未来规划，记录每一次迭代与新的内容方向。"
            action={
              <Link to="/changelog" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                查看完整更新日志 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> 最近更新
                </h3>
                <ol className="relative border-l border-border/60 ml-3 space-y-6">
                  {updateLog.map((item, index) => (
                    <li key={index} className="ml-6">
                      <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                    </li>
                  ))}
                </ol>
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
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="星球小捕手 - 地理科普与可视化实验室"
        description="星球小捕手是一个专注于地球科学的独立创作者品牌。用数据讲述地球变化，用地图发现世界的温度——从海平面模拟到城市路网，致力于让专业地理知识变得直观、有趣、触手可及。"
      />
      <main className="pt-[var(--nav-h)]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
          <HomeSidebar
            items={navItems}
            active={activeSection}
            subjects={subjects}
            totalEntries={learns.length + articles.length}
          />
          <div className="min-w-0 lg:pl-10">
            {sections.map(sec => (
              <React.Fragment key={sec.id}>
                {renderSection(sec)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
