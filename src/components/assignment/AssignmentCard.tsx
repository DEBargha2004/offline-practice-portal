import type { Chapter } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Clock, CalendarCheck2, Eye } from "lucide-react";
import { cn } from "cn";

interface AssignmentCardProps {
  week: Chapter;
  bestScorePercentage?: number | null;
  attemptsCount?: number;
  onStartPractice: (week: Chapter, timed: boolean) => void;
  onStartRevision: (week: Chapter) => void;
}

export function AssignmentCard({
  week,
  bestScorePercentage,
  attemptsCount = 0,
  onStartPractice,
  onStartRevision,
}: AssignmentCardProps) {
  const hasAttempted =
    bestScorePercentage !== undefined && bestScorePercentage !== null;
  const isHighScorer = hasAttempted && bestScorePercentage >= 70;

  return (
    <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-xs group h-full">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isHighScorer ? "default" : "outline"}
            className={cn(
              "font-semibold text-xs gap-1.5",
              isHighScorer && "bg-primary text-primary-foreground",
            )}
          >
            <CalendarCheck2 className="size-3" />
            <span>{week.chapter_title}</span>
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {week.question_count} Questions
          </span>
        </div>

        <CardTitle className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {week.chapter_title} Assignment
        </CardTitle>
      </CardHeader>

      <CardContent className="py-1">
        {/* Equalized 1-line score / status slot */}
        <div
          className="flex items-center justify-between text-xs h-7 px-2.5 rounded-lg border border-border/60 bg-muted/30"
          title={
            hasAttempted && attemptsCount
              ? `${attemptsCount} ${attemptsCount === 1 ? "attempt" : "attempts"}`
              : undefined
          }
        >
          {hasAttempted ? (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="size-3.5 text-amber-500 shrink-0" />
                <span>Best Score:</span>
              </div>
              <span
                className={cn(
                  "font-bold",
                  bestScorePercentage >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground",
                )}
              >
                {bestScorePercentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <span>Status:</span>
              </span>
              <span className="text-muted-foreground/70">Unattempted</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 gap-1.5">
        <Button
          size="sm"
          className="flex-1 text-xs font-semibold h-8 px-2.5 gap-1.5 justify-center"
          onClick={() => onStartPractice(week, false)}
          title="Start untimed assignment practice"
        >
          <span>Practice</span>
          <ArrowRight className="size-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onStartRevision(week)}
          title="Revise questions with toggleable answers"
        >
          <Eye className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Revise</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onStartPractice(week, true)}
          title="Timed test mode (22.5 min)"
        >
          <Clock className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
