/**
 * 卫星之眼 · 本地数据存储管理
 * 负责：进度恢复、城市统计、全局统计、设置持久化
 */

const STORAGE_KEY = 'satellite_eye_data';
const DATA_VERSION = 1;

// ==================== 默认数据结构 ====================

function createDefaultData() {
  return {
    version: DATA_VERSION,
    lastUpdated: Date.now(),

    // 进行中的挑战（用于恢复）
    activeGame: {
      inProgress: false,
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      answers: [],
      startTime: null,
    },

    // 每座城市的统计
    cityStats: {},

    // 全局统计
    globalStats: {
      totalGames: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalScore: 0,
      bestScore: 0,
      maxStreak: 0,
      totalTimeSpent: 0,
      lastGameAt: null,
    },

    // 学习模式
    learn: {
      lastCityIndex: 0,
      exploredCityIds: [],
    },

    // 用户设置
    settings: {
      muted: false,
      randomOrder: true,       // true=随机出题, false=按ID顺序
      allowRepeat: false,      // true=允许重复出题, false=优先未见过城市（默认关闭，优先未见过城市）
    },

  };
}

// ==================== 读写核心 ====================

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const data = JSON.parse(raw);
    // 版本兼容：未来可在这里做数据迁移
    if (!data.version || data.version < DATA_VERSION) {
      return migrateData(data);
    }
    return { ...createDefaultData(), ...data };
  } catch (e) {
    console.warn('[Storage] 读取失败，使用默认数据', e);
    return createDefaultData();
  }
}

function saveData(data) {
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Storage] 保存失败', e);
  }
}

function migrateData(oldData) {
  // 版本迁移占位
  const fresh = createDefaultData();
  // 保留能保留的旧数据
  if (oldData.globalStats) fresh.globalStats = { ...fresh.globalStats, ...oldData.globalStats };
  if (oldData.cityStats) fresh.cityStats = oldData.cityStats;
  if (oldData.learn) fresh.learn = { ...fresh.learn, ...oldData.learn };
  if (oldData.settings) fresh.settings = { ...fresh.settings, ...oldData.settings };
  fresh.version = DATA_VERSION;
  saveData(fresh);
  return fresh;
}

// ==================== 便捷 API ====================

