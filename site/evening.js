import {
  loadExamAttempts,
  saveExamAttempt,
  signInWithGoogle,
  signOutUser,
  watchAuth
} from "./firebase.js";

const $ = selector => document.querySelector(selector);
const CATEGORY_LABELS = {
  kana: "假名",
  vocab: "單字",
  grammar: "文法",
  reading: "閱讀",
  listening: "聽解",
  mixed: "綜合"
};

let currentUser = null;
let exam = null;
let questionIndex = 0;
let selectedIndex = -1;
let answers = [];
let startedAt = 0;
let questionStartedAt = 0;
let timerId = null;
let examActive = false;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function formatTime(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function summarizeCategories(attempt) {
  const categories = new Map();
  const attemptAnswers = Array.isArray(attempt?.answers) ? attempt.answers : [];
  attemptAnswers.forEach(answer => {
    const category = answer.category || "mixed";
    const current = categories.get(category) || { category, total: 0, correct: 0, totalTime: 0 };
    current.total += 1;
    current.correct += answer.isCorrect ? 1 : 0;
    current.totalTime += Number(answer.time) || 0;
    categories.set(category, current);
  });
  return [...categories.values()].map(item => ({
    ...item,
    accuracy: Math.round(item.correct / item.total * 100),
    averageTime: item.totalTime / item.total
  })).sort((a, b) => a.accuracy - b.accuracy || b.averageTime - a.averageTime);
}

function getAdaptiveAdvice(attempt, weakestCategory) {
  const accuracy = Number(attempt?.accuracy) || 0;
  const focus = weakestCategory ? CATEGORY_LABELS[weakestCategory.category] || "綜合" : "前次內容";
  if (accuracy >= 90) return `掌握度穩定，明天以新內容為主，保留少量「${focus}」速度與易錯點複習。`;
  if (accuracy >= 80) return `已通過，明天正常推進新內容，並安排「${focus}」定向複習。`;
  if (accuracy >= 70) return `接近通過，明天先補強「${focus}」與錯題觀念，再縮量加入新內容。`;
  return `基礎仍不穩，明天優先重教「${focus}」及錯題觀念，確認掌握後再增加新內容。`;
}

function renderLearningProfile(attempt) {
  const card = $("#learningProfileCard");
  const root = $("#learningProfile");
  card.classList.toggle("hidden", examActive);
  if (!attempt) {
    $("#profileExamDate").textContent = "尚無紀錄";
    root.innerHTML = '<div class="empty-history">完成第一份晚間驗收後，這裡會顯示學習重點。</div>';
    return;
  }

  const categories = summarizeCategories(attempt);
  const wrongAnswers = (Array.isArray(attempt.answers) ? attempt.answers : []).filter(answer => !answer.isCorrect);
  const weakest = categories[0];
  $("#profileExamDate").textContent = attempt.examDate || "最近一次";
  root.innerHTML = `
    <div class="profile-summary">
      <div><span>答對率</span><strong>${Number(attempt.accuracy) || 0}%</strong></div>
      <div><span>結果</span><strong>${attempt.passed ? "通過" : "未通過"}</strong></div>
      <div><span>明日優先</span><strong>${escapeHtml(weakest ? CATEGORY_LABELS[weakest.category] || "綜合" : "穩定複習")}</strong></div>
    </div>
    <p class="profile-advice">${escapeHtml(getAdaptiveAdvice(attempt, weakest))}</p>
    <div class="profile-category-list" aria-label="各類題目表現">
      ${categories.length ? categories.map(item => `
        <span class="profile-category-chip">
          <b>${escapeHtml(CATEGORY_LABELS[item.category] || "綜合")}</b>
          ${item.correct}/${item.total}・${item.accuracy}%・平均 ${escapeHtml(formatTime(item.averageTime))}
        </span>
      `).join("") : '<span class="muted">這筆舊紀錄沒有逐題分類資料。</span>'}
    </div>
    <div class="profile-wrong-list">
      <h3>需要帶入明日教材的錯題</h3>
      ${wrongAnswers.length ? wrongAnswers.map(answer => `
        <article class="profile-wrong-item">
          <strong>${escapeHtml(answer.question)}</strong>
          <p>你的答案：<b class="bad-text">${escapeHtml(answer.selected)}</b></p>
          <p>正確答案：<b class="ok-text">${escapeHtml(answer.correct)}</b></p>
          <p class="muted">${escapeHtml(answer.explanation || "請複習這個觀念。")}</p>
        </article>
      `).join("") : '<div class="perfect-box">沒有錯題；明日正常推進，保留少量速度複習。</div>'}
    </div>
  `;
}

function setStatus(message = "") {
  $("#examStatus").textContent = message;
}

function validateExam(data) {
  if (!data || !data.date || !Array.isArray(data.questions) || !data.questions.length) {
    throw new Error("今日晚間考卷格式不完整。");
  }
  data.questions.forEach((question, index) => {
    if (!question.question || !Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`第 ${index + 1} 題不是完整四選一題目。`);
    }
    if (new Set(question.options.map(String)).size !== 4) {
      throw new Error(`第 ${index + 1} 題有重複選項。`);
    }
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
      throw new Error(`第 ${index + 1} 題答案索引無效。`);
    }
  });
  return data;
}

