(async function syncSharedLearningDatabase(){
  const grammarDisplayOverrides={
    "9/3快速複習：い形容詞／な形容詞的否定與名詞修飾":{
      pattern:"い形容詞／な形容詞的否定與名詞修飾",
      summary:"い形容詞否定：い→くないです；な形容詞否定：ではありません。修飾名詞時，い形容詞直接接名詞，な形容詞加「な」。"
    },
    "動詞て形：今天先掌握常用動詞的實際變化":{
      pattern:"動詞て形",
      summary:"連接動作或接續其他句型，本身不表示時態。常用變化：食べる→食べて、見る→見て、行く→行って、飲む→飲んで、する→して。"
    },
    "時間詞＋動作順序：朝／午前／午後／夜":{
      pattern:"時間詞＋動作順序",
      summary:"先用時間詞定位事件，再依動詞與「てから」判斷先後順序。"
    },
    "て形速度複習":{
      pattern:"動詞て形（複習）",
      summary:"連接動作或接續其他句型。重點：行く→行って。"
    },
    "常用て形規則：う／む／く／す":{
      pattern:"常用て形規則",
      summary:"う→って；む→んで；く→いて；す→して。例外：行く→行って。"
    },
    "て形補強：く→いて、う→って":{
      pattern:"て形：く→いて／う→って",
      summary:"書く→書いて、聞く→聞いて；使う→使って。例外：行く→行って。"
    }
  };
  const status=document.querySelector("#learningDatabaseStatus");
  const startButton=document.querySelector("#startTest");
  if(startButton) startButton.disabled=true;

  try{
    const response=await fetch("./data/learning-database.json",{cache:"no-store"});
    if(!response.ok) throw new Error("無法讀取共用學習資料");
    const data=await response.json();

    const knownWords=new Set(vocab.map(item=>item[0]));
    (data.vocabulary || []).forEach(item=>{
      if(!item?.word || !item.reading || !item.meaning || knownWords.has(item.word)) return;
      knownWords.add(item.word);
      if(typeof grammarQuestions !== "undefined"){
        vocab.push([item.word,item.reading,item.meaning]);
      }else{
        vocab.push([item.word,item.reading,item.meaning,item.example || item.usage || "",item.translation || ""]);
      }
    });

    if(typeof grammarQuestions !== "undefined"){
      const meanings=[...new Set((data.grammar || []).map(item=>item?.meaning).filter(Boolean))];
      const examples=(data.grammar || []).flatMap(item=>(item.examples || [])
        .filter(example=>example?.jp && example?.zh)
        .map(example=>({pattern:item.pattern,jp:example.jp,zh:example.zh})));
      const translations=[...new Set(examples.map(item=>item.zh))];
      const seen=new Set(grammarQuestions.map(item=>item.q+"|"+item.a));

      (data.grammar || []).forEach(item=>{
        const options=uniqueChoicesStrict(item.meaning,meanings);
        const question="「"+item.pattern+"」最接近哪個用法？";
        const signature=question+"|"+item.meaning;
        if(item?.pattern && options && !seen.has(signature)){
          seen.add(signature);
          grammarQuestions.push({level:1,q:question,o:options,a:item.meaning,topic:item.pattern});
        }
      });
      examples.forEach(item=>{
        const options=uniqueChoicesStrict(item.zh,translations);
        const question="「"+item.jp+"」最接近哪個意思？";
        const signature=question+"|"+item.zh;
        if(options && !seen.has(signature)){
          seen.add(signature);
          grammarQuestions.push({level:2,q:question,o:options,a:item.zh,topic:item.pattern});
        }
      });
      if(status) status.textContent="題庫已同步至 "+(data.updatedThrough || "最新教材")+
        "｜"+vocab.length+" 個單字、"+grammarQuestions.length+" 道文法題型。";
    }else if(typeof grammar !== "undefined"){
      const knownPatterns=new Set(grammar.map(item=>item.p));
      (data.grammar || []).forEach(item=>{
        if(!item?.pattern || !item.meaning || knownPatterns.has(item.pattern)) return;
        knownPatterns.add(item.pattern);
        const example=(item.examples || []).find(value=>value?.jp && value?.zh);
        const display=grammarDisplayOverrides[item.pattern] || {};
        grammar.push({
          p:display.pattern || item.pattern,
          m:display.summary || item.meaning,
          ex:example?.jp || "",
          zh:example?.zh || ""
        });
      });
      renderVocab();
      renderGrammar();
      document.querySelector("#vocabCount").textContent=vocab.length;
      document.querySelector("#grammarCount").textContent=grammar.length;
      document.querySelector("#databaseUpdatedThrough").textContent=data.updatedThrough
        ? "更新至 "+data.updatedThrough : "持續更新";
    }
  }catch(error){
    console.warn("共用學習資料載入失敗，使用內建備援資料。",error);
    if(status) status.textContent="共用題庫暫時無法讀取，目前使用內建備援題庫。";
    const badge=document.querySelector("#databaseUpdatedThrough");
    if(badge) badge.textContent="使用備援資料";
  }finally{
    if(startButton) startButton.disabled=false;
  }
})();
