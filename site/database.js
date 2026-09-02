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

let kanaMode = "both";
let randomKana = null;

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function normalize(s=""){
  return String(s).trim().toLowerCase();
}

function renderKana(){
  const root = document.querySelector("#gojuonTable");
  root.innerHTML = kanaRows.map((row,rowIndex) => {
    const cells = row.r.map((romaji,i) => {
      if(!romaji) return '<div class="gojuon-cell empty"></div>';
      const h = row.h[i] || "";
      const k = row.k[i] || "";
      const big = kanaMode === "hiragana" ? h : kanaMode === "katakana" ? k : h + "・" + k;
      return '<div class="gojuon-cell" id="kana-'+rowIndex+'-'+i+'"><strong>'+esc(big)+'</strong><span>'+esc(romaji)+'</span></div>';
    }).join("");
    return '<div class="gojuon-row"><div class="gojuon-label">'+esc(row.row)+'</div>'+cells+'</div>';
  }).join("");
}

function getVocabEntries(list = vocab.map((v,index)=>({v,index}))){
  return list;
}

function renderVocab(entries = getVocabEntries()){
  const root = document.querySelector("#vocabDb");
  root.innerHTML = entries.length ? entries.map(({v,index}) => `
    <article class="db-entry" id="vocab-${index}">
      <div class="db-entry-head">
        <h3>${esc(v[0])}</h3>
        <span class="reading">${esc(v[1])}</span>
      </div>
      <p class="db-meaning">${esc(v[2])}</p>
      <p class="example">${esc(v[3])}<br><span class="muted">${esc(v[4])}</span></p>
    </article>`).join("") : '<p class="muted">沒有符合的單字。</p>';
  document.querySelector("#vocabVisibleCount").textContent = `顯示 ${entries.length} / ${vocab.length}`;
}

function renderGrammar(){
  document.querySelector("#grammarDb").innerHTML = grammar.map((g,index) => `
    <article class="db-entry" id="grammar-${index}">
      <h3>${esc(g.p)}</h3>
      <p>${esc(g.m)}</p>
      <p class="example">${esc(g.ex)}<br><span class="muted">${esc(g.zh)}</span></p>
    </article>`).join("");
}

function pickRandomKana(){
  const pool = [];
  kanaRows.forEach(row => row.r.forEach((r,i)=>{
    if(r) pool.push({h:row.h[i], k:row.k[i], r});
  }));
  randomKana = pool[Math.floor(Math.random()*pool.length)];
  const char = kanaMode === "hiragana" ? randomKana.h : kanaMode === "katakana" ? randomKana.k : (Math.random() < .5 ? randomKana.h : randomKana.k);
  document.querySelector("#randomKanaChar").textContent = char;
  document.querySelector("#randomKanaAnswer").textContent = "";
  document.querySelector("#randomKanaBox").classList.remove("hidden");
}

function buildGlobalResults(query){
  const q = normalize(query);
  const root = document.querySelector("#globalSearchResults");
  const clearBtn = document.querySelector("#clearGlobalSearch");

  if(!q){
    root.classList.add("hidden");
    root.innerHTML = "";
    clearBtn.classList.add("hidden");
    return;
  }

  clearBtn.classList.remove("hidden");
  const results = [];

  kanaRows.forEach((row,rowIndex)=>{
    row.r.forEach((romaji,i)=>{
      if(!romaji) return;
      const h = row.h[i] || "";
      const k = row.k[i] || "";
      const hay = normalize([h,k,romaji,row.row].join(" "));
      if(hay.includes(q)){
        results.push({
          type:"五十音",
          title:`${h} / ${k} / ${romaji}`,
          sub:row.row,
          href:"#kana-section"
        });
      }
    });
  });

  vocab.forEach((v,index)=>{
    if(normalize(v.join(" ")).includes(q)){
      results.push({
        type:"單字",
        title:v[0],
        sub:`${v[1]}｜${v[2]}`,
        href:`#vocab-${index}`,
        vocabIndex:index
      });
    }
  });

  grammar.forEach((g,index)=>{
    if(normalize([g.p,g.m,g.ex,g.zh].join(" ")).includes(q)){
      results.push({
        type:"文法",
        title:g.p,
        sub:g.m,
        href:`#grammar-${index}`
      });
    }
  });

  const shown = results.slice(0,12);
  root.innerHTML = shown.length ? shown.map((r,i)=>`
    <a class="global-result-item" href="${r.href}" data-result-index="${i}">
      <span class="result-type">${esc(r.type)}</span>
      <div><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></div>
    </a>`).join("") : '<div class="no-result">找不到符合的內容。</div>';

  root.classList.remove("hidden");

  root.querySelectorAll(".global-result-item").forEach((el,i)=>{
    el.addEventListener("click", ()=>{
      const result = shown[i];
      if(result.vocabIndex !== undefined){
        document.querySelector("#vocabSearch").value = "";
        renderVocab();
      }
      setTimeout(()=>{
        const target = document.querySelector(result.href);
        if(target){
          target.classList.add("flash-target");
          setTimeout(()=>target.classList.remove("flash-target"),1200);
        }
      },100);
    });
  });
}

document.querySelectorAll(".seg-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".seg-btn").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    kanaMode = btn.dataset.mode;
    renderKana();
  });
});

document.querySelector("#randomKanaBtn").addEventListener("click", pickRandomKana);
document.querySelector("#revealKanaBtn").addEventListener("click", ()=>{
  if(!randomKana) return;
  document.querySelector("#randomKanaAnswer").textContent = randomKana.r;
});

document.querySelector("#vocabSearch").addEventListener("input", e=>{
  const q = normalize(e.target.value);
  if(!q) return renderVocab();
  const entries = vocab
    .map((v,index)=>({v,index}))
    .filter(({v}) => normalize(v.join(" ")).includes(q));
  renderVocab(entries);
});

document.querySelector("#globalSearch").addEventListener("input", e=>{
  buildGlobalResults(e.target.value);
});

document.querySelector("#clearGlobalSearch").addEventListener("click", ()=>{
  const input = document.querySelector("#globalSearch");
  input.value = "";
  buildGlobalResults("");
  input.focus();
});

document.addEventListener("keydown", e=>{
  if(e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){
    e.preventDefault();
    document.querySelector("#globalSearch").focus();
  }
});

document.querySelector("#backTop").addEventListener("click", ()=>{
  window.scrollTo({top:0,behavior:"smooth"});
});

window.addEventListener("scroll", ()=>{
  document.querySelector("#backTop").classList.toggle("hidden", window.scrollY < 550);
}, {passive:true});

document.querySelector("#kanaCount").textContent = "46";
document.querySelector("#vocabCount").textContent = vocab.length;
document.querySelector("#grammarCount").textContent = grammar.length;

renderKana();
renderVocab();
renderGrammar();
