import React, { useState } from 'react';
import { MessageCircle, X, QrCode, Sparkles } from 'lucide-react';

/**
 * 站级订阅/关注浮窗（公众号常驻入口版）
 * - 纯前端、无后端、无外部服务：复用已有二维码图，零准备即可上线。
 * - 初始 state 固定为 closed，SSR 预渲染与 CSR 首屏一致，不触发 hydration mismatch。
 * - 仅作「关注公众号」导流，承接未触发下载验证码的访客，服务公众号涨粉主目标。
 * - 邮箱订阅为后续可扩展位：在 card 内接入表单服务（Formspree/Web3Forms 等）即可，不影响当前形态。
 */
const SubscribeWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 悬浮触发按钮：常驻右下角，不随卡片开合消失 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '收起关注卡片' : '关注公众号'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* 关注卡片 */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] transform rounded-2xl border border-border bg-card p-5 shadow-2xl transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold">追更星球小捕手</h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          每周更新：互动地图 · 地理数据集 · 可视化实验。关注公众号，新内容第一时间到手。
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-white">
              <img
                src="/wechat-official-qr.jpg"
                alt="公众号二维码：那山那海那座城"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-center text-xs font-semibold">公众号</span>
            <span className="text-center text-[11px] leading-tight text-muted-foreground">
              那山那海那座城
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-white">
              <img
                src="/wechat-qr.png"
                alt="微信二维码：星球小捕手"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-center text-xs font-semibold">微信</span>
            <span className="text-center text-[11px] leading-tight text-muted-foreground">
              星球小捕手
            </span>
          </div>
        </div>

        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" />
          长按或扫码即可关注
        </p>
      </div>
    </>
  );
};

export default SubscribeWidget;
