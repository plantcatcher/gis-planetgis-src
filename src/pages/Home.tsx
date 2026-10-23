import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Github, Youtube, MessageCircle, Instagram, Rss, ArrowRight, ExternalLink, Globe, Compass, Box, Share2, Calendar, Newspaper, Download, Lock, BookOpen } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import {
  getWorks,
  getMaps,
  getGames,
  getTools,
  getLearns,
  getResources,
  getChangelogTimeline,
  getChangelogPlans,
  getLearnSubjects,
  isResourceGated,
  isResourceViewOnly,
} from '@/lib/content';
import HomeSidebar, { useScrollSpy } from '@/components/home/HomeSidebar';
import subdomainsZh from '@/data/subdomains.json';
import subdomainsEn from '@/data/subdomains.en.json';
import PageMeta from '@/components/common/PageMeta';
import AccessBadge from '@/components/common/AccessBadge';
import { useJsonLd } from '@/lib/seo';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard';
import SectionLabel from '@/components/knowledge/SectionLabel';
import { useI18n } from '@/i18n/LocaleContext';
import { HTML_LANG } from '@/i18n/config';
import { GEO_FACTS } from '@/i18n/geoFacts';
import { localizeLabel } from '@/i18n/labels';

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
  Newspaper,
};

// 注意：所有 motion 的 initial 都保持 opacity:1，确保预渲染（SSG）产出的
// 静态 HTML 中文本天生可见，利于搜索引擎与 AdSense 抓取。
const SectionWrapper = ({ children, title, id, className = '', kicker, lead, action }: { children: React.ReactNode, title?: string, id: string, className?: string, kicker?: string, lead?: string, action?: React.ReactNode }) => {
  // 显式标注 Variants 返回类型：否则 ease: 'easeOut' 被推断为宽泛的 string，
  // 与 framer-motion 的 Easing 联合类型不兼容（tsgo 会报 TS2322）。
  const getAnimationVariants = (): Variants => {
    switch (id) {
      case 'profile':
        return { hidden: { opacity: 1, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
      case 'works':
      case 'maps':
      case 'games':
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
    <section id={id} className={`py-10 first:pt-8 border-t border-border/60 first:border-t-0 overflow-hidden relative ${className}`}>
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
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
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

/** 地理冷知识：首页知识门户的轻量互动态，强化"知识感"。内容按语言取，见 src/i18n/geoFacts.ts */
const GeoFactCard = ({ facts, kicker, nextLabel }: { facts: { q: string; a: string }[]; kicker: string; nextLabel: string }) => {
  // 初始顺序固定为 [0..n]，保证 SSG 预渲染首条确定、不触发水合不一致；交互后再洗牌
  const [order, setOrder] = useState<number[]>(() => facts.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const fact = facts[order[pos]];

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
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold tracking-widest text-primary/80 uppercase mb-1">{kicker}</div>
        <p className="font-serif text-base font-bold leading-snug">{fact.q}</p>
        <p className="text-xs text-muted-foreground mt-1">{fact.a}</p>
      </div>
      <button
        type="button"
        onClick={handleNext}
        className="shrink-0 text-xs text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors"
      >
        {nextLabel}
      </button>
    </div>
  );
};

const Home = () => {
  const { lang, t } = useI18n();
  const facts = GEO_FACTS[lang];
  const subdomains = (lang === 'en' ? subdomainsEn : subdomainsZh) as {
    title: string;
    description: string;
    link: string;
  }[];

  const sections: SectionConfig[] = [
    { key: 'profile' },
    { key: 'learn' },
    { key: 'works' },
    { key: 'maps' },
    { key: 'games' },
    { key: 'downloads' },
    { key: 'tools' },
    { key: 'subdomains' },
    { key: 'social' },
    { key: 'about' },
    { key: 'updates' },
  ];

  const updateLog = getChangelogTimeline(6);

  // 规划项与 /changelog 同源（content/changelog.md 的「## 规划中」），改 md 即两处同步
  const plannedItems = getChangelogPlans();

  const works = getWorks();
  // 文件夹即归属：content/maps → 互动地图、content/games → 地理小游戏，
  // content/works 剩下的就是模拟实验室等独立作品，三者不重复。
  const games = getGames();
  const maps = getMaps();
  const worksShown = getWorks();
  // 每个卡片板块首页只露一行三个，其余进各自的汇总页
  const HOME_CARD_LIMIT = 3;
  const tools = getTools();
  const resources = getResources();
  const learns = getLearns();
  // 学科方向名来自 md 的 subject 字段（中文），英文站下按映射表显示。
  // 侧栏二级项与学科卡片共用这一份，保证两处口径一致。
  // value 保留中文原名：侧栏学科项要拼 `/learn?subject=<中文>` 去筛选，
  // 用英文显示名去查会一条都匹配不到。
  const subjects = getLearnSubjects().map((s) => ({
    ...s,
    name: localizeLabel(s.name, lang),
    value: s.name,
  }));

  // 首页各卡片板块按热度（近 30 天 GA4 浏览量）降序取前 N，与列表页排序口径一致；
  // 热度图标不显示（learn 卡片 showDescription=false 已隐藏；其余板块本就不渲染热度标记）。
  const learnTop = [...learns].sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, HOME_CARD_LIMIT);
  const mapsTop = [...maps].sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, HOME_CARD_LIMIT);
  const gamesTop = [...games].sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, HOME_CARD_LIMIT);
  const downloadTop = [...resources].sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, 6);

  // 关于/首页数据条：全部由内容库实时统计，确保两处一致且反映网站现状
  const siteStats = [
    { value: String(learns.length), label: t('home.stats.articles') },
    { value: String(maps.length), label: t('home.stats.maps') },
    { value: String(tools.length), label: t('home.stats.tools') },
    { value: String(works.length), label: t('home.stats.works') },
    { value: String(resources.length), label: t('home.stats.downloads') },
  ];

  // 左栏目录（与右侧 section 一一对应，滚动高亮）。
  // group 用于在侧栏里分组，避免 11 项平铺成一条长龙。
  const navItems = [
    { id: 'profile', label: t('nav.home'), group: t('home.sidebar.groupContent') },
    // 学科方向作为「地理知识库」的二级项出现，不再单列一段（顶部导航已有 /learn）
    { id: 'learn', label: t('nav.learn'), meta: String(learns.length), group: t('home.sidebar.groupContent'), subjects },
    { id: 'works', label: t('nav.works'), meta: String(worksShown.length), group: t('home.sidebar.groupContent') },
    { id: 'maps', label: t('nav.maps'), meta: String(maps.length), group: t('home.sidebar.groupContent') },
    { id: 'games', label: t('nav.games'), meta: String(games.length), group: t('home.sidebar.groupContent') },
    { id: 'downloads', label: t('nav.downloads'), meta: String(resources.length), hot: true, group: t('home.sidebar.groupContent') },
    { id: 'tools', label: t('nav.tools'), meta: String(tools.length), group: t('home.sidebar.groupContent') },
    { id: 'subdomains', label: t('nav.subdomains'), meta: String(subdomains.length), group: t('home.sidebar.groupAbout') },
    { id: 'social', label: t('home.social.title'), group: t('home.sidebar.groupAbout') },
    { id: 'about', label: t('home.about.title'), group: t('home.sidebar.groupAbout') },
    { id: 'updates', label: t('home.updates.title'), group: t('home.sidebar.groupAbout') },
  ];
  const activeSection = useScrollSpy(navItems.map((n) => n.id));

  const socialLinks = [
    { id: '1', platform: t('social.wechat'), url: '星球小捕手', icon_name: 'MessageCircle' },
    { id: '7', platform: t('social.official'), url: '#', icon_name: 'Newspaper' },
    { id: '2', platform: t('social.weibo'), url: 'https://weibo.com/u/5860040514', icon_name: 'Share2' },
    { id: '3', platform: t('social.bilibili'), url: 'https://space.bilibili.com/31959835', icon_name: 'Youtube' },
    { id: '4', platform: t('social.xiaohongshu'), url: 'https://www.xiaohongshu.com/user/profile/5f91772d00000000010077da', icon_name: 'Instagram' },
    { id: '5', platform: t('social.blog'), url: 'https://blog.planetgis.cn', icon_name: 'Globe' },
    { id: '6', platform: t('social.youtube'), url: 'https://www.youtube.com/@ZaynHuang', icon_name: 'Youtube' }
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
    name: t('brand.name'),
    url: 'https://planetgis.cn',
    logo: 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png',
    description: t('brand.orgDesc'),
    sameAs,
  });
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t('brand.name'),
    url: 'https://planetgis.cn',
    inLanguage: HTML_LANG[lang],
  });

  const [wechatOpen, setWechatOpen] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);

  const renderSection = (section: SectionConfig) => {
    switch (section.key) {
      case 'profile':
        return (
          <SectionWrapper id="profile">
            <div className="max-w-3xl">
              <p className="kicker mb-3">{t('home.profile.kicker')}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
                {t('home.profile.title')}
              </h1>
              <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                {t('home.profile.lead')}
              </p>
              <div className="byline mt-4 flex items-center gap-3">
                <span>{t('home.profile.byline1')}</span>
                <span className="opacity-40">·</span>
                <span>{t('home.profile.byline2', { year: new Date().getFullYear() })}</span>
              </div>
            </div>

            {/* 啊哈时刻单一引导：与「地理冷知识」卡同宽（占满内容列，不局限 max-w-3xl） */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 sm:flex-row sm:items-center">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-widest text-primary/80 uppercase">{t('home.try.kicker')}</p>
                <p className="mt-1 text-base font-bold leading-snug">{t('home.try.title')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('home.try.desc')}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link
                  to="/geoquiz"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
                >
                  {t('home.try.cta')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/maps/cn-rivers"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium transition-colors hover:border-primary/40"
                >
                  {t('home.try.alt')}
                </Link>
              </div>
            </div>
          </SectionWrapper>
        );
      case 'works':
        return (
          <SectionWrapper
            id="works"
            title={t('home.works.title')}
            lead={t('home.works.lead')}
            action={
              <Link to="/works" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.works.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {worksShown.slice(0, HOME_CARD_LIMIT).map((work, index) => (
                <motion.a
                  key={work.slug}
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
                      alt={`${work.title} - ${t('brand.name')}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="w-full text-center text-sm font-medium text-white/90">{t('home.works.hover')}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{work.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{work.summary}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'maps':
        return (
          <SectionWrapper
            id="maps"
            title={t('home.maps.title')}
            lead={t('home.maps.lead')}
            action={
              <Link to="/maps" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.maps.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mapsTop.map((m, index) => (
                <CardAnim key={m.slug} delay={index * 0.05}>
                  <Link
                    to={m.link || `/maps/${m.slug}/full`}
                    className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={m.cover}
                        alt={`${m.title} - ${t('brand.name')}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="w-full text-center text-sm font-medium text-white/90">{t('home.maps.hover')}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{m.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{m.summary}</p>
                    </div>
                  </Link>
                </CardAnim>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'games':
        return (
          <SectionWrapper
            id="games"
            title={t('home.games.title')}
            lead={t('home.games.lead')}
            action={
              <Link to="/games" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.games.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gamesTop.map((game, index) => (
                <CardAnim key={game.slug} delay={index * 0.05}>
                  <Link
                    to={game.link || `/${game.slug}`}
                    className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={game.cover}
                        alt={`${game.title} - ${t('brand.name')}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="w-full text-center text-sm font-medium text-white/90">{t('home.games.hover')}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{game.summary}</p>
                    </div>
                  </Link>
                </CardAnim>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'downloads':
        return (
          <SectionWrapper
            id="downloads"
            title={t('home.downloads.title')}
            lead={t('home.downloads.lead')}
            action={
              <Link to="/downloads" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.downloads.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="space-y-3">
              {downloadTop.map((r, index) => (
                <CardAnim key={r.slug} delay={index * 0.04}>
                  <Link
                    to={`/downloads/${r.slug}`}
                    className="group flex gap-4 p-3 rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  >
                    {r.cover ? (
                      <div className="relative w-20 sm:w-24 aspect-[3/4] overflow-hidden bg-muted rounded-lg shrink-0">
                        <img
                          src={r.cover}
                          alt={`${r.title} - ${t('brand.name')}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div className="relative w-20 sm:w-24 aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 flex items-center justify-center shrink-0">
                        {isResourceGated(r) ? (
                          <Lock className="w-7 h-7 text-primary/50" />
                        ) : isResourceViewOnly(r) ? (
                          <BookOpen className="w-7 h-7 text-primary/50" />
                        ) : (
                          <Download className="w-7 h-7 text-primary/50" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {r.category && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-foreground/80 text-background">
                            {localizeLabel(r.category, lang)}
                          </span>
                        )}
                        {r.format && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {r.format}
                          </span>
                        )}
                        <AccessBadge item={r} />
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{r.summary}</p>
                      <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {r.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.date}</span>}
                        {r.size && <span>· {r.size}</span>}
                      </div>
                    </div>
                  </Link>
                </CardAnim>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'learn':
        return (
          <>
            <GeoFactCard facts={facts} kicker={t('home.fact.kicker')} nextLabel={t('home.fact.next')} />

            <SectionWrapper
              id="learn"
              title={t('home.learn.title')}
              lead={t('home.learn.lead')}
              action={
                <Link to="/learn" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  {t('home.learn.all')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {learnTop.map((item, i) => (
                <CardAnim key={item.slug} delay={i * 0.05}>
                  <KnowledgeCard item={item} showDescription={false} />
                </CardAnim>
              ))}
            </div>
          </SectionWrapper>
        </>
      );
      case 'tools':
        return (
          <SectionWrapper
            id="tools"
            title={t('home.tools.title')}
            lead={t('home.tools.lead')}
            action={
              <Link to="/tools" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.tools.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <motion.a
                  key={tool.slug}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold mb-1 flex items-center justify-between gap-4 leading-snug">
                      {tool.title} <motion.span
                        initial={{ opacity: 1, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tool.summary}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'subdomains':
        return (
          <SectionWrapper
            id="subdomains"
            title={t('home.subdomains.title')}
            lead={t('home.subdomains.lead')}
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subdomains.map((sub, index) => (
                <motion.a
                  key={sub.link}
                  href={sub.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 1, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                  className="group flex flex-col gap-2 items-start h-full p-4 rounded-2xl border border-primary/20 hover:border-primary transition-all hover:shadow-lg"
                >
                  <div className="w-full flex items-start justify-between gap-3">
                    <Globe className="w-8 h-8 text-primary shrink-0" />
                    <span className="shrink-0 pt-0.5 text-xs text-primary flex items-center gap-1">
                      {t('home.subdomains.go')} <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  <span className="font-bold text-base">{sub.title}</span>
                  <span className="text-xs text-muted-foreground w-full text-left">{sub.description}</span>
                </motion.a>
              ))}
            </div>
          </SectionWrapper>
        );
      case 'social':
        return (
          <SectionWrapper
            id="social"
            title={t('home.social.title')}
            lead={t('home.social.lead')}
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialLinks.map((link, index) => {
                const Icon = iconMap[link.icon_name || 'Globe'] || Globe;
                if (link.platform === t('social.wechat')) {
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
                      title={t('home.social.qrTitle', { platform: link.platform })}
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
                if (link.platform === t('social.official')) {
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => setOfficialOpen(true)}
                      initial={{ opacity: 1, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.08, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
                      title={t('home.social.qrTitle', { platform: link.platform })}
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
                  <DialogTitle className="text-center">{t('home.social.wechatDialogTitle')}</DialogTitle>
                  <DialogDescription className="text-center">
                    {t('home.social.wechatDialogDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <img
                    src="/images/wechat-qr.png"
                    alt={`${t('social.wechat')} - ${t('brand.name')}`}
                    className="w-60 h-60 rounded-lg border border-border object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={officialOpen} onOpenChange={setOfficialOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center">{t('home.social.officialDialogTitle')}</DialogTitle>
                  <DialogDescription className="text-center">
                    {t('home.social.officialDialogDesc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-2">
                  <img
                    src="/images/wechat-official-qr.jpg"
                    alt={`${t('social.official')} - ${t('brand.officialAccount')}`}
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
            title={t('home.about.title')}
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.img
                  src="https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png"
                  alt={`${t('brand.name')} logo`}
                  className="w-20 h-20 rounded-full shadow-xl border-4 border-primary/20"
                  initial={{ opacity: 1, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
                />
                <div className="text-center md:text-left flex-1">
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t('home.about.bio')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Globe,
                    title: t('home.about.p1.title'),
                    desc: t('home.about.p1.desc'),
                    link: 'https://blog.planetgis.cn',
                    label: t('home.about.p1.label')
                  },
                  {
                    icon: Compass,
                    title: t('home.about.p2.title'),
                    desc: t('home.about.p2.desc'),
                    link: '#tools',
                    label: t('home.about.p2.label')
                  },
                  {
                    icon: Box,
                    title: t('home.about.p3.title'),
                    desc: t('home.about.p3.desc'),
                    link: '#works',
                    label: t('home.about.p3.label')
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                  {siteStats.map((stat, index) => (
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
                  {t('home.about.syncNote')}
                </p>
              </motion.div>
            </div>
          </SectionWrapper>
        );
      case 'updates':
        return (
          <SectionWrapper
            id="updates"
            title={t('home.updates.title')}
            lead={t('home.updates.lead')}
            action={
              <Link to="/changelog" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                {t('home.updates.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="rounded-3xl border border-border bg-card/40 px-5 md:px-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> {t('home.updates.recent')}
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
                  <Compass className="w-5 h-5 text-secondary" /> {t('home.updates.planned')}
                </h3>
                <div className="space-y-4">
                  {plannedItems.map((item, index) => (
                    <div key={index} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{t('home.updates.planned')}</span>
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
        title={t('brand.metaTitle')}
        description={t('brand.metaDesc')}
      />
      {/* pt 用固定值：首页导航栏会随滚动收起，若这里跟着 --nav-h 变化，
          整页内容会在 4rem / 0 之间反复跳动。导航收起只影响导航自身。 */}
      <main className="pt-16">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <HomeSidebar
            items={navItems}
            active={activeSection}
            updates={updateLog.slice(0, 3)}
          />
          <div className="min-w-0 lg:pl-10">
            {sections.map((sec) => (
              <React.Fragment key={sec.key}>
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
