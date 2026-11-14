import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import NotFound from './pages/NotFound';

// 纯路由树：CSR（App.tsx）与 SSR（entry-server.tsx）共用，
// 确保预渲染的 HTML 与客户端渲染结构一致，可正确 hydration。
const AppRoutes: React.FC = () => {
  return (
    // 页面懒加载的挂起边界（见 lib/lazyPage.tsx）。首屏与预渲染时页面已预载、不会挂起，
    // 这里只在站内跳转到未加载页面时生效。
    // ⚠️ 挂在 Routes 内部而不是外面：Suspense 包住 Routes 时，预渲染输出里会多
    //    <!--$--/--> 注释节点；放内层、且渲染时组件已就绪则不会产生任何边界节点，
    //    与旧产物的 DOM 结构逐字节一致（hydration 更安全）。
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={<Suspense fallback={null}>{route.element}</Suspense>} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
