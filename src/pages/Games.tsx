import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getWorks } from '@/lib/content';

// 卡片入场动画：initial 保持 opacity:1，确保 SSG 静态 HTML 中文本天生可见（利于 SEO / AdSense）。
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

// 地理小游戏汇总页：与「精选作品 /works」「地理小工具 /tools」的列表页结构对称。
// 数据源复用 content/works 中带「游戏」标签的条目，每个 link 指向对应的游戏 iframe 页。
const Games: React.FC = () => {
  const games = getWorks().filter((w) => (w.tags || []).includes('游戏'));

  return (
    <>
      <PageMeta
        title="地理小游戏 - 星球小捕手"
        description="把地理知识变成可以玩的交互——看卫星图猜城市、看轮廓猜国家、测出你的地球人格。"
        canonical="https://planetgis.cn/games"
      />
      <Breadcrumb />
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <header className="mb-10">
            <p className="kicker mb-3">边玩边学</p>
            <div className="flex items-end gap-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">地理小游戏</h1>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-primary/50 to-transparent mb-2" />
            </div>
            <div className="mt-3 h-1 w-14 bg-primary rounded-full" />
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
              把地理知识变成可以玩的交互——看卫星图猜城市、看轮廓猜国家、测出你的地球人格。点开就能玩，无需下载。
            </p>
          </header>

          {games.length === 0 ? (
            <p className="text-muted-foreground">游戏正在路上，敬请期待。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, i) => (
                <CardAnim key={game.slug} delay={i * 0.08}>
                  <Link
                    to={game.link || `/${game.slug}`}
                    className="group block overflow-hidden rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={game.cover}
                        alt={`${game.title} - 星球小捕手地理小游戏`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="w-full text-center text-sm font-medium text-white/90">开始游戏 →</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <Gamepad2 className="w-4 h-4" />
                        <span className="text-xs font-medium tracking-wide uppercase">小游戏</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{game.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        开始游戏 <ArrowRight className="w-3.5 h-3.5 group-hover:gap-2 transition-all" />
                      </span>
                    </div>
                  </Link>
                </CardAnim>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Games;
