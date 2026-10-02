import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTestSessionController } from "@/controllers/useTestSessionController";
import { QuestionCard } from "@/components/question/QuestionCard";
import { QuestionPalette } from "@/components/question/QuestionPalette";
import { TestTimer } from "@/components/test/TestTimer";
import { TestSubmissionDialog } from "@/components/test/TestSubmissionDialog";
import { Button } from "@/components/ui/button";
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
  Send,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { cn } from "cn";

export function TestSession() {
  const navigate = useNavigate();
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

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
    submitModalOpen,
    setSubmitModalOpen,
    handleSelectOption,
    handleClearAnswer,
    handleToggleFlag,
    handleJumpToQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmitTest,
  } = useTestSessionController();

  if (!session || !currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Preparing test session...</p>
        </div>
      </div>
    );
  }

  const completionPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-16">
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
              title="Exit Test (Progress is auto-saved)"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate">
                {session.title}
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          {/* Center / Right: Timer & Submit */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <TestTimer
              timeLimitSeconds={session.timeLimitSeconds}
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
              <span>{answeredCount}/{totalQuestions}</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setSubmitModalOpen(true)}
              className="gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm"
            >
              <Send className="size-3.5" />
              <span>Submit</span>
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
              onToggleBookmark={handleToggleFlag}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
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
                  onClick={handleToggleFlag}
                  className={cn(
                    "gap-1 sm:gap-1.5 text-xs h-8 sm:h-9 px-2 sm:px-3",
                    bookmarkedState && "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  <Bookmark className="size-3.5" />
                  <span className="hidden sm:inline">{bookmarkedState ? "Flagged" : "Flag for Review"}</span>
                  <span className="sm:hidden">{bookmarkedState ? "Flagged" : "Flag"}</span>
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
                    onClick={() => setSubmitModalOpen(true)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                  >
                    <Send className="size-3.5" />
                    <span>Submit</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Keyboard shortcuts hint */}
            <div className="text-center text-[11px] text-muted-foreground hidden sm:block">
              Shortcuts: Use <kbd className="px-1 py-0.5 rounded border bg-muted">Left</kbd> /{" "}
              <kbd className="px-1 py-0.5 rounded border bg-muted">Right</kbd> arrow keys to navigate, or{" "}
              <kbd className="px-1 py-0.5 rounded border bg-muted">1</kbd>-<kbd className="px-1 py-0.5 rounded border bg-muted">4</kbd> to choose options.
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

      {/* Submission Confirmation Modal */}
      <TestSubmissionDialog
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flaggedQuestionIds.length}
        onConfirmSubmit={handleSubmitTest}
      />

      {/* Exit Test Confirmation Dialog */}
      <Dialog open={exitModalOpen} onOpenChange={setExitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exit Test Session?</DialogTitle>
            <DialogDescription>
              Your progress is automatically saved. You can resume this test anytime from the home screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setExitModalOpen(false)}>
              Continue Test
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setExitModalOpen(false);
                navigate("/");
              }}
            >
              Exit to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
