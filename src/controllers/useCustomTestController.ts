import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Chapter, TestSession } from "@/types";
import { useCurrentModule } from "@/hooks/useCurrentModule";
import {
  buildCustomTestSession,
  generateChapterRangePresets,
  DEFAULT_DURATION_PRESETS,
  QUESTION_LIMIT_PRESETS,
  CHAPTER_RANGE_PRESETS,
  WEEK_RANGE_PRESETS,
} from "@/services/customTestService";

export function useCustomTestController() {
  const navigate = useNavigate();
  const {
    basePath,
    moduleId,
    getAllChapters,
    getAllWeeks,
    generateCustomQuestions,
    getActiveSession,
    saveActiveSession,
    clearActiveSession,
  } = useCurrentModule();

  const chapters: Chapter[] = useMemo(() => getAllChapters(), [getAllChapters]);
  const weeks: Chapter[] = useMemo(() => getAllWeeks(), [getAllWeeks]);

  // Selection state
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(() => new Set());
  const [selectedWeeks, setSelectedWeeks] = useState<Set<number>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Timing state
  const [isTimed, setIsTimed] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [customDurationInput, setCustomDurationInput] = useState("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  // Question limit state
  const [questionCountLimit, setQuestionCountLimit] = useState<number | null>(null);

  // Active session detection & dialog
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    const existing = getActiveSession();
    if (existing && !existing.isCompleted) {
      setActiveSession(existing);
    }
  }, [getActiveSession]);

  // Dynamic chapter range presets based on syllabus size
  const chapterRangePresets = useMemo(() => {
    if (chapters.length === 60) return CHAPTER_RANGE_PRESETS;
    return generateChapterRangePresets(chapters.length);
  }, [chapters.length]);

  const weekRangePresets = WEEK_RANGE_PRESETS;

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase().trim();
    return chapters.filter(
      (c) =>
        c.chapter_title.toLowerCase().includes(q) ||
        c.chapter_number.toString() === q ||
        `chapter ${c.chapter_number}`.includes(q)
    );
  }, [chapters, searchQuery]);

  // Filtered weeks
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return weeks;
    const q = searchQuery.toLowerCase().trim();
    return weeks.filter(
      (w) =>
        w.chapter_title.toLowerCase().includes(q) ||
        w.chapter_number.toString() === q ||
        `week ${w.chapter_number}`.includes(q)
    );
  }, [weeks, searchQuery]);

  // Aggregate questions in selected chapters & weeks
  const totalAvailableQuestions = useMemo(() => {
    let count = 0;
    for (const ch of chapters) {
      if (selectedChapters.has(ch.chapter_number)) {
        count += ch.question_count;
      }
    }
    for (const wk of weeks) {
      if (selectedWeeks.has(wk.chapter_number)) {
        count += wk.question_count;
      }
    }
    return count;
  }, [chapters, weeks, selectedChapters, selectedWeeks]);

  // Target questions to be delivered in the test
  const targetQuestionCount = useMemo(() => {
    if (totalAvailableQuestions === 0) return 0;
    if (questionCountLimit === null) return totalAvailableQuestions;
    return Math.min(questionCountLimit, totalAvailableQuestions);
  }, [totalAvailableQuestions, questionCountLimit]);

  // Chapter selection handlers
  const toggleChapter = useCallback((chapterNumber: number) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterNumber)) {
        next.delete(chapterNumber);
      } else {
        next.add(chapterNumber);
      }
      return next;
    });
  }, []);

  const selectAllChapters = useCallback(() => {
    setSelectedChapters(new Set(chapters.map((c) => c.chapter_number)));
  }, [chapters]);

  const clearAllChapters = useCallback(() => {
    setSelectedChapters(new Set());
  }, []);

  const selectRange = useCallback((from: number, to: number) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      for (let i = from; i <= to; i++) {
        if (i <= chapters.length) {
          next.add(i);
        }
      }
      return next;
    });
  }, [chapters.length]);

  // Week selection handlers
  const toggleWeek = useCallback((weekNumber: number) => {
    setSelectedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  }, []);

  const selectAllWeeks = useCallback(() => {
    setSelectedWeeks(new Set(weeks.map((w) => w.chapter_number)));
  }, [weeks]);

  const clearAllWeeks = useCallback(() => {
    setSelectedWeeks(new Set());
  }, []);

  const selectWeekRange = useCallback((from: number, to: number) => {
    setSelectedWeeks((prev) => {
      const next = new Set(prev);
      for (let i = from; i <= to; i++) {
        if (i <= weeks.length) {
          next.add(i);
        }
      }
      return next;
    });
  }, [weeks.length]);

  // Global bulk actions
  const selectAll = useCallback(() => {
    setSelectedChapters(new Set(chapters.map((c) => c.chapter_number)));
    setSelectedWeeks(new Set(weeks.map((w) => w.chapter_number)));
  }, [chapters, weeks]);

  const clearAll = useCallback(() => {
    setSelectedChapters(new Set());
    setSelectedWeeks(new Set());
  }, []);

  // Duration handlers
  const handlePresetDurationSelect = useCallback((mins: number) => {
    setIsCustomDuration(false);
    setDurationMinutes(mins);
  }, []);

  const handleCustomDurationChange = useCallback((val: string) => {
    setCustomDurationInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 300) {
      setDurationMinutes(parsed);
    }
  }, []);

  const enableCustomDuration = useCallback(() => {
    setIsCustomDuration(true);
  }, []);

  const cancelCustomDuration = useCallback(() => {
    setIsCustomDuration(false);
    setDurationMinutes(30);
  }, []);

  // Execution handler
  const executeStartTest = useCallback(() => {
    const session = buildCustomTestSession(
      {
        chapterNumbers: Array.from(selectedChapters),
        weekNumbers: Array.from(selectedWeeks),
        durationMinutes: isTimed ? durationMinutes : null,
        questionCountLimit,
      },
      chapters.length,
      weeks.length,
      generateCustomQuestions,
      moduleId || undefined
    );

    if (!session) return;

    saveActiveSession(session);
    navigate(`${basePath}/test`);
  }, [
    selectedChapters,
    selectedWeeks,
    isTimed,
    durationMinutes,
    questionCountLimit,
    chapters.length,
    weeks.length,
    generateCustomQuestions,
    moduleId,
    saveActiveSession,
    navigate,
    basePath,
  ]);

  const handleStartTest = useCallback(() => {
    if (selectedChapters.size === 0 && selectedWeeks.size === 0) return;

    if (activeSession && !activeSession.isCompleted) {
      setShowDiscardDialog(true);
      return;
    }

    executeStartTest();
  }, [selectedChapters.size, selectedWeeks.size, activeSession, executeStartTest]);

  const confirmDiscardAndStart = useCallback(() => {
    clearActiveSession();
    setActiveSession(null);
    setShowDiscardDialog(false);
    executeStartTest();
  }, [clearActiveSession, executeStartTest]);

  const selectedChapterCount = selectedChapters.size;
  const selectedWeekCount = selectedWeeks.size;
  const selectedTotalCount = selectedChapterCount + selectedWeekCount;

  return {
    chapters,
    weeks,
    filteredChapters,
    filteredWeeks,
    selectedChapters,
    selectedWeeks,
    selectedChapterCount,
    selectedWeekCount,
    selectedTotalCount,
    isAllChaptersSelected: chapters.length > 0 && selectedChapterCount === chapters.length,
    isAllWeeksSelected: weeks.length > 0 && selectedWeekCount === weeks.length,
    isAllSelected:
      chapters.length + weeks.length > 0 &&
      selectedTotalCount === chapters.length + weeks.length,
    searchQuery,
    setSearchQuery,
    isTimed,
    setIsTimed,
    durationMinutes,
    durationPresets: DEFAULT_DURATION_PRESETS,
    isCustomDuration,
    customDurationInput,
    handlePresetDurationSelect,
    handleCustomDurationChange,
    enableCustomDuration,
    cancelCustomDuration,
    questionCountLimit,
    setQuestionCountLimit,
    questionLimitPresets: QUESTION_LIMIT_PRESETS,
    chapterRangePresets,
    weekRangePresets,
    totalAvailableQuestions,
    targetQuestionCount,
    toggleChapter,
    toggleWeek,
    selectAllChapters,
    clearAllChapters,
    selectAllWeeks,
    clearAllWeeks,
    selectAll,
    clearAll,
    selectRange,
    selectWeekRange,
    handleStartTest,
    activeSession,
    showDiscardDialog,
    setShowDiscardDialog,
    confirmDiscardAndStart,
  };
}
