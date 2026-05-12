import { getDatabase } from './dbService';
import { isSharedSubject } from '@/src/core/config/constants';

export interface Option {
  id: number;
  question_id: string;
  label: string;
  option_text: string;
  is_correct: number;
}

export interface Question {
  id: string;
  grade: number;
  stream: string;
  subject: string;
  year: number;
  chapter: number;
  difficulty: string | null;
  time_limit_sec: number;
  question_text: string;
  question_images_json: string;
  explanation_text: string | null;
  explanation_images_json: string;
  source_type: string | null;
  source_name: string | null;
  competency: string | null;
  tags_json: string;
  package_id: string;
  created_at: string;
  options?: Option[];
}

export interface QuestionFilters {
  stream: 'natural' | 'social';
  subject: string;
  year: number;
  chapter?: number;
}

function mapRowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    grade: row.grade as number,
    stream: row.stream as string,
    subject: row.subject as string,
    year: row.year as number,
    chapter: row.chapter as number,
    difficulty: row.difficulty as string | null,
    time_limit_sec: row.time_limit_sec as number,
    question_text: row.question_text as string,
    question_images_json: row.question_images_json as string,
    explanation_text: row.explanation_text as string | null,
    explanation_images_json: row.explanation_images_json as string,
    source_type: row.source_type as string | null,
    source_name: row.source_name as string | null,
    competency: row.competency as string | null,
    tags_json: row.tags_json as string,
    package_id: row.package_id as string,
    created_at: row.created_at as string,
  };
}

function buildQueryAndParams(filters: QuestionFilters): {
  sql: string;
  params: (string | number)[];
} {
  const shared = isSharedSubject(filters.subject);

  let sql = 'SELECT * FROM questions WHERE subject = ? AND year = ?';
  const params: (string | number)[] = [filters.subject, filters.year];

  if (!shared) {
    sql += ' AND stream = ?';
    params.push(filters.stream);
  }

  if (filters.chapter != null) {
    sql += ' AND chapter = ?';
    params.push(filters.chapter);
  }

  return { sql, params };
}

export async function getQuestions(filters: QuestionFilters): Promise<Question[]> {
  const db = getDatabase();

  try {
    const { sql, params } = buildQueryAndParams(filters);
    const orderedSql = `${sql} ORDER BY RANDOM()`;

    const result = await db.execute(orderedSql, params);
    const rows = result.rows as Array<Record<string, unknown>>;

    return rows.map(mapRowToQuestion);
  } catch (error) {
    throw new Error(
      `Failed to fetch questions: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getQuestionCount(filters: QuestionFilters): Promise<number> {
  const db = getDatabase();

  try {
    const { sql, params } = buildQueryAndParams(filters);
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');

    const result = await db.execute(countSql, params);
    const row = (result.rows as Array<{ count: number }>)[0];

    return row.count;
  } catch (error) {
    throw new Error(
      `Failed to count questions: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function checkQuestionsExist(filters: QuestionFilters): Promise<boolean> {
  try {
    const count = await getQuestionCount(filters);
    return count > 0;
  } catch {
    return false;
  }
}

export async function getQuestionsWithOptions(filters: QuestionFilters): Promise<Question[]> {
  const questions = await getQuestions(filters);
  if (questions.length === 0) return questions;

  const db = getDatabase();
  const ids = questions.map((q) => q.id);
  const placeholders = ids.map(() => '?').join(', ');

  const result = await db.execute(
    `SELECT * FROM options WHERE question_id IN (${placeholders}) ORDER BY question_id, label`,
    ids,
  );

  const rows = result.rows as Array<Record<string, unknown>>;
  const optionsMap = new Map<string, Option[]>();

  for (const row of rows) {
    const option: Option = {
      id: row.id as number,
      question_id: row.question_id as string,
      label: row.label as string,
      option_text: row.option_text as string,
      is_correct: row.is_correct as number,
    };
    const list = optionsMap.get(option.question_id) ?? [];
    list.push(option);
    optionsMap.set(option.question_id, list);
  }

  return questions.map((q) => ({ ...q, options: optionsMap.get(q.id) ?? [] }));
}
