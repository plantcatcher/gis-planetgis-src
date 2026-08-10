// 用 canvas 生成成绩卡（无外部依赖，离线可用），便于分享到朋友圈 / 小红书。
// 内容：标题 + 版图缩略（所有区块的 SVG path）+ 评级 + 成绩数字 + 口号。
export function drawShareCard(canvas, { level, mode, time, errors, score }) {
  const ctx = canvas.getContext('2d');
  const W = 600;
  const H = 900;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 背景渐变
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#16233b');
  g.addColorStop(1, '#0b1120');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // 标题
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e6f1ff';
  ctx.font = 'bold 44px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('拼图中国', W / 2, 74);
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(
    level.title + ' · ' + (mode === 'challenge' ? '挑战模式' : '练习模式'),
    W / 2,
    106
  );

  // 版图缩略
  drawMap(ctx, level, W / 2, 280, 320, 240);

  // 评级：以失误次数为主
  let stars, gLabel;
  if (errors === 0) { stars = 5; gLabel = '完美零失误'; }
  else if (errors <= 2) { stars = 4; gLabel = '非常熟练'; }
  else if (errors <= 5) { stars = 3; gLabel = '表现良好'; }
  else if (errors <= 10) { stars = 2; gLabel = '仍需练习'; }
  else { stars = 1; gLabel = '继续加油'; }
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(`${starStr}  ${gLabel}`, W / 2, 470);

  // 成绩行
  const rows = [
    ['完成时间', mode === 'challenge' ? fmt(time) : '练习'],
    ['失误次数', String(errors)],
    ['难度', level.tag],
  ];
  if (mode === 'challenge' && score) {
    if (score.bestTime != null) rows.push(['最佳用时', fmt(score.bestTime)]);
    const ch = (score.history || []).filter((h) => h.mode === 'challenge');
    if (ch.length) {
      const avg = Math.round(ch.reduce((a, h) => a + h.time, 0) / ch.length);
      rows.push(['平均用时', fmt(avg)]);
    }
  }
  if (score && score.plays != null) rows.push(['累计完成', `${score.plays} 次`]);

  let y = 530;
  for (const [k, v] of rows) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9fb3c8';
    ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(k, 96, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e6f1ff';
    ctx.font = 'bold 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(v, W - 96, y);
    y += 50;
  }

  // 底部口号
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('地理 + AI 小游戏 · 边玩边记山河', W / 2, H - 40);
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function drawMap(ctx, level, cx, cy, boxW, boxH) {
  const [vx, vy, vw, vh] = level.viewBox;
  const sc = Math.min(boxW / vw, boxH / vh);
  ctx.save();
  ctx.translate(cx - (vw * sc) / 2, cy - (vh * sc) / 2);
  ctx.scale(sc, sc);
  ctx.translate(-vx, -vy);
  for (const r of level.regions) {
    try {
      const p = new Path2D(r.path);
      ctx.fillStyle = 'rgba(56,189,248,0.22)';
      ctx.fill(p);
      ctx.strokeStyle = 'rgba(125,211,252,0.7)';
      ctx.lineWidth = 0.7 / sc;
      ctx.stroke(p);
    } catch (e) {
      /* 单个几何异常不影响整图 */
    }
  }
  ctx.restore();
}
