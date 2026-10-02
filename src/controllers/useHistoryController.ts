import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TestAttemptResult, TestModeType, TestSession } from "@/types";
import {
  getAllAttempts,
  deleteAttempt,
  clearAllAttempts,
  saveActiveSession,
} from "@/services/storageService";
import { shuffleArray, shuffleQuestionOptions } from "@/services/questionService";

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

  const [deleteAttemptId, setDeleteAttemptId] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteAttemptId(id);
  };

  const confirmDelete = async () => {
    if (!deleteAttemptId) return;
    await deleteAttempt(deleteAttemptId);
    setDeleteAttemptId(null);
    refreshAttempts();
  };

  const requestClearAll = () => {
    setClearAllDialogOpen(true);
  };

  const confirmClearAll = async () => {
    await clearAllAttempts();
    setClearAllDialogOpen(false);
    refreshAttempts();
  };

  const handleRetake = (attempt: TestAttemptResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const reShuffledQuestions = shuffleArray(
      attempt.reviewItems.map((item) => item.question)
    ).map(shuffleQuestionOptions);

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
    deleteAttemptId,
    setDeleteAttemptId,
    clearAllDialogOpen,
    setClearAllDialogOpen,
    requestDelete,
    confirmDelete,
    requestClearAll,
    confirmClearAll,
    handleRetake,
  };
}
