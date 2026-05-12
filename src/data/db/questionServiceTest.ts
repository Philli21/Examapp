import { getQuestions, getQuestionCount } from './questionService';
import { isSharedSubject } from '@/src/core/config/constants';

type TestCase = {
  label: string;
  stream: 'natural' | 'social';
  subject: string;
  year: number;
  chapter?: number;
  expectCount: number;
  expectStreamApplied: boolean;
};

const CASES: TestCase[] = [
  { label: 'Natural + Physics + Ch1', stream: 'natural', subject: 'Physics', year: 2017, chapter: 1, expectCount: 1, expectStreamApplied: true },
  { label: 'Natural + Maths Natural + Ch8', stream: 'natural', subject: 'Maths Natural', year: 2017, chapter: 8, expectCount: 1, expectStreamApplied: true },
  { label: 'Natural + Biology + Ch14', stream: 'natural', subject: 'Biology', year: 2017, chapter: 14, expectCount: 1, expectStreamApplied: true },
  { label: 'Social + History + Ch2', stream: 'social', subject: 'History', year: 2017, chapter: 2, expectCount: 1, expectStreamApplied: true },
  { label: 'Social + Economics + none', stream: 'social', subject: 'Economics', year: 2017, chapter: undefined, expectCount: 0, expectStreamApplied: true },
  { label: 'Natural + English + Ch9 (shared)', stream: 'natural', subject: 'English', year: 2017, chapter: 9, expectCount: 1, expectStreamApplied: false },
  { label: 'Social + English + Ch9 (shared)', stream: 'social', subject: 'English', year: 2017, chapter: 9, expectCount: 1, expectStreamApplied: false },
  { label: 'Natural + Aptitude + Ch16 (shared)', stream: 'natural', subject: 'Aptitude', year: 2017, chapter: 16, expectCount: 1, expectStreamApplied: false },
  { label: 'Social + Aptitude + Ch16 (shared)', stream: 'social', subject: 'Aptitude', year: 2017, chapter: 16, expectCount: 1, expectStreamApplied: false },
  { label: 'Nonexistent chapter filter', stream: 'natural', subject: 'Physics', year: 2017, chapter: 15, expectCount: 0, expectStreamApplied: true },
];

export async function runQuestionServiceTests(): Promise<void> {
  console.log('[QSTest] ========== QuestionService Test Suite ==========');

  let passed = 0;
  let failed = 0;
  const timings: number[] = [];

  for (const c of CASES) {
    const expectedShared = isSharedSubject(c.subject);
    const streamSkipped = expectedShared;

    console.log(`[QSTest] --- ${c.label} ---`);
    console.log(`[QSTest]   Filters: stream=${c.stream}, subject=${c.subject}, year=${c.year}, chapter=${c.chapter}`);
    console.log(`[QSTest]   Expected: streamFilter=${!streamSkipped ? 'APPLIED' : 'SKIPPED'}, count=${c.expectCount}`);

    const start = performance.now();
    const count = await getQuestionCount({
      stream: c.stream,
      subject: c.subject,
      year: c.year,
      chapter: c.chapter,
    });
    const elapsed = performance.now() - start;
    timings.push(elapsed);

    const countOk = count === c.expectCount;
    const streamOk = streamSkipped === !c.expectStreamApplied || c.expectCount === 0;

    if (countOk) {
      passed++;
      console.log(`[QSTest]   PASS: count=${count}, time=${elapsed.toFixed(1)}ms`);
    } else {
      failed++;
      console.error(`[QSTest]   FAIL: count=${count}, expected=${c.expectCount}, time=${elapsed.toFixed(1)}ms`);
    }
  }

  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  const max = Math.max(...timings);

  console.log('[QSTest] ========== SUMMARY ==========');
  console.log(`[QSTest]   Passed: ${passed}, Failed: ${failed}`);
  console.log(`[QSTest]   Avg query time: ${avg.toFixed(1)}ms, Max: ${max.toFixed(1)}ms`);
  console.log(`[QSTest]   Target <300ms: ${max < 300 ? 'PASS' : 'FAIL'}`);

  if (failed > 0) {
    console.error('[QSTest] SOME TESTS FAILED');
  } else {
    console.log('[QSTest] ALL TESTS PASSED');
  }
}
