import type {
  QuestionBankData,
  Question,
  Chapter,
  QuestionOption,
  CustomModuleRecord,
  QuestionType,
} from "@/types";
import { openDatabase, STORE_CUSTOM_MODULES } from "./storageService";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedData?: QuestionBankData;
}

/**
 * Creates a URL-friendly slug from a title string
 */
export function createSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `module-${Date.now().toString(36)}`;
}

/**
 * Validates and normalizes raw JSON data into a strictly typed QuestionBankData object.
 * Auto-repairs missing chapter lists, missing option IDs, raw_options, and metadata.
 */
export function validateQuestionBankData(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      isValid: false,
      errors: ["Input data must be a valid JSON object."],
      warnings,
    };
  }

  const raw = input as Record<string, unknown>;

  // Check questions array
  if (!raw.questions || !Array.isArray(raw.questions)) {
    return {
      isValid: false,
      errors: ["The JSON file is missing the 'questions' array."],
      warnings,
    };
  }

  if (raw.questions.length === 0) {
    return {
      isValid: false,
      errors: ["The 'questions' array cannot be empty."],
      warnings,
    };
  }

  const normalizedQuestions: Question[] = [];
  const chaptersMap = new Map<number, { title: string; count: number }>();
  const questionTypesCount: Record<string, number> = {};

  for (let idx = 0; idx < raw.questions.length; idx++) {
    const qRaw = raw.questions[idx] as Record<string, unknown>;
    const qIndexStr = `Question #${idx + 1}`;

    if (!qRaw || typeof qRaw !== "object") {
      errors.push(`${qIndexStr} is invalid.`);
      continue;
    }

    // Question stem
    const questionText = (
      qRaw.question ||
      qRaw.raw_stem ||
      qRaw.stem ||
      ""
    ).toString().trim();
    if (!questionText) {
      errors.push(`${qIndexStr} has empty or missing question text.`);
      continue;
    }

    // Chapter number & title
    const chapterNumber =
      typeof qRaw.chapter_number === "number" && !isNaN(qRaw.chapter_number)
        ? qRaw.chapter_number
        : parseInt(String(qRaw.chapter_number || 1), 10) || 1;

    const chapterTitle: string =
      (qRaw.chapter_title ? String(qRaw.chapter_title).trim() : "") ||
      `Chapter ${chapterNumber}`;

    // Options normalization
    let options: QuestionOption[] = [];
    if (Array.isArray(qRaw.options)) {
      options = qRaw.options.map((opt: unknown, oIdx: number) => {
        if (opt && typeof opt === "object") {
          const optObj = opt as Record<string, unknown>;
          const label = String(
            optObj.label || String.fromCharCode(97 + oIdx)
          ).trim();
          const text = String(optObj.text || "").trim();
          const id =
            optObj.id ? String(optObj.id) : `q_${idx + 1}_opt_${label}`;
          return { id, label, text };
        }
        return {
          id: `q_${idx + 1}_opt_${oIdx}`,
          label: String.fromCharCode(97 + oIdx),
          text: String(opt || "").trim(),
        };
      });
    } else if (qRaw.raw_options && typeof qRaw.raw_options === "object") {
      // Auto-convert raw_options: { a: "...", b: "..." }
      const rawOptMap = qRaw.raw_options as Record<string, unknown>;
      options = Object.entries(rawOptMap).map(([lbl, txt]) => ({
        id: `q_${idx + 1}_opt_${lbl}`,
        label: lbl,
        text: String(txt || "").trim(),
      }));
    }

    if (options.length < 2) {
      errors.push(
        `${qIndexStr} must have at least 2 options (found ${options.length}).`
      );
      continue;
    }

    // Correct answers normalization
    let correctAnswers: string[] = [];
    if (Array.isArray(qRaw.correct_answers)) {
      correctAnswers = qRaw.correct_answers.map((ans) =>
        String(ans).trim().toLowerCase()
      );
    } else if (typeof qRaw.correct_answers === "string") {
      correctAnswers = [qRaw.correct_answers.trim().toLowerCase()];
    } else if (qRaw.raw_answer && typeof qRaw.raw_answer === "string") {
      const match = qRaw.raw_answer.match(/[a-zA-Z]/g);
      if (match) {
        correctAnswers = match.map((m) => m.toLowerCase());
      }
    }

    if (correctAnswers.length === 0) {
      warnings.push(
        `${qIndexStr} has no detected correct answers; defaulting to first option ('${options[0].label}').`
      );
      correctAnswers = [options[0].label.toLowerCase()];
    }

    // Type detection
    let qType: QuestionType = "MCQ";
    const rawType = String(qRaw.type || "").toUpperCase();
    if (rawType.includes("MSQ") || correctAnswers.length > 1) {
      qType = "MSQ";
    } else if (
      rawType.includes("TRUE") ||
      rawType.includes("FALSE") ||
      (options.length === 2 &&
        options.some((o) => /true/i.test(o.text)) &&
        options.some((o) => /false/i.test(o.text)))
    ) {
      qType = "True / False";
    }

    questionTypesCount[qType] = (questionTypesCount[qType] || 0) + 1;

    // Answer text array
    const answerText: string[] = options
      .filter((o) => correctAnswers.includes(o.label.toLowerCase()))
      .map((o) => o.text);

    const questionId =
      qRaw.id && String(qRaw.id).trim()
        ? String(qRaw.id).trim()
        : `q_${idx + 1}`;

    const normalizedQ: Question = {
      id: questionId,
      chapter_number: chapterNumber,
      chapter_title: chapterTitle,
      question_number:
        typeof qRaw.question_number === "number"
          ? qRaw.question_number
          : idx + 1,
      type: qType,
      is_multiple_choice: qType === "MSQ",
      points: typeof qRaw.points === "number" && !isNaN(qRaw.points) ? qRaw.points : 1,
      question: questionText,
      code_snippet: qRaw.code_snippet ? String(qRaw.code_snippet) : null,
      options,
      correct_answers: correctAnswers,
      answer_text: answerText.length > 0 ? answerText : [options[0]?.text || ""],
      raw_stem: typeof qRaw.raw_stem === "string" ? qRaw.raw_stem : undefined,
      raw_options:
        typeof qRaw.raw_options === "object" && qRaw.raw_options !== null
          ? (qRaw.raw_options as Record<string, string>)
          : undefined,
      raw_answer: typeof qRaw.raw_answer === "string" ? qRaw.raw_answer : undefined,
    };

    normalizedQuestions.push(normalizedQ);

    // Track chapter counts
    const chEntry = chaptersMap.get(chapterNumber) || {
      title: chapterTitle,
      count: 0,
    };
    chEntry.count++;
    chaptersMap.set(chapterNumber, chEntry);
  }

  if (errors.length > 0 && normalizedQuestions.length === 0) {
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // Chapters list reconstruction/validation
  let chapters: Chapter[];
  if (Array.isArray(raw.chapters) && raw.chapters.length > 0) {
    chapters = raw.chapters.map((chRaw: unknown) => {
      const chObj = chRaw as Record<string, unknown>;
      const num =
        typeof chObj.chapter_number === "number"
          ? chObj.chapter_number
          : parseInt(String(chObj.chapter_number || 1), 10) || 1;
      const title: string =
        (chObj.chapter_title ? String(chObj.chapter_title).trim() : "") ||
        `Chapter ${num}`;
      const actualCount = chaptersMap.get(num)?.count || 0;
      return {
        chapter_number: num,
        chapter_title: title,
        file: typeof chObj.file === "string" ? chObj.file : `chapter_${num}.json`,
        question_count: actualCount || Number(chObj.question_count) || 0,
      };
    });
  } else {
    // Automatically construct chapters from questions
    const sortedNums = Array.from(chaptersMap.keys()).sort((a, b) => a - b);
    chapters = sortedNums.map((num) => {
      const info = chaptersMap.get(num)!;
      return {
        chapter_number: num,
        chapter_title: info.title,
        file: `chapter_${num}.json`,
        question_count: info.count,
      };
    });
    warnings.push("Chapters catalog was auto-generated from question entries.");
  }

  const rawMeta = (raw.metadata || {}) as Record<string, unknown>;
  const title: string =
    (rawMeta.title ? String(rawMeta.title).trim() : "") || "Custom Question Bank";

  const normalizedData: QuestionBankData = {
    metadata: {
      title,
      total_chapters: chapters.length,
      total_questions: normalizedQuestions.length,
      question_types: questionTypesCount,
    },
    chapters,
    questions: normalizedQuestions,
  };

  return {
    isValid: true,
    errors,
    warnings,
    normalizedData,
  };
}

