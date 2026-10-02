import type { Chapter } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight, Clock } from "lucide-react";
import { cn } from "cn";

interface ChapterCardProps {
  chapter: Chapter;
  bestScorePercentage?: number | null;
  onStartPractice: (chapter: Chapter, timed: boolean) => void;
}

export function ChapterCard({
  chapter,
  bestScorePercentage,
  onStartPractice,
}: ChapterCardProps) {
  const cleanTitle = chapter.chapter_title.replace(/^Chapter\s+\d+:\s*/i, "");
  const hasAttempted = bestScorePercentage !== undefined && bestScorePercentage !== null;

  return (
    <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-xs group h-full">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-semibold text-xs">
            Chapter {chapter.chapter_number}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {chapter.question_count} Questions
          </span>
        </div>

        <CardTitle className="text-base font-semibold leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-primary transition-colors">
          {cleanTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="py-1">
        {/* Equalized 1-line score / status slot */}
        <div className="flex items-center justify-between text-xs h-7 px-2.5 rounded-lg border border-border/60 bg-muted/30">
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
                    : "text-foreground"
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
          className="flex-1 justify-between text-xs font-semibold h-8 px-3"
          onClick={() => onStartPractice(chapter, false)}
          title="Start untimed practice"
        >
          <span>Practice</span>
          <ArrowRight className="size-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onStartPractice(chapter, true)}
          title="Start with 1.5 min/question timer"
        >
          <Clock className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
