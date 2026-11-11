/* 极简二维码编码器（无依赖）
 * 只服务分享卡上的游戏链接：固定 Version 3 / 纠错级别 M / mask 0 / byte 模式，
 * 容量 42 字节，足够放 https://planetgis.cn/geodaily（30 字节）。
 * 需要更长内容时请升级版本号并同步调整 EC 分块参数。
 */
(function (root) {
  'use strict';

  var SIZE = 29;        // Version 3 = 29×29 模块
  var DATA_CW = 44;     // 数据码字（44 + 26 = 70 总码字）
  var EC_CW = 26;       // 纠错码字
  var ALIGN = 22;       // 唯一的对齐图案中心（6 与三个定位图案重叠，无需再画）

  // ── GF(256)：本原多项式 0x11d ────────────────────────────────────────
  var EXP = new Array(512);
  var LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function mul(a, b) {
    return a && b ? EXP[LOG[a] + LOG[b]] : 0;
  }

  // 生成多项式 g(x) = ∏(x - α^i)，系数从高次到低次
  function generator(deg) {
    var g = [1];
    for (var i = 0; i < deg; i++) {
      var ng = new Array(g.length + 1);
      for (var k = 0; k < ng.length; k++) ng[k] = 0;
      for (var k2 = 0; k2 < g.length; k2++) {
        ng[k2] ^= g[k2];
        ng[k2 + 1] ^= mul(g[k2], EXP[i]);
      }
      g = ng;
    }
    return g;
  }

  // Reed-Solomon 余式（综合除法）
  function rsEncode(data, ecLen) {
    var g = generator(ecLen);
    var res = new Array(ecLen);
    for (var i = 0; i < ecLen; i++) res[i] = 0;
    for (var d = 0; d < data.length; d++) {
      var factor = data[d] ^ res[0];
      res.shift();
      res.push(0);
      if (factor) {
        for (var j = 0; j < ecLen; j++) res[j] ^= mul(g[j + 1], factor);
      }
    }
    return res;
  }

  function toBytes(str) {
    if (root.TextEncoder) return Array.prototype.slice.call(new root.TextEncoder().encode(str));
    // 老浏览器兜底：只处理 ASCII（游戏链接是纯 ASCII）
    var out = [];
    for (var i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xff);
    return out;
  }

  // 模式 + 长度 + 数据 → 补终止符 / 填充字节
  function buildCodewords(bytes) {
    var bits = [];
    function push(val, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    }
    push(4, 4); // byte mode
    push(bytes.length, 8);
    for (var i = 0; i < bytes.length; i++) push(bytes[i], 8);

    var cap = DATA_CW * 8;
    if (bits.length > cap - 4) throw new Error('QR payload too long');
    for (var t = 0; t < 4 && bits.length < cap; t++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    var cw = [];
    for (var b = 0; b < bits.length; b += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bits[b + k];
      cw.push(v);
    }
    var pads = [0xec, 0x11];
    for (var p = 0; cw.length < DATA_CW; p++) cw.push(pads[p % 2]);
    return cw;
  }

  function makeMatrix(text) {
    var bytes = toBytes(text);
    if (bytes.length > 42) throw new Error('QR payload too long');
    var data = buildCodewords(bytes);
    var all = data.concat(rsEncode(data, EC_CW));

    var m = [];
    var r, c;
    for (r = 0; r < SIZE; r++) {
      m[r] = [];
      for (c = 0; c < SIZE; c++) m[r][c] = null;
    }

    function finder(row, col) {
      for (var rr = -1; rr <= 7; rr++) {
        for (var cc = -1; cc <= 7; cc++) {
          var y = row + rr;
          var x = col + cc;
          if (y < 0 || y >= SIZE || x < 0 || x >= SIZE) continue;
          m[y][x] =
            (rr >= 0 && rr <= 6 && (cc === 0 || cc === 6)) ||
            (cc >= 0 && cc <= 6 && (rr === 0 || rr === 6)) ||
            (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
        }
      }
    }
    finder(0, 0);
    finder(0, SIZE - 7);
    finder(SIZE - 7, 0);

    // 定时图案
    for (var i = 8; i < SIZE - 8; i++) {
      m[i][6] = i % 2 === 0;
      m[6][i] = i % 2 === 0;
    }

    // 对齐图案（Version 3 只有 (22,22) 需要画）
    if (m[ALIGN][ALIGN] === null) {
      for (var ar = -2; ar <= 2; ar++) {
        for (var ac = -2; ac <= 2; ac++) {
          m[ALIGN + ar][ALIGN + ac] = Math.max(Math.abs(ar), Math.abs(ac)) !== 1;
        }
      }
    }

    // 格式信息：EC=M(00) + mask 0 → 固定 0x5412
    var fmt = 0x5412;
    for (var f = 0; f < 15; f++) {
      var bit = ((fmt >> f) & 1) === 1;
      if (f < 6) m[f][8] = bit;
      else if (f < 8) m[f + 1][8] = bit;
      else m[SIZE - 15 + f][8] = bit;
    }
    for (var h = 0; h < 15; h++) {
      var bit2 = ((fmt >> h) & 1) === 1;
      if (h < 8) m[8][SIZE - h - 1] = bit2;
      else if (h < 9) m[8][15 - h - 1 + 1] = bit2;
      else m[8][15 - h - 1] = bit2;
    }
    m[SIZE - 8][8] = true; // dark module

    // 数据按之字形填充 + mask 0
    var inc = -1;
    var row = SIZE - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    for (var col = SIZE - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (;;) {
        for (var cc2 = 0; cc2 < 2; cc2++) {
          if (m[row][col - cc2] === null) {
            var dark = byteIndex < all.length && ((all[byteIndex] >>> bitIndex) & 1) === 1;
            if ((row + col - cc2) % 2 === 0) dark = !dark;
            m[row][col - cc2] = dark;
            bitIndex--;
            if (bitIndex < 0) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || row >= SIZE) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
    return m;
  }

  // 画到任意 canvas 2d context 的指定区域（整数模块宽度，保证扫码清晰）
  function draw(ctx, text, x, y, size, opts) {
    opts = opts || {};
    var m = makeMatrix(text);
    var quiet = 4;
    var total = SIZE + quiet * 2;
    var module = Math.max(1, Math.floor(size / total));
    var px = module * total;
    var ox = x + (size - px) / 2;
    var oy = y + (size - px) / 2;

    ctx.fillStyle = opts.bg || '#ffffff';
    ctx.fillRect(ox, oy, px, px);
    ctx.fillStyle = opts.fg || '#0b1020';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (m[r][c]) ctx.fillRect(ox + (c + quiet) * module, oy + (r + quiet) * module, module, module);
      }
    }
    return { x: ox, y: oy, size: px };
  }

  var api = { matrix: makeMatrix, draw: draw };
  root.GeoDailyQR = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
