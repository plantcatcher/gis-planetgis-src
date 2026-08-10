/**
 * 卫星之眼 · 国际化模块
 * 支持中文(zh)和英文(en)
 */

const I18n = {
  currentLang: 'zh',
  translations: {
    zh: {
      // 首页
      'homeTitle': '卫星之眼',
      'homeSubtitle': 'EYE FROM SPACE',
      'homeTagline': '从 400 公里高空俯瞰地球，你能认出这些城市吗？',
      'startBtn': '开始挑战',
      'continueBtn': '继续挑战',
      'exploreBtn': '探索城市',
      'bestScore': '🏆 最佳成绩：{score} 分',
      'challengeCount': '挑战次数',
      'citiesSeen': '遇过城市',
      'explored': '已探索',
      'accuracy': '正确率',
      // 首页特性卡片
      'featSatTitle': '真实卫星图',
      'featSatDesc': 'Esri 高清卫星影像，无标注纯看图',
      'featCitiesTitle': '100 座名城',
      'featCitiesDesc': '横跨五大洲，从北京到布宜诺斯艾利斯',
      'featTriviaTitle': '地理冷知识',
      'featTriviaDesc': '每题解锁 3 条独家城市秘闻',
      // 游戏页
      'gameTitle': '卫星之眼',
      'scoreLabel': '得分',
      'connecting': '正在连接卫星...',
      'hintLabel': '卫星特征：',
      'geoTrivia': '地理冷知识',
      'nextBtn': '下一题',
      'viewScore': '查看成绩',
      'correctText': '回答正确！这是 {flag} {name}',
      'wrongText': '回答错误！正确答案是 {flag} {name}',
      'scorePlus': '+{score} 分',
      'scoreWithBonus': '+{score} 分（含 +{bonus} 连击加成）',
      'scoreZero': '+0 分',
      'streakMsg': '🔥 {n} 连击！+{bonus} 加成',
      // 结算页
      'totalScore': '总分',
      'correctCount': '答对',
      'maxStreak': '最高连击',
      'accuracyRate': '正确率',
      'reviewTitle': '📍 本次挑战回顾',
      'historyTitle': '📊 历史数据',
      'continentTitle': '🌍 大洲战绩',
      'familiarTitle': '🎯 城市熟悉度',
      'shareTitle': '分享给朋友',
      'shareBtn': '📤 分享',
      'saveScreenshot': '📸 保存截图',
      'playAgain': '再来一局',
      'backHome': '返回首页',
      'historyTotal': '总挑战',
      'historyBest': '历史最佳',
      'historyAvgScore': '平均得分',
      'historyMaxStreak': '历史连击',
      'historyAvgAcc': '平均正确率',
      'historyTime': '累计时长',
      'mostFamiliar': '🏆 最熟悉',
      'needPractice': '📚 需加强',
      'newRecord': ' 🏆 新纪录！',
      // 结算评语
      'eval1Title': '卫星之眼', 'eval1Desc': '你的城市辨识力令人惊叹！', 'eval1Emoji': '🛰️',
      'eval2Title': '地理达人', 'eval2Desc': '你的地理知识储备非常丰富！', 'eval2Emoji': '🏆',
      'eval3Title': '城市猎人', 'eval3Desc': '你正在成为城市识别专家！', 'eval3Emoji': '🔍',
      'eval4Title': '成长之星', 'eval4Desc': '继续练习，你会越来越棒！', 'eval4Emoji': '⭐',
      'eval5Title': '初学探索者', 'eval5Desc': '每次尝试都是进步，加油！', 'eval5Emoji': '🌱',
      // 学习模式
      'learnTitle': '探索城市',
      'learnSubtitle': '从太空俯瞰 100 座名城',
      'searchPlaceholder': '搜索城市名称（如：北京、巴黎、纽约）',
      'mapHint': '🖱️ 滚轮缩放 · 拖拽移动',
      'emptyHint': '在上方搜索框输入城市名称',
      'emptySub': '探索世界各地的卫星影像',
      'prevCity': '← 上一城',
      'nextCity': '下一城 →',
      // 设置
      'settingsTitle': '游戏设置',
      'settingRandom': '随机出题',
      'settingRepeat': '允许重复出题',
      'settingSound': '声音',
      'closeBtn': '关闭',
      'hintOrder': '按题库顺序出题（北京→上海→...）',
      'hintNoRepeat': '优先出 {n} 座未见过城市',
      'hintAllNew': '所有城市都是新的，效果同随机',
      // 弹窗
      'quitTitle': '确认退出？',
      'quitDesc': '进度已自动保存，下次可以继续挑战',
      'continueGame': '继续游戏',
      'quit': '退出',
      // Toast
      'noResume': '没有可恢复的挑战',
      'copied': '分享文案已复制到剪贴板！',
      'switchLangBtn': 'EN',
      // 分享文案
      'shareLine1': '🛰️ 我在「卫星之眼」挑战中获得了「{title}」称号！',
      'shareLine2': '📊 成绩：{score} 分 | {correct}/{total} 题正确 | 正确率 {acc}%',
      'shareLine3': '🔥 最高连击：{streak}',
      'shareLine4': '🌍 从 400 公里高空俯瞰地球，你能认出这些城市吗？',
      'shareLine5': '👇 快来挑战你的地理眼力！',
      'shareLink': '🔗 https://planetgis.cn/geoquiz/',
      // 底部
      'footer': '卫星图来源：Esri World Imagery · 版权归属：星球小捕手',
      // 大洲
      'continentAsia': '亚洲', 'continentEurope': '欧洲', 'continentAmerica': '美洲',
      'continentAfrica': '非洲', 'continentOceania': '大洋洲',
      'continentNotPlayed': '未挑战',
      'continentEncountered': '遇过 {seen}/{total} 城',
      'continentDetail': '遇过 {seen} 题 · 对 {correct} · 错 {wrong}',
      // 设置提示
      'settingSoundOn': '声音已开启',
      'settingSoundOff': '声音已关闭',
    },
    en: {
      // 首页
      'homeTitle': 'Eye from Space',
      'homeSubtitle': 'EYE FROM SPACE',
      'homeTagline': 'Can you recognize cities from 400km above Earth?',
      'startBtn': 'Start Challenge',
      'continueBtn': 'Continue',
      'exploreBtn': 'Explore Cities',
      'bestScore': '🏆 Best: {score} pts',
      'challengeCount': 'Games',
      'citiesSeen': 'Cities Seen',
      'explored': 'Explored',
      'accuracy': 'Accuracy',
      // 首页特性卡片
      'featSatTitle': 'Real Satellite',
      'featSatDesc': 'Esri HD satellite imagery, no labels, pure visual',
      'featCitiesTitle': '100 Cities',
      'featCitiesDesc': 'Across 5 continents, Beijing to Buenos Aires',
      'featTriviaTitle': 'Geo Trivia',
      'featTriviaDesc': 'Unlock 3 exclusive city facts per question',
      // 游戏页
      'gameTitle': 'Eye from Space',
      'scoreLabel': 'Score',
      'connecting': 'Connecting satellite...',
      'hintLabel': 'Feature: ',
      'geoTrivia': 'Geo Trivia',
      'nextBtn': 'Next',
      'viewScore': 'View Results',
      'correctText': 'Correct! This is {flag} {name}',
      'wrongText': 'Wrong! The answer is {flag} {name}',
      'scorePlus': '+{score} pts',
      'scoreWithBonus': '+{score} pts (+{bonus} streak bonus)',
      'scoreZero': '+0 pts',
      'streakMsg': '🔥 {n} streak! +{bonus} bonus',
      // 结算页
      'totalScore': 'Total',
      'correctCount': 'Correct',
      'maxStreak': 'Best Streak',
      'accuracyRate': 'Accuracy',
      'reviewTitle': '📍 Challenge Review',
      'historyTitle': '📊 History',
      'continentTitle': '🌍 Continent Stats',
      'familiarTitle': '🎯 City Familiarity',
      'shareTitle': 'Share with Friends',
      'shareBtn': '📤 Share',
      'saveScreenshot': '📸 Save Screenshot',
      'playAgain': 'Play Again',
      'backHome': 'Home',
      'historyTotal': 'Total Games',
      'historyBest': 'All-time Best',
      'historyAvgScore': 'Avg Score',
      'historyMaxStreak': 'Best Streak',
      'historyAvgAcc': 'Avg Accuracy',
      'historyTime': 'Total Time',
      'mostFamiliar': '🏆 Most Familiar',
      'needPractice': '📚 Need Practice',
      'newRecord': ' 🏆 New Record!',
      // 结算评语
      'eval1Title': 'Eye from Space', 'eval1Desc': 'Your city recognition is amazing!', 'eval1Emoji': '🛰️',
      'eval2Title': 'Geo Master', 'eval2Desc': 'Your geography knowledge is impressive!', 'eval2Emoji': '🏆',
      'eval3Title': 'City Hunter', 'eval3Desc': 'You are becoming a city expert!', 'eval3Emoji': '🔍',
      'eval4Title': 'Rising Star', 'eval4Desc': 'Keep practicing, you will improve!', 'eval4Emoji': '⭐',
      'eval5Title': 'Explorer', 'eval5Desc': 'Every attempt is progress, keep going!', 'eval5Emoji': '🌱',
      // 学习模式
      'learnTitle': 'Explore',
      'learnSubtitle': 'View 100 cities from space',
      'searchPlaceholder': 'Search city name (e.g. Beijing, Paris, New York)',
      'mapHint': '🖱️ Scroll to zoom · Drag to move',
      'emptyHint': 'Search a city name above',
      'emptySub': 'Explore satellite imagery from around the world',
      'prevCity': '← Previous',
      'nextCity': 'Next →',
      // 设置
      'settingsTitle': 'Settings',
      'settingRandom': 'Random Order',
      'settingRepeat': 'Allow Repeat',
      'settingSound': 'Sound',
      'closeBtn': 'Close',
      'hintOrder': 'Sequential order (Beijing→Shanghai→...)',
      'hintNoRepeat': 'Prefer {n} unseen cities',
      'hintAllNew': 'All cities are new, same as random',
      // 弹窗
      'quitTitle': 'Quit?',
      'quitDesc': 'Progress auto-saved, continue next time',
      'continueGame': 'Continue',
      'quit': 'Quit',
      // Toast
      'noResume': 'No saved progress',
      'copied': 'Share text copied!',
      // 分享文案
      'shareLine1': '🛰️ I earned "{title}" in Eye from Space!',
      'shareLine2': '📊 Score: {score} | {correct}/{total} correct | {acc}% accuracy',
      'shareLine3': '🔥 Best streak: {streak}',
      'shareLine4': '🌍 Can you recognize cities from 400km above?',
      'shareLine5': '👇 Challenge your geography skills!',
      'shareLink': '🔗 https://planetgis.cn/geoquiz/',
      // 底部
      'footer': 'Satellite: Esri World Imagery · © Planet Little Hunter',
      // 大洲
      'continentAsia': 'Asia', 'continentEurope': 'Europe', 'continentAmerica': 'Americas',
      'continentAfrica': 'Africa', 'continentOceania': 'Oceania',
      'continentNotPlayed': 'Not played',
      'continentEncountered': 'Seen {seen}/{total}',
      'continentDetail': 'Seen {seen} · ✓{correct} · ✗{wrong}',
      // 设置提示
      'settingSoundOn': 'Sound on',
      'settingSoundOff': 'Sound off',
    }
  },

  t(key, replacements = {}) {
    let text = (this.translations[this.currentLang] && this.translations[this.currentLang][key])
      || this.translations['zh'][key]
      || key;
    Object.keys(replacements).forEach(k => {
      text = text.replace(`{${k}}`, replacements[k]);
    });
    return text;
  },

  setLang(lang) {
    this.currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    Storage.setGameSetting('language', lang);
    this.applyAll();
  },

  detectLang() {
    const savedLang = Storage.getSettings().language;
    if (savedLang && this.translations[savedLang]) return savedLang;
    // 检测浏览器语言
    const browserLang = (navigator.language || navigator.userLanguage || 'zh').toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    return 'zh';
  },

  applyAll() {
    // 通过 data-i18n 属性应用翻译
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text !== key) el.textContent = text;
    });
    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text !== key) el.placeholder = text;
    });
    // 更新 title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.t(key);
      if (text !== key) el.title = text;
    });
  },

  /** 重新渲染动态内容（首页统计、结算页等） */
  refreshDynamic() {
    // 触发重渲染当前视图的动态文本
    if (typeof renderHomeStats === 'function') renderHomeStats();
  }
};
