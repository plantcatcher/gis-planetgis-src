/**
 * 卫星之眼 · 游戏核心逻辑
 * 单页应用：首页 -> 游戏 -> 结算
 */

// ==================== 状态管理 ====================
const GameState = {
  questions: [],      // 当前题目顺序（随机打乱）
  currentIndex: 0,    // 当前题号
  score: 0,           // 当前总分
  streak: 0,          // 当前连击
  maxStreak: 0,       // 最高连击
  correctCount: 0,    // 答对题数
  answers: [],        // 答题记录 [{cityId, correct, score}]
  map: null,          // 游戏 Leaflet 实例
  isAnswered: false,  // 当前题是否已作答
  gameStartTime: null,// 本局开始时间

  // 学习模式状态
  learnMap: null,     // 学习模式 Leaflet 实例
  learnCityIndex: 0,  // 当前学习的城市索引
  learnSearchQuery: '', // 搜索关键词
};

// ==================== DOM 引用 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // 视图
  homeView: $('#homeView'),
  gameView: $('#gameView'),
  resultView: $('#resultView'),
  learnView: $('#learnView'),

  // 首页
  startBtn: $('#startBtn'),
  continueBtn: $('#continueBtn'),
  continueBadge: $('#continueBadge'),
  learnBtn: $('#learnBtn'),
  settingsBtn: $('#settingsBtn'),
  settingsModal: $('#settingsModal'),
  closeSettings: $('#closeSettings'),
  settingRandom: $('#settingRandom'),
  settingRepeat: $('#settingRepeat'),
  settingSound: $('#settingSound'),
  settingLang: $('#settingLang'),
  settingsHint: $('#settingsHint'),
  homeBestScore: $('#homeBestScore'),
  bestScoreNum: $('#homeBestScore .score-num'),
  statsOverview: $('#statsOverview'),
  statTotalGames: $('#statTotalGames'),
  statTotalCities: $('#statTotalCities'),
  statExplored: $('#statExplored'),
  statAccuracy: $('#statAccuracy'),
  continentBars: $('#continentBars'),
  journeyHint: $('#journeyHint'),

  // 游戏页 - 顶部
  quitBtn: $('#quitBtn'),
  progressFill: $('#progressFill'),
  progressText: $('#progressText'),
  currentScore: $('#currentScore'),
  muteBtn: $('#muteBtn'),
  streakBanner: $('#streakBanner'),

  // 游戏页 - 地图区
  mapLoader: $('#mapLoader'),
  scanLine: $('#scanLine'),
  satelliteMap: $('#satelliteMap'),
  hintBar: $('#hintBar'),
  hintBarText: $('#hintBarText'),

  // 游戏页 - 答题面板
  optionsView: $('#optionsView'),
  optionsGrid: $('#optionsGrid'),
  feedbackView: $('#feedbackView'),
  feedbackIcon: $('#feedbackIcon'),
  feedbackResult: $('#feedbackResult'),
  feedbackScore: $('#feedbackScore'),
  triviaList: $('#triviaList'),
  nextBtn: $('#nextBtn'),
  nextBtnText: $('#nextBtnText'),

  // 结算页
  resultEmoji: $('#resultEmoji'),
  resultTitle: $('#resultTitle'),
  resultDesc: $('#resultDesc'),
  finalScore: $('#finalScore'),
  correctCount: $('#correctCount'),
  maxStreak: $('#maxStreak'),
  accuracy: $('#accuracy'),
  reviewList: $('#reviewList'),
  shareContent: $('#shareContent'),
  shareBtn: $('#shareBtn'),
  saveScreenshotBtn: $('#saveScreenshotBtn'),
  screenshotArea: $('#screenshotArea'),
  restartBtn: $('#restartBtn'),
  backHomeBtn: $('#backHomeBtn'),
  historyStatsSection: $('#historyStatsSection'),
  historyStatsGrid: $('#historyStatsGrid'),
  continentSection: $('#continentSection'),
  continentList: $('#continentList'),
  familiarSection: $('#familiarSection'),
  familiarGrid: $('#familiarGrid'),

  // 学习模式
  learnBackBtn: $('#learnBackBtn'),
  learnSearchInput: $('#learnSearchInput'),
  searchClear: $('#searchClear'),
  searchSuggestions: $('#searchSuggestions'),
  learnMapLoader: $('#learnMapLoader'),
  learnMapEl: $('#learnMap'),
  learnInfoEmpty: $('#learnInfoEmpty'),
  learnInfoContent: $('#learnInfoContent'),
  learnCityFlag: $('#learnCityFlag'),
  learnCityName: $('#learnCityName'),
  learnCityCountry: $('#learnCityCountry'),
  learnCityFeature: $('#learnCityFeature'),
  learnHintText: $('#learnHintText'),
  learnTriviaList: $('#learnTriviaList'),
  learnPrevBtn: $('#learnPrevBtn'),
  learnNextBtn: $('#learnNextBtn'),

  // 弹窗
  quitModal: $('#quitModal'),
  cancelQuit: $('#cancelQuit'),
  confirmQuit: $('#confirmQuit'),

  // Toast
  toast: $('#toast'),
};

