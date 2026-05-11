// ─────────────────────────────────────────
// NATURAL SCIENCE STREAM SUBJECTS
// ─────────────────────────────────────────
export enum SubjectNatural {
  MathsNatural = 'Maths Natural',
  Physics = 'Physics',
  Chemistry = 'Chemistry',
  Biology = 'Biology',
}

export const SUBJECTS_NATURAL = Object.values(SubjectNatural) as SubjectNatural[];

// ─────────────────────────────────────────
// SOCIAL SCIENCE STREAM SUBJECTS
// ─────────────────────────────────────────
export enum SubjectSocial {
  MathsSocial = 'Maths Social',
  History = 'History',
  Geography = 'Geography',
  Economics = 'Economics',
}

export const SUBJECTS_SOCIAL = Object.values(SubjectSocial) as SubjectSocial[];

// ─────────────────────────────────────────
// SHARED SUBJECTS (appear in BOTH streams — stored ONCE)
// ─────────────────────────────────────────
export enum SharedSubject {
  English = 'English',
  Aptitude = 'Aptitude',
}

export const SHARED_SUBJECTS = Object.values(SharedSubject) as SharedSubject[];

export function isSharedSubject(subject: string): boolean {
  return SHARED_SUBJECTS.includes(subject as SharedSubject);
}

// ─────────────────────────────────────────
// ALL SUBJECTS (for UI dropdowns / validation)
// ─────────────────────────────────────────
export const ALL_SUBJECTS = [
  ...SUBJECTS_NATURAL,
  ...SUBJECTS_SOCIAL,
  ...SHARED_SUBJECTS,
] as const;

// ─────────────────────────────────────────
// YEARS (EC — only what exists now)
// ─────────────────────────────────────────
export const YEARS = [2014, 2015, 2016, 2017, 2018] as const;
export type Year = (typeof YEARS)[number];

// 2019+ placeholder for future activation
export const UPCOMING_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

// ─────────────────────────────────────────
// CHAPTERS — vary by subject/grade: ANY integer 1-16
// ─────────────────────────────────────────
export const MIN_CHAPTER = 1;
export const MAX_CHAPTER = 16;

export const CHAPTERS = Array.from(
  { length: MAX_CHAPTER },
  (_, i) => i + 1,
) as [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export type Chapter = (typeof CHAPTERS)[number];

// ─────────────────────────────────────────
// MODES
// ─────────────────────────────────────────
export enum Mode {
  Practice = 'practice',
  Exam = 'exam',
}

export const MODES = Object.values(Mode) as Mode[];
