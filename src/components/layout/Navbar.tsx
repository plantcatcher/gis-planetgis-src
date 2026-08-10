import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';

const navLinks = [
  { name: '站点导览', path: '/' },
  { name: '地理学习', path: '/learn' },
  { name: '精选作品', path: '/works' },
  { name: '地理小游戏', path: '/games' },
  { name: '最新文章', path: '/articles' },
  { name: '地理小工具', path: '/tools' },
  { name: '子站导航', path: '/subdomains' },
  { name: '关于我们', path: '/about' },
  { name: '动态与规划', path: '/changelog' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }, [location.pathname]);

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
              className={`text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-primary'
                  : 'hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`rounded-full ${isActive('/my') ? 'text-primary bg-primary/10' : ''}`}
            aria-label="我的学习"
          >
            <Link to="/my">
              <User className="w-5 h-5" />
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
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
