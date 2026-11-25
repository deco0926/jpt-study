"""One-time audio authoring: pip install edge-tts; never needed by the website."""
import asyncio
import json
import re
from pathlib import Path
import edge_tts

ROOT=Path(__file__).resolve().parents[1]

async def main():
    folder=ROOT/'site/audio';folder.mkdir(exist_ok=True)
    gate=asyncio.Semaphore(3)
    async def render(q):
        target=ROOT/'site'/q['audio'].removeprefix('./')
        if target.exists() and target.stat().st_size>1000:return
        async with gate:
            # Preserve both speakers using separate Japanese voices, concatenate MP3 frames.
            segments=re.split(r'(女：|男：)',q['script'])
            parts=[];speaker='ja-JP-NanamiNeural'
            for segment in segments:
                if segment=='女：':speaker='ja-JP-NanamiNeural';continue
                if segment=='男：':speaker='ja-JP-KeitaNeural';continue
                if not segment.strip():continue
                for retry in range(3):
                    try:
                        frames=[]
                        async for chunk in edge_tts.Communicate(segment,speaker,rate='-8%').stream():
                            if chunk['type']=='audio':frames.append(chunk['data'])
                        if not frames:raise RuntimeError('No audio')
                        parts.extend(frames);break
                    except Exception:
                        if retry==2:raise
                        await asyncio.sleep(1)
            target.write_bytes(b''.join(parts))
            print(target.name,flush=True)
    jobs=[]
    for path in sorted((ROOT/'site/practice').glob('20*.json')):
        for q in json.loads(path.read_text(encoding='utf-8'))['questions']:
            if q['section']=='listening':jobs.append(render(q))
    await asyncio.gather(*jobs)
    print('All 66 audio tracks ready.',flush=True)

if __name__=='__main__':asyncio.run(main())
