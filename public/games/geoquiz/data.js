/**
 * 卫星图猜城市 - 题库数据（100城版）
 * 每题包含：城市名、坐标、缩放级别、俯视特征、冷知识、国家emoji
 * 地理分布：亚洲30 / 欧洲30 / 美洲20 / 非洲12 / 大洋洲8
 */
const CITY_DB = window.CITY_MASTER.geoquiz;

/**
 * 为指定城市生成干扰项
 */
function generateDistractors(correctId, count = 3) {
  const others = CITY_DB.filter(c => c.id !== correctId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 从题库中随机抽取 N 题
 */
function pickQuestions(count = 10) {
  const shuffled = [...CITY_DB].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 获取评价语
 */
function getEvaluation(score, total = 10) {
  const ratio = score / (total * 150);
  if (ratio >= 0.9) return { title: I18n.t('eval1Title'), desc: I18n.t('eval1Desc'), emoji: I18n.t('eval1Emoji') };
  if (ratio >= 0.75) return { title: I18n.t('eval2Title'), desc: I18n.t('eval2Desc'), emoji: I18n.t('eval2Emoji') };
  if (ratio >= 0.6) return { title: I18n.t('eval3Title'), desc: I18n.t('eval3Desc'), emoji: I18n.t('eval3Emoji') };
  if (ratio >= 0.4) return { title: I18n.t('eval4Title'), desc: I18n.t('eval4Desc'), emoji: I18n.t('eval4Emoji') };
  return { title: I18n.t('eval5Title'), desc: I18n.t('eval5Desc'), emoji: I18n.t('eval5Emoji') };
}

/**
 * 按 ID 顺序固定出题（无随机）
 */
function pickQuestionsInOrder(count = 10) {
  return CITY_DB.slice(0, count);
}

/**
 * 从题库中随机抽取 N 题，排除已见过的城市
 * @param {number} count - 抽取数量
 * @param {number[]} seenCityIds - 已见过的城市 ID 列表
 * @returns {Array} 城市对象数组
 */
function pickQuestionsNoRepeat(count = 10, seenCityIds = []) {
  const pool = CITY_DB.filter(c => !seenCityIds.includes(c.id));
  if (pool.length >= count) {
    return shuffle(pool).slice(0, count);
  }
  // 不重复的城市不够一局，从全部城市中补充
  const needed = count - pool.length;
  const extras = shuffle(CITY_DB.filter(c => seenCityIds.includes(c.id) && !pool.find(p => p.id === c.id))).slice(0, needed);
  return shuffle([...pool, ...extras]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CITY_DB, generateDistractors, pickQuestions, pickQuestionsInOrder, pickQuestionsNoRepeat, getEvaluation };
}
