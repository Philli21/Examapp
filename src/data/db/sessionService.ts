import { getDatabase } from './dbService';

export interface ExamSession {
  id: number;
  stream: string | null;
  subject: string;
  year: number | null;
  mode: string;
  started_at: string;
  finished_at: string | null;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  score_percentage: number | null;
}

export async function createSession(data: {
  stream: string | null;
  subject: string;
  year: number | null;
  mode: string;
  total_questions: number;
}): Promise<number> {
  const db = getDatabase();
  const result = await db.execute(
    `INSERT INTO exam_sessions (stream, subject, year, mode, total_questions)
     VALUES (?, ?, ?, ?, ?)`,
    [data.stream, data.subject, data.year, data.mode, data.total_questions],
  );
  return result.insertId as number;
}

export async function updateSession(
  sessionId: number,
  data: {
    correct_count: number;
    wrong_count: number;
    skipped_count: number;
    finished_at?: string;
  },
): Promise<void> {
  const db = getDatabase();
  const total = data.correct_count + data.wrong_count + data.skipped_count;
  const percentage = total > 0 ? Math.round((data.correct_count / total) * 100) : 0;

  if (data.finished_at) {
    await db.execute(
      `UPDATE exam_sessions
       SET correct_count = ?, wrong_count = ?, skipped_count = ?,
           score_percentage = ?, finished_at = ?
       WHERE id = ?`,
      [data.correct_count, data.wrong_count, data.skipped_count, percentage, data.finished_at, sessionId],
    );
  } else {
    await db.execute(
      `UPDATE exam_sessions
       SET correct_count = ?, wrong_count = ?, skipped_count = ?, score_percentage = ?
       WHERE id = ?`,
      [data.correct_count, data.wrong_count, data.skipped_count, percentage, sessionId],
    );
  }
}

export async function getSession(sessionId: number): Promise<ExamSession | null> {
  const db = getDatabase();
  const result = await db.execute('SELECT * FROM exam_sessions WHERE id = ?', [sessionId]);
  const rows = result.rows as Array<Record<string, unknown>>;
  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    id: r.id as number,
    stream: r.stream as string | null,
    subject: r.subject as string,
    year: r.year as number | null,
    mode: r.mode as string,
    started_at: r.started_at as string,
    finished_at: r.finished_at as string | null,
    total_questions: r.total_questions as number,
    correct_count: r.correct_count as number,
    wrong_count: r.wrong_count as number,
    skipped_count: r.skipped_count as number,
    score_percentage: r.score_percentage as number | null,
  };
}
