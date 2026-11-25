import { SECTIONS, taipeiDate, availablePapers, validatePaper, grade, readStore, writeStore } from './practice-core.js';
const $ = s => document.querySelector(s);
const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const time = seconds => `${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,seconds))%60).padStart(2,'0')}`;
let api, user = null, owner = 'guest', index, paper, session = null, view = 'today', history = [], cursor = null, hasMore = false, syncing = false;
let tickAt = Date.now(), finished = false, loadingToken = 0, sessionSaveFallback = [];
const main = $('#main');
const key = suffix => `jpt-n4-sprint-v1:${owner}:${suffix}`;
const localAttempts = () => { const value = readStore(localStorage,key('attempts'),[]); const rows=Array.isArray(value)?value.filter(a=>a?.attemptId&&Array.isArray(a.answers)):[];return [...new Map([...rows,...sessionSaveFallback.filter(a=>a.owner===owner).map(a=>a.attempt)].map(a=>[a.attemptId,a])).values()]; };
function status(text = '', error = false) { $('#globalStatus').textContent = text; $('#globalStatus').classList.toggle('error',error); }
function put(suffix, value) {
  if (!writeStore(localStorage,key(suffix),value)) status('此瀏覽器無法保存本機備份。請保持頁面開啟，並確認交卷後顯示「已同步」。',true);
}
function backup() { if (session && paper && !finished) put(`draft:${paper.date}`,session); }
function stopAudio() { document.querySelectorAll('audio').forEach(a => a.pause()); window.speechSynthesis?.cancel(); }
function pause() { if (!session) return; accrue(); session.paused = true; stopAudio(); backup(); updateClock(); }
function accrue() {
  const now = Date.now();
  if (session && !session.paused && !finished) {
    const delta = (now-tickAt)/1000; session.elapsed += delta;
    const q = paper.questions[session.position]; session.times[q.id] = (session.times[q.id] || 0) + delta;
  }
  tickAt = now;
}
function updateClock() {
  if (!$('#remaining') || !session) return;
  $('#remaining').textContent = session.paused ? '已暫停' : time(1500-session.elapsed);
  $('#timingNote').textContent = session.elapsed >= 1500 ? '建議作答時間已到，可繼續完成後交卷。' : '25 分鐘作答＋5 分鐘訂正';
  $('#pause').textContent = session.paused ? '繼續作答' : '暫停';
  $('#questionBody').inert = session.paused;
  $('#pauseNotice').hidden = !session.paused;
}
setInterval(() => { accrue(); updateClock(); backup(); }, 4000);
document.addEventListener('visibilitychange', () => { if (document.hidden && session && !finished) pause(); });
window.addEventListener('pagehide',() => { accrue(); backup(); });
window.addEventListener('beforeunload',event => { if (session && !finished) { accrue(); backup(); event.preventDefault(); event.returnValue = ''; } });

