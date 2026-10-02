import { useNavigate } from "react-router-dom";
import { useHistoryController } from "@/controllers/useHistoryController";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  History as HistoryIcon,
  Trash2,
  RotateCcw,
  ArrowRight,
  Clock,
  Award,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { cn } from "cn";
import type { TestModeType } from "@/types";

export function History() {
  const navigate = useNavigate();
  const {
    attempts,
    totalCount,
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
  } = useHistoryController();

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateVal: number | string) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Test Attempt History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your past scores, time taken, and track your improvement.
          </p>
        </div>

        {totalCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestClearAll}
            className="text-xs text-muted-foreground hover:text-destructive self-start sm:self-auto gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card size="sm" className="hover:ring-foreground/20 transition-all shadow-2xs">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Tests Taken
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {stats.total}
                </p>
                <span className="text-[11px] text-muted-foreground block">
                  Completed attempts
                </span>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HistoryIcon className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="hover:ring-foreground/20 transition-all shadow-2xs">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Average Score
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {stats.avgPercentage}%
                </p>
                <span className="text-[11px] text-muted-foreground block">
                  Across all attempts
                </span>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="hover:ring-foreground/20 transition-all shadow-2xs">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Best Score
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {stats.bestPercentage}%
                </p>
                <span className="text-[11px] text-muted-foreground block">
                  Personal high score
                </span>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Award className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-border/60">
        {(
          [
            { key: "all", label: "All Tests" },
            { key: "full_mock", label: "Full Exam (100 Qs)" },
            { key: "chapter", label: "Chapter Tests" },
            { key: "custom", label: "Drills & Custom" },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.key}
            variant={selectedFilter === tab.key ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setSelectedFilter(tab.key as TestModeType | "all")}
            className="text-xs h-7 px-3 shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Attempts List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading history...
        </div>
      ) : attempts.length > 0 ? (
        <div className="space-y-3">
          {attempts.map((attempt) => {
            const isPassed = attempt.percentage >= 70;
            const isModerate = attempt.percentage >= 50 && attempt.percentage < 70;
            const scoreTextColor = isPassed
              ? "text-emerald-600 dark:text-emerald-400"
              : isModerate
              ? "text-amber-600 dark:text-amber-400"
              : "text-destructive";

            const displayTitle =
              attempt.mode === "chapter"
                ? attempt.title.replace(/^Chapter\s+\d+:\s*/i, "")
                : attempt.title;

            return (
              <Card
                key={attempt.id}
                size="sm"
                className="hover:ring-foreground/20 transition-all cursor-pointer group shadow-2xs"
                onClick={() => navigate(`/results/${attempt.id}`)}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={attempt.mode === "full_mock" ? "default" : "outline"}
                        className="text-[11px]"
                      >
                        {attempt.mode === "full_mock"
                          ? "Full Syllabus Exam"
                          : attempt.mode === "chapter"
                          ? `Chapter ${attempt.chapterNumber}`
                          : "Quick Drill"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(attempt.completedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {displayTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3" />
                        {attempt.correctCount}/{attempt.maxScore} Correct
                      </span>
                      {attempt.incorrectCount > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="text-destructive font-medium">
                            {attempt.incorrectCount} Incorrect
                          </span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(attempt.timeSpentSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Score Metric & Actions */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Clean Score Metric */}
                    <div className="flex items-center justify-center min-w-[52px]">
                      <span className={cn("text-2xl font-black tracking-tight leading-none", scoreTextColor)}>
                        {attempt.percentage}%
                      </span>
                    </div>

                    {/* Vertical Hairline Divider */}
                    <div className="hidden sm:block h-8 w-px bg-border/70" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleRetake(attempt, e)}
                        className="h-8 gap-1.5 text-xs font-medium px-2.5 sm:px-3"
                        title="Retake this test with freshly shuffled options"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Retake</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold px-2.5 sm:px-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <span>Review</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => requestDelete(attempt.id, e)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        title="Delete attempt"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <HistoryIcon className="size-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground">No attempts found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t taken any tests in this category yet. Start a test to record your score!
          </p>
          <Button onClick={() => navigate("/")}>Take a Test</Button>
        </div>
      )}

      {/* Delete Single Attempt Alert Dialog */}
      <AlertDialog
        open={!!deleteAttemptId}
        onOpenChange={(open) => {
          if (!open) setDeleteAttemptId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Attempt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this attempt from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All History Alert Dialog */}
      <AlertDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Attempt History?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all past test attempts? All scores, diagnostic logs, and answer reviews will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmClearAll}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
