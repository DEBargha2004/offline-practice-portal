import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Chapter, TestSession, TestAttemptResult } from "@/types";
import { useCurrentModule } from "@/hooks/useCurrentModule";

export function useChapterCatalogController() {
  const navigate = useNavigate();
  const {
    basePath,
    getAllChapters,
    generateChapterQuestions,
    getAllAttempts,
    saveActiveSession,
  } = useCurrentModule();

  const chapters = useMemo<Chapter[]>(() => getAllChapters(), [getAllChapters]);
  const [attempts, setAttempts] = useState<TestAttemptResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllAttempts().then(setAttempts);
  }, [getAllAttempts]);

  // Compute best score percentage and attempt counts for each chapter
  const chapterStats = useMemo(() => {
    const stats: Record<number, { bestScore: number; attemptsCount: number }> = {};

    for (const att of attempts) {
      if (att.mode === "chapter" && att.chapterNumber) {
        const curr = stats[att.chapterNumber] || { bestScore: 0, attemptsCount: 0 };
        curr.attemptsCount++;
        curr.bestScore = Math.max(curr.bestScore, att.percentage);
        stats[att.chapterNumber] = curr;
      }
    }

    return stats;
  }, [attempts]);

  // Filtered chapters list
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;

    const query = searchQuery.toLowerCase().trim();
    return chapters.filter(
      (c) =>
        c.chapter_title.toLowerCase().includes(query) ||
        c.chapter_number.toString() === query ||
        `chapter ${c.chapter_number}`.includes(query)
    );
  }, [chapters, searchQuery]);

  const handleStartChapterTest = (chapter: Chapter, timed: boolean) => {
    const questions = generateChapterQuestions(chapter.chapter_number, true);
    if (questions.length === 0) return;

    // Allocate ~1.5 minutes per question for chapter test if timed
    const timeLimit = timed ? Math.max(15, questions.length * 90) : null;

    const session: TestSession = {
      id: `session_ch_${chapter.chapter_number}_${Date.now()}`,
      title: chapter.chapter_title,
      mode: "chapter",
      chapterNumber: chapter.chapter_number,
      startedAt: Date.now(),
      timeLimitSeconds: timeLimit,
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: questions.map((q) => q.id),
      questions: questions,
      userAnswers: {},
      flaggedQuestionIds: [],
      currentQuestionIndex: 0,
    };

    saveActiveSession(session);
    navigate(`${basePath}/test`);
  };

  const handleStartChapterRevision = (chapter: Chapter) => {
    navigate(`${basePath}/revision?mode=chapter&id=${chapter.chapter_number}`);
  };

  return {
    chapters: filteredChapters,
    totalChapters: chapters.length,
    searchQuery,
    setSearchQuery,
    chapterStats,
    basePath,
    handleStartChapterTest,
    handleStartChapterRevision,
  };
}
