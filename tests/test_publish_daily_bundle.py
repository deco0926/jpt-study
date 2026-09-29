import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('publisher', REPO / 'scripts/publish_daily_bundle.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
FIXTURE = json.loads((REPO / 'pipeline/incoming.json').read_text(encoding='utf-8'))


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.a = patch.object(p, 'ROOT', self.root)
        self.b = patch.object(p, 'LEARNING_DATABASE', self.root / 'site/data/learning-database.json')
        self.a.start(); self.b.start()
        self.addCleanup(self.a.stop); self.addCleanup(self.b.stop)

    def write(self, path, value):
        path = self.root / path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding='utf-8')
        return path

    def bundle(self, day):
        value = copy.deepcopy(FIXTURE)
        value['date'] = value['lesson']['date'] = value['exam']['date'] = day
        return value

    def submit(self, day):
        return self.write(f'pipeline/submissions/{day}.json', self.bundle(day))

    def apply(self, plan):
        for path, value in plan.items():
            self.write(path, value)

    def test_sorted_batch_and_idempotent_retry(self):
        paths = [self.submit('2026-09-29'), self.submit('2026-09-28')]
        self.apply(p.plan_publication(paths, '2026-09-29'))
        for kind in ('lessons', 'exams'):
            self.assertEqual(p.read_json(self.root / f'site/{kind}/latest.json')['date'], '2026-09-29')
            self.assertTrue((self.root / f'site/{kind}/2026-09-28.json').exists())
        self.assertEqual(p.plan_publication(paths, '2026-09-30'), {})

    def test_historical_backfill_does_not_regress_latest_or_database(self):
        newer = self.submit('2026-09-29')
        bundle = p.read_json(newer)
        bundle['lesson']['vocab'][0]['meaning'] = '較新內容'
        self.write(newer, bundle)
        self.apply(p.plan_publication([newer], '2026-09-29'))
        plan = p.plan_publication([self.submit('2026-09-28')], '2026-09-29')
        self.assertFalse(any(path.name == 'latest.json' for path in plan))
        db = plan[p.LEARNING_DATABASE]
        word = next(v for v in db['vocabulary'] if v['word'] == bundle['lesson']['vocab'][0]['word'])
        self.assertEqual(word['meaning'], '較新內容')
        self.assertEqual(word['firstSeen'], '2026-09-28')
        self.assertEqual(word['lastSeen'], '2026-09-29')
        self.assertEqual(db['updatedThrough'], '2026-09-29')

    def test_conflict_cannot_overwrite_history(self):
        path = self.submit('2026-09-28')
        self.apply(p.plan_publication([path], '2026-09-29'))
        original = (self.root / 'site/lessons/2026-09-28.json').read_bytes()
        bundle = p.read_json(path); bundle['lesson']['title'] = 'changed'
        self.write(path, bundle)
        with self.assertRaisesRegex(ValueError, '禁止覆蓋'):
            p.plan_publication([path], '2026-09-29')
        self.assertEqual(original, (self.root / 'site/lessons/2026-09-28.json').read_bytes())

    def test_invalid_second_bundle_writes_nothing(self):
        good = self.submit('2026-09-28'); bad = self.submit('2026-09-29')
        bundle = p.read_json(bad); bundle['exam']['questions'][0]['options'] = ['a'] * 4
        self.write(bad, bundle)
        with self.assertRaises(ValueError): p.plan_publication([good, bad], '2026-09-29')
        self.assertFalse((self.root / 'site').exists())

    def test_future_and_invalid_calendar_date_rejected(self):
        for day in ('2026-09-30', '2026-02-30', '../../escape'):
            path = self.write('pipeline/incoming.json', self.bundle(day))
            with self.assertRaises(ValueError): p.plan_publication([path], '2026-09-29')

    def test_filename_date_and_exam_date_must_match(self):
        path = self.write('pipeline/submissions/2026-09-28.json', self.bundle('2026-09-29'))
        with self.assertRaises(ValueError): p.plan_publication([path], '2026-09-29')
        bundle = self.bundle('2026-09-28'); bundle['exam']['date'] = '2026-09-29'
        self.write(path, bundle)
        with self.assertRaises(ValueError): p.plan_publication([path], '2026-09-29')

    def test_legacy_and_queue_conflict_rejected(self):
        a = self.submit('2026-09-28'); bundle = self.bundle('2026-09-28')
        bundle['lesson']['title'] = 'different'
        b = self.write('pipeline/incoming.json', bundle)
        with self.assertRaisesRegex(ValueError, '同日交稿'): p.plan_publication([a, b], '2026-09-29')

    def test_strict_single_file_keeps_expected_date_check(self):
        path = self.submit('2026-09-28')
        with self.assertRaises(ValueError): p.plan_publication([path], '2026-09-29', '2026-09-29')

    def test_mismatched_latest_pair_fails_closed(self):
        path = self.submit('2026-09-28')
        self.apply(p.plan_publication([path], '2026-09-29'))
        newer = self.bundle('2026-09-29')['exam']
        self.write('site/exams/latest.json', newer)
        self.write('site/exams/2026-09-29.json', newer)
        with self.assertRaisesRegex(ValueError, '日期不同'): p.plan_publication([path], '2026-09-29')

    def test_exam_contract(self):
        for mutate in (
            lambda e: e.update(passScore=70),
            lambda e: e['questions'].pop(),
            lambda e: e['questions'][0].update(answer=True),
            lambda e: e['questions'][0].update(answer=4),
            lambda e: e['questions'][0].update(id=e['questions'][1]['id']),
            lambda e: e['questions'][0].update(category='invalid'),
        ):
            bundle = self.bundle('2026-09-28'); mutate(bundle['exam'])
            with self.assertRaises(ValueError): p.validate_exam(bundle['exam'], '2026-09-28')

    def test_explicit_restart_survives_rescan_and_new_content_resumes(self):
        old = self.submit('2026-09-24')
        later = self.submit('2026-09-29')
        self.apply(p.plan_publication([old, later], '2026-09-29'))
        self.write('pipeline/study-restart.json', {'restartFrom': '2026-09-24', 'restartOn': '2026-09-30'})
        self.apply(p.plan_publication([old, later], '2026-09-29'))
        for kind in ('lessons', 'exams'):
            self.assertEqual(p.read_json(self.root / f'site/{kind}/latest.json')['date'], '2026-09-24')
            self.assertTrue((self.root / f'site/{kind}/2026-09-29.json').exists())
        self.assertEqual(p.plan_publication([old, later], '2026-09-30'), {})
        new = self.submit('2026-09-30')
        self.apply(p.plan_publication([old, later, new], '2026-09-30'))
        self.assertEqual(p.read_json(self.root / 'site/lessons/latest.json')['date'], '2026-09-30')
        self.assertEqual(p.plan_publication([old, later, new], '2026-09-30'), {})

    def test_restart_requires_valid_complete_history(self):
        later = self.submit('2026-09-29')
        self.apply(p.plan_publication([later], '2026-09-29'))
        for config in (
            {'restartFrom': '2026-09-24', 'restartOn': '2026-09-30'},
            {'restartFrom': '../escape', 'restartOn': '2026-09-30'},
            {'restartFrom': '2026-09-29', 'restartOn': '2026-09-28'},
        ):
            self.write('pipeline/study-restart.json', config)
            with self.assertRaises(ValueError): p.plan_publication([later], '2026-09-29')

    def test_restored_bundles_match_schema(self):
        for path in (REPO / 'pipeline/submissions').glob('*.json'):
            bundle = p.read_json(path)
            p.validate_lesson(bundle['lesson'], path.stem)
            p.validate_exam(bundle['exam'], path.stem)


if __name__ == '__main__':
    unittest.main()
