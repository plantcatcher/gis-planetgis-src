import { useEffect, useRef } from 'react';
import { recordStart, setProgress, COMPLETE_THRESHOLD } from '@/services/learningService';

interface Props {
  /** 内容唯一键 */
  contentKey: string;
}

/**
 * 阅读追踪器：挂载于内容详情页（纯客户端副作用，不产出任何 DOM，故不影响
 * 与 SSG 预渲染 HTML 的 hydration 结构）。
 *
 * 行为：
 *  - 挂载即调用 recordStart，记录首次开始时间、活跃日期、最近学习。
 *  - 监听窗口滚动，按「已滚出视口的比例」估算阅读进度，节流写回。
 *  - 进度达 COMPLETE_THRESHOLD（默认 90%）即标记「已完成」。
 *
 * 估算方式：progress = scrollTop / (scrollHeight - clientHeight)。
 * 这是面向「读完即掌握」的轻量近似，不依赖正文几何细分；后续若要做
 * 段落级精读，可在 Learning Service 层扩展，UI 与存储层均不动。
 */
const LearningTracker: React.FC<Props> = ({ contentKey }) => {
  const keyRef = useRef(contentKey);
  keyRef.current = contentKey;
  const lastWrite = useRef(0);
  const completedRef = useRef(false);
  const lastTick = useRef<number>(Date.now());

  useEffect(() => {
    // 进入即记一次「开始学习」
    recordStart(keyRef.current);
    lastTick.current = Date.now();

    const computeProgress = (): number => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      return Math.min(1, Math.max(0, scrollTop / max));
    };

    const flush = () => {
      const progress = computeProgress();
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - lastTick.current) / 1000));
      lastTick.current = now;
      setProgress(keyRef.current, {
        progress,
        lastPosition: window.scrollY || document.documentElement.scrollTop,
        deltaSeconds: delta,
      });
      if (progress >= COMPLETE_THRESHOLD) completedRef.current = true;
    };

    // 滚动节流：最多每 800ms 写一次，避免高频写 localStorage。
    const onScroll = () => {
      const now = Date.now();
      if (now - lastWrite.current < 800) return;
      lastWrite.current = now;
      flush();
    };

    // 离开页面（切走 / 关闭）时补写一次最终进度
    const onHide = () => flush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      // 卸载时再补一次，确保最终进度落盘
      flush();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [contentKey]);

  return null;
};

export default LearningTracker;
