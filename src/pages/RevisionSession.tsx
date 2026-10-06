import { useEffect } from "react";
import { useRevisionSessionController } from "@/controllers/useRevisionSessionController";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPalette } from "@/components/question/QuestionPalette";
import { TestTimer } from "@/components/test/TestTimer";
import { RevisionEyeButton } from "@/components/revision/RevisionEyeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowLeft,
  LayoutGrid,
  CheckCircle,
  Eye,
} from "lucide-react";
import { cn } from "cn";

export function RevisionSession() {
  const {
    session,
    questions,
    currentIndex,
    currentQuestion,
    currentAnswers,
    userAnswers,
    flaggedQuestionIds,
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
  } = useRevisionSessionController();

  // Scroll to top on question change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentIndex]);

  if (!session || !currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading revision session...</p>
        </div>
      </div>
    );
  }

  const completionPercentage =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Test Navigation Bar */}
      <div className="sticky top-16 z-30 border-b border-border/80 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Exit & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2 flex-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExitModalOpen(true)}
              className="shrink-0 size-8 sm:size-9"
              title="Exit Revision"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate">
                  {session.title}
                </span>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] py-0 px-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0"
                >
                  <Eye className="size-2.5 mr-0.5" />
                  Revision
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          {/* Center / Right: Timer & Exit */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <TestTimer
              timeLimitSeconds={null}
              elapsedSeconds={session.elapsedSeconds}
            />

            {/* Mobile Palette Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteDrawerOpen(true)}
              className="lg:hidden gap-1 h-8 px-2 sm:px-2.5 text-xs"
              title="Open Question Palette"
            >
              <LayoutGrid className="size-3.5" />
              <span>
                {answeredCount}/{totalQuestions}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExitModalOpen(true)}
              className="gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 text-xs sm:text-sm font-medium"
            >
              <span>Exit</span>
            </Button>
          </div>
        </div>

        {/* Global Progress Line */}
        <Progress value={completionPercentage} className="h-1 rounded-none bg-muted" />
      </div>

      {/* Main Test Arena Layout */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Question Viewer & Action Area */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6 min-w-0">
            <QuestionCard
              question={currentQuestion}
              selectedAnswers={currentAnswers}
              onSelectAnswer={handleSelectOption}
              onClearAnswer={handleClearAnswer}
              isBookmarked={bookmarkedState}
              onToggleBookmark={handleToggleBookmark}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
              isRevisionMode={true}
              showAnswers={showAnswers}
            />

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0}
                  className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <Button
                  variant={bookmarkedState ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleBookmark}
                  className={cn(
                    "gap-1 sm:gap-1.5 text-xs h-8 sm:h-9 px-2 sm:px-3",
                    bookmarkedState && "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  <Bookmark className="size-3.5" />
                  <span className="hidden sm:inline">
                    {bookmarkedState ? "Saved" : "Save Question"}
                  </span>
                  <span className="sm:hidden">{bookmarkedState ? "Saved" : "Save"}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {currentIndex < totalQuestions - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    className="gap-1 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                  >
                    <span>Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setExitModalOpen(true)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>Done Revising</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Keyboard shortcuts hint */}
            <div className="text-center text-[11px] text-muted-foreground hidden sm:block">
              Shortcuts: Use <kbd className="px-1 py-0.5 rounded border bg-muted">Left</kbd> /{" "}
              <kbd className="px-1 py-0.5 rounded border bg-muted">Right</kbd> arrow keys to navigate,{" "}
              <kbd className="px-1 py-0.5 rounded border bg-muted">1</kbd>-<kbd className="px-1 py-0.5 rounded border bg-muted">4</kbd> to choose options, and{" "}
              <kbd className="px-1 py-0.5 rounded border bg-muted">Space</kbd> / the Eye button to toggle answers.
            </div>
          </div>

          {/* Desktop Right Sidebar: Question Palette */}
          <div className="hidden lg:block lg:col-span-4 sticky top-36">
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              userAnswers={userAnswers}
              flaggedQuestionIds={flaggedQuestionIds}
              questionIds={questions.map((q) => q.id)}
              onSelectQuestion={handleJumpToQuestion}
            />
          </div>
        </div>
      </main>

      {/* Mobile Drawer Dialog for Question Palette */}
      <Dialog open={paletteDrawerOpen} onOpenChange={setPaletteDrawerOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Palette</DialogTitle>
            <DialogDescription>
              Tap any number to jump directly to that question.
            </DialogDescription>
          </DialogHeader>

          <QuestionPalette
            totalQuestions={totalQuestions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            flaggedQuestionIds={flaggedQuestionIds}
            questionIds={questions.map((q) => q.id)}
            onSelectQuestion={(idx) => {
              handleJumpToQuestion(idx);
              setPaletteDrawerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Exit Revision Confirmation Dialog */}
      <Dialog open={exitModalOpen} onOpenChange={setExitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exit Revision Session?</DialogTitle>
            <DialogDescription>
              You have reviewed {currentIndex + 1} of {totalQuestions} questions. You can revisit this revision session at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setExitModalOpen(false)}>
              Continue Revising
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setExitModalOpen(false);
                handleExitRevision();
              }}
            >
              Exit to Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Transparent Circular Button with Eye Icon */}
      <RevisionEyeButton
        showAnswers={showAnswers}
        onToggle={handleToggleShowAnswers}
      />
    </div>
  );
}
