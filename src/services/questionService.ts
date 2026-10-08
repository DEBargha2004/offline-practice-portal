import type {
  Question,
  QuestionOption,
  Chapter,
  QuestionBankData,
  QuestionBankMetadata,
  QuestionType,
} from "@/types";
import rawData from "@/assets/chapter_wise_questions_data.json";
import weekRawData from "@/assets/week_wise_questions_data.json";

export interface QuestionBankEngine {
  getData(): QuestionBankData;
  getMetadata(): QuestionBankMetadata;
  getWeekMetadata(): QuestionBankMetadata;
  getAllChapters(): Chapter[];
  getChapter(chapterNumber: number): Chapter | undefined;
  getAllWeeks(): Chapter[];
  getWeek(weekNumber: number): Chapter | undefined;
  getQuestionById(id: string): Question | undefined;
  getQuestionsForChapter(chapterNumber: number): Question[];
  getQuestionsForWeek(weekNumber: number): Question[];
  getAllQuestions(): Question[];
  getAllWeekQuestions(): Question[];
  getAllQuestionsCombined(): Question[];
  getQuestionsByType(type: QuestionType): Question[];
  generateChapterQuestions(
    chapterNumber: number,
    randomize?: boolean,
    limit?: number
  ): Question[];
  generateWeekQuestions(
    weekNumber: number,
    randomize?: boolean,
    limit?: number
  ): Question[];
  generateFullMockQuestions(totalCount?: number): Question[];
  generateCustomQuestions(options: {
    types?: QuestionType[];
    chapterNumbers?: number[];
    weekNumbers?: number[];
    count?: number;
    randomize?: boolean;
  }): Question[];
}

/**
 * Detects whether a question contains options with referential or positional phrasing
 * (e.g. "Both (a) and (b)", "Both a and b", "All of the above", "None of these",
 * "Neither (a) nor (b)"). Shuffling these options would invalidate their referential meaning.
 */
export function hasReferentialOptions(question: Question): boolean {
  if (!question.options || question.options.length <= 1) {
    return false;
  }

  return question.options.some((opt) => {
    const text = opt.text.trim();

    if (
      /\bboth\s+(\([a-z0-9ivx]+\)|[a-z0-9ivx]\b|options?|statements?)\s*(and|&)/i.test(text) ||
      /\bboth\s+\([a-z0-9ivx]+\)/i.test(text) ||
      /\bboth\s+(of\s+)?(the\s+above|these|them)\b/i.test(text)
    ) {
      return true;
    }

    if (
      /\b(all|none|neither|either)\s+(of\s+)?(the\s+above|these|them|the\s+mentioned)\b/i.test(text) ||
      /\b(all|none)\s+(of\s+)?the\s+above\b/i.test(text)
    ) {
      return true;
    }

    if (
      /\b(neither|either)\s+(\([a-z0-9ivx]+\)|[a-z0-9ivx]\b)\s*(nor|or)/i.test(text)
    ) {
      return true;
    }

    if (/\bonly\s+(\([a-z0-9ivx]+\)|[a-z0-9ivx]\b)\s*(and|&)/i.test(text)) {
      return true;
    }

    return false;
  });
}

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Shuffles the options of an MCQ or MSQ question into randomized positions and re-indexes
 * their display labels (a, b, c, d...), preserving their stable IDs and updating
 * correct_answers to match the newly shuffled positions.
 * Questions with referential options (e.g. "Both (a) and (b)", "None of these") are kept in original order.
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (
    question.type === "True / False" ||
    question.options.length <= 1 ||
    hasReferentialOptions(question)
  ) {
    return {
      ...question,
      options: question.options.map((opt, idx) => ({
        id: opt.id || `${question.id}_${opt.label || idx}`,
        label: opt.label,
        text: opt.text,
      })),
    };
  }

  const correctOptionIds = new Set<string>();
  const correctOptionTexts = new Set<string>();

  question.options.forEach((opt, idx) => {
    const optId = opt.id || `${question.id}_${opt.label || idx}`;
    if (
      question.correct_answers.includes(opt.label) ||
      question.correct_answers.includes(optId) ||
      (question.answer_text && question.answer_text.includes(opt.text))
    ) {
      correctOptionIds.add(optId);
      correctOptionTexts.add(opt.text);
    }
  });

  const shuffledOptions = shuffleArray(question.options);
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const newOptions: QuestionOption[] = shuffledOptions.map((opt, index) => ({
    id: opt.id || `${question.id}_${opt.label || index}`,
    label: alphabet[index] || String.fromCharCode(97 + index),
    text: opt.text,
  }));

  const newCorrectAnswers: string[] = [];
  const newAnswerText: string[] = [];

  newOptions.forEach((opt) => {
    if (correctOptionIds.has(opt.id) || correctOptionTexts.has(opt.text)) {
      newCorrectAnswers.push(opt.label);
      newAnswerText.push(opt.text);
    }
  });

  return {
    ...question,
    options: newOptions,
    correct_answers: newCorrectAnswers,
    answer_text: newAnswerText,
  };
}

