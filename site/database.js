const kanaRows = [
  {row:"あ行", h:["あ","い","う","え","お"], k:["ア","イ","ウ","エ","オ"], r:["a","i","u","e","o"]},
  {row:"か行", h:["か","き","く","け","こ"], k:["カ","キ","ク","ケ","コ"], r:["ka","ki","ku","ke","ko"]},
  {row:"さ行", h:["さ","し","す","せ","そ"], k:["サ","シ","ス","セ","ソ"], r:["sa","shi","su","se","so"]},
  {row:"た行", h:["た","ち","つ","て","と"], k:["タ","チ","ツ","テ","ト"], r:["ta","chi","tsu","te","to"]},
  {row:"な行", h:["な","に","ぬ","ね","の"], k:["ナ","ニ","ヌ","ネ","ノ"], r:["na","ni","nu","ne","no"]},
  {row:"は行", h:["は","ひ","ふ","へ","ほ"], k:["ハ","ヒ","フ","ヘ","ホ"], r:["ha","hi","fu","he","ho"]},
  {row:"ま行", h:["ま","み","む","め","も"], k:["マ","ミ","ム","メ","モ"], r:["ma","mi","mu","me","mo"]},
  {row:"や行", h:["や","","ゆ","","よ"], k:["ヤ","","ユ","","ヨ"], r:["ya","","yu","","yo"]},
  {row:"ら行", h:["ら","り","る","れ","ろ"], k:["ラ","リ","ル","レ","ロ"], r:["ra","ri","ru","re","ro"]},
  {row:"わ行", h:["わ","","","","を"], k:["ワ","","","","ヲ"], r:["wa","","","","wo"]},
  {row:"ん", h:["ん"], k:["ン"], r:["n"]}
];

const vocab = [
  ["ホテル","hoteru","飯店、旅館","ホテルに行きます。","去飯店。"],
  ["バス","basu","公車、巴士","バスで行きます。","搭公車去。"],
  ["スーパー","sūpā","超市","スーパーに行きます。","去超市。"],
  ["テスト","tesuto","考試、測驗","テストです。","是考試。"],
  ["アイス","aisu","冰淇淋、冰品","アイスを食べます。","吃冰淇淋。"],
  ["駅","えき / eki","車站","駅に行きます。","去車站。"],
  ["学校","がっこう / gakkō","學校","学校に行きます。","去學校。"],
  ["電車","でんしゃ / densha","電車","電車で行きます。","搭電車去。"],
  ["食べる","たべる / taberu","吃","ご飯を食べます。","吃飯。"],
  ["行く","いく / iku","去","学校に行きます。","去學校。"],
  ["水","みず / mizu","水","水を飲みます。","喝水。"],
  ["ご飯","ごはん / gohan","飯、餐","ご飯を食べます。","吃飯。"],
  ["飲む","のむ / nomu","喝","水を飲みます。","喝水。"],
  ["買う","かう / kau","買","アイスを買います。","買冰淇淋。"],
  ["見る","みる / miru","看","テレビを見ます。","看電視。"],
  ["本","ほん / hon","書","私の本です。","是我的書。"],
  ["店","みせ / mise","店、商店","店に行きます。","去商店。"],
  ["今日","きょう / kyō","今天","今日は学校に行きます。","今天去學校。"],
  ["明日","あした / ashita","明天","明日、学校に行きます。","明天去學校。"],
  ["友達","ともだち / tomodachi","朋友","友達と行きます。","和朋友去。"],
  ["家","いえ / ie","家","家に帰ります。","回家。"],
  ["一緒に","いっしょに / issho ni","一起","一緒に行きます。","一起去。"],
  ["誰","だれ / dare","誰","誰ですか。","是誰？"],
  ["朝","あさ / asa","早上","朝、ご飯を食べます。","早上吃飯。"],
  ["夜","よる / yoru","晚上","夜、水を飲みます。","晚上喝水。"],
  ["毎日","まいにち / mainichi","每天","毎日、学校に行きます。","每天去學校。"],
  ["昨日","きのう / kinō","昨天","昨日、学校に行きました。","昨天去了學校。"],
  ["会社","かいしゃ / kaisha","公司","会社に行きます。","去公司。"],
  ["仕事","しごと / shigoto","工作","仕事をします。","工作。"],
  ["帰る","かえる / kaeru","回去、回家","家に帰ります。","回家。"],
  ["タクシー","takushī","計程車","タクシーでホテルに行きます。","搭計程車去飯店。"],
  ["トイレ","toire","廁所","トイレはどこですか。","廁所在哪裡？"]
];

