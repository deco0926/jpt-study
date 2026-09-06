import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BUNDLE = ROOT / "pipeline" / "incoming.json"
LEARNING_DATABASE = ROOT / "site" / "data" / "learning-database.json"
ALLOWED_CATEGORIES = {"kana", "vocab", "grammar", "reading", "listening", "mixed"}
TAIPEI_TIMEZONE = timezone(timedelta(hours=8))

VERBS = {
    "食べる", "行く", "飲む", "買う", "見る", "帰る", "会う", "勉強する",
    "寝る", "起きる", "休む", "使う", "書く", "聞く", "話す", "読む",
    "入る", "出る", "待つ", "忘れる", "急ぐ", "持つ", "閉める", "開ける",
}
GODAN_RU_VERBS = {"帰る", "入る", "走る", "切る", "知る", "要る", "減る", "滑る", "喋る", "焦る"}
ADJECTIVES = {"おいしい", "にぎやか", "便利", "古い", "大きい", "安い", "小さい", "新しい", "静か", "高い"}
ADVERB_TIME_WORDS = {"今日", "明日", "一緒に", "朝", "夜", "毎日", "昨日", "午前", "午後", "今"}
OTHER_WORDS = {"誰", "ここ"}


def vocabulary_category(item):
    word = item["word"]
    usage = item.get("usage", "").rstrip("。")
    if word in VERBS or (
        word.endswith(("う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"))
        and usage.endswith(word)
    ):
        return "動詞"
    if word in ADJECTIVES:
        return "形容詞"
    if word in ADVERB_TIME_WORDS:
        return "副詞・時間詞"
    if word in OTHER_WORDS:
        return "其他"
    return "名詞"


def verb_forms(word, reading=""):
    if word.endswith("する"):
        stem = word[:-2]
        return {"masu": stem + "します", "nai": stem + "しない", "past": stem + "しました", "te": stem + "して"}
    if word == "来る":
        return {"masu": "来ます", "nai": "来ない", "past": "来ました", "te": "来て"}

    ending = word[-1]
    if ending == "る":
        kana = reading.split("/")[0].strip()
        previous_kana = kana[-2] if len(kana) >= 2 else ""
        ichidan_hint = previous_kana in "きぎしじちぢにひびぴみりいえけげせぜてでねへべぺめれ"
        if word not in GODAN_RU_VERBS and ichidan_hint:
            stem = word[:-1]
            return {"masu": stem + "ます", "nai": stem + "ない", "past": stem + "ました", "te": stem + "て"}

    masu_map = {"う": "い", "く": "き", "ぐ": "ぎ", "す": "し", "つ": "ち", "ぬ": "に", "ぶ": "び", "む": "み", "る": "り"}
    nai_map = {"う": "わ", "く": "か", "ぐ": "が", "す": "さ", "つ": "た", "ぬ": "な", "ぶ": "ば", "む": "ま", "る": "ら"}
    te_map = {"う": "って", "つ": "って", "る": "って", "む": "んで", "ぶ": "んで", "ぬ": "んで", "く": "いて", "ぐ": "いで", "す": "して"}
    if ending not in masu_map:
        return None
    stem = word[:-1]
    te_form = "行って" if word == "行く" else stem + te_map[ending]
    masu_stem = stem + masu_map[ending]
    return {"masu": masu_stem + "ます", "nai": stem + nai_map[ending] + "ない", "past": masu_stem + "ました", "te": te_form}


def grammar_category(pattern):
    if "形容詞" in pattern:
        return "形容詞"
    if any(term in pattern for term in ("時間", "順序", "てから")):
        return "時間・順序"
    if any(term in pattern for term in ("ませんか", "ください")):
        return "請求・邀請"
    if any(term in pattern for term in ("てもいい", "てはいけません", "規則句尾")):
        return "許可・禁止"
    if "ない形" in pattern:
        return "ない形"
    if "て形" in pattern or "～て" in pattern:
        return "て形"
    if any(term in pattern for term in (" ＋ に ＋ ", " ＋ で ＋ ", " ＋ を ＋ ", " ＋ へ ＋ ", " ＋ と")):
        return "助詞"
    if pattern in {"～ました", "～ませんでした"}:
        return "過去"
    if pattern in {"～ます", "～ません", "ます／ません"}:
        return "現在・未來"
    if any(term in pattern for term in ("ます", "ません", "時態")):
        return "時態整理"
    return "基礎句型"


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


def load_learning_database():
    if not LEARNING_DATABASE.exists():
        return {"version": 1, "updatedThrough": "", "vocabulary": [], "grammar": []}
    database = json.loads(LEARNING_DATABASE.read_text(encoding="utf-8"))
    require(isinstance(database, dict), "learning-database.json 必須是 JSON 物件")
    require(isinstance(database.get("vocabulary"), list), "learning-database.vocabulary 必須是陣列")
    require(isinstance(database.get("grammar"), list), "learning-database.grammar 必須是陣列")
    return database


def merge_lesson_into_database(database, lesson):
    lesson_date = lesson["date"]
    vocabulary = {
        item.get("word"): dict(item)
        for item in database.get("vocabulary", [])
        if isinstance(item, dict) and item.get("word")
    }
    for item in lesson.get("vocab", []):
        previous = vocabulary.get(item["word"], {})
        category = vocabulary_category(item)
        vocabulary[item["word"]] = {
            "word": item["word"],
            "reading": item["reading"],
            "meaning": item["meaning"],
            "usage": item["usage"],
            "example": item["example"],
            "translation": item["translation"],
            "category": category,
            "forms": verb_forms(item["word"], item["reading"]) if category == "動詞" else None,
            "firstSeen": previous.get("firstSeen", lesson_date),
            "lastSeen": lesson_date,
        }

    grammar = {
        item.get("pattern"): dict(item)
        for item in database.get("grammar", [])
        if isinstance(item, dict) and item.get("pattern")
    }
    for item in lesson.get("grammar", []):
        previous = grammar.get(item["pattern"], {})
        grammar[item["pattern"]] = {
            "pattern": item["pattern"],
            "meaning": item["meaning"],
            "connection": item["connection"],
            "usage": item["usage"],
            "examples": item["examples"],
            "category": grammar_category(item["pattern"]),
            "firstSeen": previous.get("firstSeen", lesson_date),
            "lastSeen": lesson_date,
        }

    database["version"] = 2
    database["updatedThrough"] = max(database.get("updatedThrough", ""), lesson_date)
    database["vocabulary"] = sorted(
        vocabulary.values(), key=lambda item: (item.get("firstSeen", ""), item["word"])
    )
    database["grammar"] = sorted(
        grammar.values(), key=lambda item: (item.get("firstSeen", ""), item["pattern"])
    )
    return database


def build_learning_database():
    database = load_learning_database()
    dated_lessons = sorted((ROOT / "site" / "lessons").glob("20??-??-??.json"))
    for lesson_path in dated_lessons:
        lesson = json.loads(lesson_path.read_text(encoding="utf-8"))
        if isinstance(lesson, dict) and lesson.get("date"):
            database = merge_lesson_into_database(database, lesson)
    return database


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

    learning_database = build_learning_database()
    LEARNING_DATABASE.parent.mkdir(parents=True, exist_ok=True)
    LEARNING_DATABASE.write_text(
        json.dumps(learning_database, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    print(
        f"Validated and materialized daily bundle for {expected_date}; "
        f"learning database now has {len(learning_database['vocabulary'])} vocabulary items "
        f"and {len(learning_database['grammar'])} grammar items"
    )


if __name__ == "__main__":
    main()
