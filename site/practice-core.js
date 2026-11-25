export const SECTIONS = { general: '文字・語彙・文法', reading: '閱讀', listening: '聽力' };
export function taipeiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = type => parts.find(p => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function availablePapers(index, today = taipeiDate()) {
  return index.papers.filter(p => p.date <= today).sort((a,b) => b.date.localeCompare(a.date));
}
export function validatePaper(paper) {
  if (paper?.schemaVersion !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(paper.date) || paper.questions?.length !== 20) throw new Error('題組格式不完整。');
  const ids = new Set();
  for (const q of paper.questions) {
    if (!q.id || ids.has(q.id) || !SECTIONS[q.section] || !q.question || !q.explanation || q.options?.length !== 4 || new Set(q.options).size !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) throw new Error('題目格式或答案有誤。');
    if (q.section === 'reading' && !q.passage) throw new Error('閱讀題缺少文章。');
    if (q.section === 'listening' && (!q.script || !q.audio)) throw new Error('聽力題缺少音訊。');
    ids.add(q.id);
  }
  return paper;
}
export function grade(paper, selections, times = {}) {
  const answers = paper.questions.map(q => ({ questionId: q.id, section: q.section, category: q.category,
    question: q.question, options: q.options, selectedIndex: Number.isInteger(selections[q.id]) ? selections[q.id] : -1,
    selected: q.options[selections[q.id]] ?? '未作答', correct: q.options[q.answer], correctIndex: q.answer,
    isCorrect: selections[q.id] === q.answer, time: Math.round((times[q.id] || 0) * 10) / 10,
    explanation: q.explanation, passage: q.passage || '', script: q.script || '', audio: q.audio || '' }));
  const score = answers.filter(a => a.isCorrect).length;
  return { answers, score, total: answers.length, accuracy: Math.round(score / answers.length * 100),
    sections: Object.keys(SECTIONS).map(section => ({ section, total: answers.filter(a => a.section === section).length, correct: answers.filter(a => a.section === section && a.isCorrect).length })) };
}
export function readStore(storage, key, fallback) {
  try { const value = storage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}
export function writeStore(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
