import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BUNDLE = ROOT / "pipeline" / "incoming.json"
ALLOWED_CATEGORIES = {"kana", "vocab", "grammar", "reading", "listening", "mixed"}
TAIPEI_TIMEZONE = timezone(timedelta(hours=8))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def require_text(value, label):
    require(isinstance(value, str) and value.strip(), f"{label} 必須是非空字串")


def require_text_list(value, label):
    require(isinstance(value, list) and value, f"{label} 必須是非空陣列")
    for index, item in enumerate(value, start=1):
        require_text(item, f"{label}[{index}]")


def validate_choice(question, label, require_metadata=False):
    require(isinstance(question, dict), f"{label} 必須是物件")
    require_text(question.get("question"), f"{label}.question")
    options = question.get("options")
    require(isinstance(options, list) and len(options) == 4, f"{label}.options 必須正好有 4 個選項")
    require(all(isinstance(option, str) and option.strip() for option in options), f"{label}.options 不可有空白選項")
    require(len(set(options)) == 4, f"{label}.options 必須互不重複")
    answer = question.get("answer")
    require(type(answer) is int and 0 <= answer <= 3, f"{label}.answer 必須是 0 到 3 的整數")

    if require_metadata:
        require_text(question.get("id"), f"{label}.id")
        require(question.get("category") in ALLOWED_CATEGORIES, f"{label}.category 無效")
        require_text(question.get("explanation"), f"{label}.explanation")


def validate_lesson(lesson, expected_date):
    require(isinstance(lesson, dict), "lesson 必須是物件")
    require(lesson.get("date") == expected_date, "lesson.date 必須等於台灣今日日期")

    for key in ("title", "duration", "goal"):
        require_text(lesson.get(key), f"lesson.{key}")
    for key in ("minimum", "review"):
        require_text_list(lesson.get(key), f"lesson.{key}")

    kana = lesson.get("kana")
    require(isinstance(kana, dict), "lesson.kana 必須是物件")
    require(isinstance(kana.get("items"), list) and kana["items"], "lesson.kana.items 必須是非空陣列")
    for index, item in enumerate(kana["items"], start=1):
        require(isinstance(item, dict), f"lesson.kana.items[{index}] 必須是物件")
        require_text(item.get("kana"), f"lesson.kana.items[{index}].kana")
        require_text(item.get("romaji"), f"lesson.kana.items[{index}].romaji")
    require_text_list(kana.get("notes"), "lesson.kana.notes")

    vocab = lesson.get("vocab")
    require(isinstance(vocab, list) and vocab, "lesson.vocab 必須是非空陣列")
    for index, item in enumerate(vocab, start=1):
        require(isinstance(item, dict), f"lesson.vocab[{index}] 必須是物件")
        for key in ("word", "reading", "meaning", "usage", "example", "translation"):
            require_text(item.get(key), f"lesson.vocab[{index}].{key}")

    grammar = lesson.get("grammar")
    require(isinstance(grammar, list) and grammar, "lesson.grammar 必須是非空陣列")
    for index, item in enumerate(grammar, start=1):
        require(isinstance(item, dict), f"lesson.grammar[{index}] 必須是物件")
        for key in ("pattern", "meaning", "connection", "usage"):
            require_text(item.get(key), f"lesson.grammar[{index}].{key}")
        examples = item.get("examples")
        require(isinstance(examples, list) and len(examples) >= 2, f"lesson.grammar[{index}].examples 至少需要 2 個例句")
        for example_index, example in enumerate(examples, start=1):
            require(isinstance(example, dict), f"lesson.grammar[{index}].examples[{example_index}] 必須是物件")
            require_text(example.get("jp"), f"lesson.grammar[{index}].examples[{example_index}].jp")
            require_text(example.get("zh"), f"lesson.grammar[{index}].examples[{example_index}].zh")

    quiz = lesson.get("quiz")
    require(isinstance(quiz, list) and quiz, "lesson.quiz 必須是非空陣列")
    for index, question in enumerate(quiz, start=1):
        require(isinstance(question, dict), f"lesson.quiz[{index}] 必須是物件")
        require(question.get("type") == "choice", f"lesson.quiz[{index}].type 必須是 choice")
        validate_choice(question, f"lesson.quiz[{index}]")


def validate_exam(exam, expected_date):
    require(isinstance(exam, dict), "exam 必須是物件")
    require(exam.get("date") == expected_date, "exam.date 必須等於台灣今日日期")
    require_text(exam.get("title"), "exam.title")
    require("今日驗收" in exam["title"] and "晚間驗收" not in exam["title"], "exam.title 必須使用「今日驗收」")
    require_text(exam.get("description"), "exam.description")
    require(exam.get("passScore") == 80, "exam.passScore 必須是 80")

    questions = exam.get("questions")
    require(isinstance(questions, list) and len(questions) == 15, "exam.questions 必須正好 15 題")
    ids = []
    for index, question in enumerate(questions, start=1):
        validate_choice(question, f"exam.questions[{index}]", require_metadata=True)
        ids.append(question["id"])
    require(len(set(ids)) == len(ids), "exam.questions 的 id 必須互不重複")


def main():
    bundle_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_BUNDLE
    expected_date = os.environ.get("JPT_EXPECTED_DATE") or datetime.now(TAIPEI_TIMEZONE).date().isoformat()
    bundle = json.loads(bundle_path.read_text(encoding="utf-8"))

    require(isinstance(bundle, dict), "交稿檔必須是 JSON 物件")
    require(bundle.get("date") == expected_date, "bundle.date 必須等於台灣今日日期")
    lesson = bundle.get("lesson")
    exam = bundle.get("exam")
    validate_lesson(lesson, expected_date)
    validate_exam(exam, expected_date)

    outputs = {
        ROOT / "site" / "lessons" / f"{expected_date}.json": lesson,
        ROOT / "site" / "lessons" / "latest.json": lesson,
        ROOT / "site" / "exams" / f"{expected_date}.json": exam,
        ROOT / "site" / "exams" / "latest.json": exam,
    }
    for path, content in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(content, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )

    print(f"Validated and materialized daily bundle for {expected_date}")


if __name__ == "__main__":
    main()
