import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import NotFound from '@/pages/NotFound';
import routes from './routes';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
