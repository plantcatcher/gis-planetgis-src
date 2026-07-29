import React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import NotFound from './pages/NotFound';

// 纯路由树：CSR（App.tsx）与 SSR（entry-server.tsx）共用，
// 确保预渲染的 HTML 与客户端渲染结构一致，可正确 hydration。
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