const Storage = {
  _cache: null,

  _get() {
    if (!this._cache) this._cache = loadData();
    return this._cache;
  },

  _set(data) {
    this._cache = data;
    saveData(data);
  },

  // ---------- 进行中的挑战 ----------

  hasActiveGame() {
    const d = this._get();
    return d.activeGame && d.activeGame.inProgress;
  },

  getActiveGame() {
    return this._get().activeGame;
  },

  startGame(questions) {
    const d = this._get();
    d.activeGame = {
      inProgress: true,
      questions: questions.map(c => c.id),
      currentIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      answers: [],
      startTime: Date.now(),
    };
    this._set(d);
  },

  saveGameProgress(state) {
    const d = this._get();
    d.activeGame = {
      inProgress: true,
      questions: state.questions.map(c => c.id),
      currentIndex: state.currentIndex,
      score: state.score,
      streak: state.streak,
      maxStreak: state.maxStreak,
      correctCount: state.correctCount,
      answers: state.answers,
      startTime: d.activeGame.startTime || Date.now(),
    };
    this._set(d);
  },

  clearActiveGame() {
    const d = this._get();
    d.activeGame = createDefaultData().activeGame;
    this._set(d);
  },

  restoreGameState() {
    const ag = this._get().activeGame;
    if (!ag.inProgress) return null;
    return {
      questions: ag.questions.map(id => CITY_DB.find(c => c.id === id)).filter(Boolean),
      currentIndex: ag.currentIndex,
      score: ag.score,
      streak: ag.streak,
      maxStreak: ag.maxStreak,
      correctCount: ag.correctCount,
      answers: ag.answers,
    };
  },

  // ---------- 城市统计 ----------

  recordCityAnswer(cityId, isCorrect) {
    const d = this._get();
    if (!d.cityStats[cityId]) {
      d.cityStats[cityId] = {
        seenCount: 0,
        correctCount: 0,
        wrongCount: 0,
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        explored: false,
        exploredAt: null,
      };
    }
    const stat = d.cityStats[cityId];
    stat.seenCount++;
    stat.lastSeenAt = Date.now();
    if (isCorrect) stat.correctCount++;
    else stat.wrongCount++;
    this._set(d);
  },

  recordCityExplored(cityId) {
    const d = this._get();
    if (!d.cityStats[cityId]) {
      d.cityStats[cityId] = {
        seenCount: 0,
        correctCount: 0,
        wrongCount: 0,
        firstSeenAt: null,
        lastSeenAt: null,
        explored: true,
        exploredAt: Date.now(),
      };
    } else {
      d.cityStats[cityId].explored = true;
      d.cityStats[cityId].exploredAt = Date.now();
    }
    // 同时记录到学习模式列表
    if (!d.learn.exploredCityIds.includes(cityId)) {
      d.learn.exploredCityIds.push(cityId);
    }
    this._set(d);
  },

  getCityStat(cityId) {
    return this._get().cityStats[cityId] || null;
  },

  getAllCityStats() {
    return this._get().cityStats;
  },

  getExploredCityIds() {
    return this._get().learn.exploredCityIds;
  },

  // ---------- 全局统计 ----------

  recordGameFinish(score, correctCount, totalQuestions, maxStreak, timeSpentSeconds) {
    const d = this._get();
    d.globalStats.totalGames++;
    d.globalStats.totalQuestions += totalQuestions;
    d.globalStats.totalCorrect += correctCount;
    d.globalStats.totalScore += score;
    d.globalStats.totalTimeSpent += timeSpentSeconds || 0;
    if (score > d.globalStats.bestScore) d.globalStats.bestScore = score;
    if (maxStreak > d.globalStats.maxStreak) d.globalStats.maxStreak = maxStreak;
    d.globalStats.lastGameAt = Date.now();
    this._set(d);
  },

  getGlobalStats() {
    return this._get().globalStats;
  },

  // ---------- 大洲统计 ----------

  getContinentStats() {
    const d = this._get();
    const stats = {};
    Object.entries(d.cityStats).forEach(([cityId, stat]) => {
      const city = CITY_DB.find(c => c.id === Number(cityId));
      if (!city) return;
      const continent = getCityContinent(city);
      if (!stats[continent]) {
        stats[continent] = { seen: 0, correct: 0, wrong: 0, totalCities: 0 };
      }
      stats[continent].seen += stat.seenCount;
      stats[continent].correct += stat.correctCount;
      stats[continent].wrong += stat.wrongCount;
    });
    // 统计各洲总城市数
    CITY_DB.forEach(c => {
      const continent = getCityContinent(c);
      if (!stats[continent]) stats[continent] = { seen: 0, correct: 0, wrong: 0, totalCities: 0 };
      stats[continent].totalCities++;
    });
    return stats;
  },

  // ---------- 学习模式 ----------

  getLearnLastCityIndex() {
    return this._get().learn.lastCityIndex;
  },

  setLearnLastCityIndex(index) {
    const d = this._get();
    d.learn.lastCityIndex = index;
    this._set(d);
  },

  // ---------- 设置 ----------

  getSettings() {
    return this._get().settings;
  },

  setMuted(muted) {
    const d = this._get();
    d.settings.muted = muted;
    this._set(d);
  },

  setGameSetting(key, value) {
    const d = this._get();
    d.settings[key] = value;
    this._set(d);
  },

  getSeenCityIds() {
    const d = this._get();
    return Object.keys(d.cityStats)
      .filter(id => d.cityStats[id].seenCount > 0)
      .map(Number);
  },

  // ---------- 成就相关（预留）----------

  getAchievements() {
    const d = this._get();
    return d.achievements || {};
  },

  // ---------- 工具 ----------

  getTopWeakCities(limit = 5) {
    const d = this._get();
    const list = Object.entries(d.cityStats)
      .filter(([_, s]) => s.seenCount > 0)
      .map(([cityId, s]) => {
        const city = CITY_DB.find(c => c.id === Number(cityId));
        const accuracy = s.seenCount > 0 ? s.correctCount / s.seenCount : 0;
        return { city, accuracy, seen: s.seenCount, correct: s.correctCount, wrong: s.wrongCount };
      })
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);
    return list;
  },

  getTopStrongCities(limit = 5) {
    const d = this._get();
    const list = Object.entries(d.cityStats)
      .filter(([_, s]) => s.seenCount > 0)
      .map(([cityId, s]) => {
        const city = CITY_DB.find(c => c.id === Number(cityId));
        const accuracy = s.seenCount > 0 ? s.correctCount / s.seenCount : 0;
        return { city, accuracy, seen: s.seenCount };
      })
      .filter(item => item.seen >= 2) // 至少遇到2次才算熟悉
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit);
    return list;
  },

  // 导出/重置
  exportData() {
    return JSON.stringify(this._get(), null, 2);
  },

  resetAll() {
    this._cache = createDefaultData();
    saveData(this._cache);
  },
};

// ==================== 大洲分类工具 ====================

function getCityContinent(city) {
  const name = city.name;
  const country = city.country;

  // 亚洲
  const asianCountries = ['中国', '日本', '韩国', '新加坡', '泰国', '印度', '阿联酋', '卡塔尔', '沙特', '以色列', '马来西亚', '印尼', '越南', '土耳其', '哈萨克斯坦', '尼泊尔', '斯里兰卡', '菲律宾', '巴基斯坦', '伊朗', '朝鲜', '缅甸', '也门'];
  if (asianCountries.includes(country)) return '亚洲';

  // 欧洲
  const europeanCountries = ['法国', '英国', '意大利', '荷兰', '西班牙', '德国', '奥地利', '捷克', '匈牙利', '希腊', '俄罗斯', '葡萄牙', '爱尔兰', '丹麦', '瑞典', '芬兰', '挪威', '冰岛', '瑞士'];
  if (europeanCountries.includes(country)) return '欧洲';

  // 美洲
  const americanCountries = ['美国', '巴西', '阿根廷', '墨西哥', '加拿大', '秘鲁', '智利', '哥伦比亚', '古巴'];
  if (americanCountries.includes(country)) return '美洲';

  // 非洲
  const africanCountries = ['埃及', '南非', '肯尼亚', '尼日利亚', '摩洛哥', '埃塞俄比亚', '坦桑尼亚', '科特迪瓦', '加纳'];
  if (africanCountries.includes(country)) return '非洲';

  // 大洋洲
  const oceaniaCountries = ['澳大利亚', '新西兰'];
  if (oceaniaCountries.includes(country)) return '大洋洲';

  return '其他';
}

// ==================== 兼容旧版 bestScore ====================

function migrateOldBestScore() {
  const old = localStorage.getItem('satellite_city_best_score');
  if (old !== null) {
    const best = parseInt(old) || 0;
    const d = Storage._get();
    if (best > d.globalStats.bestScore) {
      d.globalStats.bestScore = best;
      Storage._set(d);
    }
    // 可选：删除旧key
    // localStorage.removeItem('satellite_city_best_score');
  }
}

// 页面加载时执行迁移
migrateOldBestScore();