function activate(name) { view = name; document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active',b.dataset.view===name)); }
function draftFor(date) {
  const d = readStore(localStorage,key(`draft:${date}`),null);
  return d && d.date===date && typeof d.selections==='object' && d.selections && typeof d.times==='object' && Number.isFinite(d.elapsed) && d.elapsed>=0 && Number.isInteger(d.position) && d.position>=0 && d.position<20 && Array.isArray(d.flags) ? d : null;
}
function leaveExam() { pause(); session = null; paper = null; finished = false; }
function showToday() {
  ++loadingToken; leaveExam(); activate('today'); status();
  const today = taipeiDate(), list = availablePapers(index,today), current = list[0];
  if (!current) { main.innerHTML='<section class="card"><h1>題組準備中</h1><p>首份題組於 11/25 開放。</p></section>'; return; }
  const days = Math.max(0,Math.ceil((Date.parse('2026-12-06T00:00:00+08:00')-Date.parse(`${today}T00:00:00+08:00`))/86400000));
  const saved = localAttempts().filter(a=>a.examDate===current.date), draft = draftFor(current.date);
  main.innerHTML=`<section class="hero"><div><p class="eyebrow">JLPT N4 · 2026 / 12 / 06</p><h1>每天 30 分鐘，<br>用題目找出得分點。</h1><p>直接做題，交卷後再補觀念。先把會的分數拿穩，再訂正今天的錯題。</p></div><div class="countdown"><span>距離考試</span><strong>${days}</strong><span>天</span></div></section>
  <div class="grid"><section class="card"><div class="row"><span class="eyebrow">DAILY PRACTICE</span><span class="badge date">${html(current.date)}</span></div><h2>${html(current.title)}</h2><p class="muted">${html(current.focus)}</p><div class="facts"><div><strong>20 題</strong><span>原創濃縮模擬題</span></div><div><strong>25＋5 分</strong><span>作答與訂正</span></div><div><strong>${saved.length || '—'}</strong><span>本機已完成次數</span></div></div>
  ${today>'2026-12-05'?'<p class="notice">考前題組已全部開放。今天可重做錯題與歷屆題組。</p>':''}
  <div class="actions"><button id="start" class="button">${draft?'繼續上次作答':'開始今日刷題'}</button><button id="archiveLink" class="ghost">查看每日題庫</button></div><p class="status muted">${user?'已登入：每次交卷會同步到帳號，並在本機留備份。':'目前為本機練習，紀錄只保存在這個瀏覽器。登入後的新作答會同步到帳號。'}</p><p class="muted">可跳題、標記待檢查；離開頁面會暫停並保存進度。重做會新增紀錄。</p></section>
  <aside class="card"><p class="eyebrow">TODAY’S ROUTINE</p><h2>先做題，再訂正</h2><ul class="plan"><li><span>文字・語彙・文法 · 8 題</span><b>7 分</b></li><li><span>閱讀 · 6 題</span><b>10 分</b></li><li><span>聽力 · 6 題</span><b>8 分</b></li><li><span>錯題訂正</span><b>5 分</b></li></ul><div class="hint">猜題也要先選答案。訂正時抓住一個關鍵詞，再重做一次。練習目標維持 80%；這不是 JLPT 官方及格分數。</div></aside></div>`;
  $('#start').onclick=()=>openPaper(current.date); $('#archiveLink').onclick=showArchive;
}
function showArchive() {
  ++loadingToken; leaveExam(); activate('archive'); status();
  const papers=availablePapers(index);
  main.innerHTML=`<section class="card"><p class="eyebrow">PAPER ARCHIVE</p><h1>每天的題目，都在這裡。</h1><p class="muted">11/25 至 12/5，每天一份不同題組。按台灣日期開放，所有已開放題組可隨時重做。</p></section><div class="paper-list">${papers.map(p=>`<article class="card"><span class="badge date">${html(p.date)}</span><h3>${html(p.title)}</h3><p class="muted">${html(p.focus)}</p><p>20 題 · 30 分鐘</p><button class="button small" data-paper="${html(p.date)}">${draftFor(p.date)?'繼續作答':'開始練習'}</button> <a class="ghost small" href="?date=${html(p.date)}">獨立網址</a></article>`).join('')}</div>`;
  main.querySelectorAll('[data-paper]').forEach(b=>b.onclick=()=>openPaper(b.dataset.paper));
}
async function openPaper(date, fresh = false) {
  const token=++loadingToken;
  if (!availablePapers(index).some(p=>p.date===date)) { status('這份題組尚未開放。',true); return; }
  leaveExam(); main.innerHTML='<p class="loading">正在載入題目…</p>';
  try {
    const response=await fetch(`./practice/${date}.json`);
    if (!response.ok) throw new Error('題組載入失敗，請稍後重試。');
    const loaded=validatePaper(await response.json()); if (token!==loadingToken) return;
    paper=loaded; finished=false;
    session=(!fresh && draftFor(date)) || { date, position:0, selections:{}, times:{}, flags:[], elapsed:0, attemptId:crypto.randomUUID(), paused:false };
    session.paused=false; tickAt=Date.now(); backup(); activate('today'); renderQuestion();
  } catch(e) { if(token!==loadingToken)return; status(e.message,true); main.innerHTML='<button id="reload" class="ghost">返回首頁</button>'; $('#reload').onclick=showToday; }
}
function renderQuestion() {
  stopAudio(); const q=paper.questions[session.position]; const answered=Object.keys(session.selections).length;
  main.innerHTML=`<div class="toolbar"><div><strong>${html(paper.date)}</strong><div class="muted">已作答 ${answered} / 20</div></div><div><span id="remaining" class="clock"></span><div id="timingNote" class="muted"></div></div><button id="pause" class="ghost small">暫停</button><button id="submit" class="button small">交卷</button></div>
  <p id="pauseNotice" class="notice" hidden>已暫停計時與播放。按「繼續作答」後再開始。</p><div class="exam-layout"><aside class="navigator card"><p class="eyebrow">QUESTION MAP</p><div class="section-nav">${Object.entries(SECTIONS).map(([section,label])=>`<div><h3>${label}</h3><div class="numbers">${paper.questions.map((item,i)=>item.section===section?`<button data-jump="${i}" class="${session.selections[item.id]!==undefined?'answered ':''}${session.position===i?'current ':''}${session.flags.includes(item.id)?'flagged':''}" aria-label="第 ${i+1} 題${session.selections[item.id]!==undefined?'，已作答':''}" ${session.position===i?'aria-current="step"':''}>${i+1}</button>`:'').join('')}</div></div>`).join('')}</div><p class="muted status">綠底：已答<br>黃線：待檢查</p><button id="exit" class="ghost small">保存並返回</button></aside>
  <section id="questionBody" class="card"><div class="row question-head"><span class="badge">${SECTIONS[q.section]} · ${html(q.type)}</span><button id="flag" class="ghost small" aria-pressed="${session.flags.includes(q.id)}">${session.flags.includes(q.id)?'已標記待檢查':'標記待檢查'}</button></div><p class="eyebrow">QUESTION ${session.position+1} / 20</p>${q.passage?`<div class="passage" lang="ja">${html(q.passage)}</div>`:''}
  ${q.audio?`<div class="audio-panel"><strong>先看問題，再播放音訊</strong><audio id="questionAudio" controls preload="none" src="${html(q.audio)}"></audio><p>可重播。逐字稿於交卷後顯示。</p><p id="audioError" class="error" hidden>音檔無法播放。可使用日語朗讀備援。</p><button id="speech" class="ghost small">使用裝置日語朗讀</button><p id="speechStatus" role="status"></p></div>`:''}
  <h2 class="question-text" lang="ja" tabindex="-1">${html(q.question)}</h2><div class="options" role="group" aria-label="答案選項">${q.options.map((option,i)=>`<button data-answer="${i}" class="option ${session.selections[q.id]===i?'selected':''}" aria-pressed="${session.selections[q.id]===i}"><span>${i+1}</span><b lang="ja">${html(option)}</b></button>`).join('')}</div><div class="actions row"><button id="previous" class="ghost" ${session.position===0?'disabled':''}>上一題</button><button id="next" class="button">${session.position===19?'檢查並交卷':'下一題'}</button></div></section></div>`;
  main.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{accrue();session.selections[q.id]=Number(b.dataset.answer);backup();renderQuestion();});
  main.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.jump)));
  $('#previous').onclick=()=>jump(session.position-1); $('#next').onclick=()=>session.position===19?confirmSubmit():jump(session.position+1);
  $('#flag').onclick=()=>{session.flags=session.flags.includes(q.id)?session.flags.filter(id=>id!==q.id):[...session.flags,q.id];backup();renderQuestion();};
  $('#pause').onclick=()=>{accrue();session.paused=!session.paused;tickAt=Date.now();stopAudio();backup();updateClock();};
  $('#exit').onclick=showToday; $('#submit').onclick=confirmSubmit;
  if(q.audio) { $('#questionAudio').onerror=()=>{$('#audioError').hidden=false;}; $('#speech').onclick=()=>speak(q.script); }
  updateClock();
}
function jump(position) { accrue();session.position=position;backup();renderQuestion();$('.question-text')?.focus({preventScroll:true}); }
function speak(script) {
  stopAudio(); const synth=window.speechSynthesis, voices=synth?.getVoices().filter(v=>/^ja\b/i.test(v.lang));
  if (!voices?.length) { $('#speechStatus').textContent='此裝置沒有日語語音，請使用上方音檔，或在裝置加入日語語音。'; return; }
  const speech=new SpeechSynthesisUtterance(script);speech.voice=voices[0];speech.lang='ja-JP';speech.rate=.9;
  speech.onerror=()=>{if($('#speechStatus'))$('#speechStatus').textContent='裝置朗讀失敗，請使用音檔。';};synth.speak(speech);
}
function confirmSubmit() {
  const missing=20-Object.keys(session.selections).length;
  $('#submitSummary').textContent=`已作答 ${20-missing} / 20 題${missing?`，還有 ${missing} 題未作答，將以答錯計算。`:'。'}待檢查 ${session.flags.length} 題。`;
  $('#submitDialog').showModal();
}
$('#cancelSubmit').onclick=()=>$('#submitDialog').close();
$('#confirmSubmit').onclick=()=>{ $('#submitDialog').close(); finish(); };
async function finish() {
  if(finished || !session)return; accrue();finished=true;stopAudio();
  const attempt={ schemaVersion:2, mode:'jlpt-n4-sprint', attemptId:session.attemptId, examDate:paper.date, examTitle:paper.title,
    completedAt:new Date().toISOString(), totalTime:Math.round(session.elapsed), ...grade(paper,session.selections,session.times), passScore:80 };
  attempt.passed=attempt.accuracy>=80; attempt.synced=false;
  attempt.backupSaved = writeStore(localStorage,key('storage-check'),true);
  const all=localAttempts(); if(!all.some(a=>a.attemptId===attempt.attemptId)) { all.unshift(attempt);put('attempts',all); }
  sessionSaveFallback.push({owner,attempt});
  // Retain a completed draft marker until the full result is in a durable store.
  if(writeStore(localStorage,key('attempts'),all)) localStorage.removeItem(key(`draft:${paper.date}`));
  session=null;renderResult(attempt); await syncPending();
}
function renderResult(attempt) {
  stopAudio(); const answers=attempt.answers || [], wrong=answers.filter(a=>!a.isCorrect);
  const sectionOf=a=>a.section || (['reading','listening'].includes(a.category)?a.category:'general');
  const sections=attempt.sections || Object.keys(SECTIONS).map(section=>({section,total:answers.filter(a=>sectionOf(a)===section).length,correct:answers.filter(a=>sectionOf(a)===section&&a.isCorrect).length}));
  main.innerHTML=`<section class="card"><div class="row"><div><p class="eyebrow">YOUR RESULT · ${html(attempt.examDate)}</p><h1>${html(attempt.examTitle)}</h1></div><div><div class="result-score">${attempt.score} <span class="muted">/ ${attempt.total}</span></div><span>${attempt.accuracy}% · 用時 ${time(attempt.totalTime)}</span></div></div><div class="section-scores">${sections.map(s=>`<div>${SECTIONS[s.section]}<strong>${s.correct} / ${s.total}</strong></div>`).join('')}</div><p id="saveState" class="hint">${attempt.synced?'已同步至帳號。':user?'已在本機備份，正在嘗試同步至帳號。':(attempt.backupSaved===false?'無法寫入本機儲存。請立即下載這次紀錄，關閉頁面前先保存。':'已保存至此瀏覽器。此為本機練習，未同步到帳號。')}</p><p>用最後 5 分鐘訂正 ${wrong.length} 道錯題。先找出題幹關鍵詞，再看解析；有空可展開答對題確認觀念。</p><div class="actions"><button id="retry" class="button">重做這份題組</button><button id="resultHistory" class="ghost">所有作答紀錄</button><button id="exportAttempt" class="ghost">下載這次紀錄</button><button id="syncRetry" class="ghost" ${!user?'hidden':''}>重試同步</button></div></section><section class="card"><h2>逐題答案與解析</h2>${answers.map((a,i)=>`<details class="review" ${!a.isCorrect?'open':''}><summary><span class="${a.isCorrect?'correct':'incorrect'}">${a.isCorrect?'答對':'答錯'}</span> · ${i+1}. ${html(a.question)}</summary>${a.passage?`<div class="passage" lang="ja">${html(a.passage)}</div>`:''}${a.audio?`<audio controls preload="none" src="${html(a.audio)}"></audio>`:''}${a.script?`<p lang="ja"><b>聽力逐字稿</b><br>${html(a.script)}</p>`:''}<p>你的答案：<b>${html(a.selected)}</b><br>正確答案：<b class="correct">${html(a.correct)}</b></p><p>${html(a.explanation)}</p></details>`).join('')}</section>`;
  $('#retry').hidden=!availablePapers(index).some(p=>p.date===attempt.examDate);
  $('#retry').onclick=()=>openPaper(attempt.examDate,true); $('#resultHistory').onclick=()=>showHistory();$('#syncRetry').onclick=syncPending;
  $('#exportAttempt').onclick=()=>download(attempt,`N4-${attempt.examDate}-${attempt.attemptId || attempt.id}.json`);
  window.scrollTo({top:0,behavior:'smooth'});
}
function download(data,name) { const link=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function syncPending() {
  if(!api || !user || syncing)return; syncing=true;const uid=user.uid, ownerKey=owner, account=user;
  try {
    for(const attempt of localAttempts().filter(a=>!a.synced)) {
      if(owner!==ownerKey)return;
      const {synced,...payload}=attempt; await api.savePracticeAttempt(account,payload);
      if(owner!==ownerKey)return;
      const list=localAttempts();const row=list.find(a=>a.attemptId===attempt.attemptId);if(row)row.synced=true;put('attempts',list);
      sessionSaveFallback=sessionSaveFallback.filter(a=>!(a.owner===ownerKey&&a.attempt.attemptId===attempt.attemptId));
    }
    if(owner===uid && $('#globalStatus').textContent.startsWith('雲端同步未完成'))status();
    if(owner===uid && $('#saveState'))$('#saveState').textContent='已同步至帳號，並保留本機備份。';
  } catch(e) { if(owner===ownerKey){status(`雲端同步未完成：${e.message}。本機備份仍保留，可按「重試同步」。`,true);if($('#saveState'))$('#saveState').textContent='同步失敗，本機備份已保留。';} }
  finally {syncing=false;}
}
async function showHistory(more=false) {
  if(!more){leaveExam();activate('history');history=[];cursor=null;}
  const who=owner, historyToken=++loadingToken;
  main.innerHTML='<section class="card"><p>正在載入作答紀錄…</p></section>';
  let error='';
  if(user && api)try{const page=await api.loadAttemptPage(user,cursor);if(owner!==who || historyToken!==loadingToken)return;history.push(...page.items.map(a=>({...a,synced:true})));cursor=page.cursor;hasMore=page.hasMore;}catch(e){error=e.message;}
  if(owner!==who || historyToken!==loadingToken)return;
  const merged=new Map();for(const a of [...localAttempts(),...history])merged.set(a.attemptId || a.id,a);
  const rows=[...merged.values()].sort((a,b)=>(b.completedAt || b.examDate || '').localeCompare(a.completedAt || a.examDate || ''));
  main.innerHTML=`<section class="card"><div class="row"><div><p class="eyebrow">YOUR PRACTICE LOG</p><h1>每一次作答，都有紀錄。</h1></div><button id="exportAll" class="ghost">下載已載入紀錄</button></div><p class="muted">${user?'目前登入帳號的私人紀錄。每次重做分開保存，可載入更早紀錄。':'目前顯示此瀏覽器的本機練習。登入後可查看該帳號的雲端紀錄。'}</p>${error?`<p class="error">雲端讀取失敗：${html(error)}。以下先顯示本機備份。</p>`:''}<div>${rows.length?rows.map((a,i)=>`<article class="history-item row"><div><span class="badge">${html(a.examDate)}</span><h3>${html(a.examTitle)}</h3><span class="muted">${html(a.completedAt?new Date(a.completedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'}):'舊今日驗收紀錄')} · ${time(a.totalTime)}</span></div><div><strong>${a.score} / ${a.total} · ${a.accuracy}%</strong><p><button data-review="${i}" class="ghost small">查看答案與解析</button></p></div></article>`).join(''):'<p>尚無作答紀錄，先完成今天的 20 題。</p>'}</div>${user&&hasMore?'<button id="more" class="ghost">載入更早紀錄</button>':''}<div class="actions"><button id="historyHome" class="button">回到今日刷題</button>${user?'<button id="retryPending" class="ghost">同步本機待傳紀錄</button>':''}</div></section>`;
  main.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>renderResult(rows[Number(b.dataset.review)]));
  $('#exportAll').onclick=()=>download(rows,'N4-practice-history.json');$('#historyHome').onclick=showToday;
  if($('#more'))$('#more').onclick=()=>showHistory(true);if($('#retryPending'))$('#retryPending').onclick=syncPending;
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{++loadingToken;if(!index)return;({today:showToday,archive:showArchive,history:showHistory})[b.dataset.view]();});
$('#login').onclick=async()=>{try{await api.signInWithGoogle();}catch(e){status(`登入未完成：${e.message}`,true);}};
$('#logout').onclick=async()=>{pause();try{await api.signOutUser();}catch(e){status(e.message,true);}};
window.addEventListener('online',syncPending);
async function init() {
  try {const response=await fetch('./practice/index.json',{cache:'no-store'});if(!response.ok)throw new Error('每日題庫載入失敗');index=await response.json();const date=new URLSearchParams(location.search).get('date');if(date&&availablePapers(index).some(p=>p.date===date))await openPaper(date);else showToday();}
  catch(e){main.innerHTML=`<section class="card"><h1>暫時無法載入</h1><p>${html(e.message)}</p><a class="button" href="./index.html">重新載入</a></section>`;}
  try {api=await import('./firebase.js');api.watchAuth(account=>{
    const newOwner=account?.uid || 'guest';if(newOwner!==owner){leaveExam();++loadingToken;}const changed=newOwner!==owner;user=account;owner=newOwner;
    $('#accountName').textContent=account?.displayName || (account?'已登入':'本機練習');$('#login').hidden=!!account;$('#logout').hidden=!account;
    if(changed&&index)showToday();if(account)syncPending();
  });}catch(e){$('#accountName').textContent='本機練習';status('帳號服務暫時無法連線。仍可練習並保存本機紀錄；請稍後重新載入登入。',true);}
}
init();
