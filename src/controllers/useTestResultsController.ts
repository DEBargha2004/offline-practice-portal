import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { TestAttemptResult, TestSession } from "@/types";
import { useCurrentModule } from "@/hooks/useCurrentModule";
import { getAttemptById } from "@/services/storageService";
import { shuffleArray, shuffleQuestionOptions } from "@/services/questionService";

export type ReviewFilterType = "all" | "incorrect" | "correct" | "skipped";

export function useTestResultsController() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const {
    basePath,
    moduleId,
    saveActiveSession,
    toggleBookmark,
    isBookmarked,
  } = useCurrentModule();

  const [attempt, setAttempt] = useState<TestAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilterType>("all");
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!attemptId) {
      navigate(basePath || "/");
      return;
    }

    getAttemptById(attemptId).then((result) => {
      setAttempt(result);
      setLoading(false);

      if (result) {
        // Collect bookmarks for questions in this review
        const set = new Set<string>();
        for (const item of result.reviewItems) {
          if (isBookmarked(item.question.id)) {
            set.add(item.question.id);
          }
        }
        setBookmarkedSet(set);
      }
    });
  }, [attemptId, navigate, basePath, isBookmarked]);

  const handleToggleBookmark = (questionId: string) => {
    const isNow = toggleBookmark(questionId);
    setBookmarkedSet((prev) => {
      const next = new Set(prev);
      if (isNow) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  };

  const handleRetakeTest = () => {
    if (!attempt) return;

    const reShuffledQuestions = shuffleArray(
      attempt.reviewItems.map((item) => item.question)
    ).map(shuffleQuestionOptions);

    const newSession: TestSession = {
      id: `session_retake_${Date.now()}`,
      moduleId: attempt.moduleId || moduleId || undefined,
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
    navigate(`${basePath}/test`);
  };

  const filteredItems = useMemo(() => {
    if (!attempt) return [];

    switch (filter) {
      case "incorrect":
        return attempt.reviewItems.filter((i) => !i.isCorrect && !i.isSkipped);
      case "correct":
        return attempt.reviewItems.filter((i) => i.isCorrect);
      case "skipped":
        return attempt.reviewItems.filter((i) => i.isSkipped);
      case "all":
      default:
        return attempt.reviewItems;
    }
  }, [attempt, filter]);

  return {
    attempt,
    loading,
    filter,
    setFilter,
    filteredItems,
    bookmarkedSet,
    basePath,
    handleToggleBookmark,
    handleRetakeTest,
  };
}