async function loadExam() {
  try {
    const response = await fetch("./exams/latest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("今日晚間考卷尚未上線。");
    exam = validateExam(await response.json());
    $("#examTitle").textContent = exam.title || "今日晚間驗收";
    $("#examDate").textContent = exam.date;
    $("#examCount").textContent = `${exam.questions.length} 題`;
    $("#examPassScore").textContent = `${exam.passScore || 80}%`;
    $("#examDescription").textContent = exam.description || "題目只使用今日教材與指定複習範圍。";
    updateStartButton();
  } catch (error) {
    $("#examTitle").textContent = "今日考卷尚未準備完成";
    setStatus(error.message);
  }
}

function updateStartButton() {
  const button = $("#startEveningExam");
  button.disabled = !(currentUser && exam);
  button.textContent = currentUser ? (exam ? "開始今日晚間驗收" : "等待今日考卷") : "登入後開始驗收";
}

function renderAccount(user) {
  currentUser = user;
  if (user) {
    $("#accountTitle").textContent = user.displayName || "已登入";
    $("#accountDetail").textContent = user.email || "成績會同步至此帳號";
    $("#signInButton").classList.add("hidden");
    $("#signOutButton").classList.remove("hidden");
    renderCloudHistory();
  } else {
    $("#accountTitle").textContent = "登入後才能參加正式驗收";
    $("#accountDetail").textContent = "你的成績、錯題與通過紀錄會依帳號分開保存。";
    $("#signInButton").classList.remove("hidden");
    $("#signOutButton").classList.add("hidden");
    $("#cloudHistory").innerHTML = '<div class="empty-history">登入後顯示你的紀錄。</div>';
    $("#learningProfileCard").classList.add("hidden");
    $("#learningProfile").innerHTML = "";
  }
  updateStartButton();
}

function startExam() {
  if (!currentUser || !exam) return;
  examActive = true;
  questionIndex = 0;
  selectedIndex = -1;
  answers = [];
  startedAt = performance.now();
  questionStartedAt = startedAt;
  $("#examSetup").classList.add("hidden");
  $("#cloudHistoryCard").classList.add("hidden");
  $("#learningProfileCard").classList.add("hidden");
  $("#examResult").classList.add("hidden");
  $("#examView").classList.remove("hidden");
  clearInterval(timerId);
  timerId = setInterval(() => {
    $("#examElapsed").textContent = formatTime((performance.now() - startedAt) / 1000);
  }, 250);
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  const question = exam.questions[questionIndex];
  selectedIndex = -1;
  questionStartedAt = performance.now();
  $("#examProgress").textContent = `${questionIndex + 1} / ${exam.questions.length}`;
  $("#examCategory").textContent = CATEGORY_LABELS[question.category] || "綜合";
  $("#examQuestion").textContent = question.question;
  $("#examOptions").innerHTML = question.options.map((option, index) => `
    <button class="test-option" type="button" data-option="${index}">
      <span>${String.fromCharCode(65 + index)}</span>
      <strong>${escapeHtml(option)}</strong>
    </button>
  `).join("");
  $("#nextExamQuestion").disabled = true;
  $("#nextExamQuestion").textContent = questionIndex === exam.questions.length - 1 ? "交卷" : "下一題";

  document.querySelectorAll("[data-option]").forEach(button => {
    button.addEventListener("click", () => {
      selectedIndex = Number(button.dataset.option);
      document.querySelectorAll("[data-option]").forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");
      $("#nextExamQuestion").disabled = false;
    });
  });
}

function nextQuestion() {
  if (selectedIndex < 0) return;
  const question = exam.questions[questionIndex];
  const elapsed = (performance.now() - questionStartedAt) / 1000;
  answers.push({
    id: question.id || `q${questionIndex + 1}`,
    category: question.category || "mixed",
    question: question.question,
    selectedIndex,
    selected: question.options[selectedIndex],
    correctIndex: question.answer,
    correct: question.options[question.answer],
    isCorrect: selectedIndex === question.answer,
    explanation: question.explanation || "請回到今日教材複習這個觀念。",
    time: Number(elapsed.toFixed(1))
  });

  questionIndex += 1;
  if (questionIndex < exam.questions.length) renderQuestion();
  else finishExam();
}

async function finishExam() {
  clearInterval(timerId);
  examActive = false;
  const totalTime = (performance.now() - startedAt) / 1000;
  const score = answers.filter(answer => answer.isCorrect).length;
  const accuracy = Math.round(score / answers.length * 100);
  const passScore = exam.passScore || 80;
  const passed = accuracy >= passScore;

  $("#examView").classList.add("hidden");
  $("#examResult").classList.remove("hidden");
  $("#resultHeadline").textContent = passed ? "今日驗收通過" : "尚未達到通過標準";
  $("#eveningAccuracy").textContent = `${accuracy}%`;
  $("#eveningScore").textContent = `${score} / ${answers.length}`;
  $("#eveningTime").textContent = formatTime(totalTime);
  $("#cloudSaveState").textContent = "儲存中";
  $("#eveningAdvice").innerHTML = passed
    ? `<strong>通過 ✅</strong><p>已達 ${passScore}% 標準，錯題仍會保留給之後複習。</p>`
    : `<strong>需要補強</strong><p>低於 ${passScore}% 通過線，先複習下方錯題後再重新驗收。</p>`;

  const wrong = answers.filter(answer => !answer.isCorrect);
  $("#eveningReview").innerHTML = wrong.length ? wrong.map((answer, index) => `
    <article class="wrong-item">
      <span>${index + 1}</span>
      <div>
        <strong>${escapeHtml(answer.question)}</strong>
        <p>你的答案：<b class="bad-text">${escapeHtml(answer.selected)}</b></p>
        <p>正確答案：<b class="ok-text">${escapeHtml(answer.correct)}</b></p>
        <p class="muted">${escapeHtml(answer.explanation)}</p>
      </div>
    </article>
  `).join("") : '<div class="perfect-box">全部答對，今天沒有錯題。</div>';

  try {
    await saveExamAttempt(currentUser, {
      schemaVersion: 1,
      examDate: exam.date,
      examTitle: exam.title || "晚間驗收",
      score,
      total: answers.length,
      accuracy,
      passed,
      passScore,
      totalTime: Number(totalTime.toFixed(1)),
      answers
    });
    $("#cloudSaveState").textContent = "已同步";
    await renderCloudHistory();
  } catch (error) {
    $("#cloudSaveState").textContent = "同步失敗";
    $("#eveningAdvice").innerHTML += `<p class="bad-text">${escapeHtml(error.message)}</p>`;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function renderCloudHistory() {
  if (!currentUser) return;
  const requestedUid = currentUser.uid;
  const root = $("#cloudHistory");
  root.innerHTML = '<div class="empty-history">正在讀取你的紀錄…</div>';
  try {
    const history = await loadExamAttempts(currentUser, 10);
    if (currentUser?.uid !== requestedUid) return;
    if (!history.length) {
      root.innerHTML = '<div class="empty-history">尚無紀錄，完成第一份晚間驗收後會顯示在這裡。</div>';
      renderLearningProfile(null);
      return;
    }
    renderLearningProfile(history[0]);
    root.innerHTML = history.map(item => {
      const date = item.submittedAt?.toDate ? item.submittedAt.toDate() : null;
      const when = date ? `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : item.examDate;
      return `
        <article class="history-row evening-history-row">
          <div><strong>${item.accuracy}%</strong><span>${item.passed ? "通過" : "未通過"}</span></div>
          <div><b>${escapeHtml(item.examTitle || "晚間驗收")}</b><small>${escapeHtml(item.examDate || "")}</small></div>
          <div><span>${item.score}/${item.total}</span><small>${escapeHtml(when || "")}</small></div>
        </article>
      `;
    }).join("");
  } catch (error) {
    if (currentUser?.uid !== requestedUid) return;
    root.innerHTML = `<div class="empty-history bad-text">讀取失敗：${escapeHtml(error.message)}</div>`;
    renderLearningProfile(null);
  }
}

$("#signInButton").addEventListener("click", async () => {
  $("#signInButton").disabled = true;
  try {
    await signInWithGoogle();
  } catch (error) {
    $("#accountDetail").textContent = error.code === "auth/popup-closed-by-user"
      ? "登入視窗已關閉，你可以再次嘗試。"
      : `登入失敗：${error.message}`;
  } finally {
    $("#signInButton").disabled = false;
  }
});

$("#signOutButton").addEventListener("click", () => signOutUser());
$("#startEveningExam").addEventListener("click", startExam);
$("#nextExamQuestion").addEventListener("click", nextQuestion);
$("#retryEveningExam").addEventListener("click", startExam);
$("#backToEveningHome").addEventListener("click", () => {
  examActive = false;
  $("#examResult").classList.add("hidden");
  $("#examSetup").classList.remove("hidden");
  $("#cloudHistoryCard").classList.remove("hidden");
  if (currentUser) renderCloudHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

watchAuth(renderAccount);
loadExam();
