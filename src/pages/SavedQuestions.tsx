import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Question, TestSession } from "@/types";
import { getBookmarks, toggleBookmark, saveActiveSession } from "@/services/storageService";
import { getQuestionById, shuffleQuestionOptions } from "@/services/questionService";
import { QuestionCard } from "@/components/question/QuestionCard";
import { Button } from "@/components/ui/button";
import { Bookmark, Play } from "lucide-react";

export function SavedQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);

  const loadSaved = () => {
    const ids = getBookmarks();
    const loaded: Question[] = [];
    for (const id of ids) {
      const q = getQuestionById(id);
      if (q) loaded.push(q);
    }
    setQuestions(loaded);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleToggle = (qId: string) => {
    toggleBookmark(qId);
    loadSaved();
  };

  const handleStartPracticeWithSaved = () => {
    if (questions.length === 0) return;

    const shuffledQuestions = questions.map(shuffleQuestionOptions);

    const newSession: TestSession = {
      id: `session_saved_${Date.now()}`,
      title: `Saved Questions Practice (${questions.length} Qs)`,
      mode: "custom",
      startedAt: Date.now(),
      timeLimitSeconds: null, // untimed
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: shuffledQuestions.map((q) => q.id),
      questions: shuffledQuestions,
      userAnswers: {},
      flaggedQuestionIds: shuffledQuestions.map((q) => q.id),
      currentQuestionIndex: 0,
    };

    saveActiveSession(newSession);
    navigate("/test");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Saved Questions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your flagged questions anytime or practice them in a focused drill.
          </p>
        </div>

        {questions.length > 0 && (
          <Button
            onClick={handleStartPracticeWithSaved}
            className="gap-2 bg-primary text-primary-foreground font-semibold self-start sm:self-auto"
          >
            <Play className="size-4" />
            <span>Practice These ({questions.length})</span>
          </Button>
        )}
      </div>

      {/* List */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              selectedAnswers={[]}
              isReviewMode={true}
              isCorrect={false}
              isSkipped={true}
              questionIndex={index}
              totalQuestions={questions.length}
              isBookmarked={true}
              onToggleBookmark={() => handleToggle(question.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Bookmark className="size-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground">No saved questions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Click the bookmark icon during any test or review to save difficult questions here for revision.
          </p>
          <Button onClick={() => navigate("/chapters")}>Browse Questions</Button>
        </div>
      )}
    </div>
  );
}
