import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Chapter, TestSession, TestAttemptResult } from "@/types";
import { getAllWeeks, generateWeekQuestions } from "@/services/questionService";
import { getAllAttempts, saveActiveSession } from "@/services/storageService";

export function useAssignmentCatalogController() {
  const navigate = useNavigate();
  const [weeks] = useState<Chapter[]>(() => getAllWeeks());
  const [attempts, setAttempts] = useState<TestAttemptResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllAttempts().then(setAttempts);
  }, []);

  // Compute best score percentage and attempt counts for each week
  const weekStats = useMemo(() => {
    const stats: Record<number, { bestScore: number; attemptsCount: number }> = {};

    for (const att of attempts) {
      if (att.mode === "week" && att.weekNumber) {
        const curr = stats[att.weekNumber] || { bestScore: 0, attemptsCount: 0 };
        curr.attemptsCount++;
        curr.bestScore = Math.max(curr.bestScore, att.percentage);
        stats[att.weekNumber] = curr;
      }
    }

    return stats;
  }, [attempts]);

  // Filtered weeks list
  const filteredWeeks = useMemo(() => {
    if (!searchQuery.trim()) return weeks;

    const query = searchQuery.toLowerCase().trim();
    return weeks.filter(
      (w) =>
        w.chapter_title.toLowerCase().includes(query) ||
        w.chapter_number.toString() === query ||
        `week ${w.chapter_number}`.includes(query)
    );
  }, [weeks, searchQuery]);

  const handleStartWeekTest = (week: Chapter, timed: boolean) => {
    const questions = generateWeekQuestions(week.chapter_number, true);
    if (questions.length === 0) return;

    // Allocate 1.5 minutes per question for assignment test if timed
    const timeLimit = timed ? Math.max(15, questions.length * 90) : null;

    const session: TestSession = {
      id: `session_week_${week.chapter_number}_${Date.now()}`,
      title: `${week.chapter_title} Assignment`,
      mode: "week",
      weekNumber: week.chapter_number,
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
    navigate("/test");
  };

  return {
    weeks: filteredWeeks,
    totalWeeks: weeks.length,
    searchQuery,
    setSearchQuery,
    weekStats,
    handleStartWeekTest,
  };
}
