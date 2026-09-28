import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import HotBadge from '@/components/common/HotBadge';
import { useLearningData } from '@/hooks/useLearning';
import { computeStreak } from '@/services/learningService';

const navLinks: { name: string; path: string; hot?: boolean }[] = [
  { name: '站点导览', path: '/' },
  { name: '地理知识库', path: '/learn' },
  { name: '精选作品', path: '/works' },
  { name: '互动地图', path: '/maps' },
  { name: '地理小游戏', path: '/games' },
  { name: '地理小工具', path: '/tools' },
  { name: '资料下载', path: '/downloads', hot: true },
];

// 收敛进「更多」下拉：子站导航 / 关于我们 / 动态与规划
const moreLinks: { name: string; path: string }[] = [
  { name: '子站导航', path: '/subdomains' },
  { name: '关于我们', path: '/about' },
  { name: '动态与规划', path: '/changelog' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const lastY = React.useRef(0);

  // 详情页（/works/xxx）也应高亮对应的一级导航。
  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.slice(1);
    }
    if (path === '/') return location.pathname === '/' && !location.hash;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const moreActive = moreLinks.some((l) => isActive(l.path));

  // 学习连续天数徽标：有连学记录时在「我的学习」图标上显示天数，形成回访钩子。
  // SSG 阶段 useLearningData 返回服务快照（空），streak=0，与客户端首帧一致，无 hydration 错位。
  const learning = useLearningData();
  const streak = computeStreak(learning.profile.activeDates);

  // 首页内 section 锚点：同页平滑滚动，避免整页跳动。
  const handleNav = (e: React.MouseEvent, path: string) => {
    if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (path.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = path.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', path);
      setMobileMenuOpen(false);
    }
  };

  // 首页：向下滚动隐藏、向上滚动或回到顶部显示；其他页常显。
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (location.pathname !== '/') {
        setHidden(false);
        document.documentElement.classList.remove('nav-hidden');
      } else if (y <= 80) {
        setHidden(false);
        document.documentElement.classList.remove('nav-hidden');
      } else if (y > lastY.current) {
        setHidden(true);
        document.documentElement.classList.add('nav-hidden');
      } else if (y < lastY.current) {
        setHidden(false);
        document.documentElement.classList.remove('nav-hidden');
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    setMobileMoreOpen(false);
  }, [location.pathname]);

  // 点击外部 / Esc 关闭「更多」下拉
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  return (
    // initial={false}：直接以 animate 的目标值渲染，不产出 opacity:0 的初始态。
    // 预渲染 HTML 里若带 style="opacity:0"，在关闭 JS 或脚本加载失败时导航栏会
    // 整块「隐形」——内容在 DOM 里却看不见。导航是站内链接的主要入口，必须默认可见。
    <motion.nav
      initial={false}
      animate={{ y: hidden ? '-100%' : 0, opacity: 1 }}
      transition={{ duration: hidden ? 0.3 : 0.4, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src="https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png"
            alt="Logo"
            className="w-8 h-8 rounded-full"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
          />
          <motion.span
            className="font-serif font-bold text-xl tracking-tight"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            星球小捕手
          </motion.span>
        </Link>

        {/* Desktop nav */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNav(e, link.path)}
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-primary'
                  : 'hover:text-primary'
              }`}
            >
              {link.name}
              {link.hot && <HotBadge />}
            </Link>
          ))}

          {/* 更多：子站导航 / 关于我们 / 动态与规划 */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              aria-haspopup="true"
              aria-expanded={moreOpen}
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                moreActive || moreOpen ? 'text-primary' : 'hover:text-primary'
              }`}
            >
              更多
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-3 w-40 rounded-lg border bg-background shadow-lg p-1.5"
                >
                  {moreLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMoreOpen(false)}
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'text-primary bg-primary/10'
                          : 'hover:bg-muted hover:text-primary'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`relative rounded-full ${isActive('/my') ? 'text-primary bg-primary/10' : ''}`}
            aria-label="我的学习"
          >
            <Link to="/my">
              <User className="w-5 h-5" />
              {streak > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none tabular-nums">
                  {streak}
                </span>
              )}
            </Link>
          </Button>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden overflow-hidden bg-background border-b"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNav(e, link.path)}
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'hover:text-primary'
                  }`}
                >
                  {link.name}
                  {link.hot && <HotBadge />}
                </Link>
              ))}

              {/* 移动端：更多（可折叠） */}
              <button
                type="button"
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                aria-expanded={mobileMoreOpen}
                className={`inline-flex items-center justify-between text-sm font-medium transition-colors ${
                  moreActive || mobileMoreOpen ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                更多
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mobileMoreOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {mobileMoreOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 flex flex-col gap-3 border-l">
                      {moreLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`text-sm font-medium transition-colors ${
                            isActive(link.path) ? 'text-primary' : 'hover:text-primary'
                          }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
