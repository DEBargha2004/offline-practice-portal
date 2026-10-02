import type { Chapter } from "@/types";
import { Check } from "lucide-react";
import { formatChapterTitle } from "@/services/customTestService";
import { cn } from "@/lib/utils";

interface ChapterSelectRowProps {
  chapter: Chapter;
  isSelected: boolean;
  onToggle: (chapterNumber: number) => void;
}

export function ChapterSelectRow({
  chapter,
  isSelected,
  onToggle,
}: ChapterSelectRowProps) {
  const cleanTitle = formatChapterTitle(chapter.chapter_title);

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onToggle(chapter.chapter_number)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle(chapter.chapter_number);
        }
      }}
      className={cn(
        "group relative flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all outline-hidden active:scale-[0.99]",
        isSelected
          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-2xs text-foreground"
          : "border-border/70 bg-card hover:bg-muted/40 hover:border-border text-foreground"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Integrated Number / Check Bubble */}
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground shadow-2xs font-bold"
              : "bg-muted text-muted-foreground group-hover:text-foreground"
          )}
        >
          {isSelected ? (
            <Check className="size-3.5 stroke-[2.5]" />
          ) : (
            chapter.chapter_number
          )}
        </div>

        {/* Chapter Title */}
        <span
          className={cn(
            "text-xs sm:text-sm font-medium line-clamp-1 transition-colors",
            isSelected ? "font-semibold text-foreground" : "text-foreground/90"
          )}
        >
          {cleanTitle}
        </span>
      </div>

      {/* Question Count Pill */}
      <span
        className={cn(
          "text-[11px] font-medium shrink-0 pl-1 transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}
      >
        {chapter.question_count} Qs
      </span>
    </div>
  );
}
