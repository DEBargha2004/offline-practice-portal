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

// In-memory singletons and indexed lookups for zero latency
let cachedData: QuestionBankData | null = null;
let cachedWeekData: QuestionBankData | null = null;
let questionMap: Map<string, Question> | null = null;
let chapterQuestionsMap: Map<number, Question[]> | null = null;
let weekQuestionsMap: Map<number, Question[]> | null = null;

export function initializeQuestionBank(): QuestionBankData {
  if (
    cachedData &&
    cachedWeekData &&
    questionMap &&
    chapterQuestionsMap &&
    weekQuestionsMap
  ) {
    return cachedData;
  }

  const typedData = rawData as unknown as QuestionBankData;
  const typedWeekData = weekRawData as unknown as QuestionBankData;
  cachedData = typedData;
  cachedWeekData = typedWeekData;

  // Build O(1) lookup map for ALL questions (chapter + week)
  questionMap = new Map<string, Question>();
  chapterQuestionsMap = new Map<number, Question[]>();
  weekQuestionsMap = new Map<number, Question[]>();

  // Helper to ensure each option has an immutable, unique id
  const normalizeQuestion = (q: Question): Question => ({
    ...q,
    options: (q.options || []).map((opt, idx) => ({
      ...opt,
      id: opt.id || `${q.id}_${opt.label || idx}`,
    })),
  });

  // Index 60 chapter questions
  typedData.questions = (typedData.questions || []).map(normalizeQuestion);
  for (const q of typedData.questions) {
    questionMap.set(q.id, q);

    const list = chapterQuestionsMap.get(q.chapter_number) || [];
    list.push(q);
    chapterQuestionsMap.set(q.chapter_number, list);
  }

  // Index 11 week questions
  typedWeekData.questions = (typedWeekData.questions || []).map(normalizeQuestion);
  for (const q of typedWeekData.questions) {
    questionMap.set(q.id, q);

    const list = weekQuestionsMap.get(q.chapter_number) || [];
    list.push(q);
    weekQuestionsMap.set(q.chapter_number, list);
  }

  return cachedData;
}

// Ensure initialized on module load
initializeQuestionBank();

export function getMetadata(): QuestionBankMetadata {
  return cachedData!.metadata;
}

export function getWeekMetadata(): QuestionBankMetadata {
  return cachedWeekData!.metadata;
}

export function getAllChapters(): Chapter[] {
  return cachedData!.chapters;
}

export function getChapter(chapterNumber: number): Chapter | undefined {
  return cachedData!.chapters.find((c) => c.chapter_number === chapterNumber);
}

export function getAllWeeks(): Chapter[] {
  return cachedWeekData!.chapters;
}

export function getWeek(weekNumber: number): Chapter | undefined {
  return cachedWeekData!.chapters.find((c) => c.chapter_number === weekNumber);
}

export function getQuestionById(id: string): Question | undefined {
  return questionMap?.get(id);
}

export function getQuestionsForChapter(chapterNumber: number): Question[] {
  return chapterQuestionsMap?.get(chapterNumber) || [];
}

export function getQuestionsForWeek(weekNumber: number): Question[] {
  return weekQuestionsMap?.get(weekNumber) || [];
}

export function getAllQuestions(): Question[] {
  return cachedData!.questions;
}

export function getAllWeekQuestions(): Question[] {
  return cachedWeekData!.questions;
}

export function getAllQuestionsCombined(): Question[] {
  if (!cachedData || !cachedWeekData) {
    initializeQuestionBank();
  }
  return [
    ...(cachedData?.questions || []),
    ...(cachedWeekData?.questions || []),
  ];
}

export function getQuestionsByType(type: QuestionType): Question[] {
  return getAllQuestionsCombined().filter((q) => q.type === type);
}

/**
 * Shuffles the options of an MCQ or MSQ question into randomized positions and re-indexes
 * their display labels (a, b, c, d...), preserving their stable IDs and updating
 * correct_answers to match the newly shuffled positions.
 */