// ==================== 工具函数 ====================

function cityText(city, field) {
  if (I18n.currentLang === 'en') {
    return city[field + 'En'] || city[field];
  }
  return city[field];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg, duration = 2000) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), duration);
}

function switchView(viewName) {
  ['homeView', 'gameView', 'resultView', 'learnView'].forEach(v => {
    els[v].classList.toggle('hidden', v !== viewName);
  });
}

function formatDuration(seconds) {
  if (I18n.currentLang === 'en') {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m${s}s` : `${m}m`;
  }
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}分${s}秒` : `${m}分`;
}

// ==================== 首页统计渲染 ====================

function renderHomeStats() {
  const global = Storage.getGlobalStats();
  const allStats = Storage.getAllCityStats();
  const exploredIds = Storage.getExploredCityIds();

  // 最佳成绩
  if (global.bestScore > 0) {
    els.homeBestScore.innerHTML = I18n.t('bestScore', { score: `<span class="score-num">${global.bestScore}</span>` });
    els.homeBestScore.style.display = '';
  } else {
    els.homeBestScore.style.display = 'none';
  }

  // 概览常显：即使未开始游戏也展示，作为「探索征程」的起点
  const hasData = global.totalGames > 0 || exploredIds.length > 0;
  if (els.journeyHint) {
    els.journeyHint.style.display = hasData ? 'none' : 'block';
  }

  // 总挑战次数
  els.statTotalGames.textContent = global.totalGames;
  // 遇过城市数（去重）
  const seenCityIds = Object.keys(allStats).filter(id => allStats[id].seenCount > 0);
  els.statTotalCities.textContent = `${seenCityIds.length}/${CITY_DB.length}`;
  // 已探索
  els.statExplored.textContent = `${exploredIds.length}/${CITY_DB.length}`;
  // 正确率
  const accuracy = global.totalQuestions > 0
    ? Math.round((global.totalCorrect / global.totalQuestions) * 100)
    : 0;
  els.statAccuracy.textContent = `${accuracy}%`;

  // 大洲进度条（常显，未探索显示 0% / 未探索）
  renderContinentBars();

  // 继续挑战按钮
  if (Storage.hasActiveGame()) {
    const ag = Storage.getActiveGame();
    const currentQ = ag.currentIndex + 1;
    const totalQ = ag.questions.length;
    els.continueBadge.textContent = I18n.currentLang === 'en'
      ? `${currentQ}/${totalQ}`
      : `第${currentQ}/${totalQ}题`;
    els.continueBtn.style.display = '';
  } else {
    els.continueBtn.style.display = 'none';
  }
}

function renderContinentBars() {
  const continentStats = Storage.getContinentStats();
  const container = els.continentBars;
  container.innerHTML = '';

  const continentMap = {
    '亚洲': { en: 'continentAsia', color: '#FF6B6B' },
    '欧洲': { en: 'continentEurope', color: '#4ECDC4' },
    '美洲': { en: 'continentAmerica', color: '#45B7D1' },
    '非洲': { en: 'continentAfrica', color: '#FFA07A' },
    '大洋洲': { en: 'continentOceania', color: '#96CEB4' },
  };
  const continentOrder = ['亚洲', '欧洲', '美洲', '非洲', '大洋洲'];

  continentOrder.forEach(name => {
    const info = continentMap[name];
    if (!info) return;
    const stat = continentStats[name];
    if (!stat || stat.totalCities === 0) return;
    const seen = stat.seen;
    const correct = stat.correct;
    const total = stat.totalCities;
    const barPct = Math.round((seen / total) * 100);
    const accPct = seen > 0 ? Math.round((correct / seen) * 100) : 0;
    const color = info.color;

    const bar = document.createElement('div');
    bar.className = 'continent-bar-item';
    bar.innerHTML = `
      <div class="continent-bar-header">
        <span class="continent-name">${I18n.t(info.en)}</span>
        <span class="continent-bar-text">${seen > 0 ? accPct + '%' : I18n.t('continentNotPlayed')}</span>
      </div>
      <div class="continent-bar-track">
        <div class="continent-bar-fill" style="width:${barPct}%; background:${color};"></div>
      </div>
      <div class="continent-bar-sub">${I18n.t('continentEncountered', { seen, total })}</div>
    `;
    container.appendChild(bar);
  });
}

// ==================== 地图初始化 ====================

function initMap() {
  if (GameState.map) return;

  GameState.map = L.map('satelliteMap', {
    dragging: false,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: true,
  });

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
      minZoom: 1,
    }
  ).addTo(GameState.map);
}

