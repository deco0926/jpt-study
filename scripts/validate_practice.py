"""Check every dated sprint paper and its audio before deployment."""
import json
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]

def validate():
    folder=ROOT/'site/practice'
    manifest=json.loads((folder/'index.json').read_text(encoding='utf-8'))
    ids=set();tracks=set()
    for entry in manifest['papers']:
        paper=json.loads((folder/(entry['date']+'.json')).read_text(encoding='utf-8'))
        assert paper['date']==entry['date'] and paper['title']==entry['title']
        assert paper['answerMinutes']+paper['reviewMinutes']==30
        assert len(paper['questions'])==20
        assert Counter(q['section'] for q in paper['questions'])=={'general':8,'reading':6,'listening':6}
        for q in paper['questions']:
            assert q['id'] not in ids,q['id'];ids.add(q['id'])
            assert all(isinstance(q[k],str) and q[k].strip() for k in ('question','explanation','category','type'))
            assert len(q['options'])==len(set(q['options']))==4,q['id']
            assert type(q['answer']) is int and 0<=q['answer']<=3,q['id']
            if q['section']=='reading':assert len(q['passage'])>=100,q['id']
            if q['section']=='listening':
                assert q['script'].strip()
                assert q['audio'].startswith('./audio/') and '..' not in q['audio']
                audio=ROOT/'site'/q['audio'].removeprefix('./')
                assert audio.is_file() and audio.stat().st_size>1000,str(audio)
                tracks.add(audio)
    assert len(manifest['papers'])==11
    assert len(ids)==220 and len(tracks)==66
    print(f'Validated {len(manifest["papers"])} papers, {len(ids)} questions, {len(tracks)} audio tracks.')

if __name__=='__main__':validate()
