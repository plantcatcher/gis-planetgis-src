import React from 'react';
import { Coffee } from 'lucide-react';

// 微信赞赏码图片：放在 public/images/ 下，与现有 wechat-qr.png 同级。
// 由用户提供的微信赞赏码导出图（建议 PNG，方形清晰）转存为此文件名。
const REWARD_QR = '/images/wechat-reward-qr.png';

/**
 * 文章/学习页文末赞赏引导卡（仅 article/learn 长文页渲染）。
 * 读者读完正文、情绪最到位的时刻，是转化赞赏的最佳落点。
 * 纯静态渲染，无 state，不影响 SSG 的 hydration。
 */
const RewardCallout: React.FC = () => {
  return (
    <section className="mt-12 pt-8 border-t border-border/50">
      <div className="mx-auto max-w-xl rounded-2xl bg-primary/[0.06] border-2 border-primary/30 p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Coffee className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold">觉得这篇文章有用？请作者喝杯咖啡</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          星球小捕手维护网站运行需要持续的成本投入，你的赞赏是免费地理科普能一直更新下去的直接动力。
        </p>
        <div className="mx-auto mt-4 h-44 w-44 overflow-hidden rounded-xl border border-border bg-white p-2">
          <img
            src={REWARD_QR}
            alt="微信赞赏码"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">打开微信 → 扫一扫，即可赞赏</p>
      </div>
    </section>
  );
};

export default RewardCallout;
