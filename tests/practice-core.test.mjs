import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {taipeiDate, availablePapers, validatePaper, grade, readStore, writeStore} from '../site/practice-core.js';
const paper=JSON.parse(fs.readFileSync(new URL('../site/practice/2026-11-25.json',import.meta.url),'utf8'));
const index=JSON.parse(fs.readFileSync(new URL('../site/practice/index.json',import.meta.url),'utf8'));
test('Taiwan day changes at UTC 16:00; future papers stay out of the archive',()=>{
  assert.equal(taipeiDate(new Date('2026-11-25T15:59:59Z')),'2026-11-25');
  assert.equal(taipeiDate(new Date('2026-11-25T16:00:00Z')),'2026-11-26');
  assert.equal(availablePapers(index,'2026-11-25').length,1);
  assert.equal(availablePapers(index,'2026-12-06').length,11);
});
test('grading retains all questions, unanswered questions, and review snapshots',()=>{
  validatePaper(paper);const answers=Object.fromEntries(paper.questions.map(q=>[q.id,q.answer]));
  assert.equal(grade(paper,answers).score,20);
  delete answers[paper.questions[0].id];const result=grade(paper,answers);
  assert.equal(result.score,19);assert.equal(result.total,20);assert.equal(result.answers[0].selected,'未作答');
  assert.ok(result.answers[14].script);assert.ok(result.answers[8].passage);
  assert.deepEqual(result.sections.map(s=>s.total),[8,6,6]);
});
test('invalid answer indices, duplicate choices and IDs are rejected',()=>{
  for(const mutate of [p=>p.questions[0].answer=4,p=>p.questions[0].options[1]=p.questions[0].options[0],p=>p.questions[1].id=p.questions[0].id]){
    const bad=structuredClone(paper);mutate(bad);assert.throws(()=>validatePaper(bad));
  }
});
test('corrupt local storage and unavailable storage do not crash practice',()=>{
  assert.deepEqual(readStore({getItem:()=>'{bad'},'x',[]),[]);
  assert.equal(writeStore({setItem:()=>{throw Error('quota')}},'x',{}),false);
});
