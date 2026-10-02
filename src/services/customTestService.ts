import type { ChapterRangePreset, CustomTestConfig, TestSession } from "@/types";
import { generateCustomQuestions } from "./questionService";

export const DEFAULT_DURATION_PRESETS: readonly number[] = [15, 30, 45, 60, 90, 120];

export const QUESTION_LIMIT_PRESETS: readonly { label: string; value: number | null }[] = [
  { label: "All Questions", value: null },
  { label: "20 Qs", value: 20 },
  { label: "30 Qs", value: 30 },
  { label: "50 Qs", value: 50 },
  { label: "100 Qs", value: 100 },
];

export const CHAPTER_RANGE_PRESETS: readonly ChapterRangePreset[] = [
  { label: "Ch 1–15", from: 1, to: 15 },
  { label: "Ch 16–30", from: 16, to: 30 },
  { label: "Ch 31–45", from: 31, to: 45 },
  { label: "Ch 46–60", from: 46, to: 60 },
];

/**
 * Strips redundant prefixes like "Chapter 1: " from raw chapter titles
 */
export function formatChapterTitle(rawTitle: string): string {
  return rawTitle.replace(/^Chapter\s+\d+:\s*/i, "").trim();
}

/**
 * Builds a validated TestSession object ready for persistent execution
 */
export function buildCustomTestSession(
  config: CustomTestConfig,
  totalAvailableChaptersCount: number
): TestSession | null {
  if (config.chapterNumbers.length === 0) {
    return null;
  }

  const questions = generateCustomQuestions({
    chapterNumbers: config.chapterNumbers,
    count: config.questionCountLimit ?? undefined,
    randomize: true,
  });

  if (questions.length === 0) {
    return null;
  }

  const isAllChapters = config.chapterNumbers.length === totalAvailableChaptersCount;
  const title = isAllChapters
    ? `Custom Test: All Chapters (${questions.length} Qs)`
    : `Custom Test (${config.chapterNumbers.length} ${
        config.chapterNumbers.length === 1 ? "Chapter" : "Chapters"
      }, ${questions.length} Qs)`;

  return {
    id: `session_custom_${Date.now()}`,
    title,
    mode: "custom",
    startedAt: Date.now(),
    timeLimitSeconds: config.durationMinutes ? config.durationMinutes * 60 : null,
    elapsedSeconds: 0,
    isCompleted: false,
    questionIds: questions.map((q) => q.id),
    questions,
    userAnswers: {},
    flaggedQuestionIds: [],
    currentQuestionIndex: 0,
  };
}
