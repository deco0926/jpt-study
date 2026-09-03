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

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function formatTime(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
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
  }
  updateStartButton();
}

function startExam() {
  if (!currentUser || !exam) return;
  questionIndex = 0;
  selectedIndex = -1;
  answers = [];
  startedAt = performance.now();
  questionStartedAt = startedAt;
  $("#examSetup").classList.add("hidden");
  $("#cloudHistoryCard").classList.add("hidden");
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
  const root = $("#cloudHistory");
  root.innerHTML = '<div class="empty-history">正在讀取你的紀錄…</div>';
  try {
    const history = await loadExamAttempts(currentUser, 10);
    if (!history.length) {
      root.innerHTML = '<div class="empty-history">尚無紀錄，完成第一份晚間驗收後會顯示在這裡。</div>';
      return;
    }
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
    root.innerHTML = `<div class="empty-history bad-text">讀取失敗：${escapeHtml(error.message)}</div>`;
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
  $("#examResult").classList.add("hidden");
  $("#examSetup").classList.remove("hidden");
  $("#cloudHistoryCard").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

watchAuth(renderAccount);
loadExam();
