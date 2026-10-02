import type { Question } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Check, X, HelpCircle, Code2 } from "lucide-react";
import { cn } from "cn";

interface QuestionCardProps {
  question: Question;
  selectedAnswers?: string[];
  onSelectAnswer?: (optionLabel: string) => void;
  onClearAnswer?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isReviewMode?: boolean;
  isCorrect?: boolean;
  isSkipped?: boolean;
  isPartiallyCorrect?: boolean;
  earnedPoints?: number;
  questionIndex?: number;
  totalQuestions?: number;
}

export function QuestionCard({
  question,
  selectedAnswers = [],
  onSelectAnswer,
  onClearAnswer,
  isBookmarked,
  onToggleBookmark,
  isReviewMode = false,
  isCorrect,
  isSkipped,
  isPartiallyCorrect,
  earnedPoints,
  questionIndex,
  totalQuestions,
}: QuestionCardProps) {
  // Friendly human labels without tech jargon
  const getTypeDisplay = () => {
    switch (question.type) {
      case "MSQ":
        return {
          title: "Multiple Answers",
          sub: "Select all that apply",
          variant: "secondary" as const,
        };
      case "True / False":
        return {
          title: "True or False",
          sub: "Choose True or False",
          variant: "outline" as const,
        };
      case "MCQ":
      default:
        return {
          title: "Single Choice",
          sub: "Choose one answer",
          variant: "secondary" as const,
        };
    }
  };

  const typeDisplay = getTypeDisplay();

  const handleOptionClick = (optionLabel: string) => {
    if (isReviewMode || !onSelectAnswer) return;
    onSelectAnswer(optionLabel);
  };

  return (
    <Card className="w-full border-border/80 shadow-sm transition-all">
      <CardHeader className="space-y-3 pb-4">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {questionIndex !== undefined && (
              <span className="text-sm font-bold text-foreground">
                Question {questionIndex + 1}
                {totalQuestions ? ` of ${totalQuestions}` : ""}
              </span>
            )}
            <Badge variant={typeDisplay.variant} className="text-xs">
              {typeDisplay.title}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              &bull; {typeDisplay.sub}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isReviewMode && (
              <>
                {isCorrect && (
                  <Badge className="bg-emerald-600 text-white gap-1 hover:bg-emerald-600">
                    <Check className="size-3" />
                    <span>Correct (+{earnedPoints ?? question.points})</span>
                  </Badge>
                )}
                {isPartiallyCorrect && (
                  <Badge className="bg-amber-500 text-white gap-1 hover:bg-amber-500">
                    <span>Partially Correct (+{earnedPoints})</span>
                  </Badge>
                )}
                {!isCorrect && !isPartiallyCorrect && !isSkipped && (
                  <Badge className="bg-destructive text-white gap-1 hover:bg-destructive">
                    <X className="size-3" />
                    <span>Incorrect</span>
                  </Badge>
                )}
                {isSkipped && (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <HelpCircle className="size-3" />
                    <span>Not Answered</span>
                  </Badge>
                )}
              </>
            )}

            {onToggleBookmark && (
              <Button
                variant={isBookmarked ? "default" : "ghost"}
                size="sm"
                onClick={onToggleBookmark}
                className="h-8 gap-1.5 text-xs"
                title={isBookmarked ? "Saved for review" : "Save question"}
              >
                <Bookmark
                  className={cn(
                    "size-3.5",
                    isBookmarked ? "fill-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span className="hidden sm:inline">
                  {isBookmarked ? "Saved" : "Save"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <CardTitle className="text-base sm:text-lg font-medium leading-relaxed text-foreground">
          {question.question}
        </CardTitle>

        {/* Code Snippet if present */}
        {question.code_snippet && (
          <div className="rounded-xl border border-border bg-muted/60 p-4 font-mono text-xs sm:text-sm text-foreground overflow-x-auto">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
              <Code2 className="size-3.5" />
              <span>Code Snippet</span>
            </div>
            <pre className="whitespace-pre">{question.code_snippet}</pre>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {/* Options List */}
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedAnswers.includes(option.label);
            const isActualCorrect = question.correct_answers.includes(option.label);

            let optionBorderClass = "border-border hover:border-foreground/40 hover:bg-muted/30";
            let optionBadgeClass = "bg-muted text-muted-foreground";

            if (isReviewMode) {
              if (isActualCorrect) {
                // Correct answer is highlighted in soft green
                optionBorderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium";
                optionBadgeClass = "bg-emerald-600 text-white";
              } else if (isSelected && !isActualCorrect) {
                // Wrong choice made by user
                optionBorderClass = "border-destructive bg-destructive/10 text-destructive font-medium";
                optionBadgeClass = "bg-destructive text-white";
              } else {
                optionBorderClass = "border-border/60 opacity-70";
              }
            } else if (isSelected) {
              optionBorderClass = "border-primary bg-primary/5 ring-1 ring-primary";
              optionBadgeClass = "bg-primary text-primary-foreground font-semibold";
            }

            return (
              <div
                key={option.label}
                onClick={() => handleOptionClick(option.label)}
                className={cn(
                  "group relative flex items-start gap-3.5 rounded-xl border p-3.5 transition-all select-none",
                  isReviewMode ? "cursor-default" : "cursor-pointer active:scale-[0.995]",
                  optionBorderClass
                )}
              >
                {/* Option Letter Bubble */}
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase transition-colors mt-0.5",
                    optionBadgeClass
                  )}
                >
                  {isReviewMode && isActualCorrect ? (
                    <Check className="size-3.5" />
                  ) : isReviewMode && isSelected && !isActualCorrect ? (
                    <X className="size-3.5" />
                  ) : (
                    option.label
                  )}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm leading-snug pt-0.5">
                  <span>{option.text}</span>

                  {isReviewMode && (
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      {isActualCorrect && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          &bull; Correct Answer
                        </span>
                      )}
                      {isSelected && !isActualCorrect && (
                        <span className="text-destructive font-medium">
                          &bull; Your Selection
                        </span>
                      )}
                      {isSelected && isActualCorrect && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          (Your selection)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear selection in interactive mode */}
        {!isReviewMode && onClearAnswer && selectedAnswers.length > 0 && (
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearAnswer}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Choice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