const grammar = [
  {p:"A は B です", m:"以 A 為主題，表達「A 是 B」。助詞 は 在這裡念 wa。", ex:"私は学生です。", zh:"我是學生。"},
  {p:"A の B", m:"表示所屬或關係，可先理解成「A 的 B」。", ex:"私の本です。", zh:"是我的書。"},
  {p:"地點 ＋ に ＋ 行きます", m:"に 標示移動的目的地或到達點。", ex:"学校に行きます。", zh:"去學校。"},
  {p:"交通工具 ＋ で ＋ 行きます", m:"で 表示使用的交通工具或手段。", ex:"電車で行きます。", zh:"搭電車去。"},
  {p:"名詞 ＋ を ＋ 動詞", m:"を 表示動作直接作用的對象，作助詞時通常念 o。", ex:"水を飲みます。", zh:"喝水。"},
  {p:"地點 ＋ へ ＋ 行きます", m:"へ 表示前往的方向，作助詞時念 e。", ex:"日本へ行きます。", zh:"去日本。"},
  {p:"～ですか", m:"句尾加 か 形成疑問句。", ex:"学生ですか。", zh:"是學生嗎？"},
  {p:"人 ＋ と", m:"と 可表示「和某人一起」。", ex:"友達と行きます。", zh:"和朋友去。"},
  {p:"～ます", m:"禮貌的現在／未來肯定。", ex:"学校に行きます。", zh:"去／會去學校。"},
  {p:"～ません", m:"禮貌的現在／未來否定。", ex:"学校に行きません。", zh:"不去／不會去學校。"},
  {p:"～ました", m:"禮貌的過去肯定。", ex:"昨日、学校に行きました。", zh:"昨天去了學校。"},
  {p:"～ませんでした", m:"禮貌的過去否定。", ex:"昨日、学校に行きませんでした。", zh:"昨天沒有去學校。"},
  {p:"～ませんか", m:"常用來禮貌邀請對方「要不要一起～？」", ex:"一緒に行きませんか。", zh:"要不要一起去？"}
];

const vocabGroups={
  "動詞":new Set(["食べる","行く","飲む","買う","見る","帰る","会う","勉強する","寝る","起きる","休む","使う","書く","聞く","話す","読む","入る","出る","待つ","忘れる","急ぐ","持つ","閉める","開ける"]),
  "形容詞":new Set(["おいしい","にぎやか","便利","古い","大きい","安い","小さい","新しい","静か","高い"]),
  "副詞・時間詞":new Set(["今日","明日","一緒に","朝","夜","毎日","昨日","午前","午後","今"]),
  "其他":new Set(["誰","ここ"])
};

const verbForms={
  "食べる":["食べます","食べない","食べました","食べて"], "行く":["行きます","行かない","行きました","行って"],
  "飲む":["飲みます","飲まない","飲みました","飲んで"], "買う":["買います","買わない","買いました","買って"],
  "見る":["見ます","見ない","見ました","見て"], "帰る":["帰ります","帰らない","帰りました","帰って"],
  "会う":["会います","会わない","会いました","会って"], "勉強する":["勉強します","勉強しない","勉強しました","勉強して"],
  "寝る":["寝ます","寝ない","寝ました","寝て"], "起きる":["起きます","起きない","起きました","起きて"],
  "休む":["休みます","休まない","休みました","休んで"], "使う":["使います","使わない","使いました","使って"],
  "書く":["書きます","書かない","書きました","書いて"], "聞く":["聞きます","聞かない","聞きました","聞いて"],
  "話す":["話します","話さない","話しました","話して"], "読む":["読みます","読まない","読みました","読んで"],
  "入る":["入ります","入らない","入りました","入って"], "出る":["出ます","出ない","出ました","出て"],
  "待つ":["待ちます","待たない","待ちました","待って"], "忘れる":["忘れます","忘れない","忘れました","忘れて"],
  "急ぐ":["急ぎます","急がない","急ぎました","急いで"], "持つ":["持ちます","持たない","持ちました","持って"],
  "閉める":["閉めます","閉めない","閉めました","閉めて"], "開ける":["開けます","開けない","開けました","開けて"]
};