function loadCityMap(city) {
  if (!GameState.map) initMap();

  els.mapLoader.classList.remove('hidden');
  els.hintBar.classList.remove('show');

  // 触发扫描线动效
  els.scanLine.classList.remove('active');
  void els.scanLine.offsetWidth;
  els.scanLine.classList.add('active');

  const m = GameState.map;

  requestAnimationFrame(() => {
    m.invalidateSize();
    m.setView([city.lat, city.lng], city.zoom, { animate: false });
  });

  setTimeout(() => {
    els.mapLoader.classList.add('hidden');
    setTimeout(() => {
      els.hintBarText.textContent = cityText(city, 'hint');
      els.hintBar.classList.add('show');
    }, 400);
  }, 800);
}

// ==================== 学习模式 ====================

function initLearnMap() {
  if (GameState.learnMap) return;

  GameState.learnMap = L.map('learnMap', {
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
    attributionControl: true,
  });

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
      minZoom: 1,
    }
  ).addTo(GameState.learnMap);
}

function showLearnCity(city) {
  if (!GameState.learnMap) initLearnMap();

  els.learnMapLoader.classList.remove('hidden');

  const m = GameState.learnMap;
  requestAnimationFrame(() => {
    m.invalidateSize();
    m.setView([city.lat, city.lng], city.zoom, { animate: false });
  });

  setTimeout(() => {
    els.learnMapLoader.classList.add('hidden');
  }, 600);

  // 填充城市信息
  els.learnCityFlag.textContent = city.flag;
  els.learnCityName.textContent = cityText(city, 'name');
  els.learnCityCountry.textContent = cityText(city, 'country');
  els.learnCityFeature.textContent = `${I18n.t('hintLabel')}${cityText(city, 'feature')}`;
  els.learnHintText.textContent = cityText(city, 'hint');

  els.learnTriviaList.innerHTML = '';
  cityText(city, 'trivia').forEach(t => {
    const item = document.createElement('div');
    item.className = 'trivia-item';
    item.textContent = t;
    els.learnTriviaList.appendChild(item);
  });

  els.learnInfoEmpty.style.display = 'none';
  els.learnInfoContent.style.display = '';

  els.learnSearchInput.value = cityText(city, 'name');
  els.searchClear.style.display = '';

  // 记录探索
  Storage.recordCityExplored(city.id);
  Storage.setLearnLastCityIndex(GameState.learnCityIndex);
}

function openLearnMode() {
  switchView('learnView');

  setTimeout(() => {
    if (GameState.learnMap) {
      GameState.learnMap.invalidateSize();
    }
  }, 100);

  // 恢复上次浏览的城市
  const savedIndex = Storage.getLearnLastCityIndex();
  if (savedIndex >= 0 && savedIndex < CITY_DB.length) {
    GameState.learnCityIndex = savedIndex;
  }
  const city = CITY_DB[GameState.learnCityIndex];
  showLearnCity(city);
}

function searchCities(query) {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return CITY_DB.filter(c =>
    cityText(c, 'name').toLowerCase().includes(q) ||
    cityText(c, 'country').toLowerCase().includes(q)
  ).slice(0, 8);
}

function renderSuggestions(cities) {
  els.searchSuggestions.innerHTML = '';
  if (cities.length === 0) {
    els.searchSuggestions.style.display = 'none';
    return;
  }

  cities.forEach(city => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `<span class="suggestion-flag">${city.flag}</span><span class="suggestion-name">${cityText(city, 'name')}</span><span class="suggestion-country">${cityText(city, 'country')}</span>`;
    item.addEventListener('click', () => {
      GameState.learnCityIndex = CITY_DB.findIndex(c => c.id === city.id);
      showLearnCity(city);
      els.searchSuggestions.style.display = 'none';
    });
    els.searchSuggestions.appendChild(item);
  });

  els.searchSuggestions.style.display = '';
}

