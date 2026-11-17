import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // location.hash 是百分号编码的（中文标题 id 会变成 %E5%B9%BF%E4%B8%9C…），
      // 不解码就查不到元素，会误判成「无锚点」而把页面拉回顶部。
      let id = hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        // 非法编码（如孤立的 %）时按原文查
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // 锚点存在但元素没找到（失效的旧链接）：交给浏览器自己处理，别强行回到顶部
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
