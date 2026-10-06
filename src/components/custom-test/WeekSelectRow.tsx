import type { Chapter } from "@/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekSelectRowProps {
  week: Chapter;
  isSelected: boolean;
  onToggle: (weekNumber: number) => void;
}

export function WeekSelectRow({
  week,
  isSelected,
  onToggle,
}: WeekSelectRowProps) {
  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onToggle(week.chapter_number)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle(week.chapter_number);
        }
      }}
      className={cn(
        "group relative flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all outline-hidden active:scale-[0.99]",
        isSelected
          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-2xs text-foreground"
          : "border-border/70 bg-card hover:bg-muted/40 hover:border-border text-foreground",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Integrated Number / Check Bubble */}
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground shadow-2xs font-bold"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
        >
          {isSelected ? (
            <Check className="size-3.5 stroke-[2.5]" />
          ) : (
            `${week.chapter_number}`
          )}
        </div>

        {/* Week Title */}
        <span
          className={cn(
            "text-xs sm:text-sm font-medium line-clamp-1 transition-colors",
            isSelected ? "font-semibold text-foreground" : "text-foreground/90",
          )}
        >
          {week.chapter_title} Assignment
        </span>
      </div>

      {/* Question Count Pill */}
      <span
        className={cn(
          "text-[11px] font-medium shrink-0 pl-1 transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground",
        )}
      >
        {week.question_count} Qs
      </span>
    </div>
  );
}
