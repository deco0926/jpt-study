(async function syncSharedLearningDatabase(){
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
        grammar.push({
          p:item.pattern,
          m:[item.meaning,item.connection,item.usage].filter(Boolean).join(" "),
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
