import { useNavigate } from "react-router-dom";
import { useTestResultsController } from "@/controllers/useTestResultsController";
import { QuestionCard } from "@/components/question/QuestionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { cn } from "cn";

export function TestResults() {
  const navigate = useNavigate();
  const {
    attempt,
    loading,
    filter,
    setFilter,
    filteredItems,
    bookmarkedSet,
    handleToggleBookmark,
    handleRetakeTest,
  } = useTestResultsController();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Attempt Not Found</h2>
        <p className="text-sm text-muted-foreground">
          This test result could not be located in your local offline storage.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getScoreVerdict = (pct: number) => {
    if (pct >= 85) return { title: "Outstanding Work!", color: "text-emerald-600 dark:text-emerald-400" };
    if (pct >= 70) return { title: "Great Job — Passed!", color: "text-emerald-600 dark:text-emerald-400" };
    if (pct >= 50) return { title: "Good Attempt — Keep Practicing!", color: "text-amber-500" };
    return { title: "Needs Revision", color: "text-destructive" };
  };

  const verdict = getScoreVerdict(attempt.percentage);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetakeTest}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Retake This Test</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/chapters")}
            className="gap-1.5"
          >
            <BookOpen className="size-3.5" />
            <span>More Practice</span>
          </Button>
        </div>
      </div>

      {/* Score Summary Hero Banner */}
      <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                {attempt.mode === "full_mock"
                  ? "Full Syllabus Exam"
                  : attempt.mode === "week"
                  ? (attempt.weekTitle || `Week ${attempt.weekNumber || ""}`)
                  : attempt.mode === "chapter"
                  ? `Chapter ${attempt.chapterNumber}`
                  : "Practice Drill"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {attempt.title}
              </h1>
              <p className={cn("text-base font-semibold", verdict.color)}>
                {verdict.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span>Completed {new Date(attempt.completedAt).toLocaleString()}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTime(attempt.timeSpentSeconds)}
                </span>
              </div>
            </div>

            {/* Score Ring / Bubble */}
            <div className="flex items-center justify-center self-center md:self-auto">
              <div className="flex flex-col items-center justify-center size-24 sm:size-28 rounded-2xl border-2 border-primary/20 bg-primary/5 p-3 sm:p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-foreground">
                  {attempt.percentage}%
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground mt-0.5">
                  {attempt.score} / {attempt.maxScore} Pts
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-5 sm:pt-6 border-t border-border/60 mt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2 sm:p-3">
              <CheckCircle2 className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Correct</span>
                <p className="text-sm sm:text-lg font-bold text-foreground">{attempt.correctCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-2 sm:p-3">
              <XCircle className="size-4 sm:size-5 text-destructive shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Incorrect</span>
                <p className="text-sm sm:text-lg font-bold text-foreground">{attempt.incorrectCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2.5 rounded-xl border border-border bg-muted/40 p-2 sm:p-3">
              <HelpCircle className="size-4 sm:size-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium block">Skipped</span>
                <p className="text-sm sm:text-lg font-bold text-foreground">{attempt.unansweredCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Question Breakdown & Answers
            </h2>
            <p className="text-xs text-muted-foreground">
              Review your answers against the correct solutions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("all")}
              className="h-7 text-xs"
            >
              All ({attempt.totalQuestions})
            </Button>
            <Button
              variant={filter === "incorrect" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("incorrect")}
              className="h-7 text-xs"
            >
              Incorrect ({attempt.incorrectCount})
            </Button>
            <Button
              variant={filter === "correct" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("correct")}
              className="h-7 text-xs"
            >
              Correct ({attempt.correctCount})
            </Button>
            {attempt.unansweredCount > 0 && (
              <Button
                variant={filter === "skipped" ? "default" : "outline"}
                size="xs"
                onClick={() => setFilter("skipped")}
                className="h-7 text-xs"
              >
                Skipped ({attempt.unansweredCount})
              </Button>
            )}
          </div>
        </div>

        {/* Filtered Question Cards */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <QuestionCard
              key={item.question.id}
              question={item.question}
              selectedAnswers={item.selectedAnswers}
              isReviewMode={true}
              isCorrect={item.isCorrect}
              isSkipped={item.isSkipped}
              isPartiallyCorrect={item.isPartiallyCorrect}
              earnedPoints={item.earnedPoints}
              questionIndex={index}
              totalQuestions={filteredItems.length}
              isBookmarked={bookmarkedSet.has(item.question.id)}
              onToggleBookmark={() => handleToggleBookmark(item.question.id)}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No questions found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