/**
 * Creates an in-memory, O(1) indexed QuestionBankEngine for any given question dataset.
 */
export function createQuestionBankEngine(
  data: QuestionBankData,
  weekData?: QuestionBankData
): QuestionBankEngine {
  const chapterBank: QuestionBankData = {
    ...data,
    chapters: [...(data.chapters || [])],
    questions: [...(data.questions || [])],
  };

  const weekBank: QuestionBankData = weekData
    ? {
        ...weekData,
        chapters: [...(weekData.chapters || [])],
        questions: [...(weekData.questions || [])],
      }
    : {
        metadata: {
          title: "Assignments",
          total_chapters: 0,
          total_questions: 0,
          question_types: {},
        },
        chapters: [],
        questions: [],
      };

  const questionMap = new Map<string, Question>();
  const chapterQuestionsMap = new Map<number, Question[]>();
  const weekQuestionsMap = new Map<number, Question[]>();

  const normalizeQuestion = (q: Question): Question => ({
    ...q,
    options: (q.options || []).map((opt, idx) => ({
      ...opt,
      id: opt.id || `${q.id}_${opt.label || idx}`,
    })),
  });

  chapterBank.questions = (chapterBank.questions || []).map(normalizeQuestion);
  for (const q of chapterBank.questions) {
    questionMap.set(q.id, q);
    const list = chapterQuestionsMap.get(q.chapter_number) || [];
    list.push(q);
    chapterQuestionsMap.set(q.chapter_number, list);
  }

  weekBank.questions = (weekBank.questions || []).map(normalizeQuestion);
  for (const q of weekBank.questions) {
    questionMap.set(q.id, q);
    const list = weekQuestionsMap.get(q.chapter_number) || [];
    list.push(q);
    weekQuestionsMap.set(q.chapter_number, list);
  }

  const getMetadata = (): QuestionBankMetadata => {
    const total = chapterBank.questions.length;
    const chaptersCount = chapterBank.chapters.length;
    const typesCount: Record<string, number> = {};
    for (const q of chapterBank.questions) {
      typesCount[q.type] = (typesCount[q.type] || 0) + 1;
    }
    return {
      ...chapterBank.metadata,
      total_chapters: chaptersCount,
      total_questions: total,
      question_types: typesCount,
    };
  };

  const getWeekMetadata = (): QuestionBankMetadata => {
    const total = weekBank.questions.length;
    const weeksCount = weekBank.chapters.length;
    const typesCount: Record<string, number> = {};
    for (const q of weekBank.questions) {
      typesCount[q.type] = (typesCount[q.type] || 0) + 1;
    }
    return {
      ...weekBank.metadata,
      total_chapters: weeksCount,
      total_questions: total,
      question_types: typesCount,
    };
  };

  const getAllChapters = (): Chapter[] => {
    return chapterBank.chapters.map((c) => ({
      ...c,
      question_count: chapterQuestionsMap.get(c.chapter_number)?.length ?? c.question_count,
    }));
  };

  const getChapter = (chapterNumber: number): Chapter | undefined => {
    const ch = chapterBank.chapters.find((c) => c.chapter_number === chapterNumber);
    if (!ch) return undefined;
    return {
      ...ch,
      question_count: chapterQuestionsMap.get(ch.chapter_number)?.length ?? ch.question_count,
    };
  };

  const getAllWeeks = (): Chapter[] => {
    return weekBank.chapters.map((w) => ({
      ...w,
      question_count: weekQuestionsMap.get(w.chapter_number)?.length ?? w.question_count,
    }));
  };

  const getWeek = (weekNumber: number): Chapter | undefined => {
    const wk = weekBank.chapters.find((c) => c.chapter_number === weekNumber);
    if (!wk) return undefined;
    return {
      ...wk,
      question_count: weekQuestionsMap.get(wk.chapter_number)?.length ?? wk.question_count,
    };
  };

  const getQuestionById = (id: string): Question | undefined => {
    return questionMap.get(id);
  };

  const getQuestionsForChapter = (chapterNumber: number): Question[] => {
    return chapterQuestionsMap.get(chapterNumber) || [];
  };

  const getQuestionsForWeek = (weekNumber: number): Question[] => {
    return weekQuestionsMap.get(weekNumber) || [];
  };

  const getAllQuestions = (): Question[] => chapterBank.questions;
  const getAllWeekQuestions = (): Question[] => weekBank.questions;

  const getAllQuestionsCombined = (): Question[] => [
    ...chapterBank.questions,
    ...weekBank.questions,
  ];

  const getQuestionsByType = (type: QuestionType): Question[] => {
    return getAllQuestionsCombined().filter((q) => q.type === type);
  };

  const generateChapterQuestions = (
    chapterNumber: number,
    randomize = true,
    limit?: number
  ): Question[] => {
    const questions = getQuestionsForChapter(chapterNumber);
    const list = randomize ? shuffleArray(questions) : [...questions];
    const sliced = limit ? list.slice(0, limit) : list;
    return sliced.map(shuffleQuestionOptions);
  };

  const generateWeekQuestions = (
    weekNumber: number,
    randomize = true,
    limit?: number
  ): Question[] => {
    const questions = getQuestionsForWeek(weekNumber);
    const list = randomize ? shuffleArray(questions) : [...questions];
    const sliced = limit ? list.slice(0, limit) : list;
    return sliced.map(shuffleQuestionOptions);
  };

  const generateFullMockQuestions = (totalCount = 100): Question[] => {
    const chapters = chapterBank.chapters;
    const pickedQuestions: Question[] = [];
    const pickedIds = new Set<string>();

    // 1. Pick at least 1 random question from each chapter to ensure syllabus coverage
    for (const ch of chapters) {
      const chQuestions = chapterQuestionsMap.get(ch.chapter_number) || [];
      if (chQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * chQuestions.length);
        const chosen = chQuestions[randomIndex];
        pickedQuestions.push(chosen);
        pickedIds.add(chosen.id);
      }
    }

    // 2. Pick additional questions evenly to reach totalCount
    const remainingPool = chapterBank.questions.filter((q) => !pickedIds.has(q.id));
    const shuffledRemaining = shuffleArray(remainingPool);

    const needed = Math.max(0, totalCount - pickedQuestions.length);
    for (let i = 0; i < needed && i < shuffledRemaining.length; i++) {
      pickedQuestions.push(shuffledRemaining[i]);
    }

    // 3. Shuffle final questions and randomize option positions
    return shuffleArray(pickedQuestions).map(shuffleQuestionOptions);
  };

  const generateCustomQuestions = (options: {
    types?: QuestionType[];
    chapterNumbers?: number[];
    weekNumbers?: number[];
    count?: number;
    randomize?: boolean;
  }): Question[] => {
    let pool: Question[];
    const hasChapters = Boolean(options.chapterNumbers && options.chapterNumbers.length > 0);
    const hasWeeks = Boolean(options.weekNumbers && options.weekNumbers.length > 0);

    if (hasChapters || hasWeeks) {
      pool = [];
      if (hasChapters) {
        const chSet = new Set(options.chapterNumbers);
        pool.push(...chapterBank.questions.filter((q) => chSet.has(q.chapter_number)));
      }
      if (hasWeeks) {
        const wkSet = new Set(options.weekNumbers);
        pool.push(...weekBank.questions.filter((q) => wkSet.has(q.chapter_number)));
      }
    } else {
      pool = getAllQuestionsCombined();
    }

    if (options.types && options.types.length > 0) {
      const typeSet = new Set(options.types);
      pool = pool.filter((q) => typeSet.has(q.type));
    }

    const list = options.randomize !== false ? shuffleArray(pool) : [...pool];
    const sliced = options.count ? list.slice(0, options.count) : list;
    return sliced.map(shuffleQuestionOptions);
  };

  return {
    getData: () => chapterBank,
    getMetadata,
    getWeekMetadata,
    getAllChapters,
    getChapter,
    getAllWeeks,
    getWeek,
    getQuestionById,
    getQuestionsForChapter,
    getQuestionsForWeek,
    getAllQuestions,
    getAllWeekQuestions,
    getAllQuestionsCombined,
    getQuestionsByType,
    generateChapterQuestions,
    generateWeekQuestions,
    generateFullMockQuestions,
    generateCustomQuestions,
  };
}

