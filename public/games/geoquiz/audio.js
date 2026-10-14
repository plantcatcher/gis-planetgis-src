/**
 * 卫星之眼 · 音效系统
 * 使用 Web Audio API 合成所有音效，无需外部音频文件
 * 包含：背景音乐(BGM) + 交互音效
 */

const AudioEngine = {
  ctx: null,           // AudioContext
  masterGain: null,    // 主音量
  bgmGain: null,       // BGM 音量
  sfxGain: null,       // 音效音量
  bgmNodes: [],        // BGM 节点引用
  bgmTimer: null,      // BGM 循环定时器
  isBgmOn: false,
  isMuted: false,
  isInitialized: false,

  /** 初始化音频上下文（必须在用户交互后调用） */
  init() {
    if (this.isInitialized) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.18;
      this.sfxGain.gain.value = 0.5;
      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  },

  /** 恢复被暂停的音频上下文（浏览器策略） */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  // ==================== 音效合成 ====================

  /**
   * 合成一个简单的音调
   * @param {number} freq - 频率(Hz)
   * @param {number} duration - 持续时间(秒)
   * @param {string} type - 波形 sine/triangle/square/sawtooth
   * @param {number} startAt - 开始时间偏移
   * @param {number} peak - 峰值音量 0-1
   * @param {Object} opts - 附加选项
   */
  tone(freq, duration, type = 'sine', startAt = 0, peak = 0.5, opts = {}) {
    if (!this.ctx || this.isMuted) return;
    const t0 = this.ctx.currentTime + startAt;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    // 包络：快速上升 + 指数衰减
    const attack = opts.attack || 0.01;
    const decay = opts.decay || 0.1;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    // 频率滑动（可选）
    if (opts.freqTo) {
      osc.frequency.exponentialRampToValueAtTime(opts.freqTo, t0 + duration);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  },

  /** 噪声生成（用于打击/错误音） */
  noise(duration, startAt = 0, peak = 0.3, type = 'lowpass') {
    if (!this.ctx || this.isMuted) return;
    const t0 = this.ctx.currentTime + startAt;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = 800;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  },

  // ==================== 交互音效 ====================

  /** 点击/选择音效（短促清脆） */
  click() {
    this.tone(880, 0.08, 'triangle', 0, 0.3);
    this.tone(1320, 0.06, 'sine', 0.02, 0.15);
  },

  /** 悬停音效（极轻） */
  hover() {
    this.tone(660, 0.04, 'sine', 0, 0.1);
  },

  /** 答对音效（上扬的双音叮咚） */
  correct() {
    this.tone(523.25, 0.12, 'sine', 0, 0.4);       // C5
    this.tone(659.25, 0.12, 'sine', 0.1, 0.4);     // E5
    this.tone(783.99, 0.25, 'sine', 0.2, 0.45);    // G5
    this.tone(1046.5, 0.3, 'sine', 0.25, 0.3);     // C6 高八度
  },

  /** 答错音效（低沉下行） */
  wrong() {
    this.tone(220, 0.3, 'sawtooth', 0, 0.25, { freqTo: 110 });
    this.noise(0.15, 0, 0.12, 'lowpass');
  },

  /** 连击音效（华丽琶音） */
  streak(n) {
    const baseFreq = 523.25; // C5
    const notes = [0, 4, 7, 12, 16, 19]; // 半音偏移
    const count = Math.min(n, 4);
    for (let i = 0; i < count; i++) {
      const semi = notes[i] || 19;
      const freq = baseFreq * Math.pow(2, semi / 12);
      this.tone(freq, 0.15, 'triangle', i * 0.05, 0.3);
    }
  },

  /** 开始游戏音效（升空感） */
  start() {
    this.tone(196, 0.4, 'sine', 0, 0.3, { freqTo: 880, attack: 0.05 });
    this.tone(392, 0.5, 'triangle', 0.15, 0.2);
    this.noise(0.3, 0, 0.08, 'highpass');
  },

  /** 结算音效（胜利号角） */
  finish() {
    // C大调琶音
    const notes = [261.63, 329.63, 392, 523.25, 659.25];
    notes.forEach((f, i) => {
      this.tone(f, 0.4, 'triangle', i * 0.1, 0.35);
    });
    this.tone(523.25, 0.6, 'sine', 0.5, 0.3);
  },

  /** 切换题目音效（轻柔提示） */
  next() {
    this.tone(440, 0.08, 'sine', 0, 0.2);
    this.tone(587.33, 0.1, 'sine', 0.05, 0.15);
  },

  // ==================== 背景音乐 ====================

  /** 启动背景音乐（环境太空感 pad + 轻节奏） */
  startBgm() {
    if (!this.ctx || this.isBgmOn) return;
    this.isBgmOn = true;
    this._playBgmLoop();
  },

  /** 停止背景音乐 */
  stopBgm() {
    this.isBgmOn = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmNodes.forEach(n => {
      try { n.stop(); } catch (e) {}
    });
    this.bgmNodes = [];
  },

  /** BGM 循环：柔和的和弦 pad */
  _playBgmLoop() {
    if (!this.isBgmOn) return;
    // C大调 - A小调 缓和进行的和弦序列
    const chords = [
      { freqs: [130.81, 196, 261.63, 329.63], name: 'Cmaj' },   // C E G C
      { freqs: [110, 164.81, 220, 261.63], name: 'Am' },         // A E A C
      { freqs: [146.83, 220, 293.66, 349.23], name: 'Dm' },      // D A D F
      { freqs: [98, 146.83, 196, 246.94], name: 'G' },           // G D G B
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isBgmOn || !this.ctx) return;
      const chord = chords[chordIdx % chords.length];
      const t0 = this.ctx.currentTime;
      const dur = 4; // 每个和弦 4 秒

      chord.freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        // 缓慢淡入淡出
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.25 / chord.freqs.length, t0 + 1.0);
        gain.gain.linearRampToValueAtTime(0.25 / chord.freqs.length, t0 + dur - 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        // 轻微颤音
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 1.5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t0);
        lfo.start(t0);
        osc.stop(t0 + dur + 0.1);
        lfo.stop(t0 + dur + 0.1);

        this.bgmNodes.push(osc, lfo);
      });

      // 高音点缀（钟琴感）
      const sparkleFreqs = [523.25, 659.25, 783.99, 1046.5];
      sparkleFreqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        const st = t0 + i * 0.8;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(0.06, st + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 1.5);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(st);
        osc.stop(st + 1.6);
        this.bgmNodes.push(osc);
      });

      // 清理旧节点
      this.bgmNodes = this.bgmNodes.filter(n => {
        try { return n.context.currentTime < t0 + dur; } catch (e) { return false; }
      });

      chordIdx++;
    };

    playChord();
    this.bgmTimer = setInterval(() => {
      if (this.isBgmOn) playChord();
    }, 4000);
  },

  // ==================== 全局控制 ====================

  /** 静音/取消静音 */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  },

  /** 设置 BGM 音量 0-1 */
  setBgmVolume(v) {
    if (this.bgmGain) this.bgmGain.gain.value = v * 0.3;
  },

  /** 设置音效音量 0-1 */
  setSfxVolume(v) {
    if (this.sfxGain) this.sfxGain.gain.value = v;
  },
};

// 暴露到全局
window.AudioEngine = AudioEngine;
