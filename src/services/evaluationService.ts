import type { Question, QuestionReviewItem, TestAttemptResult, TestSession } from "@/types";

/**
 * Compares user selected answer labels with question's correct answer labels
 */
export function evaluateQuestionAnswer(
  question: Question,
  selectedLabels: string[] | undefined
): {
  isCorrect: boolean;
  isSkipped: boolean;
  isPartiallyCorrect: boolean;
  earnedPoints: number;
} {
  const selected = (selectedLabels || []).map((s) => s.trim().toLowerCase()).sort();
  const correct = (question.correct_answers || []).map((s) => s.trim().toLowerCase()).sort();

  if (selected.length === 0) {
    return {
      isCorrect: false,
      isSkipped: true,
      isPartiallyCorrect: false,
      earnedPoints: 0,
    };
  }

  // Exact match check
  const isExactMatch =
    selected.length === correct.length &&
    selected.every((val, index) => val === correct[index]);

  if (isExactMatch) {
    return {
      isCorrect: true,
      isSkipped: false,
      isPartiallyCorrect: false,
      earnedPoints: question.points || 1,
    };
  }

  // Check for partial credit in MSQs if multiple answers exist
  if (question.type === "MSQ" && correct.length > 1) {
    const wrongSelections = selected.filter((sel) => !correct.includes(sel));
    const correctSelections = selected.filter((sel) => correct.includes(sel));

    // If student selected only correct choices (no wrong ones) but missed some
    if (wrongSelections.length === 0 && correctSelections.length > 0) {
      const partialRatio = correctSelections.length / correct.length;
      return {
        isCorrect: false,
        isSkipped: false,
        isPartiallyCorrect: true,
        earnedPoints: Math.round(partialRatio * (question.points || 1) * 10) / 10,
      };
    }
  }

  return {
    isCorrect: false,
    isSkipped: false,
    isPartiallyCorrect: false,
    earnedPoints: 0,
  };
}

/**
 * Evaluates an entire submitted session and generates a complete attempt result
 */
export function gradeTestSession(
  session: TestSession,
  questions: Question[],
  chapterTitle?: string
): TestAttemptResult {
  const reviewItems: QuestionReviewItem[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const q of questions) {
    const userAns = session.userAnswers[q.id];
    const evaluation = evaluateQuestionAnswer(q, userAns);

    maxPossibleScore += q.points || 1;
    totalScore += evaluation.earnedPoints;

    if (evaluation.isSkipped) {
      unansweredCount++;
    } else if (evaluation.isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    reviewItems.push({
      question: q,
      selectedAnswers: userAns || [],
      isCorrect: evaluation.isCorrect,
      isSkipped: evaluation.isSkipped,
      isPartiallyCorrect: evaluation.isPartiallyCorrect,
      earnedPoints: evaluation.earnedPoints,
    });
  }

  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionId: session.id,
    title: session.title,
    mode: session.mode,
    chapterNumber: session.chapterNumber,
    chapterTitle: chapterTitle,
    startedAt: session.startedAt,
    completedAt: Date.now(),
    timeSpentSeconds: session.elapsedSeconds,
    timeLimitSeconds: session.timeLimitSeconds,
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    unansweredCount,
    score: totalScore,
    maxScore: maxPossibleScore,
    percentage,
    reviewItems,
  };
}