function navigateLearnCity(delta) {
  let idx = GameState.learnCityIndex + delta;
  if (idx < 0) idx = CITY_DB.length - 1;
  if (idx >= CITY_DB.length) idx = 0;
  GameState.learnCityIndex = idx;
  showLearnCity(CITY_DB[idx]);
}

// ==================== 游戏流程 ====================

function startGame() {
  AudioEngine.init();
  AudioEngine.resume();
  AudioEngine.start();
  setTimeout(() => AudioEngine.startBgm(), 500);

  // 根据设置选择抽题方式
  const settings = Storage.getSettings();
  if (!settings.randomOrder) {
    GameState.questions = pickQuestionsInOrder(10);
  } else if (!settings.allowRepeat) {
    const seenIds = Storage.getSeenCityIds();
    GameState.questions = seenIds.length > 0 ? pickQuestionsNoRepeat(10, seenIds) : pickQuestions(10);
  } else {
    GameState.questions = pickQuestions(10);
  }
  GameState.currentIndex = 0;
  GameState.score = 0;
  GameState.streak = 0;
  GameState.maxStreak = 0;
  GameState.correctCount = 0;
  GameState.answers = [];
  GameState.isAnswered = false;
  GameState.gameStartTime = Date.now();

  // 保存到本地存储（用于恢复）
  Storage.startGame(GameState.questions);

  els.currentScore.textContent = '0';
  updateProgress();

  switchView('gameView');
  loadQuestion();
}

function continueGame() {
  const saved = Storage.restoreGameState();
  if (!saved) {
    showToast(I18n.t('noResume'));
    els.continueBtn.style.display = 'none';
    return;
  }

  AudioEngine.init();
  AudioEngine.resume();
  AudioEngine.startBgm();

  GameState.questions = saved.questions;
  GameState.currentIndex = saved.currentIndex;
  GameState.score = saved.score;
  GameState.streak = saved.streak;
  GameState.maxStreak = saved.maxStreak;
  GameState.correctCount = saved.correctCount;
  GameState.answers = saved.answers;
  GameState.isAnswered = false;
  GameState.gameStartTime = Date.now();

  els.currentScore.textContent = GameState.score;
  updateProgress();

  switchView('gameView');
  loadQuestion();
}

function updateProgress() {
  const idx = GameState.currentIndex;
  const total = GameState.questions.length;
  const pct = ((idx + 1) / total) * 100;
  els.progressFill.style.width = `${pct}%`;
  els.progressText.textContent = `${idx + 1} / ${total}`;
}

