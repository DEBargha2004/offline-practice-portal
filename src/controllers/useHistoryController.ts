import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TestAttemptResult, TestModeType, TestSession } from "@/types";
import {
  getAllAttempts,
  deleteAttempt,
  clearAllAttempts,
  saveActiveSession,
} from "@/services/storageService";
import { shuffleQuestionOptions } from "@/services/questionService";

export function useHistoryController() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestAttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<TestModeType | "all">("all");

  const refreshAttempts = () => {
    setLoading(true);
    getAllAttempts().then((data) => {
      setAttempts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshAttempts();
  }, []);

  const filteredAttempts = useMemo(() => {
    if (selectedFilter === "all") return attempts;
    return attempts.filter((a) => a.mode === selectedFilter);
  }, [attempts, selectedFilter]);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avgPercentage: 0, bestPercentage: 0 };
    }
    const sum = attempts.reduce((acc, a) => acc + a.percentage, 0);
    const best = Math.max(...attempts.map((a) => a.percentage));
    return {
      total: attempts.length,
      avgPercentage: Math.round(sum / attempts.length),
      bestPercentage: best,
    };
  }, [attempts]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this test attempt from history?")) {
      await deleteAttempt(id);
      refreshAttempts();
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete ALL test history? This cannot be undone.")) {
      await clearAllAttempts();
      refreshAttempts();
    }
  };

  const handleRetake = (attempt: TestAttemptResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const reShuffledQuestions = attempt.reviewItems.map((item) =>
      shuffleQuestionOptions(item.question)
    );

    const newSession: TestSession = {
      id: `session_retake_${Date.now()}`,
      title: `${attempt.title} (Retake)`,
      mode: attempt.mode,
      chapterNumber: attempt.chapterNumber,
      startedAt: Date.now(),
      timeLimitSeconds: attempt.timeLimitSeconds,
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: reShuffledQuestions.map((q) => q.id),
      questions: reShuffledQuestions,
      userAnswers: {},
      flaggedQuestionIds: [],
      currentQuestionIndex: 0,
    };

    saveActiveSession(newSession);
    navigate("/test");
  };

  return {
    attempts: filteredAttempts,
    totalCount: attempts.length,
    loading,
    selectedFilter,
    setSelectedFilter,
    stats,
    handleDelete,
    handleClearAll,
    handleRetake,
  };
}