function vocabCategory(vocabItem){
  const word=Array.isArray(vocabItem) ? vocabItem[0] : vocabItem;
  const storedCategory=Array.isArray(vocabItem) ? vocabItem[5]?.category : "";
  return storedCategory || Object.entries(vocabGroups).find(([,words])=>words.has(word))?.[0] || "名詞";
}

function displayedVerbForms(vocabItem){
  const stored=vocabItem[5]?.forms;
  if(stored?.masu && stored?.nai && stored?.past && stored?.te){
    return [stored.masu,stored.nai,stored.past,stored.te];
  }
  return verbForms[vocabItem[0]] || null;
}

function grammarCategory(grammarItem){
  const pattern=typeof grammarItem==="string" ? grammarItem : grammarItem.p;
  if(typeof grammarItem!=="string" && grammarItem.category) return grammarItem.category;
  if(pattern.includes("形容詞")) return "形容詞";
  if(pattern.includes("時間") || pattern.includes("順序") || pattern.includes("てから")) return "時間・順序";
  if(pattern.includes("ませんか") || pattern.includes("ください")) return "請求・邀請";
  if(pattern.includes("てもいい") || pattern.includes("てはいけません") || pattern.includes("規則句尾")) return "許可・禁止";
  if(pattern.includes("ない形")) return "ない形";
  if(pattern.includes("て形") || pattern.includes("～て")) return "て形";
  if(pattern.includes(" ＋ に ＋ ") || pattern.includes(" ＋ で ＋ ") || pattern.includes(" ＋ を ＋ ") || pattern.includes(" ＋ へ ＋ ") || pattern.includes(" ＋ と")) return "助詞";
  if(pattern==="～ました" || pattern==="～ませんでした") return "過去";
  if(pattern==="～ます" || pattern==="～ません" || pattern==="ます／ません") return "現在・未來";
  if(pattern.includes("ます") || pattern.includes("ません") || pattern.includes("時態")) return "時態整理";
  return "基礎句型";
}

let kanaMode = "both", kanaRowFilter = "all", randomKana = null;
let vocabFilter = "all", grammarFilter = "all", vocabQuery = "", grammarQuery = "";
let vocabPage = 1, grammarPage = 1;
const PAGE_SIZE = 24;
const DB_ROW_IDS = ["a","k","s","t","n","h","m","y","r","w","w"];
const $db = selector => document.querySelector(selector);
function esc(s="") { return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function normalize(s="") { return String(s).normalize("NFKC").trim().toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)); }
function vocabText(v) { return [v.slice(0,5).join(" "),v[5]?.usage || "",...(displayedVerbForms(v)||[])].join(" "); }
function grammarText(g) { return [g.p,g.m,g.ex,g.zh,g.connection,g.usage,...(g.examples||[]).flatMap(e=>[e.jp,e.zh])].filter(Boolean).join(" "); }