export function shuffleQuestionOptions(question: Question): Question {
  // Do not shuffle True / False questions or questions with single/no options
  if (question.type === "True / False" || question.options.length <= 1) {
    return {
      ...question,
      options: question.options.map((opt, idx) => ({
        id: opt.id || `${question.id}_${opt.label || idx}`,
        label: opt.label,
        text: opt.text,
      })),
    };
  }

  // 1. Identify which options are correct in the input question
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

  // 2. Fisher-Yates shuffle the options
  const shuffledOptions = shuffleArray(question.options);
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  // 3. Re-assign display labels 'a', 'b', 'c', 'd' based on new index positions
  const newOptions: QuestionOption[] = shuffledOptions.map((opt, index) => ({
    id: opt.id || `${question.id}_${opt.label || index}`,
    label: alphabet[index] || String.fromCharCode(97 + index),
    text: opt.text,
  }));

  // 4. Update correct_answers and answer_text based on where the correct options moved
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
 * Generates a balanced 100-question full syllabus mock exam.
 * Takes questions across all 60 chapters to ensure wide course coverage,
 * then fills remainder with randomly selected questions from across the syllabus.
 * Options within each question are also placed in random positions.
 */
export function generateFullMockQuestions(totalCount = 100): Question[] {
  if (!chapterQuestionsMap || !cachedData) {
    initializeQuestionBank();
  }

  const chapters = cachedData!.chapters;
  const pickedQuestions: Question[] = [];
  const pickedIds = new Set<string>();

  // 1. Pick at least 1 random question from each chapter (guarantees all 60 chapters are covered)
  for (const ch of chapters) {
    const chQuestions = chapterQuestionsMap!.get(ch.chapter_number) || [];
    if (chQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * chQuestions.length);
      const chosen = chQuestions[randomIndex];
      pickedQuestions.push(chosen);
      pickedIds.add(chosen.id);
    }
  }

  // 2. Pick additional questions evenly to reach totalCount
  const remainingPool = cachedData!.questions.filter(
    (q) => !pickedIds.has(q.id),
  );
  const shuffledRemaining = shuffleArray(remainingPool);

  const needed = totalCount - pickedQuestions.length;
  for (let i = 0; i < needed && i < shuffledRemaining.length; i++) {
    pickedQuestions.push(shuffledRemaining[i]);
  }

  // 3. Shuffle final 100 questions so chapter order is thoroughly mixed,
  // and randomize option positions for each question
  return shuffleArray(pickedQuestions).map(shuffleQuestionOptions);
}

/**
 * Generates questions for a specific chapter with randomized option positions
 */
export function generateChapterQuestions(
  chapterNumber: number,
  randomize = true,
  limit?: number,
): Question[] {
  const questions = getQuestionsForChapter(chapterNumber);
  const list = randomize ? shuffleArray(questions) : [...questions];
  const sliced = limit ? list.slice(0, limit) : list;
  return sliced.map(shuffleQuestionOptions);
}

/**
 * Generates questions for a specific week assignment with randomized option positions
 */
export function generateWeekQuestions(
  weekNumber: number,
  randomize = true,
  limit?: number,
): Question[] {
  const questions = getQuestionsForWeek(weekNumber);
  const list = randomize ? shuffleArray(questions) : [...questions];
  const sliced = limit ? list.slice(0, limit) : list;
  return sliced.map(shuffleQuestionOptions);
}

/**
 * Generates custom practice questions with randomized option positions.
 * Combines both chapter questions and weekly assignment questions when targeting
 * question types (drills), or targets specified chapters (from cachedData).
 */
export function generateCustomQuestions(options: {
  types?: QuestionType[];
  chapterNumbers?: number[];
  weekNumbers?: number[];
  count?: number;
  randomize?: boolean;
}): Question[] {
  if (!cachedData || !cachedWeekData) {
    initializeQuestionBank();
  }

  let pool: Question[];

  if (options.chapterNumbers && options.chapterNumbers.length > 0) {
    const chSet = new Set(options.chapterNumbers);
    pool = cachedData!.questions.filter((q) => chSet.has(q.chapter_number));
  } else if (options.weekNumbers && options.weekNumbers.length > 0) {
    const wkSet = new Set(options.weekNumbers);
    pool = cachedWeekData!.questions.filter((q) => wkSet.has(q.chapter_number));
  } else {
    // When no specific chapters or weeks are requested (e.g. question type drills, mixed drills),
    // combine both chapter questions and weekly assignment questions
    pool = getAllQuestionsCombined();
  }

  if (options.types && options.types.length > 0) {
    const typeSet = new Set(options.types);
    pool = pool.filter((q) => typeSet.has(q.type));
  }

  const list = options.randomize !== false ? shuffleArray(pool) : [...pool];
  const sliced = options.count ? list.slice(0, options.count) : list;
  return sliced.map(shuffleQuestionOptions);
}
