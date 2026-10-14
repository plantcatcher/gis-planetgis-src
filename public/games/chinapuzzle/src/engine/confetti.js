// 完成庆祝：轻量 canvas 撒花（无外部依赖、离线可用）。
// launchConfetti(canvas) 启动一次下落粒子动画，duration 毫秒后自动停止并清屏。

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#f87171', '#22d3ee'];

let rafId = null;

export function launchConfetti(canvas, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = opts.count || 170;
  const duration = opts.duration || 2800;
  const parts = Array.from({ length: count }, () => spawn(W, H));

  const start = performance.now();
  if (rafId) cancelAnimationFrame(rafId);

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      if (p.dead) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 重力
      p.vx *= 0.99;
      p.rot += p.vr;
      if (p.y > H + 30) {
        p.dead = true;
        continue;
      }
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);
      ctx.fillStyle = p.c;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (elapsed < duration && alive) {
      rafId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, W, H);
      rafId = null;
    }
  }
  rafId = requestAnimationFrame(frame);
}

function spawn(W, H) {
  return {
    x: Math.random() * W,
    y: -20 - Math.random() * H * 0.35,
    s: 5 + Math.random() * 7,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    vx: -1.6 + Math.random() * 3.2,
    vy: 2 + Math.random() * 3.5,
    rot: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    shape: Math.random() < 0.5 ? 'rect' : 'circ',
    dead: false,
  };
}
