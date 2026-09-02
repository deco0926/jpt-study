
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const TEST_DATE = new Date("2026-09-13T09:00:00+09:00");

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function updateCountdown(){
  const now = new Date();
  const ms = TEST_DATE - now;
  const days = Math.max(0, Math.ceil(ms / 86400000));
  $("#countdown").textContent = `距離考試約 ${days} 天`;
}

async function loadLesson(){
  const r = await fetch("./lessons/latest.json", {cache:"no-store"});
  if(!r.ok) throw new Error("找不到 lessons/latest.json");
  return await r.json();
}

function getKey(lesson){ return `jpt-progress-${lesson.date}`; }
function readState(lesson){
  try { return JSON.parse(localStorage.getItem(getKey(lesson))) || {checks:{}, quiz:null}; }
  catch { return {checks:{}, quiz:null}; }
}
function saveState(lesson, state){ localStorage.setItem(getKey(lesson), JSON.stringify(state)); }

function renderChecklist(container, items, prefix, lesson, state){
  container.innerHTML = items.map((x,i)=>`
    <label class="check-row">
      <input type="checkbox" data-check="${prefix}-${i}" ${state.checks[`${prefix}-${i}`] ? "checked":""}>
      <span>${esc(x)}</span>
    </label>`).join("");
}

function renderLesson(lesson){
  const state = readState(lesson);
  $("#lessonDate").textContent = lesson.date;
  $("#lessonTitle").textContent = lesson.title;
  $("#duration").textContent = lesson.duration;
  $("#goal").textContent = lesson.goal;

  renderChecklist($("#minimum"), lesson.minimum, "min", lesson, state);

  $("#kanaGrid").innerHTML = lesson.kana.items.map(k=>`
    <div class="kana-item"><strong>${esc(k.kana)}</strong><span>${esc(k.romaji)}</span></div>
  `).join("");
  $("#kanaNotes").innerHTML = lesson.kana.notes.map(x=>`<div>• ${esc(x)}</div>`).join("");

  $("#vocabList").innerHTML = lesson.vocab.map(v=>`
    <article class="item">
      <h3>${esc(v.word)} <small>（${esc(v.reading)}）</small></h3>
      <p><strong>${esc(v.meaning)}</strong></p>
      <p>${esc(v.usage)}</p>
      <p class="example">${esc(v.example)}<br><span class="muted">${esc(v.translation)}</span></p>
    </article>`).join("");

  $("#grammarList").innerHTML = lesson.grammar.map(g=>`
    <article class="item">
      <h3>${esc(g.pattern)}</h3>
      <p><strong>意思：</strong>${esc(g.meaning)}</p>
      <p><strong>接續：</strong>${esc(g.connection)}</p>
      <p><strong>使用：</strong>${esc(g.usage)}</p>
      ${g.examples.map(e=>`<p class="example">${esc(e.jp)}<br><span class="muted">${esc(e.zh)}</span></p>`).join("")}
    </article>`).join("");

  $("#quiz").innerHTML = lesson.quiz.map((q,i)=>`
    <div class="quiz-q" data-q="${i}">
      <strong>${i+1}. ${esc(q.question)}</strong>
      ${q.type === "choice"
        ? q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")
        : `<input type="text" name="q${i}" autocomplete="off" placeholder="輸入答案">`}
    </div>`).join("");

  renderChecklist($("#review"), lesson.review, "review", lesson, state);

  $$(".check-row input").forEach(el => el.addEventListener("change", ()=>{
    state.checks[el.dataset.check] = el.checked;
    saveState(lesson, state);
    updateProgress(lesson, state);
  }));

  $("#submitQuiz").onclick = ()=>gradeQuiz(lesson, state);
  $("#resetProgress").onclick = ()=>{
    if(confirm("確定要重設今天的完成狀態嗎？")){
      localStorage.removeItem(getKey(lesson));
      location.reload();
    }
  };

  if(state.quiz){
    $("#quizResult").textContent = `上次驗收：${state.quiz.score}/${lesson.quiz.length}`;
  }
  updateProgress(lesson, state);
}

function normalize(s){ return String(s ?? "").trim().toLowerCase(); }

function gradeQuiz(lesson, state){
  let score = 0;
  lesson.quiz.forEach((q,i)=>{
    let answer = "";
    if(q.type === "choice"){
      const checked = document.querySelector(`input[name="q${i}"]:checked`);
      answer = checked ? Number(checked.value) : -1;
      if(answer === q.answer) score++;
    }else{
      answer = document.querySelector(`input[name="q${i}"]`).value;
      const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
      if(accepted.map(normalize).includes(normalize(answer))) score++;
    }
  });
  state.quiz = {score, at:new Date().toISOString()};
  saveState(lesson, state);
  const pct = Math.round(score / lesson.quiz.length * 100);
  const r = $("#quizResult");
  r.textContent = `${score}/${lesson.quiz.length}（${pct}%）${pct >= 80 ? " ✅ 今日驗收通過" : " ❌ 未達 80%，需要複習"}`;
  r.className = `result ${pct >= 80 ? "ok":"bad"}`;
  updateProgress(lesson, state);
}

function updateProgress(lesson, state){
  const totalChecks = lesson.minimum.length + lesson.review.length;
  const doneChecks = Object.values(state.checks).filter(Boolean).length;
  const quizPart = state.quiz ? 1 : 0;
  const pct = Math.round((doneChecks + quizPart) / (totalChecks + 1) * 100);
  $("#progressText").textContent = `${pct}%`;
}

updateCountdown();
loadLesson().then(renderLesson).catch(err=>{
  $("#lessonTitle").textContent = "教材載入失敗";
  $("#goal").textContent = err.message;
});
