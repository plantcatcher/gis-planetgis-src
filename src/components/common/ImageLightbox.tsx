import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// ── 详情页图片点击放大（灯箱，支持左右切换） ────────────────────────────────
// 设计：零依赖、SSG 安全（关闭态渲染 null）、事件委托（正文由
// dangerouslySetInnerHTML 渲染，无法直接给 <img> 绑事件）。
// 分组规则：点击的图片若在 .shot-grid 内，则该网格所有图为一组（可翻页）；
// 否则以绑定事件的容器为组（如左栏封面单独一张）。
// 用法：
//   const { lightbox, onImageClick, closeLightbox, navLightbox } = useImageLightbox();
//   <div className="md-body" onClick={onImageClick} ... />
//   <ImageLightbox state={lightbox} onClose={closeLightbox} onNav={navLightbox} />

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxState {
  images: LightboxImage[];
  index: number;
}

/**
 * 图片灯箱状态 + 事件委托点击处理。
 * 放在正文容器上：点击容器内任意 <img> 即放大。
 */
export function useImageLightbox() {
  const [state, setState] = useState<LightboxState | null>(null);

  const onImageClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.tagName !== 'IMG') return;
    const src = t.getAttribute('src') || '';
    if (!src) return;
    e.preventDefault();
    const alt = t.getAttribute('alt') || '';
    // 分组：优先 .shot-grid，否则整个绑定容器
    let root: Element | null = t.closest('.shot-grid');
    if (!root) root = e.currentTarget as Element;
    if (!(root instanceof HTMLElement)) root = t.parentElement;
    const imgs = root
      ? Array.from(root.querySelectorAll('img'))
          .map((img) => ({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
          }))
          .filter((x) => x.src)
      : [];
    const list = imgs.length > 0 ? imgs : [{ src, alt }];
    const index = Math.max(0, list.findIndex((x) => x.src === src));
    setState({ images: list, index });
  }, []);

  const closeLightbox = useCallback(() => setState(null), []);

  const navLightbox = useCallback((dir: 1 | -1) => {
    setState((s) => {
      if (!s || s.images.length < 2) return s;
      const n = s.images.length;
      return { ...s, index: (s.index + dir + n) % n };
    });
  }, []);

  return { lightbox: state, onImageClick, closeLightbox, navLightbox };
}

/** 全屏灯箱：点背景 / ESC / 右上角按钮关闭；←/→ 或箭头按钮切换图片。 */
export const ImageLightbox: React.FC<{
  state: LightboxState | null;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
}> = ({ state, onClose, onNav }) => {
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNav(-1);
      else if (e.key === 'ArrowRight') onNav(1);
    };
    window.addEventListener('keydown', onKey);
    // 锁定背景滚动
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [state, onClose, onNav]);

  if (!state) return null;
  const { images, index } = state;
  const current = images[index];
  const multi = images.length > 1;

  const navBtn =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-14 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <img
        key={current.src}
        src={current.src}
        alt={current.alt}
        className="max-w-full max-h-[88vh] object-contain rounded-lg shadow-2xl select-none"
        style={{ animation: 'lightboxFadeIn .18s ease' }}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭预览"
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      {multi && (
        <>
          <button
            type="button"
            aria-label="上一张"
            className={`${navBtn} left-3 md:left-6`}
            onClick={(e) => {
              e.stopPropagation();
              onNav(-1);
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="下一张"
            className={`${navBtn} right-3 md:right-6`}
            onClick={(e) => {
              e.stopPropagation();
              onNav(1);
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      {multi && (
        <p className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-white/80 tabular-nums bg-black/40 rounded-full px-3 py-1">
          {index + 1} / {images.length}
        </p>
      )}
      {current.alt && (
        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/70 px-8">
          {current.alt}
        </p>
      )}
    </div>
  );
};