function activatePanel(name, updateHash=false) {
  if(!['vocab','grammar','kana'].includes(name))return;
  document.querySelectorAll('[data-db-panel]').forEach(p=>p.hidden=p.dataset.dbPanel!==name);
  document.querySelectorAll('[data-db-tab]').forEach(b=>{const active=b.dataset.dbTab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  if(updateHash)history.replaceState(null,'',`#${name}-section`);
}
function activateHash() {
  const hash=location.hash.slice(1);
  const name=hash.startsWith('grammar-')?'grammar':hash.startsWith('kana-')?'kana':'vocab';
  activatePanel(name);
  const match=/^(vocab|grammar)-(\d+)$/.exec(hash);
  if(match)showResult({type:match[1]==='vocab'?'單字':'文法',index:Number(match[2]),href:`#${hash}`},false);
}
function updateFilterCounts(kind, source, category) {
  document.querySelectorAll(`[data-${kind}-category]`).forEach(b=>{
    const value=b.dataset[`${kind}Category`], count=value==='all'?source.length:source.filter(v=>category(v)===value).length;
    b.innerHTML=`${esc(value==='all'?'全部':value)}<span>${count}</span>`;
    b.classList.toggle('active',value===(kind==='vocab'?vocabFilter:grammarFilter));
    b.setAttribute('aria-pressed',String(b.classList.contains('active')));
  });
}
function renderKana() {
  $db('#gojuonTable').innerHTML=kanaRows.map((row,rowIndex)=>({row,rowIndex}))
    .filter(x=>kanaRowFilter==='all'||DB_ROW_IDS[x.rowIndex]===kanaRowFilter).map(({row,rowIndex})=>{
      const cells=row.r.map((romaji,i)=>{
        if(!romaji)return '<div class="gojuon-cell empty" aria-hidden="true"></div>';
        const h=row.h[i]||'',k=row.k[i]||'';
        const display=kanaMode==='both'?`<span lang="ja">${esc(h)}</span><span class="kana-secondary" lang="ja">${esc(k)}</span>`:esc(kanaMode==='hiragana'?h:k);
        return `<div class="gojuon-cell" id="kana-${rowIndex}-${i}"><strong lang="ja">${display}</strong><span>${esc(romaji)}</span></div>`;
      }).join('');
      return `<div class="gojuon-row"><div class="gojuon-label">${esc(row.row)}</div>${cells}</div>`;
    }).join('');
}
function pagination(kind,page,total,render) {
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE)),root=$db(`#${kind}Pagination`);
  root.innerHTML=pages>1?`<button class="ghost small" data-prev ${page===1?'disabled':''}>上一頁</button><span aria-live="polite">${page} / ${pages} 頁</span><button class="ghost small" data-next ${page===pages?'disabled':''}>下一頁</button>`:'';
  root.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    if(kind==='vocab')vocabPage+=b.hasAttribute('data-next')?1:-1;else grammarPage+=b.hasAttribute('data-next')?1:-1;
    render();$db(`#${kind}-section`).scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function getVocabEntries() {
  return vocab.map((v,index)=>({v,index})).filter(({v})=>vocabFilter==='all'||vocabCategory(v)===vocabFilter).filter(({v})=>!vocabQuery||normalize(vocabText(v)).includes(vocabQuery));
}
function renderVocab() {
  const entries=getVocabEntries();vocabPage=Math.min(vocabPage,Math.max(1,Math.ceil(entries.length/PAGE_SIZE)));
  const visible=entries.slice((vocabPage-1)*PAGE_SIZE,vocabPage*PAGE_SIZE);
  $db('#vocabDb').innerHTML=visible.length?visible.map(({v,index})=>{
    const forms=displayedVerbForms(v),usage=v[5]?.usage;
    return `<article class="db-entry" id="vocab-${index}"><div class="db-entry-head"><div><h3 lang="ja">${esc(v[0])}</h3><span class="reading">${esc(v[1])}</span></div><span class="db-category-tag">${esc(vocabCategory(v))}</span></div><p class="db-meaning">${esc(v[2])}</p>${v[3]?`<p class="example"><span lang="ja">${esc(v[3])}</span>${v[4]?`<span class="muted">${esc(v[4])}</span>`:''}</p>`:''}${forms||usage?`<details class="entry-details"><summary>${forms?'動詞變化與用法':'查看用法'}</summary>${usage?`<p class="entry-detail-text">${esc(usage)}</p>`:''}${forms?`<div class="verb-forms">${['ます形','ない形','過去形','て形'].map((label,i)=>`<span>${label}<b lang="ja">${esc(forms[i])}</b></span>`).join('')}</div>`:''}</details>`:''}</article>`;
  }).join(''):'<div class="empty-db"><b>沒有找到符合的單字</b>試試更短的日文、讀音或中文，也可以切回「全部」。</div>';
  $db('#vocabVisibleCount').textContent=entries.length?`${(vocabPage-1)*PAGE_SIZE+1}–${Math.min(vocabPage*PAGE_SIZE,entries.length)} / ${entries.length} 筆`:'0 筆結果';
  updateFilterCounts('vocab',vocab,vocabCategory);pagination('vocab',vocabPage,entries.length,renderVocab);
}
function renderGrammar() {
  const entries=grammar.map((g,index)=>({g,index})).filter(({g})=>grammarFilter==='all'||grammarCategory(g)===grammarFilter).filter(({g})=>!grammarQuery||normalize(grammarText(g)).includes(grammarQuery));
  grammarPage=Math.min(grammarPage,Math.max(1,Math.ceil(entries.length/PAGE_SIZE)));
  $db('#grammarDb').innerHTML=entries.length?entries.slice((grammarPage-1)*PAGE_SIZE,grammarPage*PAGE_SIZE).map(({g,index})=>{
    const extra=(g.examples||[]).filter(e=>e.jp&&e.jp!==g.ex);
    return `<article class="db-entry" id="grammar-${index}"><span class="db-category-tag">${esc(grammarCategory(g))}</span><h3 lang="ja">${esc(g.p)}</h3><p class="grammar-meaning">${esc(g.m)}</p>${g.ex?`<p class="example"><span lang="ja">${esc(g.ex)}</span><span class="muted">${esc(g.zh)}</span></p>`:''}${g.connection||g.usage||extra.length?`<details class="entry-details"><summary>接續、用法與更多例句</summary>${g.connection?`<p class="entry-detail-text"><b>接續方式</b>${esc(g.connection)}</p>`:''}${g.usage?`<p class="entry-detail-text"><b>使用情境</b>${esc(g.usage)}</p>`:''}${extra.map(e=>`<p class="example"><span lang="ja">${esc(e.jp)}</span><span class="muted">${esc(e.zh)}</span></p>`).join('')}</details>`:''}</article>`;
  }).join(''):'<div class="empty-db"><b>沒有找到符合的文法</b>可以搜尋句型的一部分，或切回「全部」分類。</div>';
  $db('#grammarVisibleCount').textContent=entries.length?`${(grammarPage-1)*PAGE_SIZE+1}–${Math.min(grammarPage*PAGE_SIZE,entries.length)} / ${entries.length} 筆`:'0 筆結果';
  updateFilterCounts('grammar',grammar,grammarCategory);pagination('grammar',grammarPage,entries.length,renderGrammar);
}
function pickRandomKana() {
  const pool=[];kanaRows.forEach((row,rowIndex)=>row.r.forEach((r,i)=>{
    if(r&&(kanaRowFilter==='all'||DB_ROW_IDS[rowIndex]===kanaRowFilter))pool.push({h:row.h[i],k:row.k[i],r});
  }));
  if(!pool.length)return;
  randomKana=pool[Math.floor(Math.random()*pool.length)];
  $db('#randomKanaChar').textContent=kanaMode==='hiragana'?randomKana.h:kanaMode==='katakana'?randomKana.k:(Math.random()<.5?randomKana.h:randomKana.k);
  $db('#randomKanaAnswer').textContent='';$db('#randomKanaBox').classList.remove('hidden');
}
function showResult(result,scroll=true) {
  if(result.type==='單字') {
    vocabFilter='all';vocabQuery='';$db('#vocabSearch').value='';vocabPage=Math.floor(result.index/PAGE_SIZE)+1;renderVocab();activatePanel('vocab');
  } else if(result.type==='文法') {
    grammarFilter='all';grammarQuery='';$db('#grammarSearch').value='';grammarPage=Math.floor(result.index/PAGE_SIZE)+1;renderGrammar();activatePanel('grammar');
  } else {
    kanaMode='both';document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode==='both');b.setAttribute('aria-pressed',String(b.dataset.mode==='both'));});
    kanaRowFilter='all';document.querySelectorAll('[data-row]').forEach(b=>{b.classList.toggle('active',b.dataset.row==='all');b.setAttribute('aria-pressed',String(b.dataset.row==='all'));});renderKana();activatePanel('kana');
  }
  const target=$db(result.href);if(!target)return;
  if(scroll)target.scrollIntoView({behavior:'smooth',block:'start'});
  target.tabIndex=-1;if(scroll)target.focus({preventScroll:true});
  target.classList.add('flash-target');setTimeout(()=>target.classList.remove('flash-target'),1400);
}
function buildGlobalResults(query) {
  const q=normalize(query),root=$db('#globalSearchResults');$db('#clearGlobalSearch').classList.toggle('hidden',!q);
  if(!q){root.classList.add('hidden');root.innerHTML='';return;}
  const results=[];
  kanaRows.forEach((row,rowIndex)=>row.r.forEach((r,i)=>{
    if(r&&normalize([row.h[i],row.k[i],r,row.row].join(' ')).includes(q))results.push({type:'五十音',title:`${row.h[i]} / ${row.k[i]}`,sub:`${r} · ${row.row}`,href:`#kana-${rowIndex}-${i}`});
  }));
  vocab.forEach((v,index)=>{if(normalize(vocabText(v)).includes(q))results.push({type:'單字',title:v[0],sub:`${v[1]}｜${v[2]}`,href:`#vocab-${index}`,index});});
  grammar.forEach((g,index)=>{if(normalize(grammarText(g)).includes(q))results.push({type:'文法',title:g.p,sub:g.m,href:`#grammar-${index}`,index});});
  const shown=results.slice(0,12);
  root.innerHTML=shown.length?`<div class="search-summary">找到 ${results.length} 筆${results.length>12?'，先顯示前 12 筆；輸入更多文字可縮小範圍':''}</div>`+shown.map((r,i)=>`<a class="global-result-item" href="${r.href}" data-result-index="${i}"><span class="result-type">${r.type}</span><div><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></div></a>`).join(''):'<div class="no-result">找不到符合的內容，試試不同的關鍵字。</div>';
  root.classList.remove('hidden');root.querySelectorAll('[data-result-index]').forEach((el,i)=>el.onclick=e=>{e.preventDefault();history.replaceState(null,'',shown[i].href);showResult(shown[i]);});
}
document.querySelectorAll('[data-db-tab]').forEach(b=>{
  b.onclick=()=>activatePanel(b.dataset.dbTab,true);
  b.onkeydown=e=>{const tabs=[...document.querySelectorAll('[data-db-tab]')],i=tabs.indexOf(b);let next;
    if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%tabs.length;
    if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+tabs.length-1)%tabs.length;
    if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();tabs[next].focus();activatePanel(tabs[next].dataset.dbTab,true);}
  };
});
document.querySelectorAll('.seg-btn').forEach(b=>b.onclick=()=>{
  kanaMode=b.dataset.mode;document.querySelectorAll('.seg-btn').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
  $db('#randomKanaBox').classList.add('hidden');renderKana();
});
document.querySelectorAll('[data-row]').forEach(b=>b.onclick=()=>{
  kanaRowFilter=b.dataset.row;document.querySelectorAll('[data-row]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
  $db('#randomKanaBox').classList.add('hidden');renderKana();
});
$db('#randomKanaBtn').onclick=pickRandomKana;
$db('#revealKanaBtn').onclick=()=>{if(randomKana)$db('#randomKanaAnswer').textContent=randomKana.r;};
$db('#vocabSearch').oninput=e=>{vocabQuery=normalize(e.target.value);vocabPage=1;renderVocab();};
$db('#grammarSearch').oninput=e=>{grammarQuery=normalize(e.target.value);grammarPage=1;renderGrammar();};
document.querySelectorAll('[data-vocab-category]').forEach(b=>b.onclick=()=>{vocabFilter=b.dataset.vocabCategory;vocabPage=1;renderVocab();});
document.querySelectorAll('[data-grammar-category]').forEach(b=>b.onclick=()=>{grammarFilter=b.dataset.grammarCategory;grammarPage=1;renderGrammar();});
$db('#globalSearch').oninput=e=>buildGlobalResults(e.target.value);
$db('#clearGlobalSearch').onclick=()=>{$db('#globalSearch').value='';buildGlobalResults('');$db('#globalSearch').focus();};
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){e.preventDefault();$db('#globalSearch').focus();}
  if(e.key==='Escape'&&document.activeElement===$db('#globalSearch')){$db('#globalSearch').value='';buildGlobalResults('');}
});
$db('#backTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
window.addEventListener('scroll',()=>$db('#backTop').classList.toggle('hidden',window.scrollY<550),{passive:true});
window.addEventListener('hashchange',activateHash);
$db('#kanaCount').textContent='46';$db('#vocabCount').textContent=vocab.length;$db('#grammarCount').textContent=grammar.length;
renderKana();renderVocab();renderGrammar();activateHash();
