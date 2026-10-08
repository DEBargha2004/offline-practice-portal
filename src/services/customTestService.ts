import type {
  ChapterRangePreset,
  CustomTestConfig,
  TestSession,
  Question,
} from "@/types";
import { generateCustomQuestions } from "./questionService";

export const DEFAULT_DURATION_PRESETS: readonly number[] = [
  15, 30, 45, 60, 90, 120,
];

export const QUESTION_LIMIT_PRESETS: readonly {
  label: string;
  value: number | null;
}[] = [
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

export const WEEK_RANGE_PRESETS: readonly ChapterRangePreset[] = [
  { label: "Weeks 1–6", from: 1, to: 6 },
  { label: "Weeks 7–12", from: 7, to: 12 },
];

/**
 * Computes balanced chapter range presets based on total chapters count
 */
export function generateChapterRangePresets(totalChapters: number): ChapterRangePreset[] {
  if (totalChapters <= 1) return [];
  if (totalChapters <= 10) {
    const half = Math.ceil(totalChapters / 2);
    return [
      { label: `Ch 1–${half}`, from: 1, to: half },
      { label: `Ch ${half + 1}–${totalChapters}`, from: half + 1, to: totalChapters },
    ];
  }
  if (totalChapters <= 30) {
    const step = 10;
    const presets: ChapterRangePreset[] = [];
    for (let i = 1; i <= totalChapters; i += step) {
      const end = Math.min(i + step - 1, totalChapters);
      presets.push({ label: `Ch ${i}–${end}`, from: i, to: end });
    }
    return presets;
  }
  // Default 15-chapter chunking
  const step = 15;
  const presets: ChapterRangePreset[] = [];
  for (let i = 1; i <= totalChapters; i += step) {
    const end = Math.min(i + step - 1, totalChapters);
    presets.push({ label: `Ch ${i}–${end}`, from: i, to: end });
  }
  return presets;
}

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
  totalAvailableChaptersCount: number,
  totalAvailableWeeksCount = 0,
  generateQuestionsFn: (options: {
    chapterNumbers?: number[];
    weekNumbers?: number[];
    count?: number;
    randomize?: boolean;
  }) => Question[] = generateCustomQuestions,
  moduleId?: string,
): TestSession | null {
  const chapterCount = config.chapterNumbers?.length || 0;
  const weekCount = config.weekNumbers?.length || 0;

  if (chapterCount === 0 && weekCount === 0) {
    return null;
  }

  const questions = generateQuestionsFn({
    chapterNumbers: config.chapterNumbers,
    weekNumbers: config.weekNumbers,
    count: config.questionCountLimit ?? undefined,
    randomize: true,
  });

  if (questions.length === 0) {
    return null;
  }

  let title: string;
  if (chapterCount > 0 && weekCount === 0) {
    const isAllChapters = chapterCount === totalAvailableChaptersCount;
    title = isAllChapters
      ? `Custom Test: All Chapters (${questions.length} Qs)`
      : `Custom Test (${chapterCount} ${
          chapterCount === 1 ? "Chapter" : "Chapters"
        }, ${questions.length} Qs)`;
  } else if (chapterCount === 0 && weekCount > 0) {
    const isAllWeeks = totalAvailableWeeksCount
      ? weekCount === totalAvailableWeeksCount
      : false;
    title = isAllWeeks
      ? `Custom Test: All Weeks (${questions.length} Qs)`
      : `Custom Test (${weekCount} ${
          weekCount === 1 ? "Week" : "Weeks"
        }, ${questions.length} Qs)`;
  } else {
    title = `Custom Test (${chapterCount} ${
      chapterCount === 1 ? "Ch" : "Chs"
    } + ${weekCount} ${
      weekCount === 1 ? "Wk" : "Wks"
    }, ${questions.length} Qs)`;
  }

  return {
    id: `session_custom_${Date.now()}`,
    moduleId,
    title,
    mode: "custom",
    startedAt: Date.now(),
    timeLimitSeconds: config.durationMinutes
      ? config.durationMinutes * 60
      : null,
    elapsedSeconds: 0,
    isCompleted: false,
    questionIds: questions.map((q) => q.id),
    questions,
    userAnswers: {},
    flaggedQuestionIds: [],
    currentQuestionIndex: 0,
  };
}