function loadQuestion() {
  const city = GameState.questions[GameState.currentIndex];
  GameState.isAnswered = false;

  els.feedbackView.classList.remove('active');
  els.feedbackView.style.display = 'none';
  els.optionsView.style.display = '';

  loadCityMap(city);

  const distractors = generateDistractors(city.id, 3);
  const options = shuffle([city, ...distractors]);

  const newGrid = document.createElement('div');
  newGrid.className = 'options-grid';
  newGrid.id = 'optionsGrid';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="city-flag">${opt.flag}</span><span class="city-name">${cityText(opt, 'name')}</span>`;
    btn.dataset.id = opt.id;
    btn.addEventListener('click', () => {
      AudioEngine.click();
      handleAnswer(opt.id, btn);
    });
    btn.addEventListener('mouseenter', () => AudioEngine.hover());
    newGrid.appendChild(btn);
  });

  const oldGrid = els.optionsView.querySelector('.options-grid');
  if (oldGrid) oldGrid.remove();
  els.optionsView.appendChild(newGrid);
  els.optionsGrid = newGrid;

  els.optionsView.style.animation = 'none';
  void els.optionsView.offsetWidth;
  els.optionsView.style.animation = '';
}

function handleAnswer(selectedId, btnEl) {
  if (GameState.isAnswered) return;
  GameState.isAnswered = true;

  const city = GameState.questions[GameState.currentIndex];
  const isCorrect = selectedId === city.id;

  if (isCorrect) {
    AudioEngine.correct();
  } else {
    AudioEngine.wrong();
  }

  $$('.option-btn').forEach(b => (b.disabled = true));

  if (isCorrect) {
    btnEl.classList.add('correct');
    GameState.streak++;
    GameState.correctCount++;
    if (GameState.streak > GameState.maxStreak) {
      GameState.maxStreak = GameState.streak;
    }
  } else {
    btnEl.classList.add('wrong');
    const correctBtn = $(`.option-btn[data-id="${city.id}"]`);
    if (correctBtn) correctBtn.classList.add('correct');
    GameState.streak = 0;
  }

  const baseScore = 100;
  const streakBonus = Math.min((GameState.streak - 1) * 10, 50);
  const questionScore = isCorrect ? baseScore + streakBonus : 0;
  GameState.score += questionScore;

  GameState.answers.push({
    cityId: city.id,
    correct: isCorrect,
    score: questionScore,
  });

  // 记录到本地存储（城市统计 + 进度保存）
  Storage.recordCityAnswer(city.id, isCorrect);
  Storage.saveGameProgress(GameState);

  els.currentScore.textContent = GameState.score;

  if (GameState.streak >= 2) {
    AudioEngine.streak(GameState.streak);
    els.streakBanner.textContent = I18n.t('streakMsg', { n: GameState.streak, bonus: streakBonus });
    els.streakBanner.classList.add('show');
    setTimeout(() => els.streakBanner.classList.remove('show'), 2000);
  }

  setTimeout(() => {
    showFeedback(isCorrect, city, questionScore, streakBonus);
  }, 500);
}

function showFeedback(isCorrect, city, questionScore, streakBonus) {
  els.feedbackIcon.textContent = isCorrect ? '\uD83C\uDF89' : '\uD83D\uDC94';
  els.feedbackResult.textContent = I18n.t(
    isCorrect ? 'correctText' : 'wrongText',
    { flag: city.flag, name: cityText(city, 'name') }
  );
  els.feedbackResult.className = `feedback-result ${isCorrect ? 'correct-text' : 'wrong-text'}`;

  if (isCorrect) {
    els.feedbackScore.textContent = streakBonus > 0
      ? I18n.t('scoreWithBonus', { score: questionScore, bonus: streakBonus })
      : I18n.t('scorePlus', { score: questionScore });
  } else {
    els.feedbackScore.textContent = I18n.t('scoreZero');
  }

  els.triviaList.innerHTML = '';
  cityText(city, 'trivia').forEach(t => {
    const item = document.createElement('div');
    item.className = 'trivia-item';
    item.textContent = t;
    els.triviaList.appendChild(item);
  });

  const isLast = GameState.currentIndex === GameState.questions.length - 1;
  els.nextBtnText.textContent = isLast ? I18n.t('viewScore') : I18n.t('nextBtn');

  els.optionsView.style.display = 'none';
  els.feedbackView.style.display = '';

  els.feedbackView.classList.remove('active');
  void els.feedbackView.offsetWidth;
  els.feedbackView.classList.add('active');

  const triviaCard = els.feedbackView.querySelector('.trivia-card');
  if (triviaCard) {
    triviaCard.style.animation = 'none';
    void triviaCard.offsetWidth;
    triviaCard.style.animation = '';
  }

  const nextBtn = els.feedbackView.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.style.animation = 'none';
    void nextBtn.offsetWidth;
    nextBtn.style.animation = '';
  }
}

function nextQuestion() {
  AudioEngine.click();
  const isLast = GameState.currentIndex === GameState.questions.length - 1;
  if (isLast) {
    AudioEngine.finish();
    Storage.clearActiveGame();
    showResult();
  } else {
    GameState.currentIndex++;
    updateProgress();
    Storage.saveGameProgress(GameState);
    loadQuestion();
  }
}

// ==================== 结算页 ====================

function showResult() {
  switchView('resultView');

  const global = Storage.getGlobalStats();
  const isNewBest = GameState.score > global.bestScore || (global.totalGames === 1 && GameState.score === global.bestScore);
  const evalData = getEvaluation(GameState.score, GameState.questions.length);
  const accuracy = Math.round((GameState.correctCount / GameState.questions.length) * 100);

  // 记录全局统计
  const timeSpent = GameState.gameStartTime
    ? Math.round((Date.now() - GameState.gameStartTime) / 1000)
    : 0;
  Storage.recordGameFinish(GameState.score, GameState.correctCount, GameState.questions.length, GameState.maxStreak, timeSpent);

  // 同步成绩到「我的学习」（主站本地学习档案，同域 localStorage 共享）
  if (window.PlanetLearning) {
    window.PlanetLearning.recordGame({
      gameId: 'geoquiz',
      title: '卫星之眼 · 看卫星图猜城市',
      subtitle: '答对 ' + GameState.correctCount + ' / ' + GameState.questions.length,
      score: GameState.score,
    });
  }

  // 标题区
  els.resultEmoji.textContent = evalData.emoji;
  els.resultTitle.textContent = evalData.title;
  els.resultDesc.textContent = evalData.desc + (isNewBest ? I18n.t('newRecord') : '');

  // 统计
  els.finalScore.textContent = GameState.score;
  els.correctCount.textContent = `${GameState.correctCount}/${GameState.questions.length}`;
  els.maxStreak.textContent = GameState.maxStreak;
  els.accuracy.textContent = `${accuracy}%`;

  // 城市回顾
  els.reviewList.innerHTML = '';
  GameState.answers.forEach((ans, idx) => {
    const city = CITY_DB.find(c => c.id === ans.cityId);
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
      <span class="review-flag">${city.flag}</span>
      <div class="review-info">
        <div class="review-city">${idx + 1}. ${cityText(city, 'name')}</div>
        <div class="review-country">${cityText(city, 'country')}</div>
      </div>
      <span class="review-status ${ans.correct ? 'correct' : 'wrong'}">${ans.correct ? '\u2713' : '\u2715'}</span>
    `;
    els.reviewList.appendChild(item);
  });

  // 历史统计
  renderHistoryStats();

  // 大洲分析
  renderContinentAnalysis();

  // 熟悉与陌生城市
  renderFamiliarCities();

  // 分享文案
  const shareText = generateShareText(evalData, accuracy);
  els.shareContent.textContent = shareText;
  els.shareBtn.onclick = () => {
    if (navigator.share) {
      navigator.share({
        title: '卫星之眼 - 地理挑战',
        text: shareText,
        url: 'https://planetgis.cn/geoquiz/',
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast(I18n.t('copied'));
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = shareText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(I18n.t('copied'));
      });
    }
  };

  // 保存截图
  els.saveScreenshotBtn.onclick = async () => {
    els.saveScreenshotBtn.disabled = true;
    try {
      const canvas = await html2canvas(els.screenshotArea, {
        backgroundColor: '#0a0e17',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `卫星之眼_${GameState.score}分_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Screenshot failed:', e);
    } finally {
      els.saveScreenshotBtn.disabled = false;
    }
  };
}

function renderHistoryStats() {
  const global = Storage.getGlobalStats();
  const hasHistory = global.totalGames > 1 || (global.totalGames === 1 && GameState.score > 0);
  els.historyStatsSection.style.display = hasHistory ? '' : 'none';

  if (!hasHistory) return;

  const avgScore = global.totalGames > 0 ? Math.round(global.totalScore / global.totalGames) : 0;
  const avgAccuracy = global.totalQuestions > 0
    ? Math.round((global.totalCorrect / global.totalQuestions) * 100)
    : 0;

  els.historyStatsGrid.innerHTML = `
    <div class="history-stat-item">
      <div class="history-stat-value">${global.totalGames}</div>
      <div class="history-stat-label">${I18n.t('historyTotal')}</div>
    </div>
    <div class="history-stat-item">
      <div class="history-stat-value">${global.bestScore}</div>
      <div class="history-stat-label">${I18n.t('historyBest')}</div>
    </div>
    <div class="history-stat-item">
      <div class="history-stat-value">${avgScore}</div>
      <div class="history-stat-label">${I18n.t('historyAvgScore')}</div>
    </div>
    <div class="history-stat-item">
      <div class="history-stat-value">${global.maxStreak}</div>
      <div class="history-stat-label">${I18n.t('historyMaxStreak')}</div>
    </div>
    <div class="history-stat-item">
      <div class="history-stat-value">${avgAccuracy}%</div>
      <div class="history-stat-label">${I18n.t('historyAvgAcc')}</div>
    </div>
    <div class="history-stat-item">
      <div class="history-stat-value">${formatDuration(global.totalTimeSpent)}</div>
      <div class="history-stat-label">${I18n.t('historyTime')}</div>
    </div>
  `;
}

function renderContinentAnalysis() {
  const continentStats = Storage.getContinentStats();
  const hasData = Object.values(continentStats).some(s => s.seen > 0);
  els.continentSection.style.display = hasData ? '' : 'none';

  if (!hasData) return;

  const container = els.continentList;
  container.innerHTML = '';

  const continentOrder = ['亚洲', '欧洲', '美洲', '非洲', '大洋洲'];
  const continentEmojis = {
    '亚洲': '🌏', '欧洲': '🏰', '美洲': '🗽', '非洲': '🦁', '大洋洲': '🐨',
  };
  const continentKeyMap = {
    '亚洲': 'continentAsia', '欧洲': 'continentEurope', '美洲': 'continentAmerica',
    '非洲': 'continentAfrica', '大洋洲': 'continentOceania',
  };

  continentOrder.forEach(name => {
    const stat = continentStats[name];
    if (!stat || stat.seen === 0) return;

    const accPct = Math.round((stat.correct / stat.seen) * 100);
    const emoji = continentEmojis[name] || '🌍';
    const displayName = I18n.t(continentKeyMap[name]);

    const item = document.createElement('div');
    item.className = 'continent-item';
    item.innerHTML = `
      <div class="continent-item-header">
        <span class="continent-item-emoji">${emoji}</span>
        <span class="continent-item-name">${displayName}</span>
        <span class="continent-item-acc">${accPct}%</span>
      </div>
      <div class="continent-item-detail">${I18n.t('continentDetail', { seen: stat.seen, correct: stat.correct, wrong: stat.wrong })}</div>
    `;
    container.appendChild(item);
  });
}

function renderFamiliarCities() {
  const weakCities = Storage.getTopWeakCities(3);
  const strongCities = Storage.getTopStrongCities(3);

  const hasData = weakCities.length > 0 || strongCities.length > 0;
  els.familiarSection.style.display = hasData ? '' : 'none';

  if (!hasData) return;

  const container = els.familiarGrid;
  container.innerHTML = '';

  if (strongCities.length > 0) {
    const strongDiv = document.createElement('div');
    strongDiv.className = 'familiar-col';
    strongDiv.innerHTML = `<div class="familiar-col-title">${I18n.t('mostFamiliar')}</div>`;
    strongCities.forEach(item => {
      const acc = Math.round(item.accuracy * 100);
      const row = document.createElement('div');
      row.className = 'familiar-row';
      row.innerHTML = `
        <span class="familiar-flag">${item.city.flag}</span>
        <span class="familiar-name">${cityText(item.city, 'name')}</span>
        <span class="familiar-acc correct-text">${acc}%</span>
      `;
      strongDiv.appendChild(row);
    });
    container.appendChild(strongDiv);
  }

  if (weakCities.length > 0) {
    const weakDiv = document.createElement('div');
    weakDiv.className = 'familiar-col';
    weakDiv.innerHTML = `<div class="familiar-col-title">${I18n.t('needPractice')}</div>`;
    weakCities.forEach(item => {
      const acc = Math.round(item.accuracy * 100);
      const row = document.createElement('div');
      row.className = 'familiar-row';
      row.innerHTML = `
        <span class="familiar-flag">${item.city.flag}</span>
        <span class="familiar-name">${cityText(item.city, 'name')}</span>
        <span class="familiar-acc wrong-text">${acc}%</span>
      `;
      weakDiv.appendChild(row);
    });
    container.appendChild(weakDiv);
  }
}

function generateShareText(evalData, accuracy) {
  const lines = [
    I18n.t('shareLine1', { title: evalData.title }),
    '',
    I18n.t('shareLine2', { score: GameState.score, correct: GameState.correctCount, total: GameState.questions.length, acc: accuracy }),
    I18n.t('shareLine3', { streak: GameState.maxStreak }),
    '',
    I18n.t('shareLine4'),
    I18n.t('shareLine5'),
    I18n.t('shareLink'),
  ];
  return lines.join('\n');
}

// ==================== 事件绑定 ====================

function bindEvents() {
  // 首页
  // 游戏设置
  function updateSettingsHint() {
    const random = els.settingRandom.checked;
    const repeat = els.settingRepeat.checked;
    let hint = '';
    if (!random) {
      hint = I18n.t('hintOrder');
    } else if (!repeat) {
      const seenCount = Storage.getSeenCityIds().length;
      hint = seenCount > 0 ? I18n.t('hintNoRepeat', { n: Math.min(seenCount, 90) }) : I18n.t('hintAllNew');
    }
    els.settingsHint.textContent = hint;
  }

  els.settingsBtn.addEventListener('click', () => {
    AudioEngine.click();
    // 恢复设置状态
    const savedSettings = Storage.getSettings();
    els.settingRandom.checked = savedSettings.randomOrder;
    els.settingRepeat.checked = savedSettings.allowRepeat;
    els.settingSound.checked = !savedSettings.muted;
    els.settingLang.value = I18n.currentLang;
    updateSettingsHint();
    els.settingsModal.classList.remove('hidden');
  });
  els.closeSettings.addEventListener('click', () => {
    AudioEngine.click();
    els.settingsModal.classList.add('hidden');
  });
  els.settingRandom.addEventListener('change', () => {
    Storage.setGameSetting('randomOrder', els.settingRandom.checked);
    updateSettingsHint();
  });
  els.settingRepeat.addEventListener('change', () => {
    Storage.setGameSetting('allowRepeat', els.settingRepeat.checked);
    updateSettingsHint();
  });
  els.settingSound.addEventListener('change', () => {
    AudioEngine.init();
    const muted = !els.settingSound.checked;
    if (muted) {
      if (!AudioEngine.isMuted) AudioEngine.toggleMute();
    } else {
      if (AudioEngine.isMuted) AudioEngine.toggleMute();
    }
    Storage.setMuted(muted);
    els.muteBtn.textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
  });
  els.settingLang.addEventListener('change', () => {
    I18n.setLang(els.settingLang.value);
    updateSettingsHint();
    I18n.refreshDynamic();
  });

  // 初始化设置
  const savedSettings = Storage.getSettings();
  els.settingRandom.checked = savedSettings.randomOrder;
  els.settingRepeat.checked = savedSettings.allowRepeat;
  els.settingSound.checked = !savedSettings.muted;
  updateSettingsHint();

  els.startBtn.addEventListener('click', startGame);
  els.continueBtn.addEventListener('click', () => {
    AudioEngine.click();
    continueGame();
  });

  els.learnBtn.addEventListener('click', () => {
    AudioEngine.click();
    openLearnMode();
  });

  // 静音切换
  els.muteBtn.addEventListener('click', () => {
    AudioEngine.init();
    AudioEngine.resume();
    const muted = AudioEngine.toggleMute();
    els.muteBtn.textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    Storage.setMuted(muted);
  });

  // 游戏页
  els.quitBtn.addEventListener('click', () => {
    AudioEngine.click();
    els.quitModal.classList.remove('hidden');
  });
  els.cancelQuit.addEventListener('click', () => {
    AudioEngine.click();
    els.quitModal.classList.add('hidden');
  });
  els.confirmQuit.addEventListener('click', () => {
    AudioEngine.click();
    AudioEngine.stopBgm();
    els.quitModal.classList.add('hidden');
    switchView('homeView');
    renderHomeStats();
  });
  els.nextBtn.addEventListener('click', nextQuestion);

  // 结算页
  els.restartBtn.addEventListener('click', startGame);
  els.backHomeBtn.addEventListener('click', () => {
    AudioEngine.click();
    AudioEngine.stopBgm();
    switchView('homeView');
    renderHomeStats();
  });

  // 学习模式
  els.learnBackBtn.addEventListener('click', () => {
    AudioEngine.click();
    switchView('homeView');
    els.searchSuggestions.style.display = 'none';
    renderHomeStats();
  });

  // 搜索输入
  let searchTimeout;
  els.learnSearchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.trim()) {
      els.searchClear.style.display = '';
    } else {
      els.searchClear.style.display = 'none';
      els.searchSuggestions.style.display = 'none';
      return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const results = searchCities(val);
      renderSuggestions(results);
    }, 150);
  });

  els.learnSearchInput.addEventListener('focus', () => {
    const val = els.learnSearchInput.value;
    if (val.trim()) {
      const results = searchCities(val);
      renderSuggestions(results);
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.learn-search-wrap')) {
      els.searchSuggestions.style.display = 'none';
    }
  });

  els.searchClear.addEventListener('click', () => {
    els.learnSearchInput.value = '';
    els.searchClear.style.display = 'none';
    els.searchSuggestions.style.display = 'none';
    els.learnSearchInput.focus();
  });

  // 学习模式导航
  els.learnPrevBtn.addEventListener('click', () => {
    AudioEngine.click();
    navigateLearnCity(-1);
  });
  els.learnNextBtn.addEventListener('click', () => {
    AudioEngine.click();
    navigateLearnCity(1);
  });

  // 键盘支持
  document.addEventListener('keydown', (e) => {
    if (els.gameView.classList.contains('hidden')) return;
    if (GameState.isAnswered) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nextQuestion();
      }
      return;
    }
    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'q': 0, 'w': 1, 'e': 2, 'r': 3 };
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined) {
      const btns = $$('.option-btn');
      if (btns[idx]) btns[idx].click();
    }
  });
}

// ==================== 初始化 ====================

function init() {
  // 恢复静音设置
  const settings = Storage.getSettings();
  if (settings.muted) {
    AudioEngine.init();
    AudioEngine.toggleMute();
    els.muteBtn.textContent = '\uD83D\uDD07';
  }
  els.settingSound.checked = !settings.muted;

  // i18n 初始化
  I18n.currentLang = I18n.detectLang();
  document.documentElement.lang = I18n.currentLang === 'zh' ? 'zh-CN' : 'en';
  els.settingLang.value = I18n.currentLang;
  I18n.applyAll();

  renderHomeStats();
  bindEvents();
}

// DOM Ready
document.addEventListener('DOMContentLoaded', init);
