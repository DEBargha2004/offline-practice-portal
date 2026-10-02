import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Chapter, TestSession } from "@/types";
import { getAllChapters } from "@/services/questionService";
import {
  buildCustomTestSession,
  DEFAULT_DURATION_PRESETS,
  QUESTION_LIMIT_PRESETS,
  CHAPTER_RANGE_PRESETS,
} from "@/services/customTestService";
import { getActiveSession, saveActiveSession, clearActiveSession } from "@/services/storageService";

export function useCustomTestController() {
  const navigate = useNavigate();

  const chapters: Chapter[] = useMemo(() => getAllChapters(), []);

  // Selection state
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(() => new Set());
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
  }, []);

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

  // Aggregate questions in selected chapters
  const totalAvailableQuestions = useMemo(() => {
    let count = 0;
    for (const ch of chapters) {
      if (selectedChapters.has(ch.chapter_number)) {
        count += ch.question_count;
      }
    }
    return count;
  }, [chapters, selectedChapters]);

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

  const selectAll = useCallback(() => {
    setSelectedChapters(new Set(chapters.map((c) => c.chapter_number)));
  }, [chapters]);

  const clearAll = useCallback(() => {
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
        durationMinutes: isTimed ? durationMinutes : null,
        questionCountLimit,
      },
      chapters.length
    );

    if (!session) return;

    saveActiveSession(session);
    navigate("/test");
  }, [selectedChapters, isTimed, durationMinutes, questionCountLimit, chapters.length, navigate]);

  const handleStartTest = useCallback(() => {
    if (selectedChapters.size === 0) return;

    if (activeSession && !activeSession.isCompleted) {
      setShowDiscardDialog(true);
      return;
    }

    executeStartTest();
  }, [selectedChapters.size, activeSession, executeStartTest]);

  const confirmDiscardAndStart = useCallback(() => {
    clearActiveSession();
    setActiveSession(null);
    setShowDiscardDialog(false);
    executeStartTest();
  }, [executeStartTest]);

  return {
    chapters,
    filteredChapters,
    selectedChapters,
    selectedCount: selectedChapters.size,
    isAllSelected: selectedChapters.size === chapters.length && chapters.length > 0,
    searchQuery,
    setSearchQuery,

    // Timing
    isTimed,
    setIsTimed,
    durationMinutes,
    isCustomDuration,
    customDurationInput,
    durationPresets: DEFAULT_DURATION_PRESETS,
    handlePresetDurationSelect,
    handleCustomDurationChange,
    enableCustomDuration,
    cancelCustomDuration,

    // Question limits
    questionCountLimit,
    setQuestionCountLimit,
    questionLimitPresets: QUESTION_LIMIT_PRESETS,
    chapterRangePresets: CHAPTER_RANGE_PRESETS,

    // Computed numbers
    totalAvailableQuestions,
    targetQuestionCount,

    // Actions
    toggleChapter,
    selectAll,
    clearAll,
    selectRange,
    handleStartTest,

    // Active session alert
    activeSession,
    showDiscardDialog,
    setShowDiscardDialog,
    confirmDiscardAndStart,
  };
}
