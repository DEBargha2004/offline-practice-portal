import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

interface CustomTestBottomBarProps {
  selectedChapterCount?: number;
  selectedWeekCount?: number;
  selectedCount?: number;
  targetQuestionCount: number;
  totalAvailableQuestions: number;
  isTimed: boolean;
  durationMinutes: number;
  onStartTest: () => void;
}

export function CustomTestBottomBar({
  selectedChapterCount = 0,
  selectedWeekCount = 0,
  selectedCount,
  targetQuestionCount,
  isTimed,
  durationMinutes,
  onStartTest,
}: CustomTestBottomBarProps) {
  const totalCount =
    selectedCount !== undefined
      ? selectedCount
      : selectedChapterCount + selectedWeekCount;
  const isEnabled = totalCount > 0;

  let selectionTitle = "Select chapters or weekly assignments to start";
  if (totalCount > 0) {
    if (selectedChapterCount > 0 && selectedWeekCount === 0) {
      selectionTitle = `${selectedChapterCount} Chapter${selectedChapterCount === 1 ? "" : "s"} selected`;
    } else if (selectedChapterCount === 0 && selectedWeekCount > 0) {
      selectionTitle = `${selectedWeekCount} Week${selectedWeekCount === 1 ? "" : "s"} selected`;
    } else if (selectedChapterCount > 0 && selectedWeekCount > 0) {
      selectionTitle = `${selectedChapterCount} Ch${selectedChapterCount === 1 ? "" : "s"} + ${selectedWeekCount} Wk${selectedWeekCount === 1 ? "" : "s"} selected`;
    } else {
      selectionTitle = `${totalCount} item${totalCount === 1 ? "" : "s"} selected`;
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-background/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-lg">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
        {/* Live Summary */}
        <div className="flex flex-col min-w-0">
          <div className="text-xs sm:text-sm font-bold text-foreground truncate">
            {selectionTitle}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {totalCount > 0 ? (
              <span>
                {targetQuestionCount} Qs &bull; {isTimed ? `${durationMinutes} min limit` : "Untimed"}
              </span>
            ) : (
              <span>Choose chapters or weekly assignments above</span>
            )}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="default"
          disabled={!isEnabled}
          onClick={onStartTest}
          className="gap-2 font-semibold shadow-xs h-9 sm:h-10 px-4 sm:px-5 shrink-0 text-xs sm:text-sm"
        >
          <Play className="size-3.5 sm:size-4 fill-primary-foreground" />
          <span>Start Test</span>
          <ArrowRight className="size-3.5 sm:size-4" />
        </Button>
      </div>
    </div>
  );
}
