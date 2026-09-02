const CATEGORY_LABELS = {
  today:"今日專屬",
  vocab:"單字",
  hira:"平假名",
  kata:"片假名",
  dakuten:"濁音・半濁音",
  yoon:"拗音",
  grammar:"文法"
};

const DIFFICULTY_LABELS = {easy:"簡單", normal:"普通", hard:"困難"};

const KANA_ROW_LABELS = {
  a:"あ行", k:"か行", s:"さ行", t:"た行", n:"な行",
  h:"は行", m:"ま行", y:"や行", r:"ら行", w:"わ行・ん"
};

const KANA_ROW_CHARS = {
  a:"あいうえおアイウエオ",
  k:"かきくけこカキクケコ",
  s:"さしすせそサシスセソ",
  t:"たちつてとタチツテト",
  n:"なにぬねのナニヌネノ",
  h:"はひふへほハヒフヘホ",
  m:"まみむめもマミムメモ",
  y:"やゆよヤユヨ",
  r:"らりるれろラリルレロ",
  w:"わをんワヲン"
};

const baseHira = [
  ["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],
  ["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],
  ["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],
  ["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],
  ["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],
  ["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],
  ["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],
  ["や","ya"],["ゆ","yu"],["よ","yo"],
  ["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],
  ["わ","wa"],["を","wo"],["ん","n"]
];

const baseKata = [
  ["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],
  ["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],
  ["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],
  ["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],
  ["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],
  ["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],
  ["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],
  ["ヤ","ya"],["ユ","yu"],["ヨ","yo"],
  ["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],
  ["ワ","wa"],["ヲ","wo"],["ン","n"]
];

const dakuten = [
  ["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"],
  ["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"],
  ["だ","da"],["ぢ","ji"],["づ","zu"],["で","de"],["ど","do"],
  ["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"],
  ["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"],
  ["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"],
  ["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"],
  ["ダ","da"],["ヂ","ji"],["ヅ","zu"],["デ","de"],["ド","do"],
  ["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"],
  ["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"]
];

const yoon = [
  ["きゃ","kya"],["きゅ","kyu"],["きょ","kyo"],
  ["しゃ","sha"],["しゅ","shu"],["しょ","sho"],
  ["ちゃ","cha"],["ちゅ","chu"],["ちょ","cho"],
  ["にゃ","nya"],["にゅ","nyu"],["にょ","nyo"],
  ["ひゃ","hya"],["ひゅ","hyu"],["ひょ","hyo"],
  ["みゃ","mya"],["みゅ","myu"],["みょ","myo"],
  ["りゃ","rya"],["りゅ","ryu"],["りょ","ryo"],
  ["ぎゃ","gya"],["ぎゅ","gyu"],["ぎょ","gyo"],
  ["じゃ","ja"],["じゅ","ju"],["じょ","jo"],
  ["びゃ","bya"],["びゅ","byu"],["びょ","byo"],
  ["ぴゃ","pya"],["ぴゅ","pyu"],["ぴょ","pyo"],
  ["キャ","kya"],["キュ","kyu"],["キョ","kyo"],
  ["シャ","sha"],["シュ","shu"],["ショ","sho"],
  ["チャ","cha"],["チュ","chu"],["チョ","cho"],
  ["ニャ","nya"],["ニュ","nyu"],["ニョ","nyo"],
  ["ヒャ","hya"],["ヒュ","hyu"],["ヒョ","hyo"],
  ["ミャ","mya"],["ミュ","myu"],["ミョ","myo"],
  ["リャ","rya"],["リュ","ryu"],["リョ","ryo"],
  ["ギャ","gya"],["ギュ","gyu"],["ギョ","gyo"],
  ["ジャ","ja"],["ジュ","ju"],["ジョ","jo"],
  ["ビャ","bya"],["ビュ","byu"],["ビョ","byo"],
  ["ピャ","pya"],["ピュ","pyu"],["ピョ","pyo"]
];

const vocab = [
  ["ホテル","hoteru","飯店、旅館"],["バス","basu","公車、巴士"],["スーパー","sūpā","超市"],
  ["テスト","tesuto","考試、測驗"],["アイス","aisu","冰淇淋、冰品"],["駅","えき / eki","車站"],
  ["学校","がっこう / gakkō","學校"],["電車","でんしゃ / densha","電車"],["食べる","たべる / taberu","吃"],
  ["行く","いく / iku","去"],["水","みず / mizu","水"],["ご飯","ごはん / gohan","飯、餐"],
  ["飲む","のむ / nomu","喝"],["買う","かう / kau","買"],["見る","みる / miru","看"],
  ["本","ほん / hon","書"],["店","みせ / mise","店、商店"],["今日","きょう / kyō","今天"],
  ["明日","あした / ashita","明天"],["友達","ともだち / tomodachi","朋友"],["家","いえ / ie","家"],
  ["一緒に","いっしょに / issho ni","一起"],["誰","だれ / dare","誰"],["朝","あさ / asa","早上"],
  ["夜","よる / yoru","晚上"],["毎日","まいにち / mainichi","每天"],["昨日","きのう / kinō","昨天"],
  ["会社","かいしゃ / kaisha","公司"],["仕事","しごと / shigoto","工作"],["帰る","かえる / kaeru","回去、回家"],
  ["タクシー","takushī","計程車"],["トイレ","toire","廁所"]
];

const grammarQuestions = [
  {level:1,q:"「私は学生です。」中的「は」主要作用是？",o:["標示主題","表示所屬","表示交通工具","表示動作對象"],a:"標示主題",topic:"は"},
  {level:1,q:"「私の本」中的「の」最接近哪個意思？",o:["我的書","我去書店","我看書","書和我"],a:"我的書",topic:"の"},
  {level:1,q:"学校＿行きます。",o:["に","で","を","と"],a:"に",topic:"に"},
  {level:1,q:"電車＿行きます。",o:["で","に","を","の"],a:"で",topic:"で"},
  {level:1,q:"水＿飲みます。",o:["を","に","と","へ"],a:"を",topic:"を"},
  {level:1,q:"学生です＿。要變成「是學生嗎？」",o:["か","の","で","と"],a:"か",topic:"か"},
  {level:1,q:"友達＿一緒に行きます。",o:["と","を","で","へ"],a:"と",topic:"と"},
  {level:1,q:"日本＿行きます。以「朝日本方向前往」的句型來看應填？",o:["へ","を","と","の"],a:"へ",topic:"へ"},
  {level:2,q:"「学校に行きません。」最接近哪個意思？",o:["不去學校","去了學校","要不要去學校","昨天沒去學校"],a:"不去學校",topic:"ません"},
  {level:2,q:"昨日、学校に行き＿。要表達「昨天去了學校」。",o:["ました","ません","ます","ませんか"],a:"ました",topic:"ました"},
  {level:2,q:"昨日、学校に行き＿。要表達「昨天沒有去學校」。",o:["ませんでした","ました","ませんか","ます"],a:"ませんでした",topic:"ませんでした"},
  {level:2,q:"一緒に行き＿。要表達「要不要一起去？」",o:["ませんか","ました","ませんでした","ます"],a:"ませんか",topic:"ませんか"},
  {level:2,q:"「私は友達と電車で学校へ行きます。」哪個翻譯正確？",o:["我和朋友搭電車去學校","我在學校和朋友吃飯","我搭公車回家","我和朋友昨天沒去公司"],a:"我和朋友搭電車去學校",topic:"助詞綜合"},
  {level:3,q:"明日、友達＿電車＿学校＿行きます。",o:["と／で／へ","で／と／を","を／に／で","へ／を／と"],a:"と／で／へ",topic:"助詞綜合"},
  {level:3,q:"哪一句正確表達「昨天沒有搭電車去公司」？",o:["昨日、電車で会社に行きませんでした。","昨日、電車に会社で行きました。","明日、電車で会社に行きません。","昨日、会社を電車に行きませんでした。"],a:"昨日、電車で会社に行きませんでした。",topic:"過去否定"},
  {level:3,q:"哪一句最適合禮貌邀請朋友「明天要不要一起去車站？」",o:["明日、友達と一緒に駅へ行きませんか。","昨日、友達と駅へ行きました。","明日、友達に駅を行きません。","今日、駅で友達を行きます。"],a:"明日、友達と一緒に駅へ行きませんか。",topic:"ませんか"}
];

const visuallyClose = {
  "シ":["tsu","so","n"], "ツ":["shi","so","n"], "ソ":["n","shi","tsu"], "ン":["so","shi","tsu"],
  "ル":["re","ro","ri"], "レ":["ru","ro","ri"],
  "し":["tsu","su","chi"], "つ":["shi","su","chi"]
};

let testConfig = null;
let questions = [];
let currentIndex = 0;
let answers = [];
let selectedIndex = null;
let testStartedAt = 0;
let questionStartedAt = 0;
let timerId = null;
let todayLesson = null;

const HISTORY_KEY = "jpt-selftest-history-v1";

function esc(s=""){
  return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function uniqueChoices(correct, candidates){
  const set = new Set([correct]);
  const shuffled = shuffle(candidates);
  for(const x of shuffled){
    if(set.size >= 4) break;
    if(x && x !== correct) set.add(x);
  }
  const fallback = ["a","i","u","e","o","ka","shi","tsu","n","ru","re"];
  for(const x of fallback){
    if(set.size >= 4) break;
    if(x !== correct) set.add(x);
  }
  return shuffle([...set].slice(0,4));
}

function getKanaRow(char){
  return Object.keys(KANA_ROW_CHARS).find(id => KANA_ROW_CHARS[id].includes(char)) || null;
}

function uniqueChoicesStrict(correct, candidates){
  const allowed = [...new Set(candidates.filter(Boolean))];
  if(!allowed.includes(correct)) allowed.unshift(correct);
  if(allowed.length < 4) return null;
  const wrong = shuffle(allowed.filter(x=>x!==correct)).slice(0,3);
  return shuffle([correct,...wrong]);
}

function makeKanaQuestion(category, difficulty, selectedRows=[]){
  let pool = category === "hira" ? baseHira : category === "kata" ? baseKata : category === "dakuten" ? dakuten : yoon;
  if(["hira","kata"].includes(category) && selectedRows.length){
    pool = pool.filter(x => selectedRows.includes(getKanaRow(x[0])));
  }
  const distinctChars = new Set(pool.map(x=>x[0])).size;
  const distinctReadings = new Set(pool.map(x=>x[1])).size;
  if(distinctChars < 4 || distinctReadings < 4){
    throw new Error("目前選取的五十音範圍不足 4 個不同選項，請再多選一個行別。");
  }
  const item = pool[Math.floor(Math.random()*pool.length)];
  const char = item[0], romaji = item[1];
  const uniqueReverse = pool.filter(x => x[1] === romaji).length === 1;
  const reverseChance = difficulty === "easy" ? 0 : difficulty === "normal" ? .35 : .55;
  const reverse = uniqueReverse && Math.random() < reverseChance;

  if(reverse){
    const opts = uniqueChoicesStrict(char, pool.map(x=>x[0]));
    return {
      category, topic:char, row:["hira","kata"].includes(category) ? getKanaRow(char) : null,
      question:"哪一個假名讀作「"+romaji+"」？",
      options:opts, answer:char
    };
  }

  const allowedReadings = [...new Set(pool.map(x=>x[1]))];
  let candidates = allowedReadings;
  if(difficulty === "hard" && visuallyClose[char]){
    const closeWithinScope = visuallyClose[char].filter(x=>allowedReadings.includes(x));
    candidates = closeWithinScope.concat(allowedReadings);
  }
  const opts = uniqueChoicesStrict(romaji, candidates);
  return {
    category, topic:char, row:["hira","kata"].includes(category) ? getKanaRow(char) : null,
    question:"「"+char+"」的讀音是？",
    options:opts, answer:romaji
  };
}

function makeVocabQuestion(difficulty){
  const item = vocab[Math.floor(Math.random()*vocab.length)];
  const [word,reading,meaning] = item;
  const mode = difficulty === "easy" ? "meaning" :
    difficulty === "normal" ? (Math.random()<.5 ? "meaning":"reverse") :
    (Math.random()<.5 ? "reading":"reverse");

  if(mode === "meaning"){
    return {
      category:"vocab",topic:word,question:"「"+word+"」是什麼意思？",
      options:uniqueChoices(meaning,vocab.map(v=>v[2])),answer:meaning
    };
  }

  if(mode === "reading"){
    const jpReading = reading.includes("/") ? reading.split("/")[0].trim() : reading;
    return {
      category:"vocab",topic:word,question:"「"+jpReading+"」對應哪個已學單字？",
      options:uniqueChoices(word,vocab.map(v=>v[0])),answer:word
    };
  }

  return {
    category:"vocab",topic:word,question:"哪個日文最接近「"+meaning+"」？",
    options:uniqueChoices(word,vocab.map(v=>v[0])),answer:word
  };
}

function makeGrammarQuestion(difficulty){
  const maxLevel = difficulty === "easy" ? 1 : difficulty === "normal" ? 2 : 3;
  const minLevel = difficulty === "hard" ? 2 : 1;
  const pool = grammarQuestions.filter(x=>x.level<=maxLevel && x.level>=minLevel);
  const g = pool[Math.floor(Math.random()*pool.length)];
  return {
    category:"grammar",topic:g.topic,question:g.q,
    options:shuffle(g.o),answer:g.a
  };
}

function generateOne(category,difficulty,kanaRows){
  if(["hira","kata","dakuten","yoon"].includes(category)) return makeKanaQuestion(category,difficulty,kanaRows);
  if(category === "vocab") return makeVocabQuestion(difficulty);
  return makeGrammarQuestion(difficulty);
}

function generateQuestions(scopes,count,difficulty,kanaRows){
  const list = [];
  const seen = new Set();
  let attempts = 0;

  // 題數足夠時，至少讓每個勾選範圍出現一次，避免小測驗完全漏掉某個範圍。
  const seededScopes = count >= scopes.length ? shuffle(scopes) : shuffle(scopes).slice(0,count);
  seededScopes.forEach(category=>{
    const q = generateOne(category,difficulty,kanaRows);
    const signature = q.category+"|"+q.question+"|"+q.answer;
    seen.add(signature);
    list.push(q);
  });

  while(list.length < count && attempts < count*30){
    attempts++;
    const category = scopes[Math.floor(Math.random()*scopes.length)];
    const q = generateOne(category,difficulty,kanaRows);
    const signature = q.category+"|"+q.question+"|"+q.answer;
    if(seen.has(signature) && attempts < count*12) continue;
    seen.add(signature);
    list.push(q);
  }
  return shuffle(list);
}

function cleanReading(reading=""){
  return String(reading).split("/")[0].trim();
}

function inferTodayQuizCategory(item, lesson){
  const text = [item.question,...(item.options || [])].join(" ");
  const kanaItem = (lesson.kana?.items || []).find(k => text.includes(k.kana));
  if(kanaItem){
    const isKata = /[\u30A0-\u30FF]/.test(kanaItem.kana);
    return {category:isKata ? "kata" : "hira", topic:kanaItem.kana};
  }
  const vocabItem = (lesson.vocab || []).find(v =>
    text.includes(v.word) || (item.options || []).includes(v.meaning)
  );
  if(vocabItem) return {category:"vocab", topic:vocabItem.word};
  const grammarItem = (lesson.grammar || []).find(g =>
    text.includes(g.pattern.replaceAll("～","")) ||
    (g.examples || []).some(e => text.includes(e.jp))
  );
  return {category:"grammar", topic:grammarItem?.pattern || "今日文法"};
}

function buildTodayQuestionBank(lesson){
  const bank = [];
  const kanaItems = lesson.kana?.items || [];
  const vocabItems = lesson.vocab || [];
  const grammarItems = lesson.grammar || [];

  const kanaChars = [...new Set(kanaItems.map(x=>x.kana).filter(Boolean))];
  const kanaReadings = [...new Set(kanaItems.map(x=>x.romaji).filter(Boolean))];

  if(kanaChars.length >= 4 && kanaReadings.length >= 4){
    kanaItems.forEach(k=>{
      const category = /[\u30A0-\u30FF]/.test(k.kana) ? "kata" : "hira";
      const forward = uniqueChoicesStrict(k.romaji,kanaReadings);
      if(forward) bank.push({
        category,topic:k.kana,row:getKanaRow(k.kana),level:1,
        question:"「"+k.kana+"」的讀音是？",options:forward,answer:k.romaji
      });
      if(kanaItems.filter(x=>x.romaji===k.romaji).length===1){
        const reverse = uniqueChoicesStrict(k.kana,kanaChars);
        if(reverse) bank.push({
          category,topic:k.kana,row:getKanaRow(k.kana),level:2,
          question:"哪一個假名讀作「"+k.romaji+"」？",options:reverse,answer:k.kana
        });
      }
    });
  }

  if(vocabItems.length >= 4){
    const words = vocabItems.map(v=>v.word);
    const meanings = vocabItems.map(v=>v.meaning);
    vocabItems.forEach(v=>{
      const meaningOptions = uniqueChoicesStrict(v.meaning,meanings);
      if(meaningOptions) bank.push({
        category:"vocab",topic:v.word,level:1,
        question:"「"+v.word+"」是什麼意思？",options:meaningOptions,answer:v.meaning
      });

      const wordOptions = uniqueChoicesStrict(v.word,words);
      if(wordOptions) bank.push({
        category:"vocab",topic:v.word,level:2,
        question:"哪個日文最接近「"+v.meaning+"」？",options:wordOptions,answer:v.word
      });

      const reading = cleanReading(v.reading);
      if(reading && wordOptions) bank.push({
        category:"vocab",topic:v.word,level:3,
        question:"「"+reading+"」對應哪個今日單字？",options:shuffle([...wordOptions]),answer:v.word
      });
    });
  }

  const grammarExamples = [];
  grammarItems.forEach(g => (g.examples || []).forEach(e=>{
    if(e.jp && e.zh) grammarExamples.push({pattern:g.pattern,jp:e.jp,zh:e.zh});
  }));
  const jpPool = [...new Set(grammarExamples.map(x=>x.jp))];
  const zhPool = [...new Set(grammarExamples.map(x=>x.zh))];
  if(jpPool.length >= 4 && zhPool.length >= 4){
    grammarExamples.forEach(e=>{
      const zhOptions = uniqueChoicesStrict(e.zh,zhPool);
      if(zhOptions) bank.push({
        category:"grammar",topic:e.pattern,level:2,
        question:"「"+e.jp+"」最接近哪個意思？",options:zhOptions,answer:e.zh
      });
      const jpOptions = uniqueChoicesStrict(e.jp,jpPool);
      if(jpOptions) bank.push({
        category:"grammar",topic:e.pattern,level:3,
        question:"哪一句最接近「"+e.zh+"」？",options:jpOptions,answer:e.jp
      });
    });
  }

  (lesson.quiz || []).forEach(item=>{
    if(item.type !== "choice" || !Array.isArray(item.options) || item.options.length !== 4) return;
    const correct = item.options[item.answer];
    if(correct === undefined) return;
    const inferred = inferTodayQuizCategory(item,lesson);
    bank.push({
      category:inferred.category,topic:inferred.topic,level:2,
      question:item.question,options:shuffle([...item.options]),answer:correct
    });
  });

  return bank;
}

function generateTodayQuestions(lesson,count,difficulty){
  const bank = buildTodayQuestionBank(lesson);
  let filtered;
  if(difficulty === "easy") filtered = bank.filter(q=>q.level===1);
  else if(difficulty === "hard") filtered = bank.filter(q=>q.level>=2);
  else filtered = bank.filter(q=>q.level<=2);

  if(filtered.length < Math.min(4,count)) filtered = bank;
  const unique = [];
  const seen = new Set();
  shuffle(filtered).forEach(q=>{
    const sig=q.category+"|"+q.question+"|"+q.answer;
    if(!seen.has(sig)){seen.add(sig);unique.push(q);}
  });
  return unique.slice(0,Math.min(count,unique.length));
}

async function loadTodayLesson(){
  const status=document.querySelector("#todayTestStatus");
  try{
    const response=await fetch("./lessons/latest.json",{cache:"no-store"});
    if(!response.ok) throw new Error("無法讀取今日教材");
    todayLesson=await response.json();
    document.querySelector("#todayLessonDate").textContent=todayLesson.date || "今日";
    document.querySelector("#todayLessonTitle").textContent=todayLesson.title || "今日教材";
    document.querySelector("#startTodayTest").disabled=false;
    const bank=buildTodayQuestionBank(todayLesson);
    status.textContent="目前可隨機組合約 "+bank.length+" 種題型／題目。";
  }catch(err){
    todayLesson=null;
    document.querySelector("#todayLessonTitle").textContent="今日教材載入失敗";
    status.textContent=err.message;
    document.querySelector("#startTodayTest").disabled=true;
  }
}

function startTodayTest(){
  if(!todayLesson) return;
  const count=Number(document.querySelector("#todayQuestionCount").value);
  const difficulty=document.querySelector("#todayDifficulty").value;
  const generated=generateTodayQuestions(todayLesson,count,difficulty);
  if(!generated.length){
    document.querySelector("#todayTestStatus").textContent="今日教材目前不足以產生四選一考卷。";
    return;
  }

  questions=generated;
  const scopes=[...new Set(generated.map(q=>q.category))];
  testConfig={
    mode:"today",
    scopes,
    count:generated.length,
    requestedCount:count,
    difficulty,
    kanaRows:[],
    lessonDate:todayLesson.date || "",
    lessonTitle:todayLesson.title || ""
  };
  currentIndex=0;
  answers=[];
  selectedIndex=null;
  testStartedAt=performance.now();
  questionStartedAt=performance.now();

  document.querySelector("#setupView").classList.add("hidden");
  document.querySelector("#resultView").classList.add("hidden");
  document.querySelector("#quizView").classList.remove("hidden");
  renderQuestion();
  updateTimer();
  clearInterval(timerId);
  timerId=setInterval(updateTimer,1000);
  window.scrollTo({top:0,behavior:"smooth"});
}

function getSelectedScopes(){
  return [...document.querySelectorAll('.scope-option input:checked')].map(x=>x.value);
}

function getSelectedKanaRows(){
  return [...document.querySelectorAll('.kana-row-input:checked')].map(x=>x.value);
}

function readHistory(){
  try{return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];}
  catch{return [];}
}

function saveHistory(item){
  const history = readHistory();
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0,50)));
}

function formatTime(seconds){
  const s = Math.max(0,Math.round(seconds));
  const m = Math.floor(s/60);
  return String(m).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}

function difficultyBenchmark(category,difficulty){
  const base = {hira:6,kata:6,dakuten:8,yoon:9,vocab:12,grammar:18}[category] || 12;
  const factor = difficulty === "easy" ? .85 : difficulty === "hard" ? 1.25 : 1;
  return base * factor;
}

function startTest(){
  const scopes = getSelectedScopes();
  if(!scopes.length){
    document.querySelector("#setupError").textContent = "請至少勾選一個考試範圍。";
    return;
  }
  document.querySelector("#setupError").textContent = "";
  const kanaRows = getSelectedKanaRows();
  if(scopes.some(x=>["hira","kata"].includes(x)) && !kanaRows.length){
    document.querySelector("#setupError").textContent = "你有勾平假名／片假名，請至少再選一個五十音行別。";
    return;
  }
  if(scopes.some(x=>["hira","kata"].includes(x))){
    const selectedKanaCount = baseHira.filter(x=>kanaRows.includes(getKanaRow(x[0]))).length;
    if(selectedKanaCount < 4){
      document.querySelector("#setupError").textContent = "四選一需要至少 4 個不同假名。若只選や行或わ行・ん，請再多選一個行別。";
      return;
    }
  }
  const count = Number(document.querySelector("#questionCount").value);
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  testConfig = {scopes,count,difficulty,kanaRows};
  questions = generateQuestions(scopes,count,difficulty,kanaRows);
  currentIndex = 0;
  answers = [];
  selectedIndex = null;
  testStartedAt = performance.now();
  questionStartedAt = performance.now();

  document.querySelector("#setupView").classList.add("hidden");
  document.querySelector("#resultView").classList.add("hidden");
  document.querySelector("#quizView").classList.remove("hidden");
  renderQuestion();
  updateTimer();
  clearInterval(timerId);
  timerId = setInterval(updateTimer,1000);
  window.scrollTo({top:0,behavior:"smooth"});
}

function updateTimer(){
  if(!testStartedAt) return;
  const elapsed = (performance.now()-testStartedAt)/1000;
  document.querySelector("#elapsedTime").textContent = formatTime(elapsed);
}

function renderQuestion(){
  const q = questions[currentIndex];
  selectedIndex = null;
  questionStartedAt = performance.now();
  document.querySelector("#testProgress").textContent = (currentIndex+1)+" / "+questions.length;
  document.querySelector("#questionCategory").textContent = CATEGORY_LABELS[q.category];
  document.querySelector("#questionDifficulty").textContent = DIFFICULTY_LABELS[testConfig.difficulty];
  document.querySelector("#questionText").textContent = q.question;
  const list = document.querySelector("#optionList");
  list.innerHTML = q.options.map((o,i)=>
    '<button class="test-option" type="button" data-index="'+i+'"><span>'+String.fromCharCode(65+i)+'</span><strong>'+esc(o)+'</strong></button>'
  ).join("");
  list.querySelectorAll(".test-option").forEach(btn=>{
    btn.addEventListener("click",()=>{
      list.querySelectorAll(".test-option").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex = Number(btn.dataset.index);
      document.querySelector("#nextQuestion").disabled = false;
    });
  });
  const next = document.querySelector("#nextQuestion");
  next.disabled = true;
  next.textContent = currentIndex === questions.length-1 ? "完成測驗" : "下一題";
}

function nextQuestion(){
  if(selectedIndex === null) return;
  const q = questions[currentIndex];
  const time = (performance.now()-questionStartedAt)/1000;
  const selected = q.options[selectedIndex];
  answers.push({
    category:q.category,topic:q.topic,row:q.row || null,question:q.question,
    selected,correct:q.answer,isCorrect:selected===q.answer,time,
    benchmark:difficultyBenchmark(q.category,testConfig.difficulty)
  });

  if(currentIndex >= questions.length-1){
    finishTest();
    return;
  }
  currentIndex++;
  renderQuestion();
}

function finishTest(){
  clearInterval(timerId);
  const totalTime = (performance.now()-testStartedAt)/1000;
  const score = answers.filter(x=>x.isCorrect).length;
  const accuracy = Math.round(score/answers.length*100);
  const avgTime = answers.reduce((s,x)=>s+x.time,0)/answers.length;

  const categoryMap = {};
  const topicMap = {};
  const rowMap = {};
  answers.forEach(a=>{
    if(!categoryMap[a.category]) categoryMap[a.category]={total:0,correct:0,time:0,benchmarkSum:0,wrongTopics:[]};
    const c = categoryMap[a.category];
    c.total++; c.time+=a.time; c.benchmarkSum += a.benchmark || difficultyBenchmark(a.category,testConfig.difficulty);
    if(a.isCorrect)c.correct++;
    else c.wrongTopics.push(a.topic);

    if(!topicMap[a.category]) topicMap[a.category]={};
    if(!topicMap[a.category][a.topic]) topicMap[a.category][a.topic]={total:0,correct:0,time:0};
    const t = topicMap[a.category][a.topic];
    t.total++; t.time+=a.time; if(a.isCorrect)t.correct++;

    if(a.row){
      if(!rowMap[a.row]) rowMap[a.row]={total:0,correct:0,time:0,benchmarkSum:0};
      const row = rowMap[a.row];
      row.total++; row.time+=a.time; row.benchmarkSum += a.benchmark || difficultyBenchmark(a.category,testConfig.difficulty);
      if(a.isCorrect)row.correct++;
    }
  });

  const record = {
    id:Date.now(),
    at:new Date().toISOString(),
    difficulty:testConfig.difficulty,
    mode:testConfig.mode || "custom",
    lessonDate:testConfig.lessonDate || "",
    lessonTitle:testConfig.lessonTitle || "",
    scopes:testConfig.scopes,
    kanaRows:testConfig.kanaRows || [],
    count:answers.length,score,accuracy,totalTime,avgTime,
    categories:categoryMap,
    topics:topicMap,
    rows:rowMap
  };
  saveHistory(record);

  document.querySelector("#quizView").classList.add("hidden");
  document.querySelector("#resultView").classList.remove("hidden");
  renderResult(record);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderResult(record){
  document.querySelector("#retryTest").textContent = record.mode === "today" ? "再隨機一份今日考卷" : "用相同設定再考一次";
  document.querySelector("#resultAccuracy").textContent = record.accuracy+"%";
  document.querySelector("#resultScore").textContent = record.score+" / "+record.count;
  document.querySelector("#resultTime").textContent = formatTime(record.totalTime);
  document.querySelector("#resultAvgTime").textContent = record.avgTime.toFixed(1)+" 秒";

  const analysis = Object.entries(record.categories).map(([cat,c])=>{
    const pct = Math.round(c.correct/c.total*100);
    const avg = c.time/c.total;
    const benchmark = difficultyBenchmark(cat,record.difficulty);
    const slow = avg > benchmark*1.35;
    let status,cls;
    if(pct < 70){status="需要加強";cls="bad";}
    else if(pct < 85){status="還要複習";cls="warn";}
    else if(slow){status="正確但偏慢";cls="warn";}
    else {status="表現穩定";cls="ok";}
    return {cat,c,pct,avg,slow,status,cls,benchmark};
  });

  document.querySelector("#categoryAnalysis").innerHTML = analysis.map(x=>{
    const wrong = [...new Set(x.c.wrongTopics)].slice(0,5);
    return '<article class="analysis-card '+x.cls+'">'+
      '<div class="analysis-head"><strong>'+CATEGORY_LABELS[x.cat]+'</strong><span>'+x.status+'</span></div>'+
      '<div class="analysis-numbers"><b>'+x.pct+'%</b><small>平均 '+x.avg.toFixed(1)+' 秒／題</small></div>'+
      '<div class="accuracy-bar"><i style="width:'+x.pct+'%"></i></div>'+
      (wrong.length ? '<p>建議複習：'+wrong.map(esc).join("、")+'</p>' : '<p>目前沒有明顯錯題集中。</p>')+
      '</article>';
  }).join("");

  const weak = analysis.filter(x=>x.pct<80).sort((a,b)=>a.pct-b.pct);
  const slow = analysis.filter(x=>x.slow && x.pct>=80).sort((a,b)=>b.avg-a.avg);
  const advice = [];
  if(record.accuracy >= 90) advice.push("這次整體正確率很穩定。");
  else if(record.accuracy >= 80) advice.push("這次已經達到不錯的正確率，但還有幾個區塊可以再鞏固。");
  else advice.push("這次正確率偏低，建議先回資料庫複習弱項，再用相同範圍重考。");

  if(weak.length) advice.push("最優先加強："+weak.slice(0,2).map(x=>CATEGORY_LABELS[x.cat]).join("、")+"。");
  if(slow.length) advice.push(slow.slice(0,2).map(x=>CATEGORY_LABELS[x.cat]).join("、")+"的正確率尚可，但答題速度偏慢，建議多做短時間快速辨識。");
  if(!weak.length && !slow.length) advice.push("目前速度與正確率都在穩定範圍，可以逐步提高難度或增加題數。");

  document.querySelector("#overallAdvice").innerHTML = '<strong>本次建議</strong><p>'+advice.join(" ")+'</p>';

  const wrong = answers.filter(x=>!x.isCorrect);
  document.querySelector("#wrongReview").innerHTML = wrong.length ? wrong.map((x,i)=>
    '<article class="wrong-item"><span>'+(i+1)+'</span><div><strong>'+esc(x.question)+'</strong>'+
    '<p>你的答案：<b class="bad-text">'+esc(x.selected)+'</b></p>'+
    '<p>正確答案：<b class="ok-text">'+esc(x.correct)+'</b></p>'+
    '<small>作答時間 '+x.time.toFixed(1)+' 秒</small></div></article>'
  ).join("") : '<div class="perfect-box">全部答對，這次沒有錯題需要重看。</div>';

  renderHistory();
}

function accuracyStatus(pct){
  if(pct >= 90) return {label:"熟練", cls:"mastery"};
  if(pct >= 80) return {label:"基本掌握", cls:"good"};
  if(pct >= 70) return {label:"不穩定", cls:"warn"};
  if(pct >= 60) return {label:"明顯弱項", cls:"bad"};
  return {label:"優先補強", cls:"critical"};
}

function renderDiagnosis(history){
  const headline = document.querySelector("#diagnosisHeadline");
  const grid = document.querySelector("#diagnosisCategories");
  const rowsRoot = document.querySelector("#kanaRowDiagnosis");
  const focusRoot = document.querySelector("#diagnosisFocus");
  if(!headline || !grid || !rowsRoot || !focusRoot) return;

  const recent = history.slice(0,10);
  if(!recent.length){
    headline.innerHTML = '<div class="empty-history">目前還沒有足夠資料。完成自我測驗後，這裡會用最近 10 次結果做長期診斷。</div>';
    grid.innerHTML = "";
    rowsRoot.innerHTML = '<div class="empty-history">尚無行別資料。</div>';
    focusRoot.innerHTML = '<div class="empty-history">尚無錯題觀察資料。</div>';
    return;
  }

  const cats = {};
  const rows = {};
  const topics = {};

  recent.forEach(record=>{
    Object.entries(record.categories || {}).forEach(([cat,c])=>{
      if(!cats[cat]) cats[cat]={total:0,correct:0,time:0,benchmarkSum:0};
      const a = cats[cat];
      a.total += c.total || 0;
      a.correct += c.correct || 0;
      a.time += c.time || 0;
      a.benchmarkSum += c.benchmarkSum || difficultyBenchmark(cat,record.difficulty)*(c.total || 0);
    });

    Object.entries(record.rows || {}).forEach(([rowId,row])=>{
      if(!rows[rowId]) rows[rowId]={total:0,correct:0,time:0,benchmarkSum:0};
      const a=rows[rowId];
      a.total += row.total || 0;
      a.correct += row.correct || 0;
      a.time += row.time || 0;
      a.benchmarkSum += row.benchmarkSum || 0;
    });

    Object.entries(record.topics || {}).forEach(([cat,items])=>{
      Object.entries(items || {}).forEach(([topic,t])=>{
        const key=cat+"|"+topic;
        if(!topics[key]) topics[key]={cat,topic,total:0,correct:0,time:0};
        topics[key].total += t.total || 0;
        topics[key].correct += t.correct || 0;
        topics[key].time += t.time || 0;
      });
    });
  });

  const totalQuestions = Object.values(cats).reduce((s,x)=>s+x.total,0);
  const formal = Object.values(cats).filter(x=>x.total>=10).length;
  headline.innerHTML =
    '<div class="diagnosis-overview"><strong>最近 '+recent.length+' 次測驗，共 '+totalQuestions+' 題</strong>'+
    '<span>已有 '+formal+' 個分類達到正式診斷樣本（至少 10 題）</span></div>';

  const catEntries = Object.entries(cats).sort((a,b)=>{
    const pa=a[1].correct/a[1].total, pb=b[1].correct/b[1].total;
    return pa-pb;
  });

  grid.innerHTML = catEntries.map(([cat,c])=>{
    const pct=Math.round(c.correct/c.total*100);
    const avg=c.time/c.total;
    const expected=(c.benchmarkSum/c.total);
    const slow=avg > expected*1.35;
    const status=accuracyStatus(pct);
    const enough=c.total>=10;
    const label=enough ? status.label : "樣本不足 "+c.total+"/10";
    const cls=enough ? status.cls : "sample";
    return '<article class="diagnosis-item '+cls+'">'+
      '<div class="diagnosis-item-head"><strong>'+esc(CATEGORY_LABELS[cat] || cat)+'</strong><span>'+label+'</span></div>'+
      '<div class="diagnosis-score"><b>'+pct+'%</b><small>'+c.correct+'/'+c.total+' 題</small></div>'+
      '<div class="accuracy-bar"><i style="width:'+pct+'%"></i></div>'+
      '<p>平均 '+avg.toFixed(1)+' 秒／題'+(slow?'・<b class="speed-warning">速度偏慢</b>':'・速度正常')+'</p>'+
      '</article>';
  }).join("");

  const rowOrder=["a","k","s","t","n","h","m","y","r","w"];
  const rowItems=rowOrder.filter(id=>rows[id]).map(id=>{
    const c=rows[id], pct=Math.round(c.correct/c.total*100), avg=c.time/c.total;
    const status=accuracyStatus(pct), enough=c.total>=5;
    const expected=c.benchmarkSum ? c.benchmarkSum/c.total : 6;
    const slow=avg > expected*1.35;
    return '<article class="kana-diagnosis-item '+(enough?status.cls:"sample")+'">'+
      '<strong>'+KANA_ROW_LABELS[id]+'</strong>'+
      '<b>'+pct+'%</b>'+
      '<span>'+(enough?status.label:"觀察中 "+c.total+"/5")+'</span>'+
      '<small>'+c.correct+'/'+c.total+' 題・'+avg.toFixed(1)+' 秒'+(slow?'・偏慢':'')+'</small>'+
      '</article>';
  });
  rowsRoot.innerHTML = rowItems.length ? rowItems.join("") :
    '<div class="empty-history">舊版紀錄沒有行別資料；從下一次平／片假名測驗開始會累積。</div>';

  const weakTopics = Object.values(topics)
    .filter(t=>t.total>=2 && t.correct<t.total)
    .map(t=>({...t,pct:Math.round(t.correct/t.total*100)}))
    .sort((a,b)=>a.pct-b.pct || b.total-a.total)
    .slice(0,6);

  focusRoot.innerHTML = weakTopics.length ? weakTopics.map(t=>
    '<div class="focus-chip"><span>'+esc(CATEGORY_LABELS[t.cat] || t.cat)+'</span><strong>'+esc(t.topic)+'</strong><small>'+t.correct+'/'+t.total+'（'+t.pct+'%）</small></div>'
  ).join("") : '<div class="empty-history">目前沒有累積到重複出錯的項目；新測驗會逐步建立更細的弱點紀錄。</div>';
}

function renderHistory(){
  const history = readHistory();
  renderDiagnosis(history);
  const summary = document.querySelector("#historySummary");
  const list = document.querySelector("#historyList");

  if(!history.length){
    summary.innerHTML = "";
    list.innerHTML = '<div class="empty-history">還沒有測驗紀錄。完成第一份測驗後，這裡會開始累積。</div>';
    return;
  }

  const avg = Math.round(history.reduce((s,x)=>s+x.accuracy,0)/history.length);
  const best = Math.max(...history.map(x=>x.accuracy));
  const recent = history.slice(0,10);
  summary.innerHTML =
    '<div><span>累計測驗</span><strong>'+history.length+'</strong></div>'+
    '<div><span>平均答對率</span><strong>'+avg+'%</strong></div>'+
    '<div><span>最佳答對率</span><strong>'+best+'%</strong></div>';

  list.innerHTML = recent.map(r=>{
    const d = new Date(r.at);
    const date = (d.getMonth()+1)+"/"+d.getDate()+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
    const scopes = r.mode === "today"
      ? "今日專屬"+(r.lessonDate ? "｜"+r.lessonDate : "")
      : r.scopes.map(x=>CATEGORY_LABELS[x]).join("、");
    const rowText = r.kanaRows && r.kanaRows.length && r.kanaRows.length < 10 && r.scopes.some(x=>["hira","kata"].includes(x))
      ? "｜"+r.kanaRows.map(x=>KANA_ROW_LABELS[x]).join("、") : "";
    return '<article class="history-row">'+
      '<div><strong>'+r.accuracy+'%</strong><span>'+r.score+'/'+r.count+'</span></div>'+
      '<div><b>'+DIFFICULTY_LABELS[r.difficulty]+'・'+r.count+' 題</b><small>'+esc(scopes+rowText)+'</small></div>'+
      '<div><span>'+formatTime(r.totalTime)+'</span><small>'+date+'</small></div>'+
      '</article>';
  }).join("");
}

document.querySelector("#selectAllScope").addEventListener("click",()=>{
  const inputs = [...document.querySelectorAll(".scope-option input")];
  const allChecked = inputs.every(x=>x.checked);
  inputs.forEach(x=>x.checked=!allChecked);
  document.querySelector("#selectAllScope").textContent = allChecked ? "全選" : "全部取消";
});

document.querySelector("#selectAllKanaRows").addEventListener("click",()=>{
  const inputs=[...document.querySelectorAll(".kana-row-input")];
  const allChecked=inputs.every(x=>x.checked);
  inputs.forEach(x=>x.checked=!allChecked);
  document.querySelector("#selectAllKanaRows").textContent=allChecked ? "全選" : "全部取消";
});

document.querySelector("#startTodayTest").addEventListener("click",startTodayTest);
document.querySelector("#startTest").addEventListener("click",startTest);
document.querySelector("#nextQuestion").addEventListener("click",nextQuestion);

document.querySelector("#quitTest").addEventListener("click",()=>{
  if(confirm("確定要結束這次測驗嗎？這次不會留下成績。")){
    clearInterval(timerId);
    document.querySelector("#quizView").classList.add("hidden");
    document.querySelector("#setupView").classList.remove("hidden");
    testStartedAt = 0;
    window.scrollTo({top:0,behavior:"smooth"});
  }
});

document.querySelector("#retryTest").addEventListener("click",()=>{
  if(testConfig.mode === "today"){
    startTodayTest();
    return;
  }
  document.querySelectorAll(".scope-option input").forEach(x=>x.checked=testConfig.scopes.includes(x.value));
  document.querySelector("#questionCount").value = String(testConfig.count);
  document.querySelector('input[name="difficulty"][value="'+testConfig.difficulty+'"]').checked = true;
  document.querySelectorAll(".kana-row-input").forEach(x=>x.checked=(testConfig.kanaRows || []).includes(x.value));
  startTest();
});

document.querySelector("#backSetup").addEventListener("click",()=>{
  document.querySelector("#resultView").classList.add("hidden");
  document.querySelector("#setupView").classList.remove("hidden");
  renderHistory();
  window.scrollTo({top:0,behavior:"smooth"});
});

document.querySelector("#clearHistory").addEventListener("click",()=>{
  if(confirm("確定要清除這台裝置上的所有自我測驗紀錄嗎？")){
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
});


renderHistory();
loadTodayLesson();