// ----------------------------------------------------
// Default Singleton QuestionBankEngine (Built-in IoT Portal)
// ----------------------------------------------------

export const defaultEngine: QuestionBankEngine = createQuestionBankEngine(
  rawData as unknown as QuestionBankData,
  weekRawData as unknown as QuestionBankData
);

export function initializeQuestionBank(): QuestionBankData {
  return defaultEngine.getData();
}

export function getMetadata(): QuestionBankMetadata {
  return defaultEngine.getMetadata();
}

export function getWeekMetadata(): QuestionBankMetadata {
  return defaultEngine.getWeekMetadata();
}

export function getAllChapters(): Chapter[] {
  return defaultEngine.getAllChapters();
}

export function getChapter(chapterNumber: number): Chapter | undefined {
  return defaultEngine.getChapter(chapterNumber);
}

export function getAllWeeks(): Chapter[] {
  return defaultEngine.getAllWeeks();
}

export function getWeek(weekNumber: number): Chapter | undefined {
  return defaultEngine.getWeek(weekNumber);
}

export function getQuestionById(id: string): Question | undefined {
  return defaultEngine.getQuestionById(id);
}

export function getQuestionsForChapter(chapterNumber: number): Question[] {
  return defaultEngine.getQuestionsForChapter(chapterNumber);
}

