import { getDatabase } from './dbService';

export interface ProgressRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  mode: string;
  timeSpentSeconds: number;
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  const db = getDatabase();
  await db.execute(
    `INSERT INTO user_progress (question_id, selected_answer, is_correct, mode, time_spent_seconds)
     VALUES (?, ?, ?, ?, ?)`,
    [
      record.questionId,
      record.selectedAnswer,
      record.isCorrect ? 1 : 0,
      record.mode,
      record.timeSpentSeconds,
    ],
  );
}

export async function getProgressForQuestion(
  questionId: string,
  mode?: string,
): Promise<ProgressRecord | null> {
  const db = getDatabase();
  const result = mode
    ? await db.execute(
        'SELECT * FROM user_progress WHERE question_id = ? AND mode = ? ORDER BY attempted_at DESC LIMIT 1',
        [questionId, mode],
      )
    : await db.execute(
        'SELECT * FROM user_progress WHERE question_id = ? ORDER BY attempted_at DESC LIMIT 1',
        [questionId],
      );

  const rows = result.rows as Array<Record<string, unknown>>;
  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    questionId: r.question_id as string,
    selectedAnswer: r.selected_answer as string,
    isCorrect: r.is_correct === 1,
    mode: r.mode as string,
    timeSpentSeconds: r.time_spent_seconds as number,
  };
}
