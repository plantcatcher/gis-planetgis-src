import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import AppShell from './AppShell';

// ScrollToTop / IntersectObserver 均返回 null（纯副作用），不产出 DOM，
// 因此放在 AppShell 外部不会破坏与预渲染 HTML 的 hydration 结构一致性。
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <IntersectObserver />
      <AppShell />
    </Router>
  );
};

export default App;