/**
 * Saves a custom module to IndexedDB
 */
export async function saveCustomModule(
  data: QuestionBankData,
  title?: string,
  description?: string,
  preferredId?: string
): Promise<CustomModuleRecord> {
  const finalTitle = title || data.metadata.title || "Custom Module";
  const id = preferredId || `${createSlug(finalTitle)}-${Date.now().toString(36).slice(-4)}`;
  const now = Date.now();

  const record: CustomModuleRecord = {
    id,
    title: finalTitle,
    description: description || undefined,
    createdAt: now,
    updatedAt: now,
    chapterCount: data.chapters.length,
    questionCount: data.questions.length,
    data: {
      ...data,
      metadata: {
        ...data.metadata,
        title: finalTitle,
      },
    },
  };

  const db = await openDatabase();
  return new Promise<CustomModuleRecord>((resolve, reject) => {
    const tx = db.transaction(STORE_CUSTOM_MODULES, "readwrite");
    const store = tx.objectStore(STORE_CUSTOM_MODULES);
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all installed custom modules from IndexedDB
 */
export async function getAllCustomModules(): Promise<CustomModuleRecord[]> {
  try {
    const db = await openDatabase();
    return await new Promise<CustomModuleRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_CUSTOM_MODULES, "readonly");
      const store = tx.objectStore(STORE_CUSTOM_MODULES);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result as CustomModuleRecord[]) || [];
        records.sort((a, b) => b.createdAt - a.createdAt);
        resolve(records);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get custom modules from IndexedDB", err);
    return [];
  }
}

/**
 * Retrieves a single custom module by its ID
 */
export async function getCustomModuleById(
  id: string
): Promise<CustomModuleRecord | null> {
  try {
    const db = await openDatabase();
    return await new Promise<CustomModuleRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_CUSTOM_MODULES, "readonly");
      const store = tx.objectStore(STORE_CUSTOM_MODULES);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve((req.result as CustomModuleRecord) || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Failed to get custom module #${id}`, err);
    return null;
  }
}

/**
 * Deletes a custom module from IndexedDB
 */
export async function deleteCustomModule(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_CUSTOM_MODULES, "readwrite");
    const store = tx.objectStore(STORE_CUSTOM_MODULES);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Triggers a client-side download of the custom module JSON
 */
export function exportCustomModule(record: CustomModuleRecord): void {
  const jsonStr = JSON.stringify(record.data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${record.id}_questions_data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates sample valid JSON template for questions_data.json
 */
export function generateSampleQuestionBankJson(): string {
  const sample: QuestionBankData = {
    metadata: {
      title: "Sample Computer Networks - Question Bank",
      total_chapters: 2,
      total_questions: 4,
      question_types: {
        MCQ: 2,
        MSQ: 1,
        "True / False": 1,
      },
    },
    chapters: [
      {
        chapter_number: 1,
        chapter_title: "Chapter 1: Network Layer & IP Addressing",
        file: "chapter_1.json",
        question_count: 2,
      },
      {
        chapter_number: 2,
        chapter_title: "Chapter 2: Routing Protocols & Algorithms",
        file: "chapter_2.json",
        question_count: 2,
      },
    ],
    questions: [
      {
        id: "cn_ch1_q1",
        chapter_number: 1,
        chapter_title: "Chapter 1: Network Layer & IP Addressing",
        question_number: 1,
        type: "MCQ",
        is_multiple_choice: false,
        points: 1,
        question: "What is the primary function of the Network Layer in the OSI reference model?",
        code_snippet: null,
        options: [
          { label: "a", text: "Physical bit transmission over copper wire", id: "cn_ch1_q1_a" },
          { label: "b", text: "End-to-end host addressing and routing of packets across networks", id: "cn_ch1_q1_b" },
          { label: "c", text: "Process-to-process port multiplexing", id: "cn_ch1_q1_c" },
          { label: "d", text: "Data encryption and MIME formatting", id: "cn_ch1_q1_d" },
        ],
        correct_answers: ["b"],
        answer_text: ["End-to-end host addressing and routing of packets across networks"],
      },
      {
        id: "cn_ch1_q2",
        chapter_number: 1,
        chapter_title: "Chapter 1: Network Layer & IP Addressing",
        question_number: 2,
        type: "True / False",
        is_multiple_choice: false,
        points: 1,
        question: "IPv6 addresses are 128 bits in length.",
        code_snippet: null,
        options: [
          { label: "a", text: "True", id: "cn_ch1_q2_a" },
          { label: "b", text: "False", id: "cn_ch1_q2_b" },
        ],
        correct_answers: ["a"],
        answer_text: ["True"],
      },
      {
        id: "cn_ch2_q1",
        chapter_number: 2,
        chapter_title: "Chapter 2: Routing Protocols & Algorithms",
        question_number: 1,
        type: "MSQ",
        is_multiple_choice: true,
        points: 2,
        question: "Which of the following are Link-State routing protocols? (Select all that apply)",
        code_snippet: null,
        options: [
          { label: "a", text: "OSPF (Open Shortest Path First)", id: "cn_ch2_q1_a" },
          { label: "b", text: "IS-IS (Intermediate System to Intermediate System)", id: "cn_ch2_q1_b" },
          { label: "c", text: "RIP (Routing Information Protocol)", id: "cn_ch2_q1_c" },
          { label: "d", text: "BGP (Border Gateway Protocol)", id: "cn_ch2_q1_d" },
        ],
        correct_answers: ["a", "b"],
        answer_text: [
          "OSPF (Open Shortest Path First)",
          "IS-IS (Intermediate System to Intermediate System)",
        ],
      },
      {
        id: "cn_ch2_q2",
        chapter_number: 2,
        chapter_title: "Chapter 2: Routing Protocols & Algorithms",
        question_number: 2,
        type: "MCQ",
        is_multiple_choice: false,
        points: 1,
        question: "Dijkstra's shortest path algorithm is commonly implemented to compute the forwarding table in which protocol?",
        code_snippet: null,
        options: [
          { label: "a", text: "RIPv1", id: "cn_ch2_q2_a" },
          { label: "b", text: "OSPF", id: "cn_ch2_q2_b" },
          { label: "c", text: "FTP", id: "cn_ch2_q2_c" },
          { label: "d", text: "DHCP", id: "cn_ch2_q2_d" },
        ],
        correct_answers: ["b"],
        answer_text: ["OSPF"],
      },
    ],
  };

  return JSON.stringify(sample, null, 2);
}
