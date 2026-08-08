import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export function ThemeToggle() {
  // 首次渲染必须与 SSG 预渲染结果一致（一律浅色），否则会造成 hydration mismatch，
  // 导致 React 丢弃整棵预渲染 DOM 重建。真实主题在挂载后于 useEffect 中读取。
  // 首屏闪烁由 index.html 里的内联脚本提前给 <html> 打 dark class 来消除。
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // 挂载前不写 localStorage，避免覆盖用户已保存的偏好
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="rounded-full"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}
