import type { Chapter } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Award } from "lucide-react";

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
  return (
    <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-xs group">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-semibold text-xs">
            Chapter {chapter.chapter_number}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {chapter.question_count} Questions
          </span>
        </div>

        <CardTitle className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {chapter.chapter_title.replace(/^Chapter\s+\d+:\s*/i, "")}
        </CardTitle>
      </CardHeader>

      <CardContent className="py-1">
        {/* Past Attempts / Best Score pill */}
        {bestScorePercentage !== undefined && bestScorePercentage !== null ? (
          <div className="flex items-center justify-between text-xs rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="size-3.5 text-amber-500" />
              <span>Best Score:</span>
            </div>
            <span
              className={`font-bold ${
                bestScorePercentage >= 70
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {bestScorePercentage}%
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground/70 italic">
            Not attempted yet
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onStartPractice(chapter, false)}
          title="Untimed practice"
        >
          Practice
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs gap-1.5 bg-primary text-primary-foreground"
          onClick={() => onStartPractice(chapter, true)}
          title="Timed test"
        >
          <Play className="size-3" />
          Timed Test
        </Button>
      </CardFooter>
    </Card>
  );
}
