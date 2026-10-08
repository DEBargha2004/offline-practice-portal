import { createContext } from "react";
import type {
  CustomModuleRecord,
  QuestionBankMetadata,
  Chapter,
  Question,
  TestSession,
  RevisionSession,
  TestAttemptResult,
  QuestionType,
} from "@/types";
import type { QuestionBankEngine } from "@/services/questionService";

export interface ModuleContextValue {
  moduleId: string | null;
  isCustomModule: boolean;
  moduleRecord: CustomModuleRecord | null;
  moduleLoading: boolean;
  moduleError: string | null;
  basePath: string; // e.g. "" for built-in or "/module/:moduleId"
  engine: QuestionBankEngine;

  // Shortcuts to engine operations
  getMetadata: () => QuestionBankMetadata;
  getWeekMetadata: () => QuestionBankMetadata;
  getAllChapters: () => Chapter[];
  getChapter: (chapterNumber: number) => Chapter | undefined;
  getAllWeeks: () => Chapter[];
  getWeek: (weekNumber: number) => Chapter | undefined;
  getQuestionById: (id: string) => Question | undefined;
  getQuestionsForChapter: (chapterNumber: number) => Question[];
  getQuestionsForWeek: (weekNumber: number) => Question[];
  getAllQuestions: () => Question[];
  getAllWeekQuestions: () => Question[];
  getAllQuestionsCombined: () => Question[];
  getQuestionsByType: (type: QuestionType) => Question[];
  generateChapterQuestions: (chapterNumber: number, randomize?: boolean, limit?: number) => Question[];
  generateWeekQuestions: (weekNumber: number, randomize?: boolean, limit?: number) => Question[];
  generateFullMockQuestions: (totalCount?: number) => Question[];
  generateCustomQuestions: (options: {
    types?: QuestionType[];
    chapterNumbers?: number[];
    weekNumbers?: number[];
    count?: number;
    randomize?: boolean;
  }) => Question[];

  // Scoped storage helpers
  getActiveSession: () => TestSession | null;
  saveActiveSession: (session: TestSession) => void;
  clearActiveSession: () => void;
  getActiveRevisionSession: () => RevisionSession | null;
  saveActiveRevisionSession: (session: RevisionSession) => void;
  clearActiveRevisionSession: () => void;
  getAllAttempts: () => Promise<TestAttemptResult[]>;
  saveAttempt: (attempt: TestAttemptResult) => Promise<void>;
  clearAllAttempts: () => Promise<void>;
  getBookmarks: () => string[];
  toggleBookmark: (questionId: string) => boolean;
  isBookmarked: (questionId: string) => boolean;
}

export const ModuleContext = createContext<ModuleContextValue | null>(null);
