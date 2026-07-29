import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-100px' }}
      className="bg-muted py-12 px-4 border-t"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">星球小捕手</span>
        </div>
        <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
          星球小捕手致力于普及地理知识，探索地球奥秘，让更多人了解我们的星球。
        </p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono">
            &copy; 2026 星球小捕手. 保留所有权利.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-policy" className="text-xs text-primary hover:underline">
              隐私政策
            </Link>
            <Link to="/terms" className="text-xs text-primary hover:underline">
              服务条款
            </Link>
            <Link to="/about" className="text-xs text-primary hover:underline">
              关于我们
            </Link>
            <Link to="/contact" className="text-xs text-primary hover:underline">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