export function getQuestionsForWeek(weekNumber: number): Question[] {
  return defaultEngine.getQuestionsForWeek(weekNumber);
}

export function getAllQuestions(): Question[] {
  return defaultEngine.getAllQuestions();
}

export function getAllWeekQuestions(): Question[] {
  return defaultEngine.getAllWeekQuestions();
}

export function getAllQuestionsCombined(): Question[] {
  return defaultEngine.getAllQuestionsCombined();
}

export function getQuestionsByType(type: QuestionType): Question[] {
  return defaultEngine.getQuestionsByType(type);
}

export function generateChapterQuestions(
  chapterNumber: number,
  randomize = true,
  limit?: number
): Question[] {
  return defaultEngine.generateChapterQuestions(chapterNumber, randomize, limit);
}

export function generateWeekQuestions(
  weekNumber: number,
  randomize = true,
  limit?: number
): Question[] {
  return defaultEngine.generateWeekQuestions(weekNumber, randomize, limit);
}

export function generateFullMockQuestions(totalCount = 100): Question[] {
  return defaultEngine.generateFullMockQuestions(totalCount);
}

export function generateCustomQuestions(options: {
  types?: QuestionType[];
  chapterNumbers?: number[];
  weekNumbers?: number[];
  count?: number;
  randomize?: boolean;
}): Question[] {
  return defaultEngine.generateCustomQuestions(options);
}
