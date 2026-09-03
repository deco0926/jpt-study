import json
import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "site" / "lessons"
EXAMS = ROOT / "site" / "exams"
EXAMS.mkdir(parents=True, exist_ok=True)

today = datetime.now(ZoneInfo("Asia/Taipei")).date()
date_str = today.isoformat()
lesson_path = LESSONS / f"{date_str}.json"
if not lesson_path.exists():
    lesson_path = LESSONS / "latest.json"

lesson = json.loads(lesson_path.read_text(encoding="utf-8"))
if lesson.get("date") != date_str:
    raise RuntimeError(f"今日教材尚未就緒：預期 {date_str}，實際 {lesson.get('date')}")

prompt = f"""
你是一位嚴格但清楚的 JPT 初學者老師。
請只根據下方今日教材，製作今天的正式晚間驗收考卷。

規則：
- 日期必須是 {date_str}。
- 固定 15 題，全部為四選一。
- 每題 options 必須正好 4 個互不重複的字串。
- answer 必須是 0 到 3 的整數索引。
- 不可考教材沒有教過的單字或文法。
- 題型要混合 kana、vocab、grammar、reading、listening、mixed；沒有適合內容時不要硬湊 listening。
- 干擾選項要合理，不能一眼排除。
- 每題都要有簡短繁體中文 explanation。
- 通過標準為 80。
- 只輸出合法 JSON，不要 Markdown code fence。

JSON schema：
{{
  "date": "{date_str}",
  "title": "...",
  "description": "...",
  "passScore": 80,
  "questions": [
    {{
      "id": "q1",
      "category": "kana|vocab|grammar|reading|listening|mixed",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 0,
      "explanation": "..."
    }}
  ]
}}

今日教材：
{json.dumps(lesson, ensure_ascii=False)}
"""


def validate_exam(exam):
    if exam.get("date") != date_str:
        raise ValueError("date 不正確")
    if exam.get("passScore") != 80:
        raise ValueError("passScore 必須是 80")
    questions = exam.get("questions")
    if not isinstance(questions, list) or len(questions) != 15:
        raise ValueError("questions 必須正好 15 題")
    allowed_categories = {"kana", "vocab", "grammar", "reading", "listening", "mixed"}
    for index, question in enumerate(questions, start=1):
        question["id"] = f"q{index}"
        if question.get("category") not in allowed_categories:
            raise ValueError(f"第 {index} 題 category 無效")
        if not isinstance(question.get("question"), str) or not question["question"].strip():
            raise ValueError(f"第 {index} 題題目無效")
        options = question.get("options")
        if not isinstance(options, list) or len(options) != 4:
            raise ValueError(f"第 {index} 題必須有 4 個選項")
        normalized = [str(option).strip() for option in options]
        if any(not option for option in normalized) or len(set(normalized)) != 4:
            raise ValueError(f"第 {index} 題選項空白或重複")
        question["options"] = normalized
        if not isinstance(question.get("answer"), int) or not 0 <= question["answer"] <= 3:
            raise ValueError(f"第 {index} 題答案索引無效")
        if not isinstance(question.get("explanation"), str) or not question["explanation"].strip():
            raise ValueError(f"第 {index} 題缺少解說")
    return exam


client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
last_error = None
for attempt in range(2):
    response = client.responses.create(model="gpt-5.6-luna", input=prompt)
    raw = response.output_text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.I)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        exam = validate_exam(json.loads(raw))
        break
    except (json.JSONDecodeError, ValueError) as error:
        last_error = error
else:
    raise RuntimeError(f"晚間考卷驗證失敗：{last_error}")

dated_path = EXAMS / f"{date_str}.json"
dated_path.write_text(json.dumps(exam, ensure_ascii=False, indent=2), encoding="utf-8")
shutil.copyfile(dated_path, EXAMS / "latest.json")
print(f"Generated {dated_path}")
