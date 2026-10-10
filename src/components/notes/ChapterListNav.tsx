import { useState } from "react";
import type {
  ChapterNoteMeta,
  WeekNoteMeta,
} from "@/services/chapterNotesService";
import { Input } from "@/components/ui/input";
import { Search, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterListNavProps {
  manifest: ChapterNoteMeta[];
  weeks?: WeekNoteMeta[];
  mode?: "chapter" | "week";
  activeChapter: number;
  onSelectChapter: (num: number) => void;
}

export function ChapterListNav({
  manifest,
  weeks = [],
  mode = "chapter",
  activeChapter,
  onSelectChapter,
}: ChapterListNavProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const isWeekMode = mode === "week";

  const filteredChapters = manifest.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chapterNumber.toString().includes(searchQuery),
  );

  const filteredWeeks = weeks.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.weekNumber.toString().includes(searchQuery),
  );

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Search Bar matching custom test */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={
            isWeekMode ? "Search weeks (e.g. Week 1)" : "Search chapters or #"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-8 text-xs bg-card"
        />
      </div>

      {/* Selection Grid/List matching ChapterSelectRow in CustomTest */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
        {isWeekMode
          ? filteredWeeks.map((wk) => {
              const isSelected = wk.weekNumber === activeChapter;
              return (
                <div
                  key={wk.weekNumber}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectChapter(wk.weekNumber)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      onSelectChapter(wk.weekNumber);
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
                        wk.weekNumber
                      )}
                    </div>

                    <div className="min-w-0">
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium line-clamp-1 transition-colors block",
                          isSelected
                            ? "font-semibold text-foreground"
                            : "text-foreground/90",
                        )}
                      >
                        {wk.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Lec {wk.startChapter}–{wk.endChapter}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pl-1">
                    <Clock
                      className={cn(
                        "size-3",
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-medium transition-colors",
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {wk.readingTime}
                    </span>
                  </div>
                </div>
              );
            })
          : filteredChapters.map((ch) => {
              const isSelected = ch.chapterNumber === activeChapter;
              return (
                <div
                  key={ch.chapterNumber}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectChapter(ch.chapterNumber)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      onSelectChapter(ch.chapterNumber);
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
                        ch.chapterNumber
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium line-clamp-1 transition-colors",
                        isSelected
                          ? "font-semibold text-foreground"
                          : "text-foreground/90",
                      )}
                    >
                      {ch.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pl-1">
                    <Clock
                      className={cn(
                        "size-3",
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-medium transition-colors",
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {ch.readingTime}
                    </span>
                  </div>
                </div>
              );
            })}

        {(isWeekMode
          ? filteredWeeks.length === 0
          : filteredChapters.length === 0) && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No {isWeekMode ? "week" : "chapter"} matches &ldquo;{searchQuery}
            &rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
