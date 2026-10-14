// 音频管理器：用 Web Audio API 实时合成音效与 BGM（无需任何外部音频文件，离线可用）。
// - playPlace(): 放对位置的提示音
// - playError(): 放错位置的轻微提示
// - playWin(): 全部完成的胜利音
// - startBGM()/stopBGM(): 全局循环背景音乐（练习/挑战模式均播放）
// 浏览器自动播放策略要求 AudioContext 在用户手势后启动，故 ensure() 在首次交互时调用。

// BGM 旋律：C 大调五声音阶（宫商角徵羽）轻快循环 + 五度柔和铺底
const BGM_MELODY = [
  523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0,
  523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
];
const BGM_BASS = [130.81, 130.81, 174.61, 174.61, 196.0, 196.0, 146.83, 146.83];

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxMuted = false; // 音效（点击/放对/放错/胜利）独立开关
    this.bgmMuted = false; // 背景音乐独立开关
    this.bgmOn = false;
    this._bgmTimer = null;
    this._bgmStep = 0;
    this._nextNoteTime = 0;
  }

  // 在用户手势中调用：创建/恢复 AudioContext
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  // 音效开关（不影响 BGM）
  setSfxMuted(m) {
    this.sfxMuted = m;
  }
  // 背景音乐开关；关闭时立即停止 BGM
  setBgmMuted(m) {
    this.bgmMuted = m;
    if (m) this.stopBGM();
  }

  // 单个音符：带柔和包络
  _tone(freq, start, dur, type = 'sine', vol = 0.2, dest = null) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(dest || this.master);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  playPlace() {
    this.ensure();
    if (!this.ctx || this.sfxMuted) return;
    const t = this.ctx.currentTime;
    this._tone(659.25, t, 0.12, 'sine', 0.25); // E5
    this._tone(987.77, t + 0.08, 0.18, 'sine', 0.22); // B5
  }

  playError() {
    this.ensure();
    if (!this.ctx || this.sfxMuted) return;
    const t = this.ctx.currentTime;
    this._tone(174.61, t, 0.16, 'triangle', 0.16); // F3 轻微低音
  }

  // 通用 UI 点击反馈音（短促轻点），受音效开关控制
  playClick() {
    this.ensure();
    if (!this.ctx || this.sfxMuted) return;
    const t = this.ctx.currentTime;
    this._tone(880, t, 0.045, 'triangle', 0.12);
  }

  playWin() {
    this.ensure();
    if (!this.ctx || this.sfxMuted) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this._tone(f, t + i * 0.12, 0.32, 'sine', 0.22)
    );
  }

  startBGM() {
    this.ensure();
    if (!this.ctx || this.bgmOn || this.bgmMuted) return;
    this.bgmOn = true;
    this._bgmStep = 0;
    this._nextNoteTime = this.ctx.currentTime + 0.1;
    this._bgmTimer = setInterval(() => this._scheduleBGM(), 60);
  }

  stopBGM() {
    this.bgmOn = false;
    if (this._bgmTimer) {
      clearInterval(this._bgmTimer);
      this._bgmTimer = null;
    }
  }

  // 轻快五声音阶旋律循环（宫商角徵羽），配五度柔和铺底 —— 区别于旧版和弦铺底
  _scheduleBGM() {
    if (!this.bgmOn || !this.ctx) return;
    const ctx = this.ctx;
    const lookahead = 0.3;
    while (this._nextNoteTime < ctx.currentTime + lookahead) {
      const step = this._bgmStep;
      const mel = BGM_MELODY[step % BGM_MELODY.length];
      this._tone(mel, this._nextNoteTime, 0.28, 'sine', 0.08); // 主旋律
      if (step % 2 === 0) {
        const bass = BGM_BASS[(step >> 1) % BGM_BASS.length];
        this._tone(bass, this._nextNoteTime, 0.55, 'triangle', 0.05); // 低音根
        this._tone(bass * 1.5, this._nextNoteTime, 0.5, 'sine', 0.03); // 五度和声
      }
      this._nextNoteTime += 0.3;
      this._bgmStep++;
    }
  }
}
