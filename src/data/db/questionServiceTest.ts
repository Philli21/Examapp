import { getQuestions, getQuestionCount, getQuestionsWithOptions } from './questionService';
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

export async function runRendererTests(): Promise<void> {
  console.log('[RendererTest] ========== Renderer Test Suite ==========');

  const filters: Array<{ label: string; stream: 'natural' | 'social'; subject: string; year: number; chapter: number }> = [
    { label: 'Physics+Ch1 (natural LaTeX)', stream: 'natural', subject: 'Physics', year: 2017, chapter: 1 },
    { label: 'Maths Natural+Ch6 (calculus LaTeX)', stream: 'natural', subject: 'Maths Natural', year: 2017, chapter: 6 },
    { label: 'English+Ch9 (no LaTeX)', stream: 'natural', subject: 'English', year: 2017, chapter: 9 },
    { label: 'Aptitude+Ch13 (shared)', stream: 'social', subject: 'Aptitude', year: 2017, chapter: 13 },
    { label: 'Biology+Ch6 (genetics)', stream: 'natural', subject: 'Biology', year: 2017, chapter: 6 },
    { label: 'History+Ch4 (Zagwe)', stream: 'social', subject: 'History', year: 2017, chapter: 4 },
  ];

  let passed = 0;
  let failed = 0;

  for (const f of filters) {
    console.log(`[RendererTest] --- ${f.label} ---`);

    const questions = await getQuestionsWithOptions({ ...f });
    const q = questions[0];

    if (!q) {
      console.error(`[RendererTest]   FAIL: no question found`);
      failed++;
      continue;
    }

    const hasLatex = q.question_text.includes('\\(');
    console.log(`[RendererTest]   LaTeX in question: ${hasLatex ? 'YES' : 'NO (expected)'}`);
    console.log(`[RendererTest]   Options count: ${q.options?.length ?? 0}`);

    let optionChecks = 0;
    if (q.options?.length !== 4) {
      console.error(`[RendererTest]   FAIL: expected 4 options, got ${q.options?.length ?? 0}`);
      failed++;
      continue;
    }

    const correctCount = q.options.filter((o) => o.is_correct === 1).length;
    if (correctCount !== 1) {
      console.error(`[RendererTest]   FAIL: expected 1 correct option, got ${correctCount}`);
      failed++;
      continue;
    }

    const hasOptionLatex = q.options.some((o) => o.option_text.includes('\\('));
    console.log(`[RendererTest]   LaTeX in options: ${hasOptionLatex ? 'YES' : 'NO'}`);
    console.log(`[RendererTest]   Correct option: ${q.options.find((o) => o.is_correct === 1)?.label}`);

    const images = JSON.parse(q.question_images_json);
    console.log(`[RendererTest]   Images: ${images.length} (${images.length === 0 ? 'none — seed uses empty array' : 'present'})`);

    const hasExplanation = q.explanation_text !== null && q.explanation_text.length > 0;
    console.log(`[RendererTest]   Explanation: ${hasExplanation ? 'present' : 'missing'}`);

    if (hasExplanation) {
      const explHasLatex = q.explanation_text!.includes('\\(');
      console.log(`[RendererTest]   LaTeX in explanation: ${explHasLatex ? 'YES' : 'NO'}`);
    }

    console.log(`[RendererTest]   PASS`);
    passed++;
  }

  console.log('[RendererTest] ========== SUMMARY ==========');
  console.log(`[RendererTest]   Passed: ${passed}, Failed: ${failed}`);

  if (failed > 0) {
    console.error('[RendererTest] SOME TESTS FAILED');
  } else {
    console.log('[RendererTest] ALL TESTS PASSED');
  }
}
