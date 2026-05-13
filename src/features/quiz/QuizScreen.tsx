import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/src/core/navigation/AppNavigator';
import { AppColors } from '@/src/core/theme/colors';
import type { Question } from '@/src/data/db/questionService';
import { getQuestionsWithOptions } from '@/src/data/db/questionService';
import { saveProgress } from '@/src/data/db/progressService';
import { createSession, updateSession } from '@/src/data/db/sessionService';
import { useAppStore } from '@/src/store/useAppStore';
import QuestionRenderer from '@/src/shared/renderers/QuestionRenderer';
import { parseTextSegments, renderTextWithLatex } from '@/src/shared/renderers/latexUtils';
import Timer from './Timer';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

const AUTO_SAVE_INTERVAL_MS = 30000;
const TIMER_PER_QUESTION_SEC = 90;

export default function QuizScreen() {
  const navigation = useNavigation<Navigation>();
  const stream = useAppStore((s) => s.stream);
  const subject = useAppStore((s) => s.subject);
  const year = useAppStore((s) => s.year);
  const chapter = useAppStore((s) => s.chapter);
  const mode = useAppStore((s) => s.mode);
  const isExam = mode === 'exam';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasSelected = selectedOption !== null;
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  // ─── Load questions ───
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const qs = await getQuestionsWithOptions({
          stream: stream!,
          subject: subject!,
          year: year!,
          chapter: chapter!,
        });
        if (!cancelled) {
          setQuestions(qs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load questions');
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stream, subject, year, chapter]);

  // ─── Create exam session on mount ───
  useEffect(() => {
    if (!isExam || questions.length === 0) return;
    let cancelled = false;

    createSession({
      stream: stream!,
      subject: subject!,
      year: year!,
      mode: 'exam',
      total_questions: questions.length,
    }).then((id) => {
      if (!cancelled) sessionIdRef.current = id;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExam, questions.length]);

  // ─── Auto-save every 30s in exam mode ───
  useEffect(() => {
    if (!isExam || sessionIdRef.current === null) return;

    const interval = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (sid === null) return;

      try {
        await updateSession(sid, {
          correct_count: correctCount,
          wrong_count: Object.keys(answers).length - correctCount,
          skipped_count: questions.length - Object.keys(answers).length,
        });
      } catch {}
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isExam, correctCount, answers, questions.length]);

  // ─── Timer duration for exam mode ───
  const examDurationSec = useMemo(() => {
    if (!isExam) return 0;
    return Math.max(questions.length * TIMER_PER_QUESTION_SEC, 30 * 60);
  }, [isExam, questions.length]);

  // ─── Handle option selection ───
  const handleSelectOption = useCallback(
    (label: string) => {
      if (!currentQuestion) return;

      // Practice mode: prevent re-selection
      // Exam mode: allow changing answer
      if (!isExam && hasSelected) return;

      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const option = currentQuestion.options?.find((o) => o.label === label);
      const isCorrect = option?.is_correct === 1;

      // Save to local state
      if (answers[currentIndex] === undefined) {
        // First time answering this question
        setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
        if (isCorrect) setCorrectCount((prev) => prev + 1);
      } else {
        // Re-selecting — update answer
        const prevLabel = answers[currentIndex];
        const prevCorrect = currentQuestion.options?.find((o) => o.label === prevLabel)?.is_correct === 1;
        setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
        if (prevCorrect && !isCorrect) setCorrectCount((prev) => prev - 1);
        if (!prevCorrect && isCorrect) setCorrectCount((prev) => prev + 1);
      }

      // Update selected for showing highlighted option
      setSelectedOption(label);

      // Practice mode: save immediately and show feedback
      if (!isExam) {
        saveProgress({
          questionId: currentQuestion.id,
          selectedAnswer: label,
          isCorrect,
          mode: 'practice',
          timeSpentSeconds: elapsedSeconds,
        }).catch(() => {});

        startTimeRef.current = Date.now();
      }
    },
    [currentQuestion, hasSelected, isExam, currentIndex, answers],
  );

  // ─── Handle Next (practice mode) ───
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      navigation.navigate('Results', { sessionId: 0 });
      return;
    }
    setSelectedOption(null);
    setCurrentIndex((prev) => prev + 1);
    startTimeRef.current = Date.now();
  }, [isLastQuestion, navigation]);

  // ─── Handle Submit (exam mode) ───
  const handleSubmit = useCallback(async () => {
    const sid = sessionIdRef.current;
    const answered = Object.keys(answers).length;
    const wrong = answered - correctCount;
    const skipped = questions.length - answered;

    if (sid !== null) {
      try {
        await updateSession(sid, {
          correct_count: correctCount,
          wrong_count: wrong,
          skipped_count: skipped,
          finished_at: new Date().toISOString(),
        });
      } catch {}
    }

    navigation.navigate('Results', { sessionId: sid ?? 0 });
  }, [correctCount, answers, questions.length, navigation]);

  // ─── Handle timer expiry (exam mode) ───
  const handleTimerExpire = useCallback(() => {
    Alert.alert('Time Expired', 'Your exam time has ended. Submitting your answers.');
    handleSubmit();
  }, [handleSubmit]);

  const streamColor = stream === 'natural' ? AppColors.natural : AppColors.social;

  // ─── Loading / Error / Empty states ───
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: streamColor }]} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>No questions available for these filters.</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: streamColor }]} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Main render ───
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: streamColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            {isExam ? 'Exit' : 'Exit'}
          </Text>
        </TouchableOpacity>

        {isExam && (
          <Timer
            durationSec={examDurationSec}
            onExpire={handleTimerExpire}
            isRunning={true}
          />
        )}

        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionRenderer
          question={currentQuestion}
          selectedOption={selectedOption}
          showFeedback={!isExam && hasSelected}
          onSelectOption={handleSelectOption}
        />

        {hasSelected && !isExam && currentQuestion.explanation_text && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <View style={styles.explanationBody}>
              {renderTextWithLatex(
                parseTextSegments(currentQuestion.explanation_text),
                styles.explanationText,
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {isExam ? (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: streamColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              Submit{!allAnswered ? ` (${Object.keys(answers).length}/${questions.length})` : ''}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: hasSelected ? streamColor : AppColors.disabled },
            ]}
            disabled={!hasSelected}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: AppColors.background,
  },
  statusText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '600',
  },
  progressText: {
    color: AppColors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  explanationCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 44,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
  explanationBody: {},
  bottomBar: {
    padding: 16,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: AppColors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: AppColors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});
