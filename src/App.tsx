import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';
import AppShell from './AppShell';
import { LocaleProvider } from './i18n/LocaleContext';
import { langFromPath } from './i18n/config';

// ScrollToTop / IntersectObserver 均返回 null（纯副作用），不产出 DOM，
// 因此放在 AppShell 外部不会破坏与预渲染 HTML 的 hydration 结构一致性。
const App: React.FC = () => {
  // 语言在 Router 创建的那一刻就定下来，之后不再变。
  //
  // 英文站整体挂在 basename `/en` 之下：路由表里仍是 `/learn`、`/maps/:slug`，
  // 但站内所有 <Link to="/learn"> / navigate('/learn') 会被 react-router 自动
  // 补成 /en/learn —— 于是几百处站内链接一行都不用改。
  //
  // ⚠️ 代价：切换语言必须整页跳转（见 components/common/LanguageSwitcher），
  //    因为 basename 是 Router 初始化参数，站内 SPA 跳转不会重建 Router，
  //    继续用 navigate 跳转会让链接仍指向旧语言前缀。
  const lang = langFromPath(window.location.pathname);

  return (
    <Router basename={lang === 'en' ? '/en' : ''}>
      <ScrollToTop />
      <AnalyticsTracker />
      <IntersectObserver />
      <LocaleProvider lang={lang}>
        <AppShell />
      </LocaleProvider>
    </Router>
  );
};

export default App;
