import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "cn";

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  userAnswers: Record<string, string[]>;
  flaggedQuestionIds: string[];
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
  className?: string;
}

type PaletteFilter = "all" | "unanswered" | "answered" | "flagged";

export function QuestionPalette({
  totalQuestions,
  currentIndex,
  userAnswers,
  flaggedQuestionIds,
  questionIds,
  onSelectQuestion,
  className,
}: QuestionPaletteProps) {
  const [filter, setFilter] = useState<PaletteFilter>("all");

  const answeredCount = Object.keys(userAnswers).filter(
    (id) => userAnswers[id] && userAnswers[id].length > 0
  ).length;
  const flaggedCount = flaggedQuestionIds.length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Card className={cn("w-full border-border/80 shadow-sm", className)}>
      <CardHeader className="p-4 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground">
            Question Overview
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            {answeredCount} / {totalQuestions} Answered
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary shrink-0" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Flagged ({flaggedCount})</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1 pt-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "unanswered", label: "Unanswered" },
              { key: "answered", label: "Answered" },
              { key: "flagged", label: "Flagged" },
            ] as const
          ).map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? "secondary" : "ghost"}
              size="xs"
              className="text-[11px] h-6 px-2"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 max-h-[360px] overflow-y-auto">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {questionIds.map((qId, index) => {
            const isAnswered = userAnswers[qId] && userAnswers[qId].length > 0;
            const isFlagged = flaggedQuestionIds.includes(qId);
            const isCurrent = currentIndex === index;

            // Apply filter visibility
            if (filter === "answered" && !isAnswered) return null;
            if (filter === "unanswered" && isAnswered) return null;
            if (filter === "flagged" && !isFlagged) return null;

            return (
              <button
                key={qId}
                onClick={() => onSelectQuestion(index)}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                  isCurrent
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold scale-105 z-10"
                    : "hover:scale-105",
                  isAnswered
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/80 bg-muted/40 text-foreground hover:bg-muted"
                )}
                title={`Question ${index + 1}${
                  isAnswered ? " (Answered)" : " (Unanswered)"
                }${isFlagged ? " [Flagged]" : ""}`}
              >
                {index + 1}

                {/* Flag indicator dot */}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
