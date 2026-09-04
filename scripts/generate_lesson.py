import json, os, re, shutil
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
LESSONS = SITE / "lessons"
LESSONS.mkdir(parents=True, exist_ok=True)

today = datetime.now(ZoneInfo("Asia/Taipei")).date()
date_str = today.isoformat()
exam_date = "2026-09-13"

latest_path = LESSONS / "latest.json"
previous = ""
if latest_path.exists():
    previous = latest_path.read_text(encoding="utf-8")[:12000]

prompt = f"""
你是一位嚴格但清楚的 JPT 初學者老師。
學生目標：2026-09-13 JPT 達到約 JLPT N5 對照程度。
今天日期：{date_str}
考試日期：{exam_date}

規則：
- 8/29～8/31 每天內容約 20～30 分鐘，旅途中可完成。
- 9/1～9/12 每天約 2～3 小時。
- 不可假設學生懂尚未教過的文法。
- 每個單字都要有讀音、中文意思、用法、例句與翻譯。
- 每個文法都要有意思、接續、使用情境、至少 3 個例句。
- 題目只能考本日教過或前日複習內容。
- quiz 5～10 題，答案必須能機器判定。
- 正式考卷統一稱為「今日驗收」，部署後全天開放；不要使用「晚間驗收」。
- 請只輸出合法 JSON，不要 Markdown code fence。

上一份教材摘要（若有）：
{previous}

JSON schema 範例：
{{
  "date":"YYYY-MM-DD",
  "title":"...",
  "duration":"...",
  "goal":"...",
  "minimum":["..."],
  "kana":{{
    "items":[{{"kana":"タ","romaji":"ta"}}],
    "notes":["..."]
  }},
  "vocab":[{{
    "word":"駅","reading":"えき / eki","meaning":"車站","usage":"...",
    "example":"駅に行きます。","translation":"去車站。"
  }}],
  "grammar":[{{
    "pattern":"...",
    "meaning":"...",
    "connection":"...",
    "usage":"...",
    "examples":[{{"jp":"...","zh":"..."}}]
  }}],
  "quiz":[
    {{"type":"choice","question":"...","options":["A","B","C","D"],"answer":0}},
    {{"type":"text","question":"...","answer":["可接受答案1","可接受答案2"]}}
  ],
  "review":["..."]
}}
"""

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
response = client.responses.create(
    model="gpt-5.6-luna",
    input=prompt
)

raw = response.output_text.strip()
raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.I)
raw = re.sub(r"\s*```$", "", raw)

lesson = json.loads(raw)
lesson["date"] = date_str

dated_path = LESSONS / f"{date_str}.json"
dated_path.write_text(json.dumps(lesson, ensure_ascii=False, indent=2), encoding="utf-8")
shutil.copyfile(dated_path, latest_path)

print(f"Generated {dated_path}")
