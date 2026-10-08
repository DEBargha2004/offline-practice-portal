import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Question, TestSession } from "@/types";
import { useCurrentModule } from "@/hooks/useCurrentModule";
import { shuffleQuestionOptions } from "@/services/questionService";
import { gradeTestSession } from "@/services/evaluationService";

export function useTestSessionController() {
  const navigate = useNavigate();
  const {
    basePath,
    moduleId,
    getActiveSession,
    saveActiveSession,
    clearActiveSession,
    saveAttempt,
    toggleBookmark,
    isBookmarked,
    getQuestionById,
    getChapter,
  } = useCurrentModule();

  const [session, setSession] = useState<TestSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [bookmarkedState, setBookmarkedState] = useState(false);

  // Keep a ref to the latest session for interval and auto-save
  const sessionRef = useRef<TestSession | null>(null);
  sessionRef.current = session;

  // 1. Initialize session on mount
  useEffect(() => {
    const loadedSession = getActiveSession();
    if (!loadedSession || loadedSession.isCompleted) {
      navigate(basePath || "/");
      return;
    }

    // Use session's shuffled questions if available, or resolve and shuffle
    let resolvedQuestions: Question[] = [];
    if (loadedSession.questions && loadedSession.questions.length > 0) {
      // Synchronize question answers and stems with latest question bank while strictly preserving shuffled option order
      resolvedQuestions = loadedSession.questions.map((q) => {
        const fresh = getQuestionById(q.id);
        if (!fresh) return q;

        // Collect correct option IDs from the canonical question
        const freshCorrectOptionIds = new Set(
          fresh.options
            .filter(
              (fo) =>
                fresh.correct_answers.includes(fo.label) ||
                (fo.id && fresh.correct_answers.includes(fo.id)) ||
                (fresh.answer_text && fresh.answer_text.includes(fo.text))
            )
            .map((fo) => fo.id || fo.text)
        );

        // Keep the exact shuffled option order from `q`, but refresh text/id from fresh bank
        const updatedOptions = q.options.map((opt) => {
          const freshOpt = fresh.options.find(
            (fo) => (fo.id && opt.id ? fo.id === opt.id : fo.text === opt.text)
          );
          return freshOpt
            ? { ...opt, text: freshOpt.text, id: freshOpt.id || opt.id }
            : opt;
        });

        // Recompute correct_answers and answer_text based on the shuffled options' current positions
        const updatedCorrectAnswers: string[] = [];
        const updatedAnswerText: string[] = [];

        updatedOptions.forEach((opt) => {
          const key = opt.id || opt.text;
          if (freshCorrectOptionIds.has(key)) {
            updatedCorrectAnswers.push(opt.label);
            updatedAnswerText.push(opt.text);
          }
        });

        return {
          ...q,
          question: fresh.question,
          code_snippet: fresh.code_snippet,
          points: fresh.points,
          options: updatedOptions,
          correct_answers:
            updatedCorrectAnswers.length > 0
              ? updatedCorrectAnswers
              : q.correct_answers,
          answer_text:
            updatedAnswerText.length > 0 ? updatedAnswerText : q.answer_text,
          raw_answer: fresh.raw_answer,
        };
      });
      loadedSession.questions = resolvedQuestions;
      saveActiveSession(loadedSession);
    } else {
      for (const id of loadedSession.questionIds) {
        const q = getQuestionById(id);
        if (q) resolvedQuestions.push(shuffleQuestionOptions(q));
      }
      loadedSession.questions = resolvedQuestions;
      saveActiveSession(loadedSession);
    }

    if (resolvedQuestions.length === 0) {
      clearActiveSession();
      navigate(basePath || "/");
      return;
    }

    setSession(loadedSession);
    setQuestions(resolvedQuestions);
    const validIndex = Math.min(
      Math.max(0, loadedSession.currentQuestionIndex || 0),
      resolvedQuestions.length - 1
    );
    setCurrentIndex(validIndex);

    const currentQId = resolvedQuestions[validIndex]?.id;
    if (currentQId) {
      setBookmarkedState(isBookmarked(currentQId));
    }
  }, [navigate]);

  // 2. Timer countdown and auto-save interval
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null;

        const nextElapsed = prev.elapsedSeconds + 1;

        // Auto-submit if timed test reached limit
        if (
          prev.timeLimitSeconds !== null &&
          nextElapsed >= prev.timeLimitSeconds
        ) {
          clearInterval(timer);
          setTimeout(() => {
            handleFinalSubmission(prev);
          }, 0);
          return { ...prev, elapsedSeconds: prev.timeLimitSeconds };
        }

        const updated = { ...prev, elapsedSeconds: nextElapsed };
        // Sync to storage periodically (every 5 seconds or on page unload)
        if (nextElapsed % 5 === 0) {
          saveActiveSession(updated);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id]);

  // Update bookmark status whenever currentIndex changes
  useEffect(() => {
    if (questions[currentIndex]) {
      setBookmarkedState(isBookmarked(questions[currentIndex].id));
    }
  }, [currentIndex, questions]);

  // 3. Selection handler (Single choice vs Multiple select)
  const handleSelectOption = useCallback(
    (optionLabel: string) => {
      if (!session || !questions[currentIndex]) return;

      const currentQ = questions[currentIndex];
      const qId = currentQ.id;
      const currentSelected = session.userAnswers[qId] || [];

      let updatedSelected: string[];

      if (currentQ.type === "MSQ") {
        // Toggle selection for multiple choice
        if (currentSelected.includes(optionLabel)) {
          updatedSelected = currentSelected.filter((l) => l !== optionLabel);
        } else {
          updatedSelected = [...currentSelected, optionLabel];
        }
      } else {
        // Single choice (MCQ or True/False): replace
        updatedSelected = [optionLabel];
      }

      const updatedAnswers = { ...session.userAnswers };
      if (updatedSelected.length > 0) {
        updatedAnswers[qId] = updatedSelected;
      } else {
        delete updatedAnswers[qId];
      }

      const updatedSession: TestSession = {
        ...session,
        userAnswers: updatedAnswers,
        currentQuestionIndex: currentIndex,
      };

      setSession(updatedSession);
      saveActiveSession(updatedSession);
    },
    [session, questions, currentIndex]
  );

  // Clear answer
  const handleClearAnswer = useCallback(() => {
    if (!session || !questions[currentIndex]) return;

    const qId = questions[currentIndex].id;
    const updatedAnswers = { ...session.userAnswers };
    delete updatedAnswers[qId];

    const updatedSession: TestSession = {
      ...session,
      userAnswers: updatedAnswers,
    };

    setSession(updatedSession);
    saveActiveSession(updatedSession);
  }, [session, questions, currentIndex]);

  // Flag/Bookmark question for review
  const handleToggleFlag = useCallback(() => {
    if (!session || !questions[currentIndex]) return;

    const qId = questions[currentIndex].id;
    const currentFlagged = new Set(session.flaggedQuestionIds || []);
    const isNowFlagged = !currentFlagged.has(qId);

    if (isNowFlagged) {
      currentFlagged.add(qId);
    } else {
      currentFlagged.delete(qId);
    }

    const updatedSession: TestSession = {
      ...session,
      flaggedQuestionIds: Array.from(currentFlagged),
    };

    // Also sync to global bookmarks
    toggleBookmark(qId);
    setBookmarkedState(isNowFlagged);

    setSession(updatedSession);
    saveActiveSession(updatedSession);
  }, [session, questions, currentIndex]);

  // Navigation handlers
  const handleJumpToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
        if (session) {
          const updated = { ...session, currentQuestionIndex: index };
          setSession(updated);
          saveActiveSession(updated);
        }
      }
    },
    [questions.length, session]
  );

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

  // Submission handler
  const handleFinalSubmission = useCallback(
    async (overrideSession?: TestSession) => {
      const targetSession = overrideSession || sessionRef.current;
      if (!targetSession) return;

      const chInfo = targetSession.chapterNumber
        ? getChapter(targetSession.chapterNumber)
        : undefined;

      const attemptResult = gradeTestSession(
        targetSession,
        questions,
        chInfo?.chapter_title
      );
      if (targetSession.moduleId || moduleId) {
        attemptResult.moduleId = targetSession.moduleId || moduleId || undefined;
      }

      // Persist attempt to IndexedDB
      await saveAttempt(attemptResult);

      // Clear active in-progress session
      clearActiveSession();

      // Navigate to review screen
      navigate(`${basePath}/results/${attemptResult.id}`);
    },
    [questions, navigate, basePath, moduleId, saveAttempt, clearActiveSession, getChapter]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousQuestion();
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const currentQ = questions[currentIndex];
        if (currentQ) {
          const optIndex = parseInt(e.key, 10) - 1;
          if (currentQ.options[optIndex]) {
            handleSelectOption(currentQ.options[optIndex].label);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    questions,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSelectOption,
  ]);

  const currentQuestion = questions[currentIndex];
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
    totalQuestions: questions.length,
    bookmarkedState,
    submitModalOpen,
    setSubmitModalOpen,
    handleSelectOption,
    handleClearAnswer,
    handleToggleFlag,
    handleJumpToQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmitTest: () => handleFinalSubmission(),
  };
}
