import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Question, RevisionSession } from "@/types";
import {
  getActiveRevisionSession,
  saveActiveRevisionSession,
  clearActiveRevisionSession,
  toggleBookmark,
  isBookmarked,
} from "@/services/storageService";
import {
  getQuestionsForChapter,
  getQuestionsForWeek,
  getChapter,
  getWeek,
  getQuestionById,
} from "@/services/questionService";

export function useRevisionSessionController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [session, setSession] = useState<RevisionSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [bookmarkedState, setBookmarkedState] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

  const sessionRef = useRef<RevisionSession | null>(null);
  sessionRef.current = session;

  // Initialize revision session on mount or when searchParams change
  useEffect(() => {
    const paramMode = searchParams.get("mode") as "chapter" | "week" | null;
    const paramIdStr = searchParams.get("id");
    const paramId = paramIdStr ? parseInt(paramIdStr, 10) : NaN;

    let targetSession: RevisionSession | null = null;

    if (paramMode && !isNaN(paramId)) {
      // Build a fresh or updated revision session from URL parameters
      if (paramMode === "week") {
        const weekMeta = getWeek(paramId);
        const weekQuestions = getQuestionsForWeek(paramId);
        if (weekQuestions.length > 0) {
          targetSession = {
            id: `rev_week_${paramId}`,
            title: `${weekMeta?.chapter_title || `Week ${paramId}`} Assignment Revision`,
            mode: "week",
            weekNumber: paramId,
            startedAt: Date.now(),
            elapsedSeconds: 0,
            questionIds: weekQuestions.map((q) => q.id),
            questions: weekQuestions,
            userAnswers: {},
            flaggedQuestionIds: [],
            currentQuestionIndex: 0,
            showAnswers: false,
          };
        }
      } else if (paramMode === "chapter") {
        const chapterMeta = getChapter(paramId);
        const chapterQuestions = getQuestionsForChapter(paramId);
        if (chapterQuestions.length > 0) {
          targetSession = {
            id: `rev_chapter_${paramId}`,
            title: `${chapterMeta?.chapter_title || `Chapter ${paramId}`} Revision`,
            mode: "chapter",
            chapterNumber: paramId,
            startedAt: Date.now(),
            elapsedSeconds: 0,
            questionIds: chapterQuestions.map((q) => q.id),
            questions: chapterQuestions,
            userAnswers: {},
            flaggedQuestionIds: [],
            currentQuestionIndex: 0,
            showAnswers: false,
          };
        }
      }
    }

    // Fall back to stored active revision session if URL params are empty
    if (!targetSession) {
      targetSession = getActiveRevisionSession();
    }

    if (!targetSession || !targetSession.questionIds || targetSession.questionIds.length === 0) {
      // If nothing found, return to assignments
      navigate("/assignments");
      return;
    }

    // Resolve questions
    const resolvedQuestions: Question[] = [];
    for (const qId of targetSession.questionIds) {
      const q = getQuestionById(qId);
      if (q) resolvedQuestions.push(q);
    }

    if (resolvedQuestions.length === 0) {
      clearActiveRevisionSession();
      navigate("/assignments");
      return;
    }

    targetSession.questions = resolvedQuestions;
    saveActiveRevisionSession(targetSession);

    setSession(targetSession);
    setQuestions(resolvedQuestions);
    const validIndex = Math.min(
      Math.max(0, targetSession.currentQuestionIndex || 0),
      resolvedQuestions.length - 1
    );
    setCurrentIndex(validIndex);
    setShowAnswers(Boolean(targetSession.showAnswers));

    const initialQId = resolvedQuestions[validIndex]?.id;
    if (initialQId) {
      setBookmarkedState(isBookmarked(initialQId));
    }
  }, [searchParams, navigate]);

  // Sync bookmark state when current index changes
  useEffect(() => {
    if (questions[currentIndex]) {
      setBookmarkedState(isBookmarked(questions[currentIndex].id));
    }
  }, [currentIndex, questions]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
        saveActiveRevisionSession(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.id]);

  // Option selection logic
  const handleSelectOption = useCallback(
    (optionLabel: string) => {
      if (!session || !questions[currentIndex]) return;
      const currentQ = questions[currentIndex];

      setSession((prev) => {
        if (!prev) return null;
        const prevAnswers = prev.userAnswers[currentQ.id] || [];
        let newAnswers: string[];

        if (currentQ.type === "MSQ") {
          // Toggle selection for MSQ
          if (prevAnswers.includes(optionLabel)) {
            newAnswers = prevAnswers.filter((a) => a !== optionLabel);
          } else {
            newAnswers = [...prevAnswers, optionLabel].sort();
          }
        } else {
          // Single select for MCQ and True/False
          newAnswers = prevAnswers.includes(optionLabel) ? [] : [optionLabel];
        }

        const updated: RevisionSession = {
          ...prev,
          userAnswers: {
            ...prev.userAnswers,
            [currentQ.id]: newAnswers,
          },
        };
        saveActiveRevisionSession(updated);
        return updated;
      });
    },
    [session, questions, currentIndex]
  );

  // Clear answer
  const handleClearAnswer = useCallback(() => {
    if (!session || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];

    setSession((prev) => {
      if (!prev) return null;
      const nextAnswers = { ...prev.userAnswers };
      delete nextAnswers[currentQ.id];

      const updated: RevisionSession = {
        ...prev,
        userAnswers: nextAnswers,
      };
      saveActiveRevisionSession(updated);
      return updated;
    });
  }, [session, questions, currentIndex]);

  // Toggle bookmark / flag
  const handleToggleBookmark = useCallback(() => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const newBookmarked = toggleBookmark(qId);
    setBookmarkedState(newBookmarked);

    setSession((prev) => {
      if (!prev) return null;
      const set = new Set(prev.flaggedQuestionIds || []);
      if (newBookmarked) set.add(qId);
      else set.delete(qId);

      const updated: RevisionSession = {
        ...prev,
        flaggedQuestionIds: Array.from(set),
      };
      saveActiveRevisionSession(updated);
      return updated;
    });
  }, [questions, currentIndex]);

  // Jump to specific question
  const handleJumpToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
        setSession((prev) => {
          if (!prev) return null;
          const updated = { ...prev, currentQuestionIndex: index };
          saveActiveRevisionSession(updated);
          return updated;
        });
      }
    },
    [questions.length]
  );

  // Navigation
  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      handleJumpToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, handleJumpToQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      handleJumpToQuestion(currentIndex - 1);
    }
  }, [currentIndex, handleJumpToQuestion]);

  // Toggle show answers (the eye button)
  const handleToggleShowAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      const next = !prev;
      setSession((curr) => {
        if (!curr) return null;
        const updated = { ...curr, showAnswers: next };
        saveActiveRevisionSession(updated);
        return updated;
      });
      return next;
    });
  }, []);

  // Exit revision
  const handleExitRevision = useCallback(() => {
    clearActiveRevisionSession();
    if (session?.mode === "chapter") {
      navigate("/chapters");
    } else {
      navigate("/assignments");
    }
  }, [session?.mode, navigate]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is interacting with form controls
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousQuestion();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === " " || e.key === "e" || e.key === "E") {
        // Space or E toggles answer visibility
        e.preventDefault();
        handleToggleShowAnswers();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        const currentQ = questions[currentIndex];
        if (currentQ && currentQ.options[optionIdx]) {
          e.preventDefault();
          handleSelectOption(currentQ.options[optionIdx].label);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePreviousQuestion,
    handleNextQuestion,
    handleToggleShowAnswers,
    handleSelectOption,
    questions,
    currentIndex,
  ]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const userAnswers = session?.userAnswers || {};
  const currentAnswers = currentQuestion ? userAnswers[currentQuestion.id] || [] : [];
  const answeredCount = Object.keys(userAnswers).filter(
    (id) => userAnswers[id] && userAnswers[id].length > 0
  ).length;

  return {
    session,
    questions,
    currentIndex,
    currentQuestion,
    currentAnswers,
    userAnswers,
    flaggedQuestionIds: session?.flaggedQuestionIds || [],
    answeredCount,
    totalQuestions,
    bookmarkedState,
    showAnswers,
    exitModalOpen,
    setExitModalOpen,
    paletteDrawerOpen,
    setPaletteDrawerOpen,
    handleSelectOption,
    handleClearAnswer,
    handleToggleBookmark,
    handleJumpToQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    handleToggleShowAnswers,
    handleExitRevision,
  };
}
