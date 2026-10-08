export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export type QuestionType = "MCQ" | "MSQ" | "True / False";

export interface Question {
  id: string;
  chapter_number: number;
  chapter_title: string;
  question_number: number;
  type: QuestionType;
  is_multiple_choice: boolean;
  points: number;
  question: string;
  code_snippet: string | null;
  options: QuestionOption[];
  correct_answers: string[];
  answer_text: string[];
  raw_stem?: string;
  raw_options?: Record<string, string>;
  raw_answer?: string;
}

export interface Chapter {
  chapter_number: number;
  chapter_title: string;
  file: string;
  question_count: number;
}

export interface QuestionBankMetadata {
  title: string;
  total_chapters: number;
  total_questions: number;
  question_types: Record<string, number>;
}

export interface QuestionBankData {
  metadata: QuestionBankMetadata;
  chapters: Chapter[];
  questions: Question[];
}

export type TestModeType = "full_mock" | "chapter" | "week" | "custom";

export interface TestSession {
  id: string;
  moduleId?: string;
  title: string;
  mode: TestModeType;
  chapterNumber?: number;
  weekNumber?: number;
  startedAt: number;
  timeLimitSeconds: number | null; // null if untimed
  elapsedSeconds: number;
  isCompleted: boolean;
  questionIds: string[];
  questions?: Question[]; // Shuffled question instances with randomized options for this test
  userAnswers: Record<string, string[]>; // questionId -> array of option labels e.g. ["a"] or ["a", "c"]
  flaggedQuestionIds: string[];
  currentQuestionIndex: number;
}

export interface RevisionSession {
  id: string;
  moduleId?: string;
  title: string;
  mode: "chapter" | "week";
  chapterNumber?: number;
  weekNumber?: number;
  startedAt: number;
  elapsedSeconds: number;
  questionIds: string[];
  questions?: Question[];
  userAnswers: Record<string, string[]>;
  flaggedQuestionIds: string[];
  currentQuestionIndex: number;
  showAnswers?: boolean;
}

export interface QuestionReviewItem {
  question: Question;
  selectedAnswers: string[];
  isCorrect: boolean;
  isSkipped: boolean;
  isPartiallyCorrect?: boolean;
  earnedPoints: number;
}

export interface TestAttemptResult {
  id: string;
  moduleId?: string;
  sessionId: string;
  title: string;
  mode: TestModeType;
  chapterNumber?: number;
  chapterTitle?: string;
  weekNumber?: number;
  weekTitle?: string;
  startedAt: number;
  completedAt: number;
  timeSpentSeconds: number;
  timeLimitSeconds: number | null;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  reviewItems: QuestionReviewItem[];
}

export interface CustomTestConfig {
  chapterNumbers: number[];
  weekNumbers?: number[];
  durationMinutes: number | null;
  questionCountLimit: number | null;
}

export interface ChapterRangePreset {
  label: string;
  from: number;
  to: number;
}

export interface CustomModuleRecord {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  chapterCount: number;
  questionCount: number;
  data: QuestionBankData;
}
